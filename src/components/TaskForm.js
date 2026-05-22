import React, { useState } from 'react';
import { FiX, FiTrash2 } from 'react-icons/fi';
import { BsCalendar3 } from 'react-icons/bs';

function TaskForm({ task, onSave, onDelete, onClose }) {
  const isEditing = !!task;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || todayStr);
  const [priority, setPriority] = useState(task?.priority || 'Low');
  const [titleError, setTitleError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

 const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const dayNum = d.getDate();
    const suffix = ['th','st','nd','rd'][((dayNum%100)-20)%10]||['th','st','nd','rd'][dayNum%100]||'th';
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${dayNum}${suffix} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError('Task title is required.');
      return;
    }
    onSave({ title, description, dueDate, priority });
  };

  const priorityButtons = [
    { label: 'High', bg: '#F28B82' },
    { label: 'Medium', bg: '#FFD580' },
    { label: 'Low', bg: '#AECBFA' },
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: '50%',
      transform: 'translateX(-50%)',
      width: '100%', maxWidth: '390px',
      height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 2000, display: 'flex',
      alignItems: 'flex-end',
    }}>
      <div style={{
        width: '100%', backgroundColor: '#F2F2F2',
        borderRadius: '20px 20px 0 0',
        padding: '24px 24px 40px 24px',
        maxHeight: '90vh', overflowY: 'auto',
      }}>

        {/* Top row - X and Trash */}
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

          {isEditing && (
            <div
              onClick={() => setShowDeleteConfirm(true)}
              style={{ cursor: 'pointer', padding: '8px' }}>
              <FiTrash2 size={20} color="#333" />
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{
          fontSize: '22px', fontWeight: 800,
          color: '#203418', textAlign: 'center', marginBottom: '24px',
        }}>
          {isEditing ? 'Edit Task' : 'Add New Task'}
        </div>

        {/* Task Title Input */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setTitleError(''); }}
            style={{
              width: '100%', border: 'none',
              borderBottom: `2px solid ${titleError ? 'red' : '#7C972F'}`,
              backgroundColor: 'transparent', padding: '8px 0',
              fontSize: '16px', fontWeight: 600, color: '#203418',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              outline: 'none',
            }}
          />
          {titleError && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{titleError}</div>
          )}
        </div>

        {/* Description */}
        <div style={{ marginBottom: '16px' }}>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%', height: '100px',
              border: '1.5px solid #7C972F',
              borderRadius: '12px', padding: '12px',
              fontSize: '14px', color: '#203418',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              backgroundColor: 'transparent',
              outline: 'none', resize: 'none',
            }}
          />
        </div>

        {/* Date Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <BsCalendar3 size={20} color="#7C972F" />
          <label style={{ position: 'relative' }}>
            <div style={{
              backgroundColor: '#4A6741', borderRadius: '30px',
              padding: '6px 16px', cursor: 'pointer',
            }}>
              <span style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 600 }}>
                {formatDisplayDate(dueDate)}
              </span>
            </div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                position: 'absolute', opacity: 0,
                top: 0, left: 0, width: '100%', height: '100%',
                cursor: 'pointer',
              }}
            />
          </label>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', marginBottom: '16px' }} />

        {/* Set Priority */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '8px', marginBottom: '12px',
          }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#203418', letterSpacing: '0.5px' }}>
              SET PRIORITY
            </span>
            <span>🚩</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {priorityButtons.map(btn => (
              <div
                key={btn.label}
                onClick={() => setPriority(btn.label)}
                style={{
                  flex: 1, padding: '10px 0', textAlign: 'center',
                  borderRadius: '30px', cursor: 'pointer',
                  backgroundColor: btn.bg,
                  boxShadow: priority === btn.label ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
                  fontWeight: 700, fontSize: '14px', color: '#333',
                  border: priority === btn.label ? '2px solid rgba(0,0,0,0.2)' : '2px solid transparent',
                }}>
                {btn.label}
              </div>
            ))}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', marginBottom: '24px' }} />

        {/* Save/Add Button */}
        <div
          onClick={handleSave}
          style={{
            width: '100%', height: '50px',
            backgroundColor: '#7C972F', borderRadius: '30px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0px 4px 6px rgba(0,0,0,0.25)',
            marginBottom: '16px',
          }}>
          <span style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 400 }}>
            {isEditing ? 'Save' : 'Add Task'}
          </span>
        </div>

        {/* Cancel */}
        <div
          onClick={onClose}
          style={{
            textAlign: 'center', fontSize: '13px',
            fontWeight: 700, color: '#555',
            textDecoration: 'underline', cursor: 'pointer',
          }}>
          CANCEL
        </div>
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
              Delete this task?
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
                onClick={() => onDelete(task.id)}
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

export default TaskForm;