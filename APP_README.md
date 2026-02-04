# Interactive EmbeddingsSpace Explorer

An interactive web application for visualizing and exploring conversation embeddings with ChatGPT conversation import support.

## Features

### 🔍 Browse Conversations
- Search conversations by content or title
- Sort by date, title, or length
- View full conversation details
- See quality metrics at a glance

### 🗺️ Interactive Visualizations
- 2D and 3D embedding space visualizations
- Multiple dimensionality reduction methods (PCA, t-SNE, UMAP)
- Color-code by quality metrics
- Hover to see conversation details
- Zoom, pan, and rotate for exploration

### 📊 Analytics
- Summary statistics for all metrics
- Distribution plots
- Top conversations by any metric
- Multi-metric comparison views

### 📥 Data Import
- Upload ChatGPT export files (JSON or ZIP)
- Automatic conversation parsing
- Sample data for quick testing
- Support for custom JSON formats

## Quick Start

### Installation

```bash
# Install dependencies
pip install -r requirements.txt
```

### Running the App

```bash
# Launch the Streamlit app
streamlit run app.py
```

The app will open in your browser at `http://localhost:8501`

## Usage Guide

### 1. Import Your Data

**Option A: ChatGPT Export**
1. Go to ChatGPT settings
2. Export your data (you'll receive an email with a download link)
3. Download the ZIP file
4. In the app, click "Upload ChatGPT Export"
5. Select your downloaded ZIP or the `conversations.json` file

**Option B: Sample Data**
- Click "Load Sample Data" to try the app with example conversations

### 2. Process Conversations

1. **Compute Embeddings**: Click to generate vector embeddings for each conversation
   - Uses OpenAI's text-embedding-3-small model (1536 dimensions)
   - Falls back to mock embeddings if no API key is set

2. **Evaluate with LLM**: Click to evaluate conversations across quality metrics
   - Evaluates: coherence, relevance, creativity, helpfulness, engagement
   - Uses mock mode by default (set `OPENAI_API_KEY` for real evaluations)

### 3. Explore Your Data

**Browse Tab**
- Use the search box to find specific conversations
- Click on any conversation to expand and read it
- View quality metrics for each conversation

**Visualize Tab**
- Choose reduction method (PCA, t-SNE, or UMAP)
- Select 2D or 3D visualization
- Color points by any quality metric
- Hover over points to see conversation details
- Click and drag to rotate (3D) or pan (2D)

**Analytics Tab**
- View summary statistics across all metrics
- See distribution plots for each metric
- Find top-rated conversations by any metric

## Configuration

### OpenAI API Key

For real embeddings and evaluations, set your API key:

```bash
export OPENAI_API_KEY='your-api-key-here'
```

Or create a `.env` file:
```
OPENAI_API_KEY=your-api-key-here
```

Without an API key, the app uses mock data for testing.

## ChatGPT Export Format

The app expects ChatGPT exports in the standard format:

```json
[
  {
    "id": "conversation-id",
    "title": "Conversation Title",
    "create_time": 1234567890,
    "mapping": {
      "node-id": {
        "message": {
          "author": {"role": "user"},
          "content": {"parts": ["Message text"]}
        },
        "parent": "parent-node-id",
        "children": ["child-node-id"]
      }
    }
  }
]
```

## Screenshots

### Browse View
Browse and search through your conversations with full-text search and metadata filtering.

### Interactive 2D Visualization
Explore your conversations in 2D embedding space, colored by quality metrics.

### 3D Embedding Space
Rotate and explore conversations in 3D space with interactive controls.

### Analytics Dashboard
View distribution plots and summary statistics for all quality metrics.

## Tips

- **Large Datasets**: Processing many conversations may take time. Start with embeddings, then evaluate.
- **Visualization Performance**: For >100 conversations, consider using PCA for faster visualization
- **Search**: Search works across conversation content and titles
- **Metrics**: Higher scores (closer to 10) indicate better quality on that dimension

## Troubleshooting

**Problem**: "No conversations have embeddings"
- **Solution**: Click "Compute Embeddings" in the sidebar first

**Problem**: Slow visualization
- **Solution**: Use PCA instead of t-SNE/UMAP for large datasets

**Problem**: Can't upload file
- **Solution**: Ensure file is JSON or ZIP format from ChatGPT export

## Technical Details

- **Framework**: Streamlit
- **Visualizations**: Plotly (interactive)
- **Embeddings**: OpenAI text-embedding-3-small (1536-dim)
- **Evaluation**: OpenAI GPT-4o-mini
- **Reduction**: scikit-learn (PCA, t-SNE), UMAP

## Future Enhancements

- [ ] Real-time conversation evaluation
- [ ] Conversation comparison tool
- [ ] Export filtered conversations
- [ ] Custom metric definitions
- [ ] Batch operations
- [ ] Conversation clustering

---

**Version**: 0.2.0  
**Last Updated**: February 2026
