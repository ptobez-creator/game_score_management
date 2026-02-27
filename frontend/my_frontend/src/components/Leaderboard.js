import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Leaderboard = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [groupTable, setGroupTable] = useState([]);
  const [tournamentName, setTournamentName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          setLoading(false);
          return;
        }

        if (!tournamentId) {
          setError('Tournament ID is required to fetch leaderboard data.');
          setLoading(false);
          return;
        }

        // Fetch the tournament to get the name and group table
        const response = await axios.get(
          `http://localhost:5000/tournaments/${tournamentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data) {
          setTournamentName(response.data.name);
          // Fetch full player data for the group table
          const groupTableWithNames = await Promise.all(
            response.data.groupTable.map(async (entry) => {
              if (typeof entry.player === 'string') {
                // If player is just an ID, fetch user details
                const userResponse = await axios.get(
                  `http://localhost:5000/users/${entry.player}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                return { ...entry, playerData: userResponse.data };
              }
              return { ...entry, playerData: entry.player };
            })
          );
          setGroupTable(groupTableWithNames);
        } else {
          setError('Tournament data is empty.');
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(err.response?.data?.msg || 'Error fetching leaderboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [tournamentId]);

  // Sort by: Points (DESC) -> Goals For (DESC) -> Goal Difference (DESC)
  const sortedGroupTable = [...groupTable].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points; // Primary: Higher points first
    }
    if (b.goalsScored !== a.goalsScored) {
      return b.goalsScored - a.goalsScored; // Secondary: More goals scored first
    }
    return b.goalDifference - a.goalDifference; // Tertiary: Better goal difference first
  });

  if (loading) return <div className="container mt-4"><p>Loading leaderboard...</p></div>;

  return (
    <div className="container mt-5 leaderboard-container">
      <div className="leaderboard-header mb-4">
        <h2 className="tournament-title">{tournamentName || 'Tournament Leaderboard'}</h2>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {sortedGroupTable.length > 0 ? (
        <div className="table-responsive leaderboard-table-wrapper">
          <table className="table table-striped leaderboard-table">
            <thead className="table-dark">
              <tr>
                <th className="rank-col">Rank</th>
                <th className="player-col">Player</th>
                <th className="stat-col">Played</th>
                <th className="stat-col">Won</th>
                <th className="stat-col">Draw</th>
                <th className="stat-col">Lost</th>
                <th className="stat-col points-col">Points</th>
                <th className="stat-col">Goals For</th>
                <th className="stat-col">Goals Against</th>
                <th className="stat-col">Goal Diff</th>
              </tr>
            </thead>
            <tbody>
              {sortedGroupTable.map((entry, index) => {
                const playerName = entry.playerData?.name || 'Unknown';
                const isFirstPlace = index === 0;
                const isSecondPlace = index === 1;
                const isThirdPlace = index === 2;
                return (
                  <tr key={entry._id} className={`${isFirstPlace ? 'first-place' : isSecondPlace ? 'second-place' : isThirdPlace ? 'third-place' : ''}`}>
                    <td className="rank-cell"><strong>#{index + 1}</strong></td>
                    <td className="player-name">{playerName}</td>
                    <td className="stat-cell">{entry.played}</td>
                    <td className="stat-cell">{entry.won}</td>
                    <td className="stat-cell">{entry.draw}</td>
                    <td className="stat-cell">{entry.lost}</td>
                    <td className="stat-cell points-cell"><strong>{entry.points}</strong></td>
                    <td className="stat-cell">{entry.goalsScored}</td>
                    <td className="stat-cell">{entry.goalsAgainst}</td>
                    <td className="stat-cell goal-diff">{entry.goalDifference > 0 ? '+' : ''}{entry.goalDifference}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted">No leaderboard data available.</p>
      )}
      <div className="button-group mt-4">
        <button className="btn btn-primary me-2" onClick={() => navigate(`/tournaments/${tournamentId}/matches`)}>
          <i className="fas fa-edit"></i> Update Scores
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;