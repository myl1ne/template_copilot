# EmbeddingsSpace: Conversation Visualization Platform

An experimental platform for visualizing and analyzing conversation embeddings using LLM-based evaluations and advanced visualization techniques.

[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 What is EmbeddingsSpace?

EmbeddingsSpace maps conversations to embedding vectors, evaluates them across multiple quality metrics using LLMs, and visualizes the results in intuitive 2D/3D spaces. It includes Self-Organizing Maps (SOMs) for interpolating metrics across unexplored regions of the embedding space.

**Key Features**:
- 🗺️ **Embedding computation** with OpenAI models
- 🔍 **LLM-based evaluation** across 8 quality metrics
- 📊 **Multiple visualizations**: PCA, t-SNE, UMAP, contour plots, 3D surfaces
- 🏔️ **Metric landscapes**: Identify peaks (high quality) and valleys (low quality)
- 🧠 **Self-Organizing Maps**: Interpolate metrics for unexplored regions
- 🔬 **Experimental results**: Demo with comprehensive visualizations

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run the demo
python experiments/demo.py
```

This generates 10+ visualizations showing conversation clusters, metric landscapes, and quality patterns.

## 📊 Example Visualizations

The platform generates multiple visualization types:

1. **Embedding Space** - 2D/3D projections showing conversation clusters
2. **Metric-Colored Maps** - Embeddings colored by quality metrics
3. **Contour Plots** - Topographic view of metric distributions
4. **Peak/Valley Detection** - Automated identification of quality regions
5. **Self-Organizing Maps** - Metric interpolation across embedding space

Check `experiments/outputs/` for generated visualizations and `experiments/RESULTS.md` for detailed analysis.

## 📚 Documentation

- **[README_EMBEDDINGS.md](README_EMBEDDINGS.md)** - Comprehensive usage guide
- **[docs/project-overview.md](docs/project-overview.md)** - Project overview
- **[docs/roadmap.md](docs/roadmap.md)** - Development roadmap
- **[experiments/RESULTS.md](experiments/RESULTS.md)** - Experimental results

## 🏗️ Project Structure

```
embeddings_space/
├── core/          # Conversation and embedding management
├── audit/         # LLM-based evaluation system
└── visualizers/   # Visualization modules (PCA, SOM, landscapes)

experiments/
├── demo.py        # Comprehensive demonstration
├── outputs/       # Generated visualizations
└── RESULTS.md     # Experimental analysis
```

## 🎓 Use Cases

- **Conversation Quality Analysis**: Evaluate chatbot conversations
- **Training Data Curation**: Identify high-quality examples
- **A/B Testing**: Compare conversation strategies
- **Anomaly Detection**: Find problematic conversations
- **Metric Interpolation**: Predict quality in unexplored regions

## 🤝 Contributing

This project welcomes contributions! Areas of interest:
- Additional visualization techniques
- New evaluation metrics
- Performance improvements
- Documentation and examples

## 📄 License

MIT License - See LICENSE file for details

---

## About This Repository

This repository was created using a template for GitHub Copilot-managed documentation. The template structure has been adapted for the EmbeddingsSpace project.

**Original Template**: [template_copilot](https://github.com/myl1ne/template_copilot)  
**Project Version**: 0.1.0  
**Last Updated**: February 4, 2026
