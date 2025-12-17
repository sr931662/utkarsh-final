// src/contexts/PublicationContext.js
import { createContext, useState, useEffect } from 'react';
import {
  fetchPublications,
  createPublication,
  updatePublication,
  deletePublication
} from './api';

const PublicationContext = createContext();

export const PublicationProvider = ({ children }) => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPublications = async () => {
    try {
      setLoading(true);
      const { data } = await fetchPublications();
      setPublications(data.publications);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const addPublication = async (publicationData) => {
    try {
      const formData = new FormData();
      Object.entries(publicationData).forEach(([key, value]) => {
        if (key === 'authors' || key === 'tags') {
          formData.append(key, JSON.stringify(value));
        } else if (value) {
          formData.append(key, value);
        }
      });

      const { data } = await createPublication(formData);
      setPublications([data.publication, ...publications]);
      return data;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  const editPublication = async (id, updates) => {
    try {
      const formData = new FormData();
      Object.entries(updates).forEach(([key, value]) => {
        if (key === 'authors' || key === 'tags') {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined) {
          formData.append(key, value);
        }
      });

      const { data } = await updatePublication(id, formData);
      setPublications(publications.map(pub => 
        pub._id === id ? data.publication : pub
      ));
      return data;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  const removePublication = async (id) => {
    try {
      await deletePublication(id);
      setPublications(publications.filter(pub => pub._id !== id));
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  useEffect(() => {
    getPublications();
  }, []);

  return (
    <PublicationContext.Provider
      value={{
        publications,
        loading,
        error,
        addPublication,
        editPublication,
        removePublication,
        refreshPublications: getPublications
      }}
    >
      {children}
    </PublicationContext.Provider>
  );
};

export default PublicationContext;