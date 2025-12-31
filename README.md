# Gamified LLM Research Platform

An interactive platform for creating and managing nested AI agent hierarchies with gamification mechanics.

## 🎮 What is This?

This platform allows you to create autonomous AI agents that can:
- Spawn child agents to delegate subtasks
- Manage computation budgets
- Work in nested hierarchies
- Execute complex research tasks

Think of it as an idle game meets AI research lab - watch your agents think, create sub-processes, and complete tasks!

## ✨ Key Features

- **🤖 Nested Agent Structures**: Agents can spawn child agents for delegation
- **⚡ Computation Budget System**: Manage resources across agent hierarchies
- **📊 Real-time Monitoring**: Watch agents work in real-time via WebSocket
- **🎯 Gamification**: Level up, earn XP, unlock achievements
- **📚 Agent Templates**: Pre-configured agent types (Auditor, Researcher, etc.)
- **🔍 Execution Logs**: Track every step of agent processing
- **🎨 Modern UI**: Beautiful React interface with gradient themes

## 🏗️ Architecture

### Backend (FastAPI + Firestore)
- RESTful API for agent management
- WebSocket support for real-time updates
- Firestore for persistent storage
- Agent execution engine
- Budget management system

### Frontend (React)
- Dashboard for agent overview
- Detailed agent inspection views
- Template library browser
- Real-time updates via WebSocket
- Responsive, gamified UI

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- Firebase project with Firestore

### Backend Setup

1. Navigate to backend:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure Firebase:
```bash
cp .env.example .env
# Edit .env with your Firebase credentials
```

4. Run the server:
```bash
python main.py
```

Backend will be at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

Frontend will open at `http://localhost:3000`

## 📖 Usage

1. **Create a Root Agent**: Start with a high-level task
2. **Start Execution**: Watch your agent begin processing
3. **Spawn Children**: Agents can create sub-agents for subtasks
4. **Monitor Progress**: View logs and budget consumption
5. **Level Up**: Complete agents to earn XP and unlock features

## 🎨 Agent Templates

The platform includes specialized agent templates:

- **🔍 Auditor**: Reviews and verifies outputs
- **⚖️ Ethical Committee**: Evaluates ethical implications
- **🧠 Critical Thinker**: Analyzes arguments and finds flaws
- **📚 Researcher**: Gathers and synthesizes information
- **📝 Summarizer**: Condenses complex information
- **✅ Validator**: Checks outputs against requirements

## 🎮 Game Mechanics

- **Levels**: Progress through levels by completing agents
- **Experience Points**: Earn XP based on agent complexity
- **Computation Budget**: Strategic resource management
- **Achievements**: Unlock rewards for milestones
- **Template Unlocks**: Access advanced agent types as you level up

## 📚 Documentation

- **[Backend Documentation](backend/README.md)** - API and backend architecture
- **[Frontend Documentation](frontend/README.md)** - UI components and features
- **[Project Overview](docs/project-overview.md)** - High-level project summary
- **[Roadmap](docs/roadmap.md)** - Current status and future plans

## 🛠️ Technology Stack

**Backend:**
- FastAPI for REST API
- Firebase Firestore for database
- WebSockets for real-time updates
- Pydantic for data validation

**Frontend:**
- React 18
- React Router
- Axios for API calls
- CSS3 with gradient themes

## 🤝 Contributing

This is an initial implementation with room for enhancement:

- LLM integration (currently simulated)
- Advanced agent communication protocols
- More sophisticated budget algorithms
- Additional agent templates
- User authentication
- Multi-user support

## 📝 License

MIT License - see LICENSE file for details

## 🎯 Future Enhancements

- **LLM Integration**: Connect to OpenAI, Anthropic, or other LLM providers
- **Agent Marketplace**: Share and discover agent templates
- **Collaborative Features**: Multi-user agent collaboration
- **Advanced Visualizations**: Graph/tree views of agent hierarchies
- **Performance Analytics**: Detailed metrics and insights
- **Mobile App**: Native mobile experience
- **Agent Persistence**: Save and resume agent sessions

---

Built with ❤️ for AI enthusiasts and researchers
