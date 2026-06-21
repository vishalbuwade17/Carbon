import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware.js';

const router = express.Router();

// GET /analytics (Admin Only)
router.get('/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    
    // User counts
    const usersCount = await db.get('SELECT COUNT(*) as count FROM users');
    
    // Challenge counts
    const challengesCount = await db.get('SELECT COUNT(*) as count FROM challenges WHERE is_active = 1');
    
    // Total carbon logs & average footprint
    const logsQuery = await db.get('SELECT COUNT(*) as count, AVG(total) as avg_footprint FROM carbon_logs');
    
    // Total savings
    const savingsQuery = await db.get(`
      SELECT SUM(CASE WHEN total < 1200 THEN 1200 - total ELSE 0 END) as total_saved
      FROM carbon_logs
    `);

    res.json({
      totalUsers: usersCount.count,
      activeChallenges: challengesCount.count,
      totalLogs: logsQuery.count,
      averageFootprint: logsQuery.avg_footprint ? Math.round(logsQuery.avg_footprint * 10) / 10 : 0,
      totalSavedKg: savingsQuery.total_saved ? Math.round(savingsQuery.total_saved * 10) / 10 : 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve admin analytics' });
  }
});

// GET /users (Admin Only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const users = await db.all('SELECT id, name, email, role, xp, level, streak, created_at FROM users ORDER BY xp DESC');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch platform users list' });
  }
});

// POST /challenges (Admin Only)
router.post('/challenges', authenticateToken, requireAdmin, async (req, res) => {
  const { title, description, category, points, xp_reward } = req.body;
  
  if (!title || !description || !category) {
    return res.status(400).json({ error: 'Title, description and category are required' });
  }

  try {
    const db = await getDb();
    await db.run(
      'INSERT INTO challenges (title, description, category, points, xp_reward, is_active) VALUES (?, ?, ?, ?, ?, 1)',
      [title, description, category, parseInt(points) || 10, parseInt(xp_reward) || 20]
    );
    res.status(201).json({ success: true, message: 'Challenge created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to insert challenge' });
  }
});

export default router;
