# Gamified LLM Research Platform - Project Overview

## What is the Gamified LLM Research Platform?

The Gamified LLM Research Platform is an interactive web application that allows users to create and manage autonomous AI agents in nested hierarchies. Agents can spawn child agents, manage computation budgets, and complete complex tasks through delegation—all wrapped in an engaging, game-like experience.

## Target Audience

This project is designed for:
- AI researchers and enthusiasts exploring agent architectures
- Developers interested in LLM applications and automation
- Students learning about AI agent systems
- Anyone curious about hierarchical AI processing

## Key Features

- **🤖 Nested Agent Structures**: Create agents that spawn child agents for task delegation
- **⚡ Computation Budget System**: Strategic resource management across agent hierarchies
- **📊 Real-time Monitoring**: Watch agents work via WebSocket connections
- **🎯 Gamification**: Level progression, XP, achievements, and unlockables
- **📚 Agent Template Library**: Pre-configured specialists (Auditor, Ethical Committee, etc.)
- **🔍 Execution Logs**: Complete visibility into agent decision-making
- **🎨 Modern React UI**: Beautiful gradient-themed interface

## Quick Start

### Prerequisites
- Python 3.9+ (for backend)
- Node.js 16+ (for frontend)
- Firebase project with Firestore enabled

### Installation

**Backend:**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Configure .env with Firebase credentials
python main.py
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

### Basic Usage
1. Open `http://localhost:3000`
2. Click "Create Agent" on the dashboard
3. Give your agent a name and task prompt
4. Start the agent and watch it process
5. Agents can spawn children for subtasks
6. Monitor logs and budget consumption

## Core Benefits

1. **Hands-on Learning**: Experiment with agent hierarchies and delegation patterns
2. **Gamified Experience**: Makes complex AI concepts engaging through game mechanics
3. **Flexible Architecture**: Backend and frontend separated for easy modification
4. **Template System**: Quick-start with specialized agent types
5. **Real-time Feedback**: Immediate visibility into agent behavior

## Links & Resources

- **Repository**: https://github.com/myl1ne/template_copilot
- **Backend Documentation**: [backend/README.md](../backend/README.md)
- **Frontend Documentation**: [frontend/README.md](../frontend/README.md)
- **License**: MIT

---

*Last updated: December 31, 2024 | Version: 0.1.0*