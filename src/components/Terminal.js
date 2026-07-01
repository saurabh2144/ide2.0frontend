import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

function Terminal({ theme, files }) {
  const [output, setOutput] = useState([
    { type: 'system', text: 'Terminal ready. Type commands like: npm install, node server.js, ls, etc.' }
  ]);
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const outputRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Handle command execution
  const executeCommand = async () => {
    if (!command.trim() || isExecuting) return;

    const cmd = command.trim();
    
    // Add command to output
    setOutput(prev => [...prev, { type: 'command', text: `$ ${cmd}` }]);
    
    // Add to history
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    
    // Clear input
    setCommand('');

    // Handle special commands locally
    if (cmd === 'clear' || cmd === 'cls') {
      setOutput([]);
      return;
    }

    if (cmd === 'help') {
      setOutput(prev => [...prev, {
        type: 'output',
        text: `Available commands:
  npm install          - Install dependencies
  npm start           - Start development server
  node <file>         - Run Node.js file
  ls / dir            - List files
  clear / cls         - Clear terminal
  help                - Show this help

You can run any shell command. Working directory is your project root.`
      }]);
      return;
    }

    if (cmd === 'ls' || cmd === 'dir') {
      const fileList = files.map(f => f.filename).join('\n');
      setOutput(prev => [...prev, { 
        type: 'output', 
        text: `Files in project:\n${fileList}` 
      }]);
      return;
    }

    // Execute real command on backend
    setIsExecuting(true);
    setOutput(prev => [...prev, { 
      type: 'info', 
      text: '⏳ Executing...' 
    }]);

    try {
      const response = await axios.post(`${API_URL}/execute-command`, {
        command: cmd,
        files: files, // Send all current files
        projectId: `project-${Date.now()}` // Unique ID for this session
      });

      // Remove "executing" message
      setOutput(prev => prev.filter(item => item.text !== '⏳ Executing...'));

      if (response.data.success) {
        if (response.data.output) {
          setOutput(prev => [...prev, {
            type: 'output',
            text: response.data.output
          }]);
        }
        if (response.data.error) {
          setOutput(prev => [...prev, {
            type: 'error',
            text: response.data.error
          }]);
        }
      } else {
        setOutput(prev => [...prev, {
          type: 'error',
          text: response.data.error || 'Command failed'
        }]);
      }

    } catch (error) {
      setOutput(prev => prev.filter(item => item.text !== '⏳ Executing...'));
      setOutput(prev => [...prev, {
        type: 'error',
        text: `Error: ${error.response?.data?.error || error.message}`
      }]);
    } finally {
      setIsExecuting(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme === 'light' ? '#f5f5f5' : '#1e1e1e',
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      fontSize: '13px'
    }}>
      {/* Output Area */}
      <div 
        ref={outputRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px',
          color: theme === 'light' ? '#000' : '#d4d4d4'
        }}
      >
        {output.map((line, index) => (
          <div
            key={index}
            style={{
              marginBottom: '4px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: 
                line.type === 'command' ? (theme === 'light' ? '#0066cc' : '#4fc3f7') :
                line.type === 'error' ? '#f44336' :
                line.type === 'info' ? '#FF9800' :
                line.type === 'system' ? '#4CAF50' :
                (theme === 'light' ? '#000' : '#d4d4d4')
            }}
          >
            {line.text}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 10px',
        borderTop: `1px solid ${theme === 'light' ? '#ddd' : '#333'}`,
        backgroundColor: theme === 'light' ? '#fff' : '#252525'
      }}>
        <span style={{ 
          color: theme === 'light' ? '#0066cc' : '#4fc3f7',
          marginRight: '8px',
          fontWeight: 'bold'
        }}>
          $
        </span>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isExecuting}
          placeholder={isExecuting ? "Executing..." : "Type command and press Enter..."}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: theme === 'light' ? '#000' : '#d4d4d4',
            fontFamily: 'inherit',
            fontSize: 'inherit'
          }}
        />
        <button
          onClick={executeCommand}
          disabled={isExecuting || !command.trim()}
          style={{
            padding: '4px 12px',
            backgroundColor: isExecuting ? '#666' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isExecuting ? 'not-allowed' : 'pointer',
            fontSize: '11px',
            marginLeft: '8px'
          }}
        >
          {isExecuting ? '⏳' : 'Run'}
        </button>
      </div>
    </div>
  );
}

export default Terminal;
