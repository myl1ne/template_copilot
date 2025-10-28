# Template Copilot

A meta-template for creating GitHub Copilot-managed documentation systems that stay current and consistent throughout your project's lifecycle.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Template](https://img.shields.io/badge/Template-Use%20This-brightgreen)](https://github.com/myl1ne/template_copilot/generate)

## 🚀 Quick Start

### Automated Setup (Recommended)
```bash
# 1. Use this template to create your repository
# 2. Clone your new repository
# 3. Run the interactive setup script
python quick_start.py
```

### Manual Setup
1. **Use this template** to create a new repository
2. **Replace placeholders** in all documentation files with your project information
3. **Validate completeness**: `python validate_template.py`
4. **Configure GitHub Copilot** to automatically maintain your documentation
5. **Set up issue labels** for automatic backlog synchronization

See [TEMPLATE_USAGE.md](TEMPLATE_USAGE.md) for detailed instructions.

## 📚 Documentation Structure

This template provides a complete documentation ecosystem that GitHub Copilot will maintain:

### Core Documents
- **[Project Overview](docs/project-overview.md)** - One-page summary of your project
- **[Status & Roadmap](docs/roadmap.md)** - Current status and long-term planning
- **[Current Backlog](docs/backlog.md)** - Task tracking synchronized with GitHub Issues

### Copilot Configuration
- **[Copilot Instructions](.github/copilot-instructions.md)** - Instructions for maintaining documentation

## ✨ Features

- **📝 Automated Setup Script** - Interactive CLI to replace all placeholders
- **✅ Template Validation** - Verify all placeholders are replaced before going live
- **🤖 GitHub Copilot Integration** - Automatic documentation maintenance
- **📋 Issue Templates** - Pre-configured templates for bugs, features, and docs
- **🔄 GitHub Actions** - Automated validation workflows
- **📊 Structured Documentation** - Project overview, roadmap, and backlog management
- **🔗 GitHub Integration** - Seamless sync with issues and milestones

## 🤖 How It Works

This template provides a complete documentation ecosystem:

1. **Copilot Instructions** - Guide GitHub Copilot to maintain your docs automatically
2. **Structured Templates** - Consistent format for all project documentation  
3. **Validation Tools** - Scripts to ensure documentation completeness
4. **GitHub Integration** - Automatic synchronization with issues and project boards
5. **Living Documentation** - Documents that evolve with your project

## 📦 What's Included

```
template_copilot/
├── .github/
│   ├── copilot-instructions.md      # Copilot automation rules
│   ├── ISSUE_TEMPLATE/               # Bug, feature, docs templates
│   └── workflows/                    # GitHub Actions for validation
├── docs/
│   ├── project-overview.md           # One-page project summary
│   ├── roadmap.md                    # Status and long-term planning
│   └── backlog.md                    # Task tracking
├── quick_start.py                    # Interactive setup script
├── validate_template.py              # Template validation tool
├── template-config.example.yml       # Configuration example
├── CONTRIBUTING.md                   # Contribution guidelines
├── TEMPLATE_USAGE.md                 # Detailed usage guide
└── README.md                         # This file
```

## 🛠️ Customization

After using this template:

1. **Run the setup script**: `python quick_start.py`
2. **Customize documentation** to match your project needs
3. **Set up GitHub issue labels** for automatic backlog updates
4. **Enable GitHub Copilot** for your repository
5. **Validate your setup**: `python validate_template.py`

See [TEMPLATE_USAGE.md](TEMPLATE_USAGE.md) for detailed customization options.

## 📖 Usage Guide

### For New Projects

1. Click "Use this template" to create a new repository
2. Clone your repository locally
3. Run `python quick_start.py` for guided setup
4. Validate with `python validate_template.py`
5. Commit and push your customized documentation

### For Project Maintainers
- Documentation is automatically updated by GitHub Copilot
- Review and approve Copilot's suggested changes
- Manually update when major project changes occur
- Run validation before major releases

### For Contributors
- Check the [backlog](docs/backlog.md) for current tasks
- Refer to the [roadmap](docs/roadmap.md) for project direction
- Read the [project overview](docs/project-overview.md) for context
- Use issue templates when reporting bugs or suggesting features

## 🎯 Benefits

- **⚡ Quick Setup** - Get started in minutes with the interactive script
- **✅ Quality Assurance** - Built-in validation ensures nothing is missed
- **🔄 Stay Current** - GitHub Copilot keeps docs synchronized with code
- **📊 Better Planning** - Structured roadmap and backlog management
- **🤝 Team Collaboration** - Clear guidelines for contributors
- **🔗 Seamless Integration** - Works naturally with GitHub workflows

## 🧪 Validation

Before finalizing your project documentation:

```bash
# Check that all placeholders are replaced
python validate_template.py

# Should output: ✅ VALIDATION PASSED
```

The validation script checks for:
- Unreplaced placeholders like `[Project Name]`
- Missing required information
- Incomplete documentation sections

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ideas for Contribution
- Additional issue templates
- Enhanced validation rules
- Integration with other tools
- Example projects using the template
- Localization for different languages

## 📚 Documentation

- **[Template Usage Guide](TEMPLATE_USAGE.md)** - Detailed setup and customization
- **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute
- **[Project Overview](docs/project-overview.md)** - Example overview document
- **[Roadmap](docs/roadmap.md)** - Example roadmap structure
- **[Backlog](docs/backlog.md)** - Example backlog format

## 📋 Requirements

- Python 3.x (for setup and validation scripts)
- GitHub repository with Copilot enabled
- Git for version control

## 🔧 Advanced Configuration

See [template-config.example.yml](template-config.example.yml) for advanced configuration options including:
- Custom validation rules
- GitHub integration settings
- Copilot automation preferences
- Documentation review schedules

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- GitHub Copilot for AI-powered documentation assistance
- The open-source community for inspiration and best practices

## 📞 Support

- **Issues**: Use the GitHub issue templates for bug reports or feature requests
- **Discussions**: Share ideas and ask questions in GitHub Discussions
- **Documentation**: Check [TEMPLATE_USAGE.md](TEMPLATE_USAGE.md) for detailed help

---

**Template Version**: 1.1.0  
**Last Updated**: 2025-10-28  
**License**: MIT

Made with ❤️ by the Template Copilot team
