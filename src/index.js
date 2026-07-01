import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Suppress ResizeObserver errors globally
const debounce = (callback, delay) => {
  let tid;
  return function (...args) {
    const ctx = self;
    tid && clearTimeout(tid);
    tid = setTimeout(() => {
      callback.apply(ctx, args);
    }, delay);
  };
};

const _ = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ {
  constructor(callback) {
    callback = debounce(callback, 20);
    super(callback);
  }
};

// Also suppress error event
window.addEventListener('error', (e) => {
  if (e.message && (
    e.message.includes('ResizeObserver') ||
    e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
    e.message === 'ResizeObserver loop limit exceeded'
  )) {
    e.stopImmediatePropagation();
    e.preventDefault();
    return false;
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
