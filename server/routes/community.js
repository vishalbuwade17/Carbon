import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware.js';

const router = express.Router();

// GET /stats
router.get('/stats', async (req, res) => {
  try {
    const db = await getDb();
    
    // Calculate total carbon saved relative to baseline (1200 kg per user per month)
    const savingsQuery = await db.get(`
      SELECT SUM(CASE WHEN total < 1200 THEN 1200 - total ELSE 0 END) as total_saved
      FROM carbon_logs
    `);

    const carbonSaved = savingsQuery.total_saved || 0;
    
    // Equivalents:
    // 1 tree absorbs ~22kg of CO2 per year (1.83kg per month)
    // 1 passenger car emits ~4600kg CO2 per year (383kg per month)
    const treesSaved = Math.round(carbonSaved / 1.83);
    const carsRemoved = Math.round((carbonSaved / 383) * 10) / 10;

    // Get total logs count & active users count
    const activityQuery = await db.get('SELECT COUNT(DISTINCT user_id) as active_count, COUNT(id) as total_logs FROM carbon_logs');
    
    res.json({
      collectiveSavedKg: Math.round(carbonSaved * 10) / 10,
      treesSaved,
      carsRemoved,
      activeUsers: activityQuery.active_count || 0,
      totalCalculations: activityQuery.total_logs || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve community stats' });
  }
});

// GET /leaderboard
router.get('/leaderboard', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    
    // Top 10 users by XP
    const leaderboard = await db.all(`
      SELECT id, name, xp, level, streak 
      FROM users 
      ORDER BY xp DESC 
      LIMIT 10
    `);

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
