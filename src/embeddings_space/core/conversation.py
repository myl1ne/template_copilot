"""
Conversation data structures and management
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from datetime import datetime
import json


@dataclass
class Message:
    """Represents a single message in a conversation"""
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert message to dictionary"""
        return {
            'role': self.role,
            'content': self.content,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'metadata': self.metadata
        }


@dataclass
class Conversation:
    """Represents a complete conversation with messages and metadata"""
    messages: List[Message] = field(default_factory=list)
    conversation_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    embedding: Optional[List[float]] = None
    metrics: Dict[str, float] = field(default_factory=dict)
    
    def add_message(self, role: str, content: str, **kwargs) -> None:
        """Add a message to the conversation"""
        message = Message(
            role=role,
            content=content,
            timestamp=datetime.now(),
            metadata=kwargs
        )
        self.messages.append(message)
    
    def get_text(self) -> str:
        """Get the full conversation as formatted text"""
        text_parts = []
        for msg in self.messages:
            text_parts.append(f"{msg.role.upper()}: {msg.content}")
        return "\n".join(text_parts)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert conversation to dictionary"""
        return {
            'conversation_id': self.conversation_id,
            'messages': [msg.to_dict() for msg in self.messages],
            'metadata': self.metadata,
            'embedding': self.embedding,
            'metrics': self.metrics
        }
    
    def to_json(self) -> str:
        """Convert conversation to JSON string"""
        return json.dumps(self.to_dict(), indent=2)


class ConversationManager:
    """Manages multiple conversations"""
    
    def __init__(self):
        self.conversations: List[Conversation] = []
    
    def add_conversation(self, conversation: Conversation) -> None:
        """Add a conversation to the manager"""
        if conversation.conversation_id is None:
            conversation.conversation_id = f"conv_{len(self.conversations)}"
        self.conversations.append(conversation)
    
    def get_conversation(self, conversation_id: str) -> Optional[Conversation]:
        """Get a conversation by ID"""
        for conv in self.conversations:
            if conv.conversation_id == conversation_id:
                return conv
        return None
    
    def get_all_embeddings(self) -> List[List[float]]:
        """Get all embeddings from conversations that have them"""
        return [conv.embedding for conv in self.conversations if conv.embedding is not None]
    
    def get_all_metrics(self, metric_name: str) -> List[float]:
        """Get a specific metric from all conversations"""
        metrics = []
        for conv in self.conversations:
            if metric_name in conv.metrics:
                metrics.append(conv.metrics[metric_name])
        return metrics
    
    def filter_by_metric(self, metric_name: str, threshold: float, 
                        comparison: str = 'greater') -> List[Conversation]:
        """Filter conversations by metric value"""
        filtered = []
        for conv in self.conversations:
            if metric_name not in conv.metrics:
                continue
            
            value = conv.metrics[metric_name]
            if comparison == 'greater' and value > threshold:
                filtered.append(conv)
            elif comparison == 'less' and value < threshold:
                filtered.append(conv)
            elif comparison == 'equal' and abs(value - threshold) < 0.01:
                filtered.append(conv)
        
        return filtered
    
    def save_to_json(self, filepath: str) -> None:
        """Save all conversations to a JSON file"""
        data = {
            'conversations': [conv.to_dict() for conv in self.conversations]
        }
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
    
    def load_from_json(self, filepath: str) -> None:
        """Load conversations from a JSON file"""
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        self.conversations = []
        for conv_data in data.get('conversations', []):
            conv = Conversation(
                conversation_id=conv_data.get('conversation_id'),
                metadata=conv_data.get('metadata', {}),
                embedding=conv_data.get('embedding'),
                metrics=conv_data.get('metrics', {})
            )
            
            for msg_data in conv_data.get('messages', []):
                conv.add_message(
                    role=msg_data['role'],
                    content=msg_data['content']
                )
            
            self.conversations.append(conv)
