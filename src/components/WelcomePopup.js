import React, { useState, useEffect } from 'react';
import './WelcomePopup.css';

const WelcomePopup = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="welcome-overlay" onClick={handleClose}></div>
      <div className="welcome-popup">
        <button className="welcome-close-button" onClick={handleClose}>✕</button>
        
        <div className="welcome-content">
          <div className="welcome-icon">🚀</div>
          <h2 className="welcome-title">Why Choose This Platform?</h2>
          <h3 className="welcome-subtitle">इस प्लेटफ़ॉर्म को क्यों चुनें?</h3>
          
          <div className="welcome-features">
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <div className="feature-text">
                <p className="feature-en">Auto Deploy to Netlify - Get your own live website instantly</p>
                <p className="feature-hi">नेटलिफाई पर ऑटो डिप्लॉय - तुरंत अपनी लाइव वेबसाइट पाएं</p>
              </div>
            </div>

            

            <div className="feature-item">
              <div className="feature-icon">🤖</div>
              <div className="feature-text">
               <p className="feature-en">Chat with AI and generate code effortlessly.</p>

<p className="feature-en">Enjoy free unlimited AI chats — no tokens, no API key required.</p>

<p className="feature-hi">AI से चैट करें और आसानी से कोड जनरेट करें।</p>

<p className="feature-hi">एकदम मुफ्त और अनलिमिटेड AI चैट — न टोकन की जरूरत, न API Key की।</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">💻</div>
              <div className="feature-text">
                <p className="feature-en">Full Code Editor - Build your projects easily</p>
                 
                <p className="feature-hi">पूर्ण कोड एडिटर - अपने प्रोजेक्ट आसानी से बनाएं</p>
              </div>
            </div>
          </div>

          <button className="welcome-action-button" onClick={handleClose}>
            Get Started / शुरू करें
          </button>
        </div>
      </div>
    </>
  );
};

export default WelcomePopup;
