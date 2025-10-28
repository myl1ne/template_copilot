"""
Simulator module for running the workplace simulation.

This module implements the execution loop where agents read context,
make decisions, and interact with each other.
"""

import time
from typing import Optional, List, Dict
from .persona import PersonaManager, Persona
from .team import TeamManager, Team
from .project import ProjectManager, Project
from .messaging import MessagingSystem, Channel
from .ai_agent import AIAgent


class WorkplaceSimulator:
    """Main simulator that orchestrates the workplace interactions."""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the WorkplaceSimulator.
        
        Args:
            api_key: OpenAI API key (uses env var if not provided)
        """
        self.persona_manager = PersonaManager()
        self.team_manager = TeamManager()
        self.project_manager = ProjectManager()
        self.messaging_system = MessagingSystem()
        self.ai_agent = AIAgent(api_key)
        self.running = False
    
    def save_state(self, directory: str = "data") -> None:
        """Save the current state of the simulation."""
        import os
        os.makedirs(directory, exist_ok=True)
        self.persona_manager.save_to_file(f"{directory}/personas.json")
        self.team_manager.save_to_file(f"{directory}/teams.json")
        self.project_manager.save_to_file(f"{directory}/projects.json")
        self.messaging_system.save_to_file(f"{directory}/channels.json")
    
    def load_state(self, directory: str = "data") -> None:
        """Load a previously saved state."""
        self.persona_manager.load_from_file(f"{directory}/personas.json")
        self.team_manager.load_from_file(f"{directory}/teams.json")
        self.project_manager.load_from_file(f"{directory}/projects.json")
        self.messaging_system.load_from_file(f"{directory}/channels.json")
    
    def get_persona_context(self, persona: Persona) -> str:
        """
        Build context for a persona including their teams, projects, and recent messages.
        
        Args:
            persona: The persona to build context for
            
        Returns:
            Context string
        """
        context_parts = [f"You are {persona.name}, a {persona.role}."]
        
        # Find teams the persona is part of
        teams = [team for team in self.team_manager.list_teams() 
                if persona.id in team.member_ids]
        if teams:
            team_names = [team.name for team in teams]
            context_parts.append(f"You are part of the following teams: {', '.join(team_names)}")
        
        # Find assigned projects
        projects = []
        for team in teams:
            for project_id in team.project_ids:
                project = self.project_manager.get_project(project_id)
                if project and project not in projects:
                    projects.append(project)
        
        if projects:
            context_parts.append("\nYour team's projects:")
            for project in projects:
                context_parts.append(f"- {project.name}: {project.description}")
                if project.updates:
                    recent_update = project.updates[-1]
                    context_parts.append(f"  Latest update: {recent_update['content']}")
        
        # Get recent messages from channels
        channels = self.messaging_system.get_channels_for_persona(persona.id)
        if channels:
            context_parts.append("\nRecent messages from your channels:")
            for channel in channels:
                recent_msgs = channel.get_recent_messages(limit=5)
                if recent_msgs:
                    context_parts.append(f"\n#{channel.name}:")
                    for msg in recent_msgs:
                        author = self.persona_manager.get_persona(msg.author_id)
                        author_name = author.name if author else "Unknown"
                        context_parts.append(f"  {author_name}: {msg.content}")
        
        return "\n".join(context_parts)
    
    def persona_tick(self, persona: Persona) -> Dict[str, str]:
        """
        Execute one tick for a persona - they read context and decide on an action.
        
        Args:
            persona: The persona to execute
            
        Returns:
            Dictionary with action type and result
        """
        # Get current context
        context = self.get_persona_context(persona)
        persona.add_context(context)
        
        # Define available actions
        available_actions = [
            "Check messages and respond if needed",
            "Post a project update",
            "Send a message to team channel",
            "Take a break (no action)"
        ]
        
        # Have AI decide what to do
        system_prompt = persona.get_system_prompt()
        chosen_action = self.ai_agent.decide_action(
            system_prompt,
            context,
            available_actions
        )
        
        result = {"action": chosen_action, "result": ""}
        
        # Execute the chosen action
        if "respond" in chosen_action.lower() or "message" in chosen_action.lower():
            # Send a message to a team channel
            channels = self.messaging_system.get_channels_for_persona(persona.id)
            if channels:
                channel = channels[0]  # Pick first channel
                # Generate message based on recent context
                recent_msgs = channel.get_recent_messages(limit=3)
                msg_context = []
                for msg in recent_msgs:
                    author = self.persona_manager.get_persona(msg.author_id)
                    msg_context.append({
                        "role": "user",
                        "content": f"{author.name if author else 'Unknown'}: {msg.content}"
                    })
                
                if msg_context:
                    response = self.ai_agent.generate_response(
                        system_prompt,
                        msg_context,
                        "Please respond to the conversation or share your thoughts."
                    )
                else:
                    response = self.ai_agent.generate_response(
                        system_prompt,
                        [],
                        "Share a brief update or thought with your team."
                    )
                
                channel.post_message(response, persona.id)
                result["result"] = f"Posted to #{channel.name}: {response}"
        
        elif "project update" in chosen_action.lower():
            # Post a project update
            teams = [team for team in self.team_manager.list_teams() 
                    if persona.id in team.member_ids]
            if teams and teams[0].project_ids:
                project_id = teams[0].project_ids[0]
                project = self.project_manager.get_project(project_id)
                if project:
                    previous_updates = [u["content"] for u in project.updates]
                    update = self.ai_agent.generate_work_update(
                        system_prompt,
                        f"{project.name}: {project.description}",
                        previous_updates
                    )
                    project.add_update(update, persona.id)
                    result["result"] = f"Updated project '{project.name}': {update}"
        
        elif "break" in chosen_action.lower():
            result["result"] = "Taking a break"
        
        return result
    
    def run_simulation(self, cycles: int = 5, delay: float = 1.0) -> None:
        """
        Run the simulation for a specified number of cycles.
        
        Args:
            cycles: Number of simulation cycles to run
            delay: Delay in seconds between cycles
        """
        print(f"Starting simulation for {cycles} cycles...")
        print("=" * 60)
        
        for cycle in range(cycles):
            print(f"\n--- Cycle {cycle + 1}/{cycles} ---")
            
            personas = self.persona_manager.list_personas()
            if not personas:
                print("No personas available. Please create some first.")
                break
            
            for persona in personas:
                print(f"\n{persona.name} ({persona.role}):")
                result = self.persona_tick(persona)
                print(f"  Action: {result['action']}")
                if result['result']:
                    print(f"  Result: {result['result']}")
            
            if cycle < cycles - 1:
                time.sleep(delay)
        
        print("\n" + "=" * 60)
        print("Simulation complete!")
        self.save_state()
        print("State saved to data/ directory")
