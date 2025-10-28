"""
Example: Basic usage of TeamRPG programmatically

This shows how to use TeamRPG from Python code instead of the CLI.
"""

import os
from teamrpg.simulator import WorkplaceSimulator

# Note: You need to set OPENAI_API_KEY environment variable
# or pass it directly to the simulator

def main():
    # Initialize the simulator
    # simulator = WorkplaceSimulator(api_key="your-key-here")
    # OR use environment variable:
    # os.environ["OPENAI_API_KEY"] = "your-key-here"
    
    # For this example, we'll just show the structure without API key
    print("Example: Creating and managing a workplace simulation\n")
    
    # This would normally require an API key:
    # simulator = WorkplaceSimulator()
    
    # Create personas
    print("1. Create personas:")
    print("   persona1 = simulator.persona_manager.create_persona(")
    print("       name='Alice',")
    print("       role='Developer',")
    print("       personality='Creative problem solver',")
    print("       skills=['Python', 'JavaScript']")
    print("   )")
    print()
    
    # Create a team
    print("2. Create a team:")
    print("   team = simulator.team_manager.create_team(")
    print("       name='Engineering',")
    print("       description='Development team'")
    print("   )")
    print()
    
    # Add persona to team
    print("3. Add persona to team:")
    print("   team.add_member(persona1.id)")
    print()
    
    # Create a project
    print("4. Create a project:")
    print("   project = simulator.project_manager.create_project(")
    print("       name='New Feature',")
    print("       description='Build awesome feature',")
    print("       goals=['Goal 1', 'Goal 2']")
    print("   )")
    print()
    
    # Assign project to team
    print("5. Assign project to team:")
    print("   team.assign_project(project.id)")
    print()
    
    # Create a channel
    print("6. Create a communication channel:")
    print("   channel = simulator.messaging_system.create_channel(")
    print("       name='general',")
    print("       description='General discussion'")
    print("   )")
    print("   channel.add_member(persona1.id)")
    print()
    
    # Run simulation
    print("7. Run the simulation:")
    print("   simulator.run_simulation(cycles=5, delay=1.0)")
    print()
    
    # Save state
    print("8. Save the state:")
    print("   simulator.save_state(directory='data')")
    print()
    
    # Load state
    print("9. Load saved state:")
    print("   simulator.load_state(directory='data')")
    print()
    
    print("\n" + "=" * 60)
    print("For a working example, run: python demo.py")
    print("To try the interactive CLI: python teamrpg_cli.py")
    print("=" * 60)


if __name__ == "__main__":
    main()
