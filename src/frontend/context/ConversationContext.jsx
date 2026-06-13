// Conversation Context
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { useSocket } from '../hooks/useSocket';

const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (socket && currentConversation) {
      socket.emit('conversation:join', currentConversation.id);
      
      const handleMessage = (data) => {
        if (data.conversationId === currentConversation.id) {
          setMessages(prev => [...prev, data]);
        }
      };

      socket.on('conversation:message', handleMessage);
      
      return () => {
        socket.off('conversation:message', handleMessage);
        socket.emit('conversation:leave', currentConversation.id);
      };
    }
  }, [socket, currentConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/conversations');
      setConversations(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/conversations/${id}`);
      setCurrentConversation(response.data);
      await fetchMessages(id);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch conversation');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/conversations/${conversationId}/messages`);
      setMessages(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch messages');
    }
  };

  const sendMessage = async (conversationId, content) => {
    try {
      const response = await api.post(`/conversations/${conversationId}/messages`, { content });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
      throw err;
    }
  };

  const createConversation = async (topic, context, participantIds) => {
    try {
      const response = await api.post('/conversations', { topic, context, participantIds });
      await fetchConversations();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create conversation');
      throw err;
    }
  };

  return (
    <ConversationContext.Provider value={
      conversations,
      currentConversation,
      messages,
      loading,
      error,
      fetchConversations,
      fetchConversation,
      fetchMessages,
      sendMessage,
      createConversation,
      setCurrentConversation
    }>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => useContext(ConversationContext);