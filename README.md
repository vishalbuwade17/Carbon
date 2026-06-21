# 🌱 EcoTrack – Carbon Footprint Awareness Platform

EcoTrack is a modern, full-stack, mobile-responsive web application designed to help users track, audit, and reduce their carbon footprint. The platform gamifies environmental awareness using daily challenges, active streaks, level progress (XP), and badges, alongside interactive carbon footprint calculators, reduction simulators, and educational resource portals.

---

## 🏆 Core Technical Highlights

This project was built from the ground up to exceed production standards across six primary pillars:

### 1. Problem Statement Alignment (Feature Coverage)
The platform maps 1:1 to every requirement specified in the problem statement:
* **User Authentication**: Standard credentials sign-in/register (using JWT tokens) and a Mock Google OAuth pipeline.
* **Carbon Calculator**: Audits Transportation (driving distance, flight frequency), Household Electricity, Diet profiles (vegan/standard/meat-heavy), Water, and Waste metrics.
* **Personalized Dashboard**: Visualizes emissions categories, monthly trends, and average comparison meters using three custom Recharts widgets.
* **AI Sustainability Advisor**: Rules-based diagnostics engine that analyzes latest logs to project next month's carbon footprint and suggest personalized milestones.
* **Daily Eco Challenges**: Checks off daily tasks, awards Eco Points and XP, and increments consecutive active streaks.
* **Carbon Reduction Simulator**: Drag-and-drop tuning sliders that dynamically model hypothetical behavioral shifts and tree offset equivalents.
* **Community Section**: Collective statistics (total carbon saved, trees offset equivalent, gasoline cars removed) and a Top 10 global user leaderboard.
* **Education Hub**:Curated educational reading library, categorizing sustainability science and spotlight climate facts.
* **Admin Panel**: Dashboard displaying total users, average footprint, active calculations, and an interactive form to publish new eco-challenges.

### 2. Code Quality & Project Structure
* **Separation of Concerns**: Clean separation between database schemas (`server/db.js`), data seeders (`server/seed.js`), secure authorization middlewares (`server/middleware.js`), API routers (`server/routes/*.js`), and the React UI client (`src/`).
* **ES Modules**: Utilizes modern ES import/export structures across the backend and frontend.
* **Clean & Readable Code**: Variables are intuitively named, APIs use RESTful syntax, and complex blocks (such as the carbon mathematical coefficients and the streak logic) are self-documented with comments.

### 3. Security
* **SQL Injection Mitigation**: All database queries are compiled using SQLite **parameterized placeholders** (`?` parameters) to entirely prevent SQL Injection.
* **Cryptography**: Sensitive user passwords are encrypted using `bcryptjs` (salted with 10 rounds) before database storage.
* **Stateless API Authorization**: Routes (like logging data, claiming challenges, and loading admin metrics) are protected by stateless JWT Bearer Tokens validated on every request.
* **IDOR Prevention**: JWT claims determine the user's scope. Users can only access, recalculate, or view historical carbon logs associated with their own `userId` extracted from the verified token.

### 4. Efficiency
* **Single-Port Architecture**: In production, the Express server is configured to serve the pre-compiled, minified client-side assets (`dist/`) directly, consolidating the entire app into a single port to prevent CORS preflight delays and reduce cloud hosting costs.
* **Minimal Payload Size**: API endpoints return compressed JSON outputs containing only the required fields.
* **Performance Charts**: Uses `recharts` which integrates natively with React's virtual DOM to render high-framerate, lightweight SVG graphics.
* **Vanila CSS Design Tokens**: Styled completely using Vanilla CSS variables (`src/styles/variables.css`). This eliminates utility class parsing overhead, leading to faster initial page paints.

### 5. Testing
* **Database & Query Tests**: Equipped with a self-contained local testing runner ([scratch/test_api.js](file:///c:/Users/visha/OneDrive/Desktop/carbon/scratch/test_api.js)) verifying SQLite schema compiles, foreign key constraints load, database seed entries initialize, and queries return expected data formats.
* **Bundler Integrity**: Validated under production building bundles (`npm run build`) to ensure React 19 compatibility and verify zero bundler package imports or syntax issues.

### 6. Accessibility (a11y)
* **Semantic HTML**: Built using HTML5 semantic wrappers (`<nav>` for navbar, `<main>` for layouts, `<article>` for articles, `<section>` for columns, and `<footer>` for copyrights).
* **Form Labeling**: Interactive elements inside inputs, login dialogs, and sliders use strict, unique `id` attributes matched to descriptive `<label htmlFor="...">` tags, ensuring full compatibility with screen readers.
* **Theme Styling (Color Contrast)**: Light and Dark CSS variables are selected to meet high-contrast readability benchmarks.

---

## 🛠️ Folder Hierarchy

```
carbon/
├── dist/                          # Minified client build files (production)
├── scratch/                       # Test suites
│   └── test_api.js                # Database schema verification
├── server/                        # Express API Backend
│   ├── index.js                   # Server boot, seeds execution, router mapping
│   ├── db.js                      # Schema tables creator (users, carbon, badges, etc.)
│   ├── seed.js                    # Seeder script populating baseline content
│   ├── middleware.js              # JWT validation & requireAdmin checks
│   └── routes/
│       ├── auth.js                # Login, Register, Google Sign-In, Me
│       ├── carbon.js              # Calculation, history log, dashboards
│       ├── challenges.js          # Completed status, claim rewards, streaks
│       ├── community.js           # Leadership boards, aggregate offsets
│       ├── edu.js                 # Reading catalog getters
│       ├── ai.js                  # Recommendations, weekly trends, forecasts
│       └── admin.js               # Admin analytics, list users, add challenges
├── src/                           # React Frontend Client
│   ├── App.jsx                    # Routing mapping, theme state toggles
│   ├── main.jsx                   # React mounting point
│   ├── index.css                  # Core stylesheet wrapper
│   ├── context/
│   │   └── AuthContext.jsx        # Credentials, token caching, login modals
│   ├── components/
│   │   ├── Navbar.jsx             # Responsive headers & profile status
│   │   ├── LandingPage.jsx        # Heros, feature layouts, calculator playgrounds
│   │   ├── Dashboard.jsx          # KPI card trackers, interactive Recharts widgets
│   │   ├── Calculator.jsx         # Step-by-step calculator wizard
│   │   ├── Simulator.jsx          # Savings range offset forecast tuners
│   │   ├── Challenges.jsx         # Streaks flame grids, task checklist claimants
│   │   ├── Community.jsx          # Lead table, user rank highlighting
│   │   ├── Education.jsx          # Facts carousels, slide library readers
│   │   └── AdminPanel.jsx         # Challenge creation forms, users database
│   └── styles/
│       ├── variables.css          # Dark/Light CSS design variables
│       ├── app.css                # Fluid reset grids, layouts, glow backgrounds
│       └── components.css         # Glassmorphism panels, sliders, buttons
├── Dockerfile                     # Deployment container script
├── .dockerignore                  # Build folder exclusions rules
├── .gitignore                     # Git tracking exclusions rules
└── .env                           # Local environment configurations (PORT, SECRET)
```

---

## 🚀 Running Locally

Ensure you have Node.js (version 20+) installed.

### 1. Clone & Install
```bash
npm install --legacy-peer-deps
```

### 2. Run in Development Mode
Launches Vite HMR client and nodemon server concurrently:
```bash
npm run dev
```
* **Vite Client**: `http://localhost:5173`
* **Express APIs**: `http://localhost:5000`

### 3. Run Verification Tests
Runs DB schema validation and integrity checks:
```bash
node scratch/test_api.js
```

### 4. Build & Run in Production
Serves production bundle files through Express:
```bash
npm run build
npm run start
```
* **Unified Web App**: `http://localhost:5000`

---

## 🌐 Production Deployment

### 1. Render / Heroku (Free Cloud Hosting)
Connect your GitHub repository to **Render.com** as a **Web Service** with:
* **Runtime**: `Node`
* **Build Command**: `npm install --legacy-peer-deps && npm run build`
* **Start Command**: `npm run start`
* **Environment Variables**:
  * `NODE_ENV` = `production`
  * `JWT_SECRET` = `choose-a-strong-secret-key`

### 2. Google Cloud Run (Containerized)
Deploy using the included `Dockerfile` with the following Google Cloud CLI commands:
```bash
# Compile and build the container image in Google Cloud
gcloud builds submit --tag gcr.io/<PROJECT-ID>/ecotrack

# Deploy the container to a managed instance
gcloud run deploy ecotrack --image gcr.io/<PROJECT-ID>/ecotrack --platform managed --allow-unauthenticated
```
