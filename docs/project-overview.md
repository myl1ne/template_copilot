# EmbeddingsSpace - Project Overview

## What is EmbeddingsSpace?

EmbeddingsSpace is an experimental visualization platform for analyzing conversations through embeddings, LLM-based evaluations, and advanced visualization techniques including Self-Organizing Maps for metric interpolation.

## Target Audience

This project is designed for:
- **AI/ML Researchers** exploring conversation quality and embedding spaces
- **Chatbot Developers** evaluating and improving conversation systems
- **Data Scientists** analyzing large-scale conversation datasets
- **Product Managers** understanding conversation quality metrics
- **Anyone interested** in visualizing high-dimensional conversation data

## Key Features

- **Embedding Computation**: Map conversations to high-dimensional vectors using OpenAI's embedding models
- **LLM Audit Layer**: Evaluate conversations across 8 different metrics (coherence, relevance, creativity, helpfulness, toxicity, engagement, factuality, conciseness)
- **Modular Visualizers**: Multiple visualization approaches including PCA, t-SNE, UMAP for 2D/3D projections
- **Metric Landscapes**: Identify peaks (mountains) and valleys in metric distributions across embedding space
- **Self-Organizing Maps**: Interpolate metric values for unexplored regions of embedding space
- **Comprehensive Analysis**: Batch processing, filtering, and similarity search capabilities

## Quick Start

### Prerequisites
- Python 3.8 or higher
- OpenAI API key (optional - mock mode available for testing)
- pip package manager

### Installation
```bash
# Clone the repository
git clone https://github.com/myl1ne/template_copilot.git
cd template_copilot

# Install dependencies
pip install -r requirements.txt

# Install the package
pip install -e .
```

### Basic Usage
```bash
# Run the comprehensive demo
python experiments/demo.py

# This will:
# 1. Create 20 sample conversations
# 2. Compute embeddings and evaluate metrics
# 3. Generate 10+ visualizations
# 4. Identify interesting regions
# 5. Save results to experiments/outputs/
```

## Core Benefits

1. **Deep Understanding**: Visualize abstract conversation quality in intuitive 2D/3D spaces
2. **Automated Evaluation**: Leverage LLMs to evaluate conversations at scale across multiple dimensions
3. **Predictive Insights**: Use SOM interpolation to predict metric values for unexplored conversation types
4. **Actionable Intelligence**: Identify high-quality conversation patterns and problematic regions
5. **Research Foundation**: Extensible architecture for experimenting with new metrics and visualization techniques

## Links & Resources

- **Repository**: https://github.com/myl1ne/template_copilot
- **Documentation**: See README_EMBEDDINGS.md for detailed usage
- **Demo Results**: Check experiments/outputs/ directory for visualizations
- **License**: MIT

---

*Last updated: 2026-02-04 | Version: 0.1.0*