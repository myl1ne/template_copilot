# Template Usage Guide

This guide explains how to use the `template_copilot` meta-template to set up copilot-managed documentation for your new project.

## 🚀 Getting Started

### Step 1: Use This Template
1. Click "Use this template" on the GitHub repository page
2. Create a new repository with your project name
3. Clone your new repository locally

### Step 2: Replace Placeholders
Replace all instances of `[Project Name]` and placeholder content in these files:

#### Required Replacements
- `README.md` - Update project name and description
- `docs/project-overview.md` - Add your project details
- `docs/roadmap.md` - Set your actual roadmap and status
- `docs/backlog.md` - Configure initial backlog
- `.github/copilot-instructions.md` - Customize if needed

#### Placeholder Patterns to Find and Replace
- `[Project Name]` → Your actual project name
- `[brief description]` → Your project description
- `[GitHub repository URL]` → Your repository URL
- `[Current version number]` → Your starting version
- `[Date]` → Actual dates
- `[GitHub username]` → Actual usernames
- `#XX` → Actual issue numbers (when you have them)

### Step 3: Configure GitHub Features

#### Enable GitHub Copilot
1. Ensure GitHub Copilot is enabled for your repository
2. The `.github/copilot-instructions.md` file will guide Copilot's behavior

#### Set Up Issue Labels
Create these labels in your GitHub repository for automatic backlog sync:
- `priority: high` (red)
- `priority: medium` (yellow)  
- `priority: low` (green)
- `type: bug` (red)
- `type: feature` (blue)
- `type: enhancement` (purple)
- `type: documentation` (light blue)

#### Optional: GitHub Project Board
- Create a project board linked to your repository
- Configure columns: "Backlog", "In Progress", "Review", "Done"
- Link the board in your documentation

### Step 4: Initial Documentation Setup

#### Project Overview (`docs/project-overview.md`)
- Replace all bracketed placeholders
- Add your actual quick start instructions
- Include real installation commands
- Update links to point to your repository

#### Roadmap (`docs/roadmap.md`)
- Set your current version and status
- Define your actual next release goals
- Plan realistic long-term vision items
- Remove example completed items

#### Backlog (`docs/backlog.md`)
- Add your initial high-priority tasks
- Create corresponding GitHub issues
- Link backlog items to actual issues
- Update the summary table

### Step 5: Test and Validate

#### Verify Links
- Check all internal links work correctly
- Ensure GitHub issue links are valid
- Test external links if any

#### GitHub Copilot Integration
- Create a test issue with appropriate labels
- Ask Copilot to update the backlog
- Verify Copilot follows the instructions correctly

#### Documentation Consistency
- Ensure consistent project name throughout
- Check that all placeholder content is replaced
- Verify formatting and structure

## 🔧 Customization Options

### Modify Documentation Structure
- Add new document templates to the `docs/` folder
- Update `.github/copilot-instructions.md` to include new documents
- Reference new documents in the main README.md

### Extend Copilot Instructions
- Add project-specific automation rules
- Include additional document maintenance guidelines
- Configure custom integration with other tools

### Advanced GitHub Integration
- Set up GitHub Actions for automated updates
- Configure webhooks for real-time synchronization
- Integrate with external project management tools

## 📝 Maintenance Tips

### Regular Updates
- Review documentation monthly for accuracy
- Update roadmap after each release
- Archive completed backlog items regularly

### Copilot Collaboration
- Review Copilot's suggested documentation changes
- Provide feedback to improve automation
- Monitor for consistency and accuracy

### Team Coordination
- Establish documentation update workflows
- Define responsibilities for different document sections
- Create guidelines for manual vs. automated updates

## 🚨 Common Issues and Solutions

### Copilot Not Following Instructions
- Ensure `.github/copilot-instructions.md` is clear and specific
- Check that GitHub Copilot has access to your repository
- Verify instructions are compatible with your project structure

### Broken Links
- Use relative paths for internal documentation
- Keep consistent file naming conventions
- Update links when restructuring documentation

### Outdated Information
- Set up regular review schedules
- Monitor for changes that should trigger updates
- Use version control to track documentation changes

## 📞 Support

If you encounter issues with this template:
1. Check this usage guide first
2. Review the GitHub Copilot documentation
3. Create an issue in the `template_copilot` repository
4. Provide specific details about your setup and problem

---

*This guide is part of the template_copilot meta-template system.*