"""
Tests for the Messaging module.
"""

import unittest
from teamrpg.messaging import Message, Channel, MessagingSystem


class TestMessage(unittest.TestCase):
    """Test cases for Message class."""
    
    def test_create_message(self):
        """Test creating a message."""
        msg = Message(
            content="Hello team!",
            author_id="persona-1",
            channel_id="channel-1"
        )
        
        self.assertEqual(msg.content, "Hello team!")
        self.assertEqual(msg.author_id, "persona-1")
        self.assertIsNotNone(msg.id)
    
    def test_add_reaction(self):
        """Test adding reactions to message."""
        msg = Message("Great work!", "persona-1", "channel-1")
        
        msg.add_reaction("👍", "persona-2")
        msg.add_reaction("👍", "persona-3")
        
        self.assertIn("👍", msg.reactions)
        self.assertEqual(len(msg.reactions["👍"]), 2)


class TestChannel(unittest.TestCase):
    """Test cases for Channel class."""
    
    def test_create_channel(self):
        """Test creating a channel."""
        channel = Channel(
            name="general",
            description="General discussion",
            channel_type="public"
        )
        
        self.assertEqual(channel.name, "general")
        self.assertEqual(channel.type, "public")
        self.assertIsNotNone(channel.id)
    
    def test_add_member(self):
        """Test adding member to channel."""
        channel = Channel("dev", "Development discussions")
        
        channel.add_member("persona-1")
        channel.add_member("persona-2")
        
        self.assertEqual(len(channel.member_ids), 2)
        self.assertIn("persona-1", channel.member_ids)
    
    def test_remove_member(self):
        """Test removing member from channel."""
        channel = Channel("design", "Design discussions")
        channel.add_member("persona-1")
        
        result = channel.remove_member("persona-1")
        self.assertTrue(result)
        self.assertNotIn("persona-1", channel.member_ids)
    
    def test_post_message(self):
        """Test posting message to channel."""
        channel = Channel("team", "Team channel")
        channel.add_member("persona-1")
        
        msg = channel.post_message("Hello!", "persona-1")
        
        self.assertEqual(len(channel.messages), 1)
        self.assertEqual(msg.content, "Hello!")
    
    def test_post_message_non_member(self):
        """Test that non-members cannot post."""
        channel = Channel("private", "Private channel")
        
        with self.assertRaises(ValueError):
            channel.post_message("Hello!", "persona-1")
    
    def test_get_recent_messages(self):
        """Test getting recent messages."""
        channel = Channel("test", "Test channel")
        channel.add_member("persona-1")
        
        for i in range(10):
            channel.post_message(f"Message {i}", "persona-1")
        
        recent = channel.get_recent_messages(limit=5)
        self.assertEqual(len(recent), 5)
        self.assertEqual(recent[-1].content, "Message 9")


class TestMessagingSystem(unittest.TestCase):
    """Test cases for MessagingSystem class."""
    
    def setUp(self):
        """Set up test messaging system."""
        self.system = MessagingSystem()
    
    def test_create_channel(self):
        """Test creating channel via system."""
        channel = self.system.create_channel(
            name="announcements",
            description="Company announcements",
            channel_type="public"
        )
        
        self.assertIsNotNone(channel.id)
        self.assertIn(channel.id, self.system.channels)
    
    def test_get_channel(self):
        """Test retrieving channel by ID."""
        channel = self.system.create_channel("random", "Random stuff")
        
        retrieved = self.system.get_channel(channel.id)
        self.assertEqual(channel.id, retrieved.id)
    
    def test_get_channel_by_name(self):
        """Test retrieving channel by name."""
        self.system.create_channel("water-cooler", "Casual chat")
        
        channel = self.system.get_channel_by_name("water-cooler")
        self.assertIsNotNone(channel)
        self.assertEqual(channel.name, "water-cooler")
    
    def test_get_channels_for_persona(self):
        """Test getting channels for a specific persona."""
        channel1 = self.system.create_channel("c1", "Channel 1")
        channel2 = self.system.create_channel("c2", "Channel 2")
        channel3 = self.system.create_channel("c3", "Channel 3")
        
        channel1.add_member("persona-1")
        channel2.add_member("persona-1")
        channel3.add_member("persona-2")
        
        channels = self.system.get_channels_for_persona("persona-1")
        self.assertEqual(len(channels), 2)


if __name__ == '__main__':
    unittest.main()
