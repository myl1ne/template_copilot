import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import AgentView from './components/AgentView';
import TemplateLibrary from './components/TemplateLibrary';
import Header from './components/Header';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agent/:agentId" element={<AgentView />} />
            <Route path="/templates" element={<TemplateLibrary />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
