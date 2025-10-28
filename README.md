# TeamRPG - AI Workplace Simulator

A workplace simulator powered by LLMs that enables creation and management of AI personas, teams, projects, and Slack-like communication channels.

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/myl1ne/template_copilot.git
cd template_copilot
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up your OpenAI API key:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

Or export it as an environment variable:
```bash
export OPENAI_API_KEY='your-api-key-here'
```

### Running the Simulator

Start the interactive CLI:
```bash
python teamrpg_cli.py
```

Or with a specific API key:
```bash
python teamrpg_cli.py --api-key YOUR_API_KEY
```

Load saved state on startup:
```bash
python teamrpg_cli.py --load
```

## 📚 Features

### 🎭 AI Persona Management
- Create personas with unique names, roles, personalities, and skills
- Each persona has its own context memory and system prompt
- Personas make autonomous decisions using GPT models

### 👥 Team Management
- Form teams from multiple personas
- Assign projects to teams
- Track team membership and activities

### 📋 Project Assignment
- Create projects with goals and descriptions
- Assign projects to teams
- Track project updates and progress

### 💬 Slack-like Messaging
- Create public and private channels
- Personas can exchange messages
- Invite personas to channels
- View message history

### 🔄 Execution Loop
- Autonomous agents read their context
- AI-powered decision making (respond to messages, post updates, work on projects)
- Simulated workplace interactions

## 🎮 Usage Examples

### Creating a Persona
```
1. Create Persona
Name: Alice
Role: Developer
Personality: Creative and detail-oriented problem solver
Skills: Python, JavaScript, System Design
```

### Creating a Team
```
2. Create Team
Team name: Engineering
Team description: Backend development team
Add personas to the team...
```

### Creating a Project
```
3. Create Project
Project name: API Redesign
Project description: Modernize the REST API
Goals: Better performance, Improved documentation, GraphQL support
Assign to team...
```

### Creating a Channel
```
4. Create Channel
Channel name: engineering-chat
Channel description: Engineering team discussions
Type: public
Add members...
```

### Running the Simulation
```
7. Run Simulation
Number of cycles: 5
```

The simulator will run 5 cycles where each persona:
1. Reads their current context (teams, projects, messages)
2. Decides what action to take (using AI)
3. Executes the action (post message, update project, etc.)

## 🗂️ Project Structure

```
teamrpg/
├── __init__.py          # Package initialization
├── persona.py           # Persona and PersonaManager classes
├── team.py             # Team and TeamManager classes
├── project.py          # Project and ProjectManager classes
├── messaging.py        # Message, Channel, and MessagingSystem classes
├── ai_agent.py         # AI integration with OpenAI
└── simulator.py        # Main simulator orchestrating everything

teamrpg_cli.py          # Interactive command-line interface
tests/                  # Unit tests
├── test_persona.py
├── test_team.py
└── test_messaging.py
```

## 🧪 Running Tests

Run all tests:
```bash
python -m unittest discover tests -v
```

Run specific test file:
```bash
python -m unittest tests.test_persona -v
```

## 💾 Data Persistence

The simulator automatically saves state to the `data/` directory:
- `personas.json` - All personas and their context
- `teams.json` - Team configurations and memberships
- `projects.json` - Project details and updates
- `channels.json` - Channels and all messages

Use the "Load State" option in the CLI to restore a previous session.

## 🤖 How It Works

1. **Personas** are AI agents with specific roles and personalities
2. **Teams** group personas together for collaboration
3. **Projects** are assigned to teams for personas to work on
4. **Channels** enable async communication between personas
5. **The Simulator** runs cycles where each persona:
   - Reads context (team info, project status, recent messages)
   - Uses AI to decide on an action
   - Executes the action (send message, post update, etc.)
   - Updates their context memory

The AI uses OpenAI's GPT models to generate realistic workplace behavior based on each persona's characteristics.

## 📖 Documentation

- **[Project Overview](docs/project-overview.md)** - Detailed project information
- **[Status & Roadmap](docs/roadmap.md)** - Current status and future plans
- **[Current Backlog](docs/backlog.md)** - Task tracking

## 🔑 API Key Security

Never commit your `.env` file or expose your API key. The `.gitignore` file is configured to exclude it.

## 📄 License

MIT
