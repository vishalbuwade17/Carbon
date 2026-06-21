import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../ecotrack.db');

let dbConnection = null;

export async function getDb() {
  if (dbConnection) return dbConnection;
  
  dbConnection = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  
  await initializeSchema(dbConnection);
  return dbConnection;
}

async function initializeSchema(db) {
  // Turn on foreign key constraints support in SQLite
  await db.run('PRAGMA foreign_keys = ON');

  // Create Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      streak INTEGER DEFAULT 0,
      last_active_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Carbon Logs table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS carbon_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      log_date TEXT NOT NULL,
      transportation REAL DEFAULT 0,
      electricity REAL DEFAULT 0,
      food REAL DEFAULT 0,
      water REAL DEFAULT 0,
      waste REAL DEFAULT 0,
      total REAL DEFAULT 0,
      inputs TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create Challenges table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT,
      points INTEGER DEFAULT 10,
      xp_reward INTEGER DEFAULT 20,
      is_active INTEGER DEFAULT 1
    )
  `);

  // Create User Challenges table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      challenge_id INTEGER,
      completed_date TEXT NOT NULL,
      status TEXT DEFAULT 'completed',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
    )
  `);

  // Create Badges table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      xp_threshold INTEGER DEFAULT 0
    )
  `);

  // Create User Badges table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      badge_id INTEGER,
      earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
      UNIQUE(user_id, badge_id)
    )
  `);

  // Create Articles table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      read_time INTEGER NOT NULL,
      image_url TEXT
    )
  `);

  // Create indexes for query optimization (Efficiency pillar)
  await db.exec('CREATE INDEX IF NOT EXISTS idx_carbon_logs_user_id ON carbon_logs(user_id)');
  await db.exec('CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id)');
  await db.exec('CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id)');
}
