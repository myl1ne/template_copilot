# Company Ontology & Entity Understanding Platform

[![Streamlit](https://img.shields.io/badge/Streamlit-1.28.0-FF4B4B.svg)](https://streamlit.io)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Interactive visualization platform for understanding company structure and processes through autonomous ontology extraction from email data.**

## 🎯 Overview

This platform transforms email communications into actionable insights by autonomously extracting and visualizing organizational structures, entity relationships, and spatiotemporal patterns.

### Key Features

- **🌳 Ontology Tree Visualization**: Interactive hierarchical company structure with sunburst charts
- **🗺️ Spatiotemporal Entity Mapping**: Geographic and temporal distribution of entities  
- **🔗 Entity Relationship Graphs**: Network analysis showing how entities connect

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/myl1ne/template_copilot.git
cd template_copilot

# Install dependencies
pip install -r requirements.txt

# Run the application
streamlit run app.py
```

The application will open in your browser at `http://localhost:8501`

### First Steps

1. **Load Sample Data**: Use the sidebar to select "Sample Data" and choose a dataset
2. **Explore Visualizations**: Navigate through the three tabs:
   - Ontology Tree: View hierarchical structure
   - Spatiotemporal Map: See geographic and temporal patterns
   - Entity Graph: Analyze relationship networks
3. **Try Custom Data**: Upload your own ontology and entity JSON files

## 📊 Data Format

### Ontology Tree Structure
```json
{
  "entity_type": "Organization",
  "description": "Root organization description",
  "children": [
    {
      "entity_type": "Department",
      "description": "Department description",
      "children": []
    }
  ]
}
```

### Entity Instances Format
```json
{
  "email_id": "email_001",
  "detected_entities": [
    {
      "entity_text": "John Doe",
      "entity_type": "Person",
      "entity_instance": "john.doe",
      "location": "New York",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "timestamp": "2024-01-15T10:30:00",
      "confidence": 0.95
    }
  ]
}
```

## 📚 Documentation

- **[Detailed Usage Guide](README_APP.md)** - Complete application documentation
- **[Project Overview](docs/project-overview.md)** - Project goals and benefits
- **[Roadmap](docs/roadmap.md)** - Current status and future plans
- **[Backlog](docs/backlog.md)** - Task tracking and priorities

## 🛠️ Technology Stack

- **Streamlit**: Web application framework
- **Plotly**: Interactive visualizations
- **NetworkX**: Graph analysis
- **Pandas**: Data manipulation
- **PyDeck**: Map rendering

## 🎨 Features in Detail

### Ontology Tree Visualization
- Expandable/collapsible hierarchical view
- Sunburst chart representation
- Tree statistics and metrics
- Export capabilities

### Spatiotemporal Mapping
- Interactive world map with entity markers
- Timeline analysis with date filtering
- Activity heatmap (day/hour patterns)
- Entity type and confidence filtering

### Entity Relationship Graph
- Network visualization of entity co-occurrence
- Multiple layout algorithms
- Node sizing based on connections
- Color coding by entity type
- Network statistics (density, clustering)

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🐛 Issues & Support

- Report issues on [GitHub Issues](https://github.com/myl1ne/template_copilot/issues)
- Check [documentation](README_APP.md) for common questions
- Review sample data for format examples

## 🔮 Future Enhancements

- Real-time data ingestion from email APIs
- Advanced NER model integration
- Multi-user authentication
- Export capabilities for all visualizations
- Custom color schemes and themes

---

## About This Template

This project was created using the `template_copilot` meta-template system for GitHub Copilot-managed documentation. The template provides automated documentation maintenance and GitHub integration.

**Version**: 1.0.0  
**Last Updated**: 2024-11-25  

---

**Built with ❤️ for autonomous company understanding**
