import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, Activity, Leaf, TreePine, CarFront
} from 'lucide-react';

export default function LandingPage({ setActiveTab }) {
  const { user, openAuthModal } = useAuth();
  const [stats, setStats] = useState({
    collectiveSavedKg: 10420.5,
    treesSaved: 5690,
    carsRemoved: 27.2,
    activeUsers: 342,
    totalCalculations: 820
  });

  // Demo Calculator State
  const [demoInputs, setDemoInputs] = useState({
    diet: 'average',
    commute: 'car',
    energy: 'standard'
  });

  // Calculate demo carbon emissions on-the-fly during render (no state, no useEffect!)
  let demoOutput = 0;
  
  // Diet component
  if (demoInputs.diet === 'vegan') demoOutput += 60;
  else if (demoInputs.diet === 'vegetarian') demoOutput += 90;
  else if (demoInputs.diet === 'average') demoOutput += 150;
  else if (demoInputs.diet === 'meat') demoOutput += 225;

  // Commute component
  if (demoInputs.commute === 'car') demoOutput += 320;
  else if (demoInputs.commute === 'transit') demoOutput += 110;
  else if (demoInputs.commute === 'bike') demoOutput += 0;

  // Energy component
  if (demoInputs.energy === 'led') demoOutput += 90;
  else if (demoInputs.energy === 'standard') demoOutput += 180;
  else if (demoInputs.energy === 'solar') demoOutput += 20;

  // Fetch real statistics from database
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/community/stats');
        if (res.ok) {
          const data = await res.json();
          // Merge custom default stats with real data
          setStats(prev => ({
            ...prev,
            collectiveSavedKg: data.collectiveSavedKg || prev.collectiveSavedKg,
            treesSaved: data.treesSaved || prev.treesSaved,
            carsRemoved: data.carsRemoved || prev.carsRemoved,
            activeUsers: data.activeUsers || prev.activeUsers,
            totalCalculations: data.totalCalculations || prev.totalCalculations
          }));
        }
      } catch (err) {
        console.error('Failed to load community stats:', err);
      }
    }
    fetchStats();
  }, []);

  const handleStart = () => {
    if (user) {
      setActiveTab('dashboard');
    } else {
      openAuthModal('signup');
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Background glow orbs */}
      <div className="glow-orb orb-top-right"></div>
      <div className="glow-orb orb-bottom-left"></div>

      {/* Hero Section */}
      <section style={{ padding: '4rem 0 3rem 0', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--accent-light)',
            border: '1px solid var(--border-color)',
            padding: '0.4rem 1rem',
            borderRadius: '50px',
            marginBottom: '1.5rem'
          }}>
            <Leaf size={14} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-primary)' }}>
              Hackathon Winner & Sustainability Accelerator
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '900',
            lineHeight: '1.1',
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)'
          }}>
            Track Your Footprint.<br />
            <span style={{
              background: 'linear-gradient(95deg, var(--accent-hover), var(--accent-primary), #06B6D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Heal Our Planet.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            marginBottom: '2.5rem',
            lineHeight: '1.6'
          }}>
            EcoTrack empowers you to monitor daily habits, complete fun environmental challenges, and dynamically simulate your carbon reduction impacts. Form a streak and climb the green leaderboards!
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={handleStart} className="btn btn-primary" style={{ padding: '1rem 2rem', borderRadius: '12px', fontSize: '1.05rem' }}>
              Start Tracking Free <ArrowRight size={18} />
            </button>
            <button onClick={() => setActiveTab('calculator')} className="btn btn-secondary" style={{ padding: '1rem 2rem', borderRadius: '12px', fontSize: '1.05rem' }}>
              Quick Calculator
            </button>
          </div>
        </div>
      </section>

      {/* Community Impact Statistics */}
      <section style={{ padding: '2rem 0', position: 'relative', zIndex: 2 }}>
        <div className="container">
          <div className="grid grid-cols-3" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>
                <Activity size={24} />
              </div>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-primary)' }}>
                {stats.collectiveSavedKg.toLocaleString()} kg
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Collective CO₂ Saved
              </span>
            </div>

            <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: '#06B6D4', marginBottom: '0.25rem' }}>
                <TreePine size={24} />
              </div>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#06B6D4' }}>
                {stats.treesSaved.toLocaleString()}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Equivalent Trees Offset
              </span>
            </div>

            <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: 'var(--warning)', marginBottom: '0.25rem' }}>
                <CarFront size={24} />
              </div>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--warning)' }}>
                {stats.carsRemoved.toLocaleString()}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Gas Cars Off Roads
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '4rem 0', position: 'relative', zIndex: 2 }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '800', marginBottom: '3rem' }}>
            Transforming Awareness Into Action
          </h2>
          <div className="grid grid-cols-4">
            <div className="card glow-top" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '800', opacity: '0.15', position: 'absolute', right: '1.5rem', top: '1rem' }}>01</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>1. Calculate</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Input transport mileage, diet plans, and energy utility numbers to map your carbon baseline in minutes.
              </p>
            </div>

            <div className="card glow-top" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '800', opacity: '0.15', position: 'absolute', right: '1.5rem', top: '1rem' }}>02</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>2. Review Insights</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Inspect interactive charts showing carbon logs category breakdowns and comparison meters against averages.
              </p>
            </div>

            <div className="card glow-top" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '800', opacity: '0.15', position: 'absolute', right: '1.5rem', top: '1rem' }}>03</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>3. Play & Earn</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Complete daily environmental challenges, sustain consecutive day streaks, and unlock achievement badges.
              </p>
            </div>

            <div className="card glow-top" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '800', opacity: '0.15', position: 'absolute', right: '1.5rem', top: '1rem' }}>04</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>4. Simulate Savings</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Use interactive carbon sliders to model hypothetical behavioral shifts and forecast future savings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Carbon Calculator Demo */}
      <section style={{ padding: '3rem 0', position: 'relative', zIndex: 2 }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="card" style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>
                Try the Carbon Demo
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Toggle daily habits below to instantly see how choices alter your estimated monthly carbon footprint.
              </p>

              <div className="form-group">
                <label className="form-label">Diet Profile</label>
                <select 
                  className="form-control"
                  value={demoInputs.diet}
                  onChange={(e) => setDemoInputs(prev => ({ ...prev, diet: e.target.value }))}
                >
                  <option value="meat">Meat Heavy (Steaks, Lamb)</option>
                  <option value="average">Standard Mixed Diet</option>
                  <option value="vegetarian">Vegetarian (No meat)</option>
                  <option value="vegan">Vegan (100% Plant-Based)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Weekly Commute Mode</label>
                <select 
                  className="form-control"
                  value={demoInputs.commute}
                  onChange={(e) => setDemoInputs(prev => ({ ...prev, commute: e.target.value }))}
                >
                  <option value="car">Drive Alone (Gasoline Car)</option>
                  <option value="transit">Public Bus & Train routes</option>
                  <option value="bike">Walking or Bicycle commutes</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Home Energy Source</label>
                <select 
                  className="form-control"
                  value={demoInputs.energy}
                  onChange={(e) => setDemoInputs(prev => ({ ...prev, energy: e.target.value }))}
                >
                  <option value="standard">Standard Power Grid Grid</option>
                  <option value="led">Grid + 100% LED bulbs</option>
                  <option value="solar">Rooftop Solar Panel array</option>
                </select>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Est. Monthly Emissions
              </span>
              <span style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--accent-primary)', margin: '0.5rem 0' }}>
                {demoOutput} kg
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                CO₂ Equivalent
              </span>

              {/* Progress gauge comparison */}
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <span>Eco Goal (800kg)</span>
                  <span>US Avg (1200kg)</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: 0, 
                    top: 0, 
                    bottom: 0, 
                    width: `${Math.min(100, (demoOutput / 1200) * 100)}%`, 
                    background: demoOutput <= 800 ? 'var(--success)' : demoOutput <= 1100 ? 'var(--warning)' : 'var(--danger)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease, background 0.3s ease'
                  }}></div>
                </div>
              </div>

              <button 
                onClick={handleStart} 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '1.5rem' }}
              >
                Save Your Profile
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '3rem 0', position: 'relative', zIndex: 2 }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '800', marginBottom: '3rem' }}>
            What EcoTrackers Say
          </h2>
          <div className="grid grid-cols-3">
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifycontent: 'space-between' }}>
              <p style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                "EcoTrack changed how I live. Logging my footprint helped me realize how much carbon was associated with my daily solo driving. I now bike to local errands, and I've locked in a 14-day streak!"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', overflow: 'hidden', border: '1px solid var(--accent-primary)' }}>
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60" alt="Sarah" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Sarah Jenkins</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Level 4 Sustainability Explorer</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifycontent: 'space-between' }}>
              <p style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                "As an admin, the analytics panel is super insightful. I can easily monitor how daily challenges drive community-wide offsets. Plus, the interactive simulator makes planning carbon cuts fun."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', overflow: 'hidden', border: '1px solid var(--accent-primary)' }}>
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60" alt="Marcus" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Marcus Chen</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Eco Council Volunteer</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifycontent: 'space-between' }}>
              <p style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                "The AI sustainability advisor caught that my standby power was driving 100+ kg of CO2 monthly. Unplugged them and bought smart strips. Saving carbon and saving money!"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', overflow: 'hidden', border: '1px solid var(--accent-primary)' }}>
                  <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=60" alt="David" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>David Miller</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Level 3 Carbon Cutter</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section style={{ padding: '4rem 0', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="card" style={{ padding: '3rem', borderTop: '4px solid var(--accent-primary)' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>
              Ready to Join the Conscious Wave?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
              Create your account today, run your first analysis log, and start unlocking achievements as you shrink your carbon footprint.
            </p>
            <button onClick={handleStart} className="btn btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '12px' }}>
              Create Your Free Account <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <style>{`
        @media(max-width: 768px) {
          section {
            padding: 2.5rem 0 !important;
          }
          div.card {
            grid-template-columns: 1fr !important;
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
