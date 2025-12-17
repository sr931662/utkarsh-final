// src/components/auth/ResetPassword.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useTheme } from '../../context/ThemeContext';
import styles from './Auth.module.css';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { resetPassword, loading, authError, authSuccess, clearMessages } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    
    if (password !== confirmPassword) {
      return;
    }

    try {
      await resetPassword(token, password);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      // Error is already handled in auth context
    }
  };

  return (
    <div className={`${styles.authContainer} ${darkMode ? styles.dark : ''}`}>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <h1>Reset Password</h1>
        
        {authError && (
          <div className={styles.error}>
            {authError}
          </div>
        )}
        
        {authSuccess && (
          <div className={styles.success}>
            {authSuccess}
          </div>
        )}

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength="8"
          className={styles.inputField}
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength="8"
          className={styles.inputField}
        />

        <button 
          type="submit" 
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;