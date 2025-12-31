import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import api from '../services/api';
import websocket from '../services/websocket';
import CreateAgentModal from './CreateAgentModal';
import AgentCard from './AgentCard';

function Dashboard() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadAgents();
    websocket.connect();
    websocket.addListener(handleWebSocketMessage);

    return () => {
      websocket.removeListener(handleWebSocketMessage);
    };
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      // Get root level agents (no parent)
      const agentList = await api.listAgents('demo-user', null);
      setAgents(agentList);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWebSocketMessage = (message) => {
    console.log('WebSocket message:', message);
    // Reload agents when updates occur
    if (message.type === 'agent_created' || message.type === 'agent_completed') {
      loadAgents();
    }
  };

  const handleCreateAgent = async (agentData) => {
    try {
      const newAgent = await api.createAgent(agentData);
      setAgents([...agents, newAgent]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent. Please try again.');
    }
  };

  const handleAgentClick = (agentId) => {
    navigate(`/agent/${agentId}`);
  };

  const getRootAgents = () => {
    return agents.filter(agent => !agent.parent_id);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>🎮 Agent Dashboard</h1>
          <p className="subtitle">Create and manage your AI agents</p>
        </div>
        <button 
          className="button button-primary"
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Create Agent
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {getRootAgents().length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🤖</div>
              <h2>No Agents Yet</h2>
              <p>Create your first AI agent to get started!</p>
              <button 
                className="button button-primary"
                onClick={() => setShowCreateModal(true)}
              >
                Create Your First Agent
              </button>
            </div>
          ) : (
            <div className="agents-grid">
              {getRootAgents().map(agent => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onClick={() => handleAgentClick(agent.id)}
                />
              ))}
            </div>
          )}

          <div className="dashboard-stats">
            <div className="card">
              <h3>📊 Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{agents.length}</span>
                  <span className="stat-label">Total Agents</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {agents.filter(a => a.status === 'running').length}
                  </span>
                  <span className="stat-label">Running</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {agents.filter(a => a.status === 'completed').length}
                  </span>
                  <span className="stat-label">Completed</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showCreateModal && (
        <CreateAgentModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAgent}
        />
      )}
    </div>
  );
}

export default Dashboard;
