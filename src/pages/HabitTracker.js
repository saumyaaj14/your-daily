import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';
import AddHabitForm from '../components/AddHabitForm';
import ViewHabit from '../components/ViewHabit';

function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingHabit, setViewingHabit] = useState(null);
  const [userName, setUserName] = useState('');
  const longPressTimer = useRef(null);

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const formatDate = (date) => {
    const day = date.getDate();
    const suffix = ['th','st','nd','rd'][((day%100)-20)%10]||['th','st','nd','rd'][day%100]||'th';
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${day}${suffix} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getCalendarDays = () => {
    const days = [];
    const dayNames = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push({
        dayName: dayNames[d.getDay()],
        date: d.getDate(),
        isToday: i === 0,
      });
    }
    return days;
  };

  const monthYear = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName ? user.displayName.split(' ')[0] : 'User');
      fetchHabits(user.uid);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchHabits = async (uid) => {
    try {
      const snap = await getDocs(query(collection(db, 'habits'), where('userId', '==', uid)));
      setHabits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAddHabit = async (habitData) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, 'habits'), {
        ...habitData,
        userId: user.uid,
        logs: [],
        createdAt: new Date(),
      });
      setHabits([...habits, { id: docRef.id, ...habitData, userId: user.uid, logs: [] }]);
    } catch (e) {
      console.error(e);
    }
    setShowAddForm(false);
  };

  const handleToggleToday = async (habit) => {
    const logs = habit.logs || [];
    const isDone = logs.includes(todayKey);
    const newLogs = isDone ? logs.filter(l => l !== todayKey) : [...logs, todayKey];
    try {
      await updateDoc(doc(db, 'habits', habit.id), { logs: newLogs });
      setHabits(habits.map(h => h.id === habit.id ? { ...h, logs: newLogs } : h));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    try {
      await deleteDoc(doc(db, 'habits', habitId));
      setHabits(habits.filter(h => h.id !== habitId));
    } catch (e) {
      console.error(e);
    }
    setViewingHabit(null);
  };

  const handleUpdateHabit = async (habitId, updates) => {
    try {
      await updateDoc(doc(db, 'habits', habitId), updates);
      setHabits(habits.map(h => h.id === habitId ? { ...h, ...updates } : h));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleLog = async (habit, dateKey) => {
    const logs = habit.logs || [];
    const isDone = logs.includes(dateKey);
    const newLogs = isDone ? logs.filter(l => l !== dateKey) : [...logs, dateKey];
    try {
      await updateDoc(doc(db, 'habits', habit.id), { logs: newLogs });
      setHabits(habits.map(h => h.id === habit.id ? { ...h, logs: newLogs } : h));
      if (viewingHabit?.id === habit.id) {
        setViewingHabit({ ...viewingHabit, logs: newLogs });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Long press handlers
  const handleTouchStart = (habit) => {
    longPressTimer.current = setTimeout(() => {
      setViewingHabit(habit);
    }, 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimer.current);
  };

  const isEmpty = habits.length === 0;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#7C972F' }}>Loading...</span>
    </div>
  );

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#F2F2F2',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      paddingBottom: '80px',
    }}>
      <div style={{ padding: '50px 20px 0 20px' }}>

        {/* Header */}
        <div style={{ fontSize: '36px', fontWeight: 800, color: '#203418' }}>
          Hey {userName},
        </div>
        <div style={{ fontSize: '14px', color: '#203418', marginTop: '4px', marginBottom: '16px' }}>
          {formatDate(today)}
        </div>

        {/* Calendar Strip */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            textAlign: 'right', fontSize: '12px',
            fontWeight: 600, color: '#203418', marginBottom: '8px',
          }}>
            {monthYear}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {getCalendarDays().map((day, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: '#888', fontWeight: 600 }}>{day.dayName}</span>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: day.isToday ? '#4A6741' : '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: day.isToday ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: day.isToday ? '#FFFFFF' : '#203418' }}>
                    {day.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', marginBottom: '16px' }} />

        {/* EMPTY STATE */}
        {isEmpty ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', marginTop: '60px', gap: '20px',
          }}>
            <p style={{ fontSize: '14px', color: '#888', textAlign: 'center' }}>
              Add a habit to start tracking.
            </p>
            <div
              onClick={() => setShowAddForm(true)}
              style={{
                backgroundColor: '#E8823A', borderRadius: '30px',
                padding: '12px 40px', cursor: 'pointer',
                boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
              }}>
              <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>Begin</span>
            </div>
          </div>

        ) : (
          <div>
            {/* Hint + Add button row */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '16px',
            }}>
              <span style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
                Tap and Hold to view habit.
              </span>
              <div
                onClick={() => setShowAddForm(true)}
                style={{
                  backgroundColor: '#E8823A', borderRadius: '30px',
                  padding: '8px 20px', cursor: 'pointer',
                  boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
                }}>
                <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>+ Add</span>
              </div>
            </div>

            {/* Habit Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {habits.map(habit => {
                const isDone = (habit.logs || []).includes(todayKey);
                return (
                  <div
                    key={habit.id}
                    onTouchStart={() => handleTouchStart(habit)}
                    onTouchEnd={() => {
                      handleTouchEnd();
                      handleToggleToday(habit);
                    }}
                    onClick={() => handleToggleToday(habit)}
                    style={{
                      backgroundColor: habit.color || '#BCE4F7',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>{habit.icon || '⭐'}</span>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#203418' }}>
                        {habit.name}
                      </span>
                    </div>
                    {isDone && (
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#203418' }}>
                        Done for today!
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Habit Form */}
      {showAddForm && (
        <AddHabitForm
          onSave={handleAddHabit}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {/* View Habit Modal */}
      {viewingHabit && (
        <ViewHabit
          habit={viewingHabit}
          onClose={() => setViewingHabit(null)}
          onDelete={handleDeleteHabit}
          onUpdate={handleUpdateHabit}
          onToggleLog={handleToggleLog}
        />
      )}

      <BottomNav />
    </div>
  );
}

export default HabitTracker;