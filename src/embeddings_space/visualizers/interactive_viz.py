"""
Interactive visualizations using Plotly
"""

import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from typing import List, Optional, Dict, Any
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE

try:
    from umap import UMAP
    HAS_UMAP = True
except ImportError:
    HAS_UMAP = False

from ..core.conversation import Conversation


class InteractiveEmbeddingVisualizer:
    """
    Create interactive visualizations of embeddings using Plotly
    """
    
    def __init__(self, method: str = 'pca'):
        """
        Initialize the interactive visualizer
        
        Args:
            method: Dimensionality reduction method ('pca', 'tsne', 'umap')
        """
        self.method = method.lower()
        
        if self.method == 'umap' and not HAS_UMAP:
            print("UMAP not available, falling back to PCA")
            self.method = 'pca'
    
    def _reduce_dimensions(
        self, 
        embeddings: np.ndarray, 
        n_components: int = 2,
        **kwargs
    ) -> np.ndarray:
        """Reduce embedding dimensions"""
        if len(embeddings) < n_components:
            padding = np.zeros((n_components - len(embeddings), embeddings.shape[1]))
            embeddings = np.vstack([embeddings, padding])
        
        if self.method == 'pca':
            reducer = PCA(n_components=n_components, **kwargs)
        elif self.method == 'tsne':
            perplexity = min(30, max(5, len(embeddings) - 1))
            reducer = TSNE(n_components=n_components, perplexity=perplexity, **kwargs)
        elif self.method == 'umap':
            n_neighbors = min(15, max(2, len(embeddings) - 1))
            reducer = UMAP(n_components=n_components, n_neighbors=n_neighbors, **kwargs)
        else:
            raise ValueError(f"Unknown method: {self.method}")
        
        return reducer.fit_transform(embeddings)
    
    def create_2d_plot(
        self,
        conversations: List[Conversation],
        color_by: Optional[str] = None,
        title: Optional[str] = None,
        hover_data: Optional[List[str]] = None,
        **kwargs
    ) -> go.Figure:
        """
        Create an interactive 2D scatter plot
        
        Args:
            conversations: List of conversations with embeddings
            color_by: Metric name to color points by
            title: Plot title
            hover_data: Additional fields to show on hover
            **kwargs: Additional arguments for reduction method
            
        Returns:
            Plotly Figure object
        """
        # Extract embeddings
        embeddings = np.array([c.embedding for c in conversations if c.embedding is not None])
        conv_with_embeddings = [c for c in conversations if c.embedding is not None]
        
        if len(embeddings) == 0:
            raise ValueError("No conversations have embeddings")
        
        # Reduce dimensions
        reduced = self._reduce_dimensions(embeddings, n_components=2, **kwargs)
        
        # Prepare data for plotting
        plot_data = {
            'x': reduced[:, 0],
            'y': reduced[:, 1],
            'conversation_id': [c.conversation_id or f"C{i}" for i, c in enumerate(conv_with_embeddings)],
            'title': [c.metadata.get('title', 'Untitled')[:50] for c in conv_with_embeddings],
            'message_count': [len(c.messages) for c in conv_with_embeddings],
        }
        
        # Add color data if specified
        if color_by:
            plot_data[color_by] = [c.metrics.get(color_by, 0) for c in conv_with_embeddings]
        
        # Add hover data
        if hover_data:
            for field in hover_data:
                if field == 'preview':
                    # Add conversation preview
                    plot_data['preview'] = [
                        c.get_text()[:100] + "..." if len(c.get_text()) > 100 else c.get_text()
                        for c in conv_with_embeddings
                    ]
                elif field in conv_with_embeddings[0].metrics:
                    plot_data[field] = [c.metrics.get(field, 0) for c in conv_with_embeddings]
        
        # Create figure
        if color_by:
            fig = px.scatter(
                plot_data,
                x='x',
                y='y',
                color=color_by,
                hover_data=['conversation_id', 'title', 'message_count'] + (hover_data or []),
                title=title or f"Embedding Space ({self.method.upper()}) - Colored by {color_by}",
                color_continuous_scale='Viridis',
                labels={'x': 'Component 1', 'y': 'Component 2'}
            )
        else:
            fig = px.scatter(
                plot_data,
                x='x',
                y='y',
                hover_data=['conversation_id', 'title', 'message_count'] + (hover_data or []),
                title=title or f"Embedding Space ({self.method.upper()})",
                labels={'x': 'Component 1', 'y': 'Component 2'}
            )
        
        # Update layout for better interactivity
        fig.update_traces(marker=dict(size=10, opacity=0.7))
        fig.update_layout(
            hovermode='closest',
            width=900,
            height=700,
            showlegend=True
        )
        
        return fig
    
    def create_3d_plot(
        self,
        conversations: List[Conversation],
        color_by: Optional[str] = None,
        title: Optional[str] = None,
        **kwargs
    ) -> go.Figure:
        """
        Create an interactive 3D scatter plot
        
        Args:
            conversations: List of conversations with embeddings
            color_by: Metric name to color points by
            title: Plot title
            **kwargs: Additional arguments
            
        Returns:
            Plotly Figure object
        """
        # Extract embeddings
        embeddings = np.array([c.embedding for c in conversations if c.embedding is not None])
        conv_with_embeddings = [c for c in conversations if c.embedding is not None]
        
        if len(embeddings) == 0:
            raise ValueError("No conversations have embeddings")
        
        # Reduce dimensions
        reduced = self._reduce_dimensions(embeddings, n_components=3, **kwargs)
        
        # Prepare hover text
        hover_texts = []
        for i, c in enumerate(conv_with_embeddings):
            text = f"ID: {c.conversation_id or f'C{i}'}<br>"
            text += f"Title: {c.metadata.get('title', 'Untitled')[:50]}<br>"
            text += f"Messages: {len(c.messages)}<br>"
            if color_by and color_by in c.metrics:
                text += f"{color_by}: {c.metrics[color_by]:.2f}"
            hover_texts.append(text)
        
        # Create figure
        if color_by:
            colors = [c.metrics.get(color_by, 0) for c in conv_with_embeddings]
            
            fig = go.Figure(data=[go.Scatter3d(
                x=reduced[:, 0],
                y=reduced[:, 1],
                z=reduced[:, 2],
                mode='markers',
                marker=dict(
                    size=6,
                    color=colors,
                    colorscale='Viridis',
                    showscale=True,
                    colorbar=dict(title=color_by),
                    opacity=0.7
                ),
                text=hover_texts,
                hoverinfo='text'
            )])
        else:
            fig = go.Figure(data=[go.Scatter3d(
                x=reduced[:, 0],
                y=reduced[:, 1],
                z=reduced[:, 2],
                mode='markers',
                marker=dict(
                    size=6,
                    opacity=0.7
                ),
                text=hover_texts,
                hoverinfo='text'
            )])
        
        # Update layout
        fig.update_layout(
            title=title or f"3D Embedding Space ({self.method.upper()})",
            scene=dict(
                xaxis_title='Component 1',
                yaxis_title='Component 2',
                zaxis_title='Component 3'
            ),
            width=900,
            height=700
        )
        
        return fig
    
    def create_metric_comparison(
        self,
        conversations: List[Conversation],
        metrics: List[str],
        title: Optional[str] = None
    ) -> go.Figure:
        """
        Create a parallel coordinates plot comparing multiple metrics
        
        Args:
            conversations: List of conversations
            metrics: List of metric names to compare
            title: Plot title
            
        Returns:
            Plotly Figure object
        """
        # Prepare data
        data_dict = {
            'conversation_id': [c.conversation_id or f"C{i}" for i, c in enumerate(conversations)]
        }
        
        for metric in metrics:
            data_dict[metric] = [c.metrics.get(metric, 0) for c in conversations]
        
        # Create parallel coordinates plot
        fig = go.Figure(data=
            go.Parcoords(
                line=dict(
                    color=data_dict[metrics[0]],
                    colorscale='Viridis',
                    showscale=True,
                    cmin=0,
                    cmax=10
                ),
                dimensions=[
                    dict(
                        label=metric,
                        values=data_dict[metric],
                        range=[0, 10]
                    )
                    for metric in metrics
                ]
            )
        )
        
        fig.update_layout(
            title=title or "Multi-Metric Comparison",
            width=900,
            height=600
        )
        
        return fig
