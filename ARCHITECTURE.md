# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐     │
│  │  Dashboard   │  │  Agent View  │  │ Template Library  │     │
│  │              │  │              │  │                   │     │
│  │ - Agent List │  │ - Details    │  │ - Browse          │     │
│  │ - Stats      │  │ - Logs       │  │ - Descriptions    │     │
│  │ - Create New │  │ - Children   │  │ - Use Templates   │     │
│  └──────────────┘  └──────────────┘  └───────────────────┘     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              Header (User Stats & Navigation)          │     │
│  │  Level: 1  |  Budget: ⚡1000  |  XP Progress Bar      │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API + WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI + Python)                    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │                    FastAPI Router                       │     │
│  │                                                          │     │
│  │  /api/agents     - CRUD operations                     │     │
│  │  /api/users      - User management                     │     │
│  │  /api/templates  - Template library                    │     │
│  │  /ws             - WebSocket real-time updates         │     │
│  └────────────────────────────────────────────────────────┘     │
│                              │                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │  Agent Engine   │  │ Database Service│  │ Config Manager │  │
│  │                 │  │                 │  │                │  │
│  │ - Lifecycle     │  │ - Firestore     │  │ - Settings     │  │
│  │ - Spawning      │  │ - In-Memory     │  │ - Environment  │  │
│  │ - Budget Track  │  │ - CRUD Ops      │  │                │  │
│  └─────────────────┘  └─────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Firestore API (optional)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Firebase Firestore (Optional)                  │
│                                                                   │
│  Collections:                                                    │
│  - agents        - Agent documents with hierarchy                │
│  - users         - User profiles and progression                 │
│  - templates     - Agent templates                               │
│  - logs          - Execution logs                                │
│  - achievements  - Achievement definitions                       │
│                                                                   │
│  * Demo Mode: Uses in-memory storage if Firebase not configured │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Creating an Agent

```
User Input (Frontend)
    │
    │ 1. Fill agent creation form
    │    (name, prompt, template, budget)
    ▼
Dashboard Component
    │
    │ 2. Call API service
    ▼
API Service (axios)
    │
    │ 3. POST /api/agents
    ▼
FastAPI Backend
    │
    │ 4. Validate request
    ▼
Agent Engine
    │
    │ 5. Create agent object
    │    - Assign ID
    │    - Set budget
    │    - Initialize status
    ▼
Database Service
    │
    │ 6. Store in database
    │    (Firestore or in-memory)
    ▼
WebSocket Broadcast
    │
    │ 7. Notify all connected clients
    ▼
Frontend Updates
    │
    │ 8. Update UI with new agent
    ▼
User sees new agent in dashboard
```

### Agent Hierarchy Flow

```
Root Agent (Level 0)
    │
    │ Spawns child agents for subtasks
    │
    ├─→ Child Agent A (Level 1)
    │       │
    │       │ Budget: Portion of parent's budget
    │       │
    │       └─→ Grandchild Agent A1 (Level 2)
    │               │
    │               └─→ ... (up to depth 5)
    │
    └─→ Child Agent B (Level 1)
            │
            └─→ Grandchild Agent B1 (Level 2)

Budget Flow:
- Parent allocates budget to children
- Children cannot exceed parent's remaining budget
- Budget consumption tracked at all levels
```

## Component Relationships

### Frontend Components

```
App
├── Header (always visible)
│   ├── Logo & Navigation
│   └── User Stats (Level, Budget, XP)
│
└── Routes
    ├── Dashboard
    │   ├── Agent Grid
    │   │   └── AgentCard (for each agent)
    │   └── Statistics Panel
    │
    ├── AgentView
    │   ├── Agent Details
    │   ├── Action Buttons
    │   ├── Child Agents Grid
    │   └── Execution Logs
    │
    └── TemplateLibrary
        └── Template Cards

Modals (overlays):
└── CreateAgentModal
    ├── Form Fields
    └── Template Selector
```

### Backend Services

```
Main FastAPI App
│
├── Routers (API Endpoints)
│   ├── Agent endpoints
│   ├── User endpoints
│   ├── Template endpoints
│   └── WebSocket endpoint
│
├── Services
│   ├── AgentEngine
│   │   ├── create_agent()
│   │   ├── start_agent()
│   │   ├── spawn_child_agent()
│   │   └── complete_agent()
│   │
│   └── DatabaseService
│       ├── Firestore operations
│       └── In-memory fallback
│
└── Models (Pydantic)
    ├── Agent
    ├── User
    ├── AgentTemplate
    ├── ExecutionLog
    └── Achievement
```

## Key Features

### 1. Real-time Updates
- WebSocket connection for live agent status
- Broadcasts on agent creation, start, completion
- Frontend automatically updates UI

### 2. Nested Agent Hierarchy
- Agents spawn children up to 5 levels deep
- Parent-child relationships tracked
- Budget allocated from parent to child

### 3. Computation Budget
- Each agent has a budget allocation
- Budget consumed during processing
- User gains more budget by leveling up

### 4. Gamification
- Experience points (XP) for completing agents
- Level progression system
- Achievement unlocks
- Template unlocks at higher levels

### 5. Template System
- Pre-configured agent types
- Specialized system prompts
- Default budget allocations
- Custom agents also supported

## Technology Stack

**Frontend:**
- React 18 - UI framework
- React Router - Navigation
- Axios - HTTP client
- WebSocket API - Real-time updates
- CSS3 - Styling with gradients

**Backend:**
- FastAPI - Web framework
- Pydantic - Data validation
- Firebase Admin SDK - Firestore client
- Uvicorn - ASGI server
- Python 3.9+ - Language

**Database:**
- Firebase Firestore - Primary (optional)
- In-memory dict - Demo mode fallback

## Deployment Architecture (Future)

```
┌──────────────────┐
│   Users/Clients  │
└────────┬─────────┘
         │
         │ HTTPS
         ▼
┌────────────────────┐
│  Reverse Proxy     │
│  (nginx/caddy)     │
└────────┬───────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌─────────┐
│Frontend │ │Backend  │
│(Static) │ │(Uvicorn)│
└─────────┘ └────┬────┘
                 │
                 ▼
         ┌───────────────┐
         │   Firestore   │
         └───────────────┘
```

## Security Considerations (Future)

- [ ] Authentication (JWT tokens)
- [ ] API rate limiting
- [ ] Input validation and sanitization
- [ ] CORS configuration for production
- [ ] HTTPS enforcement
- [ ] Firebase security rules
- [ ] User data isolation

---

This architecture provides a solid foundation for the gamified LLM research platform, with room for expansion and enhancement in future versions.
