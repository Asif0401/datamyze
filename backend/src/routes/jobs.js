const express = require('express');
const { get, all } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

const ADMIN_EMAIL = 'ak384837@gmail.com';

const ADZUNA_APP_ID  = process.env.ADZUNA_APP_ID  || '080e69d1';
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY || '2e216e236eb756fc8d4cb45bf866b412';
const ADZUNA_BASE    = 'https://api.adzuna.com/v1/api/jobs/in/search/1';

const SKILL_KEYWORDS = ['SQL','Python','Tableau','Power BI','Excel','R','Spark','dbt','Pandas','Machine Learning'];

// ── In-memory cache ──────────────────────────────────────────────────────────
const cache = {};
const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

function getCacheKey(search, location) {
  return `${(search || '').toLowerCase()}|${(location || '').toLowerCase()}`;
}

// ── Adzuna helpers ───────────────────────────────────────────────────────────
function mapContractTime(ct) {
  if (ct === 'full_time') return 'Full-time';
  if (ct === 'part_time') return 'Part-time';
  return 'Full-time';
}

function formatSalary(min, max) {
  if (!min && !max) return 'Competitive';
  // Adzuna India salaries are already in INR (annual). Convert to LPA.
  const toLPA = v => Math.round(v / 100000);
  if (min && max) return `₹${toLPA(min)}–${toLPA(max)} LPA`;
  if (min) return `₹${toLPA(min)}+ LPA`;
  if (max) return `Up to ₹${toLPA(max)} LPA`;
  return 'Competitive';
}

function postedDaysAgo(createdStr) {
  if (!createdStr) return 0;
  const created = new Date(createdStr);
  const diff = Date.now() - created.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function extractSkills(description) {
  if (!description) return [];
  const desc = description.toLowerCase();
  return SKILL_KEYWORDS.filter(k => desc.includes(k.toLowerCase()));
}

function mapAdzunaResult(r) {
  const desc = r.description || '';
  const truncDesc = desc.length > 200 ? desc.slice(0, 197) + '...' : desc;
  return {
    id: String(r.id),
    title: r.title || '',
    company: r.company?.display_name || 'Unknown',
    location: r.location?.display_name || 'India',
    type: mapContractTime(r.contract_time),
    salary: formatSalary(r.salary_min, r.salary_max),
    url: r.redirect_url || '',
    description: truncDesc,
    posted_days_ago: postedDaysAgo(r.created),
    source: 'Adzuna',
    skills: extractSkills(desc),
  };
}

async function fetchAdzunaQuery(what, location) {
  const params = new URLSearchParams({
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_APP_KEY,
    results_per_page: '50',
    what,
    'content-type': 'application/json',
    sort_by: 'date',
    max_days_old: '30',
  });
  if (location) params.set('where', location);

  const url = `${ADZUNA_BASE}?${params.toString()}`;
  const resp = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
  if (!resp.ok) throw new Error(`Adzuna ${resp.status}`);
  const data = await resp.json();
  return (data.results || []).map(mapAdzunaResult);
}

async function fetchAllAdzunaJobs(location) {
  const queries = [
    'data analyst',
    'business analyst data',
    'sql analyst',
    'bi analyst',
    'analytics engineer',
  ];

  const results = await Promise.allSettled(queries.map(q => fetchAdzunaQuery(q, location)));
  const all = [];
  const seen = new Set();
  for (const r of results) {
    if (r.status === 'fulfilled') {
      for (const job of r.value) {
        if (!seen.has(job.id)) {
          seen.add(job.id);
          all.push(job);
        }
      }
    }
  }
  return all.slice(0, 100);
}

// ── Route ────────────────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  const db = req.app.locals.db;
  const user = await get(db, 'SELECT is_premium, role, email FROM users WHERE id = ?', [req.user.id]);
  const isAdmin = user?.role === 'admin' || user?.email === ADMIN_EMAIL;
  if (!isAdmin && !user?.is_premium) {
    return res.status(403).json({ error: 'Premium membership required', premium_required: true });
  }

  const { search, type, location } = req.query;
  const cacheKey = getCacheKey(search, location);
  const now = Date.now();

  // Return cached data if fresh
  if (cache[cacheKey] && now - cache[cacheKey].ts < CACHE_TTL_MS) {
    let jobs = cache[cacheKey].jobs;
    if (search) {
      const q = search.toLowerCase();
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        (Array.isArray(j.skills) ? j.skills.some(s => s.toLowerCase().includes(q)) : false)
      );
    }
    if (type && type !== 'All') jobs = jobs.filter(j => j.type === type);
    return res.json({ jobs, source: 'cache' });
  }

  // Fetch live from Adzuna
  try {
    let jobs = await fetchAllAdzunaJobs(location || '');

    // Cache the raw (unfiltered by search/type) results
    cache[cacheKey] = { jobs, ts: now };

    // Apply search filter
    if (search) {
      const q = search.toLowerCase();
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        (Array.isArray(j.skills) ? j.skills.some(s => s.toLowerCase().includes(q)) : false)
      );
    }
    if (type && type !== 'All') jobs = jobs.filter(j => j.type === type);

    return res.json({ jobs, source: 'adzuna' });
  } catch (err) {
    console.error('Adzuna API error, falling back to DB:', err.message);

    // Fallback: DB jobs
    let sql = 'SELECT * FROM job_listings WHERE is_active = 1';
    const params = [];
    if (search) {
      sql += ' AND (title LIKE ? OR company LIKE ? OR skills LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (type && type !== 'All') { sql += ' AND type = ?'; params.push(type); }
    if (location) { sql += ' AND location LIKE ?'; params.push(`%${location}%`); }
    sql += ' ORDER BY posted_days_ago ASC';
    const jobs = await all(db, sql, params);
    return res.json({ jobs: jobs.map(j => ({ ...j, skills: JSON.parse(j.skills || '[]') })), source: 'db' });
  }
});

module.exports = router;
