import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useTheme } from '../../context/ThemeContext';
import styles from './Login.module.css';
import axios from 'axios';
import { Helmet } from 'react-helmet';

const Login = () => {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const API_BASE_URL = 'http://localhost:5000/api/auth';

  const clearMessages = () => {
    setErrors('');
    setSuccessMessage('');
  };

  // 1. REGULAR LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, loginForm);
      authLogin(response.data.token, response.data.data.user);

      const welcomeMessage = response.data.data.user.role === 'superadmin'
        ? 'Welcome Super Admin!'
        : 'Welcome Admin!';
      setSuccessMessage(`${welcomeMessage} Redirecting...`);

      setTimeout(() => navigate('/admin/dashboard'), 1500);
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setErrors(message);
    } finally {
      setLoading(false);
    }
  };

  // 2. SEND OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    if (!forgotPasswordEmail) {
      setErrors('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/forgot-password`, {
        email: forgotPasswordEmail,
      });
      
      if (response.data.status === 'success') {
        setOtpSent(true);
        setSuccessMessage('✅ OTP has been sent to your email. Check your inbox (and spam folder).');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      setErrors('❌ ' + message);
    } finally {
      setLoading(false);
    }
  };

  // 3. RESET PASSWORD
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    // Validation
    if (newPassword !== confirmPassword) {
      setErrors('❌ Passwords do not match.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setErrors('❌ Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    if (!otp || otp.length !== 6) {
      setErrors('❌ Please enter a valid 6-digit OTP.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/reset-password`, {
        email: forgotPasswordEmail,
        otp: otp,
        newPassword: newPassword
      });

      if (response.data.status === 'success') {
        setSuccessMessage('✅ Password reset successful! You can now login with your new password.');
        
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          resetForgotPasswordFlow();
        }, 3000);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reset password. Please try again.';
      setErrors('❌ ' + message);
    } finally {
      setLoading(false);
    }
  };

  const resetForgotPasswordFlow = () => {
    setShowForgotPassword(false);
    setOtpSent(false);
    setForgotPasswordEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    clearMessages();
  };

  return (
    <div className={`${styles.loginContainer} ${darkMode ? styles.dark : ''}`}>
      <Helmet>
        <title>Login - Mr. Utkarsh Gupta Portfolio</title>
      </Helmet>
      
      {!showForgotPassword ? (
        // LOGIN FORM
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <h1>Admin Portal</h1>
          <p className={styles.subtitle}>Sign in to your account</p>

          {errors && <div className={styles.error}><i className="fas fa-exclamation-circle"></i> {errors}</div>}
          {successMessage && <div className={styles.success}><i className="fas fa-check-circle"></i> {successMessage}</div>}

          <div className={styles.inputGroup}>
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
              required
              className={styles.inputField}
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              required
              className={styles.inputField}
            />
          </div>

          <button type="submit" disabled={loading} className={`${styles.submitButton} ${loading ? styles.loading : ''}`}>
            {loading ? <><i className="fas fa-spinner fa-spin"></i> Signing In...</> : 'Sign In'}
          </button>

          <div className={styles.forgotPasswordLink}>
            <button type="button" onClick={() => { setShowForgotPassword(true); clearMessages(); }} className={styles.linkButton}>
              Forgot Password?
            </button>
          </div>
        </form>
      ) : (
        // FORGOT PASSWORD FORM
        <form onSubmit={otpSent ? handleResetPassword : handleSendOTP} className={styles.loginForm}>
          <h1>{otpSent ? 'Reset Password' : 'Forgot Password'}</h1>
          <p className={styles.subtitle}>{otpSent ? 'Enter OTP and new password' : 'Enter your email to receive OTP'}</p>
          
          {errors && <div className={styles.error}><i className="fas fa-exclamation-circle"></i> {errors}</div>}
          {successMessage && <div className={styles.success}><i className="fas fa-check-circle"></i> {successMessage}</div>}

          {!otpSent && (
            <div className={styles.inputGroup}>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
                className={styles.inputField}
              />
            </div>
          )}

          {otpSent && (
            <>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength="6"
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="password"
                  placeholder="New Password (min. 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="8"
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength="8"
                  className={styles.inputField}
                />
              </div>
            </>
          )}

          <div className={styles.buttonGroup}>
            {!otpSent ? (
              <button type="submit" disabled={loading} className={`${styles.submitButton} ${loading ? styles.loading : ''}`}>
                {loading ? <><i className="fas fa-spinner fa-spin"></i> Sending OTP...</> : 'Send OTP'}
              </button>
            ) : (
              <button type="submit" disabled={loading} className={`${styles.submitButton} ${loading ? styles.loading : ''}`}>
                {loading ? <><i className="fas fa-spinner fa-spin"></i> Resetting...</> : 'Reset Password'}
              </button>
            )}

            <button type="button" onClick={resetForgotPasswordFlow} className={styles.cancelButton}>
              <i className="fas fa-arrow-left"></i> Back to Login
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Login;