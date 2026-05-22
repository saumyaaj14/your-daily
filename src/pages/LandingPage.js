import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import illustration from '../assets/illustrations/LandingPage-illustration.svg';

function LandingPage() {
  const navigate = useNavigate();
  const [showIOSBanner, setShowIOSBanner] = useState(false);

  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone === true;
    const dismissed = sessionStorage.getItem('iosBannerDismissed');
    if (isIOS && !isStandalone && !dismissed) {
      setShowIOSBanner(true);
    }
  }, []);

  const dismissBanner = () => {
    sessionStorage.setItem('iosBannerDismissed', 'true');
    setShowIOSBanner(false);
  };

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

      </div>

      {/* iOS Install Banner */}
      {showIOSBanner && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '85%',
          backgroundColor: '#203418',
          borderRadius: '16px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>📲</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>
                Add to Home Screen
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                Tap Share → "Add to Home Screen" for the best experience
              </div>
            </div>
          </div>
          <div
            onClick={dismissBanner}
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '18px',
              cursor: 'pointer',
              flexShrink: 0,
              padding: '4px',
            }}>
            ✕
          </div>
        </div>
      )}

    </div>
  );
}

export default LandingPage;