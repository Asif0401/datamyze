# 📊 DataQuest — Data Analytics Learning Platform

A full-stack LeetCode-style learning platform for data analytics, built with React + Node.js + SQLite.

---

## 🗂 Project Structure

```
dataquest/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.js   # SQLite setup & schema
│   │   │   └── seed.js       # Seed courses, problems, quizzes
│   │   ├── middleware/
│   │   │   └── auth.js       # JWT middleware
│   │   ├── routes/
│   │   │   ├── auth.js       # /api/auth — signup, login, me
│   │   │   ├── courses.js    # /api/courses
│   │   │   ├── problems.js   # /api/problems
│   │   │   ├── quiz.js       # /api/quiz
│   │   │   └── users.js      # /api/users — leaderboard, certs, dashboard
│   │   └── index.js          # Express app entry point
│   ├── .env                  # Environment variables
│   └── package.json
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state
│   │   ├── hooks/
│   │   │   └── useApi.js         # Axios instance with JWT
│   │   ├── components/
│   │   │   └── Layout.jsx        # Sidebar + routing shell
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx      # Login + Signup
│   │   │   ├── Dashboard.jsx     # Home dashboard
│   │   │   ├── Courses.jsx       # Course catalog + lesson viewer
│   │   │   ├── Problems.jsx      # Problem set + code editor
│   │   │   ├── Quiz.jsx          # Interactive quiz
│   │   │   ├── Leaderboard.jsx   # Rankings
│   │   │   └── Certificates.jsx  # Earned certificates
│   │   ├── App.jsx               # Router
│   │   ├── main.jsx
│   │   └── index.css             # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🚀 Setup & Run

### Prerequisites
- Node.js v18+
- npm v9+

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### 2. Configure environment

The `backend/.env` file is already created with defaults. For production, change `JWT_SECRET`:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

### 3. Run the backend

```bash
cd backend
npm run dev
# API running at http://localhost:5000
# Database auto-created at backend/dataquest.db
# Seed data loaded automatically on first run
```

### 4. Run the frontend

```bash
cd frontend
npm run dev
# App running at http://localhost:5173
```

### 5. Open in browser

Visit **http://localhost:5173** — sign up with any email and start learning!

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Auth | Signup/login with bcrypt password hashing + JWT tokens |
| 📚 Courses | 6 courses with lessons, progress tracking, auto-enrollment |
| 💡 Problems | SQL & Python challenges with code editor, XP rewards |
| 🧠 Quizzes | Multiple-choice quiz with explanations and scoring |
| 🏆 Leaderboard | Real-time rankings by XP across all users |
| 🎓 Certificates | Auto-issued on course completion with credential IDs |
| 🔥 Streaks | Daily login streak tracking + activity calendar |
| ⭐ XP System | Earn XP for lessons (+20), problems (+50–200), quizzes (+30/q) |

---

## 🗄 Database Schema

- `users` — auth, XP, streak
- `courses` — catalog
- `lessons` — course content with markdown
- `user_course_progress` — per-user progress per course
- `problems` — coding challenges
- `user_problem_submissions` — submission history
- `quizzes` + `quiz_questions` — quiz engine
- `user_quiz_attempts` — quiz history
- `certificates` — issued on course completion
- `daily_streaks` — activity tracking

---

## 🔌 API Endpoints

```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me

GET    /api/courses
GET    /api/courses/:id
GET    /api/courses/:courseId/lessons/:lessonId
POST   /api/courses/:id/enroll
POST   /api/courses/:courseId/lessons/:lessonId/complete

GET    /api/problems
GET    /api/problems/:id
POST   /api/problems/:id/submit

GET    /api/quiz
GET    /api/quiz/:id
POST   /api/quiz/:id/submit

GET    /api/users/dashboard
GET    /api/users/leaderboard
GET    /api/users/certificates
```

---

## 🔮 What to Build Next

- [ ] **PDF certificate generation** — use `pdfkit` or `puppeteer`
- [ ] **Real code execution** — sandbox with Docker or Judge0 API
- [ ] **Video upload** — integrate Cloudinary or Bunny.net
- [ ] **Admin panel** — add courses, problems, quizzes from a UI
- [ ] **Email verification** — nodemailer + email on signup
- [ ] **Payment/subscriptions** — Razorpay for premium courses
- [ ] **Discussion forums** — per-problem comments
- [ ] **Mobile app** — React Native with the same API

---

## 👤 Built by

**Ravi Kumar** — Data Analyst @ PagarBook  
Building the best free resource to learn data analytics in India. 🇮🇳
