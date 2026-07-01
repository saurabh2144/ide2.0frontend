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
      icon: 'robot', // Special flag for 3D Neural Core
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
      title: '1-Click Starter Templates',
      description: 'React App, Express Server, Portfolio, या Todo App जैसे starter templates से 1-क्लिक में कोडिंग शुरू करें।',
      highlight: '6 Pre-built Templates',
      titleEn: '1-Click Project Templates'
    },
    {
      icon: 'folder',
      title: 'Project ZIP Import & Restore',
      description: 'अपने लोकल कंप्यूटर से किसी भी प्रोजेक्ट की .zip फ़ाइल अपलोड करें, बैकएंड उसे तुरंत एक्स्ट्रैक्ट करके लोड कर देगा।',
      highlight: 'ZIP Upload & Unzip',
      titleEn: 'ZIP Upload & Auto-Extract'
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

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="lightningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#lightningGrad)" style={{ filter: 'drop-shadow(0 0 15px rgba(251, 191, 36, 0.7))' }} />
        </svg>
      ),
      rocket: (
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <defs>
            <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5L18 5.5c1.2-1.2 1-3.2-.2-4.4-1.2-1.2-3.2-1.4-4.4-.2L4.5 16.5z" fill="url(#rocketGrad)" style={{ filter: 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.6))' }} />
          <path d="M12 9l-3 3M19 5l-3 3M9 15l-3.5 3.5L2 15l3.5-3.5L9 15z" />
        </svg>
      ),
      folder: (
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <defs>
            <linearGradient id="folderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" fill="url(#folderGrad)" style={{ filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.5))' }} />
        </svg>
      ),
      palette: (
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <defs>
            <linearGradient id="paletteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.35824 19.5 5.25 20.5 6 21C7 21.6 8 22 10 22" fill="url(#paletteGrad)" style={{ filter: 'drop-shadow(0 0 15px rgba(236, 72, 153, 0.5))' }} />
          <circle cx="7.5" cy="10.5" r="1" fill="white" />
          <circle cx="11.5" cy="7.5" r="1" fill="white" />
          <circle cx="16.5" cy="9.5" r="1" fill="white" />
          <circle cx="15.5" cy="14.5" r="1" fill="white" />
        </svg>
      ),
      lock: (
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <defs>
            <linearGradient id="lockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <rect x="3" y="11" width="18" height="11" rx="2" fill="url(#lockGrad)" style={{ filter: 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.5))' }} />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      ),
      users: (
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <defs>
            <linearGradient id="usersGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" fill="url(#usersGrad)" style={{ filter: 'drop-shadow(0 0 15px rgba(249, 115, 22, 0.5))' }} />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
      zap: (
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <defs>
            <linearGradient id="zapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="url(#zapGrad)" style={{ filter: 'drop-shadow(0 0 15px rgba(6, 182, 212, 0.6))' }} />
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
    <div className={`auth-container ${theme}`} style={{
      '--mouse-x': mousePos.x,
      '--mouse-y': mousePos.y
    }}>
      {/* Giant 3D Neural Orbit Background */}
      <div className="bg-neural-container">
        <div className="bg-neural-core">
          <div className="bg-orbit-ring bg-ring-1">
            <div className="bg-orbit-node bg-node-1"></div>
            <div className="bg-orbit-node bg-node-2"></div>
          </div>
          <div className="bg-orbit-ring bg-ring-2">
            <div className="bg-orbit-node bg-node-3"></div>
            <div className="bg-orbit-node bg-node-4"></div>
          </div>
          <div className="bg-orbit-ring bg-ring-3">
            <div className="bg-orbit-node bg-node-5"></div>
          </div>
        </div>
      </div>

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

          {/* Main Feature Display with Arrows */}
          <div className="feature-carousel-wrapper">
            <button 
              type="button"
              className="carousel-arrow prev-arrow" 
              onClick={(e) => {
                e.stopPropagation();
                setCurrentFeatureIndex((prev) => (prev - 1 + features.length) % features.length);
              }}
              aria-label="Previous Feature"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="feature-display">
              {/* 3D Neural Core for AI Feature */}
              {features[currentFeatureIndex].icon === 'robot' ? (
                <div className="neural-container">
                  <div className="neural-core-3d">
                    <div className="core-glowing-sphere"></div>
                    <div className="orbit-ring ring-1">
                      <div className="orbit-node node-1"></div>
                      <div className="orbit-node node-2"></div>
                    </div>
                    <div className="orbit-ring ring-2">
                      <div className="orbit-node node-3"></div>
                      <div className="orbit-node node-4"></div>
                    </div>
                    <div className="orbit-ring ring-3">
                      <div className="orbit-node node-5"></div>
                    </div>
                  </div>
                  <div className="neural-pulse-waves">
                    <span className="wave"></span>
                    <span className="wave"></span>
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

            <button 
              type="button"
              className="carousel-arrow next-arrow" 
              onClick={(e) => {
                e.stopPropagation();
                setCurrentFeatureIndex((prev) => (prev + 1) % features.length);
              }}
              aria-label="Next Feature"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
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
        </div>
      </div>
    </div>
  );
}

export default Auth;
