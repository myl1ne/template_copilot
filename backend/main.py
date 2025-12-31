"""
FastAPI application for the gamified LLM research platform.
"""
import uuid
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from contextlib import asynccontextmanager

from models import (
    Agent, AgentCreate, AgentUpdate, User, UserCreate,
    AgentTemplate, ExecutionLog, Achievement, AgentStatus
)
from database import db_service
from engine import agent_engine
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for the FastAPI application."""
    # Startup
    db_service.initialize()
    await initialize_templates()
    await initialize_achievements()
    yield
    # Shutdown
    pass


app = FastAPI(
    title="Gamified LLM Research Platform",
    description="A platform for creating and managing nested AI agents with gamification",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass


manager = ConnectionManager()


# Health check
@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "online",
        "service": "Gamified LLM Research Platform",
        "version": "0.1.0"
    }


# User endpoints
@app.post("/api/users", response_model=User)
async def create_user(user_data: UserCreate):
    """Create a new user."""
    # Check if username exists
    existing = await db_service.get_user_by_username(user_data.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user = User(
        id=str(uuid.uuid4()),
        username=user_data.username,
        email=user_data.email
    )
    return await db_service.create_user(user)


@app.get("/api/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get user by ID."""
    user = await db_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.get("/api/users/username/{username}", response_model=User)
async def get_user_by_username(username: str):
    """Get user by username."""
    user = await db_service.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# Agent endpoints
@app.post("/api/agents", response_model=Agent)
async def create_agent(agent_data: AgentCreate):
    """Create a new agent."""
    try:
        # Get template if specified
        system_prompt = ""
        if agent_data.template_id:
            template = await db_service.get_template(agent_data.template_id)
            if template:
                system_prompt = template.system_prompt
                if agent_data.computation_budget is None:
                    agent_data.computation_budget = template.default_budget
        
        # For demo purposes, use a default user_id if not authenticated
        # In production, this would come from authentication
        user_id = "demo-user"
        
        agent = await agent_engine.create_agent(
            user_id=user_id,
            name=agent_data.name,
            prompt=agent_data.prompt,
            agent_type=agent_data.type,
            system_prompt=system_prompt,
            parent_id=agent_data.parent_id,
            computation_budget=agent_data.computation_budget
        )
        
        # Broadcast creation
        await manager.broadcast({
            "type": "agent_created",
            "agent_id": agent.id,
            "name": agent.name
        })
        
        return agent
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/agents/{agent_id}", response_model=Agent)
async def get_agent(agent_id: str):
    """Get agent by ID."""
    agent = await db_service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@app.get("/api/agents", response_model=List[Agent])
async def list_agents(user_id: str = "demo-user", parent_id: Optional[str] = None):
    """List agents for a user, optionally filtered by parent."""
    return await db_service.get_agents_by_user(user_id, parent_id)


@app.get("/api/agents/{agent_id}/children", response_model=List[Agent])
async def get_agent_children(agent_id: str):
    """Get all children of an agent."""
    return await db_service.get_agent_children(agent_id)


@app.post("/api/agents/{agent_id}/start", response_model=Agent)
async def start_agent(agent_id: str):
    """Start an agent's execution."""
    try:
        agent = await agent_engine.start_agent(agent_id)
        await manager.broadcast({
            "type": "agent_started",
            "agent_id": agent.id,
            "status": agent.status.value
        })
        return agent
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/agents/{agent_id}/complete", response_model=Agent)
async def complete_agent(agent_id: str, result: str):
    """Mark an agent as completed."""
    await agent_engine.complete_agent(agent_id, result)
    agent = await db_service.get_agent(agent_id)
    
    await manager.broadcast({
        "type": "agent_completed",
        "agent_id": agent_id,
        "status": AgentStatus.COMPLETED.value
    })
    
    return agent


@app.get("/api/agents/{agent_id}/logs", response_model=List[ExecutionLog])
async def get_agent_logs(agent_id: str, limit: int = 100):
    """Get execution logs for an agent."""
    return await db_service.get_agent_logs(agent_id, limit)


# Template endpoints
@app.get("/api/templates", response_model=List[AgentTemplate])
async def list_templates():
    """List all available agent templates."""
    return await db_service.get_all_templates()


@app.get("/api/templates/{template_id}", response_model=AgentTemplate)
async def get_template(template_id: str):
    """Get a specific template."""
    template = await db_service.get_template(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@app.get("/api/templates/level/{level}", response_model=List[AgentTemplate])
async def get_templates_by_level(level: int):
    """Get templates available at a specific level."""
    return await db_service.get_templates_by_level(level)


# Achievement endpoints
@app.get("/api/achievements", response_model=List[Achievement])
async def list_achievements():
    """List all achievements."""
    return await db_service.get_all_achievements()


# WebSocket endpoint for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time agent updates."""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# Initialization functions
async def initialize_templates():
    """Initialize default agent templates."""
    templates = [
        AgentTemplate(
            id="auditor",
            name="Auditor",
            type="auditor",
            description="Reviews and verifies outputs for accuracy",
            system_prompt="You are an auditing agent. Review and verify the outputs of other agents for accuracy and consistency.",
            default_budget=150,
            icon="🔍",
            color="#EF4444",
            unlock_level=1
        ),
        AgentTemplate(
            id="ethical",
            name="Ethical Committee",
            type="ethical_committee",
            description="Evaluates ethical implications",
            system_prompt="You are an ethical review agent. Evaluate decisions and outputs for ethical implications and potential concerns.",
            default_budget=200,
            icon="⚖️",
            color="#8B5CF6",
            unlock_level=2
        ),
        AgentTemplate(
            id="critical",
            name="Critical Thinker",
            type="critical_thinker",
            description="Analyzes arguments and identifies flaws",
            system_prompt="You are a critical thinking agent. Analyze arguments, identify logical flaws, and challenge assumptions.",
            default_budget=150,
            icon="🧠",
            color="#F59E0B",
            unlock_level=1
        ),
        AgentTemplate(
            id="researcher",
            name="Researcher",
            type="researcher",
            description="Gathers and synthesizes information",
            system_prompt="You are a research agent. Gather information, synthesize findings, and provide comprehensive analysis.",
            default_budget=250,
            icon="📚",
            color="#10B981",
            unlock_level=3
        ),
        AgentTemplate(
            id="summarizer",
            name="Summarizer",
            type="summarizer",
            description="Condenses complex information",
            system_prompt="You are a summarization agent. Condense complex information into clear, concise summaries.",
            default_budget=100,
            icon="📝",
            color="#3B82F6",
            unlock_level=1
        ),
    ]
    
    for template in templates:
        existing = await db_service.get_template(template.id)
        if not existing:
            await db_service.create_template(template)


async def initialize_achievements():
    """Initialize achievements."""
    achievements = [
        Achievement(
            id="first_agent",
            name="First Steps",
            description="Create your first agent",
            icon="🌟",
            requirement="Create 1 agent",
            reward_xp=100,
            reward_budget=100
        ),
        Achievement(
            id="nested_master",
            name="Nested Master",
            description="Create an agent hierarchy 3 levels deep",
            icon="🏗️",
            requirement="Create agents 3 levels deep",
            reward_xp=500,
            reward_budget=500
        ),
        Achievement(
            id="efficiency_expert",
            name="Efficiency Expert",
            description="Complete an agent using less than 50% budget",
            icon="⚡",
            requirement="Complete agent with <50% budget used",
            reward_xp=250,
            reward_budget=250
        ),
    ]
    
    for achievement in achievements:
        # Check if exists (simplified for demo)
        pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload
    )
