import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AgentView.css';
import api from '../services/api';
import CreateAgentModal from './CreateAgentModal';
import AgentCard from './AgentCard';

function AgentView() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [children, setChildren] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadAgentData();
  }, [agentId]);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      const [agentData, childrenData, logsData] = await Promise.all([
        api.getAgent(agentId),
        api.getAgentChildren(agentId),
        api.getAgentLogs(agentId, 50)
      ]);
      setAgent(agentData);
      setChildren(childrenData);
      setLogs(logsData);
    } catch (error) {
      console.error('Error loading agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAgent = async () => {
    try {
      await api.startAgent(agentId);
      await loadAgentData();
    } catch (error) {
      console.error('Error starting agent:', error);
      alert('Failed to start agent: ' + error.message);
    }
  };

  const handleCompleteAgent = async () => {
    const result = prompt('Enter completion result:');
    if (result) {
      try {
        await api.completeAgent(agentId, result);
        await loadAgentData();
      } catch (error) {
        console.error('Error completing agent:', error);
      }
    }
  };

  const handleCreateChild = async (childData) => {
    try {
      await api.createAgent(childData);
      setShowCreateModal(false);
      await loadAgentData();
    } catch (error) {
      console.error('Error creating child agent:', error);
      alert('Failed to create child agent: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="error-state">
        <h2>Agent not found</h2>
        <button className="button button-primary" onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="agent-view">
      <div className="agent-view-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>{agent.name}</h1>
      </div>

      <div className="agent-view-grid">
        {/* Agent Details */}
        <div className="card agent-details">
          <h2>Agent Details</h2>
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className={`status-badge status-${agent.status}`}>
              {agent.status}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Type:</span>
            <span>{agent.type}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Depth:</span>
            <span>Level {agent.depth}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Budget:</span>
            <span>{agent.budget_used} / {agent.computation_budget}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Children:</span>
            <span>{agent.children_ids.length}</span>
          </div>

          <div className="action-buttons">
            {agent.status === 'created' && (
              <button 
                className="button button-success"
                onClick={handleStartAgent}
              >
                ▶️ Start Agent
              </button>
            )}
            {agent.status === 'running' && (
              <>
                <button 
                  className="button button-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  ➕ Spawn Child
                </button>
                <button 
                  className="button button-secondary"
                  onClick={handleCompleteAgent}
                >
                  ✓ Complete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Prompt */}
        <div className="card agent-prompt-section">
          <h2>Task Prompt</h2>
          <p className="prompt-text">{agent.prompt}</p>
          {agent.system_prompt && (
            <>
              <h3>System Prompt</h3>
              <p className="system-prompt-text">{agent.system_prompt}</p>
            </>
          )}
          {agent.result && (
            <>
              <h3>Result</h3>
              <p className="result-text">{agent.result}</p>
            </>
          )}
        </div>
      </div>

      {/* Child Agents */}
      {children.length > 0 && (
        <div className="card children-section">
          <h2>Child Agents ({children.length})</h2>
          <div className="children-grid">
            {children.map(child => (
              <AgentCard
                key={child.id}
                agent={child}
                onClick={() => navigate(`/agent/${child.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Execution Logs */}
      <div className="card logs-section">
        <h2>Execution Logs</h2>
        {logs.length === 0 ? (
          <p className="empty-message">No logs yet</p>
        ) : (
          <div className="logs-list">
            {logs.map(log => (
              <div key={log.id} className="log-entry">
                <span className="log-time">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={`log-type log-type-${log.event_type}`}>
                  {log.event_type}
                </span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateAgentModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateChild}
          parentId={agentId}
        />
      )}
    </div>
  );
}

export default AgentView;
