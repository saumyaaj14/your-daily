import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';
import TaskForm from '../components/TaskForm';

const FILTERS = ['To do', 'Completed', 'High', 'Medium', 'Low'];

function TaskDump() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [userName, setUserName] = useState('');

  const today = new Date();

  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = String(dateStr).split('-').map(Number);
    return new Date(year, month - 1, day);
  };

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
      days.push({ dayName: dayNames[d.getDay()], date: d.getDate(), isToday: i === 0 });
    }
    return days;
  };

  const monthYear = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName ? user.displayName.split(' ')[0] : 'User');
      fetchTasks(user.uid);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchTasks = async (uid) => {
    try {
      const snap = await getDocs(query(collection(db, 'tasks'), where('userId', '==', uid)));
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSaveTask = async (taskData) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      if (editingTask) {
        await updateDoc(doc(db, 'tasks', editingTask.id), taskData);
        setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t));
      } else {
        const docRef = await addDoc(collection(db, 'tasks'), {
          ...taskData, userId: user.uid, completed: false, createdAt: new Date(),
        });
        setTasks([...tasks, { id: docRef.id, ...taskData, userId: user.uid, completed: false }]);
      }
    } catch (e) {
      console.error(e);
    }
    setShowForm(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (e) {
      console.error(e);
    }
    setShowForm(false);
    setEditingTask(null);
  };

  const handleComplete = async (task) => {
    try {
      await updateDoc(doc(db, 'tasks', task.id), { completed: !task.completed });
      setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
    } catch (e) {
      console.error(e);
    }
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return '';
    const d = parseLocalDate(dateStr);
    const day = d.getDate();
    const suffix = ['th','st','nd','rd'][((day%100)-20)%10]||['th','st','nd','rd'][day%100]||'th';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${day}${suffix} ${months[d.getMonth()]}`;
  };

  const priorityColor = (p) => {
    const pl = p?.toLowerCase();
    return pl === 'high' ? '#FF0000' : pl === 'medium' ? '#FFB800' : '#008DB7';
  };

  const getFilteredTasks = () => {
    switch (activeFilter) {
      case 'To do':
        return tasks.filter(t => !t.completed);
      case 'Completed':
        return tasks.filter(t => t.completed);
      case 'High':
        return tasks.filter(t => !t.completed && t.priority?.toLowerCase() === 'high');
      case 'Medium':
        return tasks.filter(t => !t.completed && t.priority?.toLowerCase() === 'medium');
      case 'Low':
        return tasks.filter(t => !t.completed && t.priority?.toLowerCase() === 'low');
      default:
        return tasks.filter(t => !t.completed);
    }
  };

  const filteredTasks = getFilteredTasks();
  const isEmpty = tasks.length === 0;

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

      {/* Blur overlay — rendered at root level so it covers everything */}
      {filterOpen && (
        <div
          onClick={() => setFilterOpen(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 200,
          }}
        >
          {/* Filter cards — top right, stop clicks from closing */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '160px',
              right: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {FILTERS.map(f => (
              <div
                key={f}
                onClick={() => { setActiveFilter(f); setFilterOpen(false); }}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  width: '92px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '3px 4px 4px rgba(0,0,0,0.15)',
                  fontSize: '13px',
                  fontWeight: 400,
                  color: '#000000',
                }}
              >
                {f}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '50px 20px 0 20px' }}>

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#203418' }}>
              Hey {userName},
            </div>
            <div style={{ fontSize: '12px', fontWeight: 400, color: '#000000', marginTop: '4px' }}>
              {formatDate(today)}
            </div>
          </div>
          <div
            onClick={() => { setEditingTask(null); setShowForm(true); }}
            style={{
              backgroundColor: '#E97C3B',
              borderRadius: '5px',
              width: '79px',
              height: '27px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginTop: '8px',
              flexShrink: 0,
              boxShadow: '3px 4px 4px rgba(0,0,0,0.14)',
            }}
          >
            <span style={{ color: '#F2F2F2', fontSize: '12px', fontWeight: 700 }}>Add</span>
          </div>
        </div>

        {/* Calendar Strip */}
        <div style={{ marginTop: '16px', marginBottom: '20px' }}>
          <div style={{
            textAlign: 'right', fontSize: '14px',
            fontWeight: 700, color: '#000000', marginBottom: '8px',
          }}>
            {monthYear}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {getCalendarDays().map((day, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: '#000000', fontWeight: 400 }}>{day.dayName}</span>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  backgroundColor: day.isToday ? '#839788' : '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0px 4px 4px rgba(0,0,0,0.15)',
                }}>
                  <span style={{
                    fontSize: '13px', fontWeight: 700,
                    color: day.isToday ? '#F2F2F2' : '#000000',
                  }}>
                    {day.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', marginBottom: '24px' }} />

        {/* Empty state */}
        {isEmpty ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', marginTop: '60px', gap: '20px',
          }}>
            <p style={{ fontSize: '14px', color: '#888', textAlign: 'center' }}>
              Add a new task to start tracking.
            </p>
            <div
              onClick={() => { setEditingTask(null); setShowForm(true); }}
              style={{
                backgroundColor: '#E8823A', borderRadius: '30px',
                padding: '12px 40px', cursor: 'pointer',
                boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
              }}
            >
              <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>Begin</span>
            </div>
          </div>

        ) : (
          <div>
            {/* Task List header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '16px',
            }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#053220' }}>Task List</span>

              {activeFilter ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    onClick={() => setFilterOpen(true)}
                    style={{
                      backgroundColor: '#448080', borderRadius: '30px',
                      padding: '6px 16px', cursor: 'pointer',
                      boxShadow: '3px 4px 4px rgba(0,0,0,0.15)',
                    }}
                  >
                    <span style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 400 }}>
                      {activeFilter}
                    </span>
                  </div>
                  <div
                    onClick={() => setActiveFilter(null)}
                    style={{
                      fontSize: '18px', color: '#888',
                      cursor: 'pointer', lineHeight: 1, padding: '2px 4px',
                    }}
                  >
                    ×
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setFilterOpen(true)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '3px 4px 4px rgba(0,0,0,0.15)',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <line x1="2" y1="5" x2="16" y2="5" stroke="#444" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="2" y1="9" x2="16" y2="9" stroke="#444" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="2" y1="13" x2="16" y2="13" stroke="#444" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="6" cy="5" r="2" fill="#F2F2F2" stroke="#444" strokeWidth="1.5"/>
                    <circle cx="12" cy="9" r="2" fill="#F2F2F2" stroke="#444" strokeWidth="1.5"/>
                    <circle cx="7" cy="13" r="2" fill="#F2F2F2" stroke="#444" strokeWidth="1.5"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Task rows */}
            {filteredTasks.map(task => (
              <div
                key={task.id}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: '10px', padding: '12px 0',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                {/* Priority dot */}
                <div style={{
                  width: '15px', height: '15px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: priorityColor(task.priority),
                }} />

                {/* Title */}
                <span
                  onClick={() => { setEditingTask(task); setShowForm(true); }}
                  style={{
                    fontSize: '14px', fontWeight: 700,
                    color: '#000000', cursor: 'pointer',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    flexShrink: 1,
                  }}
                >
                  {task.title}
                </span>

                {/* Due date pill — right after title */}
                {task.dueDate && (
                  <div style={{
                    border: '1px solid #7C972F',
                    borderRadius: '30px',
                    padding: '3px 10px',
                    fontSize: '12px', fontWeight: 400,
                    color: '#000000', flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}>
                    {formatDueDate(task.dueDate)}
                  </div>
                )}

                {/* Spacer pushes checkbox to the right */}
                <div style={{ flex: 1 }} />

                {/* Checkbox */}
                <div
                  onClick={() => handleComplete(task)}
                  style={{
                    width: '20px', height: '20px', borderRadius: '4px', flexShrink: 0,
                    border: '2px solid #7C972F',
                    backgroundColor: task.completed ? '#7C972F' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {task.completed && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
            ))}

            {filteredTasks.length === 0 && (
              <p style={{ fontSize: '13px', color: '#888', textAlign: 'center', marginTop: '24px' }}>
                No tasks found.
              </p>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}

      <BottomNav />
    </div>
  );
}

export default TaskDump;