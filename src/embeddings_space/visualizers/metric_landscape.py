"""
Metric landscape visualization - finding mountains and valleys
"""

import numpy as np
import matplotlib.pyplot as plt
from typing import List, Optional, Dict, Tuple
from scipy.ndimage import gaussian_filter
from sklearn.decomposition import PCA

from .base import BaseVisualizer
from ..core.conversation import Conversation


class MetricLandscapeVisualizer(BaseVisualizer):
    """
    Visualize metrics as a landscape (3D surface or contour plot)
    to identify mountains (high metric values) and valleys (low values)
    """
    
    def __init__(self, grid_resolution: int = 50, **kwargs):
        """
        Initialize the metric landscape visualizer
        
        Args:
            grid_resolution: Resolution of the interpolation grid
            **kwargs: Additional arguments for BaseVisualizer
        """
        super().__init__(**kwargs)
        self.grid_resolution = grid_resolution
    
    def _project_to_2d(self, embeddings: np.ndarray) -> np.ndarray:
        """Project embeddings to 2D using PCA"""
        if embeddings.shape[1] == 2:
            return embeddings
        
        pca = PCA(n_components=2)
        return pca.fit_transform(embeddings)
    
    def _interpolate_metric_grid(
        self,
        positions_2d: np.ndarray,
        metric_values: np.ndarray
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Interpolate metric values on a regular grid
        
        Returns:
            X grid, Y grid, Z (metric) grid
        """
        # Create regular grid
        x_min, x_max = positions_2d[:, 0].min(), positions_2d[:, 0].max()
        y_min, y_max = positions_2d[:, 1].min(), positions_2d[:, 1].max()
        
        # Add padding
        x_range = x_max - x_min
        y_range = y_max - y_min
        x_min -= 0.1 * x_range
        x_max += 0.1 * x_range
        y_min -= 0.1 * y_range
        y_max += 0.1 * y_range
        
        xi = np.linspace(x_min, x_max, self.grid_resolution)
        yi = np.linspace(y_min, y_max, self.grid_resolution)
        X, Y = np.meshgrid(xi, yi)
        
        # Interpolate using griddata
        from scipy.interpolate import griddata
        
        Z = griddata(
            positions_2d,
            metric_values,
            (X, Y),
            method='cubic',
            fill_value=np.nan
        )
        
        # Fill NaN values with smoothed version
        if np.any(np.isnan(Z)):
            # Replace NaN with mean
            Z_filled = Z.copy()
            Z_filled[np.isnan(Z)] = np.nanmean(Z)
            # Smooth
            Z = gaussian_filter(Z_filled, sigma=2.0)
        
        return X, Y, Z
    
    def visualize_3d_surface(
        self,
        conversations: List[Conversation],
        metric_name: str,
        title: Optional[str] = None,
        colormap: str = 'viridis',
        **kwargs
    ) -> plt.Figure:
        """
        Create a 3D surface plot of the metric landscape
        
        Args:
            conversations: List of conversations with embeddings and metrics
            metric_name: Name of metric to visualize
            title: Plot title
            colormap: Colormap to use
            **kwargs: Additional arguments
            
        Returns:
            Matplotlib figure
        """
        # Extract data
        embeddings = []
        metric_values = []
        
        for conv in conversations:
            if conv.embedding is not None and metric_name in conv.metrics:
                embeddings.append(conv.embedding)
                metric_values.append(conv.metrics[metric_name])
        
        if len(embeddings) == 0:
            raise ValueError(f"No conversations with embeddings and {metric_name} metric")
        
        embeddings = np.array(embeddings)
        metric_values = np.array(metric_values)
        
        # Project to 2D
        positions_2d = self._project_to_2d(embeddings)
        
        # Interpolate on grid
        X, Y, Z = self._interpolate_metric_grid(positions_2d, metric_values)
        
        # Create 3D plot
        fig = plt.figure(figsize=self.figsize)
        ax = fig.add_subplot(111, projection='3d')
        
        surf = ax.plot_surface(
            X, Y, Z,
            cmap=colormap,
            alpha=0.8,
            linewidth=0,
            antialiased=True
        )
        
        # Add scatter points for actual data
        ax.scatter(
            positions_2d[:, 0],
            positions_2d[:, 1],
            metric_values,
            c='red',
            s=50,
            alpha=0.6,
            label='Actual conversations'
        )
        
        # Labels
        ax.set_xlabel('Embedding PC1')
        ax.set_ylabel('Embedding PC2')
        ax.set_zlabel(metric_name)
        
        if title is None:
            title = f"Metric Landscape: {metric_name}"
        ax.set_title(title)
        
        # Colorbar
        fig.colorbar(surf, ax=ax, shrink=0.5, aspect=5)
        
        ax.legend()
        plt.tight_layout()
        
        return fig
    
    def visualize_contour(
        self,
        conversations: List[Conversation],
        metric_name: str,
        title: Optional[str] = None,
        levels: int = 20,
        show_points: bool = True,
        **kwargs
    ) -> plt.Figure:
        """
        Create a contour plot of the metric landscape
        
        Args:
            conversations: List of conversations
            metric_name: Metric to visualize
            title: Plot title
            levels: Number of contour levels
            show_points: Whether to show actual conversation points
            **kwargs: Additional arguments
            
        Returns:
            Matplotlib figure
        """
        # Extract data
        embeddings = []
        metric_values = []
        
        for conv in conversations:
            if conv.embedding is not None and metric_name in conv.metrics:
                embeddings.append(conv.embedding)
                metric_values.append(conv.metrics[metric_name])
        
        if len(embeddings) == 0:
            raise ValueError(f"No conversations with embeddings and {metric_name} metric")
        
        embeddings = np.array(embeddings)
        metric_values = np.array(metric_values)
        
        # Project to 2D
        positions_2d = self._project_to_2d(embeddings)
        
        # Interpolate on grid
        X, Y, Z = self._interpolate_metric_grid(positions_2d, metric_values)
        
        # Create contour plot
        fig, ax = plt.subplots(figsize=self.figsize)
        
        contour = ax.contourf(X, Y, Z, levels=levels, cmap='viridis', alpha=0.8)
        contour_lines = ax.contour(X, Y, Z, levels=levels, colors='black', alpha=0.3, linewidths=0.5)
        
        # Add contour labels
        ax.clabel(contour_lines, inline=True, fontsize=8)
        
        # Colorbar
        plt.colorbar(contour, ax=ax, label=metric_name)
        
        # Show actual points
        if show_points:
            scatter = ax.scatter(
                positions_2d[:, 0],
                positions_2d[:, 1],
                c=metric_values,
                cmap='viridis',
                s=100,
                edgecolors='black',
                linewidth=1,
                alpha=0.9
            )
        
        # Labels
        ax.set_xlabel('Embedding PC1')
        ax.set_ylabel('Embedding PC2')
        
        if title is None:
            title = f"Contour Map: {metric_name}"
        ax.set_title(title)
        
        plt.tight_layout()
        return fig
    
    def find_peaks_and_valleys(
        self,
        conversations: List[Conversation],
        metric_name: str,
        prominence: float = 0.5
    ) -> Dict[str, List[Tuple[float, float, float]]]:
        """
        Find local maxima (peaks/mountains) and minima (valleys)
        
        Args:
            conversations: List of conversations
            metric_name: Metric to analyze
            prominence: Minimum prominence for peaks/valleys
            
        Returns:
            Dictionary with 'peaks' and 'valleys' lists of (x, y, value) tuples
        """
        from scipy.signal import find_peaks as scipy_find_peaks
        
        # Extract data
        embeddings = []
        metric_values = []
        
        for conv in conversations:
            if conv.embedding is not None and metric_name in conv.metrics:
                embeddings.append(conv.embedding)
                metric_values.append(conv.metrics[metric_name])
        
        if len(embeddings) == 0:
            return {'peaks': [], 'valleys': []}
        
        embeddings = np.array(embeddings)
        metric_values = np.array(metric_values)
        
        # Project to 2D
        positions_2d = self._project_to_2d(embeddings)
        
        # Interpolate on grid
        X, Y, Z = self._interpolate_metric_grid(positions_2d, metric_values)
        
        # Find peaks (along each row and column)
        peaks = []
        valleys = []
        
        # Simple approach: find local maxima and minima in the grid
        from scipy.ndimage import maximum_filter, minimum_filter
        
        # Find local maxima
        max_filtered = maximum_filter(Z, size=3)
        maxima_mask = (Z == max_filtered) & (Z > np.percentile(Z, 75))
        
        # Find local minima
        min_filtered = minimum_filter(Z, size=3)
        minima_mask = (Z == min_filtered) & (Z < np.percentile(Z, 25))
        
        # Get positions
        peak_positions = np.argwhere(maxima_mask)
        for pos in peak_positions:
            i, j = pos
            peaks.append((X[i, j], Y[i, j], Z[i, j]))
        
        valley_positions = np.argwhere(minima_mask)
        for pos in valley_positions:
            i, j = pos
            valleys.append((X[i, j], Y[i, j], Z[i, j]))
        
        return {'peaks': peaks, 'valleys': valleys}
    
    def visualize_peaks_and_valleys(
        self,
        conversations: List[Conversation],
        metric_name: str,
        title: Optional[str] = None,
        **kwargs
    ) -> plt.Figure:
        """
        Visualize metric landscape with peaks and valleys highlighted
        
        Args:
            conversations: List of conversations
            metric_name: Metric to visualize
            title: Plot title
            **kwargs: Additional arguments
            
        Returns:
            Matplotlib figure
        """
        # Create contour plot
        fig = self.visualize_contour(
            conversations,
            metric_name,
            title=title,
            show_points=False,
            **kwargs
        )
        
        ax = fig.axes[0]
        
        # Find and mark peaks and valleys
        features = self.find_peaks_and_valleys(conversations, metric_name)
        
        # Mark peaks (mountains)
        if features['peaks']:
            peaks_array = np.array(features['peaks'])
            ax.scatter(
                peaks_array[:, 0], peaks_array[:, 1],
                marker='^', s=200, c='red', edgecolors='darkred',
                linewidths=2, alpha=0.8, label=f'Peaks (n={len(features["peaks"])})'
            )
        
        # Mark valleys
        if features['valleys']:
            valleys_array = np.array(features['valleys'])
            ax.scatter(
                valleys_array[:, 0], valleys_array[:, 1],
                marker='v', s=200, c='blue', edgecolors='darkblue',
                linewidths=2, alpha=0.8, label=f'Valleys (n={len(features["valleys"])})'
            )
        
        ax.legend()
        
        if title is None:
            ax.set_title(f"Peaks and Valleys: {metric_name}")
        
        return fig
