import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Award, Flame, Zap, CheckCircle2, Circle, Sparkles, 
  Trash2, Car, Lightbulb, Utensils, Droplet, Star 
} from 'lucide-react';

export default function Challenges() {
  const { user, token, updateUserLocal } = useAuth();
  
  const [challenges, setChallenges] = useState([]);
  const [completedIds, setCompletedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Award Modal/Success Banner State
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch all challenges
        const cRes = await fetch('/api/challenges', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Fetch user's completed challenges today
        const sRes = await fetch('/api/challenges/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (cRes.ok && sRes.ok) {
          const cData = await cRes.json();
          const sData = await sRes.json();
          setChallenges(cData);
          setCompletedIds(sData);
        }
      } catch (err) {
        console.error('Failed to load challenges:', err);
      } finally {
        setLoading(false);
      }
    }
    if (token) loadData();
  }, [token]);

  const handleComplete = async (challengeId) => {
    try {
      const res = await fetch(`/api/challenges/complete/${challengeId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        
        // Add to completed list
        setCompletedIds(prev => [...prev, challengeId]);
        
        // Update global user details context (XP, Level, Streak)
        updateUserLocal({
          xp: data.newXp,
          level: data.newLevel,
          streak: data.newStreak
        });

        // Trigger Success celebration banner
        let message = `You earned +${data.pointsEarned} Eco Points & +${data.xpGained} XP!`;
        if (data.newlyAwardedBadges.length > 0) {
          const badgeNames = data.newlyAwardedBadges.map(b => b.name).join(', ');
          message += ` 🏆 Unlocked new Badge: ${badgeNames}!`;
        }
        
        setToast({
          message,
          streak: data.newStreak,
          levelUp: data.levelUp,
          level: data.newLevel
        });

        // Hide banner after 5 seconds
        setTimeout(() => setToast(null), 6000);
      } else {
        alert('Could not record task completion.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error completing challenge.');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent-light)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading daily challenges...</p>
        </div>
      </div>
    );
  }

  // Filter challenges based on category selection
  const filteredChallenges = categoryFilter === 'all' 
    ? challenges 
    : challenges.filter(c => c.category === categoryFilter);

  // Category Icon helper
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'waste': return <Trash2 size={16} />;
      case 'transportation': return <Car size={16} />;
      case 'energy': return <Lightbulb size={16} />;
      case 'diet': return <Utensils size={16} />;
      case 'water': return <Droplet size={16} />;
      default: return <Star size={16} />;
    }
  };

  // Compute completions percentage
  const totalCount = challenges.length;
  const completedCount = completedIds.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      
      {/* Celebration Notification */}
      {toast && (
        <div 
          className="alert alert-success" 
          style={{ 
            position: 'fixed', 
            top: '6.5rem', 
            right: '1.5rem', 
            zIndex: 1000, 
            boxShadow: 'var(--card-shadow)',
            maxWidth: '380px',
            animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '0.5rem',
            borderLeft: '4px solid var(--success)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} style={{ color: 'var(--warning)' }} />
            <strong style={{ fontSize: '1rem' }}>Challenge Completed!</strong>
          </div>
          <span style={{ fontSize: '0.9rem' }}>{toast.message}</span>
          
          {toast.levelUp && (
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-hover)', background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: '4px', marginTop: '0.25rem' }}>
              🚀 LEVEL UP! Advanced to Level {toast.level}
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', opacity: '0.9' }}>
            <Flame size={14} fill="var(--warning)" style={{ color: 'var(--warning)' }} />
            <span>Streak: {toast.streak} days active!</span>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem', background: 'var(--accent-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.25rem' }}>Daily Eco Challenges</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Earn XP and grow your streak by checking off green behaviors.
          </p>
        </div>
        
        {/* Large streak badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '12px', boxShadow: 'var(--card-shadow)' }}>
          <Flame size={28} fill="var(--warning)" style={{ color: 'var(--warning)' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ fontSize: '1.1rem', color: 'var(--warning)' }}>{user.streak} Days</strong>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Daily Streak</span>
          </div>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <span>Daily Goals Complete</span>
          <span>{completedCount} / {totalCount} Tasks</span>
        </div>
        <div className="progress-bar-container" style={{ marginBottom: '0.5rem' }}>
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {completedCount === totalCount ? '🎉 Amazing! You completed all challenges for today.' : 'Keep going! Complete daily actions to safeguard your streaks.'}
        </span>
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { id: 'all', label: 'All Actions' },
          { id: 'transportation', label: 'Transportation' },
          { id: 'energy', label: 'Energy' },
          { id: 'diet', label: 'Diet & Food' },
          { id: 'water', label: 'Water' },
          { id: 'waste', label: 'Waste' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`btn`}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              background: categoryFilter === cat.id ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: categoryFilter === cat.id ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              fontWeight: '600'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Challenges List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredChallenges.length === 0 ? (
          <div className="card text-center" style={{ padding: '2rem 1rem', color: 'var(--text-secondary)', borderStyle: 'dashed' }}>
            No challenges available in this category.
          </div>
        ) : (
          filteredChallenges.map(c => {
            const isCompleted = completedIds.includes(c.id);
            return (
              <div 
                key={c.id} 
                className={`challenge-card ${isCompleted ? 'completed' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexGrow: 1 }}>
                  {/* Category icon */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-tertiary)',
                    color: isCompleted ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-color)'
                  }}>
                    {getCategoryIcon(c.category)}
                  </div>
                  
                  <div className="challenge-info">
                    <span className="challenge-title">{c.title}</span>
                    <span className="challenge-desc">{c.description}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Reward badges */}
                  <span style={{ fontSize: '0.8rem', background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--accent-primary)', fontWeight: '600' }}>
                    +{c.xp_reward} XP
                  </span>

                  {isCompleted ? (
                    <button 
                      className="btn" 
                      style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'default', padding: '0.25rem' }}
                      title="Completed Today"
                    >
                      <CheckCircle2 size={24} fill="var(--success)" style={{ color: '#FFFFFF' }} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleComplete(c.id)} 
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '6px' }}
                    >
                      Claim
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
