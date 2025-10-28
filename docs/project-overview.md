# TeamRPG - Project Overview

## What is TeamRPG?

TeamRPG is an AI-powered workplace simulator that enables the creation and management of AI personas working together in teams, complete with Slack-like communication channels and autonomous decision-making capabilities.

## Target Audience

This project is designed for:
- AI researchers exploring multi-agent systems
- Developers experimenting with LLM-powered agents
- Teams interested in workplace simulation and agent collaboration
- Anyone curious about autonomous AI interactions

## Key Features

- **AI Persona Management**: Create and manage AI personas with unique roles, personalities, and skills, each powered by OpenAI's GPT models
- **Team Formation**: Organize personas into teams with specific purposes and project assignments
- **Project Assignment**: Create projects with goals and assign them to teams for collaborative work
- **Slack-like Messaging**: Public and private channels where personas can exchange messages and collaborate asynchronously
- **Autonomous Execution Loop**: Agents independently read context, make decisions, and take actions (respond to messages, post updates, work on projects)
- **Persistent State**: Save and load complete simulation states for long-running scenarios

## Quick Start

### Prerequisites
- Python 3.7 or higher
- OpenAI API key

### Installation
```bash
git clone https://github.com/myl1ne/template_copilot.git
cd template_copilot
pip install -r requirements.txt
```

### Basic Usage
```bash
# Set your OpenAI API key
export OPENAI_API_KEY='your-api-key-here'

# Run the interactive CLI
python teamrpg_cli.py
```

## Core Benefits

1. **Realistic Workplace Simulation**: Watch AI agents collaborate, communicate, and work on projects in a simulated environment
2. **Experimental Platform**: Test multi-agent behaviors, communication patterns, and collaboration strategies
3. **Easy to Extend**: Modular architecture makes it simple to add new features or customize behavior
4. **Educational Tool**: Learn about LLM-powered agents, prompt engineering, and autonomous decision-making

## Links & Resources

- **Repository**: https://github.com/myl1ne/template_copilot
- **Documentation**: See docs/ directory for detailed information
- **Issues & Support**: GitHub Issues
- **License**: MIT

---

*Last updated: 2024-10-28 | Version: 0.1.0*