import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const TournamentsList = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          process.env.REACT_APP_API_URL + '/tournaments',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (Array.isArray(response.data)) {
          setTournaments(response.data);
        } else if (response.data && Array.isArray(response.data.tournaments)) {
          setTournaments(response.data.tournaments);
        }
      } catch (err) {
        console.error('Error fetching tournaments:', err);
        if (err.response?.status === 404) {
          setError('Tournaments endpoint not found.');
        } else {
          setError('Error fetching tournaments. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const handleViewLeaderboard = (tournamentId) => {
    navigate(`/leaderboard/${tournamentId}`);
  };

  const handleViewMatches = (tournamentId) => {
    navigate(`/tournaments/${tournamentId}/matches`);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'scheduled':
        return 'status-scheduled';
      default:
        return 'status-scheduled';
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="tournaments-header">
        <h2>My Tournaments</h2>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {tournaments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>No tournaments created yet.</p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/create-game')}>
            Create First Tournament
          </button>
        </div>
      ) : (
        <div>
          {tournaments.map((tournament) => (
            <div key={tournament._id} className="tournament-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 className="tournament-name">{tournament.name}</h3>
                  <div className="tournament-info">
                    <div className="tournament-info-item">
                      <span className="tournament-info-label">Status:</span>
                      <span className={`tournament-status ${getStatusBadgeClass(tournament.status)}`}>
                        {tournament.status}
                      </span>
                    </div>
                    <div className="tournament-info-item">
                      <span className="tournament-info-label">Players:</span>
                      <span className="tournament-info-value">{tournament.participants?.length || 0}</span>
                    </div>
                    <div className="tournament-info-item">
                      <span className="tournament-info-label">Start:</span>
                      <span className="tournament-info-value">{new Date(tournament.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="tournament-info-item">
                      <span className="tournament-info-label">End:</span>
                      <span className="tournament-info-value">{new Date(tournament.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tournament-buttons">
                <button
                  className="btn btn-primary"
                  onClick={() => handleViewMatches(tournament._id)}
                >
                  Update Scores
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => handleViewLeaderboard(tournament._id)}
                >
                  View Leaderboard
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="button-group mt-4">
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default TournamentsList;
