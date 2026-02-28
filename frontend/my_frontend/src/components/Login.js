import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Login = ({ setUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(process.env.REACT_APP_API_URL + '/auth/login', {
        email,
        password,
      });

      const token = response.data.token;
      localStorage.setItem('token', token);
      
      const decoded = jwtDecode(token);
      setUser({ id: decoded.user.id });
      setAuthHeader(token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid login credentials.');
      console.error('Login failed', err);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(process.env.REACT_APP_API_URL + '/auth/register', {
        name,
        email,
        password,
      });

      const token = response.data.token;
      localStorage.setItem('token', token);
      
      const decoded = jwtDecode(token);
      setUser({ id: decoded.user.id });
      setAuthHeader(token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Error signing up. Please try again.');
      console.error('Sign Up failed', err);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setResetLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(process.env.REACT_APP_API_URL + '/auth/forgot-password', {
        email: resetEmail,
      });

      setSuccess('Password reset link has been sent to your email. Please check your inbox.');
      setResetEmail('');
      
      setTimeout(() => {
        setIsForgotPassword(false);
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error sending reset link. Please try again.');
      console.error('Forgot password failed', err);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        padding: '40px',
        maxWidth: '400px',
        width: '100%'
      }}>
        {isForgotPassword ? (
          <>
            <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '10px' }}>Reset Password</h2>
            <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '30px', fontSize: '0.9rem' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleForgotPassword}>
              <div style={{ marginBottom: '20px' }}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={resetEmail} 
                  onChange={(e) => setResetEmail(e.target.value)} 
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ecf0f1',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#ecf0f1'}
                />
              </div>

              <button 
                type="submit"
                disabled={resetLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: resetLoading ? '#95a5a6' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: resetLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s',
                  marginBottom: '15px'
                }}
                onMouseEnter={(e) => !resetLoading && (e.target.style.backgroundColor = '#5568d3')}
                onMouseLeave={(e) => !resetLoading && (e.target.style.backgroundColor = '#667eea')}
              >
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            {error && <p style={{ color: '#e74c3c', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
            {success && <p style={{ color: '#27ae60', textAlign: 'center', marginBottom: '15px' }}>{success}</p>}

            <button
              onClick={() => {
                setIsForgotPassword(false);
                setResetEmail('');
                setError('');
                setSuccess('');
              }}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'transparent',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#667eea';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#667eea';
              }}
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>

            <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
              {isSignUp && (
                <div style={{ marginBottom: '20px' }}>
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ecf0f1',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#ecf0f1'}
                  />
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ecf0f1',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#ecf0f1'}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ecf0f1',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#ecf0f1'}
                />
              </div>

              <button 
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                  marginBottom: '15px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#5568d3'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
              >
                {isSignUp ? 'Sign Up' : 'Login'}
              </button>
            </form>

            {error && <p style={{ color: '#e74c3c', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
            {success && <p style={{ color: '#27ae60', textAlign: 'center', marginBottom: '15px' }}>{success}</p>}

            {!isSignUp && (
              <button
                onClick={() => {
                  setIsForgotPassword(true);
                  setError('');
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'transparent',
                  color: '#667eea',
                  border: 'none',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  marginBottom: '20px',
                  transition: 'color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#5568d3'}
                onMouseLeave={(e) => e.target.style.color = '#667eea'}
              >
                Forgot Password?
              </button>
            )}

            <div style={{ textAlign: 'center', borderTop: '1px solid #ecf0f1', paddingTop: '20px' }}>
              <p style={{ color: '#7f8c8d', margin: '0 0 10px 0' }}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"} 
              </p>
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccess('');
                }}
                style={{
                  backgroundColor: 'transparent',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#667eea';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#667eea';
                }}
              >
                {isSignUp ? 'Login' : 'Sign Up'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
