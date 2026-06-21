import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware.js';

const router = express.Router();

// GET /articles
router.get('/articles', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const articles = await db.all('SELECT * FROM articles ORDER BY id DESC');
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve articles' });
  }
});

// GET /articles/:id
router.get('/articles/:id', authenticateToken, async (req, res) => {
  const articleId = req.params.id;
  try {
    const db = await getDb();
    const article = await db.get('SELECT * FROM articles WHERE id = ?', [articleId]);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve article details' });
  }
});

export default router;
