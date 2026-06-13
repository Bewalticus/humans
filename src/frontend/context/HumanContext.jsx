// Human Context
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const HumanContext = createContext();

export const HumanProvider = ({ children }) => {
  const [humans, setHumans] = useState([]);
  const [currentHuman, setCurrentHuman] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchHumans();
    }
  }, [user]);

  const fetchHumans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/humans');
      setHumans(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch humans');
    } finally {
      setLoading(false);
    }
  };

  const fetchHuman = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/humans/${id}`);
      setCurrentHuman(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch human');
    } finally {
      setLoading(false);
    }
  };

  const createHuman = async (humanData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/humans', humanData);
      await fetchHumans();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create human');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateHuman = async (id, humanData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/humans/${id}`, humanData);
      await fetchHumans();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update human');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteHuman = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await api.delete(`/humans/${id}`);
      await fetchHumans();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete human');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <HumanContext.Provider value={
      humans,
      currentHuman,
      loading,
      error,
      fetchHumans,
      fetchHuman,
      createHuman,
      updateHuman,
      deleteHuman,
      setCurrentHuman
    }>
      {children}
    </HumanContext.Provider>
  );
};

export const useHuman = () => useContext(HumanContext);