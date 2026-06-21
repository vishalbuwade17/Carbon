import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, TreePine, CarFront, Award, Flame, Users, Sparkles } from 'lucide-react';

export default function Community() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCommunityData() {
      try {
        const statsRes = await fetch('/api/community/stats');
        const boardRes = await fetch('/api/community/leaderboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (statsRes.ok && boardRes.ok) {
          const statsData = await statsRes.json();
          const boardData = await boardRes.json();
          setStats(statsData);
          setLeaderboard(boardData);
        }
      } catch (err) {
        console.error('Failed to load community statistics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCommunityData();
  }, [token]);

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent-light)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading community impacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>Community Hub</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Join forces with EcoTrackers worldwide. Review collective offsets and climb the leaderboard!
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-3" style={{ marginBottom: '2.5rem' }}>
          {/* Stat 1: Collective CO2 */}
          <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>
              <Activity size={22} />
            </div>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-primary)' }}>
              {stats.collectiveSavedKg.toLocaleString()} kg
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
              Collective CO₂ Reduction
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Computed from {stats.totalCalculations} user logs.
            </span>
          </div>

          {/* Stat 2: Trees Saved */}
          <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: '#06B6D4', marginBottom: '0.25rem' }}>
              <TreePine size={22} />
            </div>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#06B6D4' }}>
              {stats.treesSaved.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
              Tree Offsets Equivalent
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Based on monthly tree CO₂ absorption rate.
            </span>
          </div>

          {/* Stat 3: Cars Removed */}
          <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: 'var(--warning)', marginBottom: '0.25rem' }}>
              <CarFront size={22} />
            </div>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--warning)' }}>
              {stats.carsRemoved.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
              Gasoline Cars Taken Off Road
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Avoided average commute gas emissions.
            </span>
          </div>
        </div>
      )}

      {/* Leaderboard Section */}
      <div className="grid grid-cols-3" style={{ alignItems: 'start', gap: '2rem' }}>
        
        {/* Left Side Info card */}
        <div className="card glow-top" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} style={{ color: 'var(--accent-primary)' }} /> Collective Impact
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            EcoTrack isn't just a personal logger — it's a movement. Every daily challenge logged and driving mile saved accumulates into real-world offsets. 
          </p>
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <Sparkles size={16} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '0.1rem' }} />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Eco Levels update instantly upon completing tasks. Compete with your friends and climb to Level 5 to earn the **Eco Champion** badge.
            </p>
          </div>
        </div>

        {/* Leaderboard Table (Spans 2 columns) */}
        <div className="card" style={{ gridColumn: 'span 2', padding: '1.5rem 0' }}>
          <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} style={{ color: 'var(--warning)' }} /> Top 10 EcoTrackers
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Active users: {stats ? stats.activeUsers : 0}
            </span>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'center', width: '70px' }}>Rank</th>
                  <th>User Name</th>
                  <th style={{ textAlign: 'center' }}>Eco Level</th>
                  <th style={{ textAlign: 'right' }}>Streak</th>
                  <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Total XP</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, index) => {
                  const isCurrentUser = user && user.id === row.id;
                  let rankStyle = {};
                  
                  if (index === 0) rankStyle = { color: 'var(--warning)', fontWeight: '900' };
                  else if (index === 1) rankStyle = { color: '#94A3B8', fontWeight: '800' };
                  else if (index === 2) rankStyle = { color: '#B45309', fontWeight: '800' };

                  return (
                    <tr 
                      key={row.id} 
                      style={{ 
                        background: isCurrentUser ? 'var(--accent-light)' : 'none',
                        borderLeft: isCurrentUser ? '3px solid var(--accent-primary)' : 'none'
                      }}
                    >
                      <td style={{ textAlign: 'center', ...rankStyle }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </td>
                      <td style={{ fontWeight: isCurrentUser ? '700' : '500' }}>
                        {row.name} {isCurrentUser && <span style={{ fontSize: '0.7rem', background: 'var(--accent-primary)', color: '#FFF', padding: '0.05rem 0.35rem', borderRadius: '4px', marginLeft: '0.25rem' }}>You</span>}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: 'var(--accent-primary)' }}>
                        Lvl {row.level}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '700' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Flame size={14} fill={row.streak > 0 ? 'var(--warning)' : 'none'} style={{ color: row.streak > 0 ? 'var(--warning)' : 'var(--text-secondary)' }} />
                          <span>{row.streak}d</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '700', paddingRight: '1.5rem' }}>
                        {row.xp.toLocaleString()} XP
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 1024px) {
          .grid-cols-3 {
            grid-template-columns: 1fr !important;
          }
          div.card {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
