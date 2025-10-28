"""
Tests for the Persona module.
"""

import unittest
from teamrpg.persona import Persona, PersonaManager


class TestPersona(unittest.TestCase):
    """Test cases for Persona class."""
    
    def test_create_persona(self):
        """Test creating a persona."""
        persona = Persona(
            name="Alice",
            role="Developer",
            personality="Creative and detail-oriented",
            skills=["Python", "JavaScript"]
        )
        
        self.assertEqual(persona.name, "Alice")
        self.assertEqual(persona.role, "Developer")
        self.assertEqual(len(persona.skills), 2)
        self.assertIsNotNone(persona.id)
    
    def test_add_context(self):
        """Test adding context to persona."""
        persona = Persona(
            name="Bob",
            role="Designer",
            personality="Artistic",
            skills=["Figma", "Photoshop"]
        )
        
        persona.add_context("New project assigned")
        self.assertEqual(len(persona.context_memory), 1)
    
    def test_get_system_prompt(self):
        """Test generating system prompt."""
        persona = Persona(
            name="Charlie",
            role="Manager",
            personality="Organized and efficient",
            skills=["Leadership", "Planning"]
        )
        
        prompt = persona.get_system_prompt()
        self.assertIn("Charlie", prompt)
        self.assertIn("Manager", prompt)
    
    def test_to_dict_and_from_dict(self):
        """Test serialization and deserialization."""
        persona = Persona(
            name="Diana",
            role="QA Engineer",
            personality="Meticulous",
            skills=["Testing", "Automation"]
        )
        
        data = persona.to_dict()
        restored = Persona.from_dict(data)
        
        self.assertEqual(persona.name, restored.name)
        self.assertEqual(persona.role, restored.role)
        self.assertEqual(persona.skills, restored.skills)


class TestPersonaManager(unittest.TestCase):
    """Test cases for PersonaManager class."""
    
    def setUp(self):
        """Set up test manager."""
        self.manager = PersonaManager()
    
    def test_create_persona(self):
        """Test creating persona via manager."""
        persona = self.manager.create_persona(
            name="Eve",
            role="DevOps",
            personality="Systematic",
            skills=["Docker", "Kubernetes"]
        )
        
        self.assertIsNotNone(persona.id)
        self.assertIn(persona.id, self.manager.personas)
    
    def test_get_persona(self):
        """Test retrieving persona by ID."""
        persona = self.manager.create_persona(
            name="Frank",
            role="Developer",
            personality="Logical",
            skills=["Java", "Spring"]
        )
        
        retrieved = self.manager.get_persona(persona.id)
        self.assertEqual(persona.id, retrieved.id)
    
    def test_get_persona_by_name(self):
        """Test retrieving persona by name."""
        self.manager.create_persona(
            name="Grace",
            role="Designer",
            personality="Creative",
            skills=["UI/UX"]
        )
        
        persona = self.manager.get_persona_by_name("Grace")
        self.assertIsNotNone(persona)
        self.assertEqual(persona.name, "Grace")
    
    def test_list_personas(self):
        """Test listing all personas."""
        self.manager.create_persona("P1", "Role1", "Personality1", ["Skill1"])
        self.manager.create_persona("P2", "Role2", "Personality2", ["Skill2"])
        
        personas = self.manager.list_personas()
        self.assertEqual(len(personas), 2)
    
    def test_delete_persona(self):
        """Test deleting a persona."""
        persona = self.manager.create_persona(
            name="Harry",
            role="Developer",
            personality="Focused",
            skills=["C++"]
        )
        
        result = self.manager.delete_persona(persona.id)
        self.assertTrue(result)
        self.assertIsNone(self.manager.get_persona(persona.id))


if __name__ == '__main__':
    unittest.main()
