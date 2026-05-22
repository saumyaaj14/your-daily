import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import illustration from '../assets/illustrations/SignUpPage-illustration.svg';

function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email address.';
    if (!password.trim()) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters long.';
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: name,
        email: email,
        createdAt: new Date(),
      });
      navigate('/dashboard');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setGlobalError('An account with this email already exists.');
      } else {
        setGlobalError('Something went wrong. Please try again.');
      }
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    height: '54px',
    backgroundColor: '#F2F2F2',
    border: `1.5px solid ${errors[field] ? 'red' : '#698C36'}`,
    borderRadius: '40px',
    padding: '0 20px',
    fontSize: '16px',
    fontWeight: 700,
    color: '#698C36',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    outline: 'none',
    boxShadow: '3px 4px 4px rgba(0,0,0,0.1)',
  });

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundColor: '#F2F2F2',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: '50px',
      paddingBottom: '40px',
      overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{ width: '90%', maxWidth: '300px' }}>
        <div style={{
          fontSize: '36px',
          fontWeight: 800,
          color: '#203418',
          lineHeight: '1.2',
        }}>
          Sign Up
        </div>
        <div style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#203418',
          marginTop: '4px',
        }}>
          Create an account to get started.
        </div>
      </div>

      {/* Illustration */}
      <img
        src={illustration}
        alt="signup illustration"
        style={{
          width: '220px',
          height: '220px',
          objectFit: 'contain',
        }}
      />

      {/* Form */}
      <div style={{
        width: '90%',
        maxWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>

        {/* Global Error */}
        {globalError && (
          <div style={{ color: 'red', fontSize: '13px', textAlign: 'center' }}>
            {globalError}
          </div>
        )}

        {/* Name */}
        <div>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors({ ...errors, name: '' }); }}
            style={inputStyle('name')}
          />
          {errors.name && <div style={{ color: 'red', fontSize: '12px', marginTop: '4px', paddingLeft: '16px' }}>{errors.name}</div>}
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: '' }); }}
            style={inputStyle('email')}
          />
          {errors.email && <div style={{ color: 'red', fontSize: '12px', marginTop: '4px', paddingLeft: '16px' }}>{errors.email}</div>}
        </div>

        {/* Password */}
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }); }}
            style={inputStyle('password')}
          />
          {errors.password && <div style={{ color: 'red', fontSize: '12px', marginTop: '4px', paddingLeft: '16px' }}>{errors.password}</div>}
        </div>

        {/* Create Account Button */}
        <div
          onClick={handleSubmit}
          style={{
            width: '100%',
            height: '50px',
            backgroundColor: '#7C972F',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0px 4px 6px rgba(0,0,0,0.25)',
            marginTop: '8px',
          }}>
          <span style={{
            color: '#FFFFF0',
            fontSize: '18px',
            fontWeight: 400,
          }}>
            Create Account
          </span>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#000000' }}>
          Already have an account?
        </div>
        <div
          onClick={() => navigate('/login')}
          style={{
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 700,
            color: '#000000',
            textDecoration: 'underline',
            cursor: 'pointer',
            marginTop: '-8px',
          }}>
          Login
        </div>

      </div>
    </div>
  );
}

export default SignUpPage;