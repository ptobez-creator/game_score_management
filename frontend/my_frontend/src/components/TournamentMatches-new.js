import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const TournamentMatches = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updatingMatchId, setUpdatingMatchId] = useState(null);
  const [scoreUpdates, setScoreUpdates] = useState({});

  useEffect(() => {
    fetchTournamentData();
  }, [tournamentId]);

  const fetchTournamentData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      const tournamentResponse = await axios.get(
        `http://localhost:5000/tournaments/${tournamentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (tournamentResponse.data) {
        setTournament(tournamentResponse.data);
        setMatches(tournamentResponse.data.matches || []);

        const playerDetails = {};
        for (const playerId of tournamentResponse.data.participants) {
          try {
            const userResponse = await axios.get(
              `http://localhost:5000/users/${playerId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            playerDetails[playerId] = userResponse.data;
          } catch (err) {
            console.error(`Error fetching player ${playerId}:`, err);
          }
        }
        setPlayers(playerDetails);
      }
    } catch (err) {
      console.error('Error fetching tournament data:', err);
      setError('Error fetching tournament data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (matchId, field, value) => {
    setScoreUpdates({
      ...scoreUpdates,
      [matchId]: {
        ...scoreUpdates[matchId],
        [field]: parseInt(value) || 0,
      },
    });
  };

  const handleUpdateScore = async (match) => {
    const scores = scoreUpdates[match._id];
    
    if (!scores || scores.score1 === undefined || scores.score2 === undefined) {
      toast.error('Please enter both scores');
      return;
    }

    setUpdatingMatchId(match._id);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/update-score',
        {
          tournamentId: tournamentId,
          matchId: match._id,
          player1Id: match.player1,
          player2Id: match.player2,
          score1: scores.score1,
          score2: scores.score2,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Score updated successfully!');
      
      const updatedMatches = matches.map(m => {
        if (m._id === match._id) {
          return {
            ...m,
            score1: scores.score1,
            score2: scores.score2,
            status: 'completed',
          };
        }
        return m;
      });
      setMatches(updatedMatches);
      
      const newScoreUpdates = { ...scoreUpdates };
      delete newScoreUpdates[match._id];
      setScoreUpdates(newScoreUpdates);
    } catch (err) {
      console.error('Error updating score:', err);
      toast.error('Error updating score. Please try again.');
    } finally {
      setUpdatingMatchId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading tournament matches...</p>
        </div>
      </div>
    );
  }

  const getPlayerName = (playerId) => {
    return players[playerId]?.name || 'Unknown Player';
  };

  const getPendingMatches = () => matches.filter(m => m.status === 'pending');
  const getCompletedMatches = () => matches.filter(m => m.status === 'completed');

  return (
    <div className="container matches-container">
      <div style={{ marginBottom: '30px', borderBottom: '3px solid #3498db', paddingBottom: '15px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>{tournament?.name || 'Tournament Matches'}</h2>
        <p style={{ color: '#7f8c8d', margin: 0 }}>Matches: {matches.length} | Pending: {getPendingMatches().length} | Completed: {getCompletedMatches().length}</p>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="match-section">
        <h4 className="match-section-title warning">
          ⏳ Pending Matches ({getPendingMatches().length})
        </h4>
        {getPendingMatches().length === 0 ? (
          <p className="text-muted" style={{ padding: '20px', textAlign: 'center' }}>No pending matches.</p>
        ) : (
          <div className="match-table table-responsive">
            <table className="table table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Match</th>
                  <th className="text-center">Score 1</th>
                  <th className="text-center">Score 2</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {getPendingMatches().map((match) => (
                  <tr key={match._id}>
                    <td style={{ fontWeight: 600 }}>
                      {getPlayerName(match.player1)} <span style={{ color: '#95a5a6' }}>vs</span> {getPlayerName(match.player2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        className="match-input"
                        placeholder="0"
                        value={scoreUpdates[match._id]?.score1 ?? ''}
                        onChange={(e) =>
                          handleScoreChange(match._id, 'score1', e.target.value)
                        }
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        className="match-input"
                        placeholder="0"
                        value={scoreUpdates[match._id]?.score2 ?? ''}
                        onChange={(e) =>
                          handleScoreChange(match._id, 'score2', e.target.value)
                        }
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleUpdateScore(match)}
                        disabled={updatingMatchId === match._id}
                      >
                        {updatingMatchId === match._id ? 'Updating...' : 'Update'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="match-section">
        <h4 className="match-section-title info">
          ✓ Completed Matches ({getCompletedMatches().length})
        </h4>
        {getCompletedMatches().length === 0 ? (
          <p className="text-muted" style={{ padding: '20px', textAlign: 'center' }}>No completed matches yet.</p>
        ) : (
          <div className="match-table table-responsive">
            <table className="table table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Match</th>
                  <th className="text-center">Result</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {getCompletedMatches().map((match) => (
                  <tr key={match._id}>
                    <td style={{ fontWeight: 600 }}>
                      {getPlayerName(match.player1)} <span style={{ color: '#95a5a6' }}>vs</span> {getPlayerName(match.player2)}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 700 }}>
                      <span style={{ color: '#2c3e50' }}>{match.score1} - {match.score2}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge bg-success" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>Completed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="button-group mt-4">
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/leaderboard/${tournamentId}`)}
        >
          View Leaderboard
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/tournaments')}
        >
          Back to Tournaments
        </button>
      </div>
    </div>
  );
};

export default TournamentMatches;
