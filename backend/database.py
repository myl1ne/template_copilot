"""
Firebase Firestore database service.
"""
import os
import firebase_admin
from firebase_admin import credentials, firestore
from typing import Optional, List, Dict, Any
from datetime import datetime
from config import settings
from models import Agent, User, AgentTemplate, ExecutionLog, Achievement


class DatabaseService:
    """Service for interacting with Firestore database."""
    
    def __init__(self):
        """Initialize Firebase connection."""
        self.db: Optional[firestore.client] = None
        self._initialized = False
    
    def initialize(self):
        """Initialize Firebase Admin SDK."""
        if self._initialized:
            return
        
        try:
            # Check if Firebase is already initialized
            firebase_admin.get_app()
        except ValueError:
            # Initialize Firebase
            if os.path.exists(settings.firebase_credentials_path):
                cred = credentials.Certificate(settings.firebase_credentials_path)
                firebase_admin.initialize_app(cred)
            else:
                # For development without credentials, use a mock or fail gracefully
                print("Warning: Firebase credentials not found. Running in demo mode.")
                # You could initialize with application default credentials in production
                # firebase_admin.initialize_app()
        
        self.db = firestore.client()
        self._initialized = True
    
    # Agent Operations
    async def create_agent(self, agent: Agent) -> Agent:
        """Create a new agent in the database."""
        agent_dict = agent.model_dump(mode='json')
        agent_dict['created_at'] = datetime.utcnow()
        agent_dict['updated_at'] = datetime.utcnow()
        
        self.db.collection('agents').document(agent.id).set(agent_dict)
        return agent
    
    async def get_agent(self, agent_id: str) -> Optional[Agent]:
        """Retrieve an agent by ID."""
        doc = self.db.collection('agents').document(agent_id).get()
        if doc.exists:
            return Agent(**doc.to_dict())
        return None
    
    async def update_agent(self, agent_id: str, updates: Dict[str, Any]) -> Optional[Agent]:
        """Update an agent's fields."""
        updates['updated_at'] = datetime.utcnow()
        self.db.collection('agents').document(agent_id).update(updates)
        return await self.get_agent(agent_id)
    
    async def delete_agent(self, agent_id: str) -> bool:
        """Delete an agent."""
        self.db.collection('agents').document(agent_id).delete()
        return True
    
    async def get_agents_by_user(self, user_id: str, parent_id: Optional[str] = None) -> List[Agent]:
        """Get all agents for a user, optionally filtered by parent."""
        query = self.db.collection('agents').where('user_id', '==', user_id)
        
        if parent_id is not None:
            query = query.where('parent_id', '==', parent_id)
        
        docs = query.stream()
        return [Agent(**doc.to_dict()) for doc in docs]
    
    async def get_agent_children(self, agent_id: str) -> List[Agent]:
        """Get all child agents of a specific agent."""
        docs = self.db.collection('agents').where('parent_id', '==', agent_id).stream()
        return [Agent(**doc.to_dict()) for doc in docs]
    
    # User Operations
    async def create_user(self, user: User) -> User:
        """Create a new user."""
        user_dict = user.model_dump(mode='json')
        self.db.collection('users').document(user.id).set(user_dict)
        return user
    
    async def get_user(self, user_id: str) -> Optional[User]:
        """Retrieve a user by ID."""
        doc = self.db.collection('users').document(user_id).get()
        if doc.exists:
            return User(**doc.to_dict())
        return None
    
    async def update_user(self, user_id: str, updates: Dict[str, Any]) -> Optional[User]:
        """Update a user's fields."""
        updates['last_active'] = datetime.utcnow()
        self.db.collection('users').document(user_id).update(updates)
        return await self.get_user(user_id)
    
    async def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        docs = self.db.collection('users').where('username', '==', username).limit(1).stream()
        for doc in docs:
            return User(**doc.to_dict())
        return None
    
    # Template Operations
    async def create_template(self, template: AgentTemplate) -> AgentTemplate:
        """Create a new agent template."""
        template_dict = template.model_dump(mode='json')
        self.db.collection('templates').document(template.id).set(template_dict)
        return template
    
    async def get_template(self, template_id: str) -> Optional[AgentTemplate]:
        """Retrieve a template by ID."""
        doc = self.db.collection('templates').document(template_id).get()
        if doc.exists:
            return AgentTemplate(**doc.to_dict())
        return None
    
    async def get_all_templates(self) -> List[AgentTemplate]:
        """Get all agent templates."""
        docs = self.db.collection('templates').stream()
        return [AgentTemplate(**doc.to_dict()) for doc in docs]
    
    async def get_templates_by_level(self, max_level: int) -> List[AgentTemplate]:
        """Get templates unlocked at or below a certain level."""
        docs = self.db.collection('templates').where('unlock_level', '<=', max_level).stream()
        return [AgentTemplate(**doc.to_dict()) for doc in docs]
    
    # Execution Log Operations
    async def create_log(self, log: ExecutionLog) -> ExecutionLog:
        """Create an execution log entry."""
        log_dict = log.model_dump(mode='json')
        self.db.collection('logs').document(log.id).set(log_dict)
        return log
    
    async def get_agent_logs(self, agent_id: str, limit: int = 100) -> List[ExecutionLog]:
        """Get execution logs for an agent."""
        docs = self.db.collection('logs')\
            .where('agent_id', '==', agent_id)\
            .order_by('timestamp', direction=firestore.Query.DESCENDING)\
            .limit(limit)\
            .stream()
        return [ExecutionLog(**doc.to_dict()) for doc in docs]
    
    # Achievement Operations
    async def get_all_achievements(self) -> List[Achievement]:
        """Get all available achievements."""
        docs = self.db.collection('achievements').stream()
        return [Achievement(**doc.to_dict()) for doc in docs]


# Global database service instance
db_service = DatabaseService()
