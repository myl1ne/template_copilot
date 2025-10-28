"""
Tests for the Team module.
"""

import unittest
from teamrpg.team import Team, TeamManager


class TestTeam(unittest.TestCase):
    """Test cases for Team class."""
    
    def test_create_team(self):
        """Test creating a team."""
        team = Team(
            name="Engineering",
            description="Software development team"
        )
        
        self.assertEqual(team.name, "Engineering")
        self.assertEqual(team.description, "Software development team")
        self.assertIsNotNone(team.id)
        self.assertEqual(len(team.member_ids), 0)
    
    def test_add_member(self):
        """Test adding members to team."""
        team = Team("Design", "Design team")
        
        team.add_member("persona-1")
        team.add_member("persona-2")
        
        self.assertEqual(len(team.member_ids), 2)
        self.assertIn("persona-1", team.member_ids)
    
    def test_remove_member(self):
        """Test removing member from team."""
        team = Team("DevOps", "Operations team")
        team.add_member("persona-1")
        
        result = team.remove_member("persona-1")
        self.assertTrue(result)
        self.assertNotIn("persona-1", team.member_ids)
    
    def test_assign_project(self):
        """Test assigning project to team."""
        team = Team("QA", "Quality assurance team")
        
        team.assign_project("project-1")
        self.assertIn("project-1", team.project_ids)
    
    def test_to_dict_and_from_dict(self):
        """Test serialization and deserialization."""
        team = Team("Marketing", "Marketing team")
        team.add_member("persona-1")
        team.assign_project("project-1")
        
        data = team.to_dict()
        restored = Team.from_dict(data)
        
        self.assertEqual(team.name, restored.name)
        self.assertEqual(team.member_ids, restored.member_ids)
        self.assertEqual(team.project_ids, restored.project_ids)


class TestTeamManager(unittest.TestCase):
    """Test cases for TeamManager class."""
    
    def setUp(self):
        """Set up test manager."""
        self.manager = TeamManager()
    
    def test_create_team(self):
        """Test creating team via manager."""
        team = self.manager.create_team(
            name="Research",
            description="R&D team"
        )
        
        self.assertIsNotNone(team.id)
        self.assertIn(team.id, self.manager.teams)
    
    def test_get_team(self):
        """Test retrieving team by ID."""
        team = self.manager.create_team("Sales", "Sales team")
        
        retrieved = self.manager.get_team(team.id)
        self.assertEqual(team.id, retrieved.id)
    
    def test_get_team_by_name(self):
        """Test retrieving team by name."""
        self.manager.create_team("Support", "Customer support")
        
        team = self.manager.get_team_by_name("Support")
        self.assertIsNotNone(team)
        self.assertEqual(team.name, "Support")
    
    def test_list_teams(self):
        """Test listing all teams."""
        self.manager.create_team("T1", "Team 1")
        self.manager.create_team("T2", "Team 2")
        
        teams = self.manager.list_teams()
        self.assertEqual(len(teams), 2)
    
    def test_delete_team(self):
        """Test deleting a team."""
        team = self.manager.create_team("Finance", "Finance team")
        
        result = self.manager.delete_team(team.id)
        self.assertTrue(result)
        self.assertIsNone(self.manager.get_team(team.id))


if __name__ == '__main__':
    unittest.main()
