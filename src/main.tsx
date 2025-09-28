/**
 * Main entry point for Aria AI Companion application
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { CompanionDemo } from './components/CompanionDemo';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <CompanionDemo />
    </div>
  </React.StrictMode>,
);