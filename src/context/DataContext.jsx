import React, { createContext, useState, useEffect, useContext } from 'react';
import { loadAllData } from '../services/csvLoader';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    languages: [],
    questions: [],
    tsm: [],
    cropProductMapping: [],
    districtStateMapping: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await loadAllData();
        setData(result);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ ...data, loading, error }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
