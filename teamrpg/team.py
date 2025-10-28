"""
Team module for managing teams of personas.

This module handles the creation and management of teams.
"""

import json
import uuid
from typing import Dict, List, Optional
from datetime import datetime


class Team:
    """Represents a team of personas working together."""
    
    def __init__(
        self,
        name: str,
        description: str,
        team_id: Optional[str] = None
    ):
        """
        Initialize a new Team.
        
        Args:
            name: The team's name
            description: Description of the team's purpose
            team_id: Optional unique identifier (generated if not provided)
        """
        self.id = team_id or str(uuid.uuid4())
        self.name = name
        self.description = description
        self.member_ids: List[str] = []
        self.project_ids: List[str] = []
        self.created_at = datetime.now().isoformat()
    
    def add_member(self, persona_id: str) -> None:
        """Add a persona to the team."""
        if persona_id not in self.member_ids:
            self.member_ids.append(persona_id)
    
    def remove_member(self, persona_id: str) -> bool:
        """Remove a persona from the team."""
        if persona_id in self.member_ids:
            self.member_ids.remove(persona_id)
            return True
        return False
    
    def assign_project(self, project_id: str) -> None:
        """Assign a project to the team."""
        if project_id not in self.project_ids:
            self.project_ids.append(project_id)
    
    def to_dict(self) -> Dict:
        """Convert team to dictionary representation."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "member_ids": self.member_ids,
            "project_ids": self.project_ids,
            "created_at": self.created_at
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Team':
        """Create a Team from dictionary representation."""
        team = cls(
            name=data["name"],
            description=data["description"],
            team_id=data.get("id")
        )
        team.member_ids = data.get("member_ids", [])
        team.project_ids = data.get("project_ids", [])
        team.created_at = data.get("created_at", datetime.now().isoformat())
        return team


class TeamManager:
    """Manages a collection of teams."""
    
    def __init__(self):
        """Initialize the TeamManager."""
        self.teams: Dict[str, Team] = {}
    
    def create_team(self, name: str, description: str) -> Team:
        """Create and register a new team."""
        team = Team(name, description)
        self.teams[team.id] = team
        return team
    
    def get_team(self, team_id: str) -> Optional[Team]:
        """Get a team by ID."""
        return self.teams.get(team_id)
    
    def get_team_by_name(self, name: str) -> Optional[Team]:
        """Get a team by name."""
        for team in self.teams.values():
            if team.name == name:
                return team
        return None
    
    def list_teams(self) -> List[Team]:
        """List all teams."""
        return list(self.teams.values())
    
    def delete_team(self, team_id: str) -> bool:
        """Delete a team by ID."""
        if team_id in self.teams:
            del self.teams[team_id]
            return True
        return False
    
    def save_to_file(self, filename: str) -> None:
        """Save all teams to a JSON file."""
        data = {
            "teams": [t.to_dict() for t in self.teams.values()]
        }
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
    
    def load_from_file(self, filename: str) -> None:
        """Load teams from a JSON file."""
        try:
            with open(filename, 'r') as f:
                data = json.load(f)
            for team_data in data.get("teams", []):
                team = Team.from_dict(team_data)
                self.teams[team.id] = team
        except FileNotFoundError:
            pass  # No file to load yet
