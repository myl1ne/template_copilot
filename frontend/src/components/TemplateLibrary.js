import React, { useState, useEffect } from 'react';
import './TemplateLibrary.css';
import api from '../services/api';

function TemplateLibrary() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templateList = await api.listTemplates();
      setTemplates(templateList);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="template-library">
      <div className="template-library-header">
        <div>
          <h1>📚 Agent Templates</h1>
          <p className="subtitle">Pre-configured agent types for specialized tasks</p>
        </div>
      </div>

      <div className="templates-grid">
        {templates.map(template => (
          <div 
            key={template.id} 
            className="template-card"
            style={{ borderColor: template.color }}
          >
            <div className="template-header">
              <div 
                className="template-icon"
                style={{ backgroundColor: template.color + '20' }}
              >
                {template.icon}
              </div>
              <div className="template-info">
                <h3>{template.name}</h3>
                <span className="template-type">{template.type}</span>
              </div>
            </div>

            <p className="template-description">{template.description}</p>

            <div className="template-details">
              <div className="template-detail">
                <span className="detail-icon">⚡</span>
                <span>Budget: {template.default_budget}</span>
              </div>
              <div className="template-detail">
                <span className="detail-icon">🔓</span>
                <span>Level {template.unlock_level}</span>
              </div>
            </div>

            <div className="template-prompt">
              <h4>System Prompt:</h4>
              <p>{template.system_prompt}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card template-info">
        <h2>How to Use Templates</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-icon">1️⃣</span>
            <div>
              <h3>Choose a Template</h3>
              <p>Select from specialized agent types based on your needs</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">2️⃣</span>
            <div>
              <h3>Create Your Agent</h3>
              <p>Use the template when creating a new agent</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">3️⃣</span>
            <div>
              <h3>Provide a Task</h3>
              <p>Give your agent a specific task or prompt</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">4️⃣</span>
            <div>
              <h3>Start Processing</h3>
              <p>Launch your agent and monitor its progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateLibrary;
