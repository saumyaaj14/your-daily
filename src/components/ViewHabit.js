import React, { useState } from 'react';
import { FiX, FiTrash2 } from 'react-icons/fi';

const THEMES = [
  { color: '#BCE4F7', label: 'blue' },
  { color: '#FCD19A', label: 'orange' },
  { color: '#FCCBBA', label: 'pink' },
  { color: '#F8EDB0', label: 'yellow' },
  { color: '#E9C6F8', label: 'violet' },
];

function ViewHabit({ habit, onClose, onDelete, onUpdate, onToggleLog }) {
  const [selectedTheme, setSelectedTheme] = useState(habit.color || '#BCE4F7');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [logs, setLogs] = useState(habit.logs || []);

  const today = new Date();

  const formatTodayDate = () => {
    const day = today.getDate();
    const suffix = ['th','st','nd','rd'][((day%100)-20)%10]||['th','st','nd','rd'][day%100]||'th';
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${day}${suffix} ${months[today.getMonth()]} ${today.getFullYear()}`;
  };

  const getMonthCalendar = () => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Adjust for Monday start
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(i);
    return cells;
  };

  const getDateKey = (day) => {
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  };

  const handleToggleDay = (day) => {
    const dateKey = getDateKey(day);
    const currentDay = today.getDate();
    // Only allow past and today
    if (day > currentDay) return;
    const isDone = logs.includes(dateKey);
    const newLogs = isDone ? logs.filter(l => l !== dateKey) : [...logs, dateKey];
    setLogs(newLogs);
    onToggleLog({ ...habit, logs }, dateKey);
  };

  const handleSave = () => {
    onUpdate(habit.id, { color: selectedTheme });
    onClose();
  };

  const dayHeaders = ['M','T','W','T','F','S','S'];
  const cells = getMonthCalendar();

  return (
    <div style={{
      position: 'fixed', top: 0, left: '50%',
      transform: 'translateX(-50%)',
      width: '100%', maxWidth: '390px',
      height: '100vh', zIndex: 2000,
      backgroundColor: selectedTheme,
      overflowY: 'auto',
      padding: '24px 24px 40px 24px',
    }}>

      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div
          onClick={onClose}
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            backgroundColor: '#FFFFFF', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}>
          <FiX size={18} color="#333" />
        </div>
        <div
          onClick={() => setShowDeleteConfirm(true)}
          style={{ cursor: 'pointer', padding: '8px' }}>
          <FiTrash2 size={20} color="#333" />
        </div>
      </div>

      {/* Icon + Name */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '36px', marginBottom: '4px' }}>{habit.icon}</div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#203418' }}>{habit.name}</div>
      </div>

      {/* Today's date banner */}
      <div style={{
        backgroundColor: '#F2F2F2', borderRadius: '12px',
        padding: '10px 16px', display: 'flex',
        justifyContent: 'space-between', marginBottom: '20px',
      }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#555' }}>TODAY'S DATE:</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#203418' }}>{formatTodayDate()}</span>
      </div>

      {/* Calendar grid */}
      <div style={{ marginBottom: '24px' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '8px' }}>
          {dayHeaders.map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#555' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const dateKey = getDateKey(day);
            const isLogged = logs.includes(dateKey);
            const isFuture = day > today.getDate();
            return (
              <div
                key={i}
                onClick={() => handleToggleDay(day)}
                style={{
                  height: '32px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: isFuture ? 'default' : 'pointer',
                  backgroundColor: isLogged ? '#FFFFFF' : 'transparent',
                  opacity: isFuture ? 0.4 : 1,
                }}>
                <span style={{
                  fontSize: '13px', fontWeight: isLogged ? 700 : 400,
                  color: '#203418',
                }}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Choose Theme */}
      <div style={{
        backgroundColor: '#F2F2F2', borderRadius: '16px',
        padding: '16px', marginBottom: '24px',
      }}>
        <div style={{
          fontSize: '13px', fontWeight: 700,
          color: '#000000', marginBottom: '12px', textAlign: 'center',
        }}>
          Choose Theme
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          {THEMES.map(theme => (
            <div
              key={theme.color}
              onClick={() => setSelectedTheme(theme.color)}
              style={{
                width: '20px', height: '20px', borderRadius: '50%',
                backgroundColor: theme.color, cursor: 'pointer',
                border: selectedTheme === theme.color ? '2px solid #333' : '2px solid transparent',
                boxShadow: selectedTheme === theme.color ? '0 0 0 2px #333' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div
        onClick={handleSave}
        style={{
          width: '100%', height: '50px',
          backgroundColor: '#F2F2F2', borderRadius: '30px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0px 4px 6px rgba(0,0,0,0.15)',
          marginBottom: '16px',
        }}>
        <span style={{ color: '#203418', fontSize: '18px', fontWeight: 600 }}>Save</span>
      </div>

      {/* Cancel */}
      <div
        onClick={onClose}
        style={{
          textAlign: 'center', fontSize: '13px',
          color: '#203418', textDecoration: 'underline',
          cursor: 'pointer',
        }}>
        CANCEL
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: '100%', maxWidth: '390px',
          height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 3000, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '16px',
            padding: '24px', width: '80%', textAlign: 'center',
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: '#203418' }}>
              Delete this habit?
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <div
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '10px 24px', borderRadius: '30px',
                  border: '1px solid #ccc', cursor: 'pointer',
                  fontSize: '14px', color: '#555',
                }}>
                Cancel
              </div>
              <div
                onClick={() => onDelete(habit.id)}
                style={{
                  padding: '10px 24px', borderRadius: '30px',
                  backgroundColor: '#E53935', cursor: 'pointer',
                  fontSize: '14px', color: '#FFFFFF', fontWeight: 700,
                }}>
                Delete
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewHabit;