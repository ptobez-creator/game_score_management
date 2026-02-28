import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard = () => {
  const [playerStats, setPlayerStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllTimeStats();
  }, []);

  const fetchAllTimeStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Fetch team info
      const teamResponse = await axios.get(process.env.REACT_APP_API_URL + '/teams/my-team', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeamName(teamResponse.data.name);

      // Fetch all tournaments for the team
      const tournamentsResponse = await axios.get(process.env.REACT_APP_API_URL + '/tournaments', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Aggregate stats across all tournaments
      const statsMap = {};

      tournamentsResponse.data.forEach((tournament) => {
        tournament.groupTable.forEach((entry) => {
          const playerId = entry.player._id || entry.player;
          const playerName = entry.player.name || 'Unknown Player';

          if (!statsMap[playerId]) {
            statsMap[playerId] = {
              playerId,
              playerName,
              totalPoints: 0,
              totalWins: 0,
              totalPlayed: 0,
              totalGoalsScored: 0,
              totalGoalsAgainst: 0,
              totalGoalDifference: 0,
              tournamentsPlayed: 0,
            };
          }

          statsMap[playerId].totalPoints += entry.points || 0;
          statsMap[playerId].totalWins += entry.won || 0;
          statsMap[playerId].totalPlayed += entry.played || 0;
          statsMap[playerId].totalGoalsScored += entry.goalsScored || 0;
          statsMap[playerId].totalGoalsAgainst += entry.goalsAgainst || 0;
          statsMap[playerId].totalGoalDifference += entry.goalDifference || 0;
          statsMap[playerId].tournamentsPlayed += 1;
        });
      });

      // Convert to array and sort by total points (descending order - highest to lowest)
      const sortedStats = Object.values(statsMap).sort((a, b) => {
        if (b.totalPoints === a.totalPoints) {
          return b.totalGoalDifference - a.totalGoalDifference; // Descending by goal difference
        }
        return b.totalPoints - a.totalPoints; // Descending by points
      });

      setPlayerStats(sortedStats);
    } catch (err) {
      console.error('Error fetching stats:', err);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (index) => {
    // Descending order - top winners are at the beginning
    if (index === 0) return '🥇'; // Gold for highest points
    if (index === 1) return '🥈'; // Silver
    if (index === 2) return '🥉'; // Bronze
    return ''; // No medal
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{ marginTop: '20px', color: '#7f8c8d' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '30px 20px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>
          📊 {teamName} Dashboard
        </h2>
        <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
          All-Time Player Rankings
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: '#3498db',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '2rem' }}>{playerStats.length}</h3>
          <p style={{ margin: '5px 0 0 0' }}>Total Players</p>
        </div>
        <div style={{
          backgroundColor: '#27ae60',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '2rem' }}>
            {playerStats.reduce((sum, p) => sum + p.tournamentsPlayed, 0)}
          </h3>
          <p style={{ margin: '5px 0 0 0' }}>Total Tournaments</p>
        </div>
        <div style={{
          backgroundColor: '#e74c3c',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '2rem' }}>
            {playerStats.reduce((sum, p) => sum + p.totalGoalsScored, 0)}
          </h3>
          <p style={{ margin: '5px 0 0 0' }}>Total Goals</p>
        </div>
      </div>

      {/* Player Rankings Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: '#667eea',
          color: 'white',
          padding: '15px 20px',
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          🏆 All-Time Player Rankings (Highest to Lowest)
        </div>

        {playerStats.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>
            <p>No player statistics available yet.</p>
            <p>Create tournaments and play games to see rankings!</p>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => navigate('/create-game')}
            >
              Create Tournament
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-striped table-hover mb-0">
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '15px' }}>Rank</th>
                  <th style={{ padding: '15px' }}>Player</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Points</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Wins</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Played</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Goals For</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Goals Against</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Goal Diff</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Tournaments</th>
                </tr>
              </thead>
              <tbody>
                {playerStats.map((player, index) => (
                  <tr key={player.playerId}>
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>
                      {index + 1} {getMedalEmoji(index)}
                    </td>
                    <td style={{ padding: '15px', fontWeight: '600' }}>
                      {player.playerName}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', color: '#3498db' }}>
                      {player.totalPoints}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', color: '#27ae60' }}>
                      {player.totalWins}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      {player.totalPlayed}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', color: '#27ae60' }}>
                      {player.totalGoalsScored}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', color: '#e74c3c' }}>
                      {player.totalGoalsAgainst}
                    </td>
                    <td style={{ 
                      padding: '15px', 
                      textAlign: 'center',
                      color: player.totalGoalDifference > 0 ? '#27ae60' : player.totalGoalDifference < 0 ? '#e74c3c' : '#95a5a6',
                      fontWeight: 'bold'
                    }}>
                      {player.totalGoalDifference > 0 ? '+' : ''}{player.totalGoalDifference}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      {player.tournamentsPlayed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{
        marginTop: '30px',
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button 
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/create-game')}
        >
          🎮 Create New Tournament
        </button>
        <button 
          className="btn btn-outline-primary btn-lg"
          onClick={() => navigate('/tournaments')}
        >
          📋 View All Tournaments
        </button>
        <button 
          className="btn btn-outline-secondary btn-lg"
          onClick={() => navigate('/players')}
        >
          👥 Team Players
        </button>
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#d6eaf8',
        borderLeft: '4px solid #3498db',
        borderRadius: '6px'
      }}>
        <h5 style={{ color: '#1b4965', marginBottom: '10px' }}>💡 How Rankings Work</h5>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#2c3e50' }}>
          <li>Players are ranked by total points across all tournaments</li>
          <li>Rank 1 = Highest points (descending order - best players first)</li>
          <li>Players with equal points are ranked by goal difference</li>
          <li>🥇🥈🥉 Medals show top 3 performers (ranks 1, 2, and 3)</li>
          <li>Stats are aggregated from all completed and ongoing tournaments</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
