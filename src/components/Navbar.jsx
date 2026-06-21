import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Leaf, Flame, Sun, Moon, LogOut, Menu, X } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, theme, toggleTheme }) {
  const { user, openAuthModal, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'landing', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard', authRequired: true },
    { id: 'calculator', label: 'Calculator' },
    { id: 'simulator', label: 'Simulator' },
    { id: 'challenges', label: 'Challenges', authRequired: true },
    { id: 'community', label: 'Community' },
    { id: 'education', label: 'Education' }
  ];

  if (user && user.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin', authRequired: true });
  }

  const visibleNavItems = navItems.filter(item => !item.authRequired || user);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '5.5rem',
      background: 'var(--card-bg)',
      backdropFilter: 'var(--backdrop-blur)',
      borderBottom: '1px solid var(--border-color)',
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      transition: 'var(--transition-smooth)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        
        {/* Logo */}
        <div 
          onClick={() => handleNavClick('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-dark))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <Leaf size={20} fill="#FFFFFF" />
          </div>
          <span style={{ fontWeight: '800', fontSize: '1.4rem', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-hover))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            EcoTrack
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-only-flex">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {visibleNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`btn`}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeTab === item.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  padding: '0.5rem 1rem',
                  fontSize: '0.95rem',
                  fontWeight: activeTab === item.id ? '700' : '500'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* User widget / Auth buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
            {theme === 'dark' ? (
              <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px' }} title="Light Mode">
                <Sun size={18} style={{ color: 'var(--warning)' }} />
              </button>
            ) : (
              <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px' }} title="Dark Mode">
                <Moon size={18} style={{ color: 'var(--text-secondary)' }} />
              </button>
            )}

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Streak widget */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(245, 158, 11, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }} title="Daily Streak">
                  <Flame size={16} fill="var(--warning)" style={{ color: 'var(--warning)' }} />
                  <span style={{ fontWeight: '700', color: 'var(--warning)', fontSize: '0.9rem' }}>{user.streak}d</span>
                </div>

                {/* Level / XP info */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.8rem' }}>
                  <span style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>Lvl {user.level}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{user.xp} XP</span>
                </div>

                {/* Logout */}
                <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.5rem 0.8rem' }} title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button onClick={() => openAuthModal('login')} className="btn btn-primary">
                Join Now
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu triggers */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1rem' }} className="mobile-only-flex">
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '10px', fontSize: '0.85rem' }}>
              <Flame size={14} fill="var(--warning)" style={{ color: 'var(--warning)' }} />
              <span style={{ fontWeight: '700', color: 'var(--warning)' }}>{user.streak}d</span>
            </div>
          )}
          {theme === 'dark' ? (
            <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
              <Sun size={16} style={{ color: 'var(--warning)' }} />
            </button>
          ) : (
            <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
              <Moon size={16} style={{ color: 'var(--text-secondary)' }} />
            </button>
          )}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-secondary" 
            style={{ padding: '0.5rem' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="card" style={{
            position: 'absolute',
            top: '5.5rem',
            left: '1rem',
            right: '1rem',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
            borderTop: '3px solid var(--accent-primary)',
            zIndex: 998
          }}>
            {visibleNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="btn"
                style={{
                  width: '100%',
                  background: activeTab === item.id ? 'var(--accent-light)' : 'none',
                  border: 'none',
                  color: activeTab === item.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                  justifyContent: 'flex-start',
                  padding: '0.75rem 1rem'
                }}
              >
                {item.label}
              </button>
            ))}

            <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }}></div>

            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Level {user.level} Explorer</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-primary)' }}>{user.xp} XP</span>
                </div>
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }} 
                  className="btn btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }} 
                className="btn btn-primary" 
                style={{ width: '100%' }}
              >
                Join Now
              </button>
            )}
          </div>
        )}

      </div>

      {/* Inject custom css for hiding/showing desktop/mobile navbar layouts */}
      <style>{`
        .desktop-only-flex {
          display: flex !important;
        }
        .mobile-only-flex {
          display: none !important;
        }
        @media (max-width: 768px) {
          .desktop-only-flex {
            display: none !important;
          }
          .mobile-only-flex {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  );
}
