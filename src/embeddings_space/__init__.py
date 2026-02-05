"""
EmbeddingsSpace: Experimental visualization platform for conversation embeddings
"""

__version__ = "0.1.0"

from .core.embeddings import EmbeddingSpace
from .core.conversation import Conversation, ConversationManager
from .audit.llm_evaluator import LLMEvaluator, EvaluationMetrics
from .visualizers.base import BaseVisualizer
from .visualizers.embedding_viz import EmbeddingVisualizer
from .visualizers.metric_landscape import MetricLandscapeVisualizer
from .visualizers.som_viz import SOMVisualizer
from .visualizers.interactive_viz import InteractiveEmbeddingVisualizer
from .utils.importers import import_conversations, ChatGPTImporter, GenericJSONImporter
from .utils.model_builder import IterativeModelBuilder
from .utils.tagger import ConversationTagger

__all__ = [
    "EmbeddingSpace",
    "Conversation",
    "ConversationManager",
    "LLMEvaluator",
    "EvaluationMetrics",
    "BaseVisualizer",
    "EmbeddingVisualizer",
    "MetricLandscapeVisualizer",
    "SOMVisualizer",
    "InteractiveEmbeddingVisualizer",
    "import_conversations",
    "ChatGPTImporter",
    "GenericJSONImporter",
    "IterativeModelBuilder",
    "ConversationTagger",
]
