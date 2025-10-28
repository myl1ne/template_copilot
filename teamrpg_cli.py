#!/usr/bin/env python3
"""
TeamRPG Command Line Interface

Interactive CLI for managing the workplace simulator.
"""

import sys
import argparse
from teamrpg.simulator import WorkplaceSimulator
from teamrpg.persona import Persona


def create_persona_interactive(simulator: WorkplaceSimulator):
    """Interactively create a new persona."""
    print("\n=== Create New Persona ===")
    name = input("Name: ").strip()
    role = input("Role (e.g., Developer, Designer, Manager): ").strip()
    personality = input("Personality description: ").strip()
    skills_input = input("Skills (comma-separated): ").strip()
    skills = [s.strip() for s in skills_input.split(",")]
    
    persona = simulator.persona_manager.create_persona(name, role, personality, skills)
    print(f"\n✓ Created persona: {persona.name} (ID: {persona.id})")
    return persona


def create_team_interactive(simulator: WorkplaceSimulator):
    """Interactively create a new team."""
    print("\n=== Create New Team ===")
    name = input("Team name: ").strip()
    description = input("Team description: ").strip()
    
    team = simulator.team_manager.create_team(name, description)
    print(f"\n✓ Created team: {team.name} (ID: {team.id})")
    
    # Add members
    personas = simulator.persona_manager.list_personas()
    if personas:
        print("\nAvailable personas:")
        for i, p in enumerate(personas):
            print(f"  {i+1}. {p.name} ({p.role})")
        
        while True:
            choice = input("\nAdd persona to team (number, or 'done'): ").strip().lower()
            if choice == 'done':
                break
            try:
                idx = int(choice) - 1
                if 0 <= idx < len(personas):
                    team.add_member(personas[idx].id)
                    print(f"  ✓ Added {personas[idx].name}")
            except (ValueError, IndexError):
                print("  Invalid choice")
    
    return team


def create_project_interactive(simulator: WorkplaceSimulator):
    """Interactively create a new project."""
    print("\n=== Create New Project ===")
    name = input("Project name: ").strip()
    description = input("Project description: ").strip()
    goals_input = input("Goals (comma-separated): ").strip()
    goals = [g.strip() for g in goals_input.split(",")]
    
    project = simulator.project_manager.create_project(name, description, goals)
    print(f"\n✓ Created project: {project.name} (ID: {project.id})")
    
    # Assign to team
    teams = simulator.team_manager.list_teams()
    if teams:
        print("\nAvailable teams:")
        for i, t in enumerate(teams):
            print(f"  {i+1}. {t.name}")
        
        choice = input("\nAssign to team (number, or skip): ").strip()
        try:
            idx = int(choice) - 1
            if 0 <= idx < len(teams):
                teams[idx].assign_project(project.id)
                print(f"  ✓ Assigned to {teams[idx].name}")
        except (ValueError, IndexError):
            pass
    
    return project


def create_channel_interactive(simulator: WorkplaceSimulator):
    """Interactively create a new channel."""
    print("\n=== Create New Channel ===")
    name = input("Channel name: ").strip()
    description = input("Channel description: ").strip()
    channel_type = input("Type (public/private) [public]: ").strip() or "public"
    
    channel = simulator.messaging_system.create_channel(name, description, channel_type)
    print(f"\n✓ Created channel: #{channel.name} (ID: {channel.id})")
    
    # Add members
    personas = simulator.persona_manager.list_personas()
    if personas:
        print("\nAvailable personas:")
        for i, p in enumerate(personas):
            print(f"  {i+1}. {p.name} ({p.role})")
        
        while True:
            choice = input("\nAdd persona to channel (number, or 'done'): ").strip().lower()
            if choice == 'done':
                break
            try:
                idx = int(choice) - 1
                if 0 <= idx < len(personas):
                    channel.add_member(personas[idx].id)
                    print(f"  ✓ Added {personas[idx].name}")
            except (ValueError, IndexError):
                print("  Invalid choice")
    
    return channel


def list_entities(simulator: WorkplaceSimulator):
    """List all entities in the simulator."""
    print("\n=== Current State ===")
    
    personas = simulator.persona_manager.list_personas()
    print(f"\nPersonas ({len(personas)}):")
    for p in personas:
        print(f"  - {p.name} ({p.role})")
    
    teams = simulator.team_manager.list_teams()
    print(f"\nTeams ({len(teams)}):")
    for t in teams:
        members = [simulator.persona_manager.get_persona(pid) for pid in t.member_ids]
        member_names = [m.name for m in members if m]
        print(f"  - {t.name}: {', '.join(member_names) if member_names else 'No members'}")
    
    projects = simulator.project_manager.list_projects()
    print(f"\nProjects ({len(projects)}):")
    for p in projects:
        print(f"  - {p.name} ({p.status})")
    
    channels = simulator.messaging_system.list_channels()
    print(f"\nChannels ({len(channels)}):")
    for c in channels:
        print(f"  - #{c.name} ({len(c.member_ids)} members, {len(c.messages)} messages)")


def view_channel_messages(simulator: WorkplaceSimulator):
    """View messages in a channel."""
    channels = simulator.messaging_system.list_channels()
    if not channels:
        print("No channels available.")
        return
    
    print("\nAvailable channels:")
    for i, c in enumerate(channels):
        print(f"  {i+1}. #{c.name}")
    
    choice = input("\nSelect channel (number): ").strip()
    try:
        idx = int(choice) - 1
        if 0 <= idx < len(channels):
            channel = channels[idx]
            messages = channel.get_recent_messages(limit=20)
            print(f"\n=== #{channel.name} ===")
            for msg in messages:
                author = simulator.persona_manager.get_persona(msg.author_id)
                author_name = author.name if author else "Unknown"
                print(f"[{msg.timestamp}] {author_name}: {msg.content}")
    except (ValueError, IndexError):
        print("Invalid choice")


def interactive_mode(simulator: WorkplaceSimulator):
    """Run the CLI in interactive mode."""
    print("=" * 60)
    print("TeamRPG - Workplace Simulator")
    print("=" * 60)
    
    while True:
        print("\n--- Main Menu ---")
        print("1. Create Persona")
        print("2. Create Team")
        print("3. Create Project")
        print("4. Create Channel")
        print("5. List All")
        print("6. View Channel Messages")
        print("7. Run Simulation")
        print("8. Save State")
        print("9. Load State")
        print("0. Exit")
        
        choice = input("\nChoice: ").strip()
        
        if choice == "1":
            create_persona_interactive(simulator)
        elif choice == "2":
            create_team_interactive(simulator)
        elif choice == "3":
            create_project_interactive(simulator)
        elif choice == "4":
            create_channel_interactive(simulator)
        elif choice == "5":
            list_entities(simulator)
        elif choice == "6":
            view_channel_messages(simulator)
        elif choice == "7":
            cycles = input("Number of cycles [5]: ").strip() or "5"
            try:
                simulator.run_simulation(cycles=int(cycles))
            except ValueError:
                print("Invalid number")
        elif choice == "8":
            simulator.save_state()
            print("✓ State saved")
        elif choice == "9":
            simulator.load_state()
            print("✓ State loaded")
        elif choice == "0":
            print("Goodbye!")
            break
        else:
            print("Invalid choice")


def main():
    """Main entry point for the CLI."""
    parser = argparse.ArgumentParser(description="TeamRPG - Workplace Simulator")
    parser.add_argument(
        "--api-key",
        help="OpenAI API key (defaults to OPENAI_API_KEY env var)"
    )
    parser.add_argument(
        "--load",
        action="store_true",
        help="Load saved state on startup"
    )
    
    args = parser.parse_args()
    
    try:
        simulator = WorkplaceSimulator(api_key=args.api_key)
        
        if args.load:
            simulator.load_state()
            print("✓ Loaded saved state")
        
        interactive_mode(simulator)
    except ValueError as e:
        print(f"Error: {e}")
        print("\nPlease set OPENAI_API_KEY environment variable or use --api-key option")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        sys.exit(0)


if __name__ == "__main__":
    main()
