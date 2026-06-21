import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Car, Lightbulb, Utensils, Droplet, Trash2, 
  ArrowRight, ArrowLeft, Send, Sparkles, CheckCircle2, ShieldAlert 
} from 'lucide-react';

export default function Calculator({ setActiveTab }) {
  const { user, token, updateUserLocal, openAuthModal } = useAuth();
  
  // Multistep Form State
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState({
    carMiles: '',
    flightsCount: '',
    electricityKwh: '',
    dietType: 'average',
    waterGallons: '',
    wasteKg: ''
  });

  // Output Result State (for Guest or Success screen)
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  const handleInputChange = (e) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  // Compute offline preview values
  const getCalculatedValues = () => {
    const car = (parseFloat(inputs.carMiles) || 0) * 0.404;
    const flights = (parseFloat(inputs.flightsCount) || 0) * 220;
    const transTotal = Math.round((car + flights) * 10) / 10;
    const elec = Math.round((parseFloat(inputs.electricityKwh) || 0) * 0.85 * 10) / 10;

    let diet = 150;
    if (inputs.dietType === 'vegan') diet = 60;
    else if (inputs.dietType === 'vegetarian') diet = 90;
    else if (inputs.dietType === 'pescatarian') diet = 114;
    else if (inputs.dietType === 'average') diet = 150;
    else if (inputs.dietType === 'meat-heavy') diet = 225;

    const water = Math.round((parseFloat(inputs.waterGallons) || 0) * 0.003 * 10) / 10;
    const waste = Math.round((parseFloat(inputs.wasteKg) || 0) * 0.9 * 10) / 10;
    const total = Math.round((transTotal + elec + diet + water + waste) * 10) / 10;

    return { transportation: transTotal, electricity: elec, food: diet, water, waste, total };
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const computedValues = getCalculatedValues();

    if (!user) {
      // Guest calculation sandbox
      setResult(computedValues);
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/carbon/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          carMiles: inputs.carMiles || 0,
          flightsCount: inputs.flightsCount || 0,
          electricityKwh: inputs.electricityKwh || 0,
          dietType: inputs.dietType,
          waterGallons: inputs.waterGallons || 0,
          wasteKg: inputs.wasteKg || 0
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessInfo(data);
        setResult(computedValues);
        
        // Update user stats in local storage context
        updateUserLocal({
          xp: data.newXp,
          level: data.newLevel,
          streak: data.newStreak
        });
      } else {
        alert('Could not submit log. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error submitting carbon log.');
    } finally {
      setSubmitting(false);
    }
  };

  // Steps rendering mapping
  const stepsTitles = [
    'Transportation Footprint',
    'Household Electricity',
    'Dietary Habits',
    'Water Utility',
    'Waste Production'
  ];

  const renderFormStep = () => {
    switch(step) {
      case 1:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--accent-primary)' }}>
              <Car size={24} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Travel Log</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Enter travel habits. Average American drives roughly 1,000 miles/month.
            </p>
            <div className="form-group">
              <label className="form-label" htmlFor="carMiles">Monthly Driving Distance (Miles)</label>
              <input 
                className="form-control"
                type="number"
                name="carMiles"
                id="carMiles"
                value={inputs.carMiles}
                onChange={handleInputChange}
                placeholder="e.g. 800"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="flightsCount">Number of Short Flights Taken (This Month)</label>
              <input 
                className="form-control"
                type="number"
                name="flightsCount"
                id="flightsCount"
                value={inputs.flightsCount}
                onChange={handleInputChange}
                placeholder="e.g. 1"
                min="0"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--accent-primary)' }}>
              <Lightbulb size={24} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Electricity Utility</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Enter electricity consumption. The average household consumes ~900 kWh per month.
            </p>
            <div className="form-group">
              <label className="form-label" htmlFor="electricityKwh">Electricity Consumption (kWh)</label>
              <input 
                className="form-control"
                type="number"
                name="electricityKwh"
                id="electricityKwh"
                value={inputs.electricityKwh}
                onChange={handleInputChange}
                placeholder="e.g. 650"
                min="0"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--accent-primary)' }}>
              <Utensils size={24} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Food Consumption</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Select food profiles. Plant-based diets reduce methane and farming land carbon emissions significantly.
            </p>
            <div className="form-group">
              <label className="form-label" htmlFor="dietType">Primary Diet Type</label>
              <select 
                className="form-control"
                name="dietType"
                id="dietType"
                value={inputs.dietType}
                onChange={handleInputChange}
              >
                <option value="meat-heavy">Meat Heavy (Frequent red meat/beef)</option>
                <option value="average">Standard Average (Mixed meat/vegetables)</option>
                <option value="pescatarian">Pescatarian (Fish & veggies only)</option>
                <option value="vegetarian">Vegetarian (Dairy, eggs, no meat)</option>
                <option value="vegan">Vegan (100% Plant-Based)</option>
              </select>
            </div>
          </div>
        );
      case 4:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--accent-primary)' }}>
              <Droplet size={24} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Water Footprint</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Water treatment and distribution consume power. Enter monthly water consumption in gallons.
            </p>
            <div className="form-group">
              <label className="form-label" htmlFor="waterGallons">Monthly Water Intake (Gallons)</label>
              <input 
                className="form-control"
                type="number"
                name="waterGallons"
                id="waterGallons"
                value={inputs.waterGallons}
                onChange={handleInputChange}
                placeholder="e.g. 1500"
                min="0"
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--accent-primary)' }}>
              <Trash2 size={24} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Waste Production</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Un-recycled waste decaying in landfills produces methane. Enter weekly/monthly garbage production in kilograms.
            </p>
            <div className="form-group">
              <label className="form-label" htmlFor="wasteKg">Monthly Solid Waste (kg)</label>
              <input 
                className="form-control"
                type="number"
                name="wasteKg"
                id="wasteKg"
                value={inputs.wasteKg}
                onChange={handleInputChange}
                placeholder="e.g. 30"
                min="0"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '650px' }}>
      
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>Carbon Footprint Calculator</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Calculate your monthly carbon score in 5 quick steps.</p>
      </div>

      {!result ? (
        <div className="card glow-top">
          {/* Progress bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            <span>Step {step} of 5</span>
            <span>{stepsTitles[step - 1]}</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${(step / 5) * 100}%` }}></div>
          </div>

          <form onSubmit={handleFormSubmit}>
            {/* Step Content */}
            <div style={{ minHeight: '180px', marginBottom: '2rem' }}>
              {renderFormStep()}
            </div>

            {/* Step Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="btn btn-secondary">
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <div></div>
              )}

              {step < 5 ? (
                <button type="button" onClick={nextStep} className="btn btn-primary">
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Calculating...' : (
                    <>
                      Submit Logs <Send size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        /* Results View screen */
        <div className="card glow-top" style={{ textAlign: 'center', padding: '2.5rem' }}>
          
          {successInfo && successInfo.success ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(52, 211, 153, 0.1)', color: 'var(--success)', padding: '0.4rem 1.2rem', borderRadius: '50px', marginBottom: '1.5rem' }}>
              <CheckCircle2 size={16} />
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Logged! Earned +{successInfo.xpGained} XP</span>
            </div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.4rem 1.2rem', borderRadius: '50px', marginBottom: '1.5rem' }}>
              <ShieldAlert size={16} />
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Sandbox Preview (Not Saved)</span>
            </div>
          )}

          <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Footprint Results</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Your monthly carbon emissions total</p>

          <span style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--accent-primary)', display: 'block', lineHeight: '1' }}>
            {result.total} kg
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginTop: '0.5rem', marginBottom: '2rem' }}>
            CO₂ Equivalent
          </span>

          {/* Breakdown cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', margin: '0 auto 2rem auto', fontSize: '0.8rem' }}>
            {[
              { label: 'Transport', val: result.transportation, col: '#3B82F6' },
              { label: 'Energy', val: result.electricity, col: '#F59E0B' },
              { label: 'Food', val: result.food, col: '#10B981' },
              { label: 'Water', val: result.water, col: '#06B6D4' },
              { label: 'Waste', val: result.waste, col: '#8B5CF6' }
            ].map((cat, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.7rem' }}>{cat.label}</span>
                <strong style={{ color: cat.col, fontSize: '0.85rem' }}>{cat.val}kg</strong>
              </div>
            ))}
          </div>

          {!user ? (
            <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
              <h4 style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} style={{ color: 'var(--warning)' }} /> Save Historical Trends
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                Create a free account to store this log, track progress towards reduction goals, complete daily challenges for points, and unlock achievements!
              </p>
              <button onClick={() => openAuthModal('signup')} className="btn btn-primary" style={{ width: '100%' }}>
                Create Account & Save
              </button>
            </div>
          ) : (
            successInfo && successInfo.levelUp && (
              <div className="alert alert-success" style={{ margin: '0 auto 2rem auto', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                  🎉 Level Up!
                </strong>
                <span style={{ fontSize: '0.85rem' }}>
                  You have advanced to **Level {successInfo.newLevel}**! Browse your profile badges to check your unlocks.
                </span>
              </div>
            )
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => {
                setResult(null);
                setSuccessInfo(null);
                setStep(1);
                setInputs({ carMiles: '', flightsCount: '', electricityKwh: '', dietType: 'average', waterGallons: '', wasteKg: '' });
              }} 
              className="btn btn-secondary"
            >
              Re-calculate
            </button>
            {user && (
              <button onClick={() => setActiveTab('dashboard')} className="btn btn-primary">
                Go To Dashboard <ArrowRight size={16} />
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
