"""
Iterative model builder for creating and updating user profiles from conversations
"""

import os
from typing import Optional, Dict, Any
from openai import OpenAI
import json

from ..core.conversation import Conversation


class IterativeModelBuilder:
    """
    Builds and updates models iteratively by processing conversations
    """
    
    def __init__(
        self,
        model: str = "gpt-4o-mini",
        api_key: Optional[str] = None,
        temperature: float = 0.5
    ):
        """
        Initialize the iterative model builder
        
        Args:
            model: OpenAI model to use
            api_key: OpenAI API key
            temperature: Temperature for generation
        """
        self.model = model
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None
        self.temperature = temperature
    
    def build_or_update_model(
        self,
        conversation: Conversation,
        current_model: Optional[Dict[str, Any]] = None,
        prompt_template: Optional[str] = None,
        use_mock: bool = False
    ) -> Dict[str, Any]:
        """
        Build or update a model based on a conversation
        
        Args:
            conversation: Conversation to process
            current_model: Current state of the model (None for first iteration)
            prompt_template: Custom prompt template with {model} and {conversation} placeholders
            use_mock: Whether to use mock mode
            
        Returns:
            Updated model as a dictionary
        """
        if use_mock or not self.client:
            return self._mock_build_model(conversation, current_model)
        
        # Default prompt template
        if prompt_template is None:
            prompt_template = """You are maintaining a profile of a user. You already built profile {model}. You are reading a conversation that this user had: {conversation}. Your role is to return an updated profile following the same structure."""
        
        # Format the prompt
        model_str = json.dumps(current_model, indent=2) if current_model else "{}"
        conversation_str = conversation.get_text()
        
        prompt = prompt_template.format(
            model=model_str,
            conversation=conversation_str
        )
        
        system_prompt = """You are an AI assistant that builds and maintains user profiles. 
Your task is to analyze conversations and create/update a structured user profile.
The profile should include:
- interests: List of user's interests and topics they discuss
- expertise_areas: Areas where the user shows knowledge or asks questions
- communication_style: How the user communicates (formal, casual, technical, etc.)
- goals: Apparent goals or objectives from conversations
- language_patterns: Notable language patterns or preferences

Always return a valid JSON object with these fields."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                response_format={"type": "json_object"}
            )
            
            result_text = response.choices[0].message.content
            updated_model = json.loads(result_text)
            
            return updated_model
        
        except Exception as e:
            print(f"Error building model: {e}")
            return self._mock_build_model(conversation, current_model)
    
    def _mock_build_model(
        self, 
        conversation: Conversation, 
        current_model: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate a mock user profile"""
        
        # Extract some basic info from conversation
        text = conversation.get_text().lower()
        
        # Initialize or update model
        if current_model is None:
            model = {
                "interests": [],
                "expertise_areas": [],
                "communication_style": "conversational",
                "goals": [],
                "language_patterns": [],
                "conversation_count": 0
            }
        else:
            model = current_model.copy()
        
        # Update conversation count
        model["conversation_count"] = model.get("conversation_count", 0) + 1
        
        # Simple keyword extraction for interests
        interest_keywords = [
            "quantum", "computing", "programming", "python", "ai", "machine learning",
            "data", "science", "art", "music", "writing", "philosophy", "history"
        ]
        
        for keyword in interest_keywords:
            if keyword in text and keyword not in model["interests"]:
                model["interests"].append(keyword)
        
        # Limit list sizes
        model["interests"] = model["interests"][:10]
        
        return model
    
    def batch_build_model(
        self,
        conversations: List[Conversation],
        initial_model: Optional[Dict[str, Any]] = None,
        prompt_template: Optional[str] = None,
        use_mock: bool = False
    ) -> Dict[str, Any]:
        """
        Build a model by processing multiple conversations iteratively
        
        Args:
            conversations: List of conversations to process
            initial_model: Starting model state
            prompt_template: Custom prompt template
            use_mock: Whether to use mock mode
            
        Returns:
            Final model after processing all conversations
        """
        model = initial_model
        
        for conversation in conversations:
            model = self.build_or_update_model(
                conversation=conversation,
                current_model=model,
                prompt_template=prompt_template,
                use_mock=use_mock
            )
        
        return model
