import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware.js';

const router = express.Router();

// GET /recommendations
router.get('/recommendations', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const db = await getDb();
    
    // Get latest log
    const latestLog = await db.get(
      'SELECT * FROM carbon_logs WHERE user_id = ? ORDER BY log_date DESC LIMIT 1',
      [userId]
    );

    const recs = [];

    // Base recommendations if no log is present
    if (!latestLog) {
      recs.push(
        { category: 'transportation', title: 'Cycle for Local Commutes', suggestion: 'Ride a bicycle instead of driving for trips under 3 miles.', savings: 15, difficulty: 'Easy', impact: 'Medium' },
        { category: 'energy', title: 'Switch to LED Bulbs', suggestion: 'Replace old incandescent lights with modern LED alternatives.', savings: 25, difficulty: 'Easy', impact: 'High' },
        { category: 'diet', title: 'Embrace Meatless Mondays', suggestion: 'Cut meat consumption for one day a week to significantly lower methane footprint.', savings: 20, difficulty: 'Easy', impact: 'Medium' },
        { category: 'waste', title: 'Refuse Single-Use Plastics', suggestion: 'Carry reusable grocery bags and coffee mugs to eliminate plastic bags and cups.', savings: 12, difficulty: 'Easy', impact: 'Low' }
      );
      return res.json(recs);
    }

    // Dynamic advice based on user logs
    // 1. Transportation analysis
    if (latestLog.transportation > 150) {
      recs.push({
        category: 'transportation',
        title: 'Adopt Hybrid Commuting',
        suggestion: `Your transportation emissions (${latestLog.transportation} kg CO₂) are high. Try carpooling or taking public transit twice a week.`,
        savings: Math.round(latestLog.transportation * 0.25),
        difficulty: 'Medium',
        impact: 'High'
      });
      recs.push({
        category: 'transportation',
        title: 'Consolidate Flights',
        suggestion: 'Consider joining business meetings virtually or choosing train routes for domestic transit under 400 miles.',
        savings: 180,
        difficulty: 'Hard',
        impact: 'High'
      });
    } else {
      recs.push({
        category: 'transportation',
        title: 'Keep Up Bike Commutes',
        suggestion: 'Your transport emissions are excellent! Maintain active walking/cycling for short errands.',
        savings: 8,
        difficulty: 'Easy',
        impact: 'Medium'
      });
    }

    // 2. Electricity/Energy analysis
    if (latestLog.electricity > 100) {
      recs.push({
        category: 'energy',
        title: 'Eliminate Standby Power Draw',
        suggestion: `Your electricity footprint is ${latestLog.electricity} kg. Unplug major appliances or use smart power strips for entertainment hubs.`,
        savings: 12,
        difficulty: 'Easy',
        impact: 'Medium'
      });
      recs.push({
        category: 'energy',
        title: 'Calibrate Thermostat Setting',
        suggestion: 'Lower your thermostat by 2°F during winter nights and raise it by 2°F during summer afternoons.',
        savings: 40,
        difficulty: 'Easy',
        impact: 'High'
      });
    } else {
      recs.push({
        category: 'energy',
        title: 'Optimize Lighting Schedules',
        suggestion: 'Make sure your home lights turn off automatically or use motion detectors in hallways.',
        savings: 5,
        difficulty: 'Easy',
        impact: 'Low'
      });
    }

    // 3. Food/Diet analysis
    if (latestLog.food > 120) {
      recs.push({
        category: 'diet',
        title: 'Transition to Flexitarian Eating',
        suggestion: 'Replace beef or lamb dishes with poultry, fish, or vegetable proteins 3 days a week.',
        savings: Math.round(latestLog.food * 0.3),
        difficulty: 'Medium',
        impact: 'High'
      });
    } else {
      recs.push({
        category: 'diet',
        title: 'Prioritize Local/Seasonal Food',
        suggestion: 'Your plant-centric diet is great. Further reduce footprint by buying organic, zero-mile local produce.',
        savings: 10,
        difficulty: 'Easy',
        impact: 'Medium'
      });
    }

    // 4. Waste analysis
    if (latestLog.waste > 20) {
      recs.push({
        category: 'waste',
        title: 'Set Up Home Composting',
        suggestion: `Your waste output is ${latestLog.waste} kg. Composting fruit peels and coffee grounds keeps organic matter out of methane-producing landfills.`,
        savings: Math.round(latestLog.waste * 0.4),
        difficulty: 'Medium',
        impact: 'Medium'
      });
    }

    // 5. Water analysis
    if (latestLog.water > 20) {
      recs.push({
        category: 'water',
        title: 'Install Aerated Flow Valves',
        suggestion: 'Add low-cost aerators to kitchen and bathroom faucets to restrict flow rates without reducing pressure.',
        savings: 15,
        difficulty: 'Easy',
        impact: 'Medium'
      });
    }

    res.json(recs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// GET /weekly-report
router.get('/weekly-report', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const db = await getDb();
    
    // Get last two logs
    const logs = await db.all(
      'SELECT log_date, total, transportation, electricity, food, water, waste FROM carbon_logs WHERE user_id = ? ORDER BY log_date DESC LIMIT 2',
      [userId]
    );

    const user = await db.get('SELECT name FROM users WHERE id = ?', [userId]);

    let predictionText = '';
    let summaryText = '';
    let goalText = '';
    let trendDirection = 'stable';
    let percentChange = 0;
    let nextMonthPrediction = 900; // baseline

    if (logs.length === 2) {
      const current = logs[0].total;
      const previous = logs[1].total;
      percentChange = Math.round(((current - previous) / previous) * 100 * 10) / 10;
      
      if (percentChange < 0) {
        trendDirection = 'down';
        summaryText = `Incredible work, ${user.name}! Your carbon emissions decreased by ${Math.abs(percentChange)}% compared to last month. Keep up this momentum! You made outstanding progress in reducing your carbon footprint.`;
        nextMonthPrediction = Math.round(current * (1 + percentChange / 100) * 10) / 10;
        predictionText = `If you maintain your current eco-habits, next month's predicted footprint is ${nextMonthPrediction} kg CO₂. This is well on track to beating your reduction goals.`;
        goalText = `Your next milestone: Aim for a further 5% reduction next month (Target: ${Math.round(nextMonthPrediction * 0.95)} kg CO₂). Try swapping one additional car trip for walking or public transit.`;
      } else if (percentChange > 0) {
        trendDirection = 'up';
        summaryText = `Hi ${user.name}, your carbon emissions saw an increase of ${percentChange}% this month. Let's analyze your logs to identify areas where we can make green cuts together.`;
        nextMonthPrediction = Math.round(current * 0.92); // predict reduction if they follow recommendations
        predictionText = `Without changes, you are on track to emit ${Math.round(current * (1 + percentChange/100))} kg CO₂ next month. However, if you adopt our recommended energy saving suggestions, we predict you can lower this to ${nextMonthPrediction} kg CO₂.`;
        goalText = `Your next milestone: Focus on your largest emitting category. Try limiting warm water showers and setting smart timers on high-energy appliances.`;
      } else {
        summaryText = `Hi ${user.name}, your emissions remained stable this month at ${current} kg CO₂. You have established a solid baseline, and now we can target specific areas to start cutting down further.`;
        nextMonthPrediction = Math.round(current * 0.95);
        predictionText = `We predict a modest decrease to ${nextMonthPrediction} kg CO₂ next month if you implement minor diet tweaks (like one meatless day).`;
        goalText = `Your next milestone: Target diet and waste. Swap one red-meat meal per week for a plant-based alternative to see immediate changes in your food log.`;
      }
    } else if (logs.length === 1) {
      const current = logs[0].total;
      summaryText = `Welcome to EcoTrack, ${user.name}! You recorded your first carbon footprint log of ${current} kg CO₂. This establishes your sustainability baseline. We can now compare your future entries to track your savings.`;
      nextMonthPrediction = Math.round(current * 0.95);
      predictionText = `With active participation in daily challenges, we predict you can easily decrease your footprint to ${nextMonthPrediction} kg CO₂ next month.`;
      goalText = `Your first major milestone: Complete at least 5 daily eco challenges and log your data again next month. Keep a target to bring your total under 800 kg CO₂.`;
    } else {
      summaryText = `Welcome to EcoTrack! You haven't submitted your first carbon footprint log yet. Head over to the Calculator to record your footprint and receive a personalized AI sustainability report.`;
      predictionText = `We predict that logging your emissions will trigger an immediate awareness effect, typically leading to a 10% voluntary carbon footprint reduction in the first month.`;
      goalText = `Your initial milestone: Run the Carbon Calculator demo or log your current monthly household parameters to get started.`;
    }

    res.json({
      userName: user ? user.name : 'Eco User',
      summary: summaryText,
      trend: trendDirection,
      percentChange,
      prediction: predictionText,
      nextMonthPrediction: Math.round(nextMonthPrediction),
      suggestedGoal: goalText,
      reportDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate weekly report' });
  }
});

export default router;
