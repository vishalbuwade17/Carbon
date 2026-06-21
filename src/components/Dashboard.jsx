import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingDown, TrendingUp, Zap, Award, Shield, Flame, 
  HelpCircle, Compass, Cpu, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, Cell, PieChart, Pie, Legend 
} from 'recharts';

export default function Dashboard({ setActiveTab }) {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    hasData: false,
    latestLog: null,
    averageCitizenTotal: 1200,
    targetGoalTotal: 800,
    historicalTrends: [],
    badges: []
  });

  // AI Report State
  const [aiReport, setAiReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch('/api/carbon/dashboard-summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const summary = await res.json();
          setData(summary);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchAiReport() {
      try {
        const res = await fetch('/api/ai/weekly-report', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const report = await res.json();
          setAiReport(report);
        }
      } catch (err) {
        console.error('Failed to load AI report:', err);
      } finally {
        setAiLoading(false);
      }
    }

    if (token) {
      fetchDashboardData();
      fetchAiReport();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent-light)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading your eco footprint...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Define values for layout
  const latestLog = data.latestLog;
  const target = data.targetGoalTotal;
  const baseline = data.averageCitizenTotal;

  // Chart 1: Historical Trends
  const trendData = data.historicalTrends.map(item => ({
    name: item.log_date,
    Emissions: item.total
  }));

  // Chart 2: Category Breakdown
  const pieData = latestLog ? [
    { name: 'Transportation', value: latestLog.transportation, color: '#3B82F6' },
    { name: 'Electricity', value: latestLog.electricity, color: '#F59E0B' },
    { name: 'Food/Diet', value: latestLog.food, color: '#10B981' },
    { name: 'Water Usage', value: latestLog.water, color: '#06B6D4' },
    { name: 'Waste Production', value: latestLog.waste, color: '#8B5CF6' }
  ].filter(item => item.value > 0) : [];

  // Chart 3: Comparisons
  const comparisonData = [
    { name: 'Your Emissions', value: latestLog ? latestLog.total : 0, color: 'var(--accent-primary)' },
    { name: 'Eco Goal Target', value: target, color: '#10B981' },
    { name: 'Average Citizen', value: baseline, color: '#4B5563' }
  ];

  // Calculate percentage of target goal
  const userTotal = latestLog ? latestLog.total : 0;
  const isGoalAchieved = userTotal <= target;

  // XP level parameters
  const xpInCurrentLevel = user.xp % 500;
  const xpPercent = (xpInCurrentLevel / 500) * 100;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Hello, {user.name} 👋</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome to your sustainability control center.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setActiveTab('calculator')} className="btn btn-primary">
            Record New Log
          </button>
          <button onClick={() => setActiveTab('simulator')} className="btn btn-secondary">
            Simulate Reductions
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        
        {/* Metric 1: Monthly Total */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Monthly CO₂ Output</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: '800' }}>
              {data.hasData ? `${userTotal} kg` : 'No Logs'}
            </span>
          </div>
          {data.hasData && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
              {userTotal <= baseline ? (
                <>
                  <TrendingDown size={14} style={{ color: 'var(--success)' }} />
                  <span style={{ color: 'var(--success)', fontWeight: '600' }}>
                    {Math.round(((baseline - userTotal) / baseline) * 100)}% below average
                  </span>
                </>
              ) : (
                <>
                  <TrendingUp size={14} style={{ color: 'var(--danger)' }} />
                  <span style={{ color: 'var(--danger)', fontWeight: '600' }}>
                    {Math.round(((userTotal - baseline) / baseline) * 100)}% above average
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Metric 2: XP & Level */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Eco Level Progress</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-primary)' }}>Level {user.level}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.xp} XP</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden', marginTop: '0.25rem' }}>
            <div style={{ width: `${xpPercent}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '3px' }}></div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{500 - xpInCurrentLevel} XP to Level {user.level + 1}</span>
        </div>

        {/* Metric 3: Active Streak */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Active Day Streak</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--warning)' }}>{user.streak} Days</span>
            <Flame size={28} fill="var(--warning)" style={{ color: 'var(--warning)', animation: 'bounce 2s infinite' }} />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Complete tasks to grow your streak!</span>
        </div>

        {/* Metric 4: Goal Status */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Eco Goal Tracker</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: isGoalAchieved && data.hasData ? 'var(--success)' : 'var(--text-primary)' }}>
              {data.hasData ? `${Math.round((userTotal / target) * 100)}%` : '0%'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>of {target} kg goal</span>
          </div>
          {data.hasData && (
            <span style={{ fontSize: '0.8rem', color: isGoalAchieved ? 'var(--success)' : 'var(--warning)', fontWeight: '500' }}>
              {isGoalAchieved ? '✓ Emission target met!' : `⚠️ Need to cut ${Math.round(userTotal - target)} kg`}
            </span>
          )}
        </div>

      </div>

      {/* Main Charts & Analytics Block */}
      {!data.hasData ? (
        <div className="card text-center" style={{ padding: '4rem 2rem', border: '2px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: 'var(--accent-primary)' }}>
            <Compass size={32} />
          </div>
          <div>
            <h2>No Carbon Log Found for this Month</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0.5rem auto' }}>
              Welcome to EcoTrack! Run your first footprint analysis using our calculator to view interactive charts, carbon breakdowns, and comparisons.
            </p>
          </div>
          <button onClick={() => setActiveTab('calculator')} className="btn btn-primary">
            Launch Footprint Calculator
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
          
          {/* Chart 1: Historical Area Chart (Grid Span 2) */}
          <div className="card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', height: '400px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem' }}>Emissions History Trends</h3>
            <div style={{ flexGrow: 1, width: '100%', height: '80%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--bg-secondary)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)'
                    }} 
                  />
                  <Area type="monotone" dataKey="Emissions" stroke="var(--accent-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorEmissions)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Category Pie Chart */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Category Breakdown</h3>
            <div style={{ flexGrow: 1, width: '100%', height: '65%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} kg`, 'CO₂']}
                    contentStyle={{ 
                      background: 'var(--bg-secondary)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: 'var(--radius-sm)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Category Custom Legend */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              {pieData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></span>
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                    {item.name}: <strong>{item.value}kg</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 3: User vs Target Comparison Bar Chart */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '320px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem' }}>Emissions Benchmarks</h3>
            <div style={{ flexGrow: 1, width: '100%', height: '80%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={9} />
                  <YAxis stroke="var(--text-secondary)" fontSize={10} />
                  <Tooltip 
                    formatter={(value) => [`${value} kg`, 'CO₂']}
                    contentStyle={{ 
                      background: 'var(--bg-secondary)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: 'var(--radius-sm)'
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Weekly Sustainability Report Widget (Span 2) */}
          <div className="card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: 'var(--accent-primary)' }}>
                <Cpu size={16} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>AI Sustainability Advisor</h3>
              <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.1rem 0.5rem', borderRadius: '50px', fontWeight: '600', marginLeft: 'auto' }}>
                Active Advisor
              </span>
            </div>
            
            {aiLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 0' }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid var(--accent-light)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>AI is analyzing your consumption logs...</span>
              </div>
            ) : aiReport ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    <span>Weekly Performance Report</span>
                    <span>{aiReport.reportDate}</span>
                  </div>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.5', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${aiReport.trend === 'down' ? 'var(--success)' : aiReport.trend === 'up' ? 'var(--danger)' : 'var(--warning)'}` }}>
                    {aiReport.summary}
                  </p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', fontSize: '0.9rem' }}>
                  <div>
                    <h4 style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Monthly Carbon Projections</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {aiReport.prediction}
                    </p>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Suggested Action Plan</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {aiReport.suggestedGoal}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Unable to load advisor report at this time.</span>
            )}
          </div>

        </div>
      )}

      {/* Badges / Achievements shelf */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Your Sustainable Achievements</h3>
          <button onClick={() => setActiveTab('challenges')} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
            Browse Challenges <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-5" style={{ gap: '1rem' }}>
          {[
            { name: 'Eco Starter', description: 'Joined the platform.', icon: Award, unlocked: true },
            { name: 'Carbon Cutter', description: 'Emissions below 800 kg.', icon: TrendingDown, unlocked: data.badges.some(b => b.name === 'Carbon Cutter') },
            { name: 'Streak Specialist', description: 'Complete tasks 3 days in a row.', icon: Flame, unlocked: data.badges.some(b => b.name === 'Streak Specialist') },
            { name: 'Energy Savior', description: 'Reached Level 3 explorer.', icon: Zap, unlocked: data.badges.some(b => b.name === 'Energy Savior') },
            { name: 'Eco Champion', description: 'Reached Level 5 explorer.', icon: Shield, unlocked: data.badges.some(b => b.name === 'Eco Champion') }
          ].map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div 
                key={idx} 
                className={`badge-item ${badge.unlocked ? 'earned' : 'locked'}`}
                title={badge.description}
              >
                <div className="badge-icon">
                  <Icon size={24} />
                </div>
                <span style={{ fontWeight: '700', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{badge.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {badge.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
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
          .grid-cols-5 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
