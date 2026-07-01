import React, { useState, useEffect } from 'react';
import './WelcomePopup.css';

const WelcomePopup = ({ onClose, onStartWithDefault, onStartFromScratch }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

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

  const handleGetStarted = () => {
    console.log('Get Started clicked - showing options');
    setShowOptions(true);
  };

  const handleDefaultCode = () => {
    console.log('Default Code selected');
    setIsVisible(false);
    onStartWithDefault?.();
  };

  const handleScratch = () => {
    console.log('Start from Scratch selected');
    setIsVisible(false);
    onStartFromScratch?.();
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="welcome-overlay" onClick={handleClose}></div>
      <div className="welcome-popup">
        <button className="welcome-close-button" onClick={handleClose}>✕</button>
        
        {!showOptions ? (
          <div className="welcome-content">
            <div className="welcome-icon">[IDE]</div>
            <h2 className="welcome-title">Why Choose This Platform?</h2>
            <h3 className="welcome-subtitle">इस प्लेटफ़ॉर्म को क्यों चुनें?</h3>
            
            <div className="welcome-features">
              <div className="feature-item">
                <div className="feature-icon">[Fast]</div>
                <div className="feature-text">
                  <p className="feature-en">Auto Deploy to Netlify - Get your own live website instantly</p>
                  <p className="feature-hi">नेटलिफाई पर ऑटो डिप्लॉय - तुरंत अपनी लाइव वेबसाइट पाएं</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">[AI]</div>
                <div className="feature-text">
                 <p className="feature-en">Chat with AI and generate code effortlessly.</p>
                 <p className="feature-en">Enjoy free unlimited AI chats — no tokens, no API key required.</p>
                 <p className="feature-hi">AI से चैट करें और आसानी से कोड जनरेट करें।</p>
                 <p className="feature-hi">एकदम मुफ्त और अनलिमिटेड AI चैट — न टोकन की जरूरत, न API Key की।</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">[Code]</div>
                <div className="feature-text">
                  <p className="feature-en">Full Code Editor - Build your projects easily</p>
                  <p className="feature-hi">पूर्ण कोड एडिटर - अपने प्रोजेक्ट आसानी से बनाएं</p>
                </div>
              </div>
            </div>

            <button className="welcome-action-button" onClick={handleGetStarted}>
              Get Started / शुरू करें
            </button>
          </div>
        ) : (
          <div className="welcome-content">
            <div className="welcome-icon">[Start]</div>
            <h2 className="welcome-title">How would you like to start?</h2>
            <h3 className="welcome-subtitle">आप कैसे शुरू करना चाहेंगे?</h3>
            
            <div className="start-options">
              <div className="option-card" onClick={handleDefaultCode}>
                <div className="option-icon">[Code]</div>
                <h4 className="option-title">Start with Default Code</h4>
                <p className="option-description-en">Begin with HTML, CSS, JS files containing a simple "Hello Coder" template</p>
                <p className="option-description-hi">HTML, CSS, JS फाइलों के साथ शुरू करें जिनमें एक सिंपल "Hello Coder" टेम्पलेट है</p>
              </div>

              <div className="option-card" onClick={handleScratch}>
                <div className="option-icon">[Empty]</div>
                <h4 className="option-title">Start from Scratch</h4>
                <p className="option-description-en">Start with an empty workspace and create your own files</p>
                <p className="option-description-hi">खाली workspace से शुरू करें और अपनी खुद की फाइलें बनाएं</p>
              </div>
            </div>

            <button className="welcome-back-button" onClick={() => setShowOptions(false)}>
              ← Back / वापस
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default WelcomePopup;
