import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWithBoundary from './App.jsx';
import './index.css';

// Global error handlers for improved logging to disk
// These catch errors outside React ErrorBoundary and send them via Electron IPC
const setupGlobalErrorLogging = () => {
  if (typeof window === 'undefined') return;

  const logToElectron = (message, stack = '', context = '') => {
    try {
      if (window.electronAPI && window.electronAPI.logError) {
        const fullMessage = `[Global] ${message}${context ? ' | Context: ' + context : ''}`;
        window.electronAPI.logError(fullMessage, stack);
      }
    } catch (_) {
      // Last resort - never break the app
      console.error('[Ascensión] Failed to log global error:', message);
    }
  };

  window.onerror = (message, source, lineno, colno, error) => {
    const stack = error?.stack || `${source}:${lineno}:${colno}`;
    logToElectron(String(message), stack, 'window.onerror');
    return false; // Let default handling continue
  };

  window.onunhandledrejection = (event) => {
    const reason = event.reason;
    const message = reason?.message || String(reason);
    const stack = reason?.stack || '';
    logToElectron(`Unhandled Promise Rejection: ${message}`, stack, 'unhandledrejection');
  };
};

setupGlobalErrorLogging();

// Enable dark mode for Tailwind darkMode: "class"
document.documentElement.classList.add('dark');

// Root render with ErrorBoundary at the absolute top (per project rules)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWithBoundary />
  </React.StrictMode>
);
