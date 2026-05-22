import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import illustration from '../assets/illustrations/newhabbit-illustration.svg';

const EMOJI_OPTIONS = ['💪','📚','💊','🏃','💧','🧘','🍎','😴','✍️','🎯','🎵','🧹','🧴','🐕','🚴','🥗'];

const THEMES = [
  { color: '#BCE4F7', label: 'blue' },
  { color: '#FCD19A', label: 'orange' },
  { color: '#FCCBBA', label: 'pink' },
  { color: '#F8EDB0', label: 'yellow' },
  { color: '#E9C6F8', label: 'violet' },
];

function AddHabitForm({ onSave, onClose }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('⭐');
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0].color);
  const [nameError, setNameError] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      setNameError('Habit name is required.');
      return;
    }
    onSave({ name, icon, color: selectedTheme });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: '50%',
      transform: 'translateX(-50%)',
      width: '100%', maxWidth: '390px',
      height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 2000, display: 'flex', alignItems: 'flex-end',
    }}>
      <div style={{
        width: '100%', backgroundColor: '#F2F2F2',
        borderRadius: '20px 20px 0 0',
        padding: '24px 24px 40px 24px',
        maxHeight: '92vh', overflowY: 'auto',
      }}>

        {/* X button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
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
        </div>

        {/* Title */}
        <div style={{
          fontSize: '28px', fontWeight: 800,
          color: '#203418', textAlign: 'center', marginBottom: '16px',
        }}>
          Add New Habit
        </div>

        {/* Illustration */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <img src={illustration} alt="habit illustration" style={{ width: '185px', height: '185px', objectFit: 'contain' }} />
        </div>

        {/* Icon + Name input row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          {/* Emoji picker trigger */}
          <div
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            style={{
              width: '38px', height: '38px', borderRadius: '50%',
              border: '1px solid #7C972F', backgroundColor: '#F2F2F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '20px',
              boxShadow: '3px 4px 4px rgba(0,0,0,0.15)',
            }}>
            {icon === '⭐' ? <span style={{ color: '#7C972F', fontSize: '22px', fontWeight: 400 }}>+</span> : icon}
          </div>

          {/* Name input */}
          <input
            type="text"
            placeholder="Habit Name"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError(''); }}
            style={{
              flex: 1, height: '38px',
              border: `1px solid ${nameError ? 'red' : '#7C972F'}`,
              borderRadius: '40px', padding: '0 16px',
              fontSize: '15px', color: '#203418',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              backgroundColor: '#F2F2F2', outline: 'none',
              boxShadow: '3px 4px 4px rgba(0,0,0,0.15)',
            }}
          />
        </div>

        {nameError && (
          <div style={{ color: 'red', fontSize: '12px', marginBottom: '8px', paddingLeft: '48px' }}>{nameError}</div>
        )}

        {/* Emoji Picker Popover */}
        {showEmojiPicker && (
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '12px',
            padding: '12px', marginBottom: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex', flexWrap: 'wrap', gap: '8px',
          }}>
            {EMOJI_OPTIONS.map(emoji => (
              <div
                key={emoji}
                onClick={() => { setIcon(emoji); setShowEmojiPicker(false); }}
                style={{
                  fontSize: '24px', cursor: 'pointer',
                  padding: '4px', borderRadius: '8px',
                  backgroundColor: icon === emoji ? '#F0F0F0' : 'transparent',
                }}>
                {emoji}
              </div>
            ))}
          </div>
        )}

        {/* Choose Theme */}
        <div style={{ marginBottom: '24px', marginTop: '16px' }}>
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

        {/* Add Habit Button */}
        <div
          onClick={handleSave}
          style={{
            width: '100%', height: '50px',
            backgroundColor: '#7C972F', borderRadius: '30px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0px 4px 6px rgba(0,0,0,0.25)',
            marginBottom: '16px',
          }}>
          <span style={{ color: '#FFFFF0', fontSize: '18px', fontWeight: 400 }}>Add Habit</span>
        </div>

        {/* Cancel */}
        <div
          onClick={onClose}
          style={{
            textAlign: 'center', fontSize: '13px',
            color: '#000000', textDecoration: 'underline',
            cursor: 'pointer',
          }}>
          CANCEL
        </div>
      </div>
    </div>
  );
}

export default AddHabitForm;