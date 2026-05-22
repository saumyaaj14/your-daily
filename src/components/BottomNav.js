import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiCheckSquare, FiUser } from 'react-icons/fi';
import { BsListCheck } from 'react-icons/bs';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: 'Home', icon: <FiHome size={22} />, path: '/dashboard' },
    { label: 'Tasks', icon: <FiCheckSquare size={22} />, path: '/tasks' },
    { label: 'Habits', icon: <BsListCheck size={22} />, path: '/habits' },
    { label: 'Profile', icon: <FiUser size={22} />, path: '/profile' },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '390px',
      backgroundColor: '#7C972F',
      borderRadius: '20px 20px 0 0',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingTop: '12px',
      paddingBottom: '20px',
      zIndex: 1000,
    }}>
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <div
            key={tab.label}
            onClick={() => navigate(tab.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
            }}>
            {tab.icon}
            <span style={{
              fontSize: '11px',
              fontWeight: isActive ? 700 : 400,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              {tab.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default BottomNav;