import { useEffect, useState, useCallback } from 'react';
import api from '../hooks/useApi';

/* ── Inline SVG brand icons ──────────────────────────── */
const TableauLogo = () => (
  <svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 4px 12px rgba(233,118,39,0.5))' }}>
    <rect width="42" height="42" rx="10" fill="#E97627"/>
    <g fill="white">
      <rect x="19" y="4" width="4" height="34"/><rect x="4" y="19" width="34" height="4"/>
      <rect x="11.5" y="11" width="3" height="20" opacity="0.75"/><rect x="11" y="11.5" width="20" height="3" opacity="0.75"/>
      <rect x="27.5" y="11" width="3" height="20" opacity="0.75"/><rect x="11" y="27.5" width="20" height="3" opacity="0.75"/>
    </g>
  </svg>
);
const PowerBILogo = () => (
  <svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 4px 12px rgba(242,200,17,0.45))' }}>
    <rect width="42" height="42" rx="10" fill="#1a1a2e"/>
    <rect x="7"  y="28" width="6" height="9"  rx="2" fill="#F2C811"/>
    <rect x="15" y="21" width="6" height="16" rx="2" fill="#F2C811" opacity="0.85"/>
    <rect x="23" y="13" width="6" height="24" rx="2" fill="#F2C811" opacity="0.92"/>
    <rect x="31" y="5"  width="5" height="32" rx="2" fill="#F2C811"/>
  </svg>
);
const ExcelLogo = () => (
  <svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 4px 12px rgba(33,163,102,0.5))' }}>
    <rect width="42" height="42" rx="10" fill="#1D6F42"/>
    <rect x="4" y="9" width="20" height="24" rx="3" fill="#21A366"/>
    <text x="14" y="27" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="16" textAnchor="middle" fill="white">X</text>
    <rect x="22" y="13" width="16" height="2.5" rx="1.2" fill="white" opacity="0.75"/>
    <rect x="22" y="19" width="16" height="2.5" rx="1.2" fill="white" opacity="0.75"/>
    <rect x="22" y="25" width="16" height="2.5" rx="1.2" fill="white" opacity="0.75"/>
  </svg>
);
const GoogleSheetsLogo = () => (
  <svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 4px 12px rgba(15,157,88,0.5))' }}>
    <rect width="42" height="42" rx="10" fill="#0F9D58"/>
    <rect x="8" y="8" width="26" height="26" rx="3" fill="white" opacity="0.15"/>
    <g fill="none" stroke="white" strokeWidth="1.8">
      <rect x="8" y="8" width="26" height="26" rx="3"/>
      <line x1="8"  y1="15.5" x2="34" y2="15.5"/><line x1="8"  y1="23" x2="34" y2="23"/>
      <line x1="16.5" y1="8" x2="16.5" y2="34"/><line x1="25.5" y1="8" x2="25.5" y2="34"/>
    </g>
  </svg>
);
/* Python — official brand colors (blue #3776AB / yellow #FFD43B), drawn inline */
const PythonLogo = () => (
  <svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 4px 12px rgba(55,118,171,0.55))' }}>
    <defs>
      <linearGradient id="pyBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5B9BD5"/><stop offset="100%" stopColor="#306998"/></linearGradient>
      <linearGradient id="pyYellow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFE064"/><stop offset="100%" stopColor="#FFC017"/></linearGradient>
    </defs>
    <rect width="42" height="42" rx="10" fill="#0d1117"/>
    {/* Blue top half */}
    <path d="M21 4.5c-4.8 0-8 2-8 5.5v3.5h8v1.5H12c-3.5 0-6 2.8-6 7.5 0 4.8 2.5 7.5 6 7.5H14V27c0-3.5 2-5.5 5.5-5.5h6.5c3 0 5-1.8 5-5V10c0-3.5-3-5.5-10-5.5zm-2.5 4c1 0 1.8.8 1.8 1.8S19.5 12.3 18.5 12.3s-1.8-.8-1.8-1.8.8-1.8 1.8-2z" fill="url(#pyBlue)"/>
    {/* Yellow bottom half */}
    <path d="M21 37.5c4.8 0 8-2 8-5.5V28.5h-8V27h9.5c3.5 0 6-2.8 6-7.5 0-4.8-2.5-7.5-6-7.5H28v2.5c0 3.5-2 5.5-5.5 5.5H16c-3 0-5 1.8-5 5v6c0 3.5 3 5.5 10 5.5zm2.5-4c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8 1.8.8 1.8 1.8-.8 1.8-1.8 1.8z" fill="url(#pyYellow)"/>
  </svg>
);
/* MySQL */
const MySQLLogo = () => (
  <svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 4px 12px rgba(0,97,138,0.55))' }}>
    <rect width="42" height="42" rx="10" fill="#00618A"/>
    <text x="21" y="19" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="11" textAnchor="middle" fill="white" letterSpacing="1">MY</text>
    <rect x="10" y="21.5" width="22" height="1.5" rx="0.75" fill="white" opacity="0.25"/>
    <text x="21" y="32" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="11" textAnchor="middle" fill="#E88B01" letterSpacing="1">SQL</text>
  </svg>
);
/* PostgreSQL */
const PostgreSQLLogo = () => (
  <svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 4px 12px rgba(51,103,145,0.55))' }}>
    <rect width="42" height="42" rx="10" fill="#336791"/>
    {/* Elephant trunk silhouette simplified */}
    <ellipse cx="21" cy="15" rx="9" ry="8" fill="white" opacity="0.9"/>
    <ellipse cx="21" cy="14.5" rx="7" ry="6" fill="#336791"/>
    {/* Eyes */}
    <circle cx="17.5" cy="13" r="1.5" fill="white"/>
    <circle cx="24.5" cy="13" r="1.5" fill="white"/>
    <circle cx="17.5" cy="13" r="0.7" fill="#336791"/>
    <circle cx="24.5" cy="13" r="0.7" fill="#336791"/>
    {/* Trunk */}
    <path d="M14 19 Q11 23 13 27 Q15 30 14 33" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
    {/* pg text */}
    <text x="26" y="33" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="10" textAnchor="middle" fill="white" opacity="0.9">pg</text>
  </svg>
);
/* Pandas */
const PandasLogo = () => (
  <svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 4px 12px rgba(21,4,88,0.5))' }}>
    <rect width="42" height="42" rx="10" fill="#150458"/>
    {/* Panda face - two color blocks */}
    <rect x="12" y="9" width="5" height="14" rx="2.5" fill="white"/>
    <rect x="25" y="9" width="5" height="14" rx="2.5" fill="white"/>
    <rect x="12" y="19" width="5" height="14" rx="2.5" fill="#E70488"/>
    <rect x="25" y="19" width="5" height="14" rx="2.5" fill="#E70488"/>
    {/* pd label */}
    <text x="21" y="28" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="8" textAnchor="middle" fill="white" opacity="0.5">pd</text>
  </svg>
);
/* NumPy */
const NumPyLogo = () => (
  <svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 4px 12px rgba(77,171,207,0.5))' }}>
    <rect width="42" height="42" rx="10" fill="#013243"/>
    {/* Stacked cube top face */}
    <polygon points="21,7 33,13 21,19 9,13" fill="#4DABCF" opacity="0.9"/>
    {/* Left face */}
    <polygon points="9,13 21,19 21,33 9,27" fill="#4DABCF" opacity="0.6"/>
    {/* Right face */}
    <polygon points="33,13 21,19 21,33 33,27" fill="#4DABCF" opacity="0.8"/>
    {/* np label */}
    <text x="21" y="38" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="7" textAnchor="middle" fill="white" opacity="0.5">np</text>
  </svg>
);
/* R language */
const RLogo = () => (
  <svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 4px 12px rgba(39,109,195,0.55))' }}>
    <rect width="42" height="42" rx="10" fill="#1a2540"/>
    <ellipse cx="20" cy="18" rx="10" ry="9" fill="none" stroke="#276DC3" strokeWidth="4"/>
    <rect x="10" y="17" width="8" height="4" fill="#1a2540"/>
    <rect x="12" y="8" width="4" height="22" rx="2" fill="#276DC3"/>
    <line x1="20" y1="22" x2="30" y2="33" stroke="#276DC3" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

const TECH_LOGOS = {
  'SQL for Data Analysis':  [
    { component: MySQLLogo, alt: 'MySQL' },
    { component: PostgreSQLLogo, alt: 'PostgreSQL' },
  ],
  'Python for Analytics':   [
    { component: PythonLogo, alt: 'Python' },
    { component: PandasLogo, alt: 'Pandas' },
    { component: NumPyLogo, alt: 'NumPy' },
  ],
  'Statistics & Probability': [
    { component: PythonLogo, alt: 'Python' },
    { component: RLogo, alt: 'R' },
  ],
  'Tableau for Analysts':   [{ component: TableauLogo, alt: 'Tableau' }],
  'Power BI':               [{ component: PowerBILogo, alt: 'Power BI' }],
  'Advanced SQL':           [
    { component: PostgreSQLLogo, alt: 'PostgreSQL' },
    { component: MySQLLogo, alt: 'MySQL' },
  ],
  'Excel & Google Sheets':  [{ component: ExcelLogo, alt: 'Excel' }, { component: GoogleSheetsLogo, alt: 'Google Sheets' }],
};

/* ── Course metadata (outcomes, prereqs, upsell) ─────── */
const COURSE_META = {
  'SQL for Data Analysis': {
    outcomes: ['Write complex JOIN and aggregation queries','Master window functions used at FAANG','Analyse Zomato/Flipkart-scale datasets','Crack SQL rounds at any data analyst interview'],
    prereqs: 'No prior experience needed — just curiosity.',
    jobs: ['Data Analyst','Business Analyst','Product Analyst'],
    upsell: 'Unlock live SQL mock interviews with a senior analyst at Flipkart. Available for Pro members.',
  },
  'Python for Analytics': {
    outcomes: ['Clean messy datasets in minutes with pandas','Build visualisations that tell stories','Perform end-to-end EDA on real data','Automate repetitive reporting workflows'],
    prereqs: 'Basic understanding of SQL recommended.',
    jobs: ['Data Analyst','Analytics Engineer','Data Scientist'],
    upsell: 'Pro includes code review of your EDA projects by industry mentors.',
  },
  'Statistics & Probability': {
    outcomes: ['Understand A/B testing used at every startup','Explain p-values confidently in interviews','Know which statistical test to pick when','Apply regression to real business questions'],
    prereqs: 'High-school maths is enough to get started.',
    jobs: ['Data Scientist','Product Analyst','Growth Analyst'],
    upsell: 'Live stats sessions cover real A/B test case studies from Swiggy and PhonePe.',
  },
  'Tableau for Analysts': {
    outcomes: ['Connect data sources and build live dashboards','Master calculated fields and LOD expressions','Build interactive charts, maps and story points','Create polished dashboards that get you hired'],
    prereqs: 'Basic understanding of data and Excel recommended.',
    jobs: ['BI Developer','Data Analyst','Analytics Consultant'],
    upsell: 'Pro includes downloadable Tableau workbook templates used in real startups.',
  },
  'Power BI': {
    outcomes: ['Import and transform data with Power Query','Write DAX measures for KPIs and time intelligence','Build multi-page reports with slicers and drill-through','Publish and share dashboards on Power BI Service'],
    prereqs: 'Basic Excel knowledge is helpful but not required.',
    jobs: ['BI Developer','Business Analyst','Data Analyst'],
    upsell: 'Pro includes Power BI report templates and live DAX troubleshooting sessions.',
  },
  'Advanced SQL': {
    outcomes: ['Optimise slow queries with EXPLAIN plans','Design indexes that cut query time 10×','Write recursive CTEs for hierarchy analysis','Solve every window-function pattern asked in interviews'],
    prereqs: 'SQL for Data Analysis (or equivalent) is required.',
    jobs: ['Senior Data Analyst','Analytics Engineer','Data Engineer'],
    upsell: 'Pro gives access to a live "query clinic" where we optimise your actual work queries.',
  },
  'Excel & Google Sheets': {
    outcomes: ['Build XLOOKUP and dynamic array formulas','Create PivotTable dashboards in minutes','Automate reports with Apps Script','Present data cleanly to non-technical stakeholders'],
    prereqs: 'No prior experience needed.',
    jobs: ['Business Analyst','Financial Analyst','Operations Analyst'],
    upsell: 'Pro includes downloadable dashboard templates used in real finance teams.',
  },
};

/* ── Markdown-like content renderer ──────────────────── */
function renderInline(text) {
  if (!text) return text;
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
      return <strong key={i} style={{ color: 'var(--text)', fontWeight: 700 }}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`'))
      return <code key={i} style={{ background: 'rgba(56,189,248,0.12)', borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace', fontSize: 12, color: '#38bdf8' }}>{p.slice(1, -1)}</code>;
    return p;
  });
}

function ContentRenderer({ content }) {
  if (!content) return <p style={{ color: 'var(--muted)', fontSize: 13 }}>No content yet.</p>;
  const lines = content.split('\n');
  const els = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Code block
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim() || 'code';
      const code = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) { code.push(lines[i]); i++; }
      els.push(
        <div key={`cb${i}`} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.4)', borderRadius: '6px 6px 0 0', padding: '4px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: 10, color: '#888', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '.05em' }}>{lang}</span>
          </div>
          <pre style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.08)', borderTop: 'none', borderRadius: '0 0 6px 6px', padding: '12px 16px', overflowX: 'auto', fontSize: 12.5, fontFamily: '"Fira Code",monospace', lineHeight: 1.65, color: '#cdd6f4', margin: 0 }}>
            <code>{code.join('\n')}</code>
          </pre>
        </div>
      );
      i++; continue;
    }
    // H1
    if (line.startsWith('# ')) {
      els.push(<h2 key={`h1${i}`} style={{ fontSize: 17, fontWeight: 800, margin: '0 0 10px', color: 'var(--text)' }}>{renderInline(line.slice(2))}</h2>);
      i++; continue;
    }
    // H2
    if (line.startsWith('## ')) {
      els.push(<h3 key={`h2${i}`} style={{ fontSize: 13, fontWeight: 700, margin: '14px 0 6px', color: '#7ab8f0', textTransform: 'uppercase', letterSpacing: '.04em' }}>{renderInline(line.slice(3))}</h3>);
      i++; continue;
    }
    // Table
    if (line.includes('|') && lines[i + 1]?.includes('---')) {
      const headers = line.split('|').map(s => s.trim()).filter(Boolean);
      const rows = []; i += 2;
      while (i < lines.length && lines[i].includes('|')) {
        rows.push(lines[i].split('|').map(s => s.trim()).filter(Boolean)); i++;
      }
      els.push(
        <div key={`tbl${i}`} style={{ overflowX: 'auto', marginBottom: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr>{headers.map((h, j) => <th key={j} style={{ background: 'rgba(74,144,217,0.15)', padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid rgba(74,144,217,0.3)', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
            <tbody>{rows.map((row, j) => <tr key={j} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.map((cell, k) => <td key={k} style={{ padding: '5px 10px', color: 'var(--muted)' }}>{renderInline(cell)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
      continue;
    }
    // Interview tip
    if (line.startsWith('💡')) {
      const tip = [line]; i++;
      while (i < lines.length && lines[i].trim() && !lines[i].startsWith('#') && !lines[i].startsWith('```') && !lines[i].startsWith('- ')) { tip.push(lines[i]); i++; }
      els.push(
        <div key={`tip${i}`} style={{ background: 'rgba(232,168,56,0.1)', border: '1px solid rgba(232,168,56,0.3)', borderRadius: 8, padding: '10px 14px', margin: '10px 0 12px' }}>
          {tip.map((l, j) => <div key={j} style={{ fontSize: 12.5, color: '#E8A838', lineHeight: 1.7 }}>{renderInline(l)}</div>)}
        </div>
      );
      continue;
    }
    // Bullet list
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) { items.push(lines[i].slice(2)); i++; }
      els.push(<ul key={`ul${i}`} style={{ paddingLeft: '1.3rem', marginBottom: 10, lineHeight: 1.9 }}>{items.map((it, j) => <li key={j} style={{ fontSize: 13, color: 'var(--muted)' }}>{renderInline(it)}</li>)}</ul>);
      continue;
    }
    // Numbered list
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, '')); i++; }
      els.push(<ol key={`ol${i}`} style={{ paddingLeft: '1.3rem', marginBottom: 10, lineHeight: 1.9 }}>{items.map((it, j) => <li key={j} style={{ fontSize: 13, color: 'var(--muted)' }}>{renderInline(it)}</li>)}</ol>);
      continue;
    }
    // Empty
    if (!line.trim()) { els.push(<div key={`sp${i}`} style={{ height: 6 }} />); i++; continue; }
    // Paragraph
    els.push(<p key={`p${i}`} style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75, margin: '0 0 8px' }}>{renderInline(line)}</p>);
    i++;
  }
  return <div>{els}</div>;
}

/* ── Live Session Panel ─────────────────────────────── */
function LiveSessionPanel({ courseId, courseName, initialVoted = false }) {
  const [requested, setRequested] = useState(initialVoted);
  const [loading,   setLoading]   = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const r = await api.post(`/courses/${courseId}/poll`);
      setRequested(r.data.voted);
    } catch (e) { /* ignore */ }
    finally { setLoading(false); }
  }

  const WHAT_YOU_GET = [
    { icon: '🎥', text: '2-hour focused live coding session on this course' },
    { icon: '💬', text: 'Real-time Q&A — ask us anything, live' },
    { icon: '🔍', text: 'Top interview problems worked through step-by-step' },
    { icon: '📝', text: 'Live code review & instant feedback on your approach' },
    { icon: '🎞️', text: 'Recording shared with you for 7 days after the session' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

      {/* Main request card */}
      <div style={{
        background: requested ? 'rgba(92,200,160,0.06)' : 'rgba(74,144,217,0.06)',
        border: `1px solid ${requested ? 'rgba(92,200,160,0.22)' : 'rgba(74,144,217,0.18)'}`,
        borderRadius: 16, padding: '1.5rem 1.6rem',
        position: 'relative', overflow: 'hidden',
        transition: 'all 0.3s',
      }}>
        {/* Top accent line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: requested ? 'linear-gradient(90deg,#5CC8A0,#38bdf8)' : 'linear-gradient(90deg,#4A90D9,#a78bfa)' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: '1.4rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: requested ? 'rgba(92,200,160,0.15)' : 'rgba(74,144,217,0.15)', border: `1px solid ${requested ? 'rgba(92,200,160,0.30)' : 'rgba(74,144,217,0.25)'}` }}>
            {requested ? '✅' : '🎙️'}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', marginBottom: 5 }}>
              {requested ? "You've requested a live session!" : `Need a Live Session on ${courseName}?`}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', lineHeight: 1.65, maxWidth: 440 }}>
              {requested
                ? `Got it! Our team has been notified. You'll receive a calendar invite as soon as the session is scheduled. Check your email for updates.`
                : `Tell us you need a live coaching session on this topic. We schedule them based on demand — the more requests, the sooner it happens.`
              }
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={toggle}
            disabled={loading}
            style={{
              padding: '11px 24px', borderRadius: 10, cursor: loading ? 'wait' : 'pointer',
              fontWeight: 700, fontSize: 13, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
              background: requested ? 'rgba(92,200,160,0.15)' : 'linear-gradient(135deg,#4A90D9,#a78bfa)',
              color: requested ? '#5CC8A0' : '#fff',
              border: requested ? '1px solid rgba(92,200,160,0.35)' : '1px solid transparent',
              boxShadow: requested ? 'none' : '0 4px 18px rgba(74,144,217,0.35)',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
          >
            <span style={{ fontSize: 16 }}>{loading ? '⏳' : requested ? '✓' : '🙋'}</span>
            {loading ? 'Updating…' : requested ? 'Requested — Click to Withdraw' : 'I Need This Live Session'}
          </button>

          <a
            href="mailto:asif@dataquest.in?subject=Live Session Request&body=Hi, I'd love a live session on the course: "
            style={{
              padding: '11px 20px', borderRadius: 10, cursor: 'pointer',
              fontWeight: 700, fontSize: 13, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.65)',
              border: '1px solid rgba(255,255,255,0.12)', textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
          >
            <span>✉️</span> Contact Us Directly
          </a>
        </div>
      </div>

      {/* What you get */}
      <div style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.2rem 1.4rem' }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(74,144,217,0.18)', border: '1px solid rgba(74,144,217,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>💡</span>
          What happens in a live session
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {WHAT_YOU_GET.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.58)', lineHeight: 1.5 }}>
              <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ display: 'flex', gap: 10 }}>
        {[
          { step: '1', label: 'Request it', desc: 'Click the button above' },
          { step: '2', label: 'We review',    desc: 'Check demand & schedule' },
          { step: '3', label: 'Get notified', desc: 'Calendar invite on email' },
          { step: '4', label: 'Join live', desc: 'Attend & ask anything' },
        ].map(s => (
          <div key={s.step} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(74,144,217,0.18)', border: '1px solid rgba(74,144,217,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#4A90D9', margin: '0 auto 6px' }}>{s.step}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{s.desc}</div>
          </div>
        ))}
      </div>

    </div>
  );
}

/* ── Course Modal ────────────────────────────────────── */
function CourseModal({ course, onClose, onEnroll }) {
  const [tab,          setTab]          = useState('overview');
  const [lessons,      setLessons]      = useState([]);
  const [progress,     setProgress]     = useState(null);
  const [userVoted,    setUserVoted]    = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const [enrolling,    setEnrolling]    = useState(false);
  const [toast,        setToast]        = useState('');

  const load = useCallback(() => {
    api.get(`/courses/${course.id}`).then(r => {
      setLessons(r.data.lessons);
      setProgress(r.data.progress);
      setUserVoted(r.data.user_voted || false);
    });
  }, [course.id]);

  useEffect(() => { load(); }, [load]);

  async function enroll() {
    setEnrolling(true);
    await api.post(`/courses/${course.id}/enroll`);
    load(); onEnroll();
    setEnrolling(false);
    setToast('✅ Enrolled! Start your first lesson.'); setTimeout(() => setToast(''), 3000);
  }

  async function completeLesson(lessonId) {
    await api.post(`/courses/${course.id}/lessons/${lessonId}/complete`);
    load(); onEnroll();
    setToast('+20 XP! Lesson complete 🎉'); setTimeout(() => setToast(''), 3000);
  }

  const prog      = progress?.progress_percent || 0;
  const completed = JSON.parse(progress?.completed_lessons || '[]');
  const meta      = COURSE_META[course.title] || {};
  const TABS      = [
    { id: 'overview',  label: '📖 Overview' },
    { id: 'lessons',   label: `🎓 Lessons (${lessons.length})` },
    { id: 'poll',      label: '🎙️ Live Session' },
  ];

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) { if (activeLesson) { setActiveLesson(null); } else { onClose(); } } }}>
      <div className="modal" style={{ width: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <button className="modal-close" onClick={() => activeLesson ? setActiveLesson(null) : onClose()}>✕</button>

        {/* ── Lesson viewer ── */}
        {activeLesson ? (
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
            <button onClick={() => setActiveLesson(null)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 14px', fontSize: 12, color: 'var(--muted)', cursor: 'pointer', marginBottom: '1rem' }}>
              ← Back to course
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{activeLesson.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>⏱ {activeLesson.duration_minutes} min{activeLesson.video_url ? ' · 🎥 Video included' : ''}</div>
              </div>
              {completed.includes(activeLesson.id) && (
                <span style={{ background: 'rgba(92,200,160,0.15)', border: '1px solid rgba(92,200,160,0.3)', color: '#5CC8A0', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>✓ Completed</span>
              )}
            </div>

            {/* YouTube player */}
            {activeLesson.video_url && (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, marginBottom: '1.4rem', borderRadius: 10, overflow: 'hidden', background: '#000', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${activeLesson.video_url}?rel=0&modestbranding=1&color=white`}
                  title={activeLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            )}

            {/* Content */}
            <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '1.2rem 1.4rem', marginBottom: '1.2rem' }}>
              <ContentRenderer content={activeLesson.content} />
            </div>

            {/* Complete + Navigate */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {!completed.includes(activeLesson.id) && (
                <button className="btn-teal" onClick={() => { completeLesson(activeLesson.id); setActiveLesson(null); }}>
                  ✅ Mark Complete (+20 XP)
                </button>
              )}
              {(() => {
                const idx = lessons.findIndex(l => l.id === activeLesson.id);
                const next = lessons[idx + 1];
                return next ? (
                  <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setActiveLesson(next)}>
                    Next: {next.title} →
                  </button>
                ) : null;
              })()}
            </div>
          </div>
        ) : (
          /* ── Course detail ── */
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
              <div style={{ fontSize: 42, marginBottom: 6 }}>{course.icon}</div>
              <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>{course.title}</h2>
              <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 10px' }}>{course.description}</p>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                <span className={`pill ${course.difficulty === 'Beginner' ? 'pill-teal' : course.difficulty === 'Intermediate' ? 'pill-amber' : 'pill-coral'}`}>{course.difficulty}</span>
                <span className="pill pill-purple">⏱ {course.duration}</span>
                <span className="pill pill-purple">📝 {lessons.length} lessons</span>
                <span className="pill pill-purple">⭐ {lessons.length * 20 + 500} XP on completion</span>
              </div>
            </div>

            {/* Progress bar */}
            {prog > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
                  <span>Your progress</span><span style={{ color: prog === 100 ? '#5CC8A0' : 'var(--text)', fontWeight: 700 }}>{prog}%</span>
                </div>
                <div className="progress-bar" style={{ height: 6 }}>
                  <div className="progress-fill" style={{ width: `${prog}%`, background: prog === 100 ? '#5CC8A0' : course.color }} />
                </div>
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.2rem' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  padding: '7px 14px', borderRadius: '7px 7px 0 0', border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, background: tab === t.id ? 'rgba(74,144,217,0.16)' : 'transparent',
                  color: tab === t.id ? '#4A90D9' : 'var(--muted)', marginBottom: -1,
                  borderBottom: tab === t.id ? '2px solid #4A90D9' : '2px solid transparent',
                  transition: 'all .2s',
                }}>{t.label}</button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>

              {/* ── OVERVIEW ── */}
              {tab === 'overview' && (
                <div>
                  {/* What you'll learn */}
                  <div style={{ marginBottom: '1.2rem' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ background: 'rgba(92,200,160,0.15)', padding: '2px 8px', borderRadius: 20, color: '#5CC8A0', fontSize: 11 }}>✓</span>
                      What you'll learn
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
                      {(meta.outcomes || []).map((o, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>
                          <span style={{ color: '#5CC8A0', marginTop: 1, flexShrink: 0 }}>✓</span>{o}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Target jobs */}
                  <div style={{ marginBottom: '1.2rem' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>💼 Target Roles</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(meta.jobs || []).map(j => (
                        <span key={j} style={{ background: 'rgba(167,139,250,0.14)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                          {j}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Prerequisites */}
                  <div style={{ marginBottom: '1.2rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Prerequisites</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{meta.prereqs}</div>
                  </div>

                  {/* Lesson overview */}
                  <div style={{ marginBottom: '1.2rem' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>📚 Course Modules</div>
                    <div style={{ display: 'grid', gap: 4 }}>
                      {lessons.map((l, idx) => (
                        <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 7, fontSize: 12.5 }}>
                          <span style={{ width: 20, height: 20, borderRadius: '50%', background: completed.includes(l.id) ? 'rgba(92,200,160,0.2)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: completed.includes(l.id) ? '#5CC8A0' : 'var(--muted)', fontWeight: 700, flexShrink: 0 }}>
                            {completed.includes(l.id) ? '✓' : idx + 1}
                          </span>
                          <span style={{ flex: 1, color: 'var(--muted)' }}>{l.title}</span>
                          {l.video_url && <span style={{ fontSize: 10, background: 'rgba(240,123,106,0.15)', color: '#F07B6A', padding: '1px 6px', borderRadius: 10, flexShrink: 0 }}>🎥 Video</span>}
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{l.duration_minutes}m</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Premium upsell */}
                  {meta.upsell && (
                    <div style={{ background: 'linear-gradient(135deg,rgba(167,139,250,0.1),rgba(74,144,217,0.1))', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 12, color: '#a78bfa', fontWeight: 700, marginBottom: 4 }}>👑 Pro Feature</div>
                      <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>{meta.upsell}</div>
                    </div>
                  )}
                </div>
              )}

              {/* ── LESSONS ── */}
              {tab === 'lessons' && (
                <div>
                  {lessons.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>Lessons coming soon…</div>
                  ) : (
                    <div style={{ display: 'grid', gap: 6 }}>
                      {lessons.map((l, idx) => {
                        const done = completed.includes(l.id);
                        return (
                          <div
                            key={l.id}
                            onClick={() => setActiveLesson(l)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                              background: done ? 'rgba(92,200,160,0.05)' : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${done ? 'rgba(92,200,160,0.2)' : 'rgba(255,255,255,0.07)'}`,
                              transition: 'all .15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = done ? 'rgba(92,200,160,0.1)' : 'rgba(255,255,255,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.background = done ? 'rgba(92,200,160,0.05)' : 'rgba(255,255,255,0.04)'}
                          >
                            {/* Number / check */}
                            <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, background: done ? 'rgba(92,200,160,0.2)' : 'rgba(74,144,217,0.15)', color: done ? '#5CC8A0' : '#4A90D9' }}>
                              {done ? '✓' : idx + 1}
                            </div>

                            {/* Title + meta */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3, color: done ? '#5CC8A0' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {l.title}
                              </div>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span style={{ fontSize: 11, color: 'var(--muted)' }}>⏱ {l.duration_minutes} min</span>
                                {l.video_url && <span style={{ fontSize: 10, background: 'rgba(240,123,106,0.14)', color: '#F07B6A', padding: '1px 6px', borderRadius: 8 }}>🎥 Video</span>}
                              </div>
                            </div>

                            <span style={{ fontSize: 16, color: 'var(--muted)', flexShrink: 0 }}>▶</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── LIVE SESSION ── */}
              {tab === 'poll' && (
                <LiveSessionPanel
                  courseId={course.id}
                  courseName={course.title}
                  initialVoted={userVoted}
                />
              )}
            </div>

            {/* CTA */}
            <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {!progress ? (
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={enroll} disabled={enrolling}>
                  {enrolling ? 'Enrolling…' : '🚀 Enroll for Free — Start Learning'}
                </button>
              ) : (
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setTab('lessons'); const first = lessons.find(l => !completed.includes(l.id)) || lessons[0]; if (first) setActiveLesson(first); }}>
                  {prog === 100 ? '🎓 Review Course' : prog > 0 ? '▶ Continue Learning' : '▶ Start First Lesson'}
                </button>
              )}
            </div>
          </>
        )}

        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}

/* ── Main Courses page ──────────────────────────────── */
export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState('All');

  function load() {
    api.get('/courses').then(r => setCourses(r.data.courses)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const baseFiltered = filter === 'All' ? courses : courses.filter(c => c.difficulty === filter);
  // Sort coming-soon courses to the bottom
  const filtered = [
    ...baseFiltered.filter(c => !c.is_coming_soon),
    ...baseFiltered.filter(c => c.is_coming_soon),
  ];

  if (loading) return <div className="loading"><div className="spinner" />Loading courses…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">📚 Course Catalog</div>
        <div className="page-sub">Master data analytics from fundamentals to advanced — {courses.length} courses, interview-focused</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {difficulties.map(d => (
          <button key={d} onClick={() => setFilter(d)}
            className={filter === d ? 'pill pill-purple' : 'btn-secondary'}
            style={filter === d ? { cursor: 'pointer' } : { fontSize: 12, padding: '4px 12px' }}>
            {d}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)' }}>
          {filtered.length} course{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="course-grid">
        {filtered.map(c => {
          const prog  = c.progress?.progress_percent || 0;
          const logos = TECH_LOGOS[c.title] || [];

          /* ── Coming Soon card ── */
          if (c.is_coming_soon) {
            return (
              <div key={c.id} style={{
                position: 'relative', cursor: 'default',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(10,10,20,0.6) 100%)',
                border: '1.5px dashed rgba(139,92,246,0.35)',
                borderRadius: 16, overflow: 'hidden', padding: '24px 20px',
                display: 'flex', flexDirection: 'column', gap: 12,
                backdropFilter: 'blur(8px)',
              }}>
                {/* Top badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase',
                    background: 'linear-gradient(90deg,#7c3aed,#a78bfa)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>Coming Soon</span>
                  <span className={`pill ${c.difficulty === 'Beginner' ? 'pill-teal' : c.difficulty === 'Intermediate' ? 'pill-amber' : 'pill-coral'}`} style={{ opacity: 0.7 }}>{c.difficulty}</span>
                </div>

                {/* Icon */}
                <div style={{ fontSize: 40, lineHeight: 1 }}>{c.icon}</div>

                {/* Title & description */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 6 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{c.description}</div>
                </div>

                {/* Bottom bar */}
                <div style={{
                  marginTop: 'auto', padding: '8px 14px', borderRadius: 10,
                  background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
                  fontSize: 12, color: '#c4b5fd', fontWeight: 600, textAlign: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <span style={{ fontSize: 14 }}>🚀</span> Launching Soon — Stay tuned!
                </div>
              </div>
            );
          }

          /* ── Regular course card ── */
          return (
            <div key={c.id} className="course-card" onClick={() => setSelected(c)}>
              <div className="course-thumb" style={{ background: c.color + '14' }}>
                {logos.map((logo, idx) => {
                  const L = logo.component;
                  return L
                    ? <div key={logo.alt} className="course-logo-animated" style={{ animationDelay: `${idx * 0.4}s` }}><L /></div>
                    : <img key={logo.alt} src={logo.src} alt={logo.alt} className="course-logo" style={{ animationDelay: `${idx * 0.4}s` }} />;
                })}
              </div>
              <div className="course-body">
                <div style={{ display: 'flex', gap: 5, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span className={`pill ${c.difficulty === 'Beginner' ? 'pill-teal' : c.difficulty === 'Intermediate' ? 'pill-amber' : 'pill-coral'}`}>{c.difficulty}</span>
                  <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.06)', color: 'var(--muted)', padding: '2px 8px', borderRadius: 20 }}>📝 {c.total_lessons} lessons</span>
                </div>
                <div className="course-name">{c.title}</div>
                <div className="course-meta">⏱ {c.duration} · 🎥 Video per topic</div>
                <div className="progress-bar" style={{ marginTop: 8 }}>
                  <div className="progress-fill" style={{ width: `${prog}%`, background: c.color }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  {prog === 0 ? 'Not started' : prog === 100 ? '✅ Completed' : `${prog}% complete`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selected && <CourseModal course={selected} onClose={() => setSelected(null)} onEnroll={load} />}
    </div>
  );
}
