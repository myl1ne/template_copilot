# GitHub Copilot Instructions for Aria AI Companion Project

This file contains instructions for GitHub Copilot to maintain and update the Aria AI companion project documentation automatically.

## Project Context

Aria is an AI companion application that combines the nostalgic charm of virtual pets with cutting-edge artificial intelligence. The project aims to create meaningful digital companionship through:
- Intelligent personality systems
- Multi-modal interaction (text, voice, visual)
- Emotional intelligence and empathy
- Privacy-first design
- Cross-platform compatibility

## Document Maintenance Guidelines

### 1. Project Overview (`docs/project-overview.md`)
- Keep this as a comprehensive but accessible overview that explains:
  - What makes Aria unique as an AI companion
  - Target audience and use cases for AI companionship
  - Key features: personality system, emotional intelligence, privacy features
  - Technical innovation: hybrid AI models, cross-platform design
- Update whenever there are significant feature additions or changes to the core AI companion concept
- Maintain an inspiring yet realistic tone that balances technical innovation with human warmth
- Include relevant technical details and code examples as features are implemented

### 2. Status & Roadmap (`docs/roadmap.md`)
- Maintain development phases aligned with AI companion feature development:
  - **Foundation Phase**: Basic AI integration and personality system
  - **MVP Phase**: Core companion features and interaction methods
  - **Enhancement Phase**: Advanced AI features and platform expansion
- Update the current status section after each major milestone or feature completion
- Keep roadmap items focused on meaningful companion experiences and technical AI advancement
- Archive completed roadmap items with links to relevant PRs and demonstrations
- Link to relevant GitHub issues, PRs, or live demos where applicable

### 3. Current Backlog (`docs/backlog.md`)
- Automatically sync with GitHub issues tagged with AI companion development labels
- Organize tasks by development phase: Foundation, MVP, Enhancement
- Prioritize tasks that directly impact companion personality, user experience, and AI functionality
- Include estimates based on AI development complexity (simple features vs. complex AI training)
- Link each backlog item to its corresponding GitHub issue
- Update status based on issue state changes and development progress
- Group related AI/companion tasks together under logical headings

## General Documentation Guidelines

- Use clear, consistent markdown formatting with appropriate emojis for AI companion project personality
- Keep all documentation up-to-date with AI model changes, feature implementations, and user experience improvements
- Include relevant code examples, especially for AI integration and companion personality configuration
- Use relative links for internal documentation references
- Maintain a warm, inspiring voice that reflects the companion project's human-centered approach
- Add timestamps or version references when documenting AI model updates or significant feature changes
- Ensure all external links are valid, especially those related to AI frameworks and companion app resources
- Include screenshots or demos when new companion features or AI interactions are implemented

## Automation Rules for AI Companion Development

- When new GitHub issues are created with AI/companion-related labels, automatically categorize them in the backlog by development phase
- When issues are closed, update their status in the backlog and note any AI feature demonstrations or user testing results
- After each commit to main branch, review if any documentation needs updates, especially for AI model changes or new companion features
- When package.json or requirements.txt changes (new AI libraries), update the project overview with technical stack changes
- When new AI dependencies or companion features are added, consider updating the roadmap timeline and technical requirements
- Monitor for companion personality updates, AI model improvements, or user experience changes that should be documented

## AI Companion Project Specific Guidelines

- Always maintain focus on the human-AI relationship aspect when updating documentation
- Include privacy and ethical AI considerations in any technical documentation
- Document AI model performance, companion personality traits, and user interaction patterns when available
- Keep technical complexity balanced with user-friendly explanations
- Reference AI companion research, user feedback, and interaction design principles where relevant
- Update documentation to reflect the latest AI capabilities and companion features as they're developed

## Templates for Aria AI Companion Project

When this project evolves or new features are added:
1. Replace placeholder content in all documentation files with actual implementation details
2. Update AI companion-specific information (model performance, personality traits, user interaction examples)
3. Customize the roadmap based on actual AI development progress and user feedback
4. Set up development backlog based on companion feature priorities and technical AI milestones
5. Configure GitHub issue labels that should trigger backlog updates (ai, companion, personality, interaction, etc.)

## Development Phase Documentation

### Foundation Phase Documentation
- Focus on technical architecture decisions
- Document AI model selection rationale
- Include basic companion personality framework

### MVP Phase Documentation  
- Emphasize user interaction examples
- Document companion personality demonstrations
- Include user testing feedback and iteration plans

### Enhancement Phase Documentation
- Showcase advanced AI companion capabilities
- Document community feedback integration
- Include performance metrics and user satisfaction data