import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../hooks/useApi';

const COLORS = ['#7F77DD','#4A90D9','#1D9E75','#D85A30','#BA7517','#534AB7','#e879f9','#5CC8A0','#f9a825','#f87171',
                 '#38bdf8','#a78bfa','#10b981','#fb923c','#60a5fa'];

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function tier(xp) {
  if (xp >= 5000) return { label: 'Expert',   color: '#E8A838', bg: 'rgba(232,168,56,0.15)',  border: 'rgba(232,168,56,0.4)'  };
  if (xp >= 3000) return { label: 'Senior',   color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.4)' };
  if (xp >= 1500) return { label: 'Analyst',  color: '#38bdf8', bg: 'rgba(56,189,248,0.15)',  border: 'rgba(56,189,248,0.4)'  };
  if (xp >= 500)  return { label: 'Learner',  color: '#5CC8A0', bg: 'rgba(92,200,160,0.15)',  border: 'rgba(92,200,160,0.4)'  };
  return             { label: 'Fresher',  color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.15)' };
}

/* ── Stat card ── */
function StatCard({ icon, label, val, color, bg, delay = '0s' }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '1.4rem 1rem',
      background: bg || 'rgba(20,27,56,0.88)',
      border: `1px solid ${color}33`,
      borderRadius: 18,
      position: 'relative',
      overflow: 'hidden',
      animation: 'popIn 0.35s ease both',
      animationDelay: delay,
      flex: '1 1 120px',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${color}18, transparent)`, pointerEvents: 'none' }} />
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color, letterSpacing: '-1px', lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 6 }}>{label}</div>
    </div>
  );
}

/* ── Podium card ── */
function PodiumCard({ p, rank, color }) {
  const t = tier(p.xp || 0);
  const cfg = {
    1: { h: 180, sz: 80, fs: 22, blockBg: 'linear-gradient(180deg, #b8860b 0%, #8B6914 50%, #5a4009 100%)', border: '#E8A838', glow: 'rgba(232,168,56,0.60)', label: '#E8A838', labelBg: 'rgba(232,168,56,0.15)', numColor: '#FFD700', medal: '🥇', rankText: '1ST' },
    2: { h: 130, sz: 66, fs: 18, blockBg: 'linear-gradient(180deg, #6b7280 0%, #4b5563 50%, #374151 100%)', border: '#9ca3af', glow: 'rgba(156,163,175,0.45)', label: '#d1d5db', labelBg: 'rgba(148,163,184,0.12)', numColor: '#C0C0C0', medal: '🥈', rankText: '2ND' },
    3: { h: 105, sz: 58, fs: 16, blockBg: 'linear-gradient(180deg, #92400e 0%, #78350f 50%, #451a03 100%)', border: '#cd7f32', glow: 'rgba(205,127,50,0.45)', label: '#d97706', labelBg: 'rgba(205,127,50,0.12)', numColor: '#CD7F32', medal: '🥉', rankText: '3RD' },
  }[rank];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: rank === 1 ? 200 : 168 }}>

      {/* Crown for #1 */}
      {rank === 1 && (
        <div style={{ fontSize: 28, marginBottom: 6, filter: 'drop-shadow(0 0 16px rgba(232,168,56,1))' }}>👑</div>
      )}

      {/* Avatar */}
      <div style={{
        width: cfg.sz, height: cfg.sz, borderRadius: '50%',
        background: `linear-gradient(135deg, ${color}60, ${color}25)`,
        border: `3px solid ${cfg.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: cfg.fs, fontWeight: 900, color: '#fff',
        boxShadow: `0 0 0 5px ${cfg.border}25, 0 0 28px ${cfg.glow}, 0 4px 16px rgba(0,0,0,0.5)`,
        marginBottom: 10, position: 'relative', flexShrink: 0,
      }}>
        {initials(p.name)}
        {rank === 1 && <div style={{ position: 'absolute', inset: -5, borderRadius: '50%', border: `1px solid ${cfg.border}40`, animation: 'ringPulse 2s ease-in-out infinite' }} />}
      </div>

      {/* Name card */}
      <div style={{
        background: 'rgba(14,20,40,0.92)', border: `1px solid ${cfg.border}40`,
        borderRadius: 12, padding: '8px 14px', textAlign: 'center', marginBottom: 0, width: '100%',
        boxShadow: `0 4px 20px rgba(0,0,0,0.40), 0 0 0 1px ${cfg.border}20`,
      }}>
        <div style={{ fontSize: rank === 1 ? 14 : 12, fontWeight: 800, color: '#fff', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 7px', background: t.bg, border: `1px solid ${t.border}`, borderRadius: 20, color: t.color }}>{t.label}</span>
          <span style={{ fontSize: rank === 1 ? 13 : 11, fontWeight: 900, color: cfg.numColor, letterSpacing: '-0.3px' }}>{(p.xp || 0).toLocaleString()} <span style={{ fontSize: 9, opacity: 0.7 }}>XP</span></span>
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>🔥 {p.streak}d streak</div>
      </div>

      {/* Podium block — solid, 3D look */}
      <div style={{
        width: '100%', height: cfg.h, borderRadius: '10px 10px 0 0',
        background: cfg.blockBg,
        border: `1.5px solid ${cfg.border}70`,
        borderBottom: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
        paddingTop: 12,
        boxShadow: `inset 0 2px 0 ${cfg.border}60, inset 0 -2px 8px rgba(0,0,0,0.4), 0 0 24px ${cfg.glow}`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Glossy top shine */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(180deg, rgba(255,255,255,0.12), transparent)', borderRadius: '10px 10px 0 0', pointerEvents: 'none' }} />
        <div style={{ fontSize: rank === 1 ? 28 : 22, filter: `drop-shadow(0 0 10px ${cfg.glow})`, position: 'relative', zIndex: 1 }}>{cfg.medal}</div>
        <div style={{ fontSize: rank === 1 ? 22 : 18, fontWeight: 900, color: cfg.border, letterSpacing: '-0.5px', position: 'relative', zIndex: 1, marginTop: 4 }}>{cfg.rankText}</div>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [lb, setLb] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/leaderboard').then(r => setLb(r.data.leaderboard)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" />Loading leaderboard...</div>;

  const me = lb.find(p => p.id === user?.id);
  const topXP = lb[0]?.xp || 1;
  const maxStreak = lb.length ? Math.max(...lb.map(p => p.streak || 0)) : 0;
  const top3 = lb.slice(0, 3);
  const podium = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumRanks = [2, 1, 3];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 0 3rem', position: 'relative' }}>

      {/* ── Page header ─────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(232,168,56,0.18) 0%, rgba(127,119,221,0.12) 50%, rgba(56,189,248,0.08) 100%)',
        border: '1px solid rgba(232,168,56,0.22)',
        borderRadius: 22, padding: '2rem 2rem 1.8rem',
        marginBottom: '2rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,168,56,0.15), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: 60, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(127,119,221,0.12), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #E8A838, #a78bfa, #38bdf8)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 48, filter: 'drop-shadow(0 0 16px rgba(232,168,56,0.7))' }}>🏆</div>
          <div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #f1f5f9 30%, #E8A838 60%, #F07B6A)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Leaderboard</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '4px 0 0', fontWeight: 500 }}>
              Top learners ranked by XP · Data Analyst · BI Engineer · Product Analytics
            </p>
          </div>

          {/* Your rank badge */}
          {me && (
            <div style={{
              marginLeft: 'auto',
              background: 'rgba(74,144,217,0.15)', border: '1px solid rgba(74,144,217,0.35)',
              borderRadius: 14, padding: '0.7rem 1.2rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(74,144,217,0.7)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>Your Rank</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#4A90D9', letterSpacing: '-1px' }}>#{me.rank}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats strip ─────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: '2rem', flexWrap: 'wrap' }}>
        <StatCard icon="👥" label="On Leaderboard" val={lb.length}                                         color="#7F77DD" bg="rgba(127,119,221,0.10)" delay="0s"     />
        <StatCard icon="🎯" label="Your Rank"       val={me ? `#${me.rank}` : '—'}                        color="#4A90D9" bg="rgba(74,144,217,0.10)"  delay="0.07s"  />
        <StatCard icon="🔥" label="Top Streak"      val={`${maxStreak}d`}                                 color="#f9a825" bg="rgba(249,168,37,0.10)"  delay="0.14s"  />
        <StatCard icon="⚡" label="Your XP"         val={me ? (me.xp || 0).toLocaleString() : '0'}        color="#a78bfa" bg="rgba(167,139,250,0.10)" delay="0.21s"  />
      </div>

      {/* ── Podium ──────────────────────────────────── */}
      {top3.length === 3 && (
        <div style={{
          marginBottom: 0,
          background: 'linear-gradient(180deg, rgba(12,18,40,0.98) 0%, rgba(18,26,52,0.96) 100%)',
          border: '1px solid rgba(232,168,56,0.28)',
          borderBottom: 'none',
          borderRadius: '20px 20px 0 0',
          padding: '2rem 2rem 0',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 -4px 40px rgba(232,168,56,0.06), inset 0 1px 0 rgba(232,168,56,0.20)',
          animation: 'fadeInUp 0.5s 0.15s ease both',
        }}>
          {/* Stage floor glow */}
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 500, height: 80, background: 'radial-gradient(ellipse, rgba(232,168,56,0.10), transparent)', pointerEvents: 'none' }} />
          {/* Spotlight beam */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 220, height: 160, background: 'radial-gradient(ellipse, rgba(232,168,56,0.08), transparent)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1rem' }}>
            {podium.map((p, idx) => (
              <PodiumCard key={p.id} p={p} rank={podiumRanks[idx]} color={COLORS[lb.indexOf(p) % COLORS.length]} />
            ))}
          </div>
        </div>
      )}

      {/* ── Full table ──────────────────────────────── */}
      <div style={{
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: top3.length === 3 ? '0 0 20px 20px' : 20,
        overflow: 'hidden',
      }}>

        {/* Column headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: '56px 52px 1fr 160px 80px 100px',
          padding: '10px 20px', gap: 12, alignItems: 'center',
          background: 'rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
        }}>
          {[
            { label: 'Rank',     cls: '' },
            { label: '',         cls: '' },
            { label: 'Name',     cls: '' },
            { label: 'Progress', cls: 'lb-mobile-hide' },
            { label: 'Streak',   cls: '' },
            { label: 'XP',       cls: '' },
          ].map(({ label, cls }) => (
            <div key={label} className={cls} style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: label === 'XP' || label === 'Streak' ? 'right' : 'left' }}>{label}</div>
          ))}
        </div>

        {lb.map((p, i) => {
          const isMe  = p.id === user?.id;
          const color = COLORS[i % COLORS.length];
          const t     = tier(p.xp || 0);
          const xpPct = Math.round(((p.xp || 0) / topXP) * 100);
          const rankN = p.rank || i + 1;
          const medal = rankN === 1 ? '🥇' : rankN === 2 ? '🥈' : rankN === 3 ? '🥉' : null;
          const rankColor = rankN === 1 ? '#E8A838' : rankN === 2 ? '#94a3b8' : rankN === 3 ? '#cd7f32' : 'rgba(255,255,255,0.3)';

          return (
            <div
              key={p.id}
              style={{
                display: 'grid', gridTemplateColumns: '56px 52px 1fr 160px 80px 100px',
                padding: '13px 20px', gap: 12, alignItems: 'center',
                background: isMe
                  ? 'linear-gradient(90deg, rgba(74,144,217,0.14), rgba(74,144,217,0.06))'
                  : i % 2 === 0 ? 'rgba(20,27,56,0.88)' : 'rgba(14,20,42,0.92)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                borderLeft: isMe ? '3px solid #4A90D9' : `3px solid ${rankN <= 3 ? rankColor : 'transparent'}`,
                transition: 'background .2s',
                cursor: 'default',
              }}
              onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = 'rgba(28,36,68,0.95)'; }}
              onMouseLeave={e => { if (!isMe) e.currentTarget.style.background = i % 2 === 0 ? 'rgba(20,27,56,0.88)' : 'rgba(14,20,42,0.92)'; }}
            >
              {/* Rank */}
              <div style={{ fontWeight: 900, fontSize: medal ? 20 : 13, textAlign: 'center', color: rankColor, letterSpacing: medal ? 0 : '-0.3px' }}>
                {medal || `#${rankN}`}
              </div>

              {/* Avatar */}
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: `linear-gradient(135deg, ${color}44, ${color}18)`,
                border: `2px solid ${color}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color,
                boxShadow: `0 0 10px ${color}30`,
                flexShrink: 0,
              }}>
                {initials(p.name)}
              </div>

              {/* Name + tier */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: isMe ? '#60b4f5' : '#f1f5f9', display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                  {p.name}
                  {isMe && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(74,144,217,0.2)', border: '1px solid rgba(74,144,217,0.4)', color: '#4A90D9', borderRadius: 20, padding: '1px 8px' }}>You</span>
                  )}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 8px', background: t.bg, border: `1px solid ${t.border}`, borderRadius: 20, color: t.color, marginTop: 3, display: 'inline-block' }}>{t.label}</span>
              </div>

              {/* XP progress bar — hidden on mobile */}
              <div className="lb-mobile-hide">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 5 }}>
                  <span>{xpPct}% of #1</span>
                </div>
                <div style={{ height: 6, borderRadius: 6, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${xpPct}%`, borderRadius: 6,
                    background: `linear-gradient(90deg, ${color}, ${color}88)`,
                    boxShadow: `0 0 8px ${color}60`,
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>

              {/* Streak */}
              <div style={{ fontSize: 13, fontWeight: 700, color: p.streak >= 7 ? '#f9a825' : 'rgba(255,255,255,0.45)', textAlign: 'right' }}>
                🔥 {p.streak}d
              </div>

              {/* XP */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 15, fontWeight: 900, color, letterSpacing: '-0.5px' }}>
                  {(p.xp || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>XP</div>
              </div>

            </div>
          );
        })}

        {lb.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
            No users yet. Be the first! 🚀
          </div>
        )}
      </div>

      <style>{`
        @keyframes ringPulse {
          0%, 100% { transform: scale(1);   opacity: 0.6; }
          50%       { transform: scale(1.12); opacity: 0.15; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}
