import { useState } from 'react';
import { Info, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function Simulator() {
  // Simulation Inputs (Percentage shifts)
  const [commuteShift, setCommuteShift] = useState(0); // 0% to 100% reduction in driving
  const [dietShift, setDietShift] = useState(0);    // 0% to 100% shift to plant-based meals
  const [energyShift, setEnergyShift] = useState(0);  // 0% to 100% electricity savings / solar transition

  // Baselines (kg CO2)
  const baselineTransport = 480;
  const baselineElectricity = 260;
  const baselineDiet = 180;
  const baselineOther = 80;
  const baselineTotal = baselineTransport + baselineElectricity + baselineDiet + baselineOther; // 1000 kg

  // Calculate simulated outputs on-the-fly during render (Performance Best Practice)
  const tNew = Math.max(0, baselineTransport * (1 - commuteShift / 100));
  const eNew = Math.max(0, baselineElectricity * (1 - energyShift / 100));
  // Plant-based diet cuts emissions from 180kg baseline down to 60kg (vegan target)
  const dNew = Math.max(60, baselineDiet - (baselineDiet - 60) * (dietShift / 100));
  const oNew = baselineOther;
  
  const newTotal = tNew + eNew + dNew + oNew;
  const savedMonthly = baselineTotal - newTotal;
  const savedYearly = savedMonthly * 12;

  const simulated = {
    transportation: Math.round(tNew * 10) / 10,
    electricity: Math.round(eNew * 10) / 10,
    food: Math.round(dNew * 10) / 10,
    other: oNew,
    total: Math.round(newTotal * 10) / 10,
    savedMonthly: Math.round(savedMonthly * 10) / 10,
    savedYearly: Math.round(savedYearly * 10) / 10
  };

  // Chart data configuration
  const chartData = [
    { name: 'Baseline Footprint', Value: baselineTotal, color: '#4B5563' },
    { name: 'Simulated Footprint', Value: simulated.total, color: 'var(--accent-primary)' }
  ];

  // Equivalents calculations
  const treesPlantedEquivalent = Math.round(simulated.savedYearly / 22); // 1 tree absorbs ~22kg CO2 per year
  const milesAvoidedEquivalent = Math.round(simulated.savedMonthly / 0.404); // 0.404kg per mile

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>Carbon Reduction Simulator</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Model daily lifestyle changes and forecast your potential CO₂ reductions instantly.
        </p>
      </div>

      <div className="grid grid-cols-2" style={{ alignItems: 'start', gap: '2rem' }}>
        
        {/* Sliders Card */}
        <div className="card glow-top" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={18} style={{ color: 'var(--accent-primary)' }} /> Lifestyle Tuning Sliders
          </h3>

          {/* Slider 1: Commute */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: '0.9rem' }}>
              <span>Reduce Gasoline Travel</span>
              <span style={{ color: 'var(--accent-primary)' }}>-{commuteShift}%</span>
            </div>
            <input 
              type="range" 
              className="slider"
              min="0" 
              max="100" 
              value={commuteShift} 
              onChange={(e) => setCommuteShift(parseInt(e.target.value))}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Walk, cycle, carpool or use public transit instead of single-passenger driving.
            </span>
          </div>

          {/* Slider 2: Diet */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: '0.9rem' }}>
              <span>Shift to Plant-Based Meals</span>
              <span style={{ color: 'var(--accent-primary)' }}>+{dietShift}%</span>
            </div>
            <input 
              type="range" 
              className="slider"
              min="0" 
              max="100" 
              value={dietShift} 
              onChange={(e) => setDietShift(parseInt(e.target.value))}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Replace meat/dairy servings with plant-based protein alternatives.
            </span>
          </div>

          {/* Slider 3: Energy */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: '0.9rem' }}>
              <span>Green Home Energy Offset</span>
              <span style={{ color: 'var(--accent-primary)' }}>{energyShift}%</span>
            </div>
            <input 
              type="range" 
              className="slider"
              min="0" 
              max="100" 
              value={energyShift} 
              onChange={(e) => setEnergyShift(parseInt(e.target.value))}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Switch to energy-efficient appliances, LEDs, or renewable solar energy sources.
            </span>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <Info size={16} style={{ color: '#3B82F6', flexShrink: 0, marginTop: '0.1rem' }} />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              We use default baselines of a standard consumer emitting ~1,000 kg CO₂ monthly to model comparison calculations.
            </p>
          </div>
        </div>

        {/* Visual Results Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Equivalents and Savings Display */}
          <div className="card" style={{ textAlign: 'center', background: 'var(--accent-light)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Simulated Monthly Savings</span>
            <span style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--accent-primary)', display: 'block', margin: '0.5rem 0' }}>
              {simulated.savedMonthly} kg
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              CO₂ saved per month (<strong>{simulated.savedYearly.toLocaleString()} kg</strong> per year)
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <div>
                <strong style={{ fontSize: '1.2rem', display: 'block', color: 'var(--accent-primary)' }}>{treesPlantedEquivalent}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Trees Saved / Year</span>
              </div>
              <div>
                <strong style={{ fontSize: '1.2rem', display: 'block', color: 'var(--accent-primary)' }}>{milesAvoidedEquivalent.toLocaleString()}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Car Miles Cut / Month</span>
              </div>
            </div>
          </div>

          {/* Chart Display */}
          <div className="card" style={{ height: '240px', display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem' }}>Emissions Reduction Outlook</h4>
            <div style={{ flexGrow: 1, width: '100%', height: '80%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <XAxis type="number" stroke="var(--text-secondary)" fontSize={10} domain={[0, 1000]} />
                  <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={10} width={110} />
                  <Tooltip formatter={(value) => [`${value} kg CO₂`]} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} />
                  <Bar dataKey="Value" radius={[0, 4, 4, 0]} barSize={25}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
      
      <style>{`
        @media (max-width: 768px) {
          .grid-cols-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
