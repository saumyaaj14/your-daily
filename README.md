# Your Daily

A mobile-first Progressive Web App (PWA) for daily task management and habit tracking. Built to eliminate app fatigue by consolidating tasks, habits, and progress tracking into one clean interface.

🔗 **Live App:** https://your-daily.vercel.app

---

## Features

- **Task Management** — Add, edit, delete tasks with priority levels and due dates
- **Habit Tracking** — Track daily habits with a full month calendar history
- **Dashboard** — Today's tasks, overdue, upcoming, and a priority donut chart
- **Data Export** — Download all your data as a CSV file
- **PWA** — Installable on iPhone and Android, works like a native app

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React JS, React Router DOM |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Hosting | Vercel |
| Version Control | GitHub |

---

## Getting Started (Local Development)

### Prerequisites
- Node.js v18+
- A Firebase project with Firestore and Email/Password Auth enabled

### Installation

```bash
git clone https://github.com/saumyaaj14/your-daily.git
cd your-daily
npm install
```

### Firebase Setup
Create a `.env` file in the root with your Firebase config:
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

### Run Locally
```bash
npm start
```
Opens at `http://localhost:3000`

---

## Project Structure
src/
├── assets/illustrations/   # SVG illustrations
├── components/             # Reusable components
│   ├── BottomNav.js
│   ├── TaskForm.js
│   ├── AddHabitForm.js
│   └── ViewHabit.js
├── firebase/
│   └── config.js
├── pages/
│   ├── LandingPage.js
│   ├── SignUpPage.js
│   ├── LoginPage.js
│   ├── Dashboard.js
│   ├── TaskDump.js
│   ├── HabitTracker.js
│   └── ProfilePage.js
└── App.js

---

## Deployment

Hosted on Vercel with automatic deployment from the `main` branch on GitHub.

To deploy updates:
```bash
git add .
git commit -m "your message"
git push
```

---

## screens

| Screen | Description |
|--------|-------------|
| Landing | Entry point with Login and Sign Up |
| Sign Up | Account registration |
| Login | Authentication |
| Dashboard | Home with tasks, habits, and analytics |
| Task Dump | Full task list with filters |
| Habit Tracker | Daily habit tracking |
| Profile | Account settings and data export |

---

## Product Documentation

Built as part of a PM portfolio project. Designed in Figma, developed with React JS and Firebase.

- PRD and User Stories available on request
- QA Test Cases and Bug Reports maintained separately

---

## License

This project (v1.0) is for portfolio purposes.