# GitHub Copilot Instructions for Project Documentation

This file contains instructions for GitHub Copilot to maintain and update project documentation automatically.

## Document Maintenance Guidelines

### 1. Project Overview (`docs/project-overview.md`)
- Keep this as a concise one-pager that clearly explains:
  - What the project does
  - Who it's for (target audience)
  - Key features and benefits
  - How to get started quickly
- Update whenever there are significant feature additions or changes to the project's core purpose
- Maintain a professional yet accessible tone
- Include relevant badges, links, or quick stats if applicable

### 2. Status & Roadmap (`docs/roadmap.md`)
- Maintain two main sections:
  - **Current Status**: What's working now, recent releases, current version
  - **Long Term Roadmap**: Planned features, architectural improvements, major milestones
- Update the current status section after each release or significant milestone
- Keep roadmap items realistic and prioritized
- Archive completed roadmap items to a "Recently Completed" section
- Link to relevant GitHub issues, PRs, or project boards where applicable

### 3. Current Backlog (`docs/backlog.md`)
- Automatically sync with GitHub issues when possible
- Organize tasks by priority: High, Medium, Low
- Include status for each item: Not Started, In Progress, Under Review, Completed
- Link each backlog item to its corresponding GitHub issue
- Update status based on issue state changes
- Group related tasks together under logical headings

## General Documentation Guidelines

- Use clear, consistent markdown formatting
- Keep all documentation up-to-date with code changes
- Include relevant code examples where helpful
- Use relative links for internal documentation references
- Maintain a consistent voice and style across all documents
- Add timestamps or version references when documenting changes
- Ensure all external links are valid and up-to-date

## Automation Rules

- When new GitHub issues are created with specific labels, automatically add them to the backlog
- When issues are closed, update their status in the backlog
- After each commit to main branch, review if any documentation needs updates
- When package.json version changes, update the current status in roadmap
- When new dependencies are added, consider if project overview needs updates

## Templates for New Projects

When this template is used for a new project:
1. Replace placeholder content in all documentation files
2. Update project-specific information (name, description, etc.)
3. Customize the roadmap based on actual project goals
4. Set up initial backlog based on planned features
5. Configure GitHub issue labels that should trigger backlog updates