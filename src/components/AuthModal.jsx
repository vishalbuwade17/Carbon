import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, LogIn, UserPlus } from 'lucide-react';

export default function AuthModal() {
  const { authModal, closeAuthModal, login, signup, googleSignIn } = useAuth();
  const [activeTab, setActiveTab] = useState(authModal.tab);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!authModal.isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (activeTab === 'login') {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await googleSignIn('Green Adventurer', 'adventurer@gmail.com');
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div 
        className="modal-content card" 
        onClick={(e) => e.stopPropagation()}
        style={{ borderTop: '4px solid var(--accent-primary)' }}
      >
        <button 
          onClick={closeAuthModal} 
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <button 
            className={`btn`} 
            style={{ 
              background: 'none', 
              color: activeTab === 'login' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'login' ? '2px solid var(--accent-primary)' : 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0'
            }}
            onClick={() => { setActiveTab('login'); setError(null); }}
          >
            Login
          </button>
          <button 
            className={`btn`} 
            style={{ 
              background: 'none', 
              color: activeTab === 'signup' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'signup' ? '2px solid var(--accent-primary)' : 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0'
            }}
            onClick={() => { setActiveTab('signup'); setError(null); }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {activeTab === 'signup' && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input 
                className="form-control" 
                type="text" 
                name="name" 
                id="name"
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Jane Doe"
                required 
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input 
              className="form-control" 
              type="email" 
              name="email" 
              id="email"
              value={formData.email} 
              onChange={handleChange} 
              placeholder="jane@example.com"
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              className="form-control" 
              type="password" 
              name="password" 
              id="password"
              value={formData.password} 
              onChange={handleChange} 
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={submitting}
          >
            {submitting ? 'Please wait...' : activeTab === 'login' ? (
              <>
                <LogIn size={18} /> Login
              </>
            ) : (
              <>
                <UserPlus size={18} /> Create Account
              </>
            )}
          </button>
        </form>

        <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ flexGrow: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>or</span>
          <div style={{ flexGrow: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        <button 
          onClick={handleGoogleSignIn} 
          className="btn btn-secondary" 
          style={{ width: '100%' }}
          disabled={submitting}
        >
          <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21.35,11.1H12v2.7h5.38C16.88,15.22,14.77,16.5,12,16.5c-3.03,0-5.61-2.05-6.53-4.82c-0.23-0.69-0.37-1.44-0.37-2.22s0.14-1.53,0.37-2.22c0.92-2.77,3.5-4.82,6.53-4.82c1.7,0,3.22,0.61,4.42,1.75l2.09-2.09C16.84,1.83,14.6,1,12,1C7.38,1,3.48,3.67,1.7,7.56c-0.56,1.24-0.88,2.61-0.88,4.06c0,1.45,0.32,2.82,0.88,4.06c1.78,3.89,5.68,6.56,10.3,6.56c2.94,0,5.39-0.97,7.19-2.63c1.94-1.78,3.13-4.4,3.13-7.46C22.32,11.75,22.2,11.41,21.35,11.1z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
