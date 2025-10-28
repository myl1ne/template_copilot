"""
AI Agent module for LLM-powered persona behavior.

This module integrates with OpenAI to enable personas to make decisions
and generate responses based on their context.
"""

import os
from typing import List, Dict, Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


class AIAgent:
    """Handles AI-powered decision making for personas."""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the AIAgent.
        
        Args:
            api_key: OpenAI API key (uses OPENAI_API_KEY env var if not provided)
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
        self.client = OpenAI(api_key=self.api_key)
    
    def generate_response(
        self,
        system_prompt: str,
        context: List[Dict[str, str]],
        user_prompt: str,
        model: str = "gpt-3.5-turbo",
        temperature: float = 0.7
    ) -> str:
        """
        Generate a response using OpenAI's API.
        
        Args:
            system_prompt: System prompt defining the persona
            context: List of previous messages for context
            user_prompt: The current prompt to respond to
            model: OpenAI model to use
            temperature: Temperature for response generation
            
        Returns:
            Generated response text
        """
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(context)
        messages.append({"role": "user", "content": user_prompt})
        
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating response: {str(e)}"
    
    def decide_action(
        self,
        system_prompt: str,
        context: str,
        available_actions: List[str],
        model: str = "gpt-3.5-turbo"
    ) -> str:
        """
        Have the AI decide which action to take.
        
        Args:
            system_prompt: System prompt defining the persona
            context: Current context/situation
            available_actions: List of possible actions
            model: OpenAI model to use
            
        Returns:
            Chosen action
        """
        actions_str = "\n".join(f"{i+1}. {action}" for i, action in enumerate(available_actions))
        prompt = f"""Given the following context:
{context}

Available actions:
{actions_str}

Choose the most appropriate action by responding with ONLY the number (1-{len(available_actions)}) of your choice."""
        
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=10
            )
            choice = response.choices[0].message.content.strip()
            # Extract the number from the response
            try:
                action_idx = int(choice) - 1
                if 0 <= action_idx < len(available_actions):
                    return available_actions[action_idx]
            except ValueError:
                pass
            # Default to first action if parsing fails
            return available_actions[0]
        except Exception as e:
            print(f"Error deciding action: {str(e)}")
            return available_actions[0]
    
    def generate_work_update(
        self,
        system_prompt: str,
        project_description: str,
        previous_updates: List[str],
        model: str = "gpt-3.5-turbo"
    ) -> str:
        """
        Generate a work update for a project.
        
        Args:
            system_prompt: System prompt defining the persona
            project_description: Description of the project
            previous_updates: Previous updates on the project
            model: OpenAI model to use
            
        Returns:
            Generated work update
        """
        prev_updates_str = "\n".join(f"- {update}" for update in previous_updates[-5:])
        prompt = f"""Project: {project_description}

Previous updates:
{prev_updates_str if prev_updates_str else "No previous updates"}

Generate a brief progress update on what you're working on for this project. Keep it concise and specific."""
        
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=150
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"Working on the project... (Error: {str(e)})"
