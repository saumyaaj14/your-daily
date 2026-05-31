import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';
import emptyIllustration1 from '../assets/illustrations/EmptyDashboard2-illustration.svg';
import emptyIllustration2 from '../assets/illustrations/EmptyDashboard1-illustration.svg';
import overdueIcon from '../assets/illustrations/overdue.svg';

function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayExpanded, setTodayExpanded] = useState(false);
  const [overdueExpanded, setOverdueExpanded] = useState(false);
  const [upcomingExpanded, setUpcomingExpanded] = useState(false);

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
    const nowCompleted = !task.completed;
    const updates = {
      completed: nowCompleted,
      completedAt: nowCompleted ? todayKey : null,
    };
    try {
      await updateDoc(doc(db, 'tasks', task.id), updates);
      setTasks(tasks.map(t => t.id === task.id ? { ...t, ...updates } : t));
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
    .sort((a, b) => parseLocalDate(b.dueDate) - parseLocalDate(a.dueDate));

  const upcomingTasks = tasks
    .filter(t => {
      const d = parseLocalDate(t.dueDate);
      return !t.completed && d && d >= todayEnd;
    })
    .sort((a, b) => parseLocalDate(a.dueDate) - parseLocalDate(b.dueDate));

  const isEmpty = tasks.length === 0 && habits.length === 0; // brand new user
  const noTasksToday = habits.length > 0 && tasks.length === 0; // has habits but no tasks at all
  const allDoneToday = habits.length > 0 && tasks.length > 0 && todayTasks.length === 0 && overdueTasks.length === 0 && upcomingTasks.length === 0; // all tasks completed

  // Donut chart
  const pendingTasks = tasks.filter(t => !t.completed);
  const high = pendingTasks.filter(t => t.priority === 'High').length;
  const medium = pendingTasks.filter(t => t.priority === 'Medium').length;
  const low = pendingTasks.filter(t => t.priority === 'Low').length;
  const total = pendingTasks.length || 1;

  // Helper: days ago string for overdue tasks
  const getDaysAgo = (dateStr) => {
    const d = parseLocalDate(dateStr);
    if (!d) return '';
    const diffMs = todayStart - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  // Priority colors (updated from Figma)
  const priorityColor = (p) =>
    p === 'High' ? '#FF0000' : p === 'Medium' ? '#FFB800' : '#008DB7';

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
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#FF0000"
            strokeWidth="14" strokeDasharray={`${highDash} ${circumference}`}
            strokeDashoffset="0" transform="rotate(-90 60 60)" />
        )}
        {medium > 0 && (
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#FFB800"
            strokeWidth="14" strokeDasharray={`${medDash} ${circumference}`}
            strokeDashoffset={`${-highDash}`} transform="rotate(-90 60 60)" />
        )}
        {low > 0 && (
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#008DB7"
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

  // Updated TaskRow: dot on LEFT, checkbox icon on RIGHT, "X days ago" label optional
  const TaskRow = ({ task, showDaysAgo = false }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
      {/* Priority dot — LEFT */}
      <div style={{
        width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0,
        backgroundColor: priorityColor(task.priority),
      }} />

      {/* Title + optional days-ago */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        <span style={{
          fontSize: '14px', fontWeight: 700, color: '#000000',
          textDecoration: task.completed ? 'line-through' : 'none',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {task.title}
        </span>
        {showDaysAgo && (
          <span style={{ fontSize: '11px', color: '#ACACAC', fontWeight: 400, whiteSpace: 'nowrap' }}>
            {getDaysAgo(task.dueDate)}
          </span>
        )}
      </div>

      {/* Checkbox — RIGHT */}
      <div
        onClick={() => handleCompleteTask(task)}
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
            <path d="M1 5L4.5 8.5L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  );

  // Card wrapper for task lists — tappable to expand
  const TaskCard = ({ children, onClick, expanded, hasMore }) => (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '10px',
        padding: '8px 16px 6px 16px',
        boxShadow: '3px 4px 4px rgba(0,0,0,0.15)',
        cursor: hasMore && !expanded ? 'pointer' : 'default',
      }}
    >
      {children}
      {hasMore && (
        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#ACACAC',
          paddingTop: '2px',
          marginBottom: '-4px',
          userSelect: 'none',
          lineHeight: '1',
        }}>
          {expanded ? '∧' : '∨'}
        </div>
      )}
    </div>
  );

  const SectionHeader = ({ title, color, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      {icon && <span>{icon}</span>}
      <span style={{ fontSize: '16px', fontWeight: 700, color: color || '#053220' }}>{title}</span>
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
        {/* Date: 12px, weight 400, color #000 */}
        <div style={{ fontSize: '12px', fontWeight: 400, color: '#000000', marginTop: '4px', marginBottom: '16px' }}>
          {formatDate(today)}
        </div>

        {/* Calendar Strip */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            textAlign: 'right',
            fontSize: '14px',
            fontWeight: 700,         // bumped to 700 per Figma
            color: '#000000',
            marginBottom: '8px',
          }}>
            {monthYear}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {getCalendarDays().map((day, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                {/* Day name: weight 400 per Figma */}
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

        {/* BRAND NEW USER — no tasks, no habits */}
        {isEmpty ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
            <p style={{ fontSize: '14px', color: '#888', textAlign: 'center', marginBottom: '16px' }}>
              start adding tasks<br />and habits to start tracking
            </p>
            <img src={emptyIllustration1} alt="" style={{ width: '80px', marginBottom: '8px' }} />
            <img src={emptyIllustration2} alt="" style={{ width: '280px' }} />
          </div>

        /* ACTIVE USER — has habits but no tasks for today */
        ) : (noTasksToday || allDoneToday) ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Habits section */}
            {habits.some(h => !(h.logs || []).includes(todayKey)) && (
              <div style={{ width: '100%', marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#000000', marginBottom: '12px', textAlign: 'center' }}>
                  Mark Your Habits!
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  {habits.slice(0, 3).map(habit => {
                    const isDone = (habit.logs || []).includes(todayKey);
                    if (isDone) return null;
                    return (
                      <div
                        key={habit.id}
                        onClick={() => handleToggleHabit(habit)}
                        style={{
                          backgroundColor: habit.color || '#BCE4F7',
                          borderRadius: '40px',
                          width: '100px',
                          height: '34px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: 700,
                          cursor: 'pointer', color: '#000000',
                          boxShadow: '3px 4px 4px rgba(0,0,0,0.15)',
                        }}>
                        {habit.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <p style={{ fontSize: '11px', fontWeight: 400, color: '#000000', textAlign: 'center', marginBottom: '16px' }}>
              start adding tasks<br />and habits to start tracking
            </p>
            <div
              onClick={() => navigate('/tasks')}
              style={{
                backgroundColor: '#448080',
                borderRadius: '40px',
                padding: '10px 28px',
                cursor: 'pointer',
                boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
                marginBottom: '24px',
              }}>
              <span style={{ color: '#F2F2F2', fontSize: '14px', fontWeight: 700 }}>+ Tasks</span>
            </div>
            <img src={emptyIllustration1} alt="" style={{ width: '80px', marginBottom: '8px' }} />
            <img src={emptyIllustration2} alt="" style={{ width: '280px' }} />
          </div>

        ) : (

          /* POPULATED STATE */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Habits quick mark */}
            {habits.length > 0 && habits.some(h => !(h.logs || []).includes(todayKey)) && (
              <div>
                {/* "Mark Your Habits!" — #000, 13px, weight 700, centered */}
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#000000', marginBottom: '12px', textAlign: 'center' }}>
                  Mark Your Habits!
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                  {habits.slice(0, 3).map(habit => {
                    const isDone = (habit.logs || []).includes(todayKey);
                    if (isDone) return null;
                    return (
                      <div
                        key={habit.id}
                        onClick={() => handleToggleHabit(habit)}
                        style={{
                          backgroundColor: habit.color || '#BCE4F7',
                          borderRadius: '40px',
                          width: '100px',
                          height: '34px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: 700,
                          cursor: 'pointer', color: '#000000',
                          boxShadow: '3px 4px 4px rgba(0,0,0,0.15)',
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
              <SectionHeader title="Today's Tasks" color="#053220" />
              <TaskCard
                onClick={() => todayTasks.length > 3 && setTodayExpanded(e => !e)}
                expanded={todayExpanded}
                hasMore={todayTasks.length > 3}
              >
                {(todayExpanded ? todayTasks : todayTasks.slice(0, 3)).map(task => (
                  <TaskRow key={task.id} task={task} />
                ))}
                {todayTasks.length === 0 && (
                  <p style={{ fontSize: '13px', color: '#888', margin: '8px 0' }}>No tasks for today.</p>
                )}
              </TaskCard>
            </div>

            {/* Overview + Donut Chart */}
            <div>
              <SectionHeader title="Overview" color="#053220" />
              <div style={{ fontSize: '12px', color: '#053220', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Tasks Completed Today: {tasks.filter(t => t.completed && t.completedAt === todayKey).length}</span>
                <span>Tasks Pending: {pendingTasks.length}</span>
              </div>
              <div style={{
                backgroundColor: '#FFFFFF', borderRadius: '10px',
                padding: '16px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', boxShadow: '3px 4px 4px rgba(0,0,0,0.15)',
              }}>
                <DonutChart />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'High', color: '#FF0000' },
                    { label: 'Medium', color: '#FFB800' },
                    { label: 'Low', color: '#008DB7' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }} />
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#000000' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overdue Tasks */}
            {overdueTasks.length > 0 && (
              <div>
                <SectionHeader title="Overdue Tasks" color="#053220" icon={<img src={overdueIcon} alt="" style={{ width: '20px', height: '20px' }} />} />
                <TaskCard
                  onClick={() => overdueTasks.length > 3 && setOverdueExpanded(e => !e)}
                  expanded={overdueExpanded}
                  hasMore={overdueTasks.length > 3}
                >
                  {(overdueExpanded ? overdueTasks : overdueTasks.slice(0, 3)).map(task => (
                    <TaskRow key={task.id} task={task} showDaysAgo={true} />
                  ))}
                </TaskCard>
              </div>
            )}

            {/* Upcoming Tasks */}
            {upcomingTasks.length > 0 && (
              <div>
                <SectionHeader title="Upcoming Tasks" color="#053220" />
                <TaskCard
                  onClick={() => upcomingTasks.length > 3 && setUpcomingExpanded(e => !e)}
                  expanded={upcomingExpanded}
                  hasMore={upcomingTasks.length > 3}
                >
                  {(upcomingExpanded ? upcomingTasks : upcomingTasks.slice(0, 3)).map(task => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </TaskCard>
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