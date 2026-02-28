import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import 'bootstrap/dist/css/bootstrap.min.css';

const TournamentMatches = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittingMatchId, setSubmittingMatchId] = useState(null);
  const [processingMatchId, setProcessingMatchId] = useState(null);
  const [scoreInputs, setScoreInputs] = useState({});
  const [disputeModal, setDisputeModal] = useState({ show: false, matchId: null, reason: '' });
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.user.id);
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }
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
        `${process.env.REACT_APP_API_URL}/tournaments/${tournamentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (tournamentResponse.data) {
        setTournament(tournamentResponse.data);
        setMatches(tournamentResponse.data.matches || []);

        const playerDetails = {};
        for (const playerId of tournamentResponse.data.participants) {
          try {
            const userResponse = await axios.get(
              `${process.env.REACT_APP_API_URL}/users/${playerId}`,
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
    setScoreInputs({
      ...scoreInputs,
      [matchId]: {
        ...scoreInputs[matchId],
        [field]: parseInt(value) || 0,
      },
    });
  };

  const handleSubmitScore = async (match) => {
    const scores = scoreInputs[match._id];
    
    if (!scores || scores.score1 === undefined || scores.score2 === undefined) {
      toast.error('Please enter both scores');
      return;
    }

    setSubmittingMatchId(match._id);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        process.env.REACT_APP_API_URL + '/submit-score',
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

      toast.success('Score submitted! Waiting for opponent approval.');
      
      const updatedMatches = matches.map(m => {
        if (m._id === match._id) {
          return {
            ...m,
            score1: scores.score1,
            score2: scores.score2,
            status: 'submitted',
          };
        }
        return m;
      });
      setMatches(updatedMatches);
      
      const newScoreInputs = { ...scoreInputs };
      delete newScoreInputs[match._id];
      setScoreInputs(newScoreInputs);
    } catch (err) {
      console.error('Error submitting score:', err);
      toast.error('Error submitting score. Please try again.');
    } finally {
      setSubmittingMatchId(null);
    }
  };

  const handleApproveScore = async (match) => {
    setProcessingMatchId(match._id);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        process.env.REACT_APP_API_URL + '/approve-score',
        {
          tournamentId: tournamentId,
          matchId: match._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('✓ Score approved and finalized!');
      
      const updatedMatches = matches.map(m => {
        if (m._id === match._id) {
          return { ...m, status: 'completed' };
        }
        return m;
      });
      setMatches(updatedMatches);
    } catch (err) {
      console.error('Error approving score:', err);
      toast.error('Error approving score. Please try again.');
    } finally {
      setProcessingMatchId(null);
    }
  };

  const handleDisputeScore = async () => {
    const { matchId, reason } = disputeModal;
    
    if (!reason.trim()) {
      toast.error('Please provide a reason for the dispute');
      return;
    }

    setProcessingMatchId(matchId);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        process.env.REACT_APP_API_URL + '/dispute-score',
        {
          tournamentId: tournamentId,
          matchId: matchId,
          reason: reason,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.error('Score disputed. Please re-enter the correct score.');
      
      const updatedMatches = matches.map(m => {
        if (m._id === matchId) {
          return { ...m, status: 'pending', score1: null, score2: null };
        }
        return m;
      });
      setMatches(updatedMatches);
      setDisputeModal({ show: false, matchId: null, reason: '' });
    } catch (err) {
      console.error('Error disputing score:', err);
      toast.error('Error disputing score. Please try again.');
    } finally {
      setProcessingMatchId(null);
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

  const isCurrentPlayerInMatch = (match) => {
    return match.player1.toString() === currentUserId || match.player2.toString() === currentUserId;
  };

  const isCurrentPlayerSubmitter = (match) => {
    return match.scoreSumbittedBy?.toString() === currentUserId;
  };

  const getPendingMatches = () => matches.filter(m => m.status === 'pending');
  const getSubmittedMatches = () => matches.filter(m => m.status === 'submitted');
  const getCompletedMatches = () => matches.filter(m => m.status === 'completed');

  return (
    <div className="container matches-container">
      <div style={{ marginBottom: '30px', borderBottom: '3px solid #3498db', paddingBottom: '15px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>{tournament?.name || 'Tournament Matches'}</h2>
        <p style={{ color: '#7f8c8d', margin: 0 }}>
          Pending: {getPendingMatches().length} | Awaiting Approval: {getSubmittedMatches().length} | Completed: {getCompletedMatches().length}
        </p>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}

      {/* SECTION 1: PENDING MATCHES */}
      <div className="match-section">
        <h4 className="match-section-title warning">
          ⏳ Pending Matches ({getPendingMatches().length}) - Enter Scores
        </h4>
        {getPendingMatches().length === 0 ? (
          <p className="text-muted" style={{ padding: '20px', textAlign: 'center' }}>All matches have been submitted or completed!</p>
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
                        value={scoreInputs[match._id]?.score1 ?? ''}
                        onChange={(e) => handleScoreChange(match._id, 'score1', e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        className="match-input"
                        placeholder="0"
                        value={scoreInputs[match._id]?.score2 ?? ''}
                        onChange={(e) => handleScoreChange(match._id, 'score2', e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleSubmitScore(match)}
                        disabled={submittingMatchId === match._id}
                      >
                        {submittingMatchId === match._id ? 'Submitting...' : 'Submit'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: SUBMITTED MATCHES (AWAITING APPROVAL) */}
      <div className="match-section">
        <h4 className="match-section-title info">
          👀 Awaiting Approval ({getSubmittedMatches().length}) - Opponent's Turn
        </h4>
        {getSubmittedMatches().length === 0 ? (
          <p className="text-muted" style={{ padding: '20px', textAlign: 'center' }}>No matches awaiting approval.</p>
        ) : (
          <div className="match-table table-responsive">
            <table className="table table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Match</th>
                  <th className="text-center">Submitted Score</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {getSubmittedMatches().map((match) => {
                  const isApprover = !isCurrentPlayerSubmitter(match) && isCurrentPlayerInMatch(match);
                  return (
                    <tr key={match._id} style={{ backgroundColor: '#fffbea' }}>
                      <td style={{ fontWeight: 600 }}>
                        {getPlayerName(match.player1)} <span style={{ color: '#95a5a6' }}>vs</span> {getPlayerName(match.player2)}
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 700 }}>
                        <span style={{ color: '#3498db' }}>{match.score1} - {match.score2}</span>
                        <br />
                        <span style={{ fontSize: '0.8rem', color: '#f39c12' }}>
                          Submitted by {isCurrentPlayerSubmitter(match) ? 'You' : getPlayerName(match.scoreSumbittedBy)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge" style={{ backgroundColor: '#f39c12', padding: '8px 12px', fontSize: '0.8rem' }}>
                          ⏳ Pending
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isApprover ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleApproveScore(match)}
                              disabled={processingMatchId === match._id}
                              title="Approve this score if it matches the game result"
                            >
                              {processingMatchId === match._id ? '...' : '✓ Approve'}
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => setDisputeModal({ show: true, matchId: match._id, reason: '' })}
                              disabled={processingMatchId === match._id}
                              title="Dispute if the score is incorrect"
                            >
                              ✗ Dispute
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.9rem' }}>Awaiting opponent...</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 3: COMPLETED MATCHES */}
      <div className="match-section">
        <h4 className="match-section-title" style={{ color: '#27ae60', borderBottomColor: '#27ae60' }}>
          ✓ Completed Matches ({getCompletedMatches().length}) - Final
        </h4>
        {getCompletedMatches().length === 0 ? (
          <p className="text-muted" style={{ padding: '20px', textAlign: 'center' }}>No completed matches yet.</p>
        ) : (
          <div className="match-table table-responsive">
            <table className="table table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Match</th>
                  <th className="text-center">Final Result</th>
                  <th className="text-center">Approved By</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {getCompletedMatches().map((match) => (
                  <tr key={match._id} style={{ backgroundColor: '#e8f5e9' }}>
                    <td style={{ fontWeight: 600 }}>
                      {getPlayerName(match.player1)} <span style={{ color: '#95a5a6' }}>vs</span> {getPlayerName(match.player2)}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 700 }}>
                      <span style={{ color: '#27ae60' }}>{match.score1} - {match.score2}</span>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '0.9rem', color: '#555' }}>
                      {getPlayerName(match.approvedBy)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge bg-success" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                        ✓ Approved
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DISPUTE MODAL */}
      {disputeModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <h5 style={{ color: '#2c3e50', marginBottom: '20px' }}>Why are you disputing this score?</h5>
            <textarea
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ecf0f1',
                borderRadius: '6px',
                fontFamily: 'inherit',
                fontSize: '1rem',
                minHeight: '100px',
                marginBottom: '20px',
                boxSizing: 'border-box'
              }}
              placeholder="e.g., The final score was 4-3, not 3-2..."
              value={disputeModal.reason}
              onChange={(e) => setDisputeModal({ ...disputeModal, reason: e.target.value })}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setDisputeModal({ show: false, matchId: null, reason: '' })}
                disabled={processingMatchId === disputeModal.matchId}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDisputeScore}
                disabled={processingMatchId === disputeModal.matchId}
              >
                {processingMatchId === disputeModal.matchId ? 'Submitting...' : 'Submit Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}

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
