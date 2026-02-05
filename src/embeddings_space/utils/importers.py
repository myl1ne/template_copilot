"""
Utilities for importing conversations from various sources
"""

import json
from typing import List, Dict, Any, Optional
from pathlib import Path
import zipfile
import io

from ..core.conversation import Conversation, Message


class ChatGPTImporter:
    """
    Import conversations from ChatGPT export format
    
    ChatGPT exports come as JSON files with the following structure:
    - conversations.json containing array of conversation objects
    - Each conversation has 'mapping' with message nodes
    """
    
    @staticmethod
    def import_from_file(filepath: str) -> List[Conversation]:
        """
        Import conversations from a ChatGPT export JSON file
        
        Args:
            filepath: Path to conversations.json or a zip file containing it
            
        Returns:
            List of Conversation objects
        """
        filepath = Path(filepath)
        
        # Handle zip files
        if filepath.suffix == '.zip':
            return ChatGPTImporter._import_from_zip(filepath)
        
        # Handle JSON files
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return ChatGPTImporter._parse_chatgpt_data(data)
    
    @staticmethod
    def _import_from_zip(zip_path: Path) -> List[Conversation]:
        """Import from a zip file containing conversations.json"""
        with zipfile.ZipFile(zip_path, 'r') as zip_file:
            # Look for conversations.json
            json_files = [f for f in zip_file.namelist() if f.endswith('conversations.json')]
            
            if not json_files:
                raise ValueError("No conversations.json found in zip file")
            
            # Read the first conversations.json found
            with zip_file.open(json_files[0]) as f:
                data = json.load(f)
            
            return ChatGPTImporter._parse_chatgpt_data(data)
    
    @staticmethod
    def _parse_chatgpt_data(data: Any) -> List[Conversation]:
        """
        Parse ChatGPT export data structure
        
        Args:
            data: Parsed JSON data from ChatGPT export
            
        Returns:
            List of Conversation objects
        """
        conversations = []
        
        # Data can be a list of conversations or a single conversation
        conv_list = data if isinstance(data, list) else [data]
        
        for conv_data in conv_list:
            try:
                conv = ChatGPTImporter._parse_single_conversation(conv_data)
                if conv and len(conv.messages) > 0:
                    conversations.append(conv)
            except Exception as e:
                print(f"Warning: Failed to parse conversation: {e}")
                continue
        
        return conversations
    
    @staticmethod
    def _parse_single_conversation(conv_data: Dict[str, Any]) -> Optional[Conversation]:
        """Parse a single conversation from ChatGPT format"""
        
        # Extract metadata
        conversation_id = conv_data.get('id', conv_data.get('conversation_id'))
        title = conv_data.get('title', 'Untitled')
        create_time = conv_data.get('create_time')
        update_time = conv_data.get('update_time')
        
        # Create conversation object
        conv = Conversation(conversation_id=conversation_id)
        conv.metadata = {
            'title': title,
            'create_time': create_time,
            'update_time': update_time,
            'source': 'chatgpt'
        }
        
        # Parse messages from mapping
        mapping = conv_data.get('mapping', {})
        
        # Build message tree
        messages_in_order = ChatGPTImporter._extract_messages_from_mapping(mapping)
        
        # Add messages to conversation
        for msg in messages_in_order:
            conv.messages.append(msg)
        
        return conv
    
    @staticmethod
    def _extract_messages_from_mapping(mapping: Dict[str, Any]) -> List[Message]:
        """
        Extract messages from ChatGPT's mapping structure
        
        The mapping is a tree structure where each node can have children.
        We need to traverse it to get the main conversation thread.
        """
        if not mapping:
            return []
        
        messages = []
        
        # Find root node (node with no parent)
        root_id = None
        for node_id, node_data in mapping.items():
            if node_data.get('parent') is None:
                root_id = node_id
                break
        
        if root_id is None:
            return []
        
        # Traverse from root, following children
        current_id = root_id
        visited = set()
        
        while current_id and current_id not in visited:
            visited.add(current_id)
            node = mapping.get(current_id)
            
            if node and 'message' in node and node['message']:
                msg_data = node['message']
                
                # Extract message content
                role = msg_data.get('author', {}).get('role', 'unknown')
                content_parts = msg_data.get('content', {}).get('parts', [])
                
                # Combine content parts
                content = '\n'.join([str(part) for part in content_parts if part])
                
                if content.strip():
                    # Create Message object
                    message = Message(
                        role=role,
                        content=content,
                        metadata={
                            'id': msg_data.get('id'),
                            'create_time': msg_data.get('create_time'),
                        }
                    )
                    messages.append(message)
            
            # Move to first child
            children = node.get('children', []) if node else []
            current_id = children[0] if children else None
        
        return messages


class GenericJSONImporter:
    """
    Import conversations from generic JSON format
    
    Expected format:
    {
        "conversations": [
            {
                "id": "conv_1",
                "messages": [
                    {"role": "user", "content": "..."},
                    {"role": "assistant", "content": "..."}
                ]
            }
        ]
    }
    """
    
    @staticmethod
    def import_from_file(filepath: str) -> List[Conversation]:
        """Import from generic JSON format"""
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        conversations = []
        conv_list = data.get('conversations', [])
        
        for conv_data in conv_list:
            conv = Conversation(conversation_id=conv_data.get('id'))
            conv.metadata = conv_data.get('metadata', {})
            
            for msg_data in conv_data.get('messages', []):
                conv.add_message(
                    role=msg_data.get('role', 'unknown'),
                    content=msg_data.get('content', '')
                )
            
            if len(conv.messages) > 0:
                conversations.append(conv)
        
        return conversations


def import_conversations(filepath: str, format: str = 'auto') -> List[Conversation]:
    """
    Import conversations from a file
    
    Args:
        filepath: Path to the file
        format: Format type ('chatgpt', 'generic', or 'auto' to detect)
        
    Returns:
        List of Conversation objects
    """
    if format == 'auto':
        # Try to detect format
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                sample = f.read(1000)
            
            if 'mapping' in sample or 'conversation_id' in sample:
                format = 'chatgpt'
            else:
                format = 'generic'
        except Exception:
            format = 'generic'
    
    if format == 'chatgpt':
        return ChatGPTImporter.import_from_file(filepath)
    else:
        return GenericJSONImporter.import_from_file(filepath)
