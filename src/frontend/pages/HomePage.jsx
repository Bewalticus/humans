// Home Page
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConversation } from '../context/ConversationContext';
import { useHuman } from '../context/HumanContext';

const HomePage = () => {
  const { user } = useAuth();
  const { conversations, loading: convLoading } = useConversation();
  const { humans, loading: humanLoading } = useHuman();

  return (
    <div className="home-page">
      <h1>Welcome to Humans, {user?.username}!</h1>

      <div className="dashboard">
        <div className="dashboard-section">
          <h2>Your Conversations</h2>
          {convLoading ? (
            <p>Loading conversations...</p>
          ) : conversations.length > 0 ? (
            <ul className="conversation-list">
              {conversations.slice(0, 5).map(conv => (
                <li key={conv.id} className="conversation-item">
                  <h3>{conv.topic}</h3>
                  <p>Updated: {new Date(conv.updated_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No conversations yet. Start one!</p>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Your Humans</h2>
          {humanLoading ? (
            <p>Loading humans...</p>
          ) : humans.length > 0 ? (
            <ul className="human-list">
              {humans.slice(0, 5).map(human => (
                <li key={human.id} className="human-item">
                  <h3>{human.name}</h3>
                  <p>Status: {human.status}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No humans yet. Create one!</p>
          )}
        </div>
      </div>

      <div className="quick-actions">
        <button className="action-button">Start New Conversation</button>
        <button className="action-button">Create New Human</button>
        <button className="action-button">Explore Discovery</button>
      </div>
    </div>
  );
};

export default HomePage;