// AI-Powered Code Editor with Deployment Features
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import ThemeToggle from './ThemeToggle';
import Auth from './Auth';
import Dashboard from './Dashboard';
import DeploymentPanel from './components/DeploymentPanel';
import WelcomePopup from './components/WelcomePopup';
import Terminal from './components/Terminal';
import './App.css';
import Editor from "@monaco-editor/react";
import { API_BASE_URL, API_URL } from './config';


function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [currentProject, setCurrentProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [code, setCode] = useState("");
  const [showFiles, setShowFiles] = useState(true);
  const [showAI, setShowAI] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [aiMode, setAiMode] = useState('chat'); // 'chat' or 'agent'
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingFileId, setPendingFileId] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDeploymentOptions, setShowDeploymentOptions] = useState(false);
  const [showConfirmDeploy, setShowConfirmDeploy] = useState(false);
  const [customProjectSlug, setCustomProjectSlug] = useState('');
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [terminalCommand, setTerminalCommand] = useState('');
  const [isPublished, setIsPublished] = useState(() => {
    return localStorage.getItem('isProjectPublished') === 'true';
  });
  const [savedProjectId, setSavedProjectId] = useState(() => {
    return localStorage.getItem('publishedProjectId') || null;
  });
  const [savedSiteId, setSavedSiteId] = useState(() => {
    return localStorage.getItem('publishedSiteId') || null;
  });
  const [showDeploymentPanel, setShowDeploymentPanel] = useState(false);
  const [mergedHtml, setMergedHtml] = useState('');
  const [showWelcomePopup, setShowWelcomePopup] = useState(false); // Disabled - using Dashboard now
  const [backendSites, setBackendSites] = useState([]);
  const [selectedBackendSite, setSelectedBackendSite] = useState(null);
  const [showBackendSitesList, setShowBackendSitesList] = useState(false);
  const [myDeployedSites, setMyDeployedSites] = useState(() => {
    const saved = localStorage.getItem('myDeployedSites');
    return saved ? JSON.parse(saved) : [];
  });
  const [deploymentType, setDeploymentType] = useState('netlify'); // 'netlify' or 'backend'
  const [nameValidationError, setNameValidationError] = useState('');
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [showRedeployOptions, setShowRedeployOptions] = useState(false);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, fileId: null });
  const [renamingFileId, setRenamingFileId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ show: false, title: '', message: '', onConfirm: null });
  const [pendingAgentOperations, setPendingAgentOperations] = useState(null);
  const [agentSummary, setAgentSummary] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // LLM Configurations
  const [showLLMSettings, setShowLLMSettings] = useState(false);
  const [activeLLM, setActiveLLM] = useState(() => {
    const savedConfig = localStorage.getItem('llmConfig');
    return savedConfig ? JSON.parse(savedConfig) : { provider: 'default', apiKey: '', model: '' };
  });
  const [selectedProvider, setSelectedProvider] = useState('default');
  const [llmApiKey, setLlmApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [customModelInput, setCustomModelInput] = useState('');

  const providerModels = {
    default: [
      { name: 'llama-3.3-70b-versatile (Default)', value: 'llama-3.3-70b-versatile' }
    ],
    groq: [
      { name: 'llama-3.3-70b-versatile', value: 'llama-3.3-70b-versatile' },
      { name: 'llama-3.1-8b-instant', value: 'llama-3.1-8b-instant' },
      { name: 'mixtral-8x7b-32768', value: 'mixtral-8x7b-32768' },
      { name: 'gemma2-9b-it', value: 'gemma2-9b-it' }
    ],
    openai: [
      { name: 'gpt-4o-mini', value: 'gpt-4o-mini' },
      { name: 'gpt-4o', value: 'gpt-4o' },
      { name: 'gpt-4-turbo', value: 'gpt-4-turbo' }
    ],
    gemini: [
      { name: 'gemini-1.5-flash', value: 'gemini-1.5-flash' },
      { name: 'gemini-1.5-pro', value: 'gemini-1.5-pro' },
      { name: 'gemini-2.0-flash-exp', value: 'gemini-2.0-flash-exp' }
    ],
    deepseek: [
      { name: 'deepseek-chat (DeepSeek-V3)', value: 'deepseek-chat' },
      { name: 'deepseek-reasoner (DeepSeek-R1)', value: 'deepseek-reasoner' }
    ]
  };

  const openLLMSettings = () => {
    setSelectedProvider(activeLLM.provider);
    setLlmApiKey(activeLLM.apiKey || '');
    
    const options = providerModels[activeLLM.provider] || [];
    const hasModelOpt = options.some(opt => opt.value === activeLLM.model);
    
    if (activeLLM.provider !== 'default' && !hasModelOpt && activeLLM.model) {
      setSelectedModel('custom');
      setCustomModelInput(activeLLM.model);
    } else {
      setSelectedModel(activeLLM.model || (options[0]?.value || ''));
      setCustomModelInput('');
    }
    
    setShowLLMSettings(true);
  };

  const saveLLMSettings = () => {
    const finalModel = selectedModel === 'custom' ? customModelInput : selectedModel;
    const config = {
      provider: selectedProvider,
      apiKey: selectedProvider === 'default' ? '' : llmApiKey,
      model: selectedProvider === 'default' ? '' : finalModel
    };
    
    setActiveLLM(config);
    localStorage.setItem('llmConfig', JSON.stringify(config));
    setShowLLMSettings(false);
    
    // Show notification helper
    const msgText = `🤖 LLM configured: ${selectedProvider === 'default' ? 'Default (Groq)' : `${selectedProvider} (${config.model})`}`;
    const msg = {
      type: 'system',
      text: msgText,
      mode: 'system'
    };
    setMessages(prev => [...prev, msg]);
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.text !== msgText));
    }, 4000);
  };

  const activeFile = files.find(file => file.id === activeFileId);

  const getActiveHtmlContent = () => {
    if (!activeFile) return '';
    return activeFileId === activeFile.id ? code : activeFile.content;
  };

  const getFileContent = (filename) => {
    const file = files.find(
      (f) => f.filename.toLowerCase() === filename.toLowerCase()
    );
    if (!file) return null;
    return file.id === activeFileId ? code : file.content;
  };

  // Set active file ID when files load
  useEffect(() => {
    if (files.length > 0 && activeFileId === null) {
      setActiveFileId(files[0].id);
    }
  }, [files, activeFileId]);

  // Update code when active file changes
  useEffect(() => {
    const activeFile = files.find(file => file.id === activeFileId);
    if (activeFile) {
      setCode(activeFile.content);
    } else if (files.length > 0) {
      setCode(files[0].content);
    } else {
      setCode("");
    }
  }, [files, activeFileId]);

  // Auto-save files to backend when they change
  useEffect(() => {
    if (currentProject && user?.token && files.length > 0) {
      const saveToBackend = async () => {
        try {
          // Save each file to backend
          for (const file of files) {
            const content = file.id === activeFileId ? code : file.content;
            await axios.put(
              `${API_URL}/workspace/projects/${currentProject._id}/files/${file.filename}`,
              { content },
              {
                headers: {
                  'Authorization': `Bearer ${user.token}`
                }
              }
            );
          }
          console.log('✅ Files auto-saved to backend');
        } catch (error) {
          console.error('Failed to auto-save files:', error);
        }
      };
      
      // Debounce the save (save after 3 seconds of no changes)
      const timer = setTimeout(saveToBackend, 3000);
      return () => clearTimeout(timer);
    }
  }, [files, code, activeFileId, currentProject, user]);

  // Track unsaved changes
  useEffect(() => {
    const activeFile = files.find(file => file.id === activeFileId);
    if (activeFile && code !== activeFile.content) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [code, files, activeFileId]);

  // Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentFile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, activeFileId]);

  // Handle Chat mode - just conversation, no code modification
  const handleChat = async () => {
    if (!prompt.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          type: 'error',
          text: 'Please enter a message!',
          mode: 'chat'
        }
      ]);
      return;
    }

    const userMessage = {
      type: 'user',
      text: prompt,
      mode: 'chat'
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt('');
    setLoading(true);

    const requestPayload = {
      message: currentPrompt,
      mode: 'chat',
      llmConfig: activeLLM
    };

    try {
      const response = await axios.post(
        `${API_URL}/chat`,
        requestPayload
      );

      const aiMessage = {
        type: 'ai',
        text: response.data.reply,
        mode: 'chat'
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('ERROR:', err);
      const errorMessage = {
        type: 'error',
        text: `Error: ${err.response?.data?.error || err.message}`,
        mode: 'chat'
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Handle AI Agent mode - Creates/modifies multiple files automatically
  const handleAIAgent = async () => {
    if (!prompt.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          type: 'error',
          text: 'Please enter a task for AI Agent!',
          mode: 'agent'
        }
      ]);
      return;
    }

    const userMessage = {
      type: 'user',
      text: prompt,
      mode: 'agent'
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt('');
    setLoading(true);

    // Show progress message
    const progressMessage = {
      type: 'system',
      text: 'Generating changes...',
      mode: 'agent'
    };
    setMessages((prev) => [...prev, progressMessage]);

    const requestPayload = {
      files: files,
      task: currentPrompt,
      llmConfig: activeLLM
    };

    console.log('runner request:', { filesCount: files.length, task: currentPrompt });

    try {
      const response = await axios.post(
        `${API_URL}/agent/execute`,
        requestPayload
      );

      console.log('runner response:', response.data);

      // Remove progress message
      setMessages((prev) => prev.filter(msg => msg.text !== progressMessage.text));

      if (response.data.success && response.data.operations) {
        setPendingAgentOperations(response.data.operations);
        setAgentSummary(response.data.summary || 'Suggested changes for your project.');
      } else {
        throw new Error(response.data.message || 'No operations generated');
      }
      
    } catch (err) {
      console.error('runner error:', err);
      
      // Remove progress message
      setMessages((prev) => prev.filter(msg => msg.text !== progressMessage.text));
      
      const errorMessage = {
        type: 'error',
        text: `Error: ${err.response?.data?.error || err.message}`,
        mode: 'agent'
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const applyPendingOperations = async () => {
    if (!pendingAgentOperations) return;

    let updatedFiles = [...files];
    const newFiles = [];
    const modifiedFiles = [];
    const deletedFiles = [];

    // Apply operations
    for (const op of pendingAgentOperations) {
      if (op.type === 'create') {
        const existingFileIndex = updatedFiles.findIndex(f => f.filename === op.path);
        if (existingFileIndex >= 0) {
          updatedFiles[existingFileIndex] = {
            ...updatedFiles[existingFileIndex],
            content: op.content
          };
          modifiedFiles.push(op.path);
        } else {
          const newFile = {
            id: Date.now() + Math.random(),
            filename: op.path,
            content: op.content
          };
          updatedFiles.push(newFile);
          newFiles.push(op.path);
        }
      } else if (op.type === 'update') {
        const fileIndex = updatedFiles.findIndex(f => f.filename === op.path);
        if (fileIndex >= 0) {
          updatedFiles[fileIndex] = {
            ...updatedFiles[fileIndex],
            content: op.content
          };
          modifiedFiles.push(op.path);
        }
      } else if (op.type === 'delete') {
        updatedFiles = updatedFiles.filter(f => f.filename !== op.path);
        deletedFiles.push(op.path);

        // Delete from backend if needed
        if (currentProject && user?.token) {
          try {
            await axios.delete(
              `${API_URL}/workspace/projects/${currentProject._id}/files/${op.path}`,
              {
                headers: {
                  'Authorization': `Bearer ${user.token}`
                }
              }
            );
          } catch (e) {
            console.error("Failed to delete file from backend:", op.path, e);
          }
        }
      }
    }

    setFiles(updatedFiles);

    // Show success message
    const successText = `✅ Changes applied successfully!\n\n` +
      `📊 Operations:\n` +
      (newFiles.length > 0 ? `✨ Created: ${newFiles.join(', ')}\n` : '') +
      (modifiedFiles.length > 0 ? `📝 Modified: ${modifiedFiles.join(', ')}\n` : '') +
      (deletedFiles.length > 0 ? `🗑️ Deleted: ${deletedFiles.join(', ')}\n` : '') +
      `\n💡 Total files changed: ${pendingAgentOperations.length}`;

    const aiMessage = {
      type: 'ai',
      text: successText,
      mode: 'agent'
    };
    setMessages((prev) => [...prev, aiMessage]);

    // Auto-open first new/modified file
    if (newFiles.length > 0 || modifiedFiles.length > 0) {
      const fileToOpen = updatedFiles.find(f => 
        f.filename === newFiles[0] || f.filename === modifiedFiles[0]
      );
      if (fileToOpen) {
        setActiveFileId(fileToOpen.id);
        setCode(fileToOpen.content);
      }
    }

    setPendingAgentOperations(null);
    setAgentSummary('');
  };

  const discardPendingOperations = () => {
    const cancelMessage = {
      type: 'system',
      text: 'Changes discarded.',
      mode: 'agent'
    };
    setMessages((prev) => [...prev, cancelMessage]);
    setPendingAgentOperations(null);
    setAgentSummary('');
  };

  // Main submit handler based on selected mode
  const handleSubmit = () => {
    if (aiMode === 'chat') {
      handleChat();
    } else if (aiMode === 'agent') {
      handleAIAgent();
    }
  };

  const createFile = async () => {
    if (!newFileName.trim()) return;

    const newFile = {
      id: Date.now(),
      filename: newFileName,
      content: ""
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setNewFileName("");
    setShowCreateInput(false);

    // Save to backend if project is open
    if (currentProject && user?.token) {
      try {
        await axios.put(
          `${API_URL}/workspace/projects/${currentProject._id}/files/${newFileName}`,
          { content: "" },
          {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          }
        );
        console.log('✅ File created on backend');
      } catch (error) {
        console.error('Failed to create file on backend:', error);
      }
    }
  };

  const handleFileClick = (fileId) => {
    // Check if there are unsaved changes
    if (hasUnsavedChanges && fileId !== activeFileId) {
      const confirmed = window.confirm(
        `You have unsaved changes in ${activeFile?.filename || 'current file'}. Do you want to save before switching?`
      );
      
      if (confirmed) {
        saveCurrentFile();
      }
    }

    const file = files.find(f => f.id === fileId);
    if (file) {
      setActiveFileId(fileId);
      setCode(file.content);
      setHasUnsavedChanges(false);
    }
  };

  const saveCurrentFile = () => {
    setFiles(prev =>
      prev.map(file =>
        file.id === activeFileId
          ? { ...file, content: code }
          : file
      )
    );
    setHasUnsavedChanges(false);
    // Show temporary success message
    const successMessage = {
      type: 'ai',
      text: 'File saved successfully!',
      mode: 'system'
    };
    setMessages((prev) => [...prev, successMessage]);
    setTimeout(() => {
      setMessages((prev) => prev.filter(msg => msg.text !== 'File saved successfully!'));
    }, 2000);
  };

  const deleteFile = async (fileId) => {
    const fileToDelete = files.find(f => f.id === fileId);
    
    showConfirmDialog(
      'Delete File',
      `Are you sure you want to delete "${fileToDelete?.filename}"?`,
      async () => {
        setFiles(prev => prev.filter(file => file.id !== fileId));
        
        if (activeFileId === fileId) {
          const remainingFiles = files.filter(file => file.id !== fileId);
          if (remainingFiles.length > 0) {
            setActiveFileId(remainingFiles[0].id);
          } else {
            setActiveFileId(null);
            setCode("");
          }
        }

        // Delete from backend if project is open
        if (currentProject && user?.token && fileToDelete) {
          try {
            await axios.delete(
              `${API_URL}/workspace/projects/${currentProject._id}/files/${fileToDelete.filename}`,
              {
                headers: {
                  'Authorization': `Bearer ${user.token}`
                }
              }
            );
            console.log('✅ File deleted from backend');
          } catch (error) {
            console.error('Failed to delete file from backend:', error);
          }
        }
        
        showNotification('File deleted successfully', 'success');
      }
    );
  };

  const handleFileContextMenu = (e, fileId) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      fileId: fileId
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, fileId: null });
  };

  const handleRename = (fileId) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      setRenamingFileId(fileId);
      setRenameValue(file.filename);
    }
    closeContextMenu();
  };

  const confirmRename = async (fileId) => {
    if (!renameValue.trim()) {
      showNotification('File name cannot be empty', 'error');
      return;
    }

    // Check if name already exists
    const nameExists = files.some(f => f.id !== fileId && f.filename === renameValue);
    if (nameExists) {
      showNotification('A file with this name already exists', 'error');
      return;
    }

    const oldFile = files.find(f => f.id === fileId);
    const oldFilename = oldFile?.filename;

    setFiles(prev =>
      prev.map(file =>
        file.id === fileId
          ? { ...file, filename: renameValue }
          : file
      )
    );
    
    // Rename on backend if project is open
    if (currentProject && user?.token && oldFilename) {
      try {
        await axios.post(
          `${API_URL}/workspace/projects/${currentProject._id}/files/rename`,
          { oldPath: oldFilename, newPath: renameValue },
          {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          }
        );
        console.log('✅ File renamed on backend');
      } catch (error) {
        console.error('Failed to rename file on backend:', error);
      }
    }
    
    setRenamingFileId(null);
    setRenameValue('');
    showNotification('File renamed successfully', 'success');
  };

  const cancelRename = () => {
    setRenamingFileId(null);
    setRenameValue('');
  };

  const showNotification = (message, type = 'info') => {
    const notification = {
      type: type === 'success' ? 'ai' : type === 'error' ? 'error' : 'system',
      text: message,
      mode: 'system'
    };
    setMessages(prev => [...prev, notification]);
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.text !== message));
    }, 3000);
  };

  const showConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({ show: true, title, message, onConfirm });
  };

  const hideConfirmDialog = () => {
    setConfirmDialog({ show: false, title: '', message: '', onConfirm: null });
  };

  const handleConfirmAction = () => {
    if (confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
    hideConfirmDialog();
  };

  // Close context menu on click outside
  useEffect(() => {
    if (contextMenu.show) {
      document.addEventListener('click', closeContextMenu);
      return () => document.removeEventListener('click', closeContextMenu);
    }
  }, [contextMenu.show]);

  const runHtml = () => {
    if (!activeFile) return;

    let finalHtml = getActiveHtmlContent();

    // Replace CSS files
    const cssMatches = [
      ...finalHtml.matchAll(/<link[^>]*href=["']([^"']+)["'][^>]*>/gi)
    ];

    cssMatches.forEach((match) => {
      const filePath = match[1];
      const fileName = filePath.split("/").pop();
      const cssContent = getFileContent(fileName);

      if (cssContent !== null) {
        finalHtml = finalHtml.replace(
          match[0],
          `<style>\n${cssContent}\n</style>`
        );
      }
    });

    // Replace JS files
    const jsMatches = [
      ...finalHtml.matchAll(/<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi)
    ];

    jsMatches.forEach((match) => {
      const filePath = match[1];
      const fileName = filePath.split("/").pop();
      const jsContent = getFileContent(fileName);

      if (jsContent !== null) {
        finalHtml = finalHtml.replace(
          match[0],
          `<script>\n${jsContent}\n<\/script>`
        );
      }
    });

    // Create preview
    const blob = new Blob([finalHtml], { type: "text/html" });
    const previewUrl = URL.createObjectURL(blob);
    window.open(previewUrl, "_blank", "noopener,noreferrer");

    // Memory cleanup
    setTimeout(() => {
      URL.revokeObjectURL(previewUrl);
    }, 10000);
  };

  const publishProject = async () => {
    if (!activeFile?.filename?.toLowerCase().endsWith('.html')) {
      alert('Please select an HTML file to publish');
      return;
    }

    // If already published, directly redeploy
    if (isPublished && savedProjectId && savedSiteId) {
      handleDirectDeploy();
    } else {
      // First time - show deployment options modal
      setShowDeploymentOptions(true);
    }
  };

  // Fetch backend sites list - only show user's own sites
  const fetchBackendSites = async () => {
    try {
      // Get user's deployed sites from localStorage
      const saved = localStorage.getItem('myDeployedSites');
      const userSites = saved ? JSON.parse(saved) : [];
      setBackendSites(userSites);
    } catch (error) {
      console.error('Failed to fetch backend sites:', error);
      setBackendSites([]);
    }
  };

  // Save deployed site to localStorage
  const saveDeployedSite = (siteData) => {
    const saved = localStorage.getItem('myDeployedSites');
    let sites = saved ? JSON.parse(saved) : [];
    
    // Check if site already exists (update case)
    const existingIndex = sites.findIndex(s => s.slug === siteData.slug);
    if (existingIndex >= 0) {
      sites[existingIndex] = siteData;
    } else {
      sites.push(siteData);
    }
    
    localStorage.setItem('myDeployedSites', JSON.stringify(sites));
    setMyDeployedSites(sites);
  };

  // Generate merged HTML by embedding CSS and JS
  const generateMergedHtml = (htmlContent) => {
    let finalHtml = htmlContent;

    // Replace CSS files
    const cssMatches = [
      ...finalHtml.matchAll(/<link[^>]*href=["']([^"']+)["'][^>]*>/gi)
    ];

    cssMatches.forEach((match) => {
      const filePath = match[1];
      const fileName = filePath.split("/").pop();
      const cssContent = getFileContent(fileName);

      if (cssContent !== null) {
        finalHtml = finalHtml.replace(
          match[0],
          `<style>\n${cssContent}\n</style>`
        );
      }
    });

    // Replace JS files
    const jsMatches = [
      ...finalHtml.matchAll(/<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi)
    ];

    jsMatches.forEach((match) => {
      const filePath = match[1];
      const fileName = filePath.split("/").pop();
      const jsContent = getFileContent(fileName);

      if (jsContent !== null) {
        finalHtml = finalHtml.replace(
          match[0],
          `<script>\n${jsContent}\n<\/script>`
        );
      }
    });

    return finalHtml;
  };

  const handleDirectDeploy = async () => {
    setShowDeploymentOptions(false);
    
    // If already published, directly update without asking
    if (isPublished && savedProjectId && savedSiteId) {
      setIsPublishing(true);
      
      try {
        const finalHtml = generateMergedHtml(getActiveHtmlContent());

        const payload = {
          mergedHtml: finalHtml,
          projectName: activeFile.filename.replace('.html', ''),
          customSlug: savedProjectId.toLowerCase(),
          projectId: savedProjectId,
          siteId: savedSiteId
        };

        const response = await axios.post(`${API_URL}/publish`, payload);

        if (response.data.success) {
          setPublishedUrl(response.data.url);
          setShowPublishModal(true);
          
          // Show success message
          alert('Site redeployed successfully!');
        }

      } catch (error) {
        alert(`Failed to redeploy: ${error.response?.data?.error || error.message}`);
        console.error('Redeploy error:', error);
      } finally {
        setIsPublishing(false);
      }
    } else {
      // First time publish - ask for slug
      setNameValidationError(''); // Clear any previous errors
      setShowConfirmDeploy(true);
    }
  };

  // Handle backend deployment (new or update)
  const handleBackendDeploy = async () => {
    setShowDeploymentOptions(false);
    setDeploymentType('backend');
    
    // Fetch backend sites first
    await fetchBackendSites();
    setShowBackendSitesList(true);
  };

  const confirmBackendDeploy = async (isUpdate, siteSlug = null) => {
    const slugToUse = isUpdate ? siteSlug : customProjectSlug;
    
    if (!slugToUse || !slugToUse.trim()) {
      alert('Please enter a project name');
      return;
    }

    setShowBackendSitesList(false);
    setShowConfirmDeploy(false);
    setIsPublishing(true);
    setNameValidationError(''); // Clear any previous errors
    setIsCheckingName(true); // Show checking state

    try {
      const finalHtml = generateMergedHtml(getActiveHtmlContent());

      const payload = {
        mergedHtml: finalHtml,
        projectName: activeFile.filename.replace('.html', ''),
        customSlug: slugToUse.toLowerCase(),
        projectId: isUpdate ? slugToUse : null,
        deploymentType: 'backend'
      };

      const response = await axios.post(`${API_URL}/publish`, payload);

      if (response.data.success) {
        setPublishedUrl(response.data.url);
        setShowPublishModal(true);
        
        // Save to localStorage
        saveDeployedSite({
          slug: response.data.projectId,
          url: response.data.url,
          lastModified: new Date().toISOString()
        });
        
        alert(`${isUpdate ? 'Site updated' : 'Site published'} successfully on backend!`);
      }

    } catch (error) {
      if (error.response?.data?.nameTaken) {
        // Show error in modal instead of alert
        setNameValidationError(error.response.data.error);
        setShowConfirmDeploy(true); // Keep modal open
      } else {
        alert(`Failed to deploy: ${error.response?.data?.error || error.message}`);
      }
      console.error('Deploy error:', error);
    } finally {
      setIsPublishing(false);
      setIsCheckingName(false);
    }
  };

  const confirmAndDeploy = async () => {
    if (!customProjectSlug.trim()) {
      alert('Please enter a project name/slug');
      return;
    }

    // Validate slug (only alphanumeric, hyphens, underscores)
    const slugRegex = /^[a-z0-9-_]+$/i;
    if (!slugRegex.test(customProjectSlug)) {
      alert('Project name can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    setShowConfirmDeploy(false);
    setIsPublishing(true);
    setNameValidationError(''); // Clear any previous errors
    setIsCheckingName(true); // Show checking state

    try {
      const finalHtml = generateMergedHtml(getActiveHtmlContent());

      // Send to backend with correct deployment type
      const payload = {
        mergedHtml: finalHtml,
        projectName: activeFile.filename.replace('.html', ''),
        customSlug: customProjectSlug.toLowerCase(),
        deploymentType: deploymentType // Use the state to determine type
      };

      const response = await axios.post(`${API_URL}/publish`, payload);

      if (response.data.success) {
        setPublishedUrl(response.data.url);
        setShowPublishModal(true);
        
        // Only save to persistent storage if it's Netlify
        if (deploymentType === 'netlify') {
          setIsPublished(true);
          setSavedProjectId(response.data.projectId);
          setSavedSiteId(response.data.siteId);
          
          // Save to localStorage for Netlify
          localStorage.setItem('isProjectPublished', 'true');
          localStorage.setItem('publishedProjectId', response.data.projectId);
          localStorage.setItem('publishedSiteId', response.data.siteId);
        } else if (deploymentType === 'backend') {
          // Save to backend sites list
          saveDeployedSite({
            slug: response.data.projectId,
            url: response.data.url,
            lastModified: new Date().toISOString()
          });
        }
      }

    } catch (error) {
      // Check if name already taken
      if (error.response?.data?.nameTaken) {
        // Show error in modal instead of alert
        setNameValidationError(error.response.data.error);
        setShowConfirmDeploy(true); // Keep modal open
      } else {
        alert(`Failed to publish: ${error.response?.data?.error || error.message}`);
      }
      console.error('Publish error:', error);
    } finally {
      setIsPublishing(false);
      setIsCheckingName(false);
    }
  };

  const handleGitHubDeploy = () => {
    alert('GitHub CI/CD Pipeline feature coming soon!');
    setShowDeploymentOptions(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publishedUrl);
    alert('URL copied to clipboard!');
  };

  const closePublishModal = () => {
    setShowPublishModal(false);
    setPublishedUrl(null);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('user');
      setUser(null);
      setShowDashboard(true);
      setCurrentProject(null);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
    setShowDashboard(true);
  };

  const handleOpenProject = async (project) => {
    try {
      setShowDashboard(false);
      setCurrentProject(project);
      
      // Use _id instead of id for MongoDB
      const projectId = project._id || project.id;
      
      if (!projectId) {
        alert('Invalid project ID');
        setShowDashboard(true);
        return;
      }
      
      // Load project files
      const response = await axios.get(`${API_URL}/workspace/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.data.success && response.data.project.fileTree) {
        // Convert file tree to files array
        const loadedFiles = [];
        const loadFilesRecursively = async (tree, basePath = '') => {
          for (const item of tree) {
            const fullPath = basePath ? `${basePath}/${item.name}` : item.name;
            
            if (item.type === 'file') {
              try {
                const fileResponse = await axios.get(
                  `${API_URL}/workspace/projects/${projectId}/files/${fullPath}`,
                  {
                    headers: {
                      'Authorization': `Bearer ${user.token}`
                    }
                  }
                );
                
                if (fileResponse.data.success) {
                  loadedFiles.push({
                    id: Date.now() + Math.random(),
                    filename: item.name,
                    content: fileResponse.data.file.content
                  });
                }
              } catch (error) {
                console.error(`Failed to load file ${fullPath}:`, error);
              }
            } else if (item.type === 'directory' && item.children) {
              await loadFilesRecursively(item.children, fullPath);
            }
          }
        };

        await loadFilesRecursively(response.data.project.fileTree);
        
        // Set files (even if empty array)
        setFiles(loadedFiles);
        if (loadedFiles.length > 0) {
          setActiveFileId(loadedFiles[0].id);
          setCode(loadedFiles[0].content);
        } else {
          // Completely empty project
          setActiveFileId(null);
          setCode('');
        }
      }
    } catch (error) {
      alert(`Failed to load project: ${error.response?.data?.error || error.message}`);
      setShowDashboard(true);
    }
  };

  // Handle start with default code
  const handleStartWithDefault = () => {
    console.log('📝 Creating default files...');
    
    // Default files with Hello Coder template
    const defaultFiles = [
      {
        id: 1,
        filename: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Saurabh IDE</title>
  <link rel="stylesheet" href="index.css" />
</head>
<body>
  <div class="container">
    <h1 id="title">Hello Coder</h1>
    <p class="subtitle">Welcome to your coding playground</p>
    <p class="author">by Saurabh Singh</p>
    <button id="btn">Start Coding</button>
  </div>
  <script src="index.js"></script>
</body>
</html>`
      },
      {
        id: 2,
        filename: "index.css",
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: white;
  font-family: Inter, Arial, sans-serif;
}

.container {
  text-align: center;
  padding: 40px;
}

h1 {
  font-size: 3rem;
  margin-bottom: 15px;
  background: linear-gradient(90deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.2rem;
  color: #cbd5e1;
}

.author {
  margin-top: 10px;
  color: #94a3b8;
}

button {
  margin-top: 30px;
  padding: 14px 28px;
  border: none;
  border-radius: 10px;
  background: #3b82f6;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  transform: translateY(-3px);
  background: #2563eb;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.35);
}`
      },
      {
        id: 3,
        filename: "index.js",
        content: `const btn = document.getElementById("btn");
const title = document.getElementById("title");

btn.addEventListener("click", () => {
  title.textContent = "Happy Coding";
  btn.textContent = "Let's Build";
});`
      }
    ];
    
    setFiles(defaultFiles);
    setActiveFileId(1);
    localStorage.setItem("hasSeenWelcome", "true"); // Mark as seen
    setShowWelcomePopup(false);
    
    console.log('✅ Default files created and welcome marked as seen');
  };

  // Handle start from scratch - completely empty
  const handleStartFromScratch = () => {
    console.log('📝 Starting from scratch - completely empty...');
    
    setFiles([]);
    setActiveFileId(null);
    setCode("");
    localStorage.setItem("hasSeenWelcome", "true"); // Mark as seen
    setShowWelcomePopup(false);
    
    console.log('✅ Empty workspace created (no files)');
  };



  // Auth check - show login if not logged in
  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} theme={theme} />;
  }

  // Show dashboard if no project is open
  if (showDashboard || !currentProject) {
    return (
      <Dashboard 
        user={user}
        onOpenProject={handleOpenProject}
        onLogout={handleLogout}
        theme={theme}
      />
    );
  }

  const getLanguage = (fileName) => {
    const ext = fileName?.split(".").pop()?.toLowerCase();

    switch (ext) {
      case "html":
        return "html";
      case "js":
        return "javascript";
      case "css":
        return "css";
      case "json":
        return "json";
      case "ts":
        return "typescript";
      default:
        return "plaintext";
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  // Function to switch mode
  const switchMode = (mode) => {
    setAiMode(mode);
    
    let instructionText = '';
    if (mode === 'chat') {
      instructionText = 'Switched to Chat mode - Ask me anything about coding!';
    } else if (mode === 'agent') {
      instructionText = `AI Agent mode - I can create/modify multiple files automatically! Just tell me what you want to build (e.g., "create a login form with HTML, CSS, and JS").`;
    }
    
    const modeSwitchMessage = {
      type: 'system',
      text: instructionText,
      mode: 'system'
    };
    setMessages((prev) => [...prev, modeSwitchMessage]);
    
    // Auto-remove the system message after 5 seconds
    setTimeout(() => {
      setMessages((prev) => prev.filter(msg => msg.text !== instructionText));
    }, 5000);
  };

  // Toggle AI panel function
  const toggleAIPanel = () => {
    setShowAI(prev => !prev);
  };

  // Download project as ZIP
  const downloadProjectAsZip = async () => {
    try {
      console.log('📦 Creating ZIP...');
      const zip = new JSZip();

      // Add all files to zip
      files.forEach(file => {
        zip.file(file.filename, file.content || '');
      });

      // Generate zip file
      const blob = await zip.generateAsync({ type: 'blob' });
      
      // Download
      saveAs(blob, 'project.zip');
      
      console.log('✅ ZIP downloaded');
      
      // Show success message
      const successMsg = {
        type: 'system',
        text: `✅ Project downloaded! (${files.length} files)`,
        mode: 'system'
      };
      setMessages(prev => [...prev, successMsg]);
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg !== successMsg));
      }, 3000);

    } catch (error) {
      console.error('ZIP error:', error);
      alert('Failed to create ZIP: ' + error.message);
    }
  };

  // Upload folder/files
  const uploadFolder = async (event) => {
    try {
      const fileList = event.target.files;
      if (!fileList || fileList.length === 0) return;

      console.log(`📁 Uploading ${fileList.length} files...`);

      const uploadedFiles = [];
      let skippedCount = 0;
      
      // Folders/files to skip
      const skipPatterns = [
        'node_modules',
        'build',
        'dist',
        '.git',
        '.next',
        'coverage',
        '.cache',
        'vendor',
        '__pycache__'
      ];

      // Read all files
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        
        // Get relative path
        let filename = file.webkitRelativePath || file.name;
        
        // Check if file should be skipped
        const shouldSkip = skipPatterns.some(pattern => 
          filename.includes(`/${pattern}/`) || 
          filename.startsWith(`${pattern}/`) ||
          filename.includes(`\\${pattern}\\`) ||
          filename.startsWith(`${pattern}\\`)
        );

        if (shouldSkip) {
          skippedCount++;
          continue; // Skip this file
        }

        const content = await file.text();
        
        // Remove folder name prefix if present
        const parts = filename.split(/[\/\\]/);
        if (parts.length > 1) {
          parts.shift(); // Remove first folder name
          filename = parts.join('/');
        }

        uploadedFiles.push({
          id: Date.now() + i,
          filename: filename,
          content: content
        });
      }

      console.log(`✅ Loaded ${uploadedFiles.length} files`);
      if (skippedCount > 0) {
        console.log(`⏭️  Skipped ${skippedCount} files (node_modules, build, etc.)`);
      }

      // Replace current files
      setFiles(uploadedFiles);

      // Open first file
      if (uploadedFiles.length > 0) {
        setActiveFileId(uploadedFiles[0].id);
        setCode(uploadedFiles[0].content);
      }

      // Success message
      const successMsg = {
        type: 'system',
        text: `✅ Uploaded ${uploadedFiles.length} files successfully!${skippedCount > 0 ? `\n⏭️ Skipped ${skippedCount} files (node_modules, build, etc.)` : ''}`,
        mode: 'system'
      };
      setMessages(prev => [...prev, successMsg]);
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg !== successMsg));
      }, 5000);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files: ' + error.message);
    }
  };

  // Terminal command execution
  const executeTerminalCommand = (cmd) => {
    console.log('🖥️  Terminal command:', cmd);
    
    // Add command to output
    setTerminalOutput(prev => [...prev, { type: 'command', text: `$ ${cmd}` }]);

    // Simulate command execution
    setTimeout(() => {
      let output = '';
      
      if (cmd.startsWith('npm') || cmd.startsWith('yarn')) {
        output = `Running ${cmd}...\nNote: Terminal is in simulation mode. To run real commands, use your system terminal.`;
      } else if (cmd.startsWith('node')) {
        output = `Executing ${cmd}...\nNote: Terminal is in simulation mode.`;
      } else if (cmd === 'ls' || cmd === 'dir') {
        output = files.map(f => f.filename).join('\n');
      } else if (cmd === 'clear' || cmd === 'cls') {
        setTerminalOutput([]);
        return;
      } else if (cmd === 'help') {
        output = `Available commands:
  ls/dir  - List files
  clear   - Clear terminal
  help    - Show this help
  
Note: This is a simulated terminal. For actual execution, use your system terminal.`;
      } else {
        output = `Command: ${cmd}\nNote: Terminal is in simulation mode.`;
      }

      setTerminalOutput(prev => [...prev, { type: 'output', text: output }]);
    }, 100);

    setTerminalCommand('');
  };

  return (
    <div className="app-container" style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      width: '100vw'
    }}>
      {/* FILE EXPLORER */}
      {showFiles && (
        <>
          {/* Mobile backdrop */}
          <div 
            className="sidebar-backdrop"
            onClick={() => setShowFiles(false)}
            style={{
              display: 'none',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 998
            }}
          />
          
          <div className="file-sidebar" style={{
            width: '250px',
            minWidth: '250px',
            maxWidth: '250px',
            borderRight: `1px solid ${theme === 'light' ? '#e0e0e0' : '#333'}`,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme === 'light' ? '#f5f5f5' : '#252525',
            flexShrink: 0
          }}>
            <div className="panel-header" style={{
              padding: '12px 10px',
              borderBottom: `1px solid ${theme === 'light' ? '#e0e0e0' : '#333'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: theme === 'light' ? '#f5f5f5' : '#252525'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '11px', 
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.5px',
                color: theme === 'light' ? '#666' : '#999'
              }}>
                Explorer
              </h3>
              <button
                className="mobile-close-btn"
                onClick={() => setShowFiles(false)}
                style={{
                  display: 'none',
                  padding: '4px 8px',
                  fontSize: '14px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

          <div className="file-tree" style={{ padding: '0', flex: 1, overflowY: 'auto' }}>
            {/* Upload Folder - only show when no files */}
            {files.length === 0 && (
              <div style={{ padding: '10px' }}>
                <input
                  type="file"
                  id="folder-upload"
                  webkitdirectory="true"
                  directory="true"
                  multiple
                  style={{ display: 'none' }}
                  onChange={uploadFolder}
                />
                <label
                  htmlFor="folder-upload"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px',
                    fontSize: '12px',
                    backgroundColor: theme === 'light' ? '#e3f2fd' : '#1e3a5f',
                    color: theme === 'light' ? '#1976d2' : '#64b5f6',
                    border: `1px dashed ${theme === 'light' ? '#1976d2' : '#64b5f6'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: 500
                  }}
                  title="Upload entire project folder"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'light' ? '#bbdefb' : '#2c5282';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'light' ? '#e3f2fd' : '#1e3a5f';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 11v6M9 14l3-3 3 3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Upload Folder
                </label>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: 600,
                color: theme === 'light' ? '#333' : '#ddd'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.7 }}>
                  <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {currentProject?.name || 'Project'}
              </div>
              <button
                onClick={() => setShowCreateInput(true)}
                className="add-file-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  color: theme === 'light' ? '#666' : '#aaa',
                  opacity: 0.7,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.backgroundColor = theme === 'light' ? '#e0e0e0' : '#3a3a3a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="New File"
              >
                +
              </button>
            </div>

            {showCreateInput && (
              <input
                type="text"
                placeholder="File name..."
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    createFile();
                  }
                }}
                onBlur={() => {
                  if (!newFileName.trim()) {
                    setShowCreateInput(false);
                  }
                }}
                autoFocus
                style={{
                  width: '100%',
                  padding: '6px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  border: `1px solid ${theme === 'light' ? '#ccc' : '#555'}`,
                  backgroundColor: theme === 'light' ? 'white' : '#1e1e1e',
                  color: theme === 'light' ? '#333' : '#ddd'
                }}
              />
            )}

            <div style={{ paddingLeft: '18px' }}>
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`file-item ${activeFileId === file.id ? 'active' : ''}`}
                  onContextMenu={(e) => handleFileContextMenu(e, file.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '6px 5px',
                    backgroundColor: activeFileId === file.id ? (theme === 'light' ? '#e0e0e0' : '#404040') : 'transparent',
                    borderRadius: '4px',
                    marginBottom: '2px'
                  }}
                >
                  {renamingFileId === file.id ? (
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          confirmRename(file.id);
                        } else if (e.key === 'Escape') {
                          cancelRename();
                        }
                      }}
                      onBlur={() => confirmRename(file.id)}
                      autoFocus
                      style={{
                        flex: 1,
                        padding: '3px 6px',
                        fontSize: '13px',
                        border: '1px solid #3b82f6',
                        borderRadius: '3px',
                        backgroundColor: theme === 'light' ? 'white' : '#1e1e1e',
                        color: theme === 'light' ? '#333' : '#ddd',
                        outline: 'none'
                      }}
                    />
                  ) : (
                    <>
                      <span 
                        onClick={() => handleFileClick(file.id)}
                        style={{ 
                          flex: 1, 
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {/* File icon */}
                        <svg className="file-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" stroke="currentColor" strokeWidth="2"/>
                          <path d="M13 2v7h7" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        {file.filename}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileContextMenu(e, file.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: theme === 'light' ? '#666' : '#999',
                          fontSize: '14px',
                          padding: '0 6px',
                          opacity: 0.6,
                          display: 'none'
                        }}
                        className="file-more-btn"
                        title="More actions"
                      >
                        ⋯
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        </>
      )}

      {/* CODE EDITOR */}
      <div className="editor-panel" style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme === 'light' ? '#fff' : '#1e1e1e',
        overflow: 'hidden'
      }}>
        <div className="panel-header" style={{
          padding: '10px',
          borderBottom: `1px solid ${theme === 'light' ? '#e0e0e0' : '#333'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: theme === 'light' ? '#f9f9f9' : '#252525'
        }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <button
              className="toggle-btn"
              onClick={() => setShowFiles(!showFiles)}
              style={{
                padding: '6px 12px',
                cursor: 'pointer',
                borderRadius: '4px',
                border: `1px solid ${theme === 'light' ? '#ccc' : '#555'}`,
                backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
                color: theme === 'light' ? '#333' : '#fff',
                fontSize: '16px'
              }}
            >
              ☰
            </button>

            <button
              className="toggle-btn"
              onClick={() => {
                setShowDashboard(true);
                setCurrentProject(null);
              }}
              style={{
                padding: '6px 12px',
                cursor: 'pointer',
                borderRadius: '4px',
                border: `1px solid ${theme === 'light' ? '#ccc' : '#555'}`,
                backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
                color: theme === 'light' ? '#333' : '#fff',
                fontSize: '16px'
              }}
              title="Back to Dashboard"
            >
              ← Dashboard
            </button>

            <button
              className="toggle-btn"
              onClick={toggleAIPanel}
              style={{
                padding: '6px 12px',
                cursor: 'pointer',
                borderRadius: '4px',
                border: `1px solid ${theme === 'light' ? '#ccc' : '#555'}`,
                backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
                color: theme === 'light' ? '#333' : '#fff',
                fontSize: '16px'
              }}
              title={showAI ? "Close AI Panel" : "Open AI Panel"}
            >
              AI
            </button>

            {!showDeploymentPanel && (
              <>
                {/* Publish button */}
                <button
                  className="toggle-btn"
                  onClick={() => {
                    setShowDeploymentOptions(true);
                  }}
                  style={{
                    padding: '6px 12px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    border: `1px solid ${theme === 'light' ? '#2196F3' : '#42a5f5'}`,
                    backgroundColor: theme === 'light' ? '#e3f2fd' : '#1565c0',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Publish your project"
                >
                  Publish
                </button>

                {/* Redeploy button - only show if user has deployed sites */}
                {(myDeployedSites.length > 0 || isPublished) && (
                  <button
                    className="toggle-btn"
                    onClick={() => {
                      setShowRedeployOptions(true);
                    }}
                    style={{
                      padding: '4px 8px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      border: `1px solid ${theme === 'light' ? '#d97706' : '#f59e0b'}`,
                      backgroundColor: theme === 'light' ? '#fef3c7' : '#78350f',
                      color: theme === 'light' ? '#92400e' : '#fbbf24',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Redeploy to existing site"
                  >
                    Redeploy
                  </button>
                )}
              </>
            )}

            <h3 style={{ margin: 0, fontSize: '16px' }}>
              {currentProject ? `📁 ${currentProject.name}` : 'Code Editor'}
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={saveCurrentFile}
              style={{
                padding: '6px 12px',
                backgroundColor: hasUnsavedChanges ? '#FF9800' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: hasUnsavedChanges ? 'bold' : 'normal'
              }}
              title={hasUnsavedChanges ? 'Unsaved changes - Click to save or press Ctrl+S' : 'File saved'}
            >
              {hasUnsavedChanges ? 'Save*' : 'Save'}
            </button>
            <button
              onClick={runHtml}
              style={{
                padding: '6px 12px',
                backgroundColor: activeFile?.filename?.toLowerCase().endsWith(".html") ? '#2196F3' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: activeFile?.filename?.toLowerCase().endsWith(".html") ? 'pointer' : 'not-allowed',
                fontSize: '13px'
              }}
              disabled={!activeFile?.filename?.toLowerCase().endsWith(".html")}
            >
              Run
            </button>
            <button
              onClick={() => setShowTerminal(prev => !prev)}
              style={{
                padding: '6px 12px',
                backgroundColor: showTerminal ? '#4CAF50' : '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
              title="Toggle Terminal"
            >
              {showTerminal ? '🖥️ Hide Terminal' : '🖥️ Show Terminal'}
            </button>
            
            <button
              onClick={downloadProjectAsZip}
              style={{
                padding: '6px 12px',
                backgroundColor: '#9C27B0',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Download project as ZIP"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              ZIP
            </button>
         
            <ThemeToggle onThemeChange={setTheme} />
          </div>
        </div>

        {/* Editor and Terminal Split View */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Editor */}
          <div style={{ 
            flex: showTerminal ? '1 1 60%' : '1 1 100%',
            minHeight: showTerminal ? '300px' : '100%',
            overflow: 'hidden'
          }}>
            <Editor
              height="100%"
              language={getLanguage(activeFile?.filename)}
              theme={theme === "light" ? "vs-light" : "vs-dark"}
              value={code}
              onChange={(value) => {
                setCode(value || "");
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on'
              }}
            />
          </div>

          {/* Terminal */}
          {showTerminal && (
            <div style={{
              flex: '1 1 40%',
              minHeight: '200px',
              borderTop: `2px solid ${theme === 'light' ? '#e0e0e0' : '#333'}`,
              overflow: 'hidden'
            }}>
              <Terminal theme={theme} files={files} />
            </div>
          )}
        </div>
      </div>

      {/* AI PANEL - Fixed toggle functionality */}
      {showAI && (
        <div className="chat-panel" style={{
          width: '350px',
          minWidth: '350px',
          maxWidth: '350px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme === 'light' ? '#f9f9f9' : '#1e1e1e',
          borderLeft: `1px solid ${theme === 'light' ? '#e0e0e0' : '#333'}`,
          flexShrink: 0
        }}>
          <div className="panel-header" style={{
            padding: '12px',
            borderBottom: `1px solid ${theme === 'light' ? '#e0e0e0' : '#333'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: theme === 'light' ? '#fff' : '#252525'
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>AI Assistant</span>
              <span style={{
                fontSize: '9px',
                fontWeight: '600',
                padding: '2px 5px',
                borderRadius: '6px',
                backgroundColor: activeLLM.provider === 'default' ? (theme === 'light' ? '#e6fffa' : '#0d2d2a') : (theme === 'light' ? '#ebf8ff' : '#0f2b46'),
                color: activeLLM.provider === 'default' ? (theme === 'light' ? '#319795' : '#4fd1c5') : (theme === 'light' ? '#3182ce' : '#63b3ed'),
                border: `1px solid ${activeLLM.provider === 'default' ? (theme === 'light' ? '#b2f5ea' : '#1d4ed8') : (theme === 'light' ? '#bee3f8' : '#1e3a8a')}`
              }}>
                {activeLLM.provider === 'default' ? 'Groq Free' : activeLLM.provider.toUpperCase()}
              </span>
            </h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={openLLMSettings}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  color: theme === 'light' ? '#666' : '#aaa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'light' ? '#f0f0f0' : '#333'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Configure LLM Providers"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
              <button
                onClick={clearMessages}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  color: theme === 'light' ? '#666' : '#aaa'
                }}
                title="Clear chat"
              >
                Clear
              </button>
              <button
                onClick={toggleAIPanel}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: theme === 'light' ? '#666' : '#aaa',
                  padding: '0 4px'
                }}
                title="Close AI Panel"
              >
                x
              </button>
            </div>
          </div>

          {/* Mode Selector Toggle */}
          <div style={{
            display: 'flex',
            padding: '12px',
            gap: '12px',
            borderBottom: `1px solid ${theme === 'light' ? '#e0e0e0' : '#333'}`,
            backgroundColor: theme === 'light' ? '#fff' : '#252525'
          }}>
            <button
              onClick={() => switchMode('chat')}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: aiMode === 'chat' 
                  ? (theme === 'light' ? '#2196F3' : '#1976D2')
                  : (theme === 'light' ? '#f0f0f0' : '#333'),
                color: aiMode === 'chat' 
                  ? 'white'
                  : (theme === 'light' ? '#666' : '#aaa'),
                border: `1px solid ${aiMode === 'chat' 
                  ? (theme === 'light' ? '#2196F3' : '#1976D2')
                  : (theme === 'light' ? '#ddd' : '#444')}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>Chat Mode</span>
            </button>
            <button
              onClick={() => switchMode('agent')}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: aiMode === 'agent' 
                  ? (theme === 'light' ? '#FF9800' : '#F57C00')
                  : (theme === 'light' ? '#f0f0f0' : '#333'),
                color: aiMode === 'agent' 
                  ? 'white'
                  : (theme === 'light' ? '#666' : '#aaa'),
                border: `1px solid ${aiMode === 'agent' 
                  ? (theme === 'light' ? '#FF9800' : '#F57C00')
                  : (theme === 'light' ? '#ddd' : '#444')}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>🤖 AI Agent</span>
            </button>
          </div>

          <div className="chat-messages" style={{
            flex: 1,
            overflowY: 'auto',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.length === 0 ? (
              <div className="empty-chat" style={{
                textAlign: 'center',
                color: theme === 'light' ? '#666' : '#aaa',
                padding: '30px 20px'
              }}>
                <p style={{ margin: '5px 0' }}>Hi! I'm Saurabh, your AI code assistant.</p>
                <p style={{ margin: '5px 0' }}>Select a mode and start interacting!</p>
                <hr style={{ margin: '15px 0', borderColor: theme === 'light' ? '#e0e0e0' : '#444' }} />
                <p style={{ margin: '5px 0', fontSize: '12px' }}>
                  <strong>Chat Mode:</strong> Ask me anything about coding concepts!
                </p>
                <p style={{ margin: '5px 0', fontSize: '12px' }}>
                  <strong>Generate Mode:</strong> Open a file first, then tell me what to change!
                </p>
                <p style={{ margin: '5px 0', fontSize: '12px' }}>
                  <strong>🤖 AI Agent Mode:</strong> Create/modify multiple files automatically! Just describe what you want to build.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`message ${msg.type}`}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: msg.type === 'user' 
                      ? (theme === 'light' ? '#e3f2fd' : '#1e3a5f')
                      : msg.type === 'ai' 
                        ? (theme === 'light' ? '#f3e5f5' : '#4a148c')
                        : msg.type === 'system'
                          ? (theme === 'light' ? '#fff3e0' : '#4a2e1a')
                          : (theme === 'light' ? '#ffebee' : '#5c1a1a'),
                    alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    boxShadow: theme === 'light' ? '0 1px 2px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  <div className="message-label" style={{
                    fontWeight: 'bold',
                    fontSize: '10px',
                    marginBottom: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: msg.type === 'system' ? (theme === 'light' ? '#e65100' : '#ffb74d') : 'inherit'
                  }}>
                    <span>
                      {msg.type === 'user' ? 'You' : msg.type === 'ai' ? 'Saurabh' : msg.type === 'system' ? 'System' : 'Error'}
                    </span>
                    {msg.mode && msg.mode !== 'system' && (
                      <span style={{
                        fontSize: '9px',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        backgroundColor: msg.mode === 'chat' ? '#2196F3' : '#4CAF50',
                        color: 'white',
                        marginLeft: '8px'
                      }}>
                        {msg.mode === 'chat' ? 'Chat' : 'Generate'}
                      </span>
                    )}
                  </div>
                  <div className="message-text" style={{
                    fontSize: '12px',
                    lineHeight: '1.5',
                    wordWrap: 'break-word',
                    color: theme === 'light' ? '#333' : '#eee'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="message ai" style={{
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: theme === 'light' ? '#f3e5f5' : '#4a148c',
                alignSelf: 'flex-start',
                maxWidth: '85%'
              }}>
                <div className="message-label" style={{
                  fontWeight: 'bold',
                  fontSize: '10px',
                  marginBottom: '5px'
                }}>
                  Saurabh ({aiMode === 'chat' ? 'Chat Mode' : 'AI Agent Mode'})
                </div>
                <div className="message-text loading" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px'
                }}>
                  <span>Thinking</span>
                  <span>...</span>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input-section" style={{
            padding: '15px',
            borderTop: `1px solid ${theme === 'light' ? '#e0e0e0' : '#333'}`,
            display: 'flex',
            gap: '10px',
            backgroundColor: theme === 'light' ? '#fff' : '#252525'
          }}>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={aiMode === 'chat' 
                ? "Ask me anything about coding..." 
                : "Describe what code you want me to generate..."}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading && prompt.trim()) {
                  handleSubmit();
                }
              }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${theme === 'light' ? '#ddd' : '#444'}`,
                fontSize: '12px',
                backgroundColor: theme === 'light' ? 'white' : '#1e1e1e',
                color: theme === 'light' ? '#333' : '#ddd',
                outline: 'none'
              }}
            />
            <button 
              onClick={handleSubmit} 
              disabled={loading || !prompt.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: loading || !prompt.trim() 
                  ? '#ccc' 
                  : aiMode === 'chat' 
                    ? '#2196F3' 
                    : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Loading...' : aiMode === 'chat' ? 'Send' : 'Generate'}
            </button>
          </div>
        </div>
      )}
      
      {/* Deployment Options Modal */}
      {showDeploymentOptions && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          overflowY: 'auto',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            maxHeight: '90vh',
            overflowY: 'auto',
            margin: 'auto'
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              color: theme === 'light' ? '#333' : '#fff',
              fontSize: '24px',
              textAlign: 'center'
            }}>
              Choose Deployment Method
            </h2>

            {/* Backend Server Deploy Option */}
            <div 
              onClick={handleBackendDeploy}
              style={{
                backgroundColor: theme === 'light' ? '#f8f9fa' : '#1e1e1e',
                border: `2px solid ${theme === 'light' ? '#e0e0e0' : '#444'}`,
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4CAF50';
                e.currentTarget.style.backgroundColor = theme === 'light' ? '#f0fff4' : '#1a2f1a';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme === 'light' ? '#e0e0e0' : '#444';
                e.currentTarget.style.backgroundColor = theme === 'light' ? '#f8f9fa' : '#1e1e1e';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: '#4CAF50',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                READY ✓
              </div>
              <h3 style={{
                margin: '0 0 10px 0',
                color: '#4CAF50',
                fontSize: '18px'
              }}>
                Deploy to Backend Server
              </h3>
              <p style={{
                margin: '0',
                color: theme === 'light' ? '#666' : '#aaa',
                fontSize: '13px',
                lineHeight: '1.6'
              }}>
                <strong>Features:</strong><br/>
                • Create multiple sites with custom slugs<br/>
                • Update existing sites anytime<br/>
                • Fast server-side rendering<br/>
                • No external dependencies<br/>
                • Full control over your deployments
              </p>
            </div>

            {/* Netlify Deploy Option */}
            <div 
              onClick={() => {
                setDeploymentType('netlify');
                handleDirectDeploy();
              }}
              style={{
                backgroundColor: theme === 'light' ? '#f8f9fa' : '#1e1e1e',
                border: `2px solid #667eea`,
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.backgroundColor = theme === 'light' ? '#f0f4ff' : '#1a2f5a';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.backgroundColor = theme === 'light' ? '#f8f9fa' : '#1e1e1e';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: '#667eea',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                READY ✓
              </div>
              <h3 style={{
                margin: '0 0 10px 0',
                color: '#667eea',
                fontSize: '18px'
              }}>
                Deploy to Netlify
              </h3>
              <p style={{
                margin: '0',
                color: theme === 'light' ? '#666' : '#aaa',
                fontSize: '13px',
                lineHeight: '1.6'
              }}>
                <strong>Features:</strong><br/>
                • One-time publish with custom domain<br/>
                • Global CDN distribution<br/>
                • Automatic HTTPS/SSL<br/>
                • Fast deployment (updates in seconds)<br/>
                • Professional hosting
              </p>
            </div>

            <button
              onClick={() => setShowDeploymentOptions(false)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: theme === 'light' ? '#f0f0f0' : '#444',
                color: theme === 'light' ? '#333' : '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Redeploy Options Modal */}
      {showRedeployOptions && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              color: theme === 'light' ? '#333' : '#fff',
              fontSize: '22px',
              textAlign: 'center'
            }}>
              Redeploy Options
            </h2>
            
            <p style={{
              margin: '0 0 25px 0',
              color: theme === 'light' ? '#666' : '#aaa',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              Choose where you want to redeploy:
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              {/* Show message if nothing is deployed */}
              {myDeployedSites.length === 0 && !isPublished && (
                <p style={{
                  textAlign: 'center',
                  color: theme === 'light' ? '#999' : '#666',
                  fontSize: '14px',
                  padding: '20px'
                }}>
                  No deployed sites found. Please publish a site first.
                </p>
              )}

              {/* Backend Redeploy Option */}
              {myDeployedSites.length > 0 && (
                <div
                  onClick={async () => {
                    setShowRedeployOptions(false);
                    await fetchBackendSites();
                    setShowBackendSitesList(true);
                  }}
                  style={{
                    backgroundColor: theme === 'light' ? '#f0fff4' : '#1a2f1a',
                    border: '2px solid #4CAF50',
                    borderRadius: '10px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    fontSize: '36px',
                    marginBottom: '10px'
                  }}>
                    [Server]
                  </div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    color: '#4CAF50',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
                    Redeploy on Backend Server
                  </h3>
                  <p style={{
                    margin: 0,
                    color: theme === 'light' ? '#666' : '#aaa',
                    fontSize: '13px'
                  }}>
                    Update your existing backend sites
                  </p>
                  <p style={{
                    margin: '8px 0 0 0',
                    color: theme === 'light' ? '#999' : '#666',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {myDeployedSites.length} site{myDeployedSites.length !== 1 ? 's' : ''} available
                  </p>
                </div>
              )}

              {/* Netlify Redeploy Option */}
              {isPublished && savedSiteId && (
                <div
                  onClick={async () => {
                    setShowRedeployOptions(false);
                    setIsPublishing(true);
                    
                    try {
                      const finalHtml = generateMergedHtml(getActiveHtmlContent());

                      const payload = {
                        mergedHtml: finalHtml,
                        projectName: activeFile.filename.replace('.html', ''),
                        customSlug: savedProjectId.toLowerCase(),
                        projectId: savedProjectId,
                        siteId: savedSiteId,
                        deploymentType: 'netlify'
                      };

                      const response = await axios.post(`${API_URL}/publish`, payload);

                      if (response.data.success) {
                        setPublishedUrl(response.data.url);
                        setShowPublishModal(true);
                        alert('Site redeployed successfully on Netlify!');
                      }
                    } catch (error) {
                      alert(`Failed to redeploy: ${error.response?.data?.error || error.message}`);
                      console.error('Redeploy error:', error);
                    } finally {
                      setIsPublishing(false);
                    }
                  }}
                  style={{
                    backgroundColor: theme === 'light' ? '#e3f2fd' : '#1a2a3a',
                    border: '2px solid #2196F3',
                    borderRadius: '10px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    fontSize: '36px',
                    marginBottom: '10px'
                  }}>
                    [Cloud]
                  </div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    color: '#2196F3',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
                    Redeploy on Netlify
                  </h3>
                  <p style={{
                    margin: 0,
                    color: theme === 'light' ? '#666' : '#aaa',
                    fontSize: '13px'
                  }}>
                    Update your Netlify site
                  </p>
                  <p style={{
                    margin: '8px 0 0 0',
                    color: theme === 'light' ? '#999' : '#666',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    Site: {savedProjectId}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowRedeployOptions(false)}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '20px',
                backgroundColor: theme === 'light' ? '#f0f0f0' : '#444',
                color: theme === 'light' ? '#333' : '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Backend Sites List Modal */}
      {showBackendSitesList && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              color: theme === 'light' ? '#333' : '#fff',
              fontSize: '22px'
            }}>
              Backend Deployment
            </h2>

            {/* New Site Option */}
            <div style={{
              backgroundColor: theme === 'light' ? '#f0fff4' : '#1a2f1a',
              border: '2px solid #4CAF50',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px',
              cursor: 'pointer'
            }}
            onClick={() => {
              setShowBackendSitesList(false);
              setCustomProjectSlug('');
              setNameValidationError(''); // Clear any previous errors
              setDeploymentType('backend'); // Make sure it's backend
              setShowConfirmDeploy(true);
            }}>
              <h3 style={{ margin: '0 0 5px 0', color: '#4CAF50' }}>➕ Create New Site</h3>
              <p style={{ margin: 0, fontSize: '13px', color: theme === 'light' ? '#666' : '#aaa' }}>
                Deploy to a new custom URL
              </p>
            </div>

            {/* Existing Sites List */}
            {backendSites.length > 0 && (
              <>
                <h3 style={{
                  margin: '0 0 15px 0',
                  color: theme === 'light' ? '#666' : '#aaa',
                  fontSize: '14px'
                }}>
                  Or update an existing site:
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {backendSites.map((site) => (
                    <div
                      key={site.slug}
                      onClick={() => confirmBackendDeploy(true, site.slug)}
                      style={{
                        backgroundColor: theme === 'light' ? '#f8f9fa' : '#1e1e1e',
                        border: `1px solid ${theme === 'light' ? '#e0e0e0' : '#444'}`,
                        borderRadius: '6px',
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#4CAF50';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = theme === 'light' ? '#e0e0e0' : '#444';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{
                        fontWeight: 'bold',
                        color: theme === 'light' ? '#333' : '#fff',
                        marginBottom: '5px'
                      }}>
                        {site.slug}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: theme === 'light' ? '#666' : '#aaa'
                      }}>
                        {site.url}
                      </div>
                      {site.lastModified && (
                        <div style={{
                          fontSize: '11px',
                          color: theme === 'light' ? '#999' : '#666',
                          marginTop: '5px'
                        }}>
                          Last updated: {new Date(site.lastModified).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <button
              onClick={() => setShowBackendSitesList(false)}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '20px',
                backgroundColor: theme === 'light' ? '#f0f0f0' : '#444',
                color: theme === 'light' ? '#333' : '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Confirm Deploy Modal */}
      {showConfirmDeploy && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{
              margin: '0 0 15px 0',
              color: theme === 'light' ? '#333' : '#fff',
              fontSize: '22px',
              textAlign: 'center'
            }}>
              {isPublished ? 'Re-Publish Project' : 'Confirm Deployment'}
            </h2>
            <p style={{
              margin: '0 0 20px 0',
              color: theme === 'light' ? '#666' : '#aaa',
              fontSize: '14px',
              lineHeight: '1.6',
              textAlign: 'center'
            }}>
              {isPublished 
                ? 'Update your existing project with the latest changes:' 
                : 'Enter a custom name for your project URL:'}
            </p>
            
            <div style={{
              marginBottom: '10px'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: theme === 'light' ? '#666' : '#aaa',
                fontSize: '13px',
                fontWeight: 'bold'
              }}>
                Project Name/Slug:
              </label>
              <input
                type="text"
                value={customProjectSlug}
                onChange={(e) => {
                  setCustomProjectSlug(e.target.value);
                  setNameValidationError(''); // Clear error on new input
                }}
                placeholder="my-awesome-project"
                readOnly={(isPublished && savedProjectId) || isCheckingName}
                disabled={isCheckingName}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `2px solid ${nameValidationError ? '#ef4444' : (theme === 'light' ? '#ddd' : '#444')}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: isCheckingName
                    ? (theme === 'light' ? '#fef3c7' : '#78350f')
                    : (isPublished && savedProjectId 
                      ? (theme === 'light' ? '#f5f5f5' : '#2a2a2a')
                      : (theme === 'light' ? '#fff' : '#1e1e1e')),
                  color: nameValidationError ? '#ef4444' : (theme === 'light' ? '#333' : '#ddd'),
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: (isPublished && savedProjectId) || isCheckingName ? 'not-allowed' : 'text',
                  transition: 'all 0.3s ease'
                }}
              />
              
              {/* Validation Error Message */}
              {nameValidationError && (
                <p style={{
                  margin: '8px 0 0 0',
                  color: '#ef4444',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  {nameValidationError}
                </p>
              )}
              
              {/* Checking Status */}
              {isCheckingName && !nameValidationError && (
                <p style={{
                  margin: '8px 0 0 0',
                  color: '#f59e0b',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  ⏳ Checking availability...
                </p>
              )}
              
              {/* Preview URL */}
              {!nameValidationError && !isCheckingName && (
                <p style={{
                  margin: '8px 0 0 0',
                  color: theme === 'light' ? '#999' : '#666',
                  fontSize: '12px'
                }}>
                  Preview: {API_BASE_URL}/{customProjectSlug || 'your-project-name'}
                </p>
              )}
            </div>

            <p style={{
              margin: '0 0 25px 0',
              color: theme === 'light' ? '#666' : '#aaa',
              fontSize: '13px',
              lineHeight: '1.5',
              textAlign: 'center'
            }}>
              {isPublished && savedProjectId ? (
                <>
                  <strong>Note:</strong> This will update your existing project at the same URL.
                </>
              ) : (
                <>
                  <strong>Note:</strong> Only letters, numbers, hyphens, and underscores are allowed.
                  <br/>
                  This will make your project publicly accessible.
                </>
              )}
            </p>
            
            <div style={{
              display: 'flex',
              gap: '10px'
            }}>
              <button
                onClick={() => {
                  setShowConfirmDeploy(false);
                  setShowDeploymentOptions(true);
                  setCustomProjectSlug('');
                  setNameValidationError(''); // Clear errors
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: theme === 'light' ? '#f0f0f0' : '#444',
                  color: theme === 'light' ? '#333' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAndDeploy}
                disabled={isCheckingName}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: isCheckingName ? '#94a3b8' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isCheckingName ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  opacity: isCheckingName ? 0.6 : 1
                }}
              >
                {isCheckingName ? 'Checking...' : (isPublished ? 'Update Project' : 'Yes, Deploy')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Full Screen Loader during Publishing */}
      {isPublishing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #9C27B0',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            color: 'white',
            marginTop: '20px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            Publishing your project...
          </p>
          <p style={{
            color: '#ccc',
            marginTop: '5px',
            fontSize: '14px'
          }}>
            Please wait, this may take a few moments
          </p>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      )}

      {/* Deployment Panel - Bottom Drawer */}
      {showDeploymentPanel && (
        <DeploymentPanel 
          mergedHtml={mergedHtml}
          projectName={activeFile?.filename?.replace('.html', '') || 'Project'}
          onClose={() => setShowDeploymentPanel(false)}
          onDeploySuccess={(result) => {
            console.log('Deployment successful:', result);
            console.log('Setting publishedUrl to:', result.url);
            setPublishedUrl(result.url);
            setIsPublished(true);
            setSavedProjectId(result.projectId);
            localStorage.setItem('isProjectPublished', 'true');
            localStorage.setItem('publishedProjectId', result.projectId);
            setShowPublishModal(true);
          }}
        />
      )}
      

      {/* Auth Modal */}
      {showPublishModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '15px',
                color: '#4CAF50'
              }}>
                ✓
              </div>
              <h2 style={{
                margin: '0 0 10px 0',
                color: theme === 'light' ? '#333' : '#fff',
                fontSize: '24px'
              }}>
                Successfully Published!
              </h2>
              <p style={{
                margin: 0,
                color: theme === 'light' ? '#666' : '#aaa',
                fontSize: '14px'
              }}>
                Your project is now live on the web
              </p>
            </div>

            <div style={{
              backgroundColor: theme === 'light' ? '#f5f5f5' : '#1e1e1e',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <input
                type="text"
                value={publishedUrl}
                readOnly
                style={{
                  flex: 1,
                  padding: '10px',
                  border: `1px solid ${theme === 'light' ? '#ddd' : '#444'}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d',
                  color: theme === 'light' ? '#333' : '#ddd',
                  outline: 'none'
                }}
              />
              <button
                onClick={copyToClipboard}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}
              >
                Copy
              </button>
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  window.open(publishedUrl, '_blank');
                }}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Go Live
              </button>
              <button
                onClick={closePublishModal}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: theme === 'light' ? '#f0f0f0' : '#444',
                  color: theme === 'light' ? '#333' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LLM Settings Modal */}
      {showLLMSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10002,
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: theme === 'light' ? '#fff' : '#1e1e2e',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '520px',
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            color: theme === 'light' ? '#1f2937' : '#f3f4f6',
            border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#2d2d3d'}`,
            animation: 'scaleIn 0.2s ease-out'
          }}>
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '20px',
              fontWeight: '800',
              borderBottom: `1px solid ${theme === 'light' ? '#e5e7eb' : '#2d2d3d'}`,
              paddingBottom: '12px',
              color: theme === 'light' ? '#111827' : '#fff'
            }}>
              Configure LLM Settings
            </h2>

            {/* Provider Tabs Navigation */}
            <div style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '8px',
              marginBottom: '20px',
              borderBottom: `1px solid ${theme === 'light' ? '#e5e7eb' : '#2d2d3d'}`,
              scrollbarWidth: 'none' /* Firefox */
            }}>
              {[
                { id: 'default', label: 'Default (Groq)' },
                { id: 'gemini', label: 'Google Gemini' },
                { id: 'openai', label: 'OpenAI' },
                { id: 'deepseek', label: 'DeepSeek' },
                { id: 'groq', label: 'Custom Groq' }
              ].map(tab => {
                const isActive = selectedProvider === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSelectedProvider(tab.id);
                      setSelectedModel(providerModels[tab.id]?.[0]?.value || '');
                    }}
                    style={{
                      padding: '8px 14px',
                      background: isActive 
                        ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' 
                        : 'transparent',
                      color: isActive ? 'white' : (theme === 'light' ? '#4b5563' : '#9ca3af'),
                      border: isActive ? 'none' : `1px solid ${theme === 'light' ? '#e5e7eb' : '#2d2d3d'}`,
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                      boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '24px' }}>
              {/* Informative text for Default Provider */}
              {selectedProvider === 'default' && (
                <div style={{
                  padding: '12px 14px',
                  background: theme === 'light' ? '#f0fdf4' : 'rgba(16, 185, 129, 0.15)',
                  borderLeft: '4px solid #10b981',
                  borderRadius: '6px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: theme === 'light' ? '#15803d' : '#34d399'
                }}>
                  Running on default free **llama-3.3-70b-versatile** hosted on Groq Cloud. No API Key required.
                </div>
              )}

              {/* API Key Input */}
              {selectedProvider !== 'default' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: theme === 'light' ? '#4b5563' : '#9ca3af' }}>
                    API Key:
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showApiKey ? "text" : "password"}
                      placeholder={`Enter your ${selectedProvider.toUpperCase()} API key`}
                      value={llmApiKey}
                      onChange={(e) => setLlmApiKey(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 40px 10px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme === 'light' ? '#cbd5e1' : '#3d3d4d'}`,
                        backgroundColor: theme === 'light' ? '#fff' : '#151521',
                        color: theme === 'light' ? '#1e293b' : '#f8fafc',
                        fontSize: '13px',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      type="button"
                      style={{
                        position: 'absolute',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: theme === 'light' ? '#64748b' : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                      }}
                    >
                      {showApiKey ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#888', lineHeight: '1.4' }}>
                    Stored locally in your browser. Sent securely to completions API.
                  </p>
                </div>
              )}

              {/* Model Selection */}
              {selectedProvider !== 'default' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: theme === 'light' ? '#4b5563' : '#9ca3af' }}>
                    Model:
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${theme === 'light' ? '#cbd5e1' : '#3d3d4d'}`,
                      backgroundColor: theme === 'light' ? '#fff' : '#151521',
                      color: theme === 'light' ? '#1e293b' : '#f8fafc',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  >
                    {providerModels[selectedProvider]?.map(modelOpt => (
                      <option key={modelOpt.value} value={modelOpt.value}>
                        {modelOpt.name}
                      </option>
                    ))}
                    <option value="custom">Custom Model Name...</option>
                  </select>
                </div>
              )}

              {/* Custom Model Name Input */}
              {selectedProvider !== 'default' && selectedModel === 'custom' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: theme === 'light' ? '#4b5563' : '#9ca3af' }}>
                    Custom Model Identifier:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. gemini-2.5-pro-preview"
                    value={customModelInput}
                    onChange={(e) => setCustomModelInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${theme === 'light' ? '#cbd5e1' : '#3d3d4d'}`,
                      backgroundColor: theme === 'light' ? '#fff' : '#151521',
                      color: theme === 'light' ? '#1e293b' : '#f8fafc',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Modal Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              borderTop: `1px solid ${theme === 'light' ? '#e5e7eb' : '#2d2d3d'}`,
              paddingTop: '16px'
            }}>
              <button
                onClick={() => setShowLLMSettings(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: theme === 'light' ? '#f3f4f6' : '#2a2a3a',
                  color: theme === 'light' ? '#374151' : '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme === 'light' ? '#e5e7eb' : '#3d3d4d';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme === 'light' ? '#f3f4f6' : '#2a2a3a';
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveLLMSettings}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          overflowY: 'auto',
          padding: '20px'
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '450px' }}>
            <button
              onClick={() => setShowAuthModal(false)}
              style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                zIndex: 10001
              }}
            >
              x
            </button>
            <Auth onLoginSuccess={handleLoginSuccess} theme={theme} />
          </div>
        </div>
      )}

      {/* Welcome Popup */}
      {showWelcomePopup && (
        <WelcomePopup 
          onClose={() => setShowWelcomePopup(false)} 
          onStartWithDefault={handleStartWithDefault}
          onStartFromScratch={handleStartFromScratch}
        />
      )}

      {/* File Context Menu */}
      {contextMenu.show && (
        <div 
          className="file-context-menu"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="context-menu-item"
            onClick={() => handleRename(contextMenu.fileId)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Rename
          </div>
          <div className="context-menu-divider"></div>
          <div 
            className="context-menu-item danger"
            onClick={() => {
              deleteFile(contextMenu.fileId);
              closeContextMenu();
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Delete
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(5px)',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={hideConfirmDialog}
        >
          <div 
            style={{
              background: theme === 'light' ? 'white' : '#1f2937',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '450px',
              width: '90%',
              textAlign: 'center',
              animation: 'scaleIn 0.2s ease-out',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              margin: '0 auto 20px',
              width: '64px',
              height: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: theme === 'light' ? '#fee2e2' : 'rgba(239, 68, 68, 0.1)',
              borderRadius: '50%'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="2"/>
              </svg>
            </div>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '20px',
              fontWeight: '700',
              color: theme === 'light' ? '#1f2937' : '#f3f4f6'
            }}>
              {confirmDialog.title}
            </h3>
            <p style={{
              margin: '0 0 24px 0',
              fontSize: '14px',
              color: theme === 'light' ? '#6b7280' : '#9ca3af',
              lineHeight: '1.6'
            }}>
              {confirmDialog.message}
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={hideConfirmDialog}
                style={{
                  padding: '12px 24px',
                  background: theme === 'light' ? '#f3f4f6' : '#374151',
                  color: theme === 'light' ? '#374151' : '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme === 'light' ? '#e5e7eb' : '#4b5563';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme === 'light' ? '#f3f4f6' : '#374151';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                style={{
                  padding: '12px 24px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* review changes modal */}
      {pendingAgentOperations && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={discardPendingOperations}
        >
          <div 
            style={{
              background: theme === 'light' ? 'white' : '#1e1e2e',
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '550px',
              width: '90%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              animation: 'scaleIn 0.2s ease-out',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#2d2d3d'}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
              borderBottom: `1px solid ${theme === 'light' ? '#f3f4f6' : '#2d2d3d'}`,
              paddingBottom: '16px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2a10 10 0 00-7.75 16.3l-.06.07a10 10 0 0015.62 0l-.06-.07A10 10 0 0012 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" fill="white"/>
                </svg>
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '700',
                  color: theme === 'light' ? '#111827' : '#f3f4f6'
                }}>
                  Review Proposed Changes
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  color: theme === 'light' ? '#6b7280' : '#9ca3af'
                }}>
                  Files checked. Choose whether to apply these changes.
                </p>
              </div>
            </div>

            {/* summary of changes */}
            <div style={{
              background: theme === 'light' ? '#f9fafb' : '#151521',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '18px',
              borderLeft: '4px solid #8b5cf6',
              fontSize: '14px',
              lineHeight: '1.5',
              color: theme === 'light' ? '#374151' : '#d1d5db',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              <strong>Change log:</strong> {agentSummary}
            </div>

            {/* Operations list */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              marginBottom: '20px',
              paddingRight: '4px'
            }}>
              <h4 style={{
                margin: '0 0 10px 0',
                fontSize: '13px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: theme === 'light' ? '#6b7280' : '#9ca3af'
              }}>
                Proposed Operations ({pendingAgentOperations.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pendingAgentOperations.map((op, idx) => {
                  let badgeBg = '';
                  let badgeColor = '';
                  let badgeText = '';
                  
                  if (op.type === 'create') {
                    badgeBg = theme === 'light' ? '#d1fae5' : 'rgba(16, 185, 129, 0.15)';
                    badgeColor = theme === 'light' ? '#065f46' : '#34d399';
                    badgeText = 'Create';
                  } else if (op.type === 'update') {
                    badgeBg = theme === 'light' ? '#fef3c7' : 'rgba(245, 158, 11, 0.15)';
                    badgeColor = theme === 'light' ? '#92400e' : '#fbbf24';
                    badgeText = 'Update';
                  } else if (op.type === 'delete') {
                    badgeBg = theme === 'light' ? '#fee2e2' : 'rgba(239, 68, 68, 0.15)';
                    badgeColor = theme === 'light' ? '#991b1b' : '#f87171';
                    badgeText = 'Delete';
                  }

                  return (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: theme === 'light' ? '#f3f4f6' : '#252538',
                        borderRadius: '6px',
                        fontSize: '13px',
                        border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#2d2d3d'}`
                      }}
                    >
                      <span style={{
                        fontFamily: 'Consolas, Monaco, monospace',
                        color: theme === 'light' ? '#111827' : '#e2e8f0',
                        wordBreak: 'break-all',
                        marginRight: '8px'
                      }}>
                        {op.path}
                      </span>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: badgeBg,
                        color: badgeColor,
                        textTransform: 'uppercase'
                      }}>
                        {badgeText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              borderTop: `1px solid ${theme === 'light' ? '#f3f4f6' : '#2d2d3d'}`,
              paddingTop: '16px'
            }}>
              <button
                onClick={discardPendingOperations}
                style={{
                  padding: '10px 20px',
                  background: theme === 'light' ? '#f3f4f6' : '#2a2a3a',
                  color: theme === 'light' ? '#374151' : '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme === 'light' ? '#e5e7eb' : '#3d3d4d';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme === 'light' ? '#f3f4f6' : '#2a2a3a';
                }}
              >
                Discard
              </button>
              <button
                onClick={applyPendingOperations}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '13px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Approve & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;