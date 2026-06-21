import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-eco-track-key-12345';

// Helper to check and issue starter badge if missing
async function checkStarterBadge(db, userId) {
  try {
    const badge = await db.get('SELECT id FROM badges WHERE name = "Eco Starter"');
    if (badge) {
      await db.run(
        'INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)',
        [userId, badge.id]
      );
    }
  } catch (err) {
    console.error('Error issuing starter badge:', err);
  }
}

// POST /register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const db = await getDb();
    
    // Check if user exists
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await db.run(
      'INSERT INTO users (name, email, password_hash, role, xp, level, streak) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'user', 0, 1, 0]
    );

    const userId = result.lastID;

    // Award starter badge
    await checkStarterBadge(db, userId);

    // Issue token
    const token = jwt.sign({ id: userId, email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: userId,
        name,
        email,
        role: 'user',
        xp: 0,
        level: 1,
        streak: 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const db = await getDb();
    
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if streak was broken (inactive for more than 1 day)
    let currentStreak = user.streak;
    const today = new Date().toISOString().split('T')[0];
    
    if (user.last_active_date) {
      const lastActive = new Date(user.last_active_date);
      const todayDate = new Date(today);
      const diffTime = Math.abs(todayDate - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        currentStreak = 0; // streak broken
        await db.run('UPDATE users SET streak = 0 WHERE id = ?', [user.id]);
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        streak: currentStreak
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /google-signin
router.post('/google-signin', async (req, res) => {
  const { name, email } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Google authentication details missing' });
  }

  try {
    const db = await getDb();
    
    // Check if user exists
    let user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
      // Create user with dummy password
      const dummyPassword = Math.random().toString(36).substring(2, 15);
      const hashedPassword = await bcrypt.hash(dummyPassword, 10);
      
      const result = await db.run(
        'INSERT INTO users (name, email, password_hash, role, xp, level, streak) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, 'user', 0, 1, 0]
      );
      
      user = {
        id: result.lastID,
        name,
        email,
        role: 'user',
        xp: 0,
        level: 1,
        streak: 0
      };
      
      await checkStarterBadge(db, user.id);
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        streak: user.streak
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Google sign-in failed' });
  }
});

// GET /me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const user = await db.get('SELECT id, name, email, role, xp, level, streak, last_active_date FROM users WHERE id = ?', [req.user.id]);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if streak was broken
    let currentStreak = user.streak;
    const today = new Date().toISOString().split('T')[0];
    
    if (user.last_active_date) {
      const lastActive = new Date(user.last_active_date);
      const todayDate = new Date(today);
      const diffTime = Math.abs(todayDate - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        currentStreak = 0;
        await db.run('UPDATE users SET streak = 0 WHERE id = ?', [user.id]);
      }
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        streak: currentStreak
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
