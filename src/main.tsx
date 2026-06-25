import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handler to suppress cross-origin ad element Script errors
if (typeof window !== 'undefined') {
  // Override window.onerror directly to suppress script errors completely
  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const msg = String(message || '');
    if (
      msg === 'Script error.' || 
      msg.toLowerCase().includes('script error') || 
      msg.toLowerCase().includes('error loading script') ||
      !source || 
      source.includes('startapp') || 
      source.includes('alwingulla') ||
      source.includes('monetag')
    ) {
      console.warn('Suppressed cross-origin or third-party script error:', msg, 'at', source);
      return true; // Prevents the firing of the default error handler / browser overlay
    }
    if (originalOnError) {
      return originalOnError.apply(this, [message, source, lineno, colno, error]);
    }
    return false;
  };

  window.addEventListener('error', (event) => {
    const msg = String(event.message || '');
    const src = String(event.filename || '');
    if (
      msg === 'Script error.' || 
      msg.toLowerCase().includes('script error') || 
      msg.toLowerCase().includes('error loading script') ||
      event.filename === '' ||
      src.includes('startapp') ||
      src.includes('alwingulla') ||
      src.includes('monetag')
    ) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const errorStr = event.reason ? String(event.reason.message || event.reason) : '';
    if (
      errorStr.includes('Script error') || 
      errorStr.toLowerCase().includes('networkerror') || 
      errorStr.toLowerCase().includes('failed to fetch') ||
      errorStr.toLowerCase().includes('startapp') ||
      errorStr.toLowerCase().includes('monetag')
    ) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

