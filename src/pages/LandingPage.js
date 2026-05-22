import React from 'react';
import { useNavigate } from 'react-router-dom';
import illustration from '../assets/illustrations/LandingPage-illustration.svg';

function LandingPage() {
  const navigate = useNavigate();

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
      paddingTop: '60px',
      paddingBottom: '40px',
      overflow: 'hidden',
    }}>

      {/* YOUR DAILY Title */}
      <div style={{
        width: '100%',
        paddingLeft: '38px',
        fontSize: '55px',
        fontWeight: 800,
        lineHeight: '55px',
        color: '#544D80',
      }}>
        YOUR <br /> DAILY
      </div>

      {/* Illustration */}
      <img
        src={illustration}
        alt="landing illustration"
        style={{
          width: '90%',
          maxWidth: '374px',
          flex: 1,
          objectFit: 'contain',
        }}
      />

      {/* Bottom Section */}
      <div style={{
        width: '90%',
        maxWidth: '374px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}>

        {/* Buttons Row */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '12px',
          width: '100%',
        }}>

          {/* Login Button */}
          <div
            onClick={() => navigate('/login')}
            style={{
              flex: 1,
              height: '50px',
              backgroundColor: '#7C972F',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0px 4px 6px rgba(0,0,0,0.25)'
            }}>
            <span style={{
              color: '#F2F2F2',
              fontSize: '18px',
              fontWeight: 400,
            }}>
              Login
            </span>
          </div>

          {/* Sign Up Button */}
          <div
            onClick={() => navigate('/signup')}
            style={{
              flex: 1,
              height: '50px',
              backgroundColor: 'transparent',
              borderRadius: '30px',
              border: '2px solid #7C972F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0px 4px 6px rgba(0,0,0,0.25)'
            }}>
            <span style={{
              color: '#698C36',
              fontSize: '18px',
              fontWeight: 700,
            }}>
              Sign Up
            </span>
          </div>
        </div>

        {/* Continue as Guest */}
        <div
          onClick={() => navigate('/dashboard')}
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#000000',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}>
          Continue as Guest?
        </div>

      </div>
    </div>
  );
}

export default LandingPage;