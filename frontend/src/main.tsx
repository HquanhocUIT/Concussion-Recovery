/// <reference types="vite/client" />
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App.tsx';
import { warmUpBackend } from './services/api';
import './index.css';

// Start the backend wakeup before React renders. On a free-tier instance the
// first request after an idle period takes tens of seconds, and doing that
// inside a user's first question made a working assistant look broken.
warmUpBackend();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
);
