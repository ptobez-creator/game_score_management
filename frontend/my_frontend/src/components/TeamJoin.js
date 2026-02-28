import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

const TeamJoin = ({ onTeamSelected }) => {
  const [mode, setMode] = useState('select'); // select, create, join, joinByCode
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [joinTeamName, setJoinTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check if already in a team
  useEffect(() => {
    const checkCurrentTeam = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(process.env.REACT_APP_API_URL + '/teams/my-team', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCurrentTeam(response.data);
        if (onTeamSelected) {
          onTeamSelected(response.data);
        }
      } catch (err) {
        // User doesn't have a team yet
        // Check for invite code in URL
        const code = searchParams.get('invite');
        if (code) {
          setInviteCode(code);
          setMode('joinByCode');
        }
      }
    };

    checkCurrentTeam();
  }, [searchParams, onTeamSelected]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(process.env.REACT_APP_API_URL + '/teams/create', {
        name: teamName,
        description: teamDescription,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCurrentTeam(response.data.team);
      toast.success('Team created successfully!');
      if (onTeamSelected) {
        onTeamSelected(response.data.team);
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error creating team');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!joinTeamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Call backend to find and join team by name
      const response = await axios.post(process.env.REACT_APP_API_URL + '/teams/join-by-name', {
        teamName: joinTeamName,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCurrentTeam(response.data.team);
      toast.success('Successfully joined team!');
      if (onTeamSelected) {
        onTeamSelected(response.data.team);
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error joining team');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast.error('Invite code is required');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(process.env.REACT_APP_API_URL + '/teams/join-by-code', {
        code: inviteCode,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCurrentTeam(response.data.team);
      toast.success('Successfully joined team!');
      if (onTeamSelected) {
        onTeamSelected(response.data.team);
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Invalid or expired invite code');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipForNow = () => {
    toast.info('You need to join or create a team to continue');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Back to Home Button - Top Left */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          border: '2px solid white',
          borderRadius: '6px',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.3s',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
      >
        ← Back to Home
      </button>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        padding: '40px',
        maxWidth: '500px',
        width: '100%'
      }}>
        {/* Already in team */}
        {currentTeam && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>👥</div>
              <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>Welcome Back!</h2>
              <p style={{ color: '#7f8c8d' }}>You're in <strong>{currentTeam.name}</strong></p>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '15px'
              }}
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => navigate('/team-admin')}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'transparent',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              Manage Team
            </button>

            <button
              onClick={() => navigate('/')}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'transparent',
                color: '#95a5a6',
                border: '2px solid #95a5a6',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              ← Back to Home
            </button>
          </>
        )}

        {/* Team Selection Mode */}
        {!currentTeam && mode === 'select' && (
          <>
            <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>
              Join or Create Team
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button
                onClick={() => setMode('create')}
                style={{
                  padding: '20px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#5568d3'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
              >
                ➕ Create New Team
              </button>

              <button
                onClick={() => setMode('join')}
                style={{
                  padding: '20px',
                  backgroundColor: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#229954'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#27ae60'}
              >
                🔍 Join Team by Name
              </button>

              <button
                onClick={() => setMode('joinByCode')}
                style={{
                  padding: '20px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
              >
                🔗 Join with Invite Link
              </button>
            </div>

            <button
              onClick={() => navigate('/')}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '12px',
                backgroundColor: 'transparent',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              ← Back to Home
            </button>
          </>
        )}

        {/* Create Team Mode */}
        {mode === 'create' && (
          <>
            <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>
              Create New Team
            </h2>

            <form onSubmit={handleCreateTeam}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                  Team Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ecf0f1',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                  Team Description (Optional)
                </label>
                <textarea
                  placeholder="Enter team description"
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ecf0f1',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    minHeight: '100px'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: loading ? '#95a5a6' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: '10px'
                }}
              >
                {loading ? 'Creating...' : 'Create Team'}
              </button>

              <button
                type="button"
                onClick={() => setMode('select')}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
            </form>
          </>
        )}

        {/* Join Team Mode */}
        {mode === 'join' && (
          <>
            <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>
              Join Team by Name
            </h2>

            <form onSubmit={handleJoinTeam}>
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                  Team Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter the team name to join"
                  value={joinTeamName}
                  onChange={(e) => setJoinTeamName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ecf0f1',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: loading ? '#95a5a6' : '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: '10px'
                }}
              >
                {loading ? 'Joining...' : 'Join Team'}
              </button>

              <button
                type="button"
                onClick={() => setMode('select')}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
            </form>
          </>
        )}

        {/* Join by Invite Code Mode */}
        {mode === 'joinByCode' && (
          <>
            <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>
              Join with Invite Link
            </h2>

            <form onSubmit={handleJoinByCode}>
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                  Invite Code *
                </label>
                <input
                  type="text"
                  placeholder="Enter the invite code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ecf0f1',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    fontFamily: 'monospace',
                    letterSpacing: '2px'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: loading ? '#95a5a6' : '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: '10px'
                }}
              >
                {loading ? 'Joining...' : 'Join Team'}
              </button>

              <button
                type="button"
                onClick={() => setMode('select')}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default TeamJoin;
