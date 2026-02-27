import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

// Utility function to create tournament via API
const createTournamentAPI = async ({ name, playerIds }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication token not found. Please log in.');
  }

  try {
    const response = await axios.post(
      'http://localhost:5000/tournaments',
      {
        name: name || `Tournament - ${new Date().toLocaleDateString()}`,
        participants: playerIds,
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
  const [tournamentName, setTournamentName] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingMembers, setFetchingMembers] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/teams/team-members', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Extract user IDs from team members
      const members = response.data.members || response.data;
      const membersWithIds = members.map((member) => ({
        _id: member._id,
        name: member.name,
        email: member.email || 'N/A',
      }));

      setTeamMembers(membersWithIds);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setFetchingMembers(false);
    }
  };

  const togglePlayerSelection = (playerId) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPlayers.length === teamMembers.length) {
      setSelectedPlayers([]);
    } else {
      setSelectedPlayers(teamMembers.map((member) => member._id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedPlayers.length < 2) {
      toast.error('At least 2 players are required.');
      return;
    }

    setLoading(true);
    try {
      await createTournamentAPI({
        name: tournamentName.trim() || `Tournament - ${new Date().toLocaleDateString()}`,
        playerIds: selectedPlayers,
      });

      toast.success('Tournament created successfully!');
      navigate('/tournaments');
    } catch (err) {
      toast.error(err.message || 'Error creating tournament.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingMembers) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{ marginTop: '20px', color: '#7f8c8d' }}>Loading team members...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '30px', borderBottom: '3px solid #3498db', paddingBottom: '15px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>Create New Tournament</h2>
        <p style={{ color: '#7f8c8d', margin: 0 }}>Select team members to participate</p>
      </div>

      {teamMembers.length === 0 ? (
        <div
          style={{
            backgroundColor: '#fff3cd',
            borderLeft: '4px solid #ffc107',
            padding: '20px',
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#856404', marginBottom: 0 }}>
            ⚠️ No team members found. Please join a team first.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-container">
            <div className="form-group">
              <label htmlFor="tournamentName" className="form-label">
                Tournament Name (Optional)
              </label>
              <input
                type="text"
                id="tournamentName"
                placeholder="Enter tournament name or leave blank for auto-generated name"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                className="form-control"
                disabled={loading}
              />
            </div>

            <div className="form-section-title">
              Select Players
              <span style={{ fontSize: '0.9rem', color: '#7f8c8d', marginLeft: '10px' }}>
                ({selectedPlayers.length} selected)
              </span>
            </div>

            <div
              style={{
                marginBottom: '20px',
                display: 'flex',
                gap: '10px',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleSelectAll}
                disabled={loading}
              >
                {selectedPlayers.length === teamMembers.length ? 'Deselect All' : 'Select All'}
              </button>
              <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                At least 2 players required (up to 16)
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '12px',
                marginBottom: '25px',
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
              }}
            >
              {teamMembers.map((member) => (
                <div
                  key={member._id}
                  style={{
                    padding: '12px',
                    backgroundColor: selectedPlayers.includes(member._id) ? '#d4edda' : 'white',
                    border: selectedPlayers.includes(member._id) ? '2px solid #28a745' : '1px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => !loading && togglePlayerSelection(member._id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={selectedPlayers.includes(member._id)}
                      onChange={() => {}}
                      disabled={loading}
                      style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', color: '#2c3e50' }}>{member.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>{member.email}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn-primary" disabled={loading || selectedPlayers.length < 2}>
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
          </div>
        </form>
      )}

      <div
        style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#d6eaf8',
          borderLeft: '4px solid #3498db',
          borderRadius: '6px',
        }}
      >
        <h5 style={{ color: '#1b4965', marginBottom: '10px' }}>💡 Tips</h5>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#2c3e50' }}>
          <li>Select at least 2 team members to create a tournament</li>
          <li>You can create tournaments with up to 16 players</li>
          <li>The tournament will automatically calculate a round-robin schedule</li>
          <li>Tournament name is optional - one will be generated automatically</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateTournament;
export { createTournamentAPI };
