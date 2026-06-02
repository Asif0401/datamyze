import { useEffect, useState, useRef } from 'react';
import api from '../hooks/useApi';

const TABS = ['Overview', 'Users', 'Payments', 'Courses', 'Problems', 'Submissions', 'Activity', 'Instructor'];

const STAT_COLORS = {
  blue:   { bg: 'rgba(74,144,217,0.14)',  border: 'rgba(74,144,217,0.35)',  text: '#4A90D9',  glow: 'rgba(74,144,217,0.20)' },
  teal:   { bg: 'rgba(92,200,160,0.12)',  border: 'rgba(92,200,160,0.30)',  text: '#5CC8A0',  glow: 'rgba(92,200,160,0.15)' },
  amber:  { bg: 'rgba(232,168,56,0.12)',  border: 'rgba(232,168,56,0.30)',  text: '#E8A838',  glow: 'rgba(232,168,56,0.15)' },
  coral:  { bg: 'rgba(240,123,106,0.12)', border: 'rgba(240,123,106,0.30)', text: '#F07B6A',  glow: 'rgba(240,123,106,0.15)' },
  sky:    { bg: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.30)',  text: '#38bdf8',  glow: 'rgba(56,189,248,0.15)' },
  purple: { bg: 'rgba(168,139,250,0.12)', border: 'rgba(168,139,250,0.30)', text: '#a78bfa',  glow: 'rgba(168,139,250,0.15)' },
};

function StatCard({ icon, label, value, sub, accent = 'blue' }) {
  const c = STAT_COLORS[accent] || STAT_COLORS.blue;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.055)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      border: `1px solid rgba(255,255,255,0.10)`,
      borderRadius: 16,
      padding: '1.3rem',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.22s, box-shadow 0.22s',
      cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${c.glow}`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Accent strip */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${c.text}, transparent)` }} />

      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: c.bg, border: `1px solid ${c.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, marginBottom: '0.7rem',
      }}>{icon}</div>

      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function Table({ cols, rows, empty = 'No data yet.' }) {
  if (!rows?.length) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.30)' }}>
      <div style={{ fontSize: 36, marginBottom: '0.8rem' }}>📭</div>
      {empty}
    </div>
  );
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table" style={{ minWidth: 600 }}>
        <thead><tr>{cols.map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {cols.map(c => (
                <td key={c.key}>{c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ text, type }) {
  const styles = {
    easy:     { bg: 'rgba(92,200,160,0.15)',   color: '#5CC8A0',  border: 'rgba(92,200,160,0.25)'   },
    medium:   { bg: 'rgba(232,168,56,0.15)',   color: '#E8A838',  border: 'rgba(232,168,56,0.25)'   },
    hard:     { bg: 'rgba(240,123,106,0.15)',  color: '#F07B6A',  border: 'rgba(240,123,106,0.25)'  },
    accepted: { bg: 'rgba(92,200,160,0.15)',   color: '#5CC8A0',  border: 'rgba(92,200,160,0.25)'   },
    wrong:    { bg: 'rgba(240,123,106,0.15)',  color: '#F07B6A',  border: 'rgba(240,123,106,0.25)'  },
    sql:      { bg: 'rgba(74,144,217,0.15)',   color: '#4A90D9',  border: 'rgba(74,144,217,0.25)'   },
    python:   { bg: 'rgba(92,200,160,0.15)',   color: '#5CC8A0',  border: 'rgba(92,200,160,0.25)'   },
    beginner: { bg: 'rgba(92,200,160,0.15)',   color: '#5CC8A0',  border: 'rgba(92,200,160,0.25)'   },
    intermediate: { bg: 'rgba(232,168,56,0.15)', color: '#E8A838', border: 'rgba(232,168,56,0.25)'  },
    advanced: { bg: 'rgba(240,123,106,0.15)',  color: '#F07B6A',  border: 'rgba(240,123,106,0.25)'  },
  };
  const s = styles[type?.toLowerCase()] || styles.sql;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: 11, fontWeight: 700, padding: '3px 9px',
      borderRadius: 20, display: 'inline-block',
    }}>{text}</span>
  );
}

function OverviewTab({ data }) {
  if (!data) return <div className="loading"><div className="spinner" />Loading...</div>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
      <StatCard icon="👥" label="Total Users"         value={data.totalUsers}        accent="blue"   sub="registered accounts" />
      <StatCard icon="✅" label="Problems Solved"     value={data.totalSolved}       accent="teal"   sub="accepted submissions" />
      <StatCard icon="📚" label="Course Enrollments"  value={data.totalEnrollments}  accent="amber"  sub="across all courses" />
      <StatCard icon="🧠" label="Quiz Attempts"       value={data.totalQuizAttempts} accent="coral"  sub="quiz sessions played" />
      <StatCard icon="🎓" label="Certificates Issued" value={data.totalCerts}        accent="sky"    sub="course completions" />
      <StatCard icon="⭐" label="Total XP Earned"     value={(data.totalXP || 0).toLocaleString()} accent="amber" sub="across all users" />
    </div>
  );
}

function UsersTab({ data }) {
  const [search, setSearch] = useState('');
  const filtered = (data?.users || []).filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          placeholder="🔍  Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
          {filtered.length} user{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>
      <Table
        cols={[
          { key: 'name',  label: 'Name', render: (v, row) => {
            // Phone-signup users have email like phone_9177133236@datamyze.in
            const phoneFromEmail = row.email?.startsWith('phone_')
              ? row.email.replace('phone_', '').split('@')[0]
              : null;
            const phone = row.phone || phoneFromEmail;
            const displayEmail = row.email?.startsWith('phone_') ? null : row.email;
            return (
              <div>
                <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{v}</div>
                {displayEmail && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)' }}>{displayEmail}</div>}
                {phone && <div style={{ fontSize: 11, color: 'rgba(92,200,160,0.7)' }}>📱 {phone}</div>}
              </div>
            );
          }},
          { key: 'is_premium', label: 'Plan', render: (v, row) => {
            const isPro = v === 1 || row.role === 'admin';
            return (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                background: isPro ? 'rgba(232,168,56,0.18)' : 'rgba(255,255,255,0.07)',
                color: isPro ? '#E8A838' : 'rgba(255,255,255,0.45)',
                border: `1px solid ${isPro ? 'rgba(232,168,56,0.35)' : 'rgba(255,255,255,0.10)'}`,
              }}>
                {row.role === 'admin' ? '🛡 Admin' : isPro ? '⭐ Pro' : 'Free'}
              </span>
            );
          }},
          { key: 'profile_completed', label: 'Profile', render: (v, row) => {
            // treat NULL or 0 the same — NULL happens in Turso for rows pre-dating the column
            const done = v === 1 || v === true;
            return (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                background: done ? 'rgba(92,200,160,0.15)' : 'rgba(240,123,106,0.12)',
                color: done ? '#5CC8A0' : '#F07B6A',
                border: `1px solid ${done ? 'rgba(92,200,160,0.25)' : 'rgba(240,123,106,0.20)'}`,
              }}>
                {done ? '✓ Complete' : '✗ Incomplete'}
              </span>
            );
          }},
          { key: 'phone', label: 'Phone', render: (v, row) => {
            const phoneFromEmail = row.email?.startsWith('phone_')
              ? row.email.replace('phone_', '').split('@')[0] : null;
            const display = v || phoneFromEmail;
            return display
              ? <span style={{ fontSize: 12, color: '#5CC8A0', fontFamily: 'monospace' }}>{display}</span>
              : <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>—</span>;
          }},
          { key: 'created_at', label: 'Joined', render: v => v ? (
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              {new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          ) : '—' },
          { key: 'xp',               label: 'XP',      render: v => <strong style={{ color: '#4A90D9' }}>{(v||0).toLocaleString()}</strong> },
          { key: 'streak',           label: 'Streak',  render: v => v ? `🔥 ${v}d` : '—' },
          { key: 'problems_solved',  label: 'Solved',  render: v => <Badge text={`${v}`} type="accepted" /> },
          { key: 'courses_enrolled', label: 'Courses', render: v => v || 0 },
          { key: 'last_active',      label: 'Last Active', render: v => v ? new Date(v).toLocaleDateString('en-IN') : 'Never' },
        ]}
        rows={filtered}
        empty="No users have signed up yet."
      />
    </div>
  );
}

function CoursesTab({ data }) {
  return (
    <Table
      cols={[
        { key: 'icon',        label: '',          render: v => <span style={{ fontSize: 22 }}>{v}</span> },
        { key: 'title',       label: 'Course',    render: v => <strong style={{ color: '#e2e8f0' }}>{v}</strong> },
        { key: 'difficulty',  label: 'Level',     render: v => <Badge text={v} type={v?.toLowerCase()} /> },
        { key: 'enrollments', label: 'Enrolled',  render: v => <strong style={{ color: '#4A90D9' }}>{v}</strong> },
        { key: 'completions', label: 'Completed', render: (v, row) => row.enrollments > 0 ? `${v} (${Math.round(v/row.enrollments*100)}%)` : '0' },
        { key: 'lesson_count',label: 'Lessons' },
        { key: 'duration',    label: 'Duration' },
      ]}
      rows={data?.courses || []}
      empty="No courses found."
    />
  );
}

function ProblemsTab({ data }) {
  return (
    <Table
      cols={[
        { key: 'title',          label: 'Problem',    render: v => <strong style={{ color: '#e2e8f0' }}>{v}</strong> },
        { key: 'topic',          label: 'Topic',      render: v => <Badge text={v} type={v?.toLowerCase()} /> },
        { key: 'difficulty',     label: 'Difficulty', render: v => <Badge text={v} type={v?.toLowerCase()} /> },
        { key: 'total_attempts', label: 'Attempts',   render: v => v || 0 },
        { key: 'accepted',       label: 'Accepted',   render: (v, row) => {
          const pct = row.total_attempts > 0 ? Math.round(v / row.total_attempts * 100) : 0;
          return <span style={{ color: '#5CC8A0', fontWeight: 700 }}>{v} <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>({pct}%)</span></span>;
        }},
        { key: 'xp_reward',      label: 'XP',         render: v => <span style={{ color: '#E8A838', fontWeight: 700 }}>+{v}</span> },
      ]}
      rows={data?.problems || []}
      empty="No problems attempted yet."
    />
  );
}

function SubmissionsTab({ data }) {
  const [filter, setFilter] = useState('All');
  const rows = (data?.submissions || []).filter(s => filter === 'All' || s.status === filter);
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        {['All', 'accepted', 'wrong_answer'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={filter === f ? 'filter-chip active' : 'filter-chip'}>
            {f === 'All' ? 'All' : f === 'accepted' ? '✅ Accepted' : '❌ Wrong Answer'}
          </button>
        ))}
      </div>
      <Table
        cols={[
          { key: 'user_name',     label: 'User',       render: (v, row) => <div><div style={{ fontWeight: 600, color: '#e2e8f0' }}>{v}</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{row.user_email}</div></div> },
          { key: 'problem_title', label: 'Problem',    render: v => <span style={{ fontWeight: 600, color: '#4A90D9' }}>{v}</span> },
          { key: 'topic',         label: 'Topic',      render: v => <Badge text={v} type={v?.toLowerCase()} /> },
          { key: 'difficulty',    label: 'Difficulty', render: v => <Badge text={v} type={v?.toLowerCase()} /> },
          { key: 'status',        label: 'Status',     render: v => <Badge text={v === 'accepted' ? '✅ Accepted' : '❌ Wrong'} type={v === 'accepted' ? 'accepted' : 'wrong'} /> },
          { key: 'submitted_at',  label: 'Time',       render: v => <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{v ? new Date(v).toLocaleString('en-IN') : '—'}</span> },
        ]}
        rows={rows}
        empty="No submissions yet."
      />
    </div>
  );
}

function ActivityTab({ data }) {
  const rows = data?.activity || [];
  const max = Math.max(...rows.map(r => r.active_users), 1);
  return (
    <div>
      <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: 15, color: '#fff' }}>Daily Active Users · Last 30 Days</div>
      {rows.length === 0
        ? <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.30)' }}>No activity recorded yet. Activity is logged on each login.</div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {rows.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 90, fontSize: 12, color: 'rgba(255,255,255,0.40)', flexShrink: 0 }}>{r.date}</div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 22, position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{
                    width: `${Math.round(r.active_users / max * 100)}%`,
                    background: 'linear-gradient(90deg, #4A90D9, #38bdf8)',
                    height: '100%', borderRadius: 4, minWidth: 4,
                    transition: 'width .5s ease',
                    boxShadow: '0 0 8px rgba(74,144,217,0.4)',
                  }} />
                </div>
                <div style={{ width: 28, fontSize: 12, fontWeight: 700, color: '#4A90D9', textAlign: 'right', flexShrink: 0 }}>{r.active_users}</div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

/* ── Payments Tab ────────────────────────────────────── */
function PaymentsTab({ data, reload }) {
  const { payments = [], stats = {} } = data || {};
  const [acting, setActing] = useState(null);
  const [toast, setToast] = useState('');
  const [receiptModal, setReceiptModal] = useState(null); // { filename, originalname }

  async function activate(subId) {
    setActing(subId);
    try {
      await api.post(`/admin/payments/${subId}/activate`);
      setToast('✅ Premium activated! User can now access all features.');
      reload();
    } catch (e) { setToast('❌ Error: ' + (e.response?.data?.error || 'Something went wrong')); }
    finally { setActing(null); setTimeout(() => setToast(''), 4000); }
  }

  async function reject(subId) {
    setActing(subId);
    try {
      await api.post(`/admin/payments/${subId}/reject`);
      setToast('Payment marked as rejected.');
      reload();
    } catch (e) { setToast('❌ Error'); }
    finally { setActing(null); setTimeout(() => setToast(''), 4000); }
  }

  const statCards = [
    { label: 'Total Submissions', val: stats.total || 0,    color: '#4A90D9', icon: '📋' },
    { label: 'Pending Review',    val: stats.pending || 0,  color: '#E8A838', icon: '⏳' },
    { label: 'Active / Approved', val: stats.active || 0,   color: '#5CC8A0', icon: '✅' },
    { label: 'Total Revenue',     val: `₹${stats.revenue || 0}`, color: '#a78bfa', icon: '💰' },
  ];

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'rgba(30,41,59,0.97)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 20px', color: '#e2e8f0', fontSize: 14, fontWeight: 600, zIndex: 9999, backdropFilter: 'blur(12px)' }}>
          {toast}
        </div>
      )}

      {/* Receipt lightbox */}
      {receiptModal && (
        <div onClick={() => setReceiptModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, padding: '1.5rem', maxWidth: 620, width: '90%', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>📷 Payment Receipt</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`http://localhost:5000/api/premium/receipt/file/${receiptModal.filename}`} download={receiptModal.originalname} target="_blank" rel="noreferrer"
                  style={{ background: 'rgba(74,144,217,0.20)', border: '1px solid rgba(74,144,217,0.35)', color: '#4A90D9', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                  ⬇️ Download
                </a>
                <button onClick={() => setReceiptModal(null)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 14 }}>✕</button>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: '1rem' }}>
              {receiptModal.originalname}
            </div>
            {/\.(jpg|jpeg|png|webp|heic)$/i.test(receiptModal.filename) ? (
              <img src={`http://localhost:5000/api/premium/receipt/file/${receiptModal.filename}`} alt="receipt"
                style={{ width: '100%', maxHeight: 500, objectFit: 'contain', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.40)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
                <div>PDF receipt. Click Download to view.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {statCards.map(s => (
          <div key={s.label} style={{ background: `${s.color}12`, border: `1px solid ${s.color}30`, borderRadius: 14, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Payments table */}
      <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: '1rem' }}>
        Payment Submissions
        {stats.pending > 0 && (
          <span style={{ marginLeft: 10, background: 'rgba(232,168,56,0.20)', border: '1px solid rgba(232,168,56,0.40)', color: '#E8A838', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
            {stats.pending} pending
          </span>
        )}
      </div>

      {payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.25)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
          No payment submissions yet
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 750 }}>
            <thead>
              <tr>
                {['User', 'Email', 'UTR / Transaction ID', 'Amount', 'Status', 'Submitted', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map(p => {
                const statusColor = p.status === 'active' ? '#5CC8A0' : p.status === 'rejected' ? '#F07B6A' : '#E8A838';
                const statusBg    = p.status === 'active' ? 'rgba(92,200,160,0.15)' : p.status === 'rejected' ? 'rgba(240,123,106,0.15)' : 'rgba(232,168,56,0.15)';
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{p.user_name}</td>
                    <td style={{ color: 'rgba(255,255,255,0.50)', fontSize: 12 }}>{p.user_email}</td>
                    <td>
                      <code style={{ background: 'rgba(0,0,0,0.30)', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#4A90D9' }}>
                        {p.utr_number || '—'}
                      </code>
                    </td>
                    <td style={{ fontWeight: 700, color: '#5CC8A0' }}>₹{p.amount}</td>
                    <td>
                      <span style={{ background: statusBg, color: statusColor, border: `1px solid ${statusColor}40`, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {/* Receipt button — always show if available */}
                        {p.receipt_filename && (
                          <button
                            onClick={() => setReceiptModal({ filename: p.receipt_filename, originalname: p.receipt_original || p.receipt_filename })}
                            style={{ background: 'rgba(74,144,217,0.15)', border: '1px solid rgba(74,144,217,0.30)', color: '#4A90D9', borderRadius: 8, padding: '4px 10px', fontWeight: 600, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            📷 View Receipt
                          </button>
                        )}
                        {p.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => activate(p.id)}
                              disabled={acting === p.id}
                              style={{ background: 'rgba(92,200,160,0.20)', border: '1px solid rgba(92,200,160,0.40)', color: '#5CC8A0', borderRadius: 8, padding: '5px 12px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                              {acting === p.id ? '...' : '✅ Activate'}
                            </button>
                            <button
                              onClick={() => reject(p.id)}
                              disabled={acting === p.id}
                              style={{ background: 'rgba(240,123,106,0.15)', border: '1px solid rgba(240,123,106,0.35)', color: '#F07B6A', borderRadius: 8, padding: '5px 12px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                              ✕ Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
                            {p.status === 'active' ? '✅ Activated' : '✕ Rejected'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Instructor Profile Tab
───────────────────────────────────────────── */
function InstructorTab() {
  const [profile, setProfile] = useState({ name: '', title: '', bio: '', location: '', linkedin_url: '', github_url: '' });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    api.get('/admin/instructor').then(r => {
      const d = r.data;
      setProfile({ name: d.name || '', title: d.title || '', bio: d.bio || '', location: d.location || '', linkedin_url: d.linkedin_url || '', github_url: d.github_url || '' });
      if (d.photo_url) setPhotoPreview(d.photo_url + '?t=' + Date.now());
    }).catch(() => {});
  }, []);

  function handleFileChange(f) {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setToast('File must be under 5MB'); return; }
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  }

  async function uploadPhoto() {
    if (!photoFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', photoFile);
      const r = await api.post('/admin/instructor/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPhotoPreview(r.data.photo_url + '?t=' + Date.now());
      setPhotoFile(null);
      showToast('✅ Photo uploaded successfully!');
    } catch (e) { showToast('❌ Upload failed'); }
    finally { setUploading(false); }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      await api.put('/admin/instructor', profile);
      showToast('✅ Profile saved!');
    } catch (e) { showToast('❌ Save failed'); }
    finally { setSaving(false); }
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3500); }

  const initials = profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'AK';

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ fontWeight: 800, fontSize: 18, marginBottom: '0.4rem' }}>Instructor Profile</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', marginBottom: '2rem' }}>This information appears on the Instructor page visible to all students.</div>

      {/* Photo section */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>Profile Photo</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Avatar preview */}
          <div style={{ flexShrink: 0 }}>
            {photoPreview
              ? <img src={photoPreview} alt="Instructor" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(127,119,221,0.5)' }} onError={() => setPhotoPreview(null)} />
              : <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg,#7F77DD,#4A90D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#fff', border: '3px solid rgba(127,119,221,0.5)' }}>{initials}</div>
            }
          </div>

          {/* Upload controls */}
          <div style={{ flex: 1 }}>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(127,119,221,0.6)'; }}
              onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; handleFileChange(e.dataTransfer.files[0]); }}
              style={{ padding: '14px 20px', border: '1.5px dashed rgba(255,255,255,0.15)', borderRadius: 12, textAlign: 'center', cursor: 'pointer', background: 'rgba(127,119,221,0.04)', transition: 'border-color 0.15s', marginBottom: 10 }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>📷</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
                {photoFile ? `Selected: ${photoFile.name}` : 'Click or drag to upload photo'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 3 }}>JPG, PNG, WEBP · Max 5MB</div>
            </div>
            <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp,.heic" style={{ display: 'none' }} onChange={e => handleFileChange(e.target.files[0])} />
            {photoFile && (
              <button className="btn-primary" onClick={uploadPhoto} disabled={uploading} style={{ fontSize: 13, padding: '8px 20px' }}>
                {uploading ? '⬆️ Uploading…' : '⬆️ Upload Photo'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>Profile Info</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { key: 'name',        label: 'Full Name',    placeholder: 'Asif Khan' },
            { key: 'title',       label: 'Title / Role', placeholder: 'Lead Mentor · Data Scientist' },
            { key: 'location',    label: 'Location',     placeholder: 'Mumbai, India' },
            { key: 'linkedin_url',label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
            { key: 'github_url',  label: 'GitHub URL',   placeholder: 'https://github.com/...' },
          ].map(f => (
            <div key={f.key} className="field" style={{ textAlign: 'left', marginBottom: 0 }}>
              <label style={{ fontSize: 12 }}>{f.label}</label>
              <input
                value={profile[f.key] || ''}
                onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                style={{ fontSize: 13 }}
              />
            </div>
          ))}
        </div>
        <div className="field" style={{ textAlign: 'left', marginTop: '1rem', marginBottom: 0 }}>
          <label style={{ fontSize: 12 }}>Bio</label>
          <textarea
            value={profile.bio || ''}
            onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
            placeholder="Write a short bio about yourself..."
            rows={4}
            style={{ fontSize: 13, resize: 'vertical', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 14px', color: '#fff', width: '100%', fontFamily: 'inherit' }}
          />
        </div>
        <button className="btn-gold" onClick={saveProfile} disabled={saving} style={{ marginTop: '1.2rem', fontSize: 13, padding: '10px 24px' }}>
          {saving ? 'Saving…' : '💾 Save Profile'}
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('Overview');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [overview, users, courses, problems, submissions, activity, payments] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/users'),
        api.get('/admin/courses'),
        api.get('/admin/problems'),
        api.get('/admin/submissions'),
        api.get('/admin/activity'),
        api.get('/admin/payments'),
      ]);
      setData({ overview: overview.data, users: users.data, courses: courses.data, problems: problems.data, submissions: submissions.data, activity: activity.data, payments: payments.data });
      setLastRefresh(new Date());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">🛠 Admin Dashboard</div>
          <div className="page-sub">Live view of all platform data</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {lastRefresh && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.30)' }}>Last updated: {lastRefresh.toLocaleTimeString()}</span>}
          <button className="btn-secondary" onClick={loadAll} style={{ fontSize: 12 }}>🔄 Refresh</button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '9px 16px',
            background: tab === t ? 'rgba(74,144,217,0.12)' : 'none',
            borderRadius: '8px 8px 0 0',
            fontWeight: 600, fontSize: 13,
            color: tab === t ? '#4A90D9' : 'rgba(255,255,255,0.35)',
            borderBottom: tab === t ? '2px solid #4A90D9' : '2px solid transparent',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
          }}>
            {t}
          </button>
        ))}
      </div>

      {loading
        ? <div className="loading"><div className="spinner" />Loading data...</div>
        : (
          <div className="card">
            {tab === 'Overview'    && <OverviewTab    data={data.overview} />}
            {tab === 'Users'       && <UsersTab       data={data.users} />}
            {tab === 'Payments'    && <PaymentsTab    data={data.payments} reload={loadAll} />}
            {tab === 'Courses'     && <CoursesTab     data={data.courses} />}
            {tab === 'Problems'    && <ProblemsTab    data={data.problems} />}
            {tab === 'Submissions' && <SubmissionsTab data={data.submissions} />}
            {tab === 'Activity'    && <ActivityTab    data={data.activity} />}
            {tab === 'Instructor'  && <InstructorTab />}
          </div>
        )
      }
    </div>
  );
}
