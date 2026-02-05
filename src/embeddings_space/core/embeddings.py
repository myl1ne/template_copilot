"""
Embeddings computation and management
"""

import os
from typing import List, Optional, Dict, Any
import numpy as np
from openai import OpenAI
import tiktoken
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
        self.max_tokens = 8191  # Leave 1 token for safety
        
        # Initialize tokenizer for token counting
        try:
            self.tokenizer = tiktoken.encoding_for_model(model)
        except KeyError:
            # Fallback to cl100k_base encoding if model not found
            self.tokenizer = tiktoken.get_encoding("cl100k_base")
    
    def _truncate_text(self, text: str) -> str:
        """
        Truncate text to fit within model's token limit
        
        Args:
            text: Text to truncate
            
        Returns:
            Truncated text that fits within token limit
        """
        tokens = self.tokenizer.encode(text)
        if len(tokens) <= self.max_tokens:
            return text
        
        # Truncate tokens and decode back to text
        truncated_tokens = tokens[:self.max_tokens]
        truncated_text = self.tokenizer.decode(truncated_tokens)
        print(f"Warning: Text truncated from {len(tokens)} to {self.max_tokens} tokens")
        return truncated_text
    
    def summarize_conversation(self, conversation: Conversation, max_summary_tokens: int = 7000) -> str:
        """
        Generate a summary of a conversation using an LLM
        
        Args:
            conversation: Conversation to summarize
            max_summary_tokens: Maximum tokens for the summary (default 7000, leaving room for prompt)
            
        Returns:
            Summary text
        """
        if not self.client:
            # Return truncated text if no API key
            return self._truncate_text(conversation.get_text())
        
        text = conversation.get_text()
        tokens = self.tokenizer.encode(text)
        
        # If already under limit, no need to summarize
        if len(tokens) <= self.max_tokens:
            print(f"Conversation {conversation.conversation_id} is already under token limit ({len(tokens)} tokens)")
            return text
        
        print(f"Summarizing conversation {conversation.conversation_id} ({len(tokens)} tokens -> target ~{max_summary_tokens} tokens)")
        
        try:
            # For very long conversations, extract beginning, middle, and end
            max_input_tokens = 6000  # Leave room for prompt overhead (system message, instructions, etc.)
            
            if len(tokens) > max_input_tokens:
                # Take first 40%, middle 20%, and last 40% of the conversation
                first_chunk_size = int(max_input_tokens * 0.4)
                middle_chunk_size = int(max_input_tokens * 0.2)
                last_chunk_size = max_input_tokens - first_chunk_size - middle_chunk_size
                
                first_tokens = tokens[:first_chunk_size]
                middle_start = (len(tokens) - middle_chunk_size) // 2
                middle_tokens = tokens[middle_start:middle_start + middle_chunk_size]
                last_tokens = tokens[-last_chunk_size:]
                
                # Reconstruct text from sampled tokens
                sampled_text = (
                    self.tokenizer.decode(first_tokens) +
                    "\n\n[... middle section ...]\n\n" +
                    self.tokenizer.decode(middle_tokens) +
                    "\n\n[... later section ...]\n\n" +
                    self.tokenizer.decode(last_tokens)
                )
                conversation_text = sampled_text
            else:
                conversation_text = text
            
            # Create summarization prompt
            prompt = f"""Summarize the following conversation comprehensively but concisely. Capture:
- Main topics and themes discussed
- Key questions asked by the user
- Important information and insights provided
- Overall flow and progression of the conversation
- Any significant conclusions or outcomes

Keep the summary detailed enough to preserve the conversation's essence and context, but aim for approximately {max_summary_tokens} tokens or less.

CONVERSATION:
{conversation_text}

SUMMARY:"""
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Use efficient model for summarization
                messages=[
                    {"role": "system", "content": "You are an expert at creating comprehensive yet concise summaries of conversations."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=max_summary_tokens
            )
            
            summary = response.choices[0].message.content
            summary_tokens = len(self.tokenizer.encode(summary))
            print(f"Generated summary: {summary_tokens} tokens")
            
            return summary
            
        except Exception as e:
            print(f"Error summarizing conversation: {e}")
            # Fallback to truncation
            return self._truncate_text(text)
    
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
        
        # Truncate text if needed
        text = self._truncate_text(text)
        
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
    
    def embed_conversation(self, conversation: Conversation, use_summary: bool = True) -> List[float]:
        """
        Compute embedding for a conversation
        
        Args:
            conversation: Conversation to embed
            use_summary: If True, generate/use summary for long conversations
            
        Returns:
            Embedding vector
        """
        # Get or generate summary for long conversations
        if use_summary:
            if conversation.summary is None:
                # Check if conversation is long
                text = conversation.get_text()
                tokens = self.tokenizer.encode(text)
                if len(tokens) > self.max_tokens:
                    conversation.summary = self.summarize_conversation(conversation)
                else:
                    conversation.summary = text
            text = conversation.summary
        else:
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
