import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import 'bootstrap/dist/css/bootstrap.min.css';

const TeamAdmin = () => {
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('members'); // members, edit, add
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

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
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      const [teamResponse, membersResponse] = await Promise.all([
        axios.get('/teams/my-team'),
        axios.get('/teams/team-members'),
      ]);

      setTeam(teamResponse.data);
      setTeamName(teamResponse.data.name);
      setTeamDescription(teamResponse.data.description);
      setMembers(membersResponse.data.members);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('You do not belong to any team. Create or join a team first.');
        setActiveTab('create');
      } else {
        setError(err.response?.data?.msg || 'Error loading team data');
        console.error('Error fetching team data:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/teams/create', {
        name: teamName,
        description: teamDescription,
      });

      toast.success('Team created successfully!');
      setTeamName('');
      setTeamDescription('');
      await fetchTeamData();
      setActiveTab('members');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error creating team');
    }
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put('/teams/update', {
        name: teamName,
        description: teamDescription,
      });

      toast.success('Team updated successfully!');
      await fetchTeamData();
      setActiveTab('members');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error updating team');
    }
  };

  const handleSearchMembers = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/teams/search-available-members', {
        params: { query: searchQuery },
      });
      setSearchResults(response.data);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error searching members');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async (memberId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/teams/add-member', {
        memberId,
      });

      toast.success('Member added successfully!');
      setSearchQuery('');
      setSearchResults([]);
      await fetchTeamData();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error adding member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the team?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/teams/remove-member', {
        memberId,
      });

      toast.success('Member removed successfully!');
      await fetchTeamData();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error removing member');
    }
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete('/teams/delete');

      toast.success('Team deleted successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error deleting team');
    }
  };

  const isTeamOwner = team && currentUserId && team.owner._id === currentUserId;

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <p>Loading team data...</p>
        </div>
      </div>
    );
  }

  if (!team && error.includes('do not belong to any team')) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Create Your Team</h2>
          <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
            You don't belong to any team yet. Create your own team to start managing players.
          </p>

          <form onSubmit={handleCreateTeam}>
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                Team Name
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

            <div style={{ marginBottom: '30px', textAlign: 'left' }}>
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
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5568d3'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
            >
              Create Team
            </button>
          </form>

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              marginTop: '15px',
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
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '30px 20px' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ color: '#2c3e50', marginBottom: '8px' }}>{team?.name}</h1>
              <p style={{ color: '#7f8c8d', margin: 0 }}>
                {isTeamOwner ? '👑 Team Owner' : '👤 Team Member'} • {members.length} Member{members.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {error && error.includes('belong') === false && (
          <div className="alert alert-danger" style={{ borderRadius: '12px' }}>{error}</div>
        )}

        {/* Tabs */}
        {team && (
          <div style={{ marginBottom: '30px' }}>
            <div style={{
              display: 'flex',
              gap: '10px',
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '15px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
            }}>
              <button
                onClick={() => setActiveTab('members')}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: activeTab === 'members' ? '#667eea' : 'transparent',
                  color: activeTab === 'members' ? 'white' : '#667eea',
                  border: activeTab === 'members' ? 'none' : '2px solid #667eea',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                👥 Members
              </button>
              {isTeamOwner && (
                <>
                  <button
                    onClick={() => setActiveTab('add')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: activeTab === 'add' ? '#667eea' : 'transparent',
                      color: activeTab === 'add' ? 'white' : '#667eea',
                      border: activeTab === 'add' ? 'none' : '2px solid #667eea',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ➕ Add Member
                  </button>
                  <button
                    onClick={() => setActiveTab('edit')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: activeTab === 'edit' ? '#667eea' : 'transparent',
                      color: activeTab === 'edit' ? 'white' : '#667eea',
                      border: activeTab === 'edit' ? 'none' : '2px solid #667eea',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ⚙️ Settings
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB: Members */}
        {activeTab === 'members' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>Team Members ({members.length})</h3>
            
            {members.length === 0 ? (
              <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '40px 0' }}>
                No team members yet. {isTeamOwner ? 'Add members to get started!' : ''}
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped" style={{ margin: 0 }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Joined Date</th>
                      {isTeamOwner && <th className="text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member._id}>
                        <td style={{ fontWeight: 600 }}>
                          {member.name}
                          {member._id === team.owner._id && <span style={{ marginLeft: '8px', color: '#f39c12' }}>👑</span>}
                        </td>
                        <td>{member.email}</td>
                        <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                        {isTeamOwner && (
                          <td className="text-center">
                            {member._id !== team.owner._id && (
                              <button
                                onClick={() => handleRemoveMember(member._id)}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#e74c3c',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.9rem'
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: Add Member */}
        {activeTab === 'add' && isTeamOwner && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>Add Team Member</h3>
            
            <form onSubmit={handleSearchMembers} style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Search by player name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #ecf0f1',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {searchResults.length > 0 && (
              <div>
                <h5 style={{ color: '#2c3e50', marginBottom: '15px' }}>Available Players</h5>
                <div className="table-responsive">
                  <table className="table table-striped" style={{ margin: 0 }}>
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((player) => (
                        <tr key={player._id}>
                          <td style={{ fontWeight: 600 }}>{player.name}</td>
                          <td>{player.email}</td>
                          <td className="text-center">
                            <button
                              onClick={() => handleAddMember(player._id)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                              }}
                            >
                              Add
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !isSearching && (
              <p style={{ color: '#7f8c8d', textAlign: 'center' }}>No available players found.</p>
            )}
          </div>
        )}

        {/* TAB: Edit Team */}
        {activeTab === 'edit' && isTeamOwner && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '30px' }}>Team Settings</h3>
            
            <form onSubmit={handleUpdateTeam} style={{ marginBottom: '30px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                  Team Name
                </label>
                <input 
                  type="text" 
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
                  Team Description
                </label>
                <textarea 
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
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginRight: '10px'
                }}
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={handleDeleteTeam}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Delete Team
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamAdmin;
