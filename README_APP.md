# Company Ontology & Entity Understanding Platform

A Streamlit-based visualization platform for understanding company structure and processes through autonomous ontology extraction from email data.

## 🎯 Overview

This platform provides interactive visualizations for:
- **Ontology Trees**: Hierarchical company structure extracted from emails
- **Spatiotemporal Maps**: Geographic and temporal distribution of entities
- **Entity Graphs**: Relationship networks between detected entities

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip package manager

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

3. Run the application:
```bash
streamlit run app.py
```

4. Open your browser to `http://localhost:8501`

## 📊 Features

### 1. Ontology Tree Visualization
- Interactive hierarchical tree view with expandable nodes
- Sunburst chart for visual hierarchy representation
- Tree statistics (depth, leaf nodes, average children)
- Support for custom ontology JSON format

### 2. Spatiotemporal Entity Map
- Interactive world map showing entity locations
- Timeline visualization of entity detections over time
- Activity heatmap by day of week and hour
- Filtering by entity type, confidence level, and location
- Entity summary statistics

### 3. Entity Relationship Graph
- Network graph showing entity co-occurrence
- Multiple layout algorithms (Spring, Circular, Kamada-Kawai)
- Node size based on connection degree
- Color coding by entity type
- Network statistics (density, clustering, components)

## 📋 Data Format

### Ontology Tree Format
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

### Entity Data Format
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

## 🎨 Usage

### Loading Sample Data
1. Use the sidebar to select "Sample Data"
2. Choose from predefined datasets:
   - Tech Company
   - Marketing Department
   - Enterprise Organization
3. Click "Load Sample Data"

### Loading Custom Data
1. Select "Upload Custom Data" in the sidebar
2. Upload your ontology JSON file
3. Upload your entity instances JSON file
4. Click "Load Custom Data"

### Exploring Visualizations
- Navigate between tabs to view different visualizations
- Use filters and controls to customize views
- Interact with charts by hovering, clicking, and zooming
- Download charts using the Plotly toolbar

## 🛠️ Development

### Project Structure
```
template_copilot/
├── app.py                 # Main Streamlit application
├── visualizations.py      # Visualization functions
├── sample_data.py         # Sample data generators
├── requirements.txt       # Python dependencies
├── README_APP.md         # This file
└── docs/                 # Documentation
```

### Adding Custom Visualizations
1. Add visualization functions to `visualizations.py`
2. Import and call from `app.py`
3. Follow the existing pattern for consistency

### Extending Sample Data
1. Edit `sample_data.py`
2. Add new datasets to the `get_sample_ontology()` function
3. Extend entity generation in `get_sample_entities()`

## 🔧 Configuration

### Customizing the UI
- Edit the custom CSS in `app.py` to change styling
- Modify page configuration in `st.set_page_config()`
- Adjust layout columns and spacing as needed

### Performance Optimization
- For large datasets, consider pagination
- Use Streamlit caching for expensive computations
- Limit initial data rendering

## 📚 Technologies

- **Streamlit**: Web application framework
- **Plotly**: Interactive visualizations
- **NetworkX**: Graph analysis and visualization
- **Pandas**: Data manipulation
- **PyDeck**: Map visualizations (optional enhancement)

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🐛 Known Issues

- Large datasets (>1000 entities) may impact performance
- Map requires internet connection for tile rendering
- Graph layout may need adjustment for very dense networks

## 🔮 Future Enhancements

- Export capabilities for visualizations
- Advanced filtering and search
- Real-time data ingestion
- Custom color schemes and themes
- Multi-language support
- Authentication and user management

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review sample data for format examples

---

**Built with ❤️ for autonomous company understanding**
