import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../hooks/useApi';

const TYPE_COLOR = {
  SQL:        { bg: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.30)',  text: '#38bdf8'  },
  Python:     { bg: 'rgba(255,211,67,0.12)',  border: 'rgba(255,211,67,0.30)',  text: '#FFD343'  },
  Analytical: { bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.30)', text: '#a78bfa'  },
  Behavioral: { bg: 'rgba(92,200,160,0.12)',  border: 'rgba(92,200,160,0.30)',  text: '#5CC8A0'  },
};
const DIFF_COLOR = {
  Easy:   { bg: 'rgba(92,200,160,0.12)',  text: '#5CC8A0'  },
  Medium: { bg: 'rgba(232,168,56,0.12)',  text: '#E8A838'  },
  Hard:   { bg: 'rgba(240,123,106,0.12)', text: '#F07B6A'  },
};

const SAMPLE_COMPANIES = [
  { name:'Flipkart',    logo:'🛒', color:'#2874F0', question_count:7, difficulty:'Medium', industry:'E-commerce'    },
  { name:'Amazon India',logo:'📦', color:'#FF9900', question_count:7, difficulty:'Hard',   industry:'E-commerce'    },
  { name:'Swiggy',      logo:'🍔', color:'#FC8019', question_count:6, difficulty:'Medium', industry:'Food Delivery'  },
  { name:'Zomato',      logo:'🍕', color:'#E23744', question_count:6, difficulty:'Medium', industry:'Food Delivery'  },
  { name:'PhonePe',     logo:'💸', color:'#5F259F', question_count:6, difficulty:'Medium', industry:'Fintech'        },
  { name:'Razorpay',    logo:'💳', color:'#2962FF', question_count:6, difficulty:'Hard',   industry:'Fintech'        },
];

export default function CompanyQuestions() {
  const [companies, setCompanies]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [isPremium, setIsPremium]     = useState(false);
  const [selected, setSelected]       = useState(null);   // { company, questions }
  const [qLoading, setQLoading]       = useState(false);
  const [openQ, setOpenQ]             = useState(null);   // expanded question id
  const [filter, setFilter]           = useState('All');  // All | SQL | Python | Analytical | Behavioral
  const navigate = useNavigate();

  useEffect(() => { loadCompanies(); }, []);

  async function loadCompanies() {
    try {
      const r = await api.get('/company-banks');
      setCompanies(r.data.companies);
      setIsPremium(true);
    } catch (e) {
      if (e.response?.status === 401) navigate('/login');
      setIsPremium(false);
    } finally { setLoading(false); }
  }

  async function openCompany(company) {
    if (!isPremium) return;
    setQLoading(true);
    setOpenQ(null);
    setFilter('All');
    try {
      const r = await api.get(`/company-banks/${company.id}/questions`);
      setSelected({ company: r.data.company, questions: r.data.questions });
    } catch (e) {
      if (e.response?.data?.premium_required) setIsPremium(false);
    } finally { setQLoading(false); }
  }

  // ── Paywall ──────────────────────────────────────────
  if (!isPremium && !loading) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="page-title">🏢 Company Question Banks</div>
          <div className="page-sub">Real interview questions asked by top Indian companies</div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.8rem', marginBottom:'1.6rem' }}>
          {[
            { icon:'🏢', val:'10+',  lbl:'Companies',       color:'#4A90D9' },
            { icon:'❓', val:'60+',  lbl:'Real Questions',  color:'#5CC8A0' },
            { icon:'🎯', val:'4',    lbl:'Question Types',  color:'#E8A838' },
            { icon:'📈', val:'Easy-Hard', lbl:'All Levels', color:'#a78bfa' },
          ].map((s,i) => (
            <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${s.color}28`, borderRadius:14, padding:'1rem', textAlign:'center', animation:`popIn 0.35s ${i*0.07}s ease both` }}>
              <div style={{ fontSize:22, marginBottom:4 }}>{s.icon}</div>
              <div style={{ fontSize:20, fontWeight:900, color:s.color, lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:3 }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Blurred company grid */}
        <div style={{ position:'relative', marginBottom:'1.6rem' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.9rem', filter:'blur(5px)', pointerEvents:'none', userSelect:'none', opacity:0.5 }}>
            {SAMPLE_COMPANIES.map(co => (
              <div key={co.name} style={{ background:`linear-gradient(145deg,${co.color}10,rgba(255,255,255,0.02))`, border:`1px solid ${co.color}25`, borderTop:`2px solid ${co.color}55`, borderRadius:16, padding:'1.2rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:`${co.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{co.logo}</div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:14, color:'#fff' }}>{co.name}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.40)' }}>{co.industry}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:20, background:`${co.color}18`, color:co.color }}>{co.question_count} Questions</span>
                  <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:20, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.45)' }}>{co.difficulty}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Lock overlay */}
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'linear-gradient(to bottom, transparent 0%, rgba(4,6,14,0.75) 35%, rgba(4,6,14,0.97) 100%)', borderRadius:16, zIndex:2 }}>
            <div style={{ textAlign:'center', padding:'2rem 1.5rem' }}>
              <div style={{ fontSize:40, marginBottom:'0.8rem' }}>🔒</div>
              <div style={{ fontSize:20, fontWeight:900, color:'#fff', marginBottom:6 }}>Premium Feature</div>
              <div style={{ fontSize:14, color:'rgba(255,255,255,0.50)', marginBottom:'1.4rem', maxWidth:340 }}>
                Unlock real interview questions from Flipkart, Amazon, Swiggy, Zomato & more — with full solution approaches.
              </div>

              {/* What you get */}
              <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:'1.5rem', textAlign:'left', maxWidth:320 }}>
                {[
                  '60+ real questions from 10 top companies',
                  'SQL, Python, Analytical & Behavioral types',
                  'Detailed solution approach for every question',
                  'Updated regularly with fresh interview rounds',
                ].map(t => (
                  <div key={t} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'rgba(255,255,255,0.75)' }}>
                    <span style={{ color:'#5CC8A0', fontWeight:900 }}>✓</span>{t}
                  </div>
                ))}
              </div>

              <button onClick={() => navigate('/premium')} style={{ padding:'0.75rem 2rem', borderRadius:12, background:'linear-gradient(135deg,#E8A838,#f59e0b)', border:'none', color:'#000', fontWeight:800, fontSize:15, cursor:'pointer' }}>
                👑 Upgrade to Pro — ₹199
              </button>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:8 }}>One-time payment · Lifetime access</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Question detail panel ─────────────────────────────
  if (selected) {
    const co = selected.company;
    const filtered = filter === 'All' ? selected.questions : selected.questions.filter(q => q.type === filter);
    const types = ['All', ...new Set(selected.questions.map(q => q.type))];

    return (
      <div className="page">
        {/* Back + header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1.4rem' }}>
          <button onClick={() => setSelected(null)} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:10, padding:'6px 14px', color:'rgba(255,255,255,0.70)', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            ← Back
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:`${co.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{co.logo}</div>
            <div>
              <div style={{ fontWeight:900, fontSize:18, color:'#fff' }}>{co.name}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.40)' }}>{co.industry} · {co.question_count} Questions</div>
            </div>
          </div>
        </div>

        {/* Type filter pills */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:'1.2rem' }}>
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer',
              background: filter === t ? (TYPE_COLOR[t]?.bg || 'rgba(56,189,248,0.15)') : 'rgba(255,255,255,0.05)',
              border: filter === t ? `1px solid ${TYPE_COLOR[t]?.border || 'rgba(56,189,248,0.35)'}` : '1px solid rgba(255,255,255,0.08)',
              color: filter === t ? (TYPE_COLOR[t]?.text || '#38bdf8') : 'rgba(255,255,255,0.50)',
            }}>{t} {t === 'All' ? `(${selected.questions.length})` : `(${selected.questions.filter(q=>q.type===t).length})`}</button>
          ))}
        </div>

        {/* Questions list */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {filtered.map((q, i) => {
            const tc = TYPE_COLOR[q.type] || TYPE_COLOR.SQL;
            const dc = DIFF_COLOR[q.difficulty] || DIFF_COLOR.Medium;
            const isOpen = openQ === q.id;
            return (
              <div key={q.id} onClick={() => setOpenQ(isOpen ? null : q.id)}
                style={{ background: isOpen ? `linear-gradient(145deg,${co.color}0d,rgba(255,255,255,0.03))` : 'rgba(255,255,255,0.035)', border:`1px solid ${isOpen ? co.color+'30' : 'rgba(255,255,255,0.08)'}`, borderLeft:`3px solid ${isOpen ? co.color : 'rgba(255,255,255,0.12)'}`, borderRadius:14, padding:'1rem 1.1rem', cursor:'pointer', transition:'all 0.18s' }}>

                {/* Q header */}
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5, flexWrap:'wrap' }}>
                      <span style={{ fontSize:12, fontWeight:800, color:'rgba(255,255,255,0.30)' }}>Q{i+1}</span>
                      <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20, background:tc.bg, border:`1px solid ${tc.border}`, color:tc.text }}>{q.type}</span>
                      <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20, background:dc.bg, color:dc.text }}>{q.difficulty}</span>
                      <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', padding:'2px 8px', borderRadius:20, background:'rgba(255,255,255,0.05)' }}>{q.topic}</span>
                      <span style={{ fontSize:11, fontWeight:700, color:'#E8A838', marginLeft:'auto' }}>+{q.xp_reward} XP</span>
                    </div>
                    <div style={{ fontWeight:700, fontSize:14, color:'#fff', lineHeight:1.4 }}>{q.title}</div>
                  </div>
                  <div style={{ color:'rgba(255,255,255,0.35)', fontSize:18, flexShrink:0, marginTop:2 }}>{isOpen ? '▲' : '▼'}</div>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{ marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ fontSize:13.5, color:'rgba(255,255,255,0.82)', lineHeight:1.65, marginBottom:'1rem', whiteSpace:'pre-wrap' }}>{q.question}</div>

                    {q.approach && (
                      <div style={{ background:'rgba(92,200,160,0.06)', border:'1px solid rgba(92,200,160,0.18)', borderRadius:10, padding:'0.85rem 1rem' }}>
                        <div style={{ fontSize:11, fontWeight:800, color:'#5CC8A0', letterSpacing:'0.5px', textTransform:'uppercase', marginBottom:6 }}>💡 Approach / Solution Hint</div>
                        <div style={{ fontSize:13, color:'rgba(255,255,255,0.72)', lineHeight:1.65, whiteSpace:'pre-wrap' }}>{q.approach}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Company grid ──────────────────────────────────────
  const displayCompanies = loading ? [] : companies;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">🏢 Company Question Banks</div>
        <div className="page-sub">Real interview questions asked by top Indian data teams</div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.8rem', marginBottom:'1.6rem' }}>
        {[
          { icon:'🏢', val:`${companies.length}`,  lbl:'Companies',      color:'#4A90D9' },
          { icon:'❓', val:`${companies.reduce((s,c)=>s+c.question_count,0)}+`, lbl:'Questions', color:'#5CC8A0' },
          { icon:'🎯', val:'4',    lbl:'Question Types', color:'#E8A838' },
          { icon:'🔄', val:'Live', lbl:'Updated',        color:'#a78bfa' },
        ].map((s,i) => (
          <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${s.color}28`, borderRadius:14, padding:'1rem', textAlign:'center', animation:`popIn 0.35s ${i*0.07}s ease both` }}>
            <div style={{ fontSize:22, marginBottom:4 }}>{s.icon}</div>
            <div style={{ fontSize:20, fontWeight:900, color:s.color, lineHeight:1 }}>{s.val}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:3 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:'1.2rem' }}>
        {Object.entries(TYPE_COLOR).map(([t,c]) => (
          <span key={t} style={{ fontSize:12, fontWeight:700, padding:'4px 12px', borderRadius:20, background:c.bg, border:`1px solid ${c.border}`, color:c.text }}>{t}</span>
        ))}
      </div>

      {/* Company cards grid */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'3rem', color:'rgba(255,255,255,0.35)' }}>Loading companies…</div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:'1rem' }}>
          {displayCompanies.map((co, i) => (
            <div key={co.id} onClick={() => openCompany(co)}
              style={{ background:`linear-gradient(145deg,${co.color}10,rgba(255,255,255,0.025))`, border:`1px solid ${co.color}28`, borderTop:`2px solid ${co.color}60`, borderRadius:16, padding:'1.3rem', cursor:'pointer', transition:'all 0.2s', animation:`popIn 0.35s ${i*0.05}s ease both` }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 8px 24px ${co.color}20`; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>

              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'0.9rem' }}>
                <div style={{ width:44, height:44, borderRadius:12, background:`${co.color}20`, border:`1px solid ${co.color}35`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{co.logo}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:800, fontSize:15, color:'#fff', marginBottom:2 }}>{co.name}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.40)' }}>{co.industry}</div>
                </div>
              </div>

              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:'0.9rem' }}>
                <span style={{ fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:20, background:`${co.color}18`, color:co.color }}>
                  {co.question_count} Questions
                </span>
                <span style={{ fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:20, background: DIFF_COLOR[co.difficulty]?.bg || 'rgba(255,255,255,0.06)', color: DIFF_COLOR[co.difficulty]?.text || '#fff' }}>
                  {co.difficulty}
                </span>
              </div>

              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', gap:4 }}>
                  {['SQL','Python','Analytical'].map(t => (
                    <span key={t} style={{ fontSize:10, padding:'2px 7px', borderRadius:20, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.40)', fontWeight:600 }}>{t}</span>
                  ))}
                </div>
                <span style={{ fontSize:12, color:co.color, fontWeight:700 }}>View →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {qLoading && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:500 }}>
          <div style={{ background:'#0d1117', borderRadius:16, padding:'2rem', textAlign:'center', color:'rgba(255,255,255,0.7)', fontSize:15 }}>Loading questions…</div>
        </div>
      )}
    </div>
  );
}
