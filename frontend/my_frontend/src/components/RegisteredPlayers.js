import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const RegisteredPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          setLoading(false);
          return;
        }

        // Decode token to get current user ID
        try {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          setCurrentUserId(decodedToken.user.id);
        } catch (e) {
          console.error('Error decoding token:', e);
        }

        const response = await axios.get('http://localhost:5000/teams/team-members', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && Array.isArray(response.data.members)) {
          setPlayers(response.data.members);
        } else {
          setError('Unable to parse player data.');
        }
      } catch (err) {
        console.error('Error fetching team members:', err);
        if (err.response?.status === 404) {
          setError('You are not part of any team. Please join or create a team first.');
        } else {
          setError(err.response?.data?.msg || 'Error fetching team members.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
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
        <h2>Team Players</h2>
        <p style={{ color: '#7f8c8d', margin: '10px 0 0 0' }}>View your team members</p>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      
      {players.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>No team members found.</p>
        </div>
      ) : (
        <div className="table-responsive leaderboard-table-wrapper">
          <table className="table table-striped leaderboard-table">
            <thead className="table-dark">
              <tr>
                <th style={{ width: '25%' }}>Name</th>
                <th style={{ width: '35%' }}>Email</th>
                <th style={{ width: '20%' }}>Joined</th>
                <th style={{ width: '20%', textAlign: 'center' }}>ID</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={player._id || player.id} style={{ animation: `fadeIn 0.3s ease ${index * 0.05}s` }}>
                  <td style={{ fontWeight: 600, color: '#2c3e50' }}>
                    {player.profilePicture && (
                      <img 
                        src={player.profilePicture} 
                        alt={player.name} 
                        style={{ 
                          width: '30px', 
                          height: '30px', 
                          borderRadius: '50%', 
                          marginRight: '10px',
                          objectFit: 'cover'
                        }} 
                      />
                    )}
                    {player.name || 'N/A'}
                  </td>
                  <td style={{ color: '#555' }}>
                    {player.email || <span style={{ color: '#aaa', fontStyle: 'italic' }}>Hidden</span>}
                  </td>
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
          Total Team Members: <span style={{ color: '#3498db' }}>{players.length}</span>
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
