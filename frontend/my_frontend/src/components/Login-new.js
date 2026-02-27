import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Login = ({ setUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
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
      const response = await axios.post('http://localhost:5000/auth/login', {
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
      const response = await axios.post('http://localhost:5000/auth/register', {
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

  return (
    <div className="login-container">
      <div className="login-header">
        <h2>{isSignUp ? 'Create Account' : 'Login'}</h2>
        <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>
          {isSignUp ? 'Join the tournament' : 'Welcome back'}
        </p>
      </div>

      <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
        {isSignUp && (
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              id="name"
              type="text" 
              placeholder="Enter your full name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            id="email"
            type="email" 
            placeholder="Enter your email address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            id="password"
            type="password" 
            placeholder="Enter your password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="form-buttons">
          <button type="submit" className={isSignUp ? 'signup-btn' : 'login-btn'}>
            {isSignUp ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ecf0f1' }}>
        <p style={{ margin: '10px 0', color: '#7f8c8d' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <span 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }} 
            style={{ 
              color: '#3498db', 
              cursor: 'pointer', 
              fontWeight: 600,
              textDecoration: 'none',
              marginLeft: '6px'
            }}
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
