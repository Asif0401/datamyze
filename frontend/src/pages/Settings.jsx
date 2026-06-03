import { useState, useEffect, useRef } from 'react';
import api from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const AVATAR_COLORS = [
  { label: 'Blue',   value: '#4A90D9' },
  { label: 'Teal',   value: '#5CC8A0' },
  { label: 'Purple', value: '#a78bfa' },
  { label: 'Orange', value: '#E97627' },
  { label: 'Coral',  value: '#F07B6A' },
  { label: 'Amber',  value: '#E8A838' },
  { label: 'Sky',    value: '#38bdf8' },
  { label: 'Pink',   value: '#ec4899' },
];

const EXPERIENCE_OPTIONS = [
  '< 1 year', '1–2 years', '2–3 years', '3–5 years',
  '5–7 years', '7–10 years', '10+ years',
];

const TARGET_ROLES = [
  'Data Analyst', 'Senior Data Analyst', 'Data Scientist',
  'Business Analyst', 'Data Engineer', 'BI Developer',
  'ML Engineer', 'Product Analyst', 'Financial Analyst', 'Other',
];

/* ── Toast ─────────────────────────────────────────────── */
function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: type === 'error' ? 'rgba(240,123,106,0.14)' : 'rgba(92,200,160,0.14)',
      border: `1px solid ${type === 'error' ? '#F07B6A' : '#5CC8A0'}`,
      color: type === 'error' ? '#F07B6A' : '#5CC8A0',
      padding: '12px 22px', borderRadius: 10, fontSize: 14, fontWeight: 600,
      backdropFilter: 'blur(14px)', boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {type === 'error' ? '⚠️' : '✅'} {msg}
    </div>
  );
}

/* ── Password strength ─────────────────────────────────── */
function StrengthBar({ password }) {
  if (!password) return null;
  let s = 0;
  if (password.length >= 8)           s++;
  if (/[A-Z]/.test(password))         s++;
  if (/[0-9]/.test(password))         s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  const colors = ['#F07B6A', '#E8A838', '#5CC8A0', '#4A90D9'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2, transition: 'all .3s',
            background: i < s ? colors[s - 1] : 'rgba(255,255,255,0.1)',
          }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: s > 0 ? colors[s - 1] : 'var(--muted)' }}>
        {s > 0 ? labels[s - 1] : 'Too short'}
      </span>
    </div>
  );
}

/* ── Shared styles ─────────────────────────────────────── */
const INPUT = {
  width: '100%', background: 'rgba(20,27,56,0.88)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
  padding: '10px 14px', color: 'var(--text)', fontSize: 14,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};
const LABEL = {
  fontSize: 11, color: 'var(--muted)', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '.06em',
  marginBottom: 6, display: 'block',
};
const FIELD = { marginBottom: '1.25rem' };
const GRID2  = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };
const CARD   = {
  background: 'rgba(20,27,56,0.88)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 16, padding: '2rem',
  backdropFilter: 'blur(18px)',
};

/* ══════════════════════════════════════════════════════ */
export default function Settings() {
  const { user, refreshUser } = useAuth();
  const fileRef = useRef(null);

  const [tab,       setTab]       = useState('personal');
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast,     setToast]     = useState({ msg: '', type: '' });
  const [avatarHover, setAvatarHover] = useState(false);

  /* ── personal ── */
  const [name,        setName]        = useState('');
  const [phone,       setPhone]       = useState('');
  const [bio,         setBio]         = useState('');
  const [location,    setLocation]    = useState('');
  const [website,     setWebsite]     = useState('');
  const [avatarColor, setAvatarColor] = useState('#4A90D9');

  /* ── professional ── */
  const [jobTitle,   setJobTitle]   = useState('');
  const [company,    setCompany]    = useState('');
  const [linkedin,   setLinkedin]   = useState('');
  const [github,     setGithub]     = useState('');
  const [expYears,   setExpYears]   = useState('');
  const [skills,     setSkills]     = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [education,  setEducation]  = useState('');
  const [targetRole, setTargetRole] = useState('');

  /* ── security ── */
  const [curPwd,  setCurPwd]  = useState('');
  const [newPwd,  setNewPwd]  = useState('');
  const [confPwd, setConfPwd] = useState('');

  /* ── hydrate ── */
  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setPhone(user.phone || '');
    setBio(user.bio || '');
    setLocation(user.location || '');
    setWebsite(user.website || '');
    setAvatarColor(user.avatar_color || '#4A90D9');
    setJobTitle(user.job_title || '');
    setCompany(user.company || '');
    setLinkedin(user.linkedin_url || '');
    setGithub(user.github_url || '');
    setExpYears(user.experience_years || '');
    try { setSkills(JSON.parse(user.skills || '[]')); } catch { setSkills([]); }
    setEducation(user.education || '');
    setTargetRole(user.target_role || '');
  }, [user]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3200);
  };

  /* ── avatar upload ── */
  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { showToast('Image must be under 3 MB', 'error'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      await api.post('/auth/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshUser();
      showToast('Profile picture updated!');
    } catch (e) {
      showToast(e.response?.data?.error || 'Upload failed', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function removeAvatar() {
    try {
      await api.delete('/auth/avatar');
      await refreshUser();
      showToast('Profile picture removed');
    } catch {
      showToast('Failed to remove picture', 'error');
    }
  }

  /* ── skill helpers ── */
  function onSkillKey(e) {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      const s = skillInput.trim().replace(/,$/, '');
      if (s && !skills.includes(s) && skills.length < 25)
        setSkills(prev => [...prev, s]);
      setSkillInput('');
    }
    if (e.key === 'Backspace' && !skillInput && skills.length > 0)
      setSkills(prev => prev.slice(0, -1));
  }

  /* ── save handlers ── */
  async function savePersonal() {
    setSaving(true);
    try {
      await api.patch('/auth/profile', {
        name, phone, bio, location, website, avatar_color: avatarColor,
      });
      await refreshUser();
      showToast('Personal info saved!');
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to save', 'error');
    } finally { setSaving(false); }
  }

  async function saveProfessional() {
    setSaving(true);
    try {
      await api.patch('/auth/profile', {
        job_title: jobTitle, company,
        linkedin_url: linkedin, github_url: github,
        experience_years: expYears,
        skills: JSON.stringify(skills),
        education, target_role: targetRole,
      });
      await refreshUser();
      showToast('Professional profile saved!');
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to save', 'error');
    } finally { setSaving(false); }
  }

  async function savePassword() {
    if (newPwd !== confPwd)  { showToast('Passwords do not match', 'error'); return; }
    if (newPwd.length < 8)   { showToast('Password must be at least 8 characters', 'error'); return; }
    setSaving(true);
    try {
      await api.patch('/auth/password', { current_password: curPwd, new_password: newPwd });
      setCurPwd(''); setNewPwd(''); setConfPwd('');
      showToast('Password changed successfully!');
    } catch (e) {
      showToast(e.response?.data?.error || 'Incorrect current password', 'error');
    } finally { setSaving(false); }
  }

  const initials   = name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';
  const avatarSrc  = user?.avatar_url ? `/uploads/avatars/${user.avatar_url}` : null;

  const TABS = [
    { id: 'personal',     label: '👤 Personal' },
    { id: 'professional', label: '💼 Professional' },
    { id: 'security',     label: '🔒 Security' },
  ];

  /* ── render ── */
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">⚙️ Settings</div>
        <div className="page-sub">Manage your personal and professional profile</div>
      </div>

      {/* ── Profile banner ── */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', alignItems: 'stretch', flexWrap: 'wrap' }}>

        {/* Avatar card */}
        <div style={{ ...CARD, flex: '0 0 auto', textAlign: 'center', minWidth: 180, padding: '1.75rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>

          {/* Avatar with camera overlay */}
          <div
            style={{ position: 'relative', width: 84, height: 84, cursor: 'pointer' }}
            onMouseEnter={() => setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}
            onClick={() => !uploading && fileRef.current?.click()}
            title="Click to upload photo"
          >
            {/* Circle */}
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Profile"
                style={{
                  width: 84, height: 84, borderRadius: '50%', objectFit: 'cover',
                  boxShadow: `0 0 0 3px ${avatarColor}66`,
                  display: 'block',
                }}
              />
            ) : (
              <div style={{
                width: 84, height: 84, borderRadius: '50%',
                background: avatarColor,
                boxShadow: `0 0 0 3px ${avatarColor}55, 0 0 20px ${avatarColor}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 30, fontWeight: 800, color: 'white', letterSpacing: '-1px',
                transition: 'all .3s',
              }}>{initials}</div>
            )}

            {/* Camera overlay on hover */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(0,0,0,0.52)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              opacity: avatarHover || uploading ? 1 : 0,
              transition: 'opacity .2s',
              gap: 3,
            }}>
              {uploading ? (
                <div style={{ width: 20, height: 20, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  <span style={{ fontSize: 9, color: 'white', fontWeight: 700, letterSpacing: '.04em' }}>CHANGE</span>
                </>
              )}
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />

          <div style={{ fontWeight: 700, fontSize: 15 }}>{name || '—'}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{jobTitle || 'Data Enthusiast'}</div>

          {user?.is_premium === 1 && (
            <span style={{
              background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)',
              color: '#a78bfa', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            }}>👑 Pro</span>
          )}

          {/* Remove photo button */}
          {avatarSrc && (
            <button onClick={removeAvatar} style={{
              background: 'rgba(240,123,106,0.1)', border: '1px solid rgba(240,123,106,0.25)',
              color: '#F07B6A', borderRadius: 8, padding: '5px 12px', fontSize: 11,
              cursor: 'pointer', fontWeight: 600, marginTop: 2,
            }}>✕ Remove photo</button>
          )}

          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
            JPG, PNG, WEBP · max 3 MB
          </div>
        </div>

        {/* Stats + bio */}
        <div style={{ ...CARD, flex: 1, minWidth: 260 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem', textAlign: 'center',
            paddingBottom: bio || skills.length > 0 ? '1rem' : 0,
            borderBottom: bio || skills.length > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
          }}>
            {[
              { label: 'XP Earned',    value: (user?.xp || 0).toLocaleString(), color: '#E8A838' },
              { label: 'Day Streak',   value: `🔥 ${user?.streak || 0}`,         color: '#F07B6A' },
              { label: 'Member Since', value: user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : '—', color: '#5CC8A0' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, marginBottom: 3 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {bio
            ? <p style={{ margin: '1rem 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.65 }}>{bio}</p>
            : <p style={{ margin: '1rem 0 0', fontSize: 13, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', lineHeight: 1.65 }}>
                Add a bio in the Personal tab to tell people about yourself…
              </p>
          }

          {skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: '1rem' }}>
              {skills.slice(0, 8).map(s => (
                <span key={s} style={{
                  background: 'rgba(74,144,217,0.15)', border: '1px solid rgba(74,144,217,0.3)',
                  color: '#4A90D9', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                }}>{s}</span>
              ))}
              {skills.length > 8 && (
                <span style={{ fontSize: 11, color: 'var(--muted)', alignSelf: 'center' }}>
                  +{skills.length - 8} more
                </span>
              )}
            </div>
          )}

          {(linkedin || github) && (
            <div style={{ display: 'flex', gap: 10, marginTop: '1rem', flexWrap: 'wrap' }}>
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
                  color: '#0A66C2', background: 'rgba(10,102,194,0.1)',
                  border: '1px solid rgba(10,102,194,0.25)', padding: '4px 10px',
                  borderRadius: 20, textDecoration: 'none', fontWeight: 600,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#0A66C2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                  LinkedIn
                </a>
              )}
              {github && (
                <a href={github} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
                  color: '#cdd6f4', background: 'rgba(20,27,56,0.88)',
                  border: '1px solid rgba(255,255,255,0.12)', padding: '4px 10px',
                  borderRadius: 20, textDecoration: 'none', fontWeight: 600,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
                  GitHub
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '9px 22px', borderRadius: '8px 8px 0 0',
            border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: tab === t.id ? 'rgba(74,144,217,0.16)' : 'transparent',
            color: tab === t.id ? '#4A90D9' : 'var(--muted)',
            borderBottom: tab === t.id ? '2px solid #4A90D9' : '2px solid transparent',
            marginBottom: -1, transition: 'all .2s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div style={CARD}>

        {/* ════ PERSONAL ════ */}
        {tab === 'personal' && (
          <>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: 16, fontWeight: 700 }}>Personal Information</h3>

            <div style={GRID2}>
              <div style={FIELD}>
                <label style={LABEL}>Full Name</label>
                <input style={INPUT} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
              </div>
              <div style={FIELD}>
                <label style={LABEL}>Phone Number</label>
                <input style={INPUT} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" />
              </div>
            </div>

            <div style={FIELD}>
              <label style={LABEL}>Bio <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>({bio.length}/400)</span></label>
              <textarea
                style={{ ...INPUT, resize: 'vertical', minHeight: 88, lineHeight: 1.65 }}
                value={bio} onChange={e => setBio(e.target.value)}
                placeholder="Tell people about your background, interests and goals…"
                maxLength={400}
              />
            </div>

            <div style={GRID2}>
              <div style={FIELD}>
                <label style={LABEL}>Location</label>
                <input style={INPUT} value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" />
              </div>
              <div style={FIELD}>
                <label style={LABEL}>Website / Portfolio</label>
                <input style={INPUT} value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourportfolio.com" />
              </div>
            </div>

            {/* Colour picker (only shown when no photo) */}
            {!avatarSrc && (
              <div style={FIELD}>
                <label style={LABEL}>Avatar Colour <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>(used when no photo is set)</span></label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  {AVATAR_COLORS.map(c => (
                    <button key={c.value} title={c.label} onClick={() => setAvatarColor(c.value)} style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: c.value, border: 'none', cursor: 'pointer',
                      outline: avatarColor === c.value ? '3px solid white' : '3px solid transparent',
                      outlineOffset: 2,
                      transform: avatarColor === c.value ? 'scale(1.2)' : 'scale(1)',
                      transition: 'all .2s', boxShadow: `0 0 10px ${c.value}55`,
                    }} />
                  ))}
                  <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>← Preview in card above</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={savePersonal} disabled={saving}>
                {saving ? '⏳ Saving…' : '💾 Save Personal Info'}
              </button>
            </div>
          </>
        )}

        {/* ════ PROFESSIONAL ════ */}
        {tab === 'professional' && (
          <>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: 16, fontWeight: 700 }}>Professional Profile</h3>

            <div style={GRID2}>
              <div style={FIELD}>
                <label style={LABEL}>Current Job Title</label>
                <input style={INPUT} value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Junior Data Analyst" />
              </div>
              <div style={FIELD}>
                <label style={LABEL}>Company / Organization</label>
                <input style={INPUT} value={company} onChange={e => setCompany(e.target.value)} placeholder="Where do you work?" />
              </div>
            </div>

            <div style={GRID2}>
              <div style={FIELD}>
                <label style={LABEL}>Experience Level</label>
                <select style={{ ...INPUT, cursor: 'pointer' }} value={expYears} onChange={e => setExpYears(e.target.value)}>
                  <option value="">Select experience…</option>
                  {EXPERIENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div style={FIELD}>
                <label style={LABEL}>Target Role</label>
                <select style={{ ...INPUT, cursor: 'pointer' }} value={targetRole} onChange={e => setTargetRole(e.target.value)}>
                  <option value="">Select target role…</option>
                  {TARGET_ROLES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div style={FIELD}>
              <label style={LABEL}>Education</label>
              <input style={INPUT} value={education} onChange={e => setEducation(e.target.value)} placeholder="e.g. B.Tech Computer Science, IIT Delhi, 2022" />
            </div>

            <div style={GRID2}>
              <div style={FIELD}>
                <label style={LABEL}>LinkedIn URL</label>
                <input style={INPUT} value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourprofile" />
              </div>
              <div style={FIELD}>
                <label style={LABEL}>GitHub URL</label>
                <input style={INPUT} value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/yourusername" />
              </div>
            </div>

            {/* Skills tag input */}
            <div style={FIELD}>
              <label style={LABEL}>
                Skills
                <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, marginLeft: 6, color: 'rgba(255,255,255,0.3)' }}>
                  · Enter or comma to add ({skills.length}/25)
                </span>
              </label>
              <div
                style={{ ...INPUT, minHeight: 52, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', cursor: 'text', padding: '8px 10px' }}
                onClick={() => document.getElementById('skill-input').focus()}
              >
                {skills.map(s => (
                  <span key={s} style={{
                    background: 'rgba(74,144,217,0.18)', border: '1px solid rgba(74,144,217,0.38)',
                    color: '#4A90D9', padding: '3px 10px', borderRadius: 20,
                    fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                  }}>
                    {s}
                    <span
                      onClick={e => { e.stopPropagation(); setSkills(p => p.filter(x => x !== s)); }}
                      style={{ cursor: 'pointer', opacity: .7, fontSize: 15, lineHeight: 1, marginTop: -1 }}
                    >×</span>
                  </span>
                ))}
                <input
                  id="skill-input"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={onSkillKey}
                  placeholder={skills.length === 0 ? 'SQL, Python, Tableau, Power BI…' : ''}
                  style={{ border: 'none', outline: 'none', background: 'transparent', color: 'var(--text)', fontSize: 13, flex: 1, minWidth: 140, fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={saveProfessional} disabled={saving}>
                {saving ? '⏳ Saving…' : '💾 Save Professional Info'}
              </button>
            </div>
          </>
        )}

        {/* ════ SECURITY ════ */}
        {tab === 'security' && (
          <div style={{ maxWidth: 500 }}>
            <h3 style={{ margin: '0 0 .5rem', fontSize: 16, fontWeight: 700 }}>Change Password</h3>
            <p style={{ margin: '0 0 1.75rem', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              Use a strong password with at least 8 characters. Mix uppercase, numbers and symbols.
            </p>

            <div style={FIELD}>
              <label style={LABEL}>Current Password</label>
              <input type="password" style={INPUT} value={curPwd} onChange={e => setCurPwd(e.target.value)} placeholder="Your current password" />
            </div>

            <div style={FIELD}>
              <label style={LABEL}>New Password</label>
              <input type="password" style={INPUT} value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Minimum 8 characters" />
              <StrengthBar password={newPwd} />
            </div>

            <div style={FIELD}>
              <label style={LABEL}>Confirm New Password</label>
              <input type="password" style={INPUT} value={confPwd} onChange={e => setConfPwd(e.target.value)} placeholder="Repeat your new password" />
              {confPwd.length > 0 && (
                <div style={{ fontSize: 11, marginTop: 5, fontWeight: 600, color: newPwd === confPwd ? '#5CC8A0' : '#F07B6A' }}>
                  {newPwd === confPwd ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}
            </div>

            <div style={{ padding: '1rem 1.2rem', background: 'rgba(74,144,217,0.06)', border: '1px solid rgba(74,144,217,0.14)', borderRadius: 10, marginBottom: '1.5rem' }}>
              <strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>💡 Tips for a strong password</strong>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: 12, color: 'var(--muted)', lineHeight: 2.1 }}>
                <li>At least 8 characters long</li>
                <li>At least one uppercase letter (A–Z)</li>
                <li>At least one number (0–9)</li>
                <li>At least one symbol (!@#$…)</li>
              </ul>
            </div>

            {/* Read-only account info */}
            <div style={{ padding: '1rem 1.2rem', background: 'rgba(20,27,56,0.88)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, marginBottom: '1.5rem' }}>
              <strong style={{ fontSize: 11, display: 'block', marginBottom: 8, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Account Details</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: 13 }}>
                <div><span style={{ color: 'var(--muted)', marginRight: 6 }}>Email:</span>{user?.email}</div>
                <div><span style={{ color: 'var(--muted)', marginRight: 6 }}>Role:</span>{user?.role || 'student'}</div>
              </div>
              <p style={{ margin: '0.6rem 0 0', fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={savePassword} disabled={saving || !curPwd || !newPwd || !confPwd}>
                {saving ? '⏳ Updating…' : '🔒 Update Password'}
              </button>
            </div>
          </div>
        )}

      </div>

      <Toast msg={toast.msg} type={toast.type} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
