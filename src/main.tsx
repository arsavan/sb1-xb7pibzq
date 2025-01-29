import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';

// Apply default theme immediately to prevent flash
document.documentElement.style.setProperty('--primary', '#6366f1');
document.documentElement.style.setProperty('--primary-hover', '#4f46e5');
document.documentElement.style.setProperty('--secondary', '#ec4899');
document.documentElement.style.setProperty('--accent', '#8b5cf6');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);