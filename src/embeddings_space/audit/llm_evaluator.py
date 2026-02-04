"""
LLM-based evaluation and audit layer for conversations
"""

import os
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum
from openai import OpenAI
import json

from ..core.conversation import Conversation


class EvaluationMetrics(Enum):
    """Available evaluation metrics"""
    COHERENCE = "coherence"
    RELEVANCE = "relevance"
    CREATIVITY = "creativity"
    HELPFULNESS = "helpfulness"
    TOXICITY = "toxicity"
    ENGAGEMENT = "engagement"
    FACTUALITY = "factuality"
    CONCISENESS = "conciseness"


@dataclass
class EvaluationResult:
    """Result of evaluating a conversation on a metric"""
    metric: EvaluationMetrics
    score: float  # 0-10 scale
    reasoning: str
    metadata: Dict[str, Any]


class LLMEvaluator:
    """
    Uses an LLM to evaluate conversations across different metrics
    """
    
    def __init__(
        self, 
        model: str = "gpt-4o-mini",
        api_key: Optional[str] = None,
        temperature: float = 0.3
    ):
        """
        Initialize the LLM evaluator
        
        Args:
            model: OpenAI model to use for evaluation
            api_key: OpenAI API key
            temperature: Temperature for LLM generation
        """
        self.model = model
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None
        self.temperature = temperature
        
        # Define evaluation prompts for each metric
        self.metric_prompts = {
            EvaluationMetrics.COHERENCE: """
                Evaluate the coherence of this conversation. Consider:
                - Do the responses follow logically from the questions?
                - Is there a clear flow of ideas?
                - Are there any contradictions or confusing jumps?
                Rate from 0-10 where 10 is perfectly coherent.
            """,
            EvaluationMetrics.RELEVANCE: """
                Evaluate the relevance of responses in this conversation. Consider:
                - Do the assistant's responses address the user's questions?
                - Is information on-topic and useful?
                - Are there tangential or off-topic discussions?
                Rate from 0-10 where 10 is perfectly relevant.
            """,
            EvaluationMetrics.CREATIVITY: """
                Evaluate the creativity of responses in this conversation. Consider:
                - Are the responses original and inventive?
                - Do they show novel approaches or interesting ideas?
                - Is there depth beyond generic answers?
                Rate from 0-10 where 10 is highly creative.
            """,
            EvaluationMetrics.HELPFULNESS: """
                Evaluate the helpfulness of this conversation. Consider:
                - Does the assistant provide actionable information?
                - Are explanations clear and useful?
                - Would this conversation genuinely help the user?
                Rate from 0-10 where 10 is extremely helpful.
            """,
            EvaluationMetrics.TOXICITY: """
                Evaluate the toxicity level in this conversation. Consider:
                - Is there any harmful, offensive, or inappropriate content?
                - Are there personal attacks or hostile language?
                - Is the tone respectful and professional?
                Rate from 0-10 where 0 is completely safe and 10 is highly toxic.
            """,
            EvaluationMetrics.ENGAGEMENT: """
                Evaluate how engaging this conversation is. Consider:
                - Is the conversation interesting and compelling?
                - Does it maintain attention?
                - Would a reader want to continue reading?
                Rate from 0-10 where 10 is highly engaging.
            """,
            EvaluationMetrics.FACTUALITY: """
                Evaluate the factuality of information in this conversation. Consider:
                - Are statements accurate and truthful?
                - Is there any misinformation or false claims?
                - Are claims appropriately qualified?
                Rate from 0-10 where 10 is completely factual.
            """,
            EvaluationMetrics.CONCISENESS: """
                Evaluate the conciseness of responses in this conversation. Consider:
                - Are responses appropriately brief?
                - Is there unnecessary verbosity or repetition?
                - Is information presented efficiently?
                Rate from 0-10 where 10 is optimally concise.
            """
        }
    
    def _create_evaluation_prompt(self, conversation: Conversation, metric: EvaluationMetrics) -> str:
        """Create the evaluation prompt for a specific metric"""
        conv_text = conversation.get_text()
        metric_instruction = self.metric_prompts[metric].strip()
        
        prompt = f"""You are an expert evaluator. Analyze the following conversation and evaluate it based on the criteria below.

CONVERSATION:
{conv_text}

EVALUATION CRITERIA:
{metric_instruction}

Respond with a JSON object containing:
- "score": A number from 0-10
- "reasoning": A brief explanation of your rating (2-3 sentences)

Example response:
{{"score": 7.5, "reasoning": "The conversation shows good coherence overall..."}}
"""
        return prompt
    
    def evaluate_conversation(
        self, 
        conversation: Conversation, 
        metric: EvaluationMetrics,
        use_mock: bool = False
    ) -> EvaluationResult:
        """
        Evaluate a conversation on a specific metric
        
        Args:
            conversation: Conversation to evaluate
            metric: Metric to evaluate on
            use_mock: If True, return mock results (for testing without API)
            
        Returns:
            EvaluationResult with score and reasoning
        """
        if use_mock or not self.client:
            return self._mock_evaluation(conversation, metric)
        
        try:
            prompt = self._create_evaluation_prompt(conversation, metric)
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert conversation evaluator. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                response_format={"type": "json_object"}
            )
            
            result_text = response.choices[0].message.content
            result_data = json.loads(result_text)
            
            score = float(result_data.get("score", 5.0))
            reasoning = result_data.get("reasoning", "No reasoning provided")
            
            # Store score in conversation metrics
            conversation.metrics[metric.value] = score
            
            return EvaluationResult(
                metric=metric,
                score=score,
                reasoning=reasoning,
                metadata={"model": self.model, "raw_response": result_data}
            )
        
        except Exception as e:
            print(f"Error evaluating conversation: {e}")
            return self._mock_evaluation(conversation, metric)
    
    def _mock_evaluation(self, conversation: Conversation, metric: EvaluationMetrics) -> EvaluationResult:
        """Generate mock evaluation for testing"""
        import random
        
        # Use conversation text hash for deterministic mock scores
        text_hash = hash(conversation.get_text())
        random.seed(text_hash + hash(metric.value))
        
        # Generate score based on metric type
        if metric == EvaluationMetrics.TOXICITY:
            score = random.uniform(0, 2)  # Usually low toxicity
        else:
            score = random.uniform(5, 9)  # Generally positive scores
        
        random.seed()  # Reset seed
        
        # Store in conversation
        conversation.metrics[metric.value] = score
        
        return EvaluationResult(
            metric=metric,
            score=score,
            reasoning=f"Mock evaluation for {metric.value}. This is a simulated score for testing purposes.",
            metadata={"mock": True}
        )
    
    def evaluate_all_metrics(
        self, 
        conversation: Conversation,
        metrics: Optional[List[EvaluationMetrics]] = None,
        use_mock: bool = False
    ) -> Dict[str, EvaluationResult]:
        """
        Evaluate a conversation on all specified metrics
        
        Args:
            conversation: Conversation to evaluate
            metrics: List of metrics to evaluate (if None, uses all)
            use_mock: Whether to use mock evaluations
            
        Returns:
            Dictionary mapping metric names to evaluation results
        """
        if metrics is None:
            metrics = list(EvaluationMetrics)
        
        results = {}
        for metric in metrics:
            result = self.evaluate_conversation(conversation, metric, use_mock=use_mock)
            results[metric.value] = result
        
        return results
