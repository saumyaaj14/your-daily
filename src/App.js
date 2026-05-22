import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import LandingPage from './pages/LandingPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import TaskDump from './pages/TaskDump';
import HabitTracker from './pages/HabitTracker';
import ProfilePage from './pages/ProfilePage';

function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Still loading auth state
  if (user === undefined) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', height: '100vh',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: '#7C972F', fontSize: '16px',
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes - redirect to dashboard if already logged in */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignUpPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />

        {/* Protected routes - redirect to landing if not logged in */}
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/tasks" element={user ? <TaskDump /> : <Navigate to="/" />} />
        <Route path="/habits" element={user ? <HabitTracker /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/" />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;