"""
Conversation tagger for extracting keywords and topics
"""

import os
from typing import List, Dict, Set, Optional
from collections import Counter
import re
from openai import OpenAI
import json

from ..core.conversation import Conversation


class ConversationTagger:
    """
    Extracts keywords, topics, and tags from conversations
    """
    
    def __init__(
        self,
        model: str = "gpt-4o-mini",
        api_key: Optional[str] = None,
        temperature: float = 0.3
    ):
        """
        Initialize the conversation tagger
        
        Args:
            model: OpenAI model to use
            api_key: OpenAI API key
            temperature: Temperature for generation
        """
        self.model = model
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None
        self.temperature = temperature
        
        # Common stop words to filter out
        self.stop_words = {
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
            'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
            'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
            'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
            'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
            'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
            'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
            'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
            'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day',
            'most', 'us', 'is', 'was', 'are', 'been', 'has', 'had', 'were', 'said', 'did',
            'im', 'ive', 'dont', 'doesnt', 'didnt', 'youre', 'thats', 'cant', 'wont'
        }
    
    def extract_keywords_simple(
        self,
        conversation: Conversation,
        top_n: int = 10,
        min_length: int = 3
    ) -> List[str]:
        """
        Extract keywords using simple frequency analysis
        
        Args:
            conversation: Conversation to analyze
            top_n: Number of top keywords to return
            min_length: Minimum keyword length
            
        Returns:
            List of keywords
        """
        text = conversation.get_text().lower()
        
        # Remove punctuation and split into words
        words = re.findall(r'\b[a-z]+\b', text)
        
        # Filter out stop words and short words
        filtered_words = [
            word for word in words
            if word not in self.stop_words and len(word) >= min_length
        ]
        
        # Count frequencies
        word_counts = Counter(filtered_words)
        
        # Get top keywords
        keywords = [word for word, count in word_counts.most_common(top_n)]
        
        return keywords
    
    def extract_topics_llm(
        self,
        conversation: Conversation,
        use_mock: bool = False
    ) -> Dict[str, any]:
        """
        Extract topics and tags using LLM
        
        Args:
            conversation: Conversation to analyze
            use_mock: Whether to use mock mode
            
        Returns:
            Dictionary with topics, keywords, categories, and summary
        """
        if use_mock or not self.client:
            return self._mock_extract_topics(conversation)
        
        system_prompt = """You are an AI assistant that analyzes conversations and extracts structured information.
Your task is to identify:
- topics: Main topics discussed (3-5 topics)
- keywords: Important keywords and terms (5-10 keywords)
- categories: High-level categories the conversation belongs to (e.g., "Technology", "Science", "Personal", etc.)
- summary: A one-sentence summary of the conversation

Return a JSON object with these fields."""
        
        user_prompt = f"""Analyze this conversation and extract topics, keywords, categories, and a summary:

{conversation.get_text()}

Return the analysis as a JSON object."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=self.temperature,
                response_format={"type": "json_object"}
            )
            
            result_text = response.choices[0].message.content
            analysis = json.loads(result_text)
            
            return analysis
        
        except Exception as e:
            print(f"Error extracting topics: {e}")
            return self._mock_extract_topics(conversation)
    
    def _mock_extract_topics(self, conversation: Conversation) -> Dict[str, any]:
        """Generate mock topic extraction"""
        
        keywords = self.extract_keywords_simple(conversation, top_n=7)
        
        # Simple topic inference from keywords
        tech_keywords = {'programming', 'code', 'python', 'software', 'computer', 'data', 'algorithm'}
        science_keywords = {'quantum', 'physics', 'chemistry', 'biology', 'theory', 'research'}
        creative_keywords = {'writing', 'art', 'music', 'design', 'creative', 'story'}
        
        topics = []
        categories = []
        
        keyword_set = set(keywords)
        
        if keyword_set & tech_keywords:
            topics.append("Technology and Programming")
            categories.append("Technology")
        
        if keyword_set & science_keywords:
            topics.append("Scientific Concepts")
            categories.append("Science")
        
        if keyword_set & creative_keywords:
            topics.append("Creative Work")
            categories.append("Arts")
        
        if not topics:
            topics = ["General Discussion"]
            categories = ["General"]
        
        # Get title from metadata or generate from keywords
        title = conversation.metadata.get('title', 'Untitled')
        
        return {
            "topics": topics[:5],
            "keywords": keywords[:10],
            "categories": list(set(categories))[:3],
            "summary": f"Conversation about {', '.join(topics[:2]) if len(topics) > 1 else topics[0]}"
        }
    
    def tag_conversations(
        self,
        conversations: List[Conversation],
        use_mock: bool = False
    ) -> None:
        """
        Tag multiple conversations and store results in metadata
        
        Args:
            conversations: List of conversations to tag
            use_mock: Whether to use mock mode
        """
        for conversation in conversations:
            # Extract topics and tags
            analysis = self.extract_topics_llm(conversation, use_mock=use_mock)
            
            # Store in conversation metadata
            conversation.metadata['tags'] = analysis.get('keywords', [])
            conversation.metadata['topics'] = analysis.get('topics', [])
            conversation.metadata['categories'] = analysis.get('categories', [])
            conversation.metadata['summary'] = analysis.get('summary', '')
