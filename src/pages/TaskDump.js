import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';
import TaskForm from '../components/TaskForm';

function TaskDump() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('todo');
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
          ...taskData,
          userId: user.uid,
          completed: false,
          createdAt: new Date(),
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

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
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
                  <span style={{
                    fontSize: '13px', fontWeight: 700,
                    color: day.isToday ? '#FFFFFF' : '#203418',
                  }}>
                    {day.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', marginBottom: '24px' }} />

        {/* EMPTY STATE */}
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
                backgroundColor: '#E8823A',
                borderRadius: '30px',
                padding: '12px 40px',
                cursor: 'pointer',
                boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
              }}>
              <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>Begin</span>
            </div>
          </div>

        ) : (
          <div>
            {/* Filter toggles + Add button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['todo', 'completed'].map(f => (
                  <div
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '30px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor: filter === f ? '#7C972F' : '#E0E0E0',
                      color: filter === f ? '#FFFFFF' : '#555',
                    }}>
                    {f === 'todo' ? 'To Do' : 'Completed'}
                  </div>
                ))}
              </div>

              <div
                onClick={() => { setEditingTask(null); setShowForm(true); }}
                style={{
                  backgroundColor: '#E8823A',
                  borderRadius: '30px',
                  padding: '8px 20px',
                  cursor: 'pointer',
                  boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
                }}>
                <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>Add</span>
              </div>
            </div>

            {/* Task List */}
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#203418', marginBottom: '12px' }}>
              Task List
            </div>

            {(filter === 'todo' ? activeTasks : completedTasks).map(task => (
              <div
                key={task.id}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: '12px', padding: '12px 0',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                {/* Checkbox - toggles completion */}
                <div
                  onClick={() => handleComplete(task)}
                  style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    border: '2px solid #7C972F', flexShrink: 0,
                    backgroundColor: task.completed ? '#7C972F' : 'transparent',
                    cursor: 'pointer',
                  }}
                />

                {/* Title - opens edit form */}
                <span
                  onClick={() => { setEditingTask(task); setShowForm(true); }}
                  style={{
                    fontSize: '15px', fontWeight: 700,
                    color: '#203418', flex: 1,
                    textDecoration: task.completed ? 'line-through' : 'none',
                    cursor: 'pointer',
                  }}>
                  {task.title}
                </span>

                {/* Priority dot */}
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor:
                    task.priority === 'High' ? '#E53935' :
                    task.priority === 'Medium' ? '#FFC107' : '#2196F3'
                }} />

                {/* Due date pill */}
                <div style={{
                  border: '1px solid #ccc', borderRadius: '30px',
                  padding: '4px 10px', fontSize: '11px',
                  color: '#555', flexShrink: 0,
                }}>
                  {formatDueDate(task.dueDate)}
                </div>
              </div>
            ))}

            {(filter === 'todo' ? activeTasks : completedTasks).length === 0 && (
              <p style={{ fontSize: '13px', color: '#888', textAlign: 'center', marginTop: '24px' }}>
                {filter === 'todo' ? 'No active tasks.' : 'No completed tasks yet.'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Task Form Modal */}
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