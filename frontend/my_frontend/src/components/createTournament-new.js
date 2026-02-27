import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

// Utility function to create tournament via API
const createTournamentAPI = async ({ numPlayers, userIds }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication token not found. Please log in.');
  }

  try {
    const response = await axios.post(
      'http://localhost:5000/tournaments',
      {
        name: `Tournament for ${numPlayers} Players`,
        participants: userIds,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.msg || 'Error creating tournament.');
  }
};

// React component for creating a tournament
const CreateTournament = () => {
  const [numPlayers, setNumPlayers] = useState(4);
  const [playerNames, setPlayerNames] = useState(Array(4).fill(''));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePlayerNameChange = (index, value) => {
    const updatedNames = [...playerNames];
    updatedNames[index] = value;
    setPlayerNames(updatedNames);
  };

  const handleNumPlayersChange = (e) => {
    const num = Math.min(16, Math.max(2, parseInt(e.target.value) || 2));
    setNumPlayers(num);
    setPlayerNames(Array(num).fill(''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const filledNames = playerNames.filter((name) => name.trim());

    if (filledNames.length < 2) {
      toast.error('At least 2 players are required.');
      setLoading(false);
      return;
    }

    try {
      await createTournamentAPI({
        numPlayers: filledNames.length,
        userIds: filledNames,
      });
      toast.success('Tournament created successfully!');
      navigate('/tournaments');
    } catch (err) {
      toast.error(err.message || 'Error creating tournament.');
      console.error('Error:',err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '30px', borderBottom: '3px solid #3498db', paddingBottom: '15px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>Create New Tournament</h2>
        <p style={{ color: '#7f8c8d', margin: 0 }}>Set up a new tournament with your players</p>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="numPlayers" className="form-label">
              Number of Players
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                id="numPlayers"
                min="2"
                max="16"
                value={numPlayers}
                onChange={handleNumPlayersChange}
                className="form-control"
                style={{ maxWidth: '120px' }}
              />
              <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                (Minimum 2, Maximum 16)
              </span>
            </div>
          </div>

          <div className="form-section-title">Player Names</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '25px' }}>
            {playerNames.map((name, index) => (
              <div key={index} className="form-group" style={{ margin: 0 }}>
                <label htmlFor={`player-${index}`} style={{ marginBottom: '8px', display: 'block' }}>
                  Player {index + 1}
                </label>
                <input
                  id={`player-${index}`}
                  type="text"
                  placeholder={`Enter player ${index + 1} name`}
                  value={name}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  className="form-control"
                  style={{
                    borderLeft: name.trim() ? '3px solid #27ae60' : '3px solid #ecf0f1'
                  }}
                />
              </div>
            ))}
          </div>

          <div className="button-group">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating Tournament...
                </>
              ) : (
                '✓ Create Tournament'
              )}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#d6eaf8',
        borderLeft: '4px solid #3498db',
        borderRadius: '6px'
      }}>
        <h5 style={{ color: '#1b4965', marginBottom: '10px' }}>💡 Tips</h5>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#2c3e50' }}>
          <li>You need at least 2 players to create a tournament</li>
          <li>Each player must have a unique name</li>
          <li>You can create tournaments with up to 16 players</li>
          <li>The tournament will automatically calculate a round-robin schedule</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateTournament;
export { createTournamentAPI };
