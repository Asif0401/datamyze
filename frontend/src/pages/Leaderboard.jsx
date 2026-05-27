import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../hooks/useApi';

const COLORS = ['#7F77DD','#4A90D9','#1D9E75','#D85A30','#BA7517','#534AB7','#e879f9','#5CC8A0','#f9a825','#f87171',
                 '#38bdf8','#a78bfa','#10b981','#fb923c','#60a5fa'];

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function tier(xp) {
  if (xp >= 5000) return { label: 'Expert',   color: '#E8A838' };
  if (xp >= 3000) return { label: 'Senior',   color: '#a78bfa' };
  if (xp >= 1500) return { label: 'Analyst',  color: '#38bdf8' };
  if (xp >= 500)  return { label: 'Learner',  color: '#5CC8A0' };
  return             { label: 'Fresher',  color: 'rgba(255,255,255,0.35)' };
}

function StatCard({ icon, label, val, color, delay = '0s' }) {
  return (
    <div className="card" style={{ textAlign:'center', padding:'1.3rem 1rem', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)', animation:'popIn 0.35s ease both', animationDelay: delay }}>
      <div style={{ fontSize:26, marginBottom:8 }}>{icon}</div>
      <div style={{ fontSize:26, fontWeight:900, color: color || '#fff', letterSpacing:'-0.5px', lineHeight:1 }}>{val}</div>
      <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.38)', textTransform:'uppercase', letterSpacing:'0.7px', marginTop:5 }}>{label}</div>
    </div>
  );
}

function PodiumCard({ p, rank, color }) {
  const t  = tier(p.xp || 0);
  const heights = { 1: 160, 2: 120, 3: 95 };
  const avatarSz = { 1: 76, 2: 62, 3: 54 };
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
  const podiumBg = {
    1: 'linear-gradient(180deg,rgba(232,168,56,0.40),rgba(232,168,56,0.18))',
    2: 'linear-gradient(180deg,rgba(148,163,184,0.28),rgba(148,163,184,0.12))',
    3: 'linear-gradient(180deg,rgba(180,120,60,0.28),rgba(180,120,60,0.12))',
  };
  const podiumBorder = {
    1: '1px solid rgba(232,168,56,0.55)',
    2: '1px solid rgba(148,163,184,0.38)',
    3: '1px solid rgba(180,120,60,0.38)',
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width: rank === 1 ? 200 : 164 }}>
      {rank === 1 && <div style={{ fontSize:28, marginBottom:6, filter:'drop-shadow(0 0 10px rgba(232,168,56,0.7))' }}>👑</div>}
      <div style={{
        width:avatarSz[rank], height:avatarSz[rank], borderRadius:'50%',
        background:`linear-gradient(135deg,${color}55,${color}28)`,
        border:`2px solid ${color}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize: rank === 1 ? 22 : 17, fontWeight:900, color,
        boxShadow:`0 0 22px ${color}60`,
        marginBottom:10,
      }}>{initials(p.name)}</div>
      <div style={{ fontSize: rank === 1 ? 14 : 12, fontWeight:800, color:'#fff', textAlign:'center', marginBottom:2 }}>{p.name}</div>
      <div style={{ fontSize:10, fontWeight:700, color:t.color, marginBottom:3 }}>{t.label}</div>
      <div style={{ fontSize: rank === 1 ? 15 : 13, fontWeight:900, color:'#4A90D9', marginBottom:2 }}>{(p.xp||0).toLocaleString()} XP</div>
      <div style={{ fontSize:11, color:'rgba(255,255,255,0.38)', marginBottom:10 }}>🔥 {p.streak}d streak</div>
      <div style={{
        width:'100%', height:heights[rank], borderRadius:'12px 12px 0 0',
        background:podiumBg[rank], border:podiumBorder[rank],
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <span style={{ fontSize: rank === 1 ? 36 : 26, filter: rank === 1 ? 'drop-shadow(0 0 10px rgba(232,168,56,0.5))' : 'none' }}>{medal}</span>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const { user }  = useAuth();
  const [lb, setLb] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/leaderboard').then(r => setLb(r.data.leaderboard)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" />Loading leaderboard...</div>;

  const me     = lb.find(p => p.id === user?.id);
  const topXP  = lb[0]?.xp || 1;
  const maxStreak = lb.length ? Math.max(...lb.map(p => p.streak || 0)) : 0;
  const top3   = lb.slice(0, 3);
  // Podium visual order: 2nd | 1st | 3rd
  const podium = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumRanks = [2, 1, 3];

  return (
    <div className="page" style={{ maxWidth:'100%' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom:'1.8rem' }}>
        <div className="page-title">🏆 Leaderboard</div>
        <div className="page-sub" style={{ marginTop:4 }}>
          Top learners on their journey to Data Analyst, BI Engineer &amp; Product Analytics roles — ranked by XP
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'2rem' }}>
        <StatCard icon="👥" label="On Leaderboard" val={lb.length} delay="0s" />
        <StatCard icon="🎯" label="Your Rank"      val={me ? `#${me.rank}` : '—'}       color="#4A90D9" delay="0.07s" />
        <StatCard icon="🔥" label="Top Streak"     val={`${maxStreak}d`}                color="#f9a825" delay="0.14s" />
        <StatCard icon="⚡" label="Your XP"        val={me ? (me.xp||0).toLocaleString() : '0'} color="#a78bfa" delay="0.21s" />
      </div>

      {/* ── Podium ── */}
      {top3.length === 3 && (
        <div style={{ display:'flex', justifyContent:'center', alignItems:'flex-end', gap:'1.2rem', marginBottom:'2.5rem',
          background:'rgba(255,255,255,0.07)', borderRadius:20, border:'1px solid rgba(255,255,255,0.12)',
          padding:'2rem 2rem 0', animation:'fadeInUp 0.5s 0.15s ease both',
        }}>
          {podium.map((p, idx) => (
            <PodiumCard key={p.id} p={p} rank={podiumRanks[idx]} color={COLORS[lb.indexOf(p) % COLORS.length]} />
          ))}
        </div>
      )}

      {/* ── Full table ── */}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>

        {/* Column headers */}
        <div style={{ display:'grid', gridTemplateColumns:'52px 48px 1fr 180px 80px 90px',
          padding:'6px 20px', gap:12, alignItems:'center' }}>
          {['Rank','','Name','Progress','Streak','XP'].map(h => (
            <div key={h} style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)',
              textTransform:'uppercase', letterSpacing:'0.8px', textAlign: h === 'XP' || h === 'Streak' ? 'right' : 'left' }}>{h}</div>
          ))}
        </div>

        {lb.map((p, i) => {
          const isMe   = p.id === user?.id;
          const color  = COLORS[i % COLORS.length];
          const t      = tier(p.xp || 0);
          const xpPct  = Math.round(((p.xp||0) / topXP) * 100);
          const rankN  = p.rank || i + 1;
          const medal  = rankN === 1 ? '🥇' : rankN === 2 ? '🥈' : rankN === 3 ? '🥉' : null;

          return (
            <div key={p.id} className={`lb-row ${isMe ? 'me' : ''}`} style={{
              display:'grid', gridTemplateColumns:'52px 48px 1fr 180px 80px 90px',
              padding:'11px 20px', gap:12, alignItems:'center', borderRadius:14,
              background: isMe ? 'rgba(74,144,217,0.12)' : 'rgba(255,255,255,0.04)',
              border: isMe ? '1px solid rgba(74,144,217,0.25)' : '1px solid rgba(255,255,255,0.06)',
            }}>

              {/* Rank */}
              <div style={{ fontWeight:800, fontSize: medal ? 18 : 14, textAlign:'center',
                color: rankN===1 ? '#E8A838' : rankN===2 ? '#94a3b8' : rankN===3 ? '#cd7f32' : 'rgba(255,255,255,0.35)' }}>
                {medal || `#${rankN}`}
              </div>

              {/* Avatar */}
              <div style={{ width:38, height:38, borderRadius:'50%',
                background:`${color}30`, border:`1.5px solid ${color}80`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:12, fontWeight:800, color }}>
                {initials(p.name)}
              </div>

              {/* Name + tier */}
              <div>
                <div style={{ fontSize:14, fontWeight:700, color: isMe ? '#4A90D9' : '#fff',
                  display:'flex', alignItems:'center', gap:7 }}>
                  {p.name}
                  {isMe && (
                    <span style={{ fontSize:10, fontWeight:700, background:'rgba(74,144,217,0.15)',
                      border:'1px solid rgba(74,144,217,0.3)', color:'#4A90D9', borderRadius:20, padding:'1px 8px' }}>You</span>
                  )}
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:t.color, marginTop:2 }}>{t.label}</div>
              </div>

              {/* XP progress bar */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10,
                  color:'rgba(255,255,255,0.28)', marginBottom:4 }}>
                  <span>{xpPct}% of #1</span>
                </div>
                <div style={{ height:5, borderRadius:5, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${xpPct}%`, borderRadius:5,
                    background:`linear-gradient(90deg,${color},${color}77)` }} />
                </div>
              </div>

              {/* Streak */}
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', textAlign:'right', fontWeight:600 }}>
                🔥 {p.streak}d
              </div>

              {/* XP */}
              <div style={{ fontSize:14, fontWeight:900, color:'#4A90D9', textAlign:'right' }}>
                {(p.xp||0).toLocaleString()} XP
              </div>

            </div>
          );
        })}
      </div>

      {lb.length === 0 && (
        <div className="loading" style={{ height:120 }}>No users yet. Be the first!</div>
      )}

    </div>
  );
}
