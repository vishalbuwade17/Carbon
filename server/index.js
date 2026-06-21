import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getDb } from './db.js';
import { seedDb } from './seed.js';

// Routers
import authRouter from './routes/auth.js';
import carbonRouter from './routes/carbon.js';
import challengesRouter from './routes/challenges.js';
import communityRouter from './routes/community.js';
import eduRouter from './routes/edu.js';
import aiRouter from './routes/ai.js';
import adminRouter from './routes/admin.js';

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Register API Routes
app.use('/api/auth', authRouter);
app.use('/api/carbon', carbonRouter);
app.use('/api/challenges', challengesRouter);
app.use('/api/community', communityRouter);
app.use('/api/edu', eduRouter);
app.use('/api/ai', aiRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Serve frontend static assets in production
const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--production');
if (isProduction) {
  const distPath = path.resolve(__dirname, '../dist');
  app.use(express.static(distPath));
  
  // React fallback router
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Database startup & Seed
async function startServer() {
  try {
    console.log('Connecting to database...');
    await getDb();
    console.log('Database connected.');
    
    console.log('Seeding database if empty...');
    await seedDb();
    
    app.listen(PORT, () => {
      console.log(`============================================`);
      console.log(` EcoTrack server running on port ${PORT}`);
      console.log(` Mode: ${isProduction ? 'Production' : 'Development'}`);
      console.log(`============================================`);
    });
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
}

startServer();
