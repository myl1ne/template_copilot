import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // User methods
  async createUser(userData) {
    const response = await this.client.post('/users', userData);
    return response.data;
  }

  async getUser(userId) {
    const response = await this.client.get(`/users/${userId}`);
    return response.data;
  }

  async getUserByUsername(username) {
    const response = await this.client.get(`/users/username/${username}`);
    return response.data;
  }

  // Agent methods
  async createAgent(agentData) {
    const response = await this.client.post('/agents', agentData);
    return response.data;
  }

  async getAgent(agentId) {
    const response = await this.client.get(`/agents/${agentId}`);
    return response.data;
  }

  async listAgents(userId = 'demo-user', parentId = null) {
    const params = { user_id: userId };
    if (parentId) params.parent_id = parentId;
    const response = await this.client.get('/agents', { params });
    return response.data;
  }

  async getAgentChildren(agentId) {
    const response = await this.client.get(`/agents/${agentId}/children`);
    return response.data;
  }

  async startAgent(agentId) {
    const response = await this.client.post(`/agents/${agentId}/start`);
    return response.data;
  }

  async completeAgent(agentId, result) {
    const response = await this.client.post(`/agents/${agentId}/complete`, null, {
      params: { result }
    });
    return response.data;
  }

  async getAgentLogs(agentId, limit = 100) {
    const response = await this.client.get(`/agents/${agentId}/logs`, {
      params: { limit }
    });
    return response.data;
  }

  // Template methods
  async listTemplates() {
    const response = await this.client.get('/templates');
    return response.data;
  }

  async getTemplate(templateId) {
    const response = await this.client.get(`/templates/${templateId}`);
    return response.data;
  }

  async getTemplatesByLevel(level) {
    const response = await this.client.get(`/templates/level/${level}`);
    return response.data;
  }

  // Achievement methods
  async listAchievements() {
    const response = await this.client.get('/achievements');
    return response.data;
  }
}

export default new ApiService();
