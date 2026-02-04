"""
Self-Organizing Map (SOM) visualization for embedding space interpolation
"""

import numpy as np
import matplotlib.pyplot as plt
from typing import List, Optional, Dict, Any, Tuple
from minisom import MiniSom

from .base import BaseVisualizer
from ..core.conversation import Conversation


class SOMVisualizer(BaseVisualizer):
    """
    Visualize embeddings using Self-Organizing Maps (SOMs)
    This allows interpolation of metrics across the embedding space
    """
    
    def __init__(self, som_size: Tuple[int, int] = (10, 10), **kwargs):
        """
        Initialize the SOM visualizer
        
        Args:
            som_size: Size of the SOM grid (rows, cols)
            **kwargs: Additional arguments for BaseVisualizer
        """
        super().__init__(**kwargs)
        self.som_size = som_size
        self.som = None
        self.trained_embeddings = None
    
    def train_som(
        self, 
        embeddings: np.ndarray,
        num_iterations: int = 1000,
        learning_rate: float = 0.5,
        sigma: float = 1.0
    ) -> None:
        """
        Train a Self-Organizing Map on embeddings
        
        Args:
            embeddings: Array of embeddings to train on
            num_iterations: Number of training iterations
            learning_rate: Initial learning rate
            sigma: Initial neighborhood radius
        """
        if len(embeddings) == 0:
            raise ValueError("No embeddings provided for training")
        
        # Initialize SOM
        self.som = MiniSom(
            self.som_size[0], 
            self.som_size[1], 
            embeddings.shape[1],
            sigma=sigma,
            learning_rate=learning_rate,
            random_seed=42
        )
        
        # Train
        print(f"Training SOM with {len(embeddings)} samples...")
        self.som.train_random(embeddings, num_iterations)
        self.trained_embeddings = embeddings
        print("SOM training complete")
    
    def map_conversations_to_som(
        self, 
        conversations: List[Conversation]
    ) -> Dict[Tuple[int, int], List[Conversation]]:
        """
        Map conversations to SOM grid positions
        
        Args:
            conversations: List of conversations with embeddings
            
        Returns:
            Dictionary mapping (row, col) positions to conversations
        """
        if self.som is None:
            raise ValueError("SOM not trained. Call train_som first.")
        
        mapping = {}
        for conv in conversations:
            if conv.embedding is None:
                continue
            
            # Find winner neuron
            winner = self.som.winner(np.array(conv.embedding))
            
            if winner not in mapping:
                mapping[winner] = []
            mapping[winner].append(conv)
        
        return mapping
    
    def interpolate_metric(
        self,
        conversations: List[Conversation],
        metric_name: str
    ) -> np.ndarray:
        """
        Interpolate metric values across the SOM grid
        
        Args:
            conversations: List of conversations with embeddings and metrics
            metric_name: Name of the metric to interpolate
            
        Returns:
            2D array of interpolated metric values
        """
        if self.som is None:
            raise ValueError("SOM not trained. Call train_som first.")
        
        # Initialize grid
        metric_grid = np.zeros(self.som_size)
        count_grid = np.zeros(self.som_size)
        
        # Map conversations to grid and accumulate metric values
        for conv in conversations:
            if conv.embedding is None or metric_name not in conv.metrics:
                continue
            
            winner = self.som.winner(np.array(conv.embedding))
            metric_grid[winner] += conv.metrics[metric_name]
            count_grid[winner] += 1
        
        # Average where we have data
        mask = count_grid > 0
        metric_grid[mask] /= count_grid[mask]
        
        # Interpolate for empty cells
        from scipy.ndimage import gaussian_filter
        
        # Fill in missing values with smoothed version
        if not np.all(mask):
            # Use Gaussian smoothing to interpolate
            smoothed = gaussian_filter(metric_grid, sigma=1.5)
            metric_grid[~mask] = smoothed[~mask]
        
        return metric_grid
    
    def visualize(
        self,
        conversations: List[Conversation],
        metric_name: Optional[str] = None,
        title: Optional[str] = None,
        show_conversations: bool = True,
        **kwargs
    ) -> plt.Figure:
        """
        Visualize the SOM with optional metric overlay
        
        Args:
            conversations: List of conversations
            metric_name: Metric to visualize (if None, shows hit map)
            title: Plot title
            show_conversations: Whether to show conversation positions
            **kwargs: Additional arguments
            
        Returns:
            Matplotlib figure
        """
        # Extract embeddings and train if needed
        embeddings = np.array([c.embedding for c in conversations if c.embedding is not None])
        
        if self.som is None:
            self.train_som(embeddings)
        
        fig, ax = plt.subplots(figsize=self.figsize)
        
        if metric_name:
            # Interpolate and visualize metric
            metric_grid = self.interpolate_metric(conversations, metric_name)
            
            im = ax.imshow(
                metric_grid,
                cmap='viridis',
                interpolation='bilinear',
                origin='lower'
            )
            plt.colorbar(im, ax=ax, label=metric_name)
            
            if title is None:
                title = f"SOM: {metric_name} Landscape"
        else:
            # Show hit map (how many samples map to each cell)
            hit_map = np.zeros(self.som_size)
            for conv in conversations:
                if conv.embedding is not None:
                    winner = self.som.winner(np.array(conv.embedding))
                    hit_map[winner] += 1
            
            im = ax.imshow(
                hit_map,
                cmap='hot',
                interpolation='nearest',
                origin='lower'
            )
            plt.colorbar(im, ax=ax, label='Number of conversations')
            
            if title is None:
                title = "SOM: Hit Map"
        
        # Optionally show conversation positions
        if show_conversations and metric_name:
            mapping = self.map_conversations_to_som(conversations)
            for (row, col), convs in mapping.items():
                ax.plot(col, row, 'r.', markersize=8, alpha=0.6)
        
        ax.set_title(title)
        ax.set_xlabel('SOM X')
        ax.set_ylabel('SOM Y')
        plt.tight_layout()
        
        return fig
    
    def find_regions_of_interest(
        self,
        conversations: List[Conversation],
        metric_name: str,
        threshold: float,
        comparison: str = 'greater'
    ) -> List[Tuple[int, int]]:
        """
        Find regions in the SOM where a metric is above/below a threshold
        (mountains or valleys in the metric landscape)
        
        Args:
            conversations: List of conversations
            metric_name: Metric to analyze
            threshold: Threshold value
            comparison: 'greater' or 'less'
            
        Returns:
            List of (row, col) positions of interest
        """
        metric_grid = self.interpolate_metric(conversations, metric_name)
        
        if comparison == 'greater':
            mask = metric_grid > threshold
        else:
            mask = metric_grid < threshold
        
        positions = np.argwhere(mask)
        return [tuple(pos) for pos in positions]
    
    def visualize_multiple_metrics(
        self,
        conversations: List[Conversation],
        metrics: List[str],
        **kwargs
    ) -> plt.Figure:
        """
        Create a grid of SOM visualizations for multiple metrics
        
        Args:
            conversations: List of conversations
            metrics: List of metric names
            **kwargs: Additional arguments
            
        Returns:
            Matplotlib figure with subplots
        """
        n_metrics = len(metrics)
        n_cols = min(3, n_metrics)
        n_rows = (n_metrics + n_cols - 1) // n_cols
        
        fig, axes = plt.subplots(n_rows, n_cols, figsize=(6*n_cols, 5*n_rows))
        if n_metrics == 1:
            axes = [axes]
        else:
            axes = axes.flatten() if n_rows > 1 else axes
        
        # Extract and train SOM if needed
        embeddings = np.array([c.embedding for c in conversations if c.embedding is not None])
        if self.som is None:
            self.train_som(embeddings)
        
        for idx, metric in enumerate(metrics):
            ax = axes[idx]
            
            try:
                metric_grid = self.interpolate_metric(conversations, metric)
                im = ax.imshow(
                    metric_grid,
                    cmap='viridis',
                    interpolation='bilinear',
                    origin='lower'
                )
                plt.colorbar(im, ax=ax, label=metric)
                ax.set_title(f"{metric}")
            except Exception as e:
                ax.text(0.5, 0.5, f"Error: {str(e)}", ha='center', va='center')
                ax.set_title(f"{metric} (error)")
            
            ax.set_xlabel('SOM X')
            ax.set_ylabel('SOM Y')
        
        # Hide extra subplots
        for idx in range(n_metrics, len(axes)):
            axes[idx].set_visible(False)
        
        plt.tight_layout()
        return fig
