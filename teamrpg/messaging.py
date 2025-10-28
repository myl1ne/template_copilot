"""
Messaging module for Slack-like communication between personas.

This module implements channels and messaging functionality.
"""

import json
import uuid
from typing import Dict, List, Optional, Set
from datetime import datetime


class Message:
    """Represents a message in a channel."""
    
    def __init__(
        self,
        content: str,
        author_id: str,
        channel_id: str,
        message_id: Optional[str] = None
    ):
        """
        Initialize a new Message.
        
        Args:
            content: The message content
            author_id: ID of the persona who sent the message
            channel_id: ID of the channel the message was sent in
            message_id: Optional unique identifier (generated if not provided)
        """
        self.id = message_id or str(uuid.uuid4())
        self.content = content
        self.author_id = author_id
        self.channel_id = channel_id
        self.timestamp = datetime.now().isoformat()
        self.reactions: Dict[str, List[str]] = {}  # emoji -> list of persona_ids
    
    def add_reaction(self, emoji: str, persona_id: str) -> None:
        """Add a reaction to the message."""
        if emoji not in self.reactions:
            self.reactions[emoji] = []
        if persona_id not in self.reactions[emoji]:
            self.reactions[emoji].append(persona_id)
    
    def to_dict(self) -> Dict:
        """Convert message to dictionary representation."""
        return {
            "id": self.id,
            "content": self.content,
            "author_id": self.author_id,
            "channel_id": self.channel_id,
            "timestamp": self.timestamp,
            "reactions": self.reactions
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Message':
        """Create a Message from dictionary representation."""
        message = cls(
            content=data["content"],
            author_id=data["author_id"],
            channel_id=data["channel_id"],
            message_id=data.get("id")
        )
        message.timestamp = data.get("timestamp", datetime.now().isoformat())
        message.reactions = data.get("reactions", {})
        return message


class Channel:
    """Represents a communication channel (like a Slack channel)."""
    
    def __init__(
        self,
        name: str,
        description: str,
        channel_type: str = "public",  # public or private
        channel_id: Optional[str] = None
    ):
        """
        Initialize a new Channel.
        
        Args:
            name: The channel's name
            description: Description of the channel's purpose
            channel_type: Type of channel (public or private)
            channel_id: Optional unique identifier (generated if not provided)
        """
        self.id = channel_id or str(uuid.uuid4())
        self.name = name
        self.description = description
        self.type = channel_type
        self.member_ids: Set[str] = set()
        self.messages: List[Message] = []
        self.created_at = datetime.now().isoformat()
    
    def add_member(self, persona_id: str) -> None:
        """Add a member to the channel."""
        self.member_ids.add(persona_id)
    
    def remove_member(self, persona_id: str) -> bool:
        """Remove a member from the channel."""
        if persona_id in self.member_ids:
            self.member_ids.remove(persona_id)
            return True
        return False
    
    def post_message(self, content: str, author_id: str) -> Message:
        """Post a message to the channel."""
        if author_id not in self.member_ids:
            raise ValueError(f"Persona {author_id} is not a member of this channel")
        message = Message(content, author_id, self.id)
        self.messages.append(message)
        return message
    
    def get_recent_messages(self, limit: int = 50) -> List[Message]:
        """Get the most recent messages from the channel."""
        return self.messages[-limit:]
    
    def to_dict(self) -> Dict:
        """Convert channel to dictionary representation."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "type": self.type,
            "member_ids": list(self.member_ids),
            "messages": [m.to_dict() for m in self.messages],
            "created_at": self.created_at
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Channel':
        """Create a Channel from dictionary representation."""
        channel = cls(
            name=data["name"],
            description=data["description"],
            channel_type=data.get("type", "public"),
            channel_id=data.get("id")
        )
        channel.member_ids = set(data.get("member_ids", []))
        channel.messages = [Message.from_dict(m) for m in data.get("messages", [])]
        channel.created_at = data.get("created_at", datetime.now().isoformat())
        return channel


class MessagingSystem:
    """Manages channels and messaging."""
    
    def __init__(self):
        """Initialize the MessagingSystem."""
        self.channels: Dict[str, Channel] = {}
    
    def create_channel(
        self,
        name: str,
        description: str,
        channel_type: str = "public"
    ) -> Channel:
        """Create a new channel."""
        channel = Channel(name, description, channel_type)
        self.channels[channel.id] = channel
        return channel
    
    def get_channel(self, channel_id: str) -> Optional[Channel]:
        """Get a channel by ID."""
        return self.channels.get(channel_id)
    
    def get_channel_by_name(self, name: str) -> Optional[Channel]:
        """Get a channel by name."""
        for channel in self.channels.values():
            if channel.name == name:
                return channel
        return None
    
    def list_channels(self) -> List[Channel]:
        """List all channels."""
        return list(self.channels.values())
    
    def get_channels_for_persona(self, persona_id: str) -> List[Channel]:
        """Get all channels that a persona is a member of."""
        return [
            channel for channel in self.channels.values()
            if persona_id in channel.member_ids
        ]
    
    def delete_channel(self, channel_id: str) -> bool:
        """Delete a channel by ID."""
        if channel_id in self.channels:
            del self.channels[channel_id]
            return True
        return False
    
    def save_to_file(self, filename: str) -> None:
        """Save all channels to a JSON file."""
        data = {
            "channels": [c.to_dict() for c in self.channels.values()]
        }
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
    
    def load_from_file(self, filename: str) -> None:
        """Load channels from a JSON file."""
        try:
            with open(filename, 'r') as f:
                data = json.load(f)
            for channel_data in data.get("channels", []):
                channel = Channel.from_dict(channel_data)
                self.channels[channel.id] = channel
        except FileNotFoundError:
            pass  # No file to load yet
