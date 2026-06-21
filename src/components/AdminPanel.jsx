import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, PlusCircle, Users, Activity, BarChart, Settings } from 'lucide-react';

export default function AdminPanel() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Challenge Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'energy',
    points: '15',
    xp_reward: '30'
  });
  
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const aRes = await fetch('/api/admin/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const uRes = await fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (aRes.ok && uRes.ok) {
          const aData = await aRes.json();
          const uData = await uRes.json();
          setAnalytics(aData);
          setUsers(uData);
        }
      } catch (err) {
        console.error('Failed to load admin statistics:', err);
      } finally {
        setLoading(false);
      }
    }
    if (token) loadAdminData();
  }, [token, formSuccess]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    try {
      const res = await fetch('/api/admin/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setFormSuccess(true);
        setFormData({
          title: '',
          description: '',
          category: 'energy',
          points: '15',
          xp_reward: '30'
        });
        setTimeout(() => setFormSuccess(false), 4000);
      } else {
        const errData = await res.json();
        setFormError(errData.error || 'Failed to create challenge');
      }
    } catch (err) {
      console.error(err);
      setFormError('Network error creating challenge.');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent-light)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: '#EF4444' }}>
          <Shield size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Admin Controls</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>EcoTrack system metrics and challenge management.</p>
        </div>
      </div>

      {analytics && (
        <div className="grid grid-cols-4" style={{ marginBottom: '2.5rem' }}>
          {/* Stat 1 */}
          <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: 'var(--accent-primary)' }}>
              <Users size={20} />
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600', display: 'block' }}>Total Users</span>
              <strong style={{ fontSize: '1.4rem' }}>{analytics.totalUsers}</strong>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: '#3B82F6' }}>
              <Settings size={20} />
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600', display: 'block' }}>Active Challenges</span>
              <strong style={{ fontSize: '1.4rem' }}>{analytics.activeChallenges}</strong>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: 'var(--warning)' }}>
              <Activity size={20} />
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600', display: 'block' }}>Total Calculations</span>
              <strong style={{ fontSize: '1.4rem' }}>{analytics.totalLogs}</strong>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: '#06B6D4' }}>
              <BarChart size={20} />
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600', display: 'block' }}>Avg Monthly Footprint</span>
              <strong style={{ fontSize: '1.4rem' }}>{analytics.averageFootprint} kg</strong>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3" style={{ alignItems: 'start', gap: '2rem' }}>
        
        {/* Left Side: Create Challenge */}
        <div className="card glow-top">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={18} style={{ color: 'var(--accent-primary)' }} /> Create Challenge
          </h3>

          {formSuccess && (
            <div className="alert alert-success" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              Challenge published successfully!
            </div>
          )}

          {formError && (
            <div className="alert alert-danger" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateChallenge} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Challenge Title</label>
              <input 
                className="form-control"
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Unplug Vampire Loads"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Task Description</label>
              <textarea 
                className="form-control"
                name="description"
                id="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what the user needs to do..."
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="category">Category</label>
              <select 
                className="form-control"
                name="category"
                id="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="energy">Energy Conservation</option>
                <option value="transportation">Transportation</option>
                <option value="diet">Diet & Nutrition</option>
                <option value="water">Water Conservation</option>
                <option value="waste">Waste Management</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="points">Eco Points</label>
                <input 
                  className="form-control"
                  type="number"
                  name="points"
                  id="points"
                  value={formData.points}
                  onChange={handleChange}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="xp_reward">XP Reward</label>
                <input 
                  className="form-control"
                  type="number"
                  name="xp_reward"
                  id="xp_reward"
                  value={formData.xp_reward}
                  onChange={handleChange}
                  min="1"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              Publish Challenge
            </button>
          </form>
        </div>

        {/* Right Side: Users List (Spans 2 columns) */}
        <div className="card" style={{ gridColumn: 'span 2', padding: '1.5rem 0' }}>
          <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Platform Users</h3>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.5rem' }}>User</th>
                  <th>Email</th>
                  <th style={{ textAlign: 'center' }}>Role</th>
                  <th style={{ textAlign: 'center' }}>Level</th>
                  <th style={{ textAlign: 'right' }}>Streak</th>
                  <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>XP Points</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: '600', paddingLeft: '1.5rem' }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.1rem 0.5rem', 
                        borderRadius: '4px',
                        background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: u.role === 'admin' ? '#EF4444' : 'var(--accent-primary)',
                        fontWeight: '600'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: 'var(--accent-primary)' }}>Lvl {u.level}</td>
                    <td style={{ textAlign: 'right', fontWeight: '700' }}>{u.streak}d</td>
                    <td style={{ textAlign: 'right', fontWeight: '700', paddingRight: '1.5rem' }}>{u.xp.toLocaleString()} XP</td>
                  </tr>
                ))}
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
          .grid-cols-4 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          div.card {
            grid-column: span 1 !important;
          }
        }
        @media (max-width: 600px) {
          .grid-cols-4 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
