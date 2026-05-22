import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';
import emptyIllustration1 from '../assets/illustrations/EmptyDashboard2-illustration.svg';
import emptyIllustration2 from '../assets/illustrations/EmptyDashboard1-illustration.svg';

function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date helpers
  const today = new Date();
  const formatDate = (date) => {
    const day = date.getDate();
    const suffix = ['th','st','nd','rd'][((day%100)-20)%10]||['th','st','nd','rd'][day%100]||'th';
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${day}${suffix} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Calendar strip - 7 days starting from 3 days ago
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
      fetchData(user.uid);
    } else {
      setUserName('User');
      setLoading(false);
    }
  }, []);
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = String(dateStr).split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  const fetchData = async (uid) => {
    try {
      const tasksSnap = await getDocs(query(collection(db, 'tasks'), where('userId', '==', uid)));
      const habitsSnap = await getDocs(query(collection(db, 'habits'), where('userId', '==', uid)));
      setTasks(tasksSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setHabits(habitsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };
  const handleToggleHabit = async (habit) => {
    const logs = habit.logs || [];
    const isDone = logs.includes(todayKey);
    const newLogs = isDone ? logs.filter(l => l !== todayKey) : [...logs, todayKey];
    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'habits', habit.id), { logs: newLogs });
      setHabits(habits.map(h => h.id === habit.id ? { ...h, logs: newLogs } : h));
    } catch (e) {
      console.error(e);
    }
  };
  const handleCompleteTask = async (task) => {
    try {
      await updateDoc(doc(db, 'tasks', task.id), { completed: !task.completed });
      setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
    } catch (e) {
      console.error(e);
    }
  };

  // Task filtering
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

const todayTasks = tasks.filter(t => {
    const d = parseLocalDate(t.dueDate);
    return !t.completed && d && d >= todayStart && d < todayEnd;
  });
const overdueTasks = tasks
    .filter(t => {
      const d = parseLocalDate(t.dueDate);
      return !t.completed && d && d < todayStart;
    })
    .sort((a, b) => parseLocalDate(b.dueDate) - parseLocalDate(a.dueDate))
    .slice(0, 3);
const upcomingTasks = tasks
    .filter(t => {
      const d = parseLocalDate(t.dueDate);
      return !t.completed && d && d >= todayEnd;
    })
    .sort((a, b) => parseLocalDate(a.dueDate) - parseLocalDate(b.dueDate))
    .slice(0, 3);

  const isEmpty = tasks.length === 0 && habits.length === 0;

  // Donut chart
  const pendingTasks = tasks.filter(t => !t.completed);
  const high = pendingTasks.filter(t => t.priority === 'High').length;
  const medium = pendingTasks.filter(t => t.priority === 'Medium').length;
  const low = pendingTasks.filter(t => t.priority === 'Low').length;
  const total = pendingTasks.length || 1;

  const DonutChart = () => {
    const size = 120;
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const highDash = (high / total) * circumference;
    const medDash = (medium / total) * circumference;
    const lowDash = (low / total) * circumference;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#e0e0e0" strokeWidth="14" />
        {high > 0 && (
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#E53935"
            strokeWidth="14" strokeDasharray={`${highDash} ${circumference}`}
            strokeDashoffset="0" transform="rotate(-90 60 60)" />
        )}
        {medium > 0 && (
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#FFC107"
            strokeWidth="14" strokeDasharray={`${medDash} ${circumference}`}
            strokeDashoffset={`${-highDash}`} transform="rotate(-90 60 60)" />
        )}
        {low > 0 && (
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#2196F3"
            strokeWidth="14" strokeDasharray={`${lowDash} ${circumference}`}
            strokeDashoffset={`${-(highDash + medDash)}`} transform="rotate(-90 60 60)" />
        )}
        <text x="60" y="65" textAnchor="middle" fontSize="20" fontWeight="700"
          fontFamily="Plus Jakarta Sans" fill="#203418">
          {pendingTasks.length}
        </text>
      </svg>
    );
  };

const TaskRow = ({ task }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
      <div
        onClick={() => handleCompleteTask(task)}
        style={{
          width: '24px', height: '24px', borderRadius: '50%',
          border: '2px solid #7C972F', flexShrink: 0,
          backgroundColor: task.completed ? '#7C972F' : 'transparent',
          cursor: 'pointer',
        }}
      />
      <span style={{
        fontSize: '14px', fontWeight: 700, color: '#203418', flex: 1,
        textDecoration: task.completed ? 'line-through' : 'none',
      }}>
        {task.title}
      </span>
      <div style={{
        width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
        backgroundColor: task.priority === 'High' ? '#E53935' : task.priority === 'Medium' ? '#FFC107' : '#2196F3'
      }} />
    </div>
  );

  const SectionHeader = ({ title, color, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      {icon && <span>{icon}</span>}
      <span style={{ fontSize: '16px', fontWeight: 700, color: color || '#203418' }}>{title}</span>
    </div>
  );

  const MoreLink = () => (
    <div onClick={() => navigate('/tasks')} style={{
      textAlign: 'center', fontSize: '13px', color: '#888',
      cursor: 'pointer', marginTop: '4px',
    }}>
      More ∨
    </div>
  );

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

      {/* Scrollable content */}
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
    textAlign: 'right',
    fontSize: '12px',
    fontWeight: 600,
    color: '#203418',
    marginBottom: '8px',
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div onClick={() => navigate('/tasks')} style={{
                backgroundColor: '#4A9B8E', borderRadius: '30px',
                padding: '10px 24px', cursor: 'pointer',
                boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
              }}>
                <span style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 600 }}>+ Tasks</span>
              </div>
              <div onClick={() => navigate('/habits')} style={{
                backgroundColor: '#6BC4B8', borderRadius: '30px',
                padding: '10px 24px', cursor: 'pointer',
                boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
              }}>
                <span style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 600 }}>+ Habits</span>
              </div>
            </div>

            {/* Empty text */}
            <p style={{ fontSize: '14px', color: '#888', textAlign: 'center', marginBottom: '16px' }}>
              start adding tasks<br />and habits to start tracking
            </p>

            {/* Small illustration */}
            <img src={emptyIllustration1} alt="" style={{ width: '80px', marginBottom: '8px' }} />

            {/* Big illustration */}
            <img src={emptyIllustration2} alt="" style={{ width: '280px' }} />

          </div>

        ) : (

          /* POPULATED STATE */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Habits quick mark - only if habits exist */}
{habits.length > 0 && habits.some(h => !(h.logs || []).includes(todayKey)) && (
  <div>
    <div style={{ fontSize: '16px', fontWeight: 700, color: '#203418', marginBottom: '12px', textAlign: 'center' }}>
      Mark Your Habits!
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
      {habits.slice(0, 3).map(habit => {
        const isDone = (habit.logs || []).includes(todayKey);
        if (isDone) return null;
        return (
          <div
            key={habit.id}
            onClick={() => handleToggleHabit(habit)}
            style={{
              backgroundColor: habit.color || '#BCE4F7',
              borderRadius: '30px', padding: '8px 16px',
              fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', color: '#203418',
            }}>
            {habit.name}
          </div>
        );
      })}
    </div>
    {habits.length > 3 && (
      <div onClick={() => navigate('/habits')} style={{
        textAlign: 'center', fontSize: '13px',
        color: '#888', cursor: 'pointer', marginTop: '4px',
      }}>
        More ∨
      </div>
    )}
  </div>
)}

            {/* Today's Tasks */}
            <div>
              <SectionHeader title="Today's Tasks" color="#4A6741" />
              {todayTasks.slice(0, 3).map(task => <TaskRow key={task.id} task={task} />)}
              {todayTasks.length === 0 && (
                <p style={{ fontSize: '13px', color: '#888' }}>No tasks for today.</p>
              )}
              {todayTasks.length > 3 && <MoreLink />}
            </div>

            {/* Overview + Donut Chart */}
            <div>
              <SectionHeader title="Overview" />
              <div style={{ fontSize: '13px', color: '#555', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Tasks Completed Today: {tasks.filter(t => t.completed).length}</span>
                <span>Tasks Pending: {pendingTasks.length}</span>
              </div>
              <div style={{
                backgroundColor: '#FFFFFF', borderRadius: '16px',
                padding: '16px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}>
                <DonutChart />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'High', color: '#E53935' },
                    { label: 'Medium', color: '#FFC107' },
                    { label: 'Low', color: '#2196F3' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                      <span style={{ fontSize: '12px', color: '#555' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overdue Tasks */}
            {overdueTasks.length > 0 && (
              <div>
                <SectionHeader title="Overdue Tasks" color="#E53935" icon="⚠️" />
                {overdueTasks.map(task => <TaskRow key={task.id} task={task} />)}
                <MoreLink />
              </div>
            )}

            {/* Upcoming Tasks */}
            {upcomingTasks.length > 0 && (
              <div>
                <SectionHeader title="Upcoming Tasks" />
                {upcomingTasks.map(task => <TaskRow key={task.id} task={task} />)}
                {upcomingTasks.length >= 3 && <MoreLink />}
              </div>
            )}

          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default Dashboard;