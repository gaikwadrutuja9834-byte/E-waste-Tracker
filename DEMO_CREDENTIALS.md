# 🌱 EcoTrace AI — Demo Credentials & Quick Access Guide

Use the following pre-configured credentials to test all features of EcoTrace AI, or register a new student account at any time.

---

## ⚡ Quick 1-Click Demo Login
On the Login or Register page, click either:
- **Student Demo**: Logs in instantly as `student@campus.edu`
- **Admin Demo**: Logs in instantly as `admin@ecotrace.ai`

---

## 👥 Pre-Configured Demo Accounts

| Role | Email | Password | Permissions & Features |
| :--- | :--- | :--- | :--- |
| **Student / Citizen** | `student@campus.edu` | `student123` | AI waste scanning, disposal logging, green point rewards, digital waste passport lookup, leaderboard rank |
| **Sustainability Admin** | `admin@ecotrace.ai` | `admin123` | Real-time smart bin monitor, waste passport generator, lifecycle chain audit, contamination alerts, campus metrics |
| **Leaderboard Student 1** | `aarav@campus.edu` | `demo123` | Campus recycling leader (540 points) |
| **Leaderboard Student 2** | `priya@campus.edu` | `demo123` | Campus recycling leader (490 points) |
| **Leaderboard Student 3** | `rohan@campus.edu` | `demo123` | Campus recycling leader (430 points) |

---

## ✍️ Creating a New Student Account

1. Go to the **Register** page: [http://localhost:5173/register](http://localhost:5173/register)
2. Enter your details:
   - **Full Name**: e.g., *Alex Rivera*
   - **Campus Email**: Any new email address (e.g., `newstudent@campus.edu`)
     > *Note:* If you use `student@campus.edu`, it will tell you the account already exists because it is pre-seeded above.
   - **Password**: Any password with at least 6 characters (e.g., `pass123`)
   - **Account Role**: Select **Student / Citizen**
3. Click **Create Account**
4. You will automatically receive a **+50 Green Point welcome bonus** and be redirected to the Student Dashboard.

---

## 🚀 How to Run the App

### Option A: 1-Click Launcher (Windows)
Double-click `start_all.bat` in the project root.

### Option B: Manual Terminal Execution

#### 1. Backend Server:
```bash
cd backend
python run.py
```
- API Server: [http://localhost:8000](http://localhost:8000)
- Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

#### 2. Frontend Application:
```bash
cd frontend
npm run dev
```
- Web Application: [http://localhost:5173](http://localhost:5173)
