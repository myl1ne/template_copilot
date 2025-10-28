"""
Project module for managing projects assigned to teams.

This module handles the creation and management of projects.
"""

import json
import uuid
from typing import Dict, List, Optional
from datetime import datetime


class Project:
    """Represents a project that can be assigned to teams."""
    
    def __init__(
        self,
        name: str,
        description: str,
        goals: List[str],
        project_id: Optional[str] = None
    ):
        """
        Initialize a new Project.
        
        Args:
            name: The project's name
            description: Description of the project
            goals: List of project goals/objectives
            project_id: Optional unique identifier (generated if not provided)
        """
        self.id = project_id or str(uuid.uuid4())
        self.name = name
        self.description = description
        self.goals = goals
        self.status = "active"  # active, completed, on_hold
        self.created_at = datetime.now().isoformat()
        self.updates: List[Dict] = []
    
    def add_update(self, update: str, author_id: str) -> None:
        """Add a progress update to the project."""
        self.updates.append({
            "timestamp": datetime.now().isoformat(),
            "author_id": author_id,
            "content": update
        })
    
    def to_dict(self) -> Dict:
        """Convert project to dictionary representation."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "goals": self.goals,
            "status": self.status,
            "created_at": self.created_at,
            "updates": self.updates
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Project':
        """Create a Project from dictionary representation."""
        project = cls(
            name=data["name"],
            description=data["description"],
            goals=data["goals"],
            project_id=data.get("id")
        )
        project.status = data.get("status", "active")
        project.created_at = data.get("created_at", datetime.now().isoformat())
        project.updates = data.get("updates", [])
        return project


class ProjectManager:
    """Manages a collection of projects."""
    
    def __init__(self):
        """Initialize the ProjectManager."""
        self.projects: Dict[str, Project] = {}
    
    def create_project(
        self,
        name: str,
        description: str,
        goals: List[str]
    ) -> Project:
        """Create and register a new project."""
        project = Project(name, description, goals)
        self.projects[project.id] = project
        return project
    
    def get_project(self, project_id: str) -> Optional[Project]:
        """Get a project by ID."""
        return self.projects.get(project_id)
    
    def get_project_by_name(self, name: str) -> Optional[Project]:
        """Get a project by name."""
        for project in self.projects.values():
            if project.name == name:
                return project
        return None
    
    def list_projects(self) -> List[Project]:
        """List all projects."""
        return list(self.projects.values())
    
    def delete_project(self, project_id: str) -> bool:
        """Delete a project by ID."""
        if project_id in self.projects:
            del self.projects[project_id]
            return True
        return False
    
    def save_to_file(self, filename: str) -> None:
        """Save all projects to a JSON file."""
        data = {
            "projects": [p.to_dict() for p in self.projects.values()]
        }
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
    
    def load_from_file(self, filename: str) -> None:
        """Load projects from a JSON file."""
        try:
            with open(filename, 'r') as f:
                data = json.load(f)
            for project_data in data.get("projects", []):
                project = Project.from_dict(project_data)
                self.projects[project.id] = project
        except FileNotFoundError:
            pass  # No file to load yet
