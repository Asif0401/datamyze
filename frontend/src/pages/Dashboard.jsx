import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../hooks/useApi';

const PyLogo = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" style={{ verticalAlign:'middle', display:'inline-block' }}>
    <path d="M11.914 2c-4.638 0-4.344 2.017-4.344 2.017v2.09h4.413v.626H6.34S3.287 6.386 3.287 10.994c0 4.609 2.697 4.447 2.697 4.447h1.613V13.23s-.088-2.697 2.654-2.697h4.368s2.552.041 2.552-2.467V3.855S17.562 2 11.914 2zm-2.316 1.51c.466 0 .843.377.843.843a.844.844 0 1 1-1.687 0c0-.466.378-.843.844-.843z" fill="#3776AB"/>
    <path d="M12.086 22c4.638 0 4.344-2.017 4.344-2.017v-2.09H12v-.626h5.643s3.053.347 3.053-4.261c0-4.609-2.697-4.447-2.697-4.447h-1.613v2.216s.088 2.697-2.654 2.697H9.364s-2.552-.041-2.552 2.467v4.211S6.422 22 12.086 22zm2.316-1.509a.844.844 0 1 1 0-1.687c.466 0 .843.377.843.843a.844.844 0 0 1-.843.844z" fill="#FFD343"/>
  </svg>
);

/* ── GitHub-style activity heatmap ───────────────────── */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function ActivityHeatmap({ activeDates = new Set(), streak = 0 }) {
  const [tooltip, setTooltip] = useState(null);
  const todayObj = new Date();
  todayObj.setHours(12, 0, 0, 0);
  const todayStr = todayObj.toISOString().split('T')[0];
  const curSunday = new Date(todayObj);
  curSunday.setDate(todayObj.getDate() - todayObj.getDay());
  const startSunday = new Date(curSunday);
  startSunday.setDate(startSunday.getDate() - 12 * 7);
  const weeks = [];
  for (let w = 0; w < 13; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(startSunday);
      day.setDate(day.getDate() + w * 7 + d);
      const dateStr = day.toISOString().split('T')[0];
      week.push({ date: dateStr, isActive: activeDates.has(dateStr), isToday: dateStr === todayStr, isFuture: day > todayObj, month: day.getMonth() });
    }
    weeks.push(week);
  }
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
      <div style={{ display: 'flex', gap: '1.8rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
        {[
          { val: activeInRange, label: 'days active', color: '#4A90D9' },
          { val: activeThisMonth, label: 'this month', color: '#5CC8A0' },
          { val: streak, label: 'day streak 🔥', color: '#F07B6A' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{s.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 20, marginRight: 2, flexShrink: 0 }}>
          {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((lbl, i) => (
            <div key={i} style={{ height: 13, lineHeight: '13px', fontSize: 9, color: 'var(--muted)', textAlign: 'right', minWidth: 22 }}>{lbl}</div>
          ))}
        </div>
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 3, marginBottom: 4, height: 16 }}>
            {weeks.map((week, wi) => {
              const show = wi === 0 || week[0].month !== weeks[wi - 1][0].month;
              return <div key={wi} style={{ width: 13, fontSize: 9, color: 'var(--muted)', overflow: 'visible', whiteSpace: 'nowrap' }}>{show ? MONTHS[week[0].month] : ''}</div>;
            })}
          </div>
          {[0,1,2,3,4,5,6].map(dayIdx => (
            <div key={dayIdx} style={{ display: 'flex', gap: 3, marginBottom: 3 }}>
              {weeks.map((week, wi) => {
                const cell = week[dayIdx];
                if (cell.isFuture) return <div key={wi} style={{ width: 13, height: 13, borderRadius: 3, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }} />;
                let bg = 'rgba(255,255,255,0.07)', shadow = 'none', border = '1px solid rgba(255,255,255,0.06)';
                if (cell.isActive && !cell.isToday) { bg = 'linear-gradient(135deg,#4A90D9,#38bdf8)'; shadow = '0 0 5px rgba(74,144,217,0.4)'; border = '1px solid rgba(74,144,217,0.3)'; }
                if (cell.isToday) { bg = cell.isActive ? 'linear-gradient(135deg,#38bdf8,#5CC8A0)' : 'rgba(56,189,248,0.12)'; border = '1.5px solid #38bdf8'; shadow = cell.isActive ? '0 0 8px rgba(56,189,248,0.55)' : '0 0 4px rgba(56,189,248,0.3)'; }
                return (
                  <div key={wi} style={{ width: 13, height: 13, borderRadius: 3, flexShrink: 0, background: bg, boxShadow: shadow, border, cursor: 'default', transition: 'transform .1s', position: 'relative', zIndex: 0 }}
                    onMouseEnter={e => { enter(e, cell); e.currentTarget.style.transform = 'scale(1.35)'; e.currentTarget.style.zIndex = '2'; }}
                    onMouseLeave={e => { setTooltip(null); e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.zIndex = '0'; }} />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginTop: 10, fontSize: 10, color: 'var(--muted)' }}>
        <span>Less</span>
        {['rgba(255,255,255,0.07)','rgba(74,144,217,0.35)','rgba(74,144,217,0.65)','linear-gradient(135deg,#4A90D9,#38bdf8)'].map((bg, i) => (
          <div key={i} style={{ width: 11, height: 11, borderRadius: 2, background: bg }} />
        ))}
        <span>More</span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 11, height: 11, borderRadius: 2, border: '1.5px solid #38bdf8', background: 'rgba(56,189,248,0.1)' }} />Today
        </span>
      </div>
      {tooltip && (
        <div style={{ position: 'fixed', left: tooltip.x, top: tooltip.y - 10, transform: 'translate(-50%,-100%)', background: 'rgba(6,12,30,0.96)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, padding: '7px 13px', fontSize: 12, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', zIndex: 9999, pointerEvents: 'none', boxShadow: '0 6px 24px rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', lineHeight: 1.5 }}>
          {new Date(tooltip.cell.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          <span style={{ marginLeft: 8, fontSize: 11, color: tooltip.cell.isActive ? '#5CC8A0' : 'rgba(255,255,255,0.35)' }}>{tooltip.cell.isActive ? '● Active' : '○ No activity'}</span>
          {tooltip.cell.isToday && <span style={{ marginLeft: 6, fontSize: 10, color: '#38bdf8', fontWeight: 700 }}> · Today</span>}
          <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid rgba(6,12,30,0.96)' }} />
        </div>
      )}
    </div>
  );
}

/* ── Readiness Dial ───────────────────────────────────── */
function ReadinessDial({ score = 0 }) {
  const r = 54, cx = 70, cy = 70;
  const circumference = 2 * Math.PI * r;
  // Arc covers 270° (from 135° to 405°), so offset = circumference * (1 - score/100 * 0.75)
  const arcFraction = (score / 100) * 0.75;
  const dashOffset = circumference * (1 - arcFraction);

  const color = score < 30 ? '#F07B6A' : score < 60 ? '#F6A04A' : score < 80 ? '#38bdf8' : '#5CC8A0';

  const stageColors = ['#F07B6A','#F6A04A','#38bdf8','#7F77DD','#5CC8A0'];
  const stageLabels = ['Just Starting','Building Foundation','Getting Consistent','Interview Prep Mode','Job-Ready 🚀'];
  const stages = [0,1,2,3,4];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <svg width="140" height="140" style={{ transform: 'rotate(135deg)' }}>
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"
            strokeDasharray={circumference * 0.75 + ' ' + circumference * 0.25}
            strokeLinecap="round" />
          {/* Fill */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1), stroke .5s', filter: `drop-shadow(0 0 8px ${color}88)` }} />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', marginTop: -4 }}>
          <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, color }}>{score}%</div>
          <div style={{ fontSize: 9.5, color: 'var(--muted)', marginTop: 2, fontWeight: 600, letterSpacing: '.03em' }}>READINESS</div>
        </div>
      </div>
      {/* Stage track */}
      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
        {stages.map(i => {
          const stageIdx = score <= 20 ? 0 : score <= 40 ? 1 : score <= 60 ? 2 : score <= 80 ? 3 : 4;
          return (
            <div key={i} style={{ width: 22, height: 4, borderRadius: 99, background: i <= stageIdx ? stageColors[stageIdx] : 'rgba(255,255,255,0.1)', transition: 'background .4s' }} />
          );
        })}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, marginTop: 6, color: stageColors[score <= 20 ? 0 : score <= 40 ? 1 : score <= 60 ? 2 : score <= 80 ? 3 : 4] }}>
        {stageLabels[score <= 20 ? 0 : score <= 40 ? 1 : score <= 60 ? 2 : score <= 80 ? 3 : 4]}
      </div>
    </div>
  );
}

/* ── Pro Welcome Banner ───────────────────────────────── */
const PRO_PERKS = [
  { icon: '💼', label: 'Exclusive Job Board', desc: '70+ curated data roles' },
  { icon: '👨‍🏫', label: '1-on-1 Instructor', desc: 'Live mock interviews' },
  { icon: '📄', label: 'Resume Review', desc: 'ATS-optimised feedback' },
  { icon: '🗺️', label: '12-Week Roadmap', desc: 'Zero to first offer' },
  { icon: '📜', label: 'Verified Certificates', desc: 'LinkedIn-ready credentials' },
  { icon: '⚡', label: 'Priority Support', desc: 'Faster answers, always' },
  { icon: '🤝', label: 'Referral Program', desc: 'Get referred by our alumni network' },
  { icon: '✉️', label: 'Cold Email to HRs', desc: 'Templates & scripts that get replies' },
];

function ProWelcomeBanner({ user, onDismiss, navigate }) {
  return (
    <div style={{ position: 'relative', marginBottom: '2rem', borderRadius: 22 }}>
      <style>{`@keyframes proShimmer{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}.pro-border-anim{background:linear-gradient(135deg,#F6D365,#E8A838,#fff5c2,#E8A838,#F6D365);background-size:300% 300%;animation:proShimmer 4s ease infinite}`}</style>
      <div className="pro-border-anim" style={{ borderRadius: 22, padding: '1.5px', boxShadow: '0 16px 60px rgba(246,211,101,0.18),0 4px 20px rgba(0,0,0,0.5)' }}>
        <div style={{ background: 'linear-gradient(145deg,#0c1e38 0%,#111827 55%,#0d1a2e 100%)', borderRadius: 21, padding: '2rem 2.2rem 1.6rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40%', right: '-5%', width: 360, height: 260, background: 'radial-gradient(ellipse,rgba(246,211,101,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />
          <button onClick={onDismiss} style={{ position: 'absolute', top: 14, right: 14, zIndex: 2, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: '1.6rem', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 52, lineHeight: 1, filter: 'drop-shadow(0 0 24px rgba(246,211,101,0.7))' }}>👑</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2, marginBottom: 6, background: 'linear-gradient(120deg,#F6D365 0%,#fde68a 45%,#E8A838 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Welcome to Pro, {user?.name?.split(' ')[0]}! 🎉</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.52)', lineHeight: 1.5 }}>Your <strong style={{ color: 'rgba(246,211,101,0.8)' }}>Pro membership</strong> is now active. Everything below is unlocked and ready for you.</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 9, marginBottom: '1.6rem', position: 'relative', zIndex: 1 }}>
            {PRO_PERKS.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(246,211,101,0.055)', border: '1px solid rgba(246,211,101,0.15)', borderRadius: 11, padding: '9px 12px' }}>
                <span style={{ fontSize: 18 }}>{p.icon}</span>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.88)', lineHeight: 1.2 }}>{p.label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <button style={{ background: 'linear-gradient(135deg,#F6D365 0%,#E8A838 100%)', color: '#0a1628', border: 'none', borderRadius: 10, padding: '9px 20px', fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 18px rgba(246,211,101,0.35)' }} onClick={() => { onDismiss(); navigate('/jobs'); }}>💼 Browse Job Board</button>
            <button style={{ background: 'transparent', color: 'rgba(246,211,101,0.7)', border: '1px solid rgba(246,211,101,0.2)', borderRadius: 10, padding: '9px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }} onClick={() => { onDismiss(); navigate('/instructor'); }}>👨‍🏫 Meet Your Mentor</button>
            <button onClick={onDismiss} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>Dismiss</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Dashboard ───────────────────────────────────── */
export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProBanner, setShowProBanner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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

  if (loading) return <div className="loading"><div className="spinner" />Loading your mentor dashboard...</div>;

  const { stats, courseProgress, readiness, mentor, nextProblems } = data || {};
  const activeDates = new Set(stats?.activeDays || []);
  const score = readiness?.score ?? 0;
  const firstName = user?.name?.split(' ')[0];

  // Trend arrow for problems this week vs last
  const weekDiff = (stats?.thisWeekSolved || 0) - (stats?.lastWeekSolved || 0);
  const weekTrend = weekDiff > 0 ? `+${weekDiff} vs last week` : weekDiff < 0 ? `${weekDiff} vs last week` : 'Same as last week';
  const weekTrendColor = weekDiff > 0 ? '#5CC8A0' : weekDiff < 0 ? '#F07B6A' : '#aaa';

  return (
    <div className="page">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .dash-fadein { animation: fadeUp .45s ease both; }
        @keyframes pulse-ring { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.15;transform:scale(1.08)} }
        .mentor-pulse { animation: pulse-ring 2.8s ease-in-out infinite; }
        @media(max-width:700px){
          .readiness-hero { flex-direction:column !important; }
          .readiness-hero > * { width:100% !important; }
          .skills-row { grid-template-columns:1fr !important; }
          .week-row { grid-template-columns:1fr 1fr !important; }
        }
      `}</style>

      {/* ── Page Header ── */}
      <div className="page-header dash-fadein" style={{ animationDelay: '0s' }}>
        <div className="page-title">👋 Welcome back, {firstName}!</div>
        <div className="page-sub">
          {stats?.daysSinceActive === 0
            ? `Active today. You're on a ${user?.streak || 0}-day streak! 🔥`
            : stats?.daysSinceActive <= 2
            ? `You practiced ${stats.daysSinceActive} day${stats.daysSinceActive > 1 ? 's' : ''} ago. Keep the momentum going!`
            : `You last practiced ${stats?.daysSinceActive || '?'} days ago. Time to get back on track!`}
        </div>
      </div>

      {showProBanner && <ProWelcomeBanner user={user} onDismiss={dismissProBanner} navigate={navigate} />}


      {/* ── READINESS HERO ── */}
      <div className="dash-fadein readiness-hero" style={{
        animationDelay: '.1s', marginBottom: '1.5rem',
        display: 'flex', gap: '1.2rem', alignItems: 'stretch',
      }}>
        {/* Dial card */}
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '1.5rem',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, minWidth: 200,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>Interview Readiness</div>
          <ReadinessDial score={score} />
          <div style={{ marginTop: '1rem', fontSize: 11.5, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5 }}>
            Based on your problems,<br />courses, quizzes & streak
          </div>
        </div>

        {/* Breakdown cards */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.9rem' }}>
          {[
            {
              icon: '✅', label: 'Problems Solved', val: stats?.totalSolved || 0,
              sub: `${stats?.thisWeekSolved || 0} this week`,
              subColor: weekTrendColor,
              subLabel: weekTrend,
              color: '#5CC8A0', bg: 'rgba(92,200,160,0.1)', border: 'rgba(92,200,160,0.2)',
              bar: Math.min((stats?.totalSolved || 0) / 30, 1), barColor: '#5CC8A0',
            },
            {
              icon: '📚', label: 'Courses Done', val: `${stats?.completedCourses || 0}/${stats?.totalCourses || 8}`,
              sub: `${courseProgress?.filter(c => c.progress_percent > 0 && c.progress_percent < 100).length || 0} in progress`,
              color: '#7F77DD', bg: 'rgba(127,119,221,0.1)', border: 'rgba(127,119,221,0.2)',
              bar: (stats?.completedCourses || 0) / (stats?.totalCourses || 8), barColor: '#7F77DD',
            },
            {
              icon: '🧠', label: 'Quiz Avg Score', val: `${stats?.avgQuizPct || 0}%`,
              sub: `${stats?.quizzesTaken || 0} quiz${stats?.quizzesTaken !== 1 ? 'zes' : ''} taken`,
              color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)',
              bar: (stats?.avgQuizPct || 0) / 100, barColor: '#38bdf8',
            },
            {
              icon: '🔥', label: 'Current Streak', val: `${user?.streak || 0} days`,
              sub: user?.streak >= 7 ? 'Excellent consistency!' : user?.streak >= 3 ? 'Good momentum' : 'Build your habit',
              color: '#F07B6A', bg: 'rgba(240,123,106,0.1)', border: 'rgba(240,123,106,0.2)',
              bar: Math.min((user?.streak || 0) / 14, 1), barColor: '#F07B6A',
            },
          ].map((s, i) => (
            <div key={i} style={{
              background: s.bg, border: `1px solid ${s.border}`,
              borderRadius: 14, padding: '1rem 1.1rem',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                <span style={{ fontSize: 16 }}>{s.icon}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1, animation: 'numberPop 0.4s ease both', animationDelay: `${i * 0.08}s` }}>{s.val}</div>
              <div style={{ fontSize: 10.5, color: s.subColor || 'var(--muted)' }}>{s.sub} {s.subLabel && <span style={{ color: s.subColor, fontSize: 10 }}>({s.subLabel})</span>}</div>
              {/* Mini progress bar */}
              <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.08)', marginTop: 6 }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${s.bar * 100}%`, background: s.barColor, transition: 'width 1s ease', boxShadow: `0 0 6px ${s.barColor}88` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PREPARATION ROADMAP ── */}
      <div className="dash-fadein card" style={{ animationDelay: '.15s', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: 8 }}>
          <div className="card-title" style={{ margin: 0 }}>🗺️ Your Journey to a Data Job</div>
          <span style={{ fontSize: 11, color: 'var(--muted)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '3px 12px' }}>
            {score}% ready
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { icon: '🌱', label: 'Just Starting', range: '0–20%', idx: 0 },
            { icon: '📚', label: 'Building Foundation', range: '21–40%', idx: 1 },
            { icon: '💪', label: 'Getting Consistent', range: '41–60%', idx: 2 },
            { icon: '🎯', label: 'Interview Prep', range: '61–80%', idx: 3 },
            { icon: '🚀', label: 'Job-Ready', range: '81–100%', idx: 4 },
          ].map((stage, i, arr) => {
            const activeIdx = score <= 20 ? 0 : score <= 40 ? 1 : score <= 60 ? 2 : score <= 80 ? 3 : 4;
            const isDone = stage.idx < activeIdx;
            const isCurrent = stage.idx === activeIdx;
            const stageC = ['#F07B6A','#F6A04A','#38bdf8','#7F77DD','#5CC8A0'][stage.idx];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: isCurrent ? 44 : 36, height: isCurrent ? 44 : 36,
                    borderRadius: '50%',
                    background: isDone ? stageC : isCurrent ? stageC : 'rgba(255,255,255,0.07)',
                    border: isCurrent ? `2px solid ${stageC}` : isDone ? 'none' : '2px solid rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isCurrent ? 20 : 16,
                    boxShadow: isCurrent ? `0 0 18px ${stageC}66` : 'none',
                    transition: 'all .4s',
                    flexShrink: 0,
                  }}>
                    {isDone ? '✓' : stage.icon}
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 72 }}>
                    <div style={{ fontSize: 10, fontWeight: isCurrent ? 800 : 600, color: isCurrent ? stageC : isDone ? 'rgba(255,255,255,0.55)' : 'var(--muted)' }}>{stage.label}</div>
                    <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 1 }}>{stage.range}</div>
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width: 32, height: 2, background: stage.idx < activeIdx ? '#5CC8A0' : 'rgba(255,255,255,0.08)', marginBottom: 28, flexShrink: 0, transition: 'background .4s', marginLeft: 2, marginRight: 2 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="section-grid">
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

          {/* Activity Heatmap */}
          <div className="card dash-fadein" style={{ animationDelay: '.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
              <div className="card-title" style={{ margin: 0 }}>📅 Practice Activity</div>
              <span style={{ fontSize: 11, color: 'var(--muted)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '2px 10px' }}>Last 13 weeks</span>
            </div>
            <ActivityHeatmap activeDates={activeDates} streak={user?.streak || 0} />
          </div>

          {/* Skill Breakdown */}
          <div className="card dash-fadein" style={{ animationDelay: '.25s' }}>
            <div className="card-title">⚡ Skill Breakdown</div>
            <div className="skills-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
              {[
                { label: 'SQL', solved: stats?.sqlSolved || 0, total: 20, color: '#4A90D9', icon: '🗄️', delay: '0s' },
                { label: 'Python', solved: stats?.pythonSolved || 0, total: 15, color: '#5CC8A0', icon: <PyLogo />, delay: '0.09s' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.9rem', animationDelay: s.delay }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>{s.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{s.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: s.color, fontWeight: 800 }}>{s.solved}/{s.total}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.07)' }}>
                    <div style={{ height: '100%', borderRadius: 99, width: `${Math.min(s.solved / s.total, 1) * 100}%`, background: s.color, transition: 'width 1s ease', boxShadow: `0 0 8px ${s.color}66` }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 5 }}>
                    {s.solved === 0 ? 'Not started yet' : s.solved < s.total * 0.4 ? 'Keep going!' : s.solved < s.total * 0.8 ? 'Great progress!' : 'Almost mastered!'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue Learning */}
          {courseProgress?.filter(c => c.progress_percent < 100 && c.progress_percent > 0).length > 0 && (
            <div className="card dash-fadein" style={{ animationDelay: '.3s' }}>
              <div className="card-title">📚 Continue Learning</div>
              {courseProgress.filter(c => c.progress_percent < 100 && c.progress_percent > 0).slice(0, 3).map(c => (
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

          {/* Your Roadmap — always visible */}
          <div className="card dash-fadein" style={{ animationDelay: '.35s' }}>
            <div className="card-title">🗺️ Your Roadmap</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { step: 1, icon: '🗄️', title: 'SQL Fundamentals',       sub: 'Joins, CTEs, Window functions',       color: '#4A90D9', done: (stats?.sqlSolved || 0) >= 5 },
                { step: 2, icon: '🐼', title: 'Python & Pandas',         sub: 'DataFrames, Groupby, EDA',            color: '#5CC8A0', done: (stats?.pythonSolved || 0) >= 5 },
                { step: 3, icon: '📊', title: 'Case Studies',            sub: 'Real company analytics problems',     color: '#E8A838', done: false },
                { step: 4, icon: '🎤', title: 'Mock Interview',          sub: 'Live 1:1 with mentor feedback',       color: '#a78bfa', done: false },
              ].map((s, i) => (
                <div key={s.step} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  {/* Line + dot */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: s.done ? s.color + '25' : 'rgba(255,255,255,0.05)', border: `1.5px solid ${s.done ? s.color : 'rgba(255,255,255,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: s.done ? 13 : 12 }}>
                      {s.done ? <span style={{ color: s.color, fontWeight: 900 }}>✓</span> : <span style={{ opacity: 0.4, fontWeight: 700, fontSize: 10 }}>{s.step}</span>}
                    </div>
                    {i < 3 && <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.07)', marginTop: 3 }} />}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, paddingBottom: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                      <span style={{ fontSize: 14 }}>{s.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: s.done ? 'rgba(255,255,255,0.5)' : '#fff' }}>{s.title}</span>
                      {s.done && <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: s.color + '18', borderRadius: 20, padding: '1px 7px' }}>Done</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card dash-fadein" style={{ animationDelay: '.4s' }}>
            <div className="card-title">⚡ Quick Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
              {[
                { icon: '💻', label: 'Solve a Problem', color: '#4A90D9', path: '/problems' },
                { icon: '⚡', label: 'Take a Quiz',     color: '#a78bfa', path: '/quiz' },
                { icon: '📚', label: 'Browse Courses',  color: '#5CC8A0', path: '/courses' },
                { icon: '🏆', label: 'Leaderboard',     color: '#E8A838', path: '/leaderboard' },
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.path)}
                  style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', borderRadius: 11, background: a.color + '10', border: `1px solid ${a.color}28`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = a.color + '20'; e.currentTarget.style.borderColor = a.color + '50'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = a.color + '10'; e.currentTarget.style.borderColor = a.color + '28'; }}>
                  <span style={{ fontSize: 18 }}>{a.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: a.color }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

          {/* This Week Progress */}
          <div className="card dash-fadein" style={{ animationDelay: '.2s' }}>
            <div className="card-title">📊 This Week's Progress</div>
            <div className="week-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.7rem', marginBottom: '0.9rem' }}>
              {[
                { label: 'Problems', val: stats?.thisWeekSolved || 0, icon: '✅', color: '#5CC8A0' },
                { label: 'Courses', val: courseProgress?.filter(c => c.progress_percent > 0).length || 0, icon: '📖', color: '#7F77DD' },
                { label: 'Active Days', val: (stats?.activeDays || []).filter(d => { const diff = (Date.now() - new Date(d + 'T12:00:00').getTime()) / 86400000; return diff <= 7; }).length, icon: '🔥', color: '#F07B6A' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 11, padding: '0.8rem', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13 }}>{weekDiff > 0 ? '📈' : weekDiff < 0 ? '📉' : '➡️'}</span>
              <span style={{ fontSize: 12, color: weekTrendColor, fontWeight: 700 }}>{weekTrend}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 2 }}>on problems solved</span>
            </div>
          </div>

          {/* Recommended Next Problems */}
          {nextProblems?.length > 0 && (
            <div className="card dash-fadein" style={{ animationDelay: '.25s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
                <div className="card-title" style={{ margin: 0 }}>🎯 Recommended For You</div>
                <button className="btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => navigate('/problems')}>View All</button>
              </div>
              {nextProblems.map((p, i) => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '9px 0', borderBottom: i < nextProblems.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: p.difficulty === 'Easy' ? 'rgba(92,200,160,0.15)' : p.difficulty === 'Medium' ? 'rgba(246,160,74,0.15)' : 'rgba(240,123,106,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  }}>
                    {p.topic === 'SQL' ? '🗄️' : <PyLogo />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 12.5, marginBottom: 2 }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      <span style={{ color: p.difficulty === 'Easy' ? '#5CC8A0' : p.difficulty === 'Medium' ? '#F6A04A' : '#F07B6A', fontWeight: 700 }}>{p.difficulty}</span>
                      {' · '}{p.topic}{' · '}+{p.xp_reward} XP
                    </div>
                  </div>
                  <button className="btn-secondary" style={{ fontSize: 11, padding: '5px 10px' }} onClick={() => navigate('/problems')}>Solve →</button>
                </div>
              ))}
            </div>
          )}

          {/* Quick Stats */}
          <div className="card dash-fadein" style={{ animationDelay: '.3s' }}>
            <div className="card-title">🏆 My Stats</div>
            <div style={{ display: 'grid', gap: 7 }}>
              {[
                { label: 'Total XP Earned', val: (user?.xp || 0).toLocaleString() + ' XP', icon: '⭐' },
                { label: 'Leaderboard Rank', val: '#' + (stats?.rank || '—'), icon: '🏆' },
                { label: 'Quizzes Completed', val: stats?.quizzesTaken || 0, icon: '📝' },
                { label: 'Courses Completed', val: stats?.completedCourses || 0, icon: '🎓' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}><span>{s.icon}</span>{s.label}</span>
                  <span style={{ fontWeight: 800, color: 'var(--text)' }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA: Book session (non-pro) or Go Pro */}
          {!user?.is_premium ? (
            <div className="card dash-fadein" style={{ animationDelay: '.35s', background: 'linear-gradient(135deg, rgba(127,119,221,0.10) 0%, rgba(74,144,217,0.10) 100%)', border: '1px solid rgba(127,119,221,0.22)' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>👑</div>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>Unlock Full Mentorship</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: '0.9rem' }}>
                Get 1-on-1 sessions, mock interviews, resume review, and a personalised 12-week roadmap to land your first data job.
              </div>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }} onClick={() => navigate('/premium')}>
                Upgrade to Pro →
              </button>
            </div>
          ) : (
            <div className="card dash-fadein" style={{ animationDelay: '.35s', background: 'linear-gradient(135deg, rgba(92,200,160,0.08) 0%, rgba(74,144,217,0.08) 100%)', border: '1px solid rgba(92,200,160,0.2)' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>🎤</div>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>Ready for a Mock Interview?</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: '0.9rem' }}>
                You're at {score}% readiness. A live mock interview with your mentor will pinpoint your gaps and boost your confidence.
              </div>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }} onClick={() => navigate('/help')}>
                Book Mock Interview →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
