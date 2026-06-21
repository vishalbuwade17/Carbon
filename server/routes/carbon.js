import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware.js';

const router = express.Router();

// Helper to calculate carbon footprint
function calculateFootprint(inputs) {
  const { carMiles, flightsCount, electricityKwh, dietType, waterGallons, wasteKg } = inputs;
  
  // Coefficients (kg CO2)
  const transCar = (parseFloat(carMiles) || 0) * 0.404; // 0.404 kg per mile
  const transFlight = (parseFloat(flightsCount) || 0) * 220; // Avg 220 kg per flight hour/segment
  const transportation = transCar + transFlight;

  const electricity = (parseFloat(electricityKwh) || 0) * 0.85; // 0.85 kg per kWh
  
  let diet = 150; // default average
  if (dietType === 'vegan') diet = 60;
  else if (dietType === 'vegetarian') diet = 90;
  else if (dietType === 'pescatarian') diet = 114;
  else if (dietType === 'average') diet = 150;
  else if (dietType === 'meat-heavy') diet = 225;

  const water = (parseFloat(waterGallons) || 0) * 0.003; // 0.003 kg per gallon
  const waste = (parseFloat(wasteKg) || 0) * 0.9; // 0.9 kg per kg of waste

  const total = transportation + electricity + diet + water + waste;

  return {
    transportation: Math.round(transportation * 10) / 10,
    electricity: Math.round(electricity * 10) / 10,
    food: Math.round(diet * 10) / 10,
    water: Math.round(water * 10) / 10,
    waste: Math.round(waste * 10) / 10,
    total: Math.round(total * 10) / 10
  };
}

// Helper to award badges based on XP or carbon footprint
async function awardBadges(db, userId, newXp, carbonTotal) {
  try {
    // Get all badges user doesn't have yet
    const unearnedBadges = await db.all(`
      SELECT * FROM badges 
      WHERE id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = ?)
    `, [userId]);

    for (const badge of unearnedBadges) {
      let shouldAward = false;

      // Check XP threshold
      if (newXp >= badge.xp_threshold) {
        shouldAward = true;
      }

      // Special carbon footprint reduction badge
      if (badge.name === 'Carbon Cutter' && carbonTotal < 800) {
        shouldAward = true;
      }

      if (shouldAward) {
        await db.run(
          'INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)',
          [userId, badge.id]
        );
      }
    }
  } catch (err) {
    console.error('Error awarding badges:', err);
  }
}

// POST /calculate
router.post('/calculate', authenticateToken, async (req, res) => {
  const { carMiles, flightsCount, electricityKwh, dietType, waterGallons, wasteKg, logDate } = req.body;
  const userId = req.user.id;
  
  // Use provided log date or default to current year-month
  const dateStr = logDate || new Date().toISOString().substring(0, 7); // YYYY-MM

  try {
    const db = await getDb();
    
    // Calculate emissions
    const emissions = calculateFootprint({
      carMiles,
      flightsCount,
      electricityKwh,
      dietType,
      waterGallons,
      wasteKg
    });

    const inputsJson = JSON.stringify({
      carMiles,
      flightsCount,
      electricityKwh,
      dietType,
      waterGallons,
      wasteKg
    });

    // Check if log already exists for this month
    const existingLog = await db.get(
      'SELECT id FROM carbon_logs WHERE user_id = ? AND log_date = ?',
      [userId, dateStr]
    );

    let isNewLog = false;
    if (existingLog) {
      await db.run(
        `UPDATE carbon_logs 
         SET transportation = ?, electricity = ?, food = ?, water = ?, waste = ?, total = ?, inputs = ?
         WHERE id = ?`,
        [
          emissions.transportation,
          emissions.electricity,
          emissions.food,
          emissions.water,
          emissions.waste,
          emissions.total,
          inputsJson,
          existingLog.id
        ]
      );
    } else {
      isNewLog = true;
      await db.run(
        `INSERT INTO carbon_logs (user_id, log_date, transportation, electricity, food, water, waste, total, inputs)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          dateStr,
          emissions.transportation,
          emissions.electricity,
          emissions.food,
          emissions.water,
          emissions.waste,
          emissions.total,
          inputsJson
        ]
      );
    }

    // Award XP only for new logs or updates that boost tracking engagement
    let xpGain = isNewLog ? 50 : 15;
    
    // Update user stats
    const user = await db.get('SELECT xp, level, last_active_date, streak FROM users WHERE id = ?', [userId]);
    let newXp = user.xp + xpGain;
    let newLevel = Math.floor(newXp / 500) + 1;
    
    // Update active date and potentially streak
    const today = new Date().toISOString().split('T')[0];
    let newStreak = user.streak;
    
    if (user.last_active_date !== today) {
      if (user.last_active_date) {
        const lastActive = new Date(user.last_active_date);
        const todayDate = new Date(today);
        const diffTime = Math.abs(todayDate - lastActive);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
    }

    await db.run(
      'UPDATE users SET xp = ?, level = ?, streak = ?, last_active_date = ? WHERE id = ?',
      [newXp, newLevel, newStreak, today, userId]
    );

    // Award any badges that the user just became eligible for
    await awardBadges(db, userId, newXp, emissions.total);

    res.json({
      success: true,
      emissions,
      xpGained: xpGain,
      levelUp: newLevel > user.level,
      newLevel,
      newXp,
      newStreak
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record carbon log' });
  }
});

// GET /history
router.get('/history', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const db = await getDb();
    const logs = await db.all(
      'SELECT id, log_date, transportation, electricity, food, water, waste, total, inputs FROM carbon_logs WHERE user_id = ? ORDER BY log_date ASC',
      [userId]
    );
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve carbon history' });
  }
});

// GET /dashboard-summary
router.get('/dashboard-summary', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const db = await getDb();
    
    // Get historical logs
    const logs = await db.all(
      'SELECT log_date, transportation, electricity, food, water, waste, total FROM carbon_logs WHERE user_id = ? ORDER BY log_date DESC LIMIT 6',
      [userId]
    );

    // Get earned badges
    const userBadges = await db.all(`
      SELECT b.name, b.description, b.icon, ub.earned_at
      FROM user_badges ub
      JOIN badges b ON ub.badge_id = b.id
      WHERE ub.user_id = ?
    `, [userId]);

    const averageCitizenTotal = 1200; // 1200 kg CO2 average monthly

    if (logs.length === 0) {
      return res.json({
        hasData: false,
        averageCitizenTotal,
        badges: userBadges
      });
    }

    const latestLog = logs[0];
    const historicalTrends = [...logs].reverse(); // oldest to newest for chart

    res.json({
      hasData: true,
      latestLog,
      averageCitizenTotal,
      targetGoalTotal: 800, // target goal
      historicalTrends,
      badges: userBadges
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

export default router;
