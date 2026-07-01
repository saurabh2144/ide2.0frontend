import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import './Auth.css';

function Auth({ onLoginSuccess }) {
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
  const [localTheme, setLocalTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [heroPrompt, setHeroPrompt] = useState('');
  const [bottomPrompt, setBottomPrompt] = useState('');

  // Chatbot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { text: "Hello! I am Saurabh, your RAG-based AI companion. Ask me anything about Saurabh IDE features!", sender: "bot" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [hasChatBeenOpened, setHasChatBeenOpened] = useState(false);

  useEffect(() => {
    document.body.setAttribute('data-theme', localTheme);
  }, [localTheme]);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = localTheme === 'dark' ? 'light' : 'dark';
    setLocalTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const features = [
    {
      icon: 'robot',
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
      description: 'कोई installation नहीं, कोई setup नहीं। Browser खोलो और start karo coding!',
      highlight: 'Browser-Based IDE',
      titleEn: 'Zero Setup Required'
    }
  ];

  const templates = [
    { name: 'SaaS Portfolio', desc: 'Personal portfolio with dark obsidian style', image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&h=250&q=80' },
    { name: 'E-commerce Store', desc: 'Stripe integration with reactive cart', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&h=250&q=80' },
    { name: 'Personal Blog', desc: 'MDX based blog with dark mode presets', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=400&h=250&q=80' },
    { name: 'Express API Boilerplate', desc: 'Secure backend with JWT auth', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&h=250&q=80' },
    { name: 'Interactive Dashboard', desc: 'Recharts integration with dynamic filters', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&h=250&q=80' },
    { name: 'Task Kanban App', desc: 'Drag-and-drop task tracking system', image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&h=250&q=80' }
  ];

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 15;
      const y = (e.clientY / window.innerHeight - 0.5) * 15;
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
    }, 200);
  };

  const getBotResponse = (query) => {
    const q = query.toLowerCase();
    
    // RAG Knowledge Base for Saurabh IDE
    if (q.includes("deploy") || q.includes("host") || q.includes("publish") || q.includes("render") || q.includes("netlify")) {
      return "Saurabh IDE supports 1-click deployments! You can host your frontend assets directly to Netlify or deploy secure full-stack backend servers on Render hosting platforms.";
    }
    if (q.includes("template") || q.includes("boilerplate") || q.includes("start") || q.includes("starter")) {
      return "We offer 6 pre-built templates: React App, Express API, SaaS Portfolio, Personal MDX Blog, Interactive Dashboard, and Kanban Task App. You can spin them up in 1-click!";
    }
    if (q.includes("ai") || q.includes("agent") || q.includes("companion") || q.includes("bot") || q.includes("chat")) {
      return "Our autonomous AI Agent handles coding requests in the background. It can write complete scripts, correct compile-time errors, and assist you in real-time chat.";
    }
    if (q.includes("zip") || q.includes("import") || q.includes("upload") || q.includes("extract")) {
      return "Simply upload any local project's .zip file, and Saurabh IDE's backend will automatically unzip it and map the workspace files in under 5 seconds!";
    }
    if (q.includes("editor") || q.includes("monaco") || q.includes("write")) {
      return "We integrate Monaco Editor (the technology behind VS Code) directly in the browser, complete with auto-formatting, themes, and code suggestion tooling.";
    }
    if (q.includes("login") || q.includes("signup") || q.includes("forgot") || q.includes("account")) {
      return "Use the 'Login / Signup' button at the top header to enter your workspace. You can sign up with your email, log in, or retrieve password resets easily.";
    }
    if (q.includes("security") || q.includes("jwt") || q.includes("secure")) {
      return "Saurabh IDE guarantees workspace security! User authentication is sealed with secure JWT tokens, passwords are encrypted, and each workspace is isolated.";
    }
    
    return "I can only answer questions related to Saurabh IDE (e.g., templates, deployment platforms, AI agent actions, or workspace zip uploads). Try asking 'how to deploy?' or 'what templates are available?'";
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { text: chatInput, sender: "user" };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");

    setTimeout(() => {
      const replyText = getBotResponse(userMsg.text);
      setChatMessages((prev) => [...prev, { text: replyText, sender: "bot" }]);
    }, 400);
  };

  const renderIcon = (iconName) => {
    const icons = {
      lightning: (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#3b82f6" />
        </svg>
      ),
      rocket: (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
          <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5L18 5.5c1.2-1.2 1-3.2-.2-4.4-1.2-1.2-3.2-1.4-4.4-.2L4.5 16.5z" />
          <path d="M12 9l-3 3M19 5l-3 3M9 15l-3.5 3.5L2 15l3.5-3.5L9 15z" />
        </svg>
      ),
      folder: (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        </svg>
      ),
      palette: (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.35824 19.5 5.25 20.5 6 21C7 21.6 8 22 10 22" />
        </svg>
      ),
      lock: (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      ),
      users: (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
      zap: (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      )
    };
    return icons[iconName] || null;
  };

  const renderHexLogo = (size = 24) => {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, color: '#6366f1' }}>
        <polygon points="12 2 22 7.5 22 16.5 12 22 2 16.5 2 7.5" fill="rgba(99, 102, 241, 0.12)" />
        <path d="M7 9l-3 3 3 3M17 9l3 3-3 3M10 15l4-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
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
    <div className={`landing-page ${localTheme}`}>
      {/* Dynamic colorful mesh gradients behind Hero */}
      <div className="landing-mesh-glow"></div>

      {/* Top Header Navbar */}
      <header className="landing-header">
        <div className="landing-logo">
          {renderHexLogo(24)}
          <span>Saurabh IDE</span>
        </div>
        <nav className="landing-nav">
          <a href="#features">Features</a>
          <a href="#templates">Templates</a>
        </nav>
        <div className="landing-header-actions">
          <button type="button" className="landing-theme-toggle" onClick={handleToggleTheme} title="Toggle Theme">
            {localTheme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          <button type="button" className="btn-primary" onClick={() => { setAuthMode('login'); setShowLoginModal(true); }}>Login / Signup</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        {/* Local Orbiter behind the Hero Title */}
        <div className="hero-orbit-backdrop">
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

        <h1 className="hero-title" style={{ position: 'relative', zIndex: 2 }}>From Prompt to Product.</h1>
        <p className="hero-subtitle" style={{ fontSize: '22px', fontWeight: '500', opacity: 0.9, position: 'relative', zIndex: 2 }}>You're one click away from launching your idea.</p>
        
        {/* Prompter box */}
        <div className="hero-prompt-container" onClick={() => { setAuthMode('signup'); setShowLoginModal(true); }} style={{ position: 'relative', zIndex: 2 }}>
          <input 
            type="text" 
            placeholder="Ask Saurabh IDE to create a landing page for my..."
            value={heroPrompt}
            onChange={(e) => setHeroPrompt(e.target.value)}
          />
          <button type="button" className="prompt-submit-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      {/* "Meet Lovable" Section */}
      <section id="features" className="landing-features">
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          Meet 
          {renderHexLogo(32)}
          Saurabh IDE
        </h2>
        <div className="features-layout">
          {/* Left: Beautiful Feature Canvas Box */}
          <div className="features-visual-canvas">
            <div className="features-showcase">
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                <div className="feature-display">
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
                  
                  <h3 className="feature-title">
                    {features[currentFeatureIndex].title}
                  </h3>
                  <p className="feature-description">
                    {features[currentFeatureIndex].description}
                  </p>
                  
                  <div 
                    className="feature-highlight" 
                    onClick={() => setShowWorkflowModal(true)} 
                    style={{ cursor: 'pointer' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{display: 'inline-block', marginRight: '4px', verticalAlign: 'middle'}}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                    </svg>
                    {features[currentFeatureIndex].highlight}
                    {currentFeatureIndex === 0 && <span style={{ marginLeft: '6px', fontSize: '9px', textDecoration: 'underline' }}>• Learn Workflow</span>}
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>

              <div className="feature-dots">
                {features.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${index === currentFeatureIndex ? 'active' : ''}`}
                    onClick={() => setCurrentFeatureIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Clean List of Workflow Steps */}
          <div className="features-steps-list">
            <div className="step-item active">
              <h3>Start with an idea</h3>
              <p>Describe the app or website you want to create or drop in screenshots and docs.</p>
            </div>
            <div className="step-item">
              <h3>Watch it come to life</h3>
              <p>See your vision transform into a working prototype in real-time as AI builds it for you.</p>
            </div>
            <div className="step-item">
              <h3>Refine and ship</h3>
              <p>Iterate on your creation with simple feedback and deploy it to the world with one click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="landing-templates">
        <div className="templates-header">
          <div>
            <h2 className="section-title">Discover templates</h2>
            <p className="section-subtitle">Start your next project with a template</p>
          </div>
          <button type="button" className="btn-secondary" onClick={() => { setAuthMode('signup'); setShowLoginModal(true); }}>View all</button>
        </div>
        <div className="templates-grid">
          {templates.map((tpl, idx) => (
            <div key={idx} className="template-card" onClick={() => { setAuthMode('signup'); setShowLoginModal(true); }}>
              <div className="template-image-container">
                <img src={tpl.image} alt={tpl.name} />
              </div>
              <div className="template-info">
                <h3>{tpl.name}</h3>
                <p>{tpl.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Custom IDE Metrics Section (Replaced Lovable Stats) */}
      <section className="landing-stats">
        <h2 className="section-title text-center">Engineered for Autonomous Coding</h2>
        <p className="section-subtitle text-center">Real capabilities that empower prompt-to-production workflows</p>
        <div className="stats-grid">
          <div className="stat-card">
            <h3 className="stat-number">99.8%</h3>
            <p className="stat-desc">AI Code Accuracy</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">&lt; 5 Sec</h3>
            <p className="stat-desc">ZIP Upload & Restore</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">1-Click</h3>
            <p className="stat-desc">Netlify & Render Deploy</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">Free</h3>
            <p className="stat-desc">Agentic AI Core</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">Custom AI</h3>
            <p className="stat-desc">LLM Provider Config</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">Monaco</h3>
            <p className="stat-desc">VS Code Editor Engine</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="landing-cta">
        <span className="cta-badge">AI App Builder</span>
        <h2 className="cta-title">Ready to build?</h2>
        <div className="cta-prompt-container" onClick={() => { setAuthMode('signup'); setShowLoginModal(true); }}>
          <input 
            type="text" 
            placeholder="Ask Saurabh IDE to create a blog about..."
            value={bottomPrompt}
            onChange={(e) => setBottomPrompt(e.target.value)}
          />
          <button type="button" className="prompt-submit-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      {/* Multi-Column Footer (All plain texts, not clickable) */}
      <footer className="landing-footer">
        <div className="footer-columns">
          <div className="footer-brand-col">
            <div className="landing-logo" style={{ cursor: 'default' }}>
              {renderHexLogo(24)}
              <span>Saurabh IDE</span>
            </div>
            <p className="footer-brand-desc">The autonomous AI coding companion for developers.</p>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <span>Careers</span>
            <span>Brand Assets</span>
            <span>System Status</span>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <span>Pricing</span>
            <span>Templates</span>
            <span>AI Roadmap</span>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <span>Documentation</span>
            <span>Blog Articles</span>
            <span>Help Desk</span>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>GDPR Compliance</span>
          </div>
          <div className="footer-col">
            <h4>Community</h4>
            <span>Discord Group</span>
            <span>GitHub Repository</span>
            <span>Twitter Page</span>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Saurabh IDE. All rights reserved.</p>
        </div>
      </footer>

      {/* Fixed Giant Background Orbit covering the entire screen fixed */}
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

      {/* Floating RAG Chatbot (Saurabh) */}
      <div className={`rag-chat-container ${chatOpen ? 'chat-active' : ''}`}>
        {!chatOpen ? (
          <div className={`chat-teaser-badge ${!hasChatBeenOpened ? 'chatbot-bounce-hello' : ''}`} onClick={() => { setChatOpen(true); setHasChatBeenOpened(true); }}>
            <span className="teaser-text">Chat to know about more</span>
            <div className="chat-trigger-bubble">
              {/* Cute Robot Icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M12 2v4M12 6H8m4 0h4" />
                <circle cx="8" cy="15" r="1.2" fill="currentColor" />
                <circle cx="16" cy="15" r="1.2" fill="currentColor" />
                <path d="M9 18h6" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="chat-window">
            <div className="chat-header">
              <div className="chat-header-title">
                <span className="chat-name">Saurabh</span>
                <span className="chat-tag">RAG-based Chatbot</span>
              </div>
              <button className="chat-close-btn" onClick={() => setChatOpen(false)}>
                &times;
              </button>
            </div>
            <div className="chat-messages-box">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-bubble ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChat} className="chat-input-bar">
              <input 
                type="text" 
                placeholder="Ask about templates, deployments, agent..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        )}
      </div>

      {/* Workflow Modal Popover */}
      {showWorkflowModal && (
        <div className="workflow-modal-overlay" onClick={() => setShowWorkflowModal(false)}>
          <div className="workflow-modal-content" onClick={(e) => e.stopPropagation()}>
            <div 
              className="auth-back-link" 
              onClick={() => setShowWorkflowModal(false)} 
              style={{ 
                cursor: 'pointer', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '13px', 
                color: '#64748b', 
                marginBottom: '15px',
                fontWeight: '600',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Features
            </div>
            <button className="workflow-modal-close" onClick={() => setShowWorkflowModal(false)}>&times;</button>
            <h3 className="workflow-modal-title">Agentic AI Autonomous Workflow</h3>
            <p className="workflow-modal-subtitle">हमारा AI एजेंट बैकग्राउंड में कोडिंग कैसे करता है</p>
            
            <div className="workflow-steps">
              <div className="workflow-step">
                <div className="step-num">01</div>
                <div className="step-info">
                  <h4>Requirement Analysis</h4>
                  <p>आपके प्रॉम्प्ट को समझकर फ़ाइलों के स्ट्रक्चर और डेटाबेस डिपेंडेंसीज़ का सटीक प्लान बनाना।</p>
                </div>
              </div>
              <div className="workflow-step">
                <div className="step-num">02</div>
                <div className="step-info">
                  <h4>Autonomous Coding</h4>
                  <p>मल्टी-फ़ाइल एडिट टूल से फ़्रंटएंड और बैकएंड कोड लिखना, फ़ाइलों को बनाना और रिप्लेस करना।</p>
                </div>
              </div>
              <div className="workflow-step">
                <div className="step-num">03</div>
                <div className="step-info">
                  <h4>Self-Correction & Linting</h4>
                  <p>कंपाइलर एरर्स और लिंटिंग वार्निंग्स को खुद डिटेक्ट करके बैकग्राउंड में बिना रुके फिक्स करना।</p>
                </div>
              </div>
              <div className="workflow-step">
                <div className="step-num">04</div>
                <div className="step-info">
                  <h4>Live Deployment</h4>
                  <p>1-क्लिक में प्रोजेक्ट को नेटलिफ़ाई/रेंडर पर लाइव डिप्लॉय कर पब्लिक यूआरएल उपलब्ध कराना।</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login / Signup Modal Popup */}
      {showLoginModal && (
        <div className="login-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
            <div 
              className="auth-back-link" 
              onClick={() => setShowLoginModal(false)} 
              style={{ 
                cursor: 'pointer', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '13px', 
                color: '#64748b', 
                marginBottom: '15px',
                fontWeight: '600',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Home
            </div>
            <button className="login-modal-close" onClick={() => setShowLoginModal(false)}>&times;</button>
            <div className="auth-form-wrapper" style={{ transform: 'none', margin: 0, minHeight: 'auto' }}>
              {/* Logo */}
              <div className="auth-logo">
                <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {renderHexLogo(28)}
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

              {message && (
                <div className={`message ${message.toLowerCase().includes('error') || message.toLowerCase().includes('fail') || message.toLowerCase().includes('not found') ? 'error' : 'success'}`}>
                  {message}
                </div>
              )}

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
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Processing...' : authMode === 'login' ? 'Login' : authMode === 'signup' ? 'Sign Up' : 'Reset Password'}
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
        </div>
      )}
    </div>
  );
}

export default Auth;
