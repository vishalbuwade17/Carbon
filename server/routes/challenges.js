import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware.js';

const router = express.Router();

// GET /
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const challenges = await db.all('SELECT * FROM challenges WHERE is_active = 1');
    res.json(challenges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// GET /status
router.get('/status', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  try {
    const db = await getDb();
    const completedToday = await db.all(
      'SELECT challenge_id FROM user_challenges WHERE user_id = ? AND completed_date = ?',
      [userId, today]
    );
    
    // Map to array of IDs
    const completedIds = completedToday.map(row => row.challenge_id);
    res.json(completedIds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch today\'s challenge status' });
  }
});

// POST /complete/:id
router.post('/complete/:id', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const challengeId = parseInt(req.params.id);
  const today = new Date().toISOString().split('T')[0];

  try {
    const db = await getDb();

    // Verify challenge exists
    const challenge = await db.get('SELECT * FROM challenges WHERE id = ? AND is_active = 1', [challengeId]);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Verify not already completed today
    const existing = await db.get(
      'SELECT id FROM user_challenges WHERE user_id = ? AND challenge_id = ? AND completed_date = ?',
      [userId, challengeId, today]
    );
    if (existing) {
      return res.status(400).json({ error: 'Challenge already completed today' });
    }

    // Log completion
    await db.run(
      'INSERT INTO user_challenges (user_id, challenge_id, completed_date) VALUES (?, ?, ?)',
      [userId, challengeId, today]
    );

    // Get user details to calculate streak and XP update
    const user = await db.get('SELECT xp, level, streak, last_active_date FROM users WHERE id = ?', [userId]);
    
    let newStreak = user.streak;
    let streakIncremented = false;

    if (user.last_active_date !== today) {
      if (user.last_active_date) {
        const lastActive = new Date(user.last_active_date);
        const todayDate = new Date(today);
        const diffTime = Math.abs(todayDate - lastActive);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          newStreak += 1;
          streakIncremented = true;
        } else if (diffDays > 1) {
          newStreak = 1;
          streakIncremented = true;
        }
      } else {
        newStreak = 1;
        streakIncremented = true;
      }
    }

    const xpGained = challenge.xp_reward;
    const newXp = user.xp + xpGained;
    const newLevel = Math.floor(newXp / 500) + 1;

    // Update user record
    await db.run(
      'UPDATE users SET xp = ?, level = ?, streak = ?, last_active_date = ? WHERE id = ?',
      [newXp, newLevel, newStreak, today, userId]
    );

    // Check and award badges (e.g. Streak Specialist or general level-up badges)
    const newlyAwardedBadges = [];
    
    // Check Streak Specialist
    if (newStreak >= 3) {
      const badge = await db.get('SELECT id, name, description, icon FROM badges WHERE name = "Streak Specialist"');
      if (badge) {
        const hasBadge = await db.get('SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?', [userId, badge.id]);
        if (!hasBadge) {
          await db.run('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)', [userId, badge.id]);
          newlyAwardedBadges.push(badge);
        }
      }
    }

    // Check level-based badges
    if (newLevel >= 3) {
      const badge = await db.get('SELECT id, name, description, icon FROM badges WHERE name = "Energy Savior"');
      if (badge) {
        const hasBadge = await db.get('SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?', [userId, badge.id]);
        if (!hasBadge) {
          await db.run('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)', [userId, badge.id]);
          newlyAwardedBadges.push(badge);
        }
      }
    }
    
    if (newLevel >= 5) {
      const badge = await db.get('SELECT id, name, description, icon FROM badges WHERE name = "Eco Champion"');
      if (badge) {
        const hasBadge = await db.get('SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?', [userId, badge.id]);
        if (!hasBadge) {
          await db.run('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)', [userId, badge.id]);
          newlyAwardedBadges.push(badge);
        }
      }
    }

    res.json({
      success: true,
      pointsEarned: challenge.points,
      xpGained,
      newXp,
      levelUp: newLevel > user.level,
      newLevel,
      newStreak,
      streakIncremented,
      newlyAwardedBadges
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to complete challenge' });
  }
});

export default router;
