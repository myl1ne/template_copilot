# Template Copilot - Shipping Visualization Project

> **This repository now includes a complete interactive shipping data visualization application!**

## 🚢 Shipping Visualization Dashboard

An interactive web-based visualization for shipping data, featuring real-time vessel tracking, route visualization, and temporal analysis. Built with React, D3.js, and Mapbox GL.

![Shipping Visualization Demo](https://github.com/user-attachments/assets/205cd46c-5712-40cb-892e-0e2daad19f14)

### ✨ Features

- **Interactive Global Map**: Visualize vessel positions and shipping routes worldwide
- **Timeline Control**: Scrub through time to see vessel movements with D3.js-powered timeline
- **Real-time Tracking**: Track vessel positions, speed, heading, and status
- **Port Monitoring**: View major ports and activity levels
- **Event Timeline**: Monitor departures, arrivals, and shipping events
- **Playback Controls**: Automatic playback with adjustable speed (0.5x to 8x)
- **Fleet Statistics**: Overview dashboard with vessel counts and status

### 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Visit `http://localhost:3000` to see the visualization in action.

**Note**: For enhanced maps with satellite imagery, get a free Mapbox API token at [mapbox.com](https://mapbox.com) and add it to `src/components/ShippingMap.jsx`. The fallback D3.js map works without any API token!

### 📚 Documentation

- **[Visualization README](VISUALIZATION_README.md)** - Complete guide for the shipping visualization app
- **[Visualization Approaches](docs/visualization-approaches.md)** - Detailed analysis of 5 different visualization strategies
- **[Project Overview](docs/project-overview.md)** - Project information
- **[Roadmap](docs/roadmap.md)** - Development roadmap
- **[Backlog](docs/backlog.md)** - Current tasks

### 🛠 Technology Stack

- **React 19** - Modern UI framework
- **D3.js** - Data visualization and timeline control
- **Mapbox GL JS** - Interactive maps (optional)
- **Vite** - Fast build tool
- **date-fns** - Date utilities

---

## 📋 Template Information

This repository also serves as a meta-template for creating copilot-managed documentation systems.

Template for kickstarting new projects with GitHub Copilot-managed documentation.

### Documentation Structure

This template provides a complete documentation ecosystem that GitHub Copilot will maintain:

#### Core Documents
- **[Project Overview](docs/project-overview.md)** - One-page summary of your project
- **[Status & Roadmap](docs/roadmap.md)** - Current status and long-term planning
- **[Current Backlog](docs/backlog.md)** - Task tracking synchronized with GitHub Issues

#### Copilot Configuration
- **[Copilot Instructions](.github/copilot-instructions.md)** - Instructions for maintaining documentation

### 🤖 How It Works

This template includes:

1. **GitHub Copilot Instructions** - Automated documentation maintenance rules
2. **Structured Templates** - Consistent format for all project documentation  
3. **GitHub Integration** - Automatic synchronization with issues and project boards
4. **Living Documentation** - Documents that evolve with your project

### 🎯 Benefits

- **Consistent Documentation** - Standardized format across all projects
- **Automated Maintenance** - Reduced manual documentation overhead  
- **GitHub Integration** - Seamless connection with development workflow
- **Living Documents** - Documentation that stays current with development

---

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Shipping visualization built for the Complexio data pipeline project
- Template system for GitHub Copilot-managed documentation
- Open-source libraries from the JavaScript ecosystem
