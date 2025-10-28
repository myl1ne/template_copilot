#!/usr/bin/env python3
"""
Demo script for TeamRPG - Sets up an example workplace scenario.

This script creates a sample team, personas, projects, and channels
to demonstrate the system without running the full AI simulation.
"""

import sys
import os
import traceback

from teamrpg.persona import PersonaManager
from teamrpg.team import TeamManager
from teamrpg.project import ProjectManager
from teamrpg.messaging import MessagingSystem


def create_demo_scenario():
    """Create a complete demo scenario."""
    
    print("=" * 60)
    print("TeamRPG - Demo Scenario Setup")
    print("=" * 60)
    
    # Initialize managers
    persona_manager = PersonaManager()
    team_manager = TeamManager()
    project_manager = ProjectManager()
    messaging_system = MessagingSystem()
    
    # Create personas
    print("\n📋 Creating Personas...")
    
    alice = persona_manager.create_persona(
        name="Alice Chen",
        role="Senior Backend Developer",
        personality="Detail-oriented problem solver who loves clean code and system architecture",
        skills=["Python", "Go", "PostgreSQL", "System Design", "API Development"]
    )
    print(f"  ✓ Created {alice.name} ({alice.role})")
    
    bob = persona_manager.create_persona(
        name="Bob Martinez",
        role="Frontend Developer",
        personality="Creative UI enthusiast with a passion for user experience",
        skills=["React", "TypeScript", "CSS", "UX Design", "Performance Optimization"]
    )
    print(f"  ✓ Created {bob.name} ({bob.role})")
    
    carol = persona_manager.create_persona(
        name="Carol Johnson",
        role="Product Manager",
        personality="Strategic thinker focused on user needs and business value",
        skills=["Product Strategy", "User Research", "Agile", "Stakeholder Management"]
    )
    print(f"  ✓ Created {carol.name} ({carol.role})")
    
    david = persona_manager.create_persona(
        name="David Kim",
        role="DevOps Engineer",
        personality="Automation enthusiast who ensures smooth deployments",
        skills=["Docker", "Kubernetes", "CI/CD", "AWS", "Monitoring"]
    )
    print(f"  ✓ Created {david.name} ({david.role})")
    
    # Create team
    print("\n👥 Creating Team...")
    engineering_team = team_manager.create_team(
        name="Product Engineering Team",
        description="Cross-functional team building the next generation product"
    )
    print(f"  ✓ Created team: {engineering_team.name}")
    
    # Add members to team
    for persona in [alice, bob, carol, david]:
        engineering_team.add_member(persona.id)
    print(f"  ✓ Added {len(engineering_team.member_ids)} members to team")
    
    # Create projects
    print("\n📊 Creating Projects...")
    
    api_project = project_manager.create_project(
        name="REST API v2.0",
        description="Complete redesign of our REST API with GraphQL support",
        goals=[
            "Improve response time by 50%",
            "Add GraphQL endpoints",
            "Comprehensive API documentation",
            "Backward compatibility layer"
        ]
    )
    print(f"  ✓ Created project: {api_project.name}")
    
    ui_project = project_manager.create_project(
        name="Dashboard Redesign",
        description="Modern, responsive dashboard with real-time updates",
        goals=[
            "Mobile-first responsive design",
            "Real-time data visualization",
            "Accessibility compliance (WCAG 2.1)",
            "Performance optimization"
        ]
    )
    print(f"  ✓ Created project: {ui_project.name}")
    
    # Assign projects to team
    engineering_team.assign_project(api_project.id)
    engineering_team.assign_project(ui_project.id)
    print(f"  ✓ Assigned {len(engineering_team.project_ids)} projects to team")
    
    # Create channels
    print("\n💬 Creating Communication Channels...")
    
    general_channel = messaging_system.create_channel(
        name="team-general",
        description="General team discussions and announcements",
        channel_type="public"
    )
    print(f"  ✓ Created channel: #{general_channel.name}")
    
    backend_channel = messaging_system.create_channel(
        name="backend-dev",
        description="Backend development discussions",
        channel_type="public"
    )
    print(f"  ✓ Created channel: #{backend_channel.name}")
    
    frontend_channel = messaging_system.create_channel(
        name="frontend-dev",
        description="Frontend development discussions",
        channel_type="public"
    )
    print(f"  ✓ Created channel: #{frontend_channel.name}")
    
    # Add members to channels
    for persona in [alice, bob, carol, david]:
        general_channel.add_member(persona.id)
    
    backend_channel.add_member(alice.id)
    backend_channel.add_member(david.id)
    
    frontend_channel.add_member(bob.id)
    frontend_channel.add_member(david.id)
    
    print(f"  ✓ Added members to channels")
    
    # Add some sample messages
    print("\n✉️  Adding Sample Messages...")
    
    general_channel.post_message(
        "Welcome everyone! Let's kick off our new projects with great collaboration! 🚀",
        carol.id
    )
    general_channel.post_message(
        "Excited to work on the API redesign! I'll start reviewing the current architecture.",
        alice.id
    )
    general_channel.post_message(
        "Looking forward to the dashboard redesign. I've got some ideas for the UI!",
        bob.id
    )
    general_channel.post_message(
        "I'll set up the CI/CD pipeline for both projects this week.",
        david.id
    )
    
    backend_channel.post_message(
        "I'm thinking we should use GraphQL subscriptions for real-time updates. Thoughts?",
        alice.id
    )
    backend_channel.post_message(
        "That would work well. I can help with the infrastructure for WebSocket connections.",
        david.id
    )
    
    frontend_channel.post_message(
        "Starting with the component library setup. Using Tailwind CSS for styling.",
        bob.id
    )
    
    print(f"  ✓ Added sample messages to channels")
    
    # Add project updates
    print("\n📝 Adding Project Updates...")
    
    api_project.add_update(
        "Completed analysis of current API bottlenecks. Main issue is N+1 queries in the user endpoint.",
        alice.id
    )
    api_project.add_update(
        "Created initial GraphQL schema design. Ready for team review.",
        alice.id
    )
    
    ui_project.add_update(
        "Finished wireframes for the new dashboard. Focusing on data visualization components next.",
        bob.id
    )
    
    print(f"  ✓ Added project updates")
    
    # Save everything
    print("\n💾 Saving State...")
    os.makedirs("demo_data", exist_ok=True)
    persona_manager.save_to_file("demo_data/personas.json")
    team_manager.save_to_file("demo_data/teams.json")
    project_manager.save_to_file("demo_data/projects.json")
    messaging_system.save_to_file("demo_data/channels.json")
    print("  ✓ Saved to demo_data/ directory")
    
    # Display summary
    print("\n" + "=" * 60)
    print("Demo Scenario Summary")
    print("=" * 60)
    print(f"\n👥 Team: {engineering_team.name}")
    print(f"   Members: {len(engineering_team.member_ids)}")
    for pid in engineering_team.member_ids:
        p = persona_manager.get_persona(pid)
        print(f"   - {p.name} ({p.role})")
    
    print(f"\n📊 Projects: {len(engineering_team.project_ids)}")
    for proj_id in engineering_team.project_ids:
        proj = project_manager.get_project(proj_id)
        print(f"   - {proj.name}")
        print(f"     Goals: {len(proj.goals)}, Updates: {len(proj.updates)}")
    
    print(f"\n💬 Channels: {len(messaging_system.list_channels())}")
    for channel in messaging_system.list_channels():
        print(f"   - #{channel.name}")
        print(f"     Members: {len(channel.member_ids)}, Messages: {len(channel.messages)}")
    
    print("\n" + "=" * 60)
    print("\n✅ Demo scenario created successfully!")
    print("\nYou can now:")
    print("  1. Run: python teamrpg_cli.py --load")
    print("     (Then select option 9 to load the demo state)")
    print("  2. Explore the demo_data/ directory to see saved state")
    print("  3. View messages with option 6 in the CLI")
    print("\nNote: To run the full AI simulation, you'll need an OpenAI API key.")
    print("=" * 60)


if __name__ == "__main__":
    try:
        create_demo_scenario()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        traceback.print_exc()
        sys.exit(1)
