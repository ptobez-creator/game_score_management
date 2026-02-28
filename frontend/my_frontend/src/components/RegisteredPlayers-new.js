import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const RegisteredPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllPlayers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          setLoading(false);
          return;
        }

        const response = await axios.get(process.env.REACT_APP_API_URL + '/users', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && Array.isArray(response.data)) {
          setPlayers(response.data);
        } else if (response.data && Array.isArray(response.data.users)) {
          setPlayers(response.data.users);
        } else {
          setError('Unable to parse player data.');
        }
      } catch (err) {
        console.error('Error fetching players:', err);
        if (err.response?.status === 404) {
          setError('Endpoint not found. The backend may not have implemented the /users endpoint.');
        } else {
          setError(err.response?.data?.msg || 'Error fetching registered players.');
        }
        toast.error('Failed to fetch registered players.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllPlayers();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading registered players...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="tournaments-header">
        <h2>Registered Players</h2>
        <p style={{ color: '#7f8c8d', margin: '10px 0 0 0' }}>View all tournament participants</p>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      
      {players.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>No registered players found.</p>
        </div>
      ) : (
        <div className="table-responsive leaderboard-table-wrapper">
          <table className="table table-striped leaderboard-table">
            <thead className="table-dark">
              <tr>
                <th style={{ width: '20%' }}>Name</th>
                <th style={{ width: '40%' }}>Email</th>
                <th style={{ width: '20%' }}>Joined</th>
                <th style={{ width: '20%', textAlign: 'center' }}>ID</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={player._id || player.id} style={{ animation: `fadeIn 0.3s ease ${index * 0.05}s` }}>
                  <td style={{ fontWeight: 600, color: '#2c3e50' }}>{player.name || 'N/A'}</td>
                  <td style={{ color: '#555' }}>{player.email || 'N/A'}</td>
                  <td style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                    {player.createdAt ? new Date(player.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ textAlign: 'center', color: '#3498db', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                    {(player._id || player.id).substring(0, 8)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#ecf0f1', borderRadius: '8px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#2c3e50' }}>
          Total Players: <span style={{ color: '#3498db' }}>{players.length}</span>
        </p>
      </div>

      <div className="button-group mt-4">
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default RegisteredPlayers;
