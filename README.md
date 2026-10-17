# MotorVibe: Industrial Motor Vibration & Health Dashboard
### Industry 4.0 Predictive Maintenance & IIoT Condition Monitoring Platform

MotorVibe is a full-stack, production-grade Industry 4.0 predictive maintenance platform engineered to monitor the mechanical and thermal health of industrial 3-phase induction motors. 

It continuously monitors **three-axis vibration acceleration (MPU-6050)**, **derived Root-Mean-Square (RMS) vibration velocity (ISO 10816-3)**, **infrared contactless bearing temperature**, and **electrical current transformer (CT) load**, transforming reactive industrial breakdowns into scheduled, predictive maintenance.

---

## Architecture Overview

```
                                    +-----------------------------------------+
                                    |        EDGE SENSORS & HARDWARE          |
                                    |  • MPU-6050 3-Axis Accelerometer (X,Y,Z)|
                                    |  • SCT-013-000 Non-Invasive CT Clamp    |
                                    |  • MLX90614 Contactless IR Temp Sensor  |
                                    |  • ESP32 DevKit V1 Microcontroller      |
                                    +--------------------+--------------------+
                                                         |
                                                 MQTT (JSON over WiFi)
                                                 Topic: motorvibe/+/telemetry
                                                         v
+---------------------------------------------------------------------------------------------------+
|                                      MOTORVIBE BACKEND SERVER                                     |
|                                                                                                   |
|   +--------------------------+    +----------------------------+    +-------------------------+   |
|   |    MQTT Telemetry Client |    | Industrial Sensor Simulator|    | Explainable Alert Engine|   |
|   |    (HiveMQ / Mosquitto)  |    | (Gaussian Noise & Physics) |    | (ISO 10816-3 Thresholds)|   |
|   +------------+-------------+    +--------------+-------------+    +------------+------------+   |
|                |                                 |                               |                |
|                +---------------------------------+-------------------------------+                |
|                                                  v                                                |
|                                     Node.js & Express.js REST API                                 |
|                                 • Motors Fleet CRUD: /api/motors                                  |
|                                 • Auth (bcryptjs & JWT): /api/auth                                |
|                                 • Telemetry & Analytics: /api/readings, /api/analytics            |
|                                 • Maintenance Logs & Alerts: /api/maintenance, /api/alerts        |
|                                                  |                                                |
|                        +-------------------------+-------------------------+                      |
|                        v                                                   v                      |
|             Socket.IO Real-time Bridge                          PostgreSQL Connection Pool        |
|             (1000ms WebSocket Broadcast)                        (Parameterized SQL Queries)       |
+------------------------+---------------------------------------------------+----------------------+
                         | (WebSockets Stream)                               | (REST API Calls)
                         v                                                   v
+---------------------------------------------------------------------------------------------------+
|                                 MOTORVIBE REACT FRONTEND (VITE + JSX)                             |
|                                                                                                   |
|  • Public Portal (/): Modern Hero, SVG Motor Twin, Features, How It Works, System Architecture   |
|  • Authentication: Secure Login (/login) & Registration (/signup) with bcrypt & JWT tokens        |
|  • About Page (/about): Industrial Motor Degradation & ISO 10816 Condition Monitoring Standards   |
|  • Authenticated Application Layout (Protected Routes, Responsive Collapsible Sidebar, Alarms):   |
|    1. Fleet Dashboard (/dashboard): 6 Summary KPI Cards, 5 Recharts Charts, Motor Overview Table  |
|    2. Motors Management (/motors): Searchable/Filterable Fleet Table, Add/Edit/Delete Modals      |
|    3. Live Monitoring (/live-monitoring): 3-Axis (X,Y,Z), Rolling 60s Recharts, Fault Injector    |
|    4. Predictive Alerts (/alerts): Rule-based Alarms, Measured vs Threshold, Acknowledge & Resolve|
|    5. Maintenance History (/maintenance): Technician Servicing Records & Motor History Logs       |
|    6. Operational Analytics (/analytics): 24h Telemetry Trends, Health Donut, Fleet Comparisons   |
|    7. System Settings (/settings): Configurable ISO Thresholds, Simulator Toggles, MQTT Broker    |
+---------------------------------------------------------------------------------------------------+
```

---

## Course Outcome (CO-1 to CO-6) Mapping Table

| Course Outcome | Description | Demonstrated Implementation in MotorVibe |
| :--- | :--- | :--- |
| **CO-1: HTML & CSS** | Semantic structure, Box model, Flexbox, Grid, Responsive breakpoints, Theme design | Clean industrial light design system (charcoal/navy text `#0f172a`, blue accent `#2563eb`, green `#16a34a`, amber `#d97706`, red `#dc2626`), CSS Grid cards (`grid-cols-4`, `grid-cols-2`), Flexbox toolbars, responsive media queries (`@media max-width: 1024px`, `768px`), and custom SVG induction motor schematic. |
| **CO-2: JavaScript Fundamentals** | Variables, Functions, Array methods, Async/Await, Math & Signal processing, Timers | ES6+ async/await syntax, array manipulation (`.map()`, `.filter()`, `.reduce()`), Box-Muller Gaussian noise transform for realistic vibration synthesis, Root Mean Square (RMS) calculation: `$$\text{RMS} = \sqrt{\frac{x^2 + y^2 + z^2}{3}}$$`, 24-bin FFT harmonic frequency generation, and asynchronous polling timers. |
| **CO-3: React & Vite** | Components, JSX, Props, Hooks (`useState`, `useEffect`, `useRef`), Context API, Recharts | Built with Vite + React (JSX). Modular reusable components (`Navbar`, `Sidebar`, `TopBar`, `MetricCard`, `IsoSeverityBadge`, `FaultInjector`), custom hook `useSensorData` managing WebSocket streams with `useRef` closure protection, `AuthContext` provider for session persistence, controlled modal forms, and Recharts interactive line, bar, area, and donut charts. |
| **CO-4: Node.js & Express** | REST APIs, Route handlers, Middleware, CORS, Centralized error handling, Input validation | Express 4.x application with clean MVC architecture. Complete RESTful endpoints for motors, sensors, telemetry readings, alerts, maintenance, and analytics. Express middleware for JWT authentication, CORS header handling, Morgan logging, and centralized JSON error middleware. |
| **CO-5: Real-time Streaming & MQTT** | MQTT broker integration, WebSocket streaming, Sensor simulation, Reconnection logic | Backend MQTT client (`mqtt`) subscribing to `motorvibe/+/telemetry` on HiveMQ public broker. Bidirectional WebSocket bridge using Socket.IO emitting live readings every 1000ms. High-fidelity physical sensor simulator with dynamic live anomaly injection for viva evaluation. |
| **CO-6: Databases & Deployment** | PostgreSQL relational database, Connection pooling, Parameterized SQL queries, CI/CD | PostgreSQL database with normalized schema (`users`, `motors`, `sensor_readings`, `alerts`, `maintenance_records`, `activity_logs`), foreign keys with cascade constraints, B-tree indexes, connection pooling via `pg.Pool`, parameterized queries (`$1, $2`), 24-hour historical analytics, and automated GitHub Actions CI workflow. |

---

## Directory Structure

```
MotorVibe/
├── backend/
│   ├── scripts/
│   │   ├── initDb.js                   # Automated database migration and seed script
│   │   └── testEndpoints.js            # Automated REST API integration test suite (16 tests)
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                   # PostgreSQL connection pool with parameterized queries
│   │   │   └── mqtt.js                 # MQTT client connected to HiveMQ / Mosquitto
│   │   ├── controllers/
│   │   │   ├── alertController.js      # Alert queries, acknowledge, and resolve logic
│   │   │   ├── analyticsController.js  # Fleet historical trends and aggregate metrics
│   │   │   ├── authController.js       # Register, Login (bcryptjs), and Me endpoints
│   │   │   ├── dashboardController.js  # Fleet KPIs and plant-wide summary aggregation
│   │   │   ├── maintenanceController.js# Technician maintenance audit records (CRUD)
│   │   │   ├── motorController.js      # Motor asset management (/api/motors CRUD)
│   │   │   ├── readingsController.js   # 24h history, rolling buffers, and Min/Max/Avg stats
│   │   │   ├── sensorController.js     # Full CRUD for sensor hardware (/api/sensors)
│   │   │   ├── settingsController.js   # Configurable ISO 10816 threshold limits
│   │   │   └── simulatorController.js  # Telemetry simulation toggle & fault injection
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       # JWT Bearer token verification
│   │   │   └── errorHandler.js         # Centralized JSON exception handler
│   │   ├── routes/
│   │   │   ├── activityRoutes.js       # System activity logs (/api/activity)
│   │   │   ├── alertRoutes.js          # Alert endpoints (/api/alerts)
│   │   │   ├── analyticsRoutes.js      # Fleet trends (/api/analytics)
│   │   │   ├── authRoutes.js           # Auth routes (/api/auth)
│   │   │   ├── dashboardRoutes.js      # Dashboard stats (/api/dashboard)
│   │   │   ├── machineRoutes.js        # Legacy alias for motors
│   │   │   ├── maintenanceRoutes.js    # Maintenance CRUD (/api/maintenance)
│   │   │   ├── motorRoutes.js          # Motor asset CRUD (/api/motors)
│   │   │   ├── readingsRoutes.js       # Telemetry readings (/api/readings)
│   │   │   ├── sensorRoutes.js         # Sensor hardware (/api/sensors)
│   │   │   ├── settingsRoutes.js       # Threshold settings (/api/settings)
│   │   │   └── simulatorRoutes.js      # Anomaly injection (/api/simulator)
│   │   ├── services/
│   │   │   ├── alertEngine.js          # ISO 10816 rule-based predictive alarm engine
│   │   │   └── simulator.js            # 3-Axis vibration, RMS, and FFT spectrum synthesizer
│   │   └── server.js                   # HTTP Server, Express, and Socket.IO entry point
│   ├── .env                            # Active backend configuration (local credentials)
│   ├── .env.example                    # Backend environment template
│   └── package.json                    # Backend dependencies & npm scripts
├── database/
│   ├── schema.sql                      # Normalized table definitions, foreign keys & indexes
│   └── seed.sql                        # Realistic seed dataset: 6 motors, 24h readings, alerts
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddMotorModal.jsx       # Modal to register a new industrial motor
│   │   │   ├── ConfirmDialog.jsx       # Confirmation dialog for motor deletion
│   │   │   ├── EditMotorModal.jsx      # Modal to update motor specifications & thresholds
│   │   │   ├── FaultInjector.jsx       # Viva anomaly testing bar (1-click fault triggers)
│   │   │   ├── IsoSeverityBadge.jsx    # ISO 10816 Zone A/B/C/D visual badges
│   │   │   ├── LogMaintenanceModal.jsx # Modal to record maintenance servicing into PostgreSQL
│   │   │   ├── MetricCard.jsx          # Reusable KPI metric card with trends
│   │   │   ├── MotorDetailsModal.jsx   # Modal with full motor specifications & telemetry
│   │   │   ├── Navbar.jsx              # Public header with logo, navigation & auth buttons
│   │   │   ├── Sidebar.jsx             # Collapsible app navigation with active alarm badges
│   │   │   └── TopBar.jsx              # Authenticated header with user profile & status
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # User authentication state & localStorage persistence
│   │   ├── hooks/
│   │   │   └── useSensorData.js        # Custom WebSocket telemetry hook with rolling 60s buffer
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx           # Protected app layout, sidebar, topbar, critical alarm toast
│   │   ├── pages/
│   │   │   ├── AboutPage.jsx           # Industrial background, problem statement & architecture
│   │   │   ├── AlertsPage.jsx          # Active/historical alarms, acknowledge & resolve actions
│   │   │   ├── AnalyticsPage.jsx       # 24h trends, runtime comparison, health donut
│   │   │   ├── DashboardPage.jsx       # Main dashboard: 6 KPIs, 5 Recharts charts, overview table
│   │   │   ├── HomePage.jsx            # Landing page with hero, live preview, features, how it works
│   │   │   ├── LiveMonitoringPage.jsx  # Rolling 60s Recharts stream, 3-axis MPU6050, fault injector
│   │   │   ├── LoginPage.jsx           # Operator login with 1-click demo fast-fill buttons
│   │   │   ├── MaintenancePage.jsx     # Technician servicing audit logs (Full CRUD)
│   │   │   ├── MotorsPage.jsx          # Motors fleet directory, search, status filter, modals
│   │   │   ├── SettingsPage.jsx        # Configurable ISO thresholds, simulator control, MQTT status
│   │   │   └── SignUpPage.jsx          # User registration with password confirmation
│   │   ├── services/
│   │   │   ├── api.js                  # Centralized HTTP client communicating with backend
│   │   │   └── socket.js               # Socket.IO client instance
│   │   ├── styles/
│   │   │   └── index.css               # Clean light industrial design system
│   │   ├── App.jsx                     # Root React Router v7 routes
│   │   └── main.jsx                    # React entry point
│   ├── index.html                      # HTML5 template with custom favicon and title
│   └── package.json                    # Frontend dependencies (React, Vite, Recharts, Lucide)
├── hardware/
│   └── esp32_mpu6050_sensor.ino        # Ready-to-flash ESP32 C++ firmware for real hardware
├── .env.example                        # Root environment variable template
├── .gitignore                          # Standard git ignore definitions
├── MotorVibe_Postman_Collection.json   # Comprehensive Postman test collection (25+ requests)
├── package.json                        # Root package.json with concurrent dev & test scripts
└── README.md                           # Comprehensive documentation & evaluation guide
```

---

## Step-by-Step Windows Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your Windows machine:
- **Node.js**: v18.x, v20.x, or v22.x+ (Includes `npm`)
- **PostgreSQL**: PostgreSQL 14, 15, or 16+ running locally on port `5432`
- **Git**: (Optional, for version control)

### 2. Clone or Navigate to the Project Directory
Open PowerShell or Command Prompt:
```powershell
cd C:\Users\sivar\.gemini\antigravity\scratch\MotorVibe
```

### 3. Install All Dependencies (Root, Backend, and Frontend)
Run the root install script:
```powershell
npm run install:all
```
*(This automatically installs root devDependencies `concurrently`, backend packages `express`, `pg`, `socket.io`, `mqtt`, `bcryptjs`, `jsonwebtoken`, and frontend packages `react`, `react-router-dom`, `recharts`, `lucide-react`, `vite`)*.

### 4. Configure Database Credentials
Verify or update `backend/.env`. Ensure your PostgreSQL username and password match your local installation:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://postgres:Sivaraju%402007@localhost:5432/motorvibe_db
JWT_SECRET=motorvibe_industrial_secret_key_2026_super_secure
JWT_EXPIRES_IN=24h
MQTT_BROKER_URL=mqtt://broker.hivemq.com:1883
MQTT_CLIENT_ID=motorvibe_backend_service
MQTT_TOPIC=motorvibe/+/telemetry
CLIENT_ORIGIN=http://localhost:5173
SIMULATOR_ENABLED=true
SIMULATOR_INTERVAL_MS=1000
```
> **Note on Password Encoding**: If your PostgreSQL password contains special characters like `@`, URL-encode it (e.g., `@` becomes `%40`).

### 5. Initialize the PostgreSQL Database & Seed Data
Run the automated schema creation and seeding script:
```powershell
npm run db:init
```
**Expected Output:**
```
[Database Init] Connecting to PostgreSQL...
[Database Init] Executing schema.sql...
[Database Init] Schema applied successfully!
[Database Init] Executing seed.sql...
[Database Init] Database seeded successfully with 4 users, 6 motors, and historical telemetry!
[Database Init] Setup complete!
```

### 6. Run the Automated Backend REST API Integration Test Suite
Verify that all 16 backend endpoints are functional:
```powershell
npm run test:backend
```
**Expected Output:**
```
  TOTAL: 16 | PASSED: 16 | FAILED: 0
```

### 7. Start the Complete Full-Stack Application
Start both the Express backend and Vite frontend concurrently with a single command:
```powershell
npm run dev
```

Alternatively, you can run them in two separate terminal tabs:
- **Terminal 1 (Backend Server on Port 5000)**:
  ```powershell
  npm run dev:backend
  ```
- **Terminal 2 (Frontend Dev Server on Port 5173)**:
  ```powershell
  npm run dev:frontend
  ```

Once started, open your web browser and navigate to:
**[http://localhost:5173](http://localhost:5173)**

---

## Application URLs & Pre-Configured Demo Accounts

| Page / Route | Path | Description |
| :--- | :--- | :--- |
| **Home Landing Page** | `/` | Public portal, hero section, live digital twin preview, features, How It Works workflow. |
| **Operator Login** | `/login` | Secure login with 1-click demo fast-fill helper buttons. |
| **Sign Up** | `/signup` | User registration with required field validation and password confirmation. |
| **About Page** | `/about` | Industrial motor degradation, ISO 10816 standards, and predictive maintenance principles. |
| **Main Dashboard** | `/dashboard` | 6 KPI cards, 5 Recharts charts, motor overview table, recent alerts panel, activity feed. |
| **Motors Management** | `/motors` | Searchable/filterable motor table, Add Motor, Edit Motor, Delete Motor modals. |
| **Live Monitoring** | `/live-monitoring` | Rolling 60s Recharts chart, 3-axis MPU6050 decomposition, live fault injector. |
| **Predictive Alerts** | `/alerts` | Rule-based alerts, severity badges, measured vs threshold, Acknowledge & Resolve actions. |
| **Maintenance History**| `/maintenance` | Full CRUD maintenance log, technician servicing records, motor history. |
| **Operational Analytics**| `/analytics`| 24h telemetry trends, runtime distribution, fleet health donut chart. |
| **System Settings** | `/settings` | Profile details, simulator on/off toggle, MQTT broker status, configurable ISO thresholds. |

### Pre-configured Demo Accounts
| Role | Email | Password | Quick Login Action |
| :--- | :--- | :--- | :--- |
| **Lead Reliability Engineer** | `demo@motorvibe.io` | `Password123!` | Click **"Fill Demo Account"** on Login page |
| **Plant Superintendent (Admin)**| `admin@motorvibe.io` | `Password123!` | Click **"Fill Admin"** on Login page |
| **Shift Operator** | `operator@motorvibe.io` | `Password123!` | Click **"Fill Operator"** on Login page |
| **College Viva Examiner** | `examiner@college.edu` | `Password123!` | Enter manually |

---

## REST API Documentation & Postman Instructions

The repository includes a ready-to-import Postman collection: `MotorVibe_Postman_Collection.json`.

### How to Import & Use the Postman Collection:
1. Open Postman.
2. Click **Import** (top left).
3. Select `MotorVibe_Postman_Collection.json` from the project root.
4. The collection contains environment variables pre-configured with:
   - `base_url`: `http://localhost:5000/api`
   - `token`: Automatically extracted and set when you execute the **"Login (Demo User)"** request!

### Key REST Endpoints Overview:

| Category | Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| **System** | `GET` | `/api/health` | Service uptime, PostgreSQL status, WebSocket count | No |
| **Auth** | `POST` | `/api/auth/signup` | Register new user account | No |
| **Auth** | `POST` | `/api/auth/login` | Login with email/password; returns JWT | No |
| **Auth** | `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer) |
| **Dashboard**| `GET` | `/api/dashboard/stats` | Aggregated fleet KPIs, motor counts, recent alerts | Yes (Bearer) |
| **Motors** | `GET` | `/api/motors` | List all motors with live status & alert counts | Yes (Bearer) |
| **Motors** | `GET` | `/api/motors/:id` | Get single motor details, specs, and recent readings | Yes (Bearer) |
| **Motors** | `POST` | `/api/motors` | Create/register new motor asset | Yes (Bearer) |
| **Motors** | `PUT` | `/api/motors/:id` | Update motor specs, nameplate kW, or thresholds | Yes (Bearer) |
| **Motors** | `DELETE`| `/api/motors/:id` | Delete motor asset (cascades records) | Yes (Bearer) |
| **Telemetry**| `GET` | `/api/readings/live/:motorId` | Get latest live reading for motor | Yes (Bearer) |
| **Telemetry**| `GET` | `/api/readings/history` | Historical telemetry (1h, 24h, 7d) with downsampling | Yes (Bearer) |
| **Alerts** | `GET` | `/api/alerts` | List alerts (filter by status, severity, motor) | Yes (Bearer) |
| **Alerts** | `PATCH`| `/api/alerts/:id/acknowledge`| Acknowledge an alert | Yes (Bearer) |
| **Alerts** | `PATCH`| `/api/alerts/:id/resolve`| Resolve an alert and update motor health | Yes (Bearer) |
| **Maintenance**| `GET`| `/api/maintenance` | List maintenance history records | Yes (Bearer) |
| **Maintenance**| `POST`| `/api/maintenance` | Create a new maintenance servicing log | Yes (Bearer) |
| **Maintenance**| `PUT` | `/api/maintenance/:id` | Update maintenance record | Yes (Bearer) |
| **Maintenance**| `DELETE`| `/api/maintenance/:id` | Delete maintenance record | Yes (Bearer) |
| **Analytics**| `GET` | `/api/analytics/overview` | Fleet analytics, averages, runtime distributions | Yes (Bearer) |
| **Activity** | `GET` | `/api/activity` | System audit activity feed | Yes (Bearer) |
| **Settings** | `GET` | `/api/settings/thresholds` | Get configured ISO vibration/temp limits | Yes (Bearer) |
| **Simulator**| `GET` | `/api/simulator/status` | Check if sensor simulator is running | No |
| **Simulator**| `POST`| `/api/simulator/toggle` | Start or pause telemetry simulator | Yes (Bearer) |
| **Simulator**| `POST`| `/api/simulator/inject-fault` | Inject bearing fault, unbalance, or overheating | Yes (Bearer) |

---

## Mathematical Principles & Vibration Physics

### 1. Root Mean Square (RMS) Vibration Velocity
ISO 10816-3 evaluates overall machine vibration severity based on the true Root Mean Square (RMS) velocity across the measurement bandwidth:
$$v_{\text{RMS}} = \sqrt{\frac{1}{T} \int_0^T v^2(t) \, dt} \approx \sqrt{\frac{v_x^2 + v_y^2 + v_z^2}{3}}$$

### 2. ISO 10816-3 Vibration Severity Classification (Class II & Class III Medium Induction Motors)
- **Zone A (< 2.80 mm/s RMS)**: **Healthy / Good** — Typical of newly commissioned machinery.
- **Zone B (2.80 to 4.50 mm/s RMS)**: **Satisfactory** — Machine is suitable for unrestricted long-term continuous operation.
- **Zone C (4.50 to 7.10 mm/s RMS)**: **Warning / Unsatisfactory** — Vibration is significant; machine can run for limited duration while maintenance is scheduled.
- **Zone D (> 7.10 mm/s RMS)**: **Critical Danger** — Severe vibration damage hazard; immediate shutdown or load reduction recommended to prevent catastrophic failure.

### 3. Fast Fourier Transform (FFT) Harmonic Diagnostics
- **1X Running Speed Harmonic ($f_r = \text{RPM} / 60 = 24.67\text{ Hz}$)**: Indicates mechanical rotor unbalance.
- **2X Harmonic ($2 \times f_r = 49.33\text{ Hz}$)**: Indicates angular or parallel shaft misalignment.
- **High-Frequency Bearing Defect Frequencies (> 100 Hz)**: Ball Pass Frequency Outer Raceway (BPFO) and Inner Raceway (BPFI) indicate bearing fatigue pitting.

---

## Troubleshooting Guide for Windows

### 1. PostgreSQL Connection Error (`ECONNREFUSED` on port 5432)
- **Cause**: The PostgreSQL Windows service is stopped or not running.
- **Solution**: Open PowerShell as Administrator and run:
  ```powershell
  Get-Service -Name postgresql*
  Start-Service -Name postgresql-x64-16 # (or your specific PostgreSQL version)
  ```
  Alternatively, open `services.msc`, locate **postgresql-x64-XX**, and click **Start**.

### 2. Database Password Authentication Failed (`password authentication failed for user "postgres"`)
- **Cause**: The password in `backend/.env` does not match your local PostgreSQL `postgres` superuser password, or contains unencoded special characters.
- **Solution**: Open `backend/.env` and update `DATABASE_URL`. If your password has `@`, encode it as `%40`:
  ```env
  DATABASE_URL=postgres://postgres:YourPasswordHere@localhost:5432/motorvibe_db
  ```

### 3. Port 5000 or 5173 Already in Use (`EADDRINUSE`)
- **Cause**: A previous instance of Node.js or Vite is still running in the background.
- **Solution**: Find and terminate the process holding the port:
  ```powershell
  # Find PID using port 5000
  netstat -ano | findstr :5000
  # Terminate PID (replace <PID> with number from above)
  taskkill /PID <PID> /F
  ```

### 4. Native `bcrypt` Build Failures on Windows
- **Cause**: Native `bcrypt` requires node-gyp and Python C++ build tools.
- **Solution**: MotorVibe uses `bcryptjs`, a 100% pure JavaScript implementation with zero native C++ compiler dependencies. No Visual Studio C++ build tools are required!

### 5. CORS Header Issues
- **Cause**: Frontend runs on `http://localhost:5173` while backend runs on `http://localhost:5000`.
- **Solution**: MotorVibe backend configures `cors()` middleware allowing `CLIENT_ORIGIN=http://localhost:5173` and WebSocket cross-origin connections natively.

---

## College Viva & Project Review Guide

### 5-Step Live Demonstration Walkthrough:
1. **Landing Page & System Architecture**:
   - Open `http://localhost:5173`. Show the hero section, live digital twin preview, and the "How It Works" sensor workflow diagram.
2. **Operator Login**:
   - Click "Login". Click the **"Fill Demo Account"** button to automatically populate credentials (`demo@motorvibe.io`). Log in.
3. **Fleet Dashboard**:
   - Point out the 6 summary KPI cards (Total Motors, Healthy, Attention, Critical, Average Vibration, Total Runtime Today).
   - Show the 5 interactive Recharts charts (Vibration trend, Temperature trend, Phase current trend, Motor vibration comparison bar chart, Health status donut chart).
4. **Live Sensor Telemetry & Anomaly Injection**:
   - Navigate to **"Live Monitoring"** in the sidebar.
   - Point out the real-time rolling 60-second chart updating every 1000ms via WebSockets.
   - Look at the **"Demo Fault Injector"** bar. Click **"Bearing Fault (Vib Spike)"**.
   - Watch the live vibration jump above `8.0 mm/s`, the ISO badge change to `Zone D: Critical Danger`, and the real-time toast alert pop up in the corner!
   - Click **"Normal Baseline"** to demonstrate recovery.
5. **Alerts & Maintenance History**:
   - Navigate to **"Alerts"**. Show the rule-based alert explanation banner, measured value vs threshold, and click **"Acknowledge"** and **"Resolve"**.
   - Navigate to **"Maintenance History"**. Show the audit trail of servicing logs, click **"+ Log Maintenance"**, select a motor, and save a record directly to PostgreSQL.

---

### Top 10 Viva Questions & Model Answers:

**Q1: What is the difference between Vibration RMS and Peak Vibration?**
> *Answer*: Peak vibration represents the absolute maximum instantaneous displacement or velocity observed in a cycle, which can be sensitive to short transient shocks. Root Mean Square (RMS) velocity calculates the true time-weighted energy content of the vibration signal. ISO 10816-3 standardizes on RMS velocity because destructive mechanical fatigue in motor bearings and shafts is directly proportional to continuous vibration energy over time.

**Q2: Why did you choose ISO 10816-3 for vibration severity?**
> *Answer*: ISO 10816-3 is the globally accepted industrial engineering standard for evaluating mechanical vibration of industrial machines with nominal power above 15 kW. It provides standardized, empirically validated severity zones: Zone A (<2.8 mm/s, good), Zone B (2.8-4.5 mm/s, acceptable), Zone C (4.5-7.1 mm/s, warning), and Zone D (>7.1 mm/s, critical hazard).

**Q3: How does your system handle real-time updates?**
> *Answer*: We use a dual-tier communication architecture. Edge sensors transmit telemetry to a central MQTT broker (`HiveMQ`) via lightweight pub/sub JSON messages. The Node.js backend subscribes to `motorvibe/+/telemetry`. Upon receipt (or via the built-in sensor simulator), the backend processes the reading, checks ISO thresholds, and broadcasts the validated reading to connected React clients via WebSockets using Socket.IO.

**Q4: Why use a PostgreSQL connection pool instead of opening a new client on each request?**
> *Answer*: Opening and authenticating a new TCP connection to PostgreSQL on every HTTP request takes 20-50 milliseconds and exhausts database process memory under high load. A connection pool (`pg.Pool`) maintains a reusable cache of open database clients, reusing active connections across incoming requests and providing optimal concurrency.

**Q5: How does the system prevent alert flooding?**
> *Answer*: The alert engine implements intelligent state debouncing. When an anomaly occurs, it checks if an active alert already exists for that specific motor and metric. Subsequent messages within a 5-minute cooldown window update the measured reading without creating redundant database records.

**Q6: What authentication mechanism is implemented?**
> *Answer*: We use secure password hashing with `bcryptjs` (10 salt rounds) so plaintext passwords are never stored. Upon successful credential verification, the backend issues an industry-standard signed JSON Web Token (JWT) with an expiration time, which is passed in the `Authorization: Bearer <token>` header for all protected API routes.

**Q7: Can this application run without physical hardware?**
> *Answer*: Yes. The backend features a physics-based Industrial Sensor Simulator with Box-Muller Gaussian noise modeling. It simulates 6 distinct motors with realistic operational fluctuations and includes a viva fault injector to demonstrate bearing failures, rotor unbalance, and thermal overheating on demand.

**Q8: How would this architecture scale in a factory with 1,000 motors?**
> *Answer*: For high-frequency telemetry at scale, we can convert PostgreSQL's `sensor_readings` table into a TimescaleDB hypertable partitioned by time intervals, enable automated 1-hour downsampling rollups via continuous aggregates, deploy backend Node.js workers behind an NGINX load balancer, and use Redis as a Socket.IO adapter.

**Q9: Why use React Router v7 and Recharts?**
> *Answer*: React Router v7 provides client-side single-page routing without page reloads, preserving real-time WebSocket connections when navigating between pages. Recharts is built specifically on React components and SVG, offering declarative, highly performant real-time charts with smooth transitions.

**Q10: What is the role of the Maintenance History table?**
> *Answer*: In Industry 4.0 predictive maintenance, condition monitoring must be coupled with maintenance action logs. The `maintenance_records` table creates an auditable record of technician interventions (bearing lubrication, laser shaft realignment, stator rewinding), completing the closed-loop maintenance lifecycle.

---

## License & Credits
Developed for Full Stack Web Development & Industry 4.0 Capstone Evaluation.
Built with Node.js, Express, PostgreSQL, Socket.IO, MQTT, React, Vite, and Recharts.
