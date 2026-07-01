import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import './Dashboard.css';

function Dashboard({ user, onOpenProject, onLogout, theme }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, title: '', message: '', onConfirm: null });
  const [projectTemplate, setProjectTemplate] = useState('default'); // 'default' or 'scratch'
  const [showImportModal, setShowImportModal] = useState(false);
  const [importProjectName, setImportProjectName] = useState('');
  const [importProjectDesc, setImportProjectDesc] = useState('');
  const [importZipFile, setImportZipFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const showConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({ show: true, title, message, onConfirm });
  };

  const hideConfirmDialog = () => {
    setConfirmDialog({ show: false, title: '', message: '', onConfirm: null });
  };

  const handleConfirm = () => {
    if (confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
    hideConfirmDialog();
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/workspace/projects`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.data.success) {
        setProjects(response.data.projects);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      showNotification('Project name is required', 'error');
      return;
    }

    try {
      setCreating(true);
      const response = await axios.post(
        `${API_URL}/workspace/projects`,
        {
          name: newProjectName,
          description: newProjectDesc,
          type: 'web',
          template: projectTemplate // Send template choice
        },
        {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        }
      );

      if (response.data.success) {
        setShowCreateModal(false);
        setNewProjectName('');
        setNewProjectDesc('');
        setProjectTemplate('default');
        
        showNotification('Project created successfully!', 'success');
        
        // Open the newly created project
        onOpenProject(response.data.project);
      }
    } catch (error) {
      showNotification(`Failed to create project: ${error.response?.data?.error || error.message}`, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleImportProject = async () => {
    if (!importProjectName.trim()) {
      showNotification('Project name is required', 'error');
      return;
    }
    if (!importZipFile) {
      showNotification('Please select a ZIP file', 'error');
      return;
    }

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('name', importProjectName);
      formData.append('description', importProjectDesc);
      formData.append('zipFile', importZipFile);

      const response = await axios.post(
        `${API_URL}/workspace/projects/import-zip`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setShowImportModal(false);
        setImportProjectName('');
        setImportProjectDesc('');
        setImportZipFile(null);
        
        showNotification('Project imported successfully!', 'success');
        
        // Open the newly imported project
        onOpenProject(response.data.project);
      }
    } catch (error) {
      showNotification(`Import failed: ${error.response?.data?.error || error.message}`, 'error');
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation();
    
    showConfirmDialog(
      'Delete Project',
      'Are you sure you want to delete this project? This action cannot be undone.',
      async () => {
        try {
          await axios.delete(`${API_URL}/workspace/projects/${projectId}`, {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });

          showNotification('Project deleted successfully', 'success');
          
          // Refresh projects list
          loadProjects();
        } catch (error) {
          showNotification(`Failed to delete project: ${error.response?.data?.error || error.message}`, 'error');
        }
      }
    );
  };

  if (loading) {
    return (
      <div className={`dashboard ${theme}`}>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard ${theme}`}>
      {/* 3D Background Particles */}
      <div className="dashboard-bg-particle"></div>
      <div className="dashboard-bg-particle"></div>
      <div className="dashboard-bg-particle"></div>

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{display: 'inline-block', marginRight: '8px', verticalAlign: 'middle'}}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
            </svg>
            My Projects
          </h1>
          <p>Welcome back, {user.name}!</p>
        </div>
        <div className="header-right">
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="projects-container">
        <div className="projects-grid">
          {/* Create New Project Card */}
          <div 
            className="project-card create-new-card"
            onClick={() => setShowCreateModal(true)}
          >
            <div className="create-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3>Create New Project</h3>
            <p>Start a blank project</p>
          </div>

          {/* Import ZIP Project Card */}
          <div 
            className="project-card import-zip-card"
            onClick={() => setShowImportModal(true)}
          >
            <div className="create-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 8l-4-4-4 4M12 4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Import ZIP Project</h3>
            <p>Upload a .zip folder</p>
          </div>

          {/* Existing Projects */}
          {projects.map(project => (
            <div
              key={project._id}
              className="project-card"
              onClick={() => onOpenProject(project)}
            >
              <div className="card-header">
                <h3>{project.name}</h3>
                <button
                  className="delete-btn"
                  onClick={(e) => handleDeleteProject(project._id, e)}
                  title="Delete Project"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
              
              <p className="project-desc">
                {project.description || 'No description'}
              </p>
              
              <div className="project-meta">
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{display: 'inline-block', marginRight: '4px', verticalAlign: 'middle'}}>
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  {project.metadata?.fileCount || 0} files
                </span>
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{display: 'inline-block', marginRight: '4px', verticalAlign: 'middle'}}>
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  {new Date(project.lastModified).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="empty-state">
            <h2>No projects yet</h2>
            <p>Create your first project to get started</p>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>
            
            <div className="form-group">
              <label>Project Name *</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="my-awesome-project"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="What's this project about?"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Project Template</label>
              <div className="template-options">
                {/* Default HTML/CSS/JS */}
                <div 
                  className={`template-card ${projectTemplate === 'default' ? 'selected' : ''}`}
                  onClick={() => setProjectTemplate('default')}
                >
                  <div className="template-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M3 9h18M9 9v12" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <h4>Default Web</h4>
                  <p>HTML, CSS, and JS</p>
                </div>

                {/* React App */}
                <div 
                  className={`template-card ${projectTemplate === 'react' ? 'selected' : ''}`}
                  onClick={() => setProjectTemplate('react')}
                >
                  <div className="template-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <h4>React App</h4>
                  <p>React JSX & structure</p>
                </div>

                {/* Express API */}
                <div 
                  className={`template-card ${projectTemplate === 'express' ? 'selected' : ''}`}
                  onClick={() => setProjectTemplate('express')}
                >
                  <div className="template-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M4 14h16M4 18h16M4 10h16M4 6h16" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <h4>Express API</h4>
                  <p>Node.js & Express server</p>
                </div>

                {/* Responsive Portfolio */}
                <div 
                  className={`template-card ${projectTemplate === 'portfolio' ? 'selected' : ''}`}
                  onClick={() => setProjectTemplate('portfolio')}
                >
                  <div className="template-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <h4>Portfolio</h4>
                  <p>Responsive profile template</p>
                </div>

                {/* Todo App */}
                <div 
                  className={`template-card ${projectTemplate === 'todo' ? 'selected' : ''}`}
                  onClick={() => setProjectTemplate('todo')}
                >
                  <div className="template-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h4>Todo App</h4>
                  <p>Vanilla task tracker utility</p>
                </div>

                {/* Blank Project */}
                <div 
                  className={`template-card ${projectTemplate === 'scratch' ? 'selected' : ''}`}
                  onClick={() => setProjectTemplate('scratch')}
                >
                  <div className="template-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="1" fill="currentColor"/>
                    </svg>
                  </div>
                  <h4>Blank Project</h4>
                  <p>Start from scratch (0 files)</p>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
              >
                Cancel
              </button>
              <button
                className="create-btn"
                onClick={handleCreateProject}
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Project Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Import ZIP Project</h2>
            
            <div className="form-group">
              <label>Project Name *</label>
              <input
                type="text"
                value={importProjectName}
                onChange={(e) => setImportProjectName(e.target.value)}
                placeholder="my-imported-project"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={importProjectDesc}
                onChange={(e) => setImportProjectDesc(e.target.value)}
                placeholder="What's this project about?"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Upload ZIP File *</label>
              <div 
                style={{
                  border: '2px dashed rgba(168, 85, 247, 0.4)',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  position: 'relative',
                  marginTop: '8px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#a855f7'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)'}
              >
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setImportZipFile(e.target.files[0])}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%'
                  }}
                />
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" style={{ marginBottom: '10px', display: 'inline-block' }}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>
                  {importZipFile ? importZipFile.name : 'Click to select project .zip file'}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                  Maximum file size: 100MB
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowImportModal(false)}
                disabled={importing}
              >
                Cancel
              </button>
              <button
                className="create-btn"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)', border: 'none' }}
                onClick={handleImportProject}
                disabled={importing}
              >
                {importing ? 'Importing...' : 'Import Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="toast-content">
            {notification.type === 'success' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            )}
            {notification.type === 'error' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            )}
            {notification.type === 'info' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2"/>
              </svg>
            )}
            <span>{notification.message}</span>
          </div>
          <button 
            className="toast-close"
            onClick={() => setNotification({ show: false, message: '', type: '' })}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <div className="modal-overlay">
          <div className="confirm-dialog">
            <div className="confirm-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="2"/>
              </svg>
            </div>
            <h3>{confirmDialog.title}</h3>
            <p>{confirmDialog.message}</p>
            <div className="confirm-actions">
              <button className="cancel-btn" onClick={hideConfirmDialog}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
