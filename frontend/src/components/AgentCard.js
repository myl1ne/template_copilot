import React from 'react';
import './AgentCard.css';

function AgentCard({ agent, onClick }) {
  const getStatusColor = (status) => {
    const colors = {
      created: '#3b82f6',
      running: '#f59e0b',
      completed: '#10b981',
      failed: '#ef4444',
      paused: '#6366f1',
      waiting: '#8b5cf6'
    };
    return colors[status] || '#94a3b8';
  };

  const getTypeIcon = (type) => {
    const icons = {
      auditor: '🔍',
      ethical_committee: '⚖️',
      critical_thinker: '🧠',
      researcher: '📚',
      summarizer: '📝',
      validator: '✅',
      custom: '🤖'
    };
    return icons[type] || '🤖';
  };

  const budgetPercentage = (agent.budget_used / agent.computation_budget) * 100;

  return (
    <div className="agent-card" onClick={onClick}>
      <div className="agent-card-header">
        <div className="agent-icon">{getTypeIcon(agent.type)}</div>
        <div className="agent-info">
          <h3 className="agent-name">{agent.name}</h3>
          <span 
            className="agent-status" 
            style={{ backgroundColor: getStatusColor(agent.status) }}
          >
            {agent.status}
          </span>
        </div>
      </div>

      <div className="agent-card-body">
        <p className="agent-prompt">{agent.prompt.substring(0, 100)}...</p>
        
        <div className="agent-metrics">
          <div className="metric">
            <span className="metric-label">Depth</span>
            <span className="metric-value">{agent.depth}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Children</span>
            <span className="metric-value">{agent.children_ids.length}</span>
          </div>
        </div>

        <div className="budget-section">
          <div className="budget-header">
            <span>Budget</span>
            <span>{agent.budget_used} / {agent.computation_budget}</span>
          </div>
          <div className="budget-bar">
            <div 
              className="budget-fill" 
              style={{ 
                width: `${budgetPercentage}%`,
                backgroundColor: budgetPercentage > 80 ? '#ef4444' : '#10b981'
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentCard;
