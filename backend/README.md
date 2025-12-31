# Backend - Gamified LLM Research Platform

FastAPI backend for managing AI agents with nested structures and gamification.

## Features

- **Agent Management**: Create, execute, and monitor AI agents
- **Nested Agent Structures**: Agents can spawn sub-agents
- **Computation Budget System**: Track and manage agent resource usage
- **Real-time Updates**: WebSocket support for live monitoring
- **Firestore Integration**: Persistent storage for all data
- **Agent Templates**: Pre-configured agent types (Auditor, Ethical Committee, etc.)
- **Gamification**: User levels, experience, and achievements

## Setup

### Prerequisites

- Python 3.9+
- Firebase project with Firestore enabled
- Firebase service account credentials

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up Firebase:
   - Create a Firebase project
   - Enable Firestore database
   - Download service account credentials
   - Place credentials file as `firebase-credentials.json` or update path in `.env`

### Running

Start the development server:
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

## API Endpoints

### Users
- `POST /api/users` - Create user
- `GET /api/users/{user_id}` - Get user
- `GET /api/users/username/{username}` - Get user by username

### Agents
- `POST /api/agents` - Create agent
- `GET /api/agents` - List agents (with optional filters)
- `GET /api/agents/{agent_id}` - Get agent details
- `GET /api/agents/{agent_id}/children` - Get agent children
- `POST /api/agents/{agent_id}/start` - Start agent execution
- `POST /api/agents/{agent_id}/complete` - Mark agent as completed
- `GET /api/agents/{agent_id}/logs` - Get agent execution logs

### Templates
- `GET /api/templates` - List all templates
- `GET /api/templates/{template_id}` - Get template details
- `GET /api/templates/level/{level}` - Get templates by unlock level

### Achievements
- `GET /api/achievements` - List all achievements

### WebSocket
- `WS /ws` - Real-time updates for agent events

## Architecture

### Models
- **Agent**: Core agent entity with status, budget, and hierarchy
- **User**: Player profile with progression system
- **AgentTemplate**: Reusable agent configurations
- **ExecutionLog**: Event logging for agent activities
- **Achievement**: Gamification rewards

### Services
- **DatabaseService**: Firestore operations
- **AgentEngine**: Agent lifecycle and execution management

## Development

### Running Tests
```bash
pytest
```

### Code Structure
```
backend/
├── main.py           # FastAPI application and routes
├── models.py         # Pydantic data models
├── database.py       # Firestore service
├── engine.py         # Agent execution engine
├── config.py         # Configuration management
└── requirements.txt  # Python dependencies
```

## Future Enhancements

- LLM integration (OpenAI, Anthropic, etc.)
- Advanced agent communication protocols
- Agent marketplace/sharing
- Performance metrics and analytics
- Rate limiting and quotas
- Authentication and authorization
