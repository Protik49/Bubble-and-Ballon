import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Howler } from 'howler';

// Configure global Howler settings
Howler.autoUnlock = true;
Howler.autoSuspend = false;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);