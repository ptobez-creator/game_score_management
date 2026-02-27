import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:5000');

const GameRecords = () => {
  const [games, setGames] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/games', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGames(response.data);
      } catch (err) {
        console.error('Error fetching games:', err);
        toast.error('Failed to fetch games. Please try again.');
      }
    };

    fetchGames();

    socket.on('score-updated', (data) => {
      toast.info(data.message);
      setNotifications((prev) => [...prev, data.message]);
    });

    return () => socket.off('score-updated');
  }, [navigate]);

  const handleScoreApproval = async (notification) => {
    try {
      await socket.emit('score-approved', { message: notification });
      toast.success('Score approved successfully!');
      setNotifications((prev) => prev.filter((note) => note !== notification));
    } catch (err) {
      toast.error('Error approving the score.');
    }
  };

  return (
    <div className="form-container" style={{ marginTop: '20px' }}>
      <h3 style={{ color: '#2c3e50', marginBottom: '20px', fontWeight: 700, borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
        📊 Game Records
      </h3>

      {games.length === 0 ? (
        <div style={{ padding: '30px 20px', textAlign: 'center' }}>
          <p className="text-muted" style={{ fontSize: '1rem' }}>No games played yet.</p>
        </div>
      ) : (
        <div style={{ marginBottom: '30px' }}>
          <div className="table-responsive" style={{  borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <table className="table table-striped" style={{ marginBottom: 0 }}>
              <thead className="table-dark">
                <tr>
                  <th style={{ padding: '15px' }}>Player 1</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>vs</th>
                  <th style={{ padding: '15px' }}>Player 2</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game, index) => (
                  <tr key={game._id} style={{ animation: `fadeIn 0.3s ease ${index * 0.05}s` }}>
                    <td style={{ padding: '12px 15px', fontWeight: 600, color: '#2c3e50' }}>
                      {game.player1 || 'Player 1'}
                    </td>
                    <td style={{ padding: '12px 15px', textAlign: 'center', color: '#95a5a6' }}>⚽</td>
                    <td style={{ padding: '12px 15px', fontWeight: 600, color: '#2c3e50' }}>
                      {game.player2 || 'Player 2'}
                    </td>
                    <td style={{ padding: '12px 15px', textAlign: 'center', fontWeight: 700, color: '#3498db' }}>
                      {game.score || 'TBD'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h4 style={{ color: '#2c3e50', marginTop: '30px', marginBottom: '15px', fontWeight: 700, borderBottom: '2px solid #f39c12', paddingBottom: '10px' }}>
        🔔 Notifications ({notifications.length})
      </h4>

      {notifications.length === 0 ? (
        <div style={{ padding: '30px 20px', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <p className="text-muted" style={{ fontSize: '1rem', margin: 0 }}>No notifications yet. You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((notification, index) => (
            <div 
              key={index} 
              className="alert alert-info" 
              style={{
                margin: 0,
                borderLeft: '4px solid #3498db',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 20px',
                backgroundColor: '#d6eaf8'
              }}
            >
              <p style={{ margin: 0, color: '#1b4965', fontWeight: 500 }}>
                {notification}
              </p>
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleScoreApproval(notification)}
                style={{ whiteSpace: 'nowrap', marginLeft: '15px' }}
              >
                ✓ Approve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameRecords;
