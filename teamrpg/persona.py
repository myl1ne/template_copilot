"""
Persona module for managing AI personas.

This module handles the creation and management of AI personas
that will participate in the workplace simulator.
"""

import json
import uuid
from typing import Dict, List, Optional
from datetime import datetime


class Persona:
    """Represents an AI persona with specific characteristics and role."""
    
    def __init__(
        self,
        name: str,
        role: str,
        personality: str,
        skills: List[str],
        persona_id: Optional[str] = None
    ):
        """
        Initialize a new Persona.
        
        Args:
            name: The persona's name
            role: The persona's role (e.g., "Developer", "Designer", "Manager")
            personality: Description of personality traits
            skills: List of skills the persona has
            persona_id: Optional unique identifier (generated if not provided)
        """
        self.id = persona_id or str(uuid.uuid4())
        self.name = name
        self.role = role
        self.personality = personality
        self.skills = skills
        self.created_at = datetime.now().isoformat()
        self.context_memory: List[str] = []
    
    def add_context(self, context: str) -> None:
        """Add context to the persona's memory."""
        self.context_memory.append({
            "timestamp": datetime.now().isoformat(),
            "content": context
        })
    
    def get_system_prompt(self) -> str:
        """Generate a system prompt for this persona."""
        return f"""You are {self.name}, a {self.role}.
Personality: {self.personality}
Skills: {', '.join(self.skills)}

You are working in a team environment. Communicate professionally and collaborate effectively."""
    
    def to_dict(self) -> Dict:
        """Convert persona to dictionary representation."""
        return {
            "id": self.id,
            "name": self.name,
            "role": self.role,
            "personality": self.personality,
            "skills": self.skills,
            "created_at": self.created_at,
            "context_memory": self.context_memory
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Persona':
        """Create a Persona from dictionary representation."""
        persona = cls(
            name=data["name"],
            role=data["role"],
            personality=data["personality"],
            skills=data["skills"],
            persona_id=data.get("id")
        )
        persona.created_at = data.get("created_at", datetime.now().isoformat())
        persona.context_memory = data.get("context_memory", [])
        return persona


class PersonaManager:
    """Manages a collection of personas."""
    
    def __init__(self):
        """Initialize the PersonaManager."""
        self.personas: Dict[str, Persona] = {}
    
    def create_persona(
        self,
        name: str,
        role: str,
        personality: str,
        skills: List[str]
    ) -> Persona:
        """Create and register a new persona."""
        persona = Persona(name, role, personality, skills)
        self.personas[persona.id] = persona
        return persona
    
    def get_persona(self, persona_id: str) -> Optional[Persona]:
        """Get a persona by ID."""
        return self.personas.get(persona_id)
    
    def get_persona_by_name(self, name: str) -> Optional[Persona]:
        """Get a persona by name."""
        for persona in self.personas.values():
            if persona.name == name:
                return persona
        return None
    
    def list_personas(self) -> List[Persona]:
        """List all personas."""
        return list(self.personas.values())
    
    def delete_persona(self, persona_id: str) -> bool:
        """Delete a persona by ID."""
        if persona_id in self.personas:
            del self.personas[persona_id]
            return True
        return False
    
    def save_to_file(self, filename: str) -> None:
        """Save all personas to a JSON file."""
        data = {
            "personas": [p.to_dict() for p in self.personas.values()]
        }
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
    
    def load_from_file(self, filename: str) -> None:
        """Load personas from a JSON file."""
        try:
            with open(filename, 'r') as f:
                data = json.load(f)
            for persona_data in data.get("personas", []):
                persona = Persona.from_dict(persona_data)
                self.personas[persona.id] = persona
        except FileNotFoundError:
            pass  # No file to load yet
