# EmbeddingsSpace: Conversation Visualization Platform 🗺️

An experimental platform for visualizing and analyzing conversation embeddings using LLM-based evaluations and advanced visualization techniques.

[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Overview

EmbeddingsSpace is a powerful toolkit for:
- **Mapping conversations to embedding vectors** using OpenAI's embedding models
- **Evaluating conversations** across multiple metrics using LLM-based audit layers
- **Visualizing embedding spaces** in 2D/3D with dimensionality reduction (PCA, t-SNE, UMAP)
- **Identifying interesting regions** (peaks/valleys) in metric landscapes
- **Interpolating metrics** across unexplored embedding space using Self-Organizing Maps (SOMs)

## 🚀 Quick Start

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

```python
from embeddings_space import (
    Conversation, 
    EmbeddingSpace, 
    LLMEvaluator,
    EmbeddingVisualizer
)

# Create a conversation
conv = Conversation()
conv.add_message("user", "Explain quantum computing")
conv.add_message("assistant", "Quantum computing uses quantum mechanics...")

# Compute embedding
embedding_space = EmbeddingSpace()
embedding_space.embed_conversation(conv)

# Evaluate with LLM
evaluator = LLMEvaluator()
result = evaluator.evaluate_conversation(conv, EvaluationMetrics.COHERENCE)
print(f"Coherence score: {result.score}")

# Visualize
viz = EmbeddingVisualizer(method='pca')
fig = viz.visualize([conv], color_by='coherence')
viz.save_figure(fig, 'embedding_viz.png')
```

### Run the Demo

```bash
# Set OpenAI API key (optional - will use mock data if not set)
export OPENAI_API_KEY='your-api-key-here'

# Run the comprehensive demo
python experiments/demo.py
```

The demo will:
1. Create 20 diverse sample conversations
2. Compute embeddings for each conversation
3. Evaluate conversations across multiple metrics
4. Generate 10+ visualizations
5. Identify interesting regions (peaks and valleys)
6. Save all results to `experiments/outputs/`

## 📊 Features

### 1. Conversation Management

```python
from embeddings_space import Conversation, ConversationManager

# Create and manage conversations
manager = ConversationManager()
conv = Conversation(conversation_id="conv_1")
conv.add_message("user", "Hello!")
conv.add_message("assistant", "Hi there!")
manager.add_conversation(conv)

# Filter by metrics
high_quality = manager.filter_by_metric('coherence', 8.0, 'greater')
```

### 2. Embedding Computation

```python
from embeddings_space import EmbeddingSpace

# Initialize with OpenAI API
embedding_space = EmbeddingSpace(model="text-embedding-3-small")

# Embed single conversation
embedding = embedding_space.embed_conversation(conv)

# Embed multiple conversations
embeddings = embedding_space.embed_conversations([conv1, conv2, conv3])

# Find similar conversations
similar = embedding_space.find_similar_conversations(
    query_embedding, 
    all_conversations, 
    top_k=5
)
```

### 3. LLM-Based Evaluation

```python
from embeddings_space import LLMEvaluator, EvaluationMetrics

evaluator = LLMEvaluator(model="gpt-4o-mini")

# Evaluate on a single metric
result = evaluator.evaluate_conversation(conv, EvaluationMetrics.CREATIVITY)

# Evaluate on all metrics
results = evaluator.evaluate_all_metrics(conv)

# Available metrics:
# - COHERENCE: Logical flow and consistency
# - RELEVANCE: On-topic and addressing questions
# - CREATIVITY: Originality and novel ideas
# - HELPFULNESS: Actionable and useful information
# - TOXICITY: Harmful or inappropriate content (0=safe, 10=toxic)
# - ENGAGEMENT: Interesting and compelling
# - FACTUALITY: Accuracy of information
# - CONCISENESS: Brevity and efficiency
```

### 4. Embedding Space Visualization

```python
from embeddings_space import EmbeddingVisualizer

# 2D visualization with PCA
viz = EmbeddingVisualizer(method='pca')
fig = viz.visualize(conversations, color_by='coherence', n_components=2)

# 3D visualization with UMAP
viz = EmbeddingVisualizer(method='umap')
fig = viz.visualize(conversations, color_by='creativity', n_components=3)

# Create multiple views for different metrics
figures = viz.visualize_with_metrics(
    conversations, 
    metrics=['coherence', 'creativity', 'helpfulness']
)
```

### 5. Metric Landscape Analysis

```python
from embeddings_space import MetricLandscapeVisualizer

landscape = MetricLandscapeVisualizer()

# Contour map
fig = landscape.visualize_contour(conversations, 'engagement')

# 3D surface plot
fig = landscape.visualize_3d_surface(conversations, 'coherence')

# Find peaks (mountains) and valleys
fig = landscape.visualize_peaks_and_valleys(conversations, 'helpfulness')

# Get peak/valley positions
features = landscape.find_peaks_and_valleys(conversations, 'creativity')
print(f"Found {len(features['peaks'])} peaks and {len(features['valleys'])} valleys")
```

### 6. Self-Organizing Maps (SOM)

```python
from embeddings_space import SOMVisualizer
import numpy as np

som_viz = SOMVisualizer(som_size=(10, 10))

# Train SOM
embeddings = np.array([c.embedding for c in conversations])
som_viz.train_som(embeddings, num_iterations=1000)

# Visualize hit map
fig = som_viz.visualize(conversations)

# Visualize metric interpolation
fig = som_viz.visualize(conversations, metric_name='coherence')

# Find high-value regions
regions = som_viz.find_regions_of_interest(
    conversations,
    'engagement',
    threshold=7.5,
    comparison='greater'
)
print(f"Found {len(regions)} high-engagement regions")

# Visualize multiple metrics at once
fig = som_viz.visualize_multiple_metrics(
    conversations,
    metrics=['coherence', 'creativity', 'helpfulness', 'engagement']
)
```

## 📈 Experimental Results

The demo generates comprehensive visualizations:

1. **Embedding Space Projections** - Shows how conversations cluster in reduced dimensions
2. **Metric-Colored Embeddings** - Reveals patterns in quality metrics across the space
3. **3D Visualizations** - Interactive exploration of embedding space
4. **Contour Maps** - Topographic view of metric landscapes
5. **3D Surface Plots** - Mountains and valleys in metric distributions
6. **Peak/Valley Detection** - Automated identification of interesting regions
7. **SOM Hit Maps** - Density of conversations in organized space
8. **Metric Interpolation** - Predicted metric values for unexplored regions
9. **Multi-Metric Grids** - Comparative view of different evaluation dimensions

### Key Insights from Demo

- **Embedding dimension**: 1536 (using text-embedding-3-small)
- **Sample size**: 20 diverse conversations
- **Metric statistics**:
  - Coherence: mean=7.00 (±1.03)
  - Creativity: mean=7.11 (±1.17)
  - Helpfulness: mean=7.08 (±0.92)
  - Engagement: mean=7.16 (±1.29)

- **Spatial patterns**: Conversations naturally cluster by topic and style
- **Metric landscapes**: Clear peaks and valleys indicate regions of high/low quality
- **SOM interpolation**: Successfully predicts metric values in unexplored space

## 🏗️ Architecture

```
embeddings_space/
├── core/
│   ├── conversation.py      # Conversation data structures
│   └── embeddings.py         # Embedding computation
├── audit/
│   └── llm_evaluator.py     # LLM-based evaluation
└── visualizers/
    ├── base.py              # Base visualizer class
    ├── embedding_viz.py     # 2D/3D embedding plots
    ├── metric_landscape.py  # Contour and surface plots
    └── som_viz.py           # Self-organizing maps
```

## 🔬 Use Cases

1. **Conversation Quality Analysis**: Evaluate and visualize the quality of chatbot conversations
2. **Training Data Selection**: Identify high-quality examples for fine-tuning
3. **Anomaly Detection**: Find unusual or problematic conversations
4. **Topic Clustering**: Discover natural groupings in conversation data
5. **Metric Interpolation**: Predict quality scores for new conversation types
6. **A/B Testing**: Compare conversation strategies across embedding space

## 🛠️ Advanced Usage

### Custom Metrics

You can extend the evaluation system with custom metrics:

```python
from embeddings_space.audit.llm_evaluator import LLMEvaluator

class CustomEvaluator(LLMEvaluator):
    def evaluate_custom_metric(self, conversation):
        # Your custom evaluation logic
        pass
```

### Batch Processing

Process large conversation datasets efficiently:

```python
from embeddings_space import ConversationManager

manager = ConversationManager()
manager.load_from_json('conversations.json')

# Batch embed
embedding_space.embed_conversations(manager.conversations)

# Batch evaluate
for conv in manager.conversations:
    evaluator.evaluate_all_metrics(conv, use_mock=False)

# Save results
manager.save_to_json('analyzed_conversations.json')
```

## 📝 Requirements

- Python 3.8+
- OpenAI API key (optional - mock mode available for testing)
- Key dependencies:
  - numpy, pandas
  - scikit-learn, umap-learn, minisom
  - matplotlib, plotly, seaborn
  - openai

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional dimensionality reduction methods
- More evaluation metrics
- Interactive visualizations (Plotly, Bokeh)
- Real-time conversation analysis
- Export to other formats

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- OpenAI for embedding and evaluation models
- scikit-learn, UMAP, and MiniSOM communities
- Visualization libraries: matplotlib, plotly, seaborn

---

**Built with ❤️ for conversation analysis and visualization**
