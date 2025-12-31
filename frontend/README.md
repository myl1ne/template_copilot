# Frontend - Gamified LLM Research Platform

React-based frontend for the gamified LLM research platform.

## Features

- **Dashboard**: View and manage all your agents
- **Agent Creation**: Create new agents with customizable parameters
- **Agent Hierarchy Visualization**: See parent-child relationships
- **Real-time Updates**: WebSocket integration for live agent status
- **Template Library**: Browse and use pre-configured agent templates
- **Gamification UI**: Progress tracking, levels, and achievements
- **Agent Inspector**: Detailed view of agent execution and logs

## Technology Stack

- React 18
- React Router for navigation
- Axios for API calls
- WebSockets for real-time updates
- CSS3 for styling with gradient themes

## Setup

### Prerequisites

- Node.js 16+
- npm or yarn
- Backend API running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment (optional):
```bash
# Create .env file if you need to override defaults
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/ws
```

3. Start development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App (one-way operation)

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Header.js/css
│   │   ├── Dashboard.js/css
│   │   ├── AgentView.js/css
│   │   ├── AgentCard.js/css
│   │   ├── CreateAgentModal.js/css
│   │   └── TemplateLibrary.js/css
│   ├── services/
│   │   ├── api.js
│   │   └── websocket.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
└── package.json
```

## Component Overview

### Header
- User profile display
- Level and XP progress bar
- Budget display
- Navigation links

### Dashboard
- Grid view of all root agents
- Statistics summary
- Quick agent creation

### AgentView
- Detailed agent information
- Child agent management
- Execution logs
- Action buttons (Start, Complete, Spawn Child)

### AgentCard
- Compact agent display
- Status indicators
- Budget visualization
- Quick metrics

### CreateAgentModal
- Agent creation form
- Template selection
- Budget configuration

### TemplateLibrary
- Browse available templates
- Template details and descriptions
- Usage instructions

## Styling

The app uses a purple gradient theme with:
- Primary color: #667eea to #764ba2
- Clean, modern UI components
- Responsive design for mobile and desktop
- Smooth transitions and hover effects

## API Integration

The frontend communicates with the backend via:
- REST API for CRUD operations
- WebSocket for real-time updates

See `src/services/api.js` for available API methods.

## Future Enhancements

- Dark mode support
- Advanced agent visualization (tree/graph view)
- Agent comparison tools
- Export/import agent configurations
- Collaborative features
- Mobile app version
