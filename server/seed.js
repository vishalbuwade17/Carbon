import { getDb } from './db.js';
import bcrypt from 'bcryptjs';

export async function seedDb() {
  const db = await getDb();

  // Check if seed has already been run
  const challengeCount = await db.get('SELECT COUNT(*) as count FROM challenges');
  if (challengeCount.count > 0) {
    console.log('Database already seeded.');
    return;
  }

  console.log('Seeding database...');

  // 1. Seed Challenges
  const challenges = [
    { title: 'Reusable Bottle', description: 'Carry a reusable water bottle today and avoid single-use plastic bottles.', category: 'waste', points: 15, xp_reward: 30 },
    { title: 'Pedal Power', description: 'Use a bicycle or walk for local travel under 3 miles instead of driving.', category: 'transportation', points: 25, xp_reward: 50 },
    { title: 'Switch to LEDs', description: 'Replace at least one incandescent bulb in your home with an energy-saving LED.', category: 'energy', points: 20, xp_reward: 40 },
    { title: 'Meatless Day', description: 'Eat only plant-based food today. Livestock farming produces high CO₂ emissions.', category: 'diet', points: 20, xp_reward: 40 },
    { title: 'Unplug Standby', description: 'Unplug devices (TVs, chargers, microwave) that are on standby mode when not in use.', category: 'energy', points: 10, xp_reward: 20 },
    { title: 'Shorter Shower', description: 'Limit your shower to under 5 minutes to conserve hot water and heating energy.', category: 'water', points: 15, xp_reward: 30 },
    { title: 'Zero Waste Meals', description: 'Ensure no food waste during your meals today by composting or finishing servings.', category: 'waste', points: 15, xp_reward: 30 },
    { title: 'Plant a Seed', description: 'Plant a seed, herb, or tree at home or in your local community garden.', category: 'diet', points: 30, xp_reward: 60 }
  ];

  for (const c of challenges) {
    await db.run(
      'INSERT INTO challenges (title, description, category, points, xp_reward, is_active) VALUES (?, ?, ?, ?, ?, 1)',
      [c.title, c.description, c.category, c.points, c.xp_reward]
    );
  }

  // 2. Seed Badges
  const badges = [
    { name: 'Eco Starter', description: 'Earned for registering and joining the carbon consciousness movement.', icon: 'Award', xp_threshold: 0 },
    { name: 'Carbon Cutter', description: 'Earned for saving your first 50 kg of CO2 equivalent.', icon: 'Activity', xp_threshold: 150 },
    { name: 'Streak Specialist', description: 'Complete challenges 3 days in a row.', icon: 'Flame', xp_threshold: 300 },
    { name: 'Energy Savior', description: 'Reach Level 3 by completing energy conservation tasks.', icon: 'Zap', xp_threshold: 500 },
    { name: 'Eco Champion', description: 'Ultimate badge for reaching Level 5 and reducing significant footprint.', icon: 'Shield', xp_threshold: 1000 }
  ];

  for (const b of badges) {
    await db.run(
      'INSERT INTO badges (name, description, icon, xp_threshold) VALUES (?, ?, ?, ?)',
      [b.name, b.description, b.icon, b.xp_threshold]
    );
  }

  // 3. Seed Articles
  const articles = [
    {
      title: 'The Real Impact of Food on Climate Change',
      category: 'diet',
      content: 'Did you know food accounts for over a quarter of global greenhouse gas emissions? Animal products, especially beef and lamb, have the highest carbon footprint because of land clearing, feed production, and methane gas. By switching to plant-based diets even two days a week, a household can reduce its footprint by nearly a ton of CO₂ per year. Transitioning to local produce and minimizing packaging waste are other effective ways to curb food-related emissions.',
      read_time: 4,
      image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=60'
    },
    {
      title: 'Decarbonizing Your Commute: Bike, Bus, or EV?',
      category: 'transportation',
      content: 'Transportation is one of the largest sectors contributing to individual greenhouse emissions. Driving a gasoline car releases about 400 grams of CO₂ per mile. Public transit (trains, buses) cuts this emission by over 60% per passenger mile. Cycling or walking is, of course, zero-emission and highly beneficial to cardiorespiratory health. If you must drive, switching to an electric vehicle (EV) reduces lifecycle carbon emissions by 50% or more, depending on the local electricity grid source.',
      read_time: 5,
      image_url: 'https://images.unsplash.com/photo-1519003722824-192514ad9198?w=600&auto=format&fit=crop&q=60'
    },
    {
      title: 'Unseen Power Slayers: Standby Electricity Explained',
      category: 'energy',
      content: 'Many home electronics draw energy even when turned off but plugged in. This is known as standby power or "vampire draw." Idle appliances like TVs, set-top boxes, chargers, microwave clocks, and computer monitors collectively account for roughly 5-10% of residential electricity use. Over a year, unplugging these phantom power draws can save up to $100 on utility bills and prevent 150 kg of CO₂ from entering the atmosphere. Smart power strips that cut power entirely are an easy solution.',
      read_time: 3,
      image_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&auto=format&fit=crop&q=60'
    },
    {
      title: 'Water Scarcity and Carbon: The Hidden Connection',
      category: 'water',
      content: 'Conserving water does more than preserve freshwater reservoirs — it saves energy! Treating, heating, pumping, and distributing water to your taps requires a significant amount of electricity. Heating water for showers, washing machines, and dishwashers represents one of the largest energy uses in a modern home. Taking a 5-minute shower instead of a 10-minute one saves up to 10 gallons of water and 1 kg of CO₂ if heated electrically. Low-flow aerators on sinks and showerheads pay for themselves in weeks.',
      read_time: 3,
      image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=60'
    }
  ];

  for (const a of articles) {
    await db.run(
      'INSERT INTO articles (title, category, content, read_time, image_url) VALUES (?, ?, ?, ?, ?)',
      [a.title, a.category, a.content, a.read_time, a.image_url]
    );
  }

  // 4. Seed Admin and Sample User
  const adminPasswordHash = await bcrypt.hash('adminpassword', 10);
  const samplePasswordHash = await bcrypt.hash('userpassword', 10);

  // Insert Admin
  await db.run(
    'INSERT INTO users (name, email, password_hash, role, xp, level) VALUES (?, ?, ?, ?, ?, ?)',
    ['System Administrator', 'admin@ecotrack.com', adminPasswordHash, 'admin', 500, 3]
  );

  // Insert Sample User
  await db.run(
    'INSERT INTO users (name, email, password_hash, role, xp, level, streak, last_active_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ['Jane Doe', 'jane@example.com', samplePasswordHash, 'user', 220, 2, 3, '2026-06-21']
  );

  // Give Jane some carbon logs and complete some challenges
  const jane = await db.get('SELECT id FROM users WHERE email = "jane@example.com"');
  if (jane) {
    // Carbon logs
    const logQueries = [
      { date: '2026-04', trans: 320.5, elec: 180.2, food: 140.0, water: 30.5, waste: 25.0 },
      { date: '2026-05', trans: 280.0, elec: 160.0, food: 120.0, water: 28.0, waste: 20.0 },
      { date: '2026-06', trans: 220.0, elec: 140.0, food: 95.0, water: 25.0, waste: 15.0 }
    ];

    for (const q of logQueries) {
      const total = q.trans + q.elec + q.food + q.water + q.waste;
      const inputs = JSON.stringify({
        carMiles: q.trans / 0.4,
        flightsCount: 0,
        electricityKwh: q.elec / 0.8,
        dietType: 'vegetarian',
        waterGallons: q.water * 10,
        wasteKg: q.waste
      });
      await db.run(
        'INSERT INTO carbon_logs (user_id, log_date, transportation, electricity, food, water, waste, total, inputs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [jane.id, q.date, q.trans, q.elec, q.food, q.water, q.waste, total, inputs]
      );
    }

    // Complete a challenge for Jane today
    const challenge = await db.get('SELECT id FROM challenges LIMIT 1');
    if (challenge) {
      await db.run(
        'INSERT INTO user_challenges (user_id, challenge_id, completed_date) VALUES (?, ?, ?)',
        [jane.id, challenge.id, '2026-06-21']
      );
    }

    // Give Jane the starter badge
    const starterBadge = await db.get('SELECT id FROM badges WHERE name = "Eco Starter"');
    if (starterBadge) {
      await db.run(
        'INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)',
        [jane.id, starterBadge.id]
      );
    }
  }

  console.log('Database successfully seeded!');
}
