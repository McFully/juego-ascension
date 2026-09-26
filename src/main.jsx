import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWithBoundary from './App.jsx';
import './index.css';

import { logTelemetry, LOG_LEVELS } from './utils/telemetry.js';

// Global error handlers for improved logging to disk y telemetría 360
const setupGlobalErrorLogging = () => {
  if (typeof window === 'undefined') return;

  const logToElectron = (message, stack = '', context = '') => {
    try {
      logTelemetry(LOG_LEVELS.ERROR, `[Global Error] ${message}`, { stack, context });
    } catch (_) {
      console.error('[Ascensión] Failed to log global error:', message);
    }
  };

  window.onerror = (message, source, lineno, colno, error) => {
    const stack = error?.stack || `${source}:${lineno}:${colno}`;
    logToElectron(String(message), stack, `window.onerror (${source}:${lineno})`);
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
