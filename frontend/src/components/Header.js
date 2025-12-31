import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import api from '../services/api';

function Header() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // For demo, try to get demo-user
      const userData = await api.getUser('demo-user').catch(() => null);
      if (!userData) {
        // Create demo user if doesn't exist
        const newUser = await api.createUser({
          username: 'demo-user',
          email: 'demo@example.com'
        }).catch(() => ({ 
          id: 'demo-user',
          username: 'Demo User',
          level: 1,
          experience: 0,
          available_budget: 1000
        }));
        setUser(newUser);
      } else {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      // Set default demo user
      setUser({
        id: 'demo-user',
        username: 'Demo User',
        level: 1,
        experience: 0,
        available_budget: 1000
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateXPProgress = () => {
    if (!user) return 0;
    const xpForNextLevel = user.level * 1000;
    return (user.experience / xpForNextLevel) * 100;
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Link to="/" className="logo">
            🤖 LLM Research Lab
          </Link>
          <nav className="nav-links">
            <Link to="/">Dashboard</Link>
            <Link to="/templates">Templates</Link>
          </nav>
        </div>
        
        {!loading && user && (
          <div className="header-right">
            <div className="user-stats">
              <div className="stat">
                <span className="stat-label">Level</span>
                <span className="stat-value">{user.level}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Budget</span>
                <span className="stat-value">⚡ {user.available_budget}</span>
              </div>
              <div className="xp-bar">
                <div className="xp-fill" style={{ width: `${calculateXPProgress()}%` }}></div>
                <span className="xp-text">XP: {user.experience}</span>
              </div>
            </div>
            <div className="user-profile">
              <span className="user-icon">👤</span>
              <span className="username">{user.username}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
