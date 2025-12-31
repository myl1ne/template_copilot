"""
Data models for the gamified LLM research platform.
"""
from enum import Enum
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class AgentStatus(str, Enum):
    """Status of an agent in its lifecycle."""
    CREATED = "created"
    RUNNING = "running"
    WAITING = "waiting"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"


class AgentType(str, Enum):
    """Types of agent templates available."""
    CUSTOM = "custom"
    AUDITOR = "auditor"
    ETHICAL_COMMITTEE = "ethical_committee"
    CRITICAL_THINKER = "critical_thinker"
    RESEARCHER = "researcher"
    SUMMARIZER = "summarizer"
    VALIDATOR = "validator"


class AgentTemplate(BaseModel):
    """Template for creating specialized agents."""
    id: str
    name: str
    type: AgentType
    description: str
    system_prompt: str
    default_budget: int = 100
    icon: str = "🤖"
    color: str = "#3B82F6"
    unlock_level: int = 1


class Agent(BaseModel):
    """An AI agent that can spawn sub-agents and process tasks."""
    id: str
    user_id: str
    parent_id: Optional[str] = None
    name: str
    type: AgentType
    prompt: str
    system_prompt: str
    status: AgentStatus = AgentStatus.CREATED
    computation_budget: int
    budget_used: int = 0
    depth: int = 0
    children_ids: List[str] = Field(default_factory=list)
    context: List[Dict[str, Any]] = Field(default_factory=list)
    result: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AgentCreate(BaseModel):
    """Request model for creating a new agent."""
    name: str
    prompt: str
    type: AgentType = AgentType.CUSTOM
    template_id: Optional[str] = None
    parent_id: Optional[str] = None
    computation_budget: Optional[int] = None


class AgentUpdate(BaseModel):
    """Request model for updating an agent."""
    status: Optional[AgentStatus] = None
    budget_used: Optional[int] = None
    result: Optional[str] = None
    context: Optional[List[Dict[str, Any]]] = None


class User(BaseModel):
    """User profile with game progression."""
    id: str
    username: str
    email: str
    total_budget: int = 1000
    available_budget: int = 1000
    level: int = 1
    experience: int = 0
    agents_created: int = 0
    agents_completed: int = 0
    total_computations: int = 0
    achievements: List[str] = Field(default_factory=list)
    unlocked_templates: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_active: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(BaseModel):
    """Request model for creating a new user."""
    username: str
    email: str


class ExecutionLog(BaseModel):
    """Log entry for agent execution steps."""
    id: str
    agent_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    event_type: str
    message: str
    data: Dict[str, Any] = Field(default_factory=dict)


class Achievement(BaseModel):
    """Achievement definition."""
    id: str
    name: str
    description: str
    icon: str
    requirement: str
    reward_xp: int
    reward_budget: int = 0
