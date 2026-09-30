# ♻️ ECOTRACE AI
### From Waste Detection to Verified Recycling
> *"Don't just throw it. Know it. Track it. Prove it."*

[![UN SDG 11](https://img.shields.io/badge/UN%20SDG%2011-Sustainable%20Cities%20%26%20Communities-16A34A?style=for-the-badge)](https://sdgs.un.org/goals/goal11)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![SHA-256](https://img.shields.io/badge/Integrity-SHA--256%20Chain-0F172A?style=for-the-badge)](https://en.wikipedia.org/wiki/SHA-2)

---

## 🌍 The Problem & Hackathon Challenge
Urban campus waste management faces two critical challenges:
1. **Contamination at the Source:** Citizens and students struggle to accurately distinguish Biodegradable, Dry Recyclable, and Hazardous E-Waste in real time.
2. **The "Disposal Black Hole":** Once electronics are discarded into a bin, they disappear into unregulated scrap markets or illegal landfills, releasing toxic heavy metals (Lead, Cadmium, Lithium) into groundwater.

**EcoTrace AI** solves this with a complete digital journey:
> **"EcoTrace AI does not stop at identifying waste. It creates a traceable digital chain from waste detection to responsible recycling."**

---

## 🚀 The Core Digital Journey

```mermaid
flowchart LR
    A["👤 User"] --> B["📷 AI Scanner"]
    B --> C["🏷️ Classification\n(Bio / Dry / E-Waste)"]
    C --> D["📋 Disposal\nRecommendation"]
    D --> E["🛂 Digital Waste\nPassport"]
    E --> F["🔲 QR Asset Tag"]
    F --> G["🚛 Collection & Safe Storage"]
    G --> H["🏭 Certified Recycler"]
    H --> I["🔐 SHA-256 Hash\nChain Verified"]
    I --> J["🌱 Green Points &\nImpact Scorecard"]
```

---

## 🏆 Key Differentiator: Tamper-Evident SHA-256 Hash Chaining
EcoTrace AI provides mathematical certainty without the excessive overhead of public blockchains:

```
[ Block 1: REGISTERED ]
  previous_hash: 00000... (GENESIS)
  payload: { passport_id, object, timestamp, submitter }
  event_hash: SHA256(payload + previous_hash)
         │
         ▼
[ Block 2: COLLECTED ]
  previous_hash: <Block 1 event_hash>
  payload: { van_id, collector, bin_location, timestamp }
  event_hash: SHA256(payload + previous_hash)
         │
         ▼
[ Block 3: AT_RECYCLER ] ───► [ Block 4: RECYCLED ]
```

- Any attempt to alter past records or skip steps breaks the hash link.
- Anyone can scan the physical QR tag on an e-waste item and see the public cryptographic proof at `/verify/:passport_id` without logging in!

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Axios, Recharts, Lucide Icons, Tailwind CSS |
| **Backend** | Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy ORM, Uvicorn |
| **Database** | SQLite (zero-config local run) or PostgreSQL (production toggle) |
| **AI Vision** | Computer Vision Material Classifier & SDG 11 Rule Engine |
| **QR Code** | `qrcode` Python engine with base64 Data URI streaming |
| **Security** | Passlib bcrypt password hashing, JWT Bearer tokens |
| **Integrity** | Cryptographic SHA-256 event hash chaining & verification engine |

---

## 🎬 The 6-Scene Hackathon Winning Demo Flow

1. **Scene 1 — The Problem:** Show a discarded laptop or battery. *"Where does this go?"*
2. **Scene 2 — AI Vision Scan:**
   - Go to `/scanner`.
   - Click the preset `💻 Laptop Computer` or upload any image.
   - Watch the animated radar scan line analyze spectral features.
   - AI outputs: `Laptop Computer`, `E-WASTE`, `96% Confidence`, `HIGH RISK`, Recommended Bin: `E-Waste Collection`.
   - Notification shows `+5 Green Points` credited.
3. **Scene 3 — Digital Waste Passport Creation:**
   - Click **"Create Digital Waste Passport"**.
   - Generates unique ID `ET-2026-XXXXXX` and physical QR asset tag.
   - Initial `REGISTERED` genesis block is hashed with SHA-256 (`+25 Green Points`).
4. **Scene 4 — 1-Click Custody Advancement (Admin):**
   - Switch to Admin Command Center (`/admin/lifecycle`).
   - Click **"Advance Stage"** to move the passport:
     `REGISTERED ➔ COLLECTED ➔ STORED ➔ IN TRANSIT ➔ AT RECYCLER ➔ RECYCLED`.
   - Every click appends a new verified block with chained SHA-256 digests.
   - Reaching `RECYCLED` triggers **+50 Green Points** to the student!
5. **Scene 5 — Public QR Verification:**
   - Click the verification link or open `/verify/ET-2026-A83F92`.
   - Demonstrates that anyone in the city/campus can verify the asset's authentic lifecycle and certified recycler credentials without an account!
6. **Scene 6 — Environmental Impact & Smart Bins:**
   - Visit `/impact` to view total kg diverted, avoided CO2e, and heavy metals prevented.
   - Visit `/admin/bins` to view smart bin capacity gauges, simulate fill rates with the slider, and review predictive time-to-full collection dispatch warnings!

---

## ⚡ Quick Start (Plug & Play)

### Option A: 1-Click All-in-One Launcher (Windows)
Double-click `start_all.bat` in the project root. It will launch both backend and frontend servers in separate windows.

### Option B: Manual Setup

#### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py
```
*Backend runs on `http://localhost:8000` (Interactive API docs at `http://localhost:8000/docs`).*

#### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🔑 Demo Credentials (1-Click Login Ready)

On the `/login` screen, you will find **1-Click Quick Login** buttons:

| Role | Email | Password | What to Demo |
|---|---|---|---|
| **Student** | `student@campus.edu` | `student123` | AI Scanner, Passports, Personal Impact, Leaderboard |
| **Admin** | `admin@ecotrace.ai` | `admin123` | Operations Command Center, Lifecycle Advancer, Smart Bins Telemetry |

---

## 📊 Database Schema Summary

- `users` — Authentication, roles (`USER` / `ADMIN`), and green points balance.
- `waste_scans` — AI detection logs with confidence, risk, and disposal directives.
- `waste_passports` — Central entity tracking e-waste assets with embedded QR tokens.
- `lifecycle_events` — Tamper-evident chain recording `status`, `actor`, `location`, `previous_hash`, `event_hash`.
- `bins` — Smart bins with capacity %, hourly fill rate, and predictive status.
- `green_points` — Audit ledger of rewarded points (+5 scan, +10 disposal, +25 passport, +50 recycling).

---

## 🌿 UN Sustainable Development Goal 11 Alignment
- **Target 11.6:** Reduce the adverse per capita environmental impact of cities, including by paying special attention to air quality and municipal and other waste management.
- **Measurable Metrics:** Real-time landfill diversion (kg), Avoided CO2e (kg), Toxic Heavy Metals contained (Lead, Cadmium, Mercury in grams).

---

*Developed for the Sustainable Technology Hackathon by Team EcoTrace AI.*
