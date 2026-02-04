"""
Base visualizer class
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import matplotlib.pyplot as plt
import numpy as np

from ..core.conversation import Conversation


class BaseVisualizer(ABC):
    """
    Abstract base class for all visualizers
    """
    
    def __init__(self, figsize: tuple = (12, 8), style: str = 'seaborn-v0_8-darkgrid'):
        """
        Initialize the visualizer
        
        Args:
            figsize: Figure size for matplotlib plots
            style: Matplotlib style to use
        """
        self.figsize = figsize
        try:
            plt.style.use(style)
        except:
            plt.style.use('default')
    
    @abstractmethod
    def visualize(self, conversations: List[Conversation], **kwargs) -> plt.Figure:
        """
        Create a visualization from conversations
        
        Args:
            conversations: List of conversations to visualize
            **kwargs: Additional visualization parameters
            
        Returns:
            Matplotlib figure
        """
        pass
    
    def save_figure(self, fig: plt.Figure, filepath: str, dpi: int = 300) -> None:
        """
        Save a figure to file
        
        Args:
            fig: Matplotlib figure
            filepath: Path to save the figure
            dpi: Resolution for saved figure
        """
        fig.savefig(filepath, dpi=dpi, bbox_inches='tight')
        print(f"Figure saved to {filepath}")
    
    def show(self, fig: plt.Figure) -> None:
        """
        Display a figure
        
        Args:
            fig: Matplotlib figure to display
        """
        plt.show()
    
    def close(self, fig: plt.Figure) -> None:
        """
        Close a figure
        
        Args:
            fig: Matplotlib figure to close
        """
        plt.close(fig)
