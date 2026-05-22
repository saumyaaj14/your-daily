import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { updateEmail, updatePassword, deleteUser } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';

function ProfilePage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [modal, setModal] = useState(null);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName ? user.displayName.split(' ')[0] : 'User');
    }
  }, []);

  const showSuccess = (msg) => {
    setModalMessage(msg);
    setModal('success');
  };

  const showError = (msg) => {
    setModalMessage(msg);
    setModal('error');
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim() || !/\S+@\S+\.\S+/.test(newEmail)) {
      showError('Please enter a valid email address.');
      return;
    }
    try {
      await updateEmail(auth.currentUser, newEmail);
      setShowEmailForm(false);
      setNewEmail('');
      showSuccess('Email updated successfully.');
    } catch (e) {
      showError('Error updating email. Please try again.');
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim() || newPassword.length < 6) {
      showError('Password must be at least 6 characters.');
      return;
    }
    try {
      await updatePassword(auth.currentUser, newPassword);
      setShowPasswordForm(false);
      setNewPassword('');
      showSuccess('Password updated successfully.');
    } catch (e) {
      showError('Error updating password. Please try again.');
    }
  };

  const handleExport = async () => {
    setModal(null);
    const user = auth.currentUser;
    if (!user) return;
    try {
      const tasksSnap = await getDocs(query(collection(db, 'tasks'), where('userId', '==', user.uid)));
      const habitsSnap = await getDocs(query(collection(db, 'habits'), where('userId', '==', user.uid)));
      const tasks = tasksSnap.docs.map(d => d.data());
      const habits = habitsSnap.docs.map(d => d.data());

      let csv = 'TYPE,TITLE/NAME,PRIORITY,DUE DATE,COMPLETED\n';
      tasks.forEach(t => {
        csv += `Task,"${t.title}",${t.priority},${t.dueDate},${t.completed}\n`;
      });
      habits.forEach(h => {
        csv += `Habit,"${h.name}",,,"${(h.logs || []).join(', ')}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'your-daily-data.csv';
      a.click();
      URL.revokeObjectURL(url);
      showSuccess('Your data is downloaded successfully.');
    } catch (e) {
      showError('Error Downloading. Please try again!');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (e) {
      showError('Error logging out. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const tasksSnap = await getDocs(query(collection(db, 'tasks'), where('userId', '==', user.uid)));
      const habitsSnap = await getDocs(query(collection(db, 'habits'), where('userId', '==', user.uid)));
      for (const d of tasksSnap.docs) await deleteDoc(doc(db, 'tasks', d.id));
      for (const d of habitsSnap.docs) await deleteDoc(doc(db, 'habits', d.id));
      await deleteUser(user);
      setModal('deleteSuccess');
    } catch (e) {
      showError('Error Deleting. Please try again!');
    }
  };

  const settingRowStyle = {
    padding: '16px 0',
    borderBottom: '1px solid #D0D0D0',
    fontSize: '15px',
    fontWeight: 500,
    color: '#203418',
    cursor: 'pointer',
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#F2F2F2',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      paddingBottom: '80px',
    }}>

      {/* Teal Header */}
      <div style={{
        width: '100%',
        backgroundColor: '#71BECC',
        borderRadius: '0 0 30px 30px',
        padding: '60px 24px 30px 24px',
        marginBottom: '24px',
      }}>
        <div style={{ fontSize: '48px', fontWeight: 700, color: '#F2F2F2' }}>
          Hi {userName},
        </div>
      </div>

      {/* Settings List */}
      <div style={{ padding: '0 24px' }}>

        {/* Change Email */}
        <div>
          <div
            style={settingRowStyle}
            onClick={() => { setShowEmailForm(!showEmailForm); setShowPasswordForm(false); }}>
            Change Email
          </div>
          {showEmailForm && (
            <div style={{ display: 'flex', gap: '8px', padding: '12px 0', alignItems: 'center' }}>
              <input
                type="email"
                placeholder="Enter New Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                style={{
                  flex: 1, height: '44px',
                  border: '1px solid #D0D0D0',
                  borderRadius: '8px', padding: '0 12px',
                  fontSize: '14px', color: '#203418',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  backgroundColor: '#F2F2F2', outline: 'none',
                }}
              />
              <div
                onClick={handleChangeEmail}
                style={{
                  width: '44px', height: '44px',
                  border: '1px solid #D0D0D0', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', backgroundColor: '#F2F2F2',
                }}>
                ✓
              </div>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div>
          <div
            style={settingRowStyle}
            onClick={() => { setShowPasswordForm(!showPasswordForm); setShowEmailForm(false); }}>
            Change Password
          </div>
          {showPasswordForm && (
            <div style={{ display: 'flex', gap: '8px', padding: '12px 0', alignItems: 'center' }}>
              <input
                type="password"
                placeholder="Enter New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  flex: 1, height: '44px',
                  border: '1px solid #D0D0D0',
                  borderRadius: '8px', padding: '0 12px',
                  fontSize: '14px', color: '#203418',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  backgroundColor: '#F2F2F2', outline: 'none',
                }}
              />
              <div
                onClick={handleChangePassword}
                style={{
                  width: '44px', height: '44px',
                  border: '1px solid #D0D0D0', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', backgroundColor: '#F2F2F2',
                }}>
                ✓
              </div>
            </div>
          )}
        </div>

        {/* Export Data */}
        <div style={settingRowStyle} onClick={() => setModal('export')}>
          Export Data
        </div>

        {/* Logout */}
        <div style={settingRowStyle} onClick={() => setModal('logout')}>
          Logout
        </div>

        {/* Delete Account */}
        <div
          style={{ ...settingRowStyle, color: '#E53935', borderBottom: 'none' }}
          onClick={() => setModal('delete')}>
          Delete Account
        </div>

      </div>

      {/* MODALS */}
      {modal === 'export' && (
        <ConfirmModal
          message="Download as csv?"
          onConfirm={handleExport}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'logout' && (
        <ConfirmModal
          message="Are you sure?"
          onConfirm={handleLogout}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'delete' && (
        <ConfirmModal
          message="Delete your account and all data? This cannot be undone."
          onConfirm={handleDeleteAccount}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'success' && (
        <InfoModal message={modalMessage} onClose={() => setModal(null)} />
      )}
      {modal === 'deleteSuccess' && (
        <InfoModal
          message="Your Account was deleted successfully."
          onClose={() => navigate('/')}
        />
      )}
      {modal === 'error' && (
        <InfoModal message={modalMessage} onClose={() => setModal(null)} isError />
      )}

      <BottomNav />
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onClose }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: '50%',
      transform: 'translateX(-50%)',
      width: '100%', maxWidth: '390px',
      height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 2000, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px',
        padding: '24px', width: '80%',
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <span onClick={onClose} style={{ cursor: 'pointer', fontSize: '16px', color: '#555' }}>X</span>
        </div>
        <div style={{
          fontSize: '15px', fontWeight: 600,
          color: '#203418', textAlign: 'center', marginBottom: '20px',
        }}>
          {message}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            onClick={onConfirm}
            style={{
              backgroundColor: '#7C972F', borderRadius: '30px',
              padding: '10px 40px', cursor: 'pointer',
            }}>
            <span style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 600 }}>Yes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoModal({ message, onClose, isError }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: '50%',
      transform: 'translateX(-50%)',
      width: '100%', maxWidth: '390px',
      height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 2000, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px',
        padding: '24px', width: '80%',
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <span onClick={onClose} style={{ cursor: 'pointer', fontSize: '16px', color: '#555' }}>X</span>
        </div>
        <div style={{
          fontSize: '15px', fontWeight: 600, textAlign: 'center',
          color: isError ? '#E53935' : '#203418',
        }}>
          {message}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;