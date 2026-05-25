import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../hooks/useApi';

export default function Leaderboard() {
  const { user } = useAuth();
  const [lb, setLb] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/leaderboard').then(r => setLb(r.data.leaderboard)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" />Loading leaderboard...</div>;

  const rankIcon = r => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `#${r}`;
  const colors = ['#7F77DD', '#1D9E75', '#D85A30', '#BA7517', '#534AB7'];

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">🏆 Leaderboard</div>
        <div className="page-sub">Top learners ranked by XP — updated live</div>
      </div>
      <div style={{ maxWidth: 560 }}>
        {lb.map((p, i) => {
          const isMe = p.id === user?.id;
          const initials = p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          const color = colors[i % colors.length];
          return (
            <div key={p.id} className={`lb-row ${isMe ? 'me' : ''}`}>
              <div className="lb-rank" style={{ color: i < 3 ? ['#BA7517', '#888780', '#D85A30'][i] : 'var(--muted)' }}>
                {rankIcon(p.rank || i + 1)}
              </div>
              <div className="avatar" style={{ background: color + '20', color, margin: '0 10px' }}>{initials}</div>
              <div className="lb-name">{p.name}{isMe ? ' 👈 You' : ''}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginRight: 12 }}>🔥 {p.streak}d</div>
              <div className="lb-xp">{(p.xp || 0).toLocaleString()} XP</div>
            </div>
          );
        })}
        {lb.length === 0 && <div className="loading" style={{ height: 120 }}>No users yet. Be the first!</div>}
      </div>
    </div>
  );
}
