import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import './Auth.css';

function Auth({ onLoginSuccess, theme }) {
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'forgot'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const features = [
    {
      icon: 'robot', // Special flag for 3D robot
      title: 'AI Agent - आपका Coding साथी',
      description: 'Smart AI jo automatically code लिखता है, bugs fix करता है और projects बनाता है। बस बताओ क्या चाहिए!',
      highlight: 'Chat Mode & Agent Mode',
      titleEn: 'AI Agent - Your Coding Partner'
    },
    {
      icon: 'lightning',
      title: 'बिजली की Speed में Development',
      description: 'Minutes में complete web projects बनाओ। Real-time preview के साथ instant results देखो।',
      highlight: 'Instant Preview',
      titleEn: 'Lightning Fast Development'
    },
    {
      icon: 'rocket',
      title: 'एक Click में Deployment',
      description: 'Netlify या हमारे backend पर instantly deploy करो। Custom domain के साथ live जाओ!',
      highlight: 'Netlify + Backend',
      titleEn: 'One-Click Deployment'
    },
    {
      icon: 'folder',
      title: 'Smart Project Organization',
      description: 'सारे projects beautiful cards में organize रहते हैं। Auto-save और cloud backup included!',
      highlight: 'Auto-Save + Cloud Sync',
      titleEn: 'Smart Project Management'
    },
    {
      icon: 'palette',
      title: 'Professional Code Editor',
      description: 'Monaco Editor with syntax highlighting, IntelliSense, themes और powerful formatting tools।',
      highlight: 'Light & Dark Themes',
      titleEn: 'Beautiful Code Editor'
    },
    {
      icon: 'lock',
      title: 'पूरी Security & Privacy',
      description: 'आपका code encrypted और secure रहता है। Anywhere से access करो, anytime!',
      highlight: 'JWT + Encryption',
      titleEn: 'Secure & Private'
    },
    {
      icon: 'users',
      title: 'Live Collaboration Ready',
      description: 'Team के साथ real-time में code करो। Share projects और साथ मिलकर build करो!',
      highlight: 'Coming Soon',
      titleEn: 'Team Collaboration'
    },
    {
      icon: 'zap',
      title: 'Zero Configuration Setup',
      description: 'कोई installation नहीं, कोई setup नहीं। Browser खोलो और start करो coding!',
      highlight: 'Browser-Based IDE',
      titleEn: 'Zero Setup Required'
    }
  ];

  // Auto-rotate features every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [features.length]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const switchAuthMode = (mode) => {
    setIsAnimating(true);
    setTimeout(() => {
      setAuthMode(mode);
      setMessage('');
      setIsAnimating(false);
    }, 300);
  };

  const renderIcon = (iconName) => {
    const icons = {
      lightning: (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
        </svg>
      ),
      rocket: (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      folder: (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.2"/>
        </svg>
      ),
      palette: (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="12" cy="8" r="1.5" fill="currentColor"/>
          <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="14" cy="14" r="1.5" fill="currentColor"/>
        </svg>
      ),
      lock: (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
        </svg>
      ),
      users: (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      zap: (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    };
    
    return icons[iconName] || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let response;
      
      if (authMode === 'login') {
        response = await axios.post(`${API_URL}/auth/login`, {
          email: formData.email,
          password: formData.password
        });
      } else if (authMode === 'signup') {
        response = await axios.post(`${API_URL}/auth/signup`, {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
      } else if (authMode === 'forgot') {
        response = await axios.post(`${API_URL}/auth/forgot-password`, {
          email: formData.email
        });
        setMessage(`Your password is: ${response.data.password}`);
        setLoading(false);
        return;
      }

      if (response.data.success) {
        // Save user with token to localStorage
        const userData = {
          ...response.data.user,
          token: response.data.token
        };
        localStorage.setItem('user', JSON.stringify(userData));
        onLoginSuccess(userData);
      }

    } catch (error) {
      setMessage(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-container ${theme}`}>
      {/* Left Side - Login Form */}
      <div className="auth-left">
        <div className="auth-form-wrapper">
          {/* Logo */}
          <div className="auth-logo">
            <h1>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{display: 'inline-block', marginRight: '8px', verticalAlign: 'middle'}}>
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Saurabh IDE
            </h1>
            <p className="tagline">Code. Build. Deploy.</p>
          </div>

          <h2 className="auth-title">
            {authMode === 'login' ? 'Welcome Back!' : authMode === 'signup' ? 'Create Account' : 'Forgot Password?'}
          </h2>
          <p className="auth-subtitle">
            {authMode === 'login' 
              ? 'Login to access your projects' 
              : authMode === 'signup' 
              ? 'Start building amazing projects today' 
              : 'We\'ll help you recover your password'}
          </p>

          <form onSubmit={handleSubmit} className={`auth-form ${isAnimating ? 'form-animating' : ''}`}>
            {authMode === 'signup' && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            {authMode !== 'forgot' && (
              <div className="form-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="2"/>
                        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {message && (
              <div className={`message ${message.includes('success') || message.includes('password is') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Please wait...' : authMode === 'login' ? 'Login' : authMode === 'signup' ? 'Sign Up' : 'Recover Password'}
            </button>
          </form>

          <div className="auth-links">
            {authMode === 'login' && (
              <>
                <p>
                  Don't have an account?{' '}
                  <span onClick={() => switchAuthMode('signup')} className="link">
                    Sign Up
                  </span>
                </p>
                <p>
                  <span onClick={() => switchAuthMode('forgot')} className="link-secondary">
                    Forgot Password?
                  </span>
                </p>
              </>
            )}

            {authMode === 'signup' && (
              <p>
                Already have an account?{' '}
                <span onClick={() => switchAuthMode('login')} className="link">
                  Login
                </span>
              </p>
            )}

            {authMode === 'forgot' && (
              <p>
                <span onClick={() => switchAuthMode('login')} className="link">
                  Back to Login
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Features Showcase */}
      <div className="auth-right">
        <div className="features-showcase">
          {/* Background decorations */}
          <div className="bg-decoration decoration-1"></div>
          <div className="bg-decoration decoration-2"></div>
          <div className="bg-decoration decoration-3"></div>

          {/* Main Feature Display */}
          <div className="feature-display">
            {/* 3D Robot for AI Feature */}
            {features[currentFeatureIndex].icon === 'robot' ? (
              <div className="robot-container">
                <div className="robot-3d">
                  <div className="robot-head">
                    <div className="robot-antenna"></div>
                    <div className="robot-eyes">
                      <div className="eye left"></div>
                      <div className="eye right"></div>
                    </div>
                    <div className="robot-mouth"></div>
                  </div>
                  <div className="robot-body">
                    <div className="robot-panel"></div>
                    <div className="robot-lights">
                      <span className="light"></span>
                      <span className="light"></span>
                      <span className="light"></span>
                    </div>
                  </div>
                  <div className="robot-arms">
                    <div className="arm left"></div>
                    <div className="arm right"></div>
                  </div>
                </div>
                <div className="typing-code">
                  <span className="code-line">const magic = AI();</span>
                </div>
              </div>
            ) : (
              <div className="feature-icon-3d">
                {renderIcon(features[currentFeatureIndex].icon)}
              </div>
            )}
            
            <h2 className="feature-title">
              {features[currentFeatureIndex].title}
            </h2>
            
            <p className="feature-description">
              {features[currentFeatureIndex].description}
            </p>
            
            <div className="feature-highlight">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{display: 'inline-block', marginRight: '4px', verticalAlign: 'middle'}}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
              </svg>
              {features[currentFeatureIndex].highlight}
            </div>
          </div>

          {/* Feature Navigation Dots */}
          <div className="feature-dots">
            {features.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentFeatureIndex ? 'active' : ''}`}
                onClick={() => setCurrentFeatureIndex(index)}
                aria-label={`Feature ${index + 1}`}
              />
            ))}
          </div>

          {/* Stats/Trust Indicators */}
          <div className="trust-indicators">
            <div className="indicator">
              <div className="indicator-value">2000+</div>
              <div className="indicator-label">Projects Created</div>
            </div>
            <div className="indicator">
              <div className="indicator-value">1000+</div>
              <div className="indicator-label">Happy Users</div>
            </div>
            <div className="indicator">
              <div className="indicator-value">50K+</div>
              <div className="indicator-label">Lines of Code</div>
            </div>
          </div>

          {/* Powered By Badge */}
          <div className="powered-by">
            <span className="powered-text">Powered by</span>
            <span className="tech-stack">React • Monaco • AI • Netlify</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
