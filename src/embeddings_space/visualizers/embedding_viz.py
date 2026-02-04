"""
Embedding space visualization using dimensionality reduction
"""

import numpy as np
import matplotlib.pyplot as plt
from typing import List, Optional, Dict, Any
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import warnings
warnings.filterwarnings('ignore')

try:
    from umap import UMAP
    HAS_UMAP = True
except ImportError:
    HAS_UMAP = False

from .base import BaseVisualizer
from ..core.conversation import Conversation


class EmbeddingVisualizer(BaseVisualizer):
    """
    Visualize embeddings in 2D or 3D using dimensionality reduction
    """
    
    def __init__(self, method: str = 'umap', **kwargs):
        """
        Initialize the embedding visualizer
        
        Args:
            method: Dimensionality reduction method ('pca', 'tsne', 'umap')
            **kwargs: Additional arguments for BaseVisualizer
        """
        super().__init__(**kwargs)
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
        """
        Reduce embedding dimensions
        
        Args:
            embeddings: High-dimensional embeddings
            n_components: Number of dimensions to reduce to (2 or 3)
            **kwargs: Additional arguments for reduction method
            
        Returns:
            Reduced embeddings
        """
        if len(embeddings) < n_components:
            print(f"Warning: Not enough samples ({len(embeddings)}) for {n_components}D reduction")
            # Pad with zeros if needed
            padding = np.zeros((n_components - len(embeddings), embeddings.shape[1]))
            embeddings = np.vstack([embeddings, padding])
        
        if self.method == 'pca':
            reducer = PCA(n_components=n_components, **kwargs)
        elif self.method == 'tsne':
            perplexity = min(30, len(embeddings) - 1)
            reducer = TSNE(n_components=n_components, perplexity=perplexity, **kwargs)
        elif self.method == 'umap':
            n_neighbors = min(15, len(embeddings) - 1)
            reducer = UMAP(n_components=n_components, n_neighbors=n_neighbors, **kwargs)
        else:
            raise ValueError(f"Unknown method: {self.method}")
        
        return reducer.fit_transform(embeddings)
    
    def visualize(
        self, 
        conversations: List[Conversation],
        color_by: Optional[str] = None,
        n_components: int = 2,
        title: Optional[str] = None,
        show_labels: bool = False,
        **kwargs
    ) -> plt.Figure:
        """
        Create a 2D or 3D visualization of embeddings
        
        Args:
            conversations: List of conversations with embeddings
            color_by: Metric name to color points by
            n_components: Number of dimensions (2 or 3)
            title: Plot title
            show_labels: Whether to show conversation IDs as labels
            **kwargs: Additional arguments for reduction method
            
        Returns:
            Matplotlib figure
        """
        # Extract embeddings
        embeddings = np.array([c.embedding for c in conversations if c.embedding is not None])
        
        if len(embeddings) == 0:
            raise ValueError("No conversations have embeddings")
        
        # Reduce dimensions
        reduced = self._reduce_dimensions(embeddings, n_components=n_components, **kwargs)
        
        # Create figure
        fig = plt.figure(figsize=self.figsize)
        
        if n_components == 3:
            ax = fig.add_subplot(111, projection='3d')
        else:
            ax = fig.add_subplot(111)
        
        # Determine colors
        colors = None
        if color_by:
            colors = [c.metrics.get(color_by, 0) for c in conversations if c.embedding is not None]
            colors = np.array(colors)
        
        # Plot
        if n_components == 3:
            if colors is not None:
                scatter = ax.scatter(
                    reduced[:, 0], reduced[:, 1], reduced[:, 2],
                    c=colors, cmap='viridis', s=100, alpha=0.6
                )
                plt.colorbar(scatter, ax=ax, label=color_by)
            else:
                ax.scatter(
                    reduced[:, 0], reduced[:, 1], reduced[:, 2],
                    s=100, alpha=0.6
                )
            ax.set_xlabel('Component 1')
            ax.set_ylabel('Component 2')
            ax.set_zlabel('Component 3')
        else:
            if colors is not None:
                scatter = ax.scatter(
                    reduced[:, 0], reduced[:, 1],
                    c=colors, cmap='viridis', s=100, alpha=0.6
                )
                plt.colorbar(scatter, ax=ax, label=color_by)
            else:
                ax.scatter(
                    reduced[:, 0], reduced[:, 1],
                    s=100, alpha=0.6
                )
            ax.set_xlabel('Component 1')
            ax.set_ylabel('Component 2')
        
        # Add labels if requested
        if show_labels and n_components == 2:
            for i, conv in enumerate([c for c in conversations if c.embedding is not None]):
                ax.annotate(
                    conv.conversation_id or f"C{i}",
                    (reduced[i, 0], reduced[i, 1]),
                    fontsize=8,
                    alpha=0.7
                )
        
        # Set title
        if title is None:
            title = f"Embedding Space Visualization ({self.method.upper()})"
            if color_by:
                title += f" - Colored by {color_by}"
        ax.set_title(title)
        
        plt.tight_layout()
        return fig
    
    def visualize_with_metrics(
        self,
        conversations: List[Conversation],
        metrics: List[str],
        n_components: int = 2,
        **kwargs
    ) -> Dict[str, plt.Figure]:
        """
        Create multiple visualizations, one for each metric
        
        Args:
            conversations: List of conversations
            metrics: List of metric names to visualize
            n_components: Number of dimensions
            **kwargs: Additional arguments
            
        Returns:
            Dictionary mapping metric names to figures
        """
        figures = {}
        for metric in metrics:
            try:
                fig = self.visualize(
                    conversations,
                    color_by=metric,
                    n_components=n_components,
                    title=f"Embeddings colored by {metric}",
                    **kwargs
                )
                figures[metric] = fig
            except Exception as e:
                print(f"Error creating visualization for {metric}: {e}")
        
        return figures
