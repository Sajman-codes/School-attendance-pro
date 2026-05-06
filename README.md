# 🏫 School Attendance System

A full-stack attendance tracking system for secondary schools.
Built with React + Vite (frontend) and Node.js + Express + Sequelize + SQLite (backend).

---

## 🚀 SETUP INSTRUCTIONS

### Step 1 — Set up the Backend

Open a terminal and run:

```bash
cd backend
npm install
npm run seed
npm run dev
```

The server will start on http://localhost:5000
The seed command creates 6 default teacher accounts.

---

### Step 2 — Set up the Frontend

Open a SECOND terminal and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on http://localhost:5173

---

## 🔑 DEFAULT TEACHER LOGIN CREDENTIALS

| Class | Username      | Password     |
|-------|---------------|--------------|
| JSS 1 | jss1_teacher  | jss1pass123  |
| JSS 2 | jss2_teacher  | jss2pass123  |
| JSS 3 | jss3_teacher  | jss3pass123  |
| SSS 1 | sss1_teacher  | sss1pass123  |
| SSS 2 | sss2_teacher  | sss2pass123  |
| SSS 3 | sss3_teacher  | sss3pass123  |

⚠️  Change these passwords after first login!

---

## ✨ FEATURES

- 🏠 Landing page — select your class
- 🔐 Secure login — each teacher has unique username + password
- 🔒 Role-based access — teachers can ONLY see their own class
- ✅ Mark attendance — present/absent per student per day
- 👥 Bulk add students — paste 10, 50, 100+ names at once (one per line)
- 📊 Dashboard — charts, stats, at-risk students
- 📈 Reports — attendance trends, top/bottom performers
- 📄 Export PDF — download full attendance report
- 💾 SQLite database — no installation required

---

## 📁 PROJECT STRUCTURE

```
school-attendance-pro/
├── backend/
│   ├── config/database.js     ← SQLite connection
│   ├── middleware/auth.js      ← JWT authentication
│   ├── models/
│   │   ├── Teacher.js
│   │   ├── Student.js
│   │   └── Attendance.js
│   ├── routes/
│   │   ├── auth.js            ← Login/register endpoints
│   │   ├── students.js        ← Student CRUD + bulk add
│   │   └── attendance.js      ← Mark + fetch attendance
│   ├── data/seed.js           ← Creates default teachers
│   ├── server.js              ← Main server entry
│   ├── .env                   ← Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── context/AuthContext.jsx  ← Login state management
    │   ├── pages/
    │   │   ├── LandingPage.jsx      ← Class selection page
    │   │   ├── LoginPage.jsx        ← Teacher login page
    │   │   └── DashboardPage.jsx    ← Full dashboard
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🔧 TO ADD A NEW TEACHER

Send a POST request to: `http://localhost:5000/api/auth/register`

```json
{
  "fullName": "Mrs. Example Teacher",
  "username": "new_teacher",
  "password": "securepassword",
  "className": "JSS1",
  "email": "teacher@school.com"
}
```

Classes available: JSS1, JSS2, JSS3, SSS1, SSS2, SSS3
