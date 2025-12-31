import React, { useState, useEffect } from 'react';
import './CreateAgentModal.css';
import api from '../services/api';

function CreateAgentModal({ onClose, onSubmit, parentId = null }) {
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    prompt: '',
    type: 'custom',
    template_id: '',
    computation_budget: 100
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const templateList = await api.listTemplates();
      setTemplates(templateList);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      parent_id: parentId
    };
    if (!submitData.template_id) {
      delete submitData.template_id;
    }
    onSubmit(submitData);
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        template_id: templateId,
        type: template.type,
        computation_budget: template.default_budget
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🤖 Create New Agent</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Agent Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Research Assistant"
              required
            />
          </div>

          <div className="form-group">
            <label>Task/Prompt *</label>
            <textarea
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              placeholder="Describe what you want this agent to do..."
              required
            />
          </div>

          <div className="form-group">
            <label>Agent Template (Optional)</label>
            <select
              value={formData.template_id}
              onChange={(e) => handleTemplateSelect(e.target.value)}
            >
              <option value="">Custom Agent</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.icon} {template.name} - {template.description}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Computation Budget</label>
            <input
              type="number"
              value={formData.computation_budget}
              onChange={(e) => setFormData({ ...formData, computation_budget: parseInt(e.target.value) })}
              min="10"
              max="1000"
            />
            <small>Amount of computation resources allocated to this agent</small>
          </div>

          {parentId && (
            <div className="info-box">
              ℹ️ This agent will be created as a child of the selected parent agent.
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="button button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button button-primary">
              Create Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateAgentModal;
