# TeamRPG - Quick Reference

## Installation
```bash
pip install -r requirements.txt
export OPENAI_API_KEY='your-api-key-here'
```

## Quick Start

### Option 1: Demo Script (No API Key Required)
```bash
python demo.py
```
Creates a complete example scenario with 4 personas, a team, projects, and channels.

### Option 2: Interactive CLI
```bash
python teamrpg_cli.py
```

### Option 3: Programmatic Usage
```python
from teamrpg.simulator import WorkplaceSimulator

sim = WorkplaceSimulator()

# Create a persona
alice = sim.persona_manager.create_persona(
    name="Alice",
    role="Developer", 
    personality="Creative problem solver",
    skills=["Python", "JavaScript"]
)

# Create a team and add the persona
team = sim.team_manager.create_team("Engineering", "Dev team")
team.add_member(alice.id)

# Create and assign a project
project = sim.project_manager.create_project(
    name="New Feature",
    description="Build awesome feature",
    goals=["Goal 1", "Goal 2"]
)
team.assign_project(project.id)

# Create a channel
channel = sim.messaging_system.create_channel("general", "Team chat")
channel.add_member(alice.id)

# Run simulation (requires API key)
sim.run_simulation(cycles=5)

# Save state
sim.save_state()
```

## CLI Commands

From the interactive CLI:
1. **Create Persona** - Add new AI agent
2. **Create Team** - Form a team
3. **Create Project** - Define work
4. **Create Channel** - Set up communication
5. **List All** - View everything
6. **View Channel Messages** - Read conversations
7. **Run Simulation** - Execute AI loop
8. **Save State** - Persist to disk
9. **Load State** - Restore session

## Running Tests
```bash
python -m unittest discover tests -v
```

## Project Structure
```
teamrpg/
├── persona.py      # AI persona management
├── team.py         # Team management
├── project.py      # Project management
├── messaging.py    # Channels & messages
├── ai_agent.py     # OpenAI integration
└── simulator.py    # Main orchestrator
```

## Data Storage

Saved to `data/` or `demo_data/`:
- `personas.json` - All personas
- `teams.json` - All teams  
- `projects.json` - All projects
- `channels.json` - All channels and messages

## Environment Variables

- `OPENAI_API_KEY` - Required for AI simulation

## Common Tasks

### View Demo Data
```bash
python demo.py
ls demo_data/
cat demo_data/channels.json
```

### Load and Continue Demo
```bash
python teamrpg_cli.py
# Choose option 9 to load state
# Navigate to demo_data/ directory
```

### Run Full Simulation
```bash
export OPENAI_API_KEY='sk-...'
python teamrpg_cli.py
# Create personas, teams, projects, channels
# Choose option 7 to run simulation
```

## Troubleshooting

**"No module named 'openai'"**
```bash
pip install -r requirements.txt
```

**"OpenAI API key is required"**
```bash
export OPENAI_API_KEY='your-key-here'
# or
python teamrpg_cli.py --api-key YOUR_KEY
```

**"No personas available"**
- Create personas first (option 1 in CLI)
- Or load demo data (option 9, use demo_data/)

## Examples

See `demo.py` and `example_usage.py` for complete examples.

## Documentation

- `README.md` - Full documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- `docs/` - Project documentation
