import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Calculator from './components/Calculator';
import Simulator from './components/Simulator';
import Challenges from './components/Challenges';
import Community from './components/Community';
import Education from './components/Education';
import AdminPanel from './components/AdminPanel';

import './styles/app.css';
import './styles/components.css';

function AppContent() {
  const { user } = useAuth();
  
  // Tab Routing ('landing', 'dashboard', 'calculator', 'simulator', 'challenges', 'community', 'education', 'admin')
  const [activeTab, setActiveTab] = useState('landing');
  
  // Theme Manager ('dark' | 'light')
  const [theme, setTheme] = useState(localStorage.getItem('ecotrack_theme') || 'dark');

  useEffect(() => {
    // Set theme custom property attribute on Root html node
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ecotrack_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Enforce Route Protection during render (Performance Best Practice, no useEffect setState)
  const authRequiredTabs = ['dashboard', 'challenges', 'admin'];
  const isProtected = authRequiredTabs.includes(activeTab);
  const displayedTab = (isProtected && !user) ? 'landing' : activeTab;

  // Tab View Dispatcher
  const renderView = () => {
    switch (displayedTab) {
      case 'landing':
        return <LandingPage setActiveTab={setActiveTab} />;
      case 'dashboard':
        return user ? <Dashboard setActiveTab={setActiveTab} /> : <LandingPage setActiveTab={setActiveTab} />;
      case 'calculator':
        return <Calculator setActiveTab={setActiveTab} />;
      case 'simulator':
        return <Simulator />;
      case 'challenges':
        return user ? <Challenges /> : <LandingPage setActiveTab={setActiveTab} />;
      case 'community':
        return <Community />;
      case 'education':
        return <Education />;
      case 'admin':
        return user && user.role === 'admin' ? <AdminPanel /> : <LandingPage setActiveTab={setActiveTab} />;
      default:
        return <LandingPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Background glow structures */}
      <div className="glow-orb orb-top-right"></div>
      <div className="glow-orb orb-bottom-left"></div>

      {/* Global Navigation bar */}
      <Navbar 
        activeTab={displayedTab} 
        setActiveTab={setActiveTab} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />

      {/* View panel wrapper */}
      <main className="main-content">
        {renderView()}
      </main>

      {/* Auth Popup Dialog */}
      <AuthModal />

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem 0',
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-secondary)',
        fontSize: '0.85rem',
        background: 'var(--bg-secondary)',
        position: 'relative',
        zIndex: 2
      }}>
        <div className="container">
          <p>© {new Date().getFullYear()} EcoTrack – Carbon Footprint Awareness Platform. All rights reserved.</p>
          <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', opacity: '0.8' }}>
            Built for visual excellence, hackathon optimization, and sustainability awareness.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
