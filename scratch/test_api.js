import { getDb } from '../server/db.js';
import { seedDb } from '../server/seed.js';

// Let's write a self-contained node script that spins up the db and runs basic queries
async function runTests() {
  console.log('--- EcoTrack Integration Tests ---');
  
  try {
    console.log('1. Testing Database Initialization...');
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection failed.');
    }
    console.log('✓ Database connected.');

    console.log('2. Running Seed Initializer...');
    await seedDb();
    console.log('✓ Seeding complete or skipped (already run).');

    console.log('3. Validating Schema Structures...');
    const usersTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    const carbonTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='carbon_logs'");
    const challengesTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='challenges'");
    
    if (!usersTable || !carbonTable || !challengesTable) {
      throw new Error('Some core database tables are missing!');
    }
    console.log('✓ All database tables are present.');

    console.log('4. Checking Seeding Records...');
    const challengesCount = await db.get('SELECT COUNT(*) as count FROM challenges');
    const articlesCount = await db.get('SELECT COUNT(*) as count FROM articles');
    const adminUser = await db.get('SELECT email, role FROM users WHERE email="admin@ecotrack.com"');

    console.log(`- Challenges in DB: ${challengesCount.count}`);
    console.log(`- Articles in DB: ${articlesCount.count}`);
    console.log(`- Admin Seed: ${adminUser ? `${adminUser.email} (Role: ${adminUser.role})` : 'Missing!'}`);
    
    if (challengesCount.count === 0 || articlesCount.count === 0 || !adminUser) {
      throw new Error('Seed checking failed.');
    }
    console.log('✓ Seed validation complete.');

    console.log('\n======================================');
    console.log(' 🎉 ALL INTEGRATION TESTS PASSED!');
    console.log('======================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ INTEGRATION TEST FAILED:');
    console.error(err);
    process.exit(1);
  }
}

runTests();
