# GitHub Copilot Instructions for Ghostless Shell

This file contains instructions for GitHub Copilot to maintain and update the Ghostless Shell personal website project documentation.

## Project Context

Ghostless Shell is a sophisticated personal portfolio website featuring:
- Interactive resume and professional showcase
- Curated notes and knowledge repository  
- Research papers and academic contributions showcase
- Experimental lab with interactive demos
- AI companion creature with chat interface
- Firebase/Firestore backend integration

## Document Maintenance Guidelines

### 1. Project Overview (`docs/project-overview.md`)
- Keep focused on the unique aspects of Ghostless Shell (AI companion, modular experiments, etc.)
- Emphasize the "ghostless shell" philosophy - intelligent without unnecessary complexity
- Update when new major sections or AI capabilities are added
- Maintain the professional yet innovative tone that reflects the project's character

### 2. Development Roadmap (`docs/roadmap.md`)
- Track progress through development phases: Foundation → Interactive Features → AI Integration → Advanced Features
- Update current status as development milestones are reached
- Keep the phased approach clear (Phase 1, 2, 3, etc.)
- Archive completed features with completion dates and notes

### 3. Development Backlog (`docs/backlog.md`)
- Organize by current development phase priorities
- Use phase-specific labels (phase: 1, phase: 2, etc.) in addition to standard priority labels
- Include effort estimates and dependencies for complex features
- Track AI companion development separately as it's a unique, complex feature
- Update status based on issue state changes
- Group related tasks together under logical headings

## General Documentation Guidelines

- Use clear, consistent markdown formatting
- Keep all documentation current with development progress and feature implementations  
- Include technical details relevant to Firebase/Firestore integration when appropriate
- Use relative links for internal documentation references
- Maintain the innovative yet professional tone that reflects Ghostless Shell's character
- Add timestamps and phase references when documenting changes
- Ensure all links to research papers, demos, and external resources remain valid

## Automation Rules for Ghostless Shell

- When new GitHub issues are created with phase and priority labels, automatically add them to the appropriate backlog section
- When issues are closed, update their status in backlog and move to "Recently Completed" with completion date
- After significant development progress, review if the current roadmap phase status needs updating
- When new sections (resume, notes, research, experiments) are implemented, update project overview
- When AI companion features are added or enhanced, highlight these updates prominently in documentation

## Special Considerations for Ghostless Shell

### AI Companion Features
- Document AI companion capabilities and limitations clearly
- Track conversation system development separately from other features
- Include ethical considerations and user privacy aspects of AI integration

### Modular Experiments System
- Maintain a registry of available experiments and demos in documentation
- Document the modular architecture for adding new experiments
- Include technical specifications for experiment integration

### Firebase Integration
- Keep track of Firestore schema changes and their documentation impact
- Document authentication flows and security considerations
- Note any Firebase service dependencies and their impact on features