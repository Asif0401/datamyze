import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../hooks/useApi';

/* ── GitHub-style activity heatmap ───────────────────── */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function ActivityHeatmap({ activeDates = new Set(), streak = 0 }) {
  const [tooltip, setTooltip] = useState(null); // { cell, x, y }

  // Build 13-week grid (Sun → Sat columns)
  const todayObj = new Date();
  todayObj.setHours(12, 0, 0, 0);
  const todayStr = todayObj.toISOString().split('T')[0];

  // Sunday of current week
  const curSunday = new Date(todayObj);
  curSunday.setDate(todayObj.getDate() - todayObj.getDay());

  // Start 12 weeks back
  const startSunday = new Date(curSunday);
  startSunday.setDate(startSunday.getDate() - 12 * 7);

  const weeks = [];
  for (let w = 0; w < 13; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(startSunday);
      day.setDate(day.getDate() + w * 7 + d);
      const dateStr = day.toISOString().split('T')[0];
      week.push({
        date: dateStr,
        isActive: activeDates.has(dateStr),
        isToday: dateStr === todayStr,
        isFuture: day > todayObj,
        month: day.getMonth(),
        dayNum: day.getDate(),
      });
    }
    weeks.push(week);
  }

  // Stats
  const allDays = weeks.flat().filter(c => !c.isFuture);
  const activeInRange = allDays.filter(c => c.isActive).length;
  const curMonthStr = todayObj.toISOString().slice(0, 7);
  const activeThisMonth = allDays.filter(c => c.isActive && c.date.startsWith(curMonthStr)).length;

  function enter(e, cell) {
    if (cell.isFuture) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTooltip({ cell, x: r.left + r.width / 2, y: r.top });
  }

  return (
    <div>
      {/* Mini stats row */}
      <div style={{ display: 'flex', gap: '1.8rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
        {[
          { val: activeInRange,  label: 'days active',        color: '#4A90D9' },
          { val: activeThisMonth,label: 'this month',         color: '#5CC8A0' },
          { val: streak,         label: 'day streak 🔥',     color: '#F07B6A' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</span>
            <span style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 4 }}>
        {/* Day-of-week labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 20, marginRight: 2, flexShrink: 0 }}>
          {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((lbl, i) => (
            <div key={i} style={{
              height: 13, lineHeight: '13px', fontSize: 9,
              color: 'var(--muted)', textAlign: 'right', minWidth: 22,
            }}>{lbl}</div>
          ))}
        </div>

        {/* Weeks */}
        <div style={{ flexShrink: 0 }}>
          {/* Month labels */}
          <div style={{ display: 'flex', gap: 3, marginBottom: 4, height: 16 }}>
            {weeks.map((week, wi) => {
              const show = wi === 0 || week[0].month !== weeks[wi - 1][0].month;
              return (
                <div key={wi} style={{
                  width: 13, fontSize: 9, color: 'var(--muted)',
                  overflow: 'visible', whiteSpace: 'nowrap', userSelect: 'none',
                }}>
                  {show ? MONTHS[week[0].month] : ''}
                </div>
              );
            })}
          </div>

          {/* 7 rows (Sun → Sat) */}
          {[0,1,2,3,4,5,6].map(dayIdx => (
            <div key={dayIdx} style={{ display: 'flex', gap: 3, marginBottom: 3 }}>
              {weeks.map((week, wi) => {
                const cell = week[dayIdx];

                if (cell.isFuture) return (
                  <div key={wi} style={{ width: 13, height: 13, borderRadius: 3, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }} />
                );

                const isActive = cell.isActive;
                const isToday  = cell.isToday;

                let bg     = 'rgba(255,255,255,0.07)';
                let shadow = 'none';
                let border = '1px solid rgba(255,255,255,0.06)';

                if (isActive && !isToday) {
                  bg     = 'linear-gradient(135deg,#4A90D9,#38bdf8)';
                  shadow = '0 0 5px rgba(74,144,217,0.4)';
                  border = '1px solid rgba(74,144,217,0.3)';
                }
                if (isToday) {
                  bg     = isActive ? 'linear-gradient(135deg,#38bdf8,#5CC8A0)' : 'rgba(56,189,248,0.12)';
                  border = '1.5px solid #38bdf8';
                  shadow = isActive ? '0 0 8px rgba(56,189,248,0.55)' : '0 0 4px rgba(56,189,248,0.3)';
                }

                return (
                  <div
                    key={wi}
                    style={{
                      width: 13, height: 13, borderRadius: 3, flexShrink: 0,
                      background: bg, boxShadow: shadow, border,
                      cursor: 'default', transition: 'transform .1s, box-shadow .15s',
                      position: 'relative', zIndex: 0,
                    }}
                    onMouseEnter={e => { enter(e, cell); e.currentTarget.style.transform = 'scale(1.35)'; e.currentTarget.style.zIndex = '2'; }}
                    onMouseLeave={e => { setTooltip(null); e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.zIndex = '0'; }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginTop: 10, fontSize: 10, color: 'var(--muted)' }}>
        <span>Less</span>
        {[
          'rgba(255,255,255,0.07)',
          'rgba(74,144,217,0.35)',
          'rgba(74,144,217,0.65)',
          'linear-gradient(135deg,#4A90D9,#38bdf8)',
        ].map((bg, i) => (
          <div key={i} style={{ width: 11, height: 11, borderRadius: 2, background: bg }} />
        ))}
        <span>More</span>

        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 11, height: 11, borderRadius: 2, border: '1.5px solid #38bdf8', background: 'rgba(56,189,248,0.1)' }} />
          Today
        </span>
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed',
          left:  tooltip.x,
          top:   tooltip.y - 10,
          transform: 'translate(-50%, -100%)',
          background: 'rgba(6,12,30,0.96)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 8,
          padding: '7px 13px',
          fontSize: 12,
          fontWeight: 600,
          color: 'white',
          whiteSpace: 'nowrap',
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 6px 24px rgba(0,0,0,0.55)',
          backdropFilter: 'blur(10px)',
          lineHeight: 1.5,
        }}>
          {new Date(tooltip.cell.date + 'T12:00:00').toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
          })}
          <span style={{
            marginLeft: 8, fontSize: 11,
            color: tooltip.cell.isActive ? '#5CC8A0' : 'rgba(255,255,255,0.35)',
          }}>
            {tooltip.cell.isActive ? '● Active' : '○ No activity'}
          </span>
          {tooltip.cell.isToday && (
            <span style={{ marginLeft: 6, fontSize: 10, color: '#38bdf8', fontWeight: 700 }}> · Today</span>
          )}
          {/* Arrow */}
          <div style={{
            position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
            borderTop: '5px solid rgba(6,12,30,0.96)',
          }} />
        </div>
      )}
    </div>
  );
}

/* ── Pro Welcome Banner ───────────────────────────────── */
const PRO_PERKS = [
  { icon: '💼', label: 'Exclusive Job Board',    desc: '70+ curated data roles' },
  { icon: '👨‍🏫', label: '1-on-1 Instructor',      desc: 'Live mock interviews' },
  { icon: '📄', label: 'Resume Review',           desc: 'ATS-optimised feedback' },
  { icon: '🗺️', label: '12-Week Roadmap',          desc: 'Zero to first offer' },
  { icon: '📜', label: 'Verified Certificates',   desc: 'LinkedIn-ready credentials' },
  { icon: '⚡', label: 'Priority Support',         desc: 'Faster answers, always' },
];

function ProWelcomeBanner({ user, onDismiss, navigate }) {
  return (
    <div style={{ position: 'relative', marginBottom: '2rem', borderRadius: 22 }}>

      {/* Animated gold shimmer border */}
      <style>{`
        @keyframes proShimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .pro-border-anim {
          background: linear-gradient(135deg, #F6D365, #E8A838, #fff5c2, #E8A838, #F6D365);
          background-size: 300% 300%;
          animation: proShimmer 4s ease infinite;
        }
      `}</style>

      <div className="pro-border-anim" style={{
        borderRadius: 22, padding: '1.5px',
        boxShadow: '0 16px 60px rgba(246,211,101,0.18), 0 4px 20px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          background: 'linear-gradient(145deg, #0c1e38 0%, #111827 55%, #0d1a2e 100%)',
          borderRadius: 21,
          padding: '2rem 2.2rem 1.6rem',
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* Background sparkle glow */}
          <div style={{
            position: 'absolute', top: '-40%', right: '-5%',
            width: 360, height: 260,
            background: 'radial-gradient(ellipse, rgba(246,211,101,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}/>
          <div style={{
            position: 'absolute', bottom: '-30%', left: '5%',
            width: 240, height: 200,
            background: 'radial-gradient(ellipse, rgba(232,168,56,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}/>

          {/* Dismiss button */}
          <button onClick={onDismiss} style={{
            position: 'absolute', top: 14, right: 14, zIndex: 2,
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.45)', borderRadius: 8,
            width: 28, height: 28, cursor: 'pointer', fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
          >✕</button>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: '1.6rem', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 52, lineHeight: 1, flexShrink: 0, filter: 'drop-shadow(0 0 24px rgba(246,211,101,0.7))' }}>
              👑
            </div>
            <div>
              <div style={{
                fontSize: 20, fontWeight: 800, lineHeight: 1.2, marginBottom: 6,
                background: 'linear-gradient(120deg, #F6D365 0%, #fde68a 45%, #E8A838 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Welcome to Pro, {user?.name?.split(' ')[0]}! 🎉
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.52)', lineHeight: 1.5 }}>
                Your <strong style={{ color: 'rgba(246,211,101,0.8)' }}>Pro membership</strong> is now active.
                Everything below is unlocked and ready for you.
              </div>
            </div>
          </div>

          {/* Perks grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
            gap: 9, marginBottom: '1.6rem', position: 'relative', zIndex: 1,
          }}>
            {PRO_PERKS.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 9,
                background: 'rgba(246,211,101,0.055)',
                border: '1px solid rgba(246,211,101,0.15)',
                borderRadius: 11, padding: '9px 12px',
                transition: 'background .2s, border-color .2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(246,211,101,0.10)'; e.currentTarget.style.borderColor = 'rgba(246,211,101,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(246,211,101,0.055)'; e.currentTarget.style.borderColor = 'rgba(246,211,101,0.15)'; }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{p.icon}</span>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.88)', lineHeight: 1.2 }}>{p.label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <button
              style={{
                background: 'linear-gradient(135deg, #F6D365 0%, #E8A838 100%)',
                color: '#0a1628', border: 'none', borderRadius: 10,
                padding: '9px 20px', fontWeight: 800, fontSize: 13,
                cursor: 'pointer', boxShadow: '0 4px 18px rgba(246,211,101,0.35)',
                transition: 'transform .15s, box-shadow .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(246,211,101,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(246,211,101,0.35)'; }}
              onClick={() => { onDismiss(); navigate('/jobs'); }}
            >
              💼 Browse Job Board
            </button>
            <button
              style={{
                background: 'transparent',
                color: 'rgba(246,211,101,0.7)', border: '1px solid rgba(246,211,101,0.2)',
                borderRadius: 10, padding: '9px 20px', fontWeight: 600, fontSize: 13,
                cursor: 'pointer', transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(246,211,101,0.07)'; e.currentTarget.style.color = '#F6D365'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(246,211,101,0.7)'; }}
              onClick={() => { onDismiss(); navigate('/instructor'); }}
            >
              👨‍🏫 Meet Your Instructor
            </button>
            <button onClick={onDismiss} style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer',
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}>
              Dismiss
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProBanner, setShowProBanner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show banner if premium and not yet dismissed
    if (user?.is_premium === 1) {
      const dismissed = localStorage.getItem('dm_pro_welcomed');
      if (!dismissed) setShowProBanner(true);
    }
  }, [user]);

  function dismissProBanner() {
    localStorage.setItem('dm_pro_welcomed', '1');
    setShowProBanner(false);
  }

  useEffect(() => {
    api.get('/users/dashboard').then(r => { setData(r.data); refreshUser(); }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" />Loading dashboard...</div>;

  const { stats, courseProgress } = data || {};
  const activeDates = new Set(stats?.activeDays || []);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">👋 Welcome back, {user?.name?.split(' ')[0]}!</div>
        <div className="page-sub">Keep your streak alive — you're on a {user?.streak || 0}-day run! 🔥</div>
      </div>

      {showProBanner && (
        <ProWelcomeBanner user={user} onDismiss={dismissProBanner} navigate={navigate} />
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ width:38,height:38,borderRadius:10,background:'rgba(232,168,56,0.18)',border:'1px solid rgba(232,168,56,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginBottom:'0.6rem' }}>⭐</div>
          <div className="stat-label">Total XP</div>
          <div className="stat-val">{(user?.xp || 0).toLocaleString()}</div>
          <div className="stat-sub">Keep solving problems</div>
        </div>
        <div className="stat-card">
          <div style={{ width:38,height:38,borderRadius:10,background:'rgba(240,123,106,0.18)',border:'1px solid rgba(240,123,106,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginBottom:'0.6rem' }}>🔥</div>
          <div className="stat-label">Streak</div>
          <div className="stat-val">{user?.streak || 0}</div>
          <div className="stat-sub">days in a row</div>
        </div>
        <div className="stat-card">
          <div style={{ width:38,height:38,borderRadius:10,background:'rgba(92,200,160,0.18)',border:'1px solid rgba(92,200,160,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginBottom:'0.6rem' }}>✅</div>
          <div className="stat-label">Problems Solved</div>
          <div className="stat-val">{stats?.totalSolved || 0}</div>
          <div className="stat-sub">Keep going!</div>
        </div>
        <div className="stat-card">
          <div style={{ width:38,height:38,borderRadius:10,background:'rgba(181,123,247,0.18)',border:'1px solid rgba(181,123,247,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginBottom:'0.6rem' }}>🏆</div>
          <div className="stat-label">Rank</div>
          <div className="stat-val">#{stats?.rank || '—'}</div>
          <div className="stat-sub">on leaderboard</div>
        </div>
      </div>

      <div className="section-grid">
        <div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
              <div className="card-title" style={{ margin: 0 }}>📅 Activity</div>
              <span style={{ fontSize: 11, color: 'var(--muted)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '2px 10px' }}>
                Last 13 weeks
              </span>
            </div>
            <ActivityHeatmap activeDates={activeDates} streak={user?.streak || 0} />
          </div>

          {courseProgress?.length > 0 && (
            <div className="card">
              <div className="card-title">📚 Continue Learning</div>
              {courseProgress.filter(c => c.progress_percent < 100).slice(0, 3).map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 28 }}>{c.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{c.title}</div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${c.progress_percent}%`, background: c.color }} /></div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{c.progress_percent}% complete</div>
                  </div>
                  <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => navigate('/courses')}>Resume →</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="card">
            <div className="card-title">📌 Today's Challenge</div>
            <div style={{ background: 'rgba(74,144,217,0.12)', border: '1px solid rgba(74,144,217,0.20)', borderRadius: 'var(--radius)', padding: '12px', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#7ab8f0', marginBottom: 4 }}>Find Top 5 Customers by Revenue</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>SQL · Easy · +50 XP</div>
            </div>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }} onClick={() => navigate('/problems')}>Solve Now →</button>
          </div>

          <div className="card">
            <div className="card-title" style={{ fontSize: 13 }}>🧠 Quick Stats</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {[
                { label: 'Quizzes Taken', val: stats?.quizzesTaken || 0 },
                { label: 'Courses In Progress', val: courseProgress?.filter(c => c.progress_percent > 0 && c.progress_percent < 100).length || 0 },
                { label: 'Courses Completed', val: courseProgress?.filter(c => c.progress_percent === 100).length || 0 },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--muted)' }}>{s.label}</span>
                  <span style={{ fontWeight: 700 }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
