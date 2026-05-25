import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../hooks/useApi';

const COMPANY_COLORS = {
  Swiggy:   { bg: 'rgba(252,128,25,0.15)',  border: 'rgba(252,128,25,0.35)',  text: '#fc8019' },
  Flipkart: { bg: 'rgba(36,116,248,0.15)',  border: 'rgba(36,116,248,0.35)',  text: '#2474f8' },
  Amazon:   { bg: 'rgba(255,153,0,0.15)',   border: 'rgba(255,153,0,0.35)',   text: '#ff9900' },
  Zomato:   { bg: 'rgba(225,47,31,0.15)',   border: 'rgba(225,47,31,0.35)',   text: '#e12f1f' },
  CRED:     { bg: 'rgba(26,25,25,0.4)',     border: 'rgba(200,200,200,0.25)', text: '#d4d4d4' },
  Meesho:   { bg: 'rgba(157,92,255,0.15)',  border: 'rgba(157,92,255,0.35)',  text: '#9d5cff' },
};

const DIFFICULTY_CONFIG = {
  Easy:   { color: '#5CC8A0', bg: 'rgba(92,200,160,0.15)',  border: 'rgba(92,200,160,0.3)'  },
  Medium: { color: '#E8A838', bg: 'rgba(232,168,56,0.15)',  border: 'rgba(232,168,56,0.3)'  },
  Hard:   { color: '#F07B6A', bg: 'rgba(240,123,106,0.15)', border: 'rgba(240,123,106,0.3)' },
};

const SECTION_ICONS = {
  problem:       '🎯',
  data_overview: '📊',
  approach:      '🔧',
  key_insights:  '💡',
  outcome:       '🏆',
};

const SECTION_LABELS = {
  problem:       'The Problem',
  data_overview: 'Data Overview',
  approach:      'Approach & Method',
  key_insights:  'Key Insights',
  outcome:       'Outcome',
};

export default function CaseStudies() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [caseStudies, setCaseStudies]   = useState([]);
  const [isPremium, setIsPremium]       = useState(false);
  const [loading, setLoading]           = useState(true);
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [activeCase, setActiveCase]     = useState(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  async function fetchCaseStudies() {
    try {
      const { data } = await api.get('/case-studies');
      setCaseStudies(data.case_studies || []);
      setIsPremium(data.is_premium || false);
    } catch (err) {
      console.error('Failed to fetch case studies:', err);
    } finally {
      setLoading(false);
    }
  }

  const companies  = ['All', ...new Set(caseStudies.map(c => c.company))];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filtered = caseStudies.filter(c => {
    const companyMatch     = selectedCompany === 'All' || c.company === selectedCompany;
    const difficultyMatch  = selectedDifficulty === 'All' || c.difficulty === selectedDifficulty;
    return companyMatch && difficultyMatch;
  });

  function handleCardClick(cs) {
    if (cs.locked) {
      setShowUpgradePrompt(true);
    } else {
      setActiveCase(cs);
    }
  }

  function parseTags(tags) {
    if (!tags) return [];
    try { return JSON.parse(tags); } catch { return []; }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="loading"><div className="spinner" />Loading case studies...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', animation: 'fadeInUp 0.4s ease' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>📂</span> Case Studies
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15 }}>
          Real problems. Real data. Real decisions.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--teal)', background: 'var(--teal-light)', padding: '3px 12px', borderRadius: 20, border: '1px solid rgba(92,200,160,0.2)' }}>
            {caseStudies.filter(c => !c.locked).length} Free
          </span>
          <span style={{ fontSize: 13, color: 'var(--amber)', background: 'var(--amber-light)', padding: '3px 12px', borderRadius: 20, border: '1px solid rgba(232,168,56,0.2)' }}>
            {caseStudies.filter(c => c.locked).length} Pro
          </span>
        </div>
      </div>

      {/* ── Company Filter Tabs ── */}
      <div style={{ marginBottom: '1.2rem' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Filter by Company
        </div>
        <div className="filter-bar">
          {companies.map(co => (
            <button
              key={co}
              className={`filter-chip${selectedCompany === co ? ' active' : ''}`}
              onClick={() => setSelectedCompany(co)}
            >
              {co !== 'All' && <span style={{ marginRight: 4 }}>{caseStudies.find(c => c.company === co)?.company_logo}</span>}
              {co}
            </button>
          ))}
        </div>
      </div>

      {/* ── Difficulty Filter Pills ── */}
      <div style={{ marginBottom: '1.8rem' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Difficulty
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {difficulties.map(d => {
            const config = DIFFICULTY_CONFIG[d];
            const isActive = selectedDifficulty === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d)}
                style={{
                  padding: '5px 16px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: isActive ? '1px solid transparent' : `1px solid ${config ? config.border : 'var(--border)'}`,
                  background: isActive
                    ? (config ? config.bg : 'rgba(108,99,255,0.18)')
                    : 'rgba(255,255,255,0.04)',
                  color: isActive ? (config ? config.color : '#fff') : 'var(--muted)',
                  transition: 'all 0.18s',
                }}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Cards Grid ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
          No case studies match your filters.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '1.2rem' }}>
          {filtered.map(cs => (
            <CaseStudyCard
              key={cs.id}
              cs={cs}
              onClick={() => handleCardClick(cs)}
              parseTags={parseTags}
            />
          ))}
        </div>
      )}

      {/* ── Detail Modal ── */}
      {activeCase && (
        <DetailModal
          cs={activeCase}
          parseTags={parseTags}
          onClose={() => setActiveCase(null)}
        />
      )}

      {/* ── Upgrade Prompt Modal ── */}
      {showUpgradePrompt && (
        <div className="modal-backdrop" onClick={() => setShowUpgradePrompt(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, textAlign: 'center' }}>
            <button className="modal-close" onClick={() => setShowUpgradePrompt(false)}>✕</button>
            <div style={{ fontSize: 52, marginBottom: '1rem' }}>🔒</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Pro Case Study</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: '1.5rem', lineHeight: 1.6 }}>
              This case study is available to Pro members. Upgrade to unlock all 4 Pro case studies with full problem analysis, data breakdown, and key insights.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn-gold"
                style={{ padding: '10px 24px' }}
                onClick={() => { setShowUpgradePrompt(false); navigate('/premium'); }}
              >
                👑 Upgrade to Pro
              </button>
              <button
                onClick={() => setShowUpgradePrompt(false)}
                style={{
                  padding: '10px 20px', borderRadius: 10, fontSize: 14, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--muted)',
                }}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Case Study Card ─────────────────────────────── */
function CaseStudyCard({ cs, onClick, parseTags }) {
  const tags        = parseTags(cs.tags);
  const compColor   = COMPANY_COLORS[cs.company] || { bg: 'rgba(108,99,255,0.15)', border: 'rgba(108,99,255,0.3)', text: '#6C63FF' };
  const diffConfig  = DIFFICULTY_CONFIG[cs.difficulty] || DIFFICULTY_CONFIG.Medium;

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.4rem',
        cursor: 'pointer',
        transition: 'all 0.22s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Company + Difficulty header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>{cs.company_logo}</span>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 20,
            background: compColor.bg, border: `1px solid ${compColor.border}`, color: compColor.text,
          }}>
            {cs.company}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
            background: diffConfig.bg, border: `1px solid ${diffConfig.border}`, color: diffConfig.color,
          }}>
            {cs.difficulty}
          </span>
          {cs.locked && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: 'rgba(232,168,56,0.15)', border: '1px solid rgba(232,168,56,0.35)', color: '#E8A838',
            }}>
              👑 Pro Only
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: '0.6rem', lineHeight: 1.4 }}>
        {cs.title}
      </h3>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {parseTags(cs.tags).slice(0, 3).map(tag => (
          <span key={tag} style={{
            fontSize: 11, padding: '2px 9px', borderRadius: 12,
            background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.22)', color: '#9b98f7',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Summary */}
      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: cs.locked ? '1.5rem' : 0 }}>
        {cs.summary}
      </p>

      {/* Lock overlay for pro cards */}
      {cs.locked && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
          background: 'linear-gradient(to top, rgba(8,12,26,0.97) 55%, transparent)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
          padding: '1rem',
          borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)',
        }}>
          <button
            className="btn-gold"
            style={{ fontSize: 13, padding: '8px 20px', pointerEvents: 'none' }}
          >
            🔒 Unlock with Pro
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Detail Modal ────────────────────────────────── */
function DetailModal({ cs, parseTags, onClose }) {
  const compColor  = COMPANY_COLORS[cs.company] || { bg: 'rgba(108,99,255,0.15)', border: 'rgba(108,99,255,0.3)', text: '#6C63FF' };
  const diffConfig = DIFFICULTY_CONFIG[cs.difficulty] || DIFFICULTY_CONFIG.Medium;

  const sections = ['problem', 'data_overview', 'approach', 'key_insights', 'outcome'];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        style={{ width: 680, maxWidth: '96vw' }}
        onClick={e => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Modal header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 28 }}>{cs.company_logo}</span>
            <span style={{
              fontSize: 13, fontWeight: 600, padding: '4px 14px', borderRadius: 20,
              background: compColor.bg, border: `1px solid ${compColor.border}`, color: compColor.text,
            }}>
              {cs.company}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20,
              background: diffConfig.bg, border: `1px solid ${diffConfig.border}`, color: diffConfig.color,
            }}>
              {cs.difficulty}
            </span>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1.3, marginBottom: '0.75rem' }}>
            {cs.title}
          </h2>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            {parseTags(cs.tags).map(tag => (
              <span key={tag} style={{
                fontSize: 12, padding: '3px 11px', borderRadius: 14,
                background: 'rgba(108,99,255,0.14)', border: '1px solid rgba(108,99,255,0.26)', color: '#9b98f7',
              }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Summary */}
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, fontStyle: 'italic' }}>
            {cs.summary}
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sections.map(key => cs[key] && (
            <div
              key={key}
              style={{
                background: 'rgba(255,255,255,0.045)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                padding: '1rem 1.2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}>
                <span style={{ fontSize: 16 }}>{SECTION_ICONS[key]}</span>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>
                  {SECTION_LABELS[key]}
                </span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>
                {cs[key]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
