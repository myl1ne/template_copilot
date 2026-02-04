"""
Embeddings computation and management
"""

import os
from typing import List, Optional, Dict, Any
import numpy as np
from openai import OpenAI
from .conversation import Conversation, ConversationManager


class EmbeddingSpace:
    """
    Manages the computation and storage of embeddings for conversations.
    Provides methods to map conversations to embedding vectors.
    """
    
    def __init__(self, model: str = "text-embedding-3-small", api_key: Optional[str] = None):
        """
        Initialize the embedding space
        
        Args:
            model: OpenAI embedding model to use
            api_key: OpenAI API key (if None, reads from OPENAI_API_KEY env var)
        """
        self.model = model
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None
        self.embedding_cache: Dict[str, List[float]] = {}
    
    def get_embedding(self, text: str, use_cache: bool = True) -> List[float]:
        """
        Get embedding vector for a given text
        
        Args:
            text: Text to embed
            use_cache: Whether to use cached embeddings
            
        Returns:
            List of floats representing the embedding vector
        """
        if not self.client:
            # Return mock embedding if no API key is available
            return self._mock_embedding(text)
        
        # Check cache
        if use_cache and text in self.embedding_cache:
            return self.embedding_cache[text]
        
        try:
            response = self.client.embeddings.create(
                input=text,
                model=self.model
            )
            embedding = response.data[0].embedding
            
            # Cache the result
            if use_cache:
                self.embedding_cache[text] = embedding
            
            return embedding
        except Exception as e:
            print(f"Error getting embedding: {e}")
            return self._mock_embedding(text)
    
    def _mock_embedding(self, text: str, dim: int = 1536) -> List[float]:
        """
        Generate a mock embedding based on text hash (for testing without API key)
        
        Args:
            text: Text to create mock embedding for
            dim: Dimension of the embedding
            
        Returns:
            Mock embedding vector
        """
        # Use hash for deterministic mock embeddings
        np.random.seed(hash(text) % (2**32))
        embedding = np.random.randn(dim).tolist()
        np.random.seed()  # Reset seed
        return embedding
    
    def embed_conversation(self, conversation: Conversation) -> List[float]:
        """
        Compute embedding for a conversation
        
        Args:
            conversation: Conversation to embed
            
        Returns:
            Embedding vector
        """
        text = conversation.get_text()
        embedding = self.get_embedding(text)
        conversation.embedding = embedding
        return embedding
    
    def embed_conversations(self, conversations: List[Conversation]) -> np.ndarray:
        """
        Compute embeddings for multiple conversations
        
        Args:
            conversations: List of conversations to embed
            
        Returns:
            Array of embeddings (n_conversations x embedding_dim)
        """
        embeddings = []
        for conv in conversations:
            if conv.embedding is None:
                self.embed_conversation(conv)
            embeddings.append(conv.embedding)
        return np.array(embeddings)
    
    def find_similar_conversations(
        self, 
        query_embedding: List[float], 
        conversations: List[Conversation],
        top_k: int = 5
    ) -> List[tuple[Conversation, float]]:
        """
        Find conversations most similar to a query embedding
        
        Args:
            query_embedding: Query embedding vector
            conversations: List of conversations to search
            top_k: Number of top results to return
            
        Returns:
            List of (conversation, similarity_score) tuples
        """
        query_vec = np.array(query_embedding)
        similarities = []
        
        for conv in conversations:
            if conv.embedding is None:
                continue
            
            conv_vec = np.array(conv.embedding)
            # Cosine similarity
            similarity = np.dot(query_vec, conv_vec) / (
                np.linalg.norm(query_vec) * np.linalg.norm(conv_vec)
            )
            similarities.append((conv, similarity))
        
        # Sort by similarity (descending)
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]
    
    def compute_embedding_stats(self, embeddings: np.ndarray) -> Dict[str, Any]:
        """
        Compute statistics about the embedding space
        
        Args:
            embeddings: Array of embeddings
            
        Returns:
            Dictionary of statistics
        """
        return {
            'n_embeddings': len(embeddings),
            'embedding_dim': embeddings.shape[1] if len(embeddings) > 0 else 0,
            'mean': np.mean(embeddings, axis=0).tolist() if len(embeddings) > 0 else [],
            'std': np.std(embeddings, axis=0).tolist() if len(embeddings) > 0 else [],
            'min': np.min(embeddings, axis=0).tolist() if len(embeddings) > 0 else [],
            'max': np.max(embeddings, axis=0).tolist() if len(embeddings) > 0 else [],
        }
