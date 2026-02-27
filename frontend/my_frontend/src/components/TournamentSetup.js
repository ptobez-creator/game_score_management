import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { createTournamentAPI } from './createTournament';

const TournamentSetup = () => {
  const [numPlayers, setNumPlayers] = useState(4);
  const [playerNames, setPlayerNames] = useState(Array(4).fill(''));
  const [userIds, setUserIds] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [userProfile, setUserProfile] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Fetch the user profile after mounting
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await axios.get('http://localhost:5000/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserProfile(response.data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        navigate('/login');
      }
    };
    fetchUserProfile();
  }, [navigate]);

  // Fetch search results for player names
  useEffect(() => {
    if (searchQuery.length > 2) {
      const fetchSearchResults = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/users/search?query=${searchQuery}`
          );
          setSearchResults(response.data);
        } catch (err) {
          console.error('Error fetching search results:', err);
        }
      };
      fetchSearchResults();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleNumPlayersChange = (e) => {
    const num = Math.min(16, Math.max(4, parseInt(e.target.value) || 4));
    setNumPlayers(num);
    setPlayerNames(Array(num).fill(''));
    setUserIds([]);
    setRegisteredUsers([]);
  };

  const handleNameChange = (index, e) => {
    const updatedNames = [...playerNames];
    updatedNames[index] = e.target.value;
    setPlayerNames(updatedNames);
    setSearchQuery(updatedNames[index]);
  };

  const addParticipant = (name, index) => {
    const updatedNames = [...playerNames];
    updatedNames[index] = name;
    setPlayerNames(updatedNames);
    setSearchQuery('');
    setSearchResults([]);
  };

  const fetchUserIds = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const sanitizedNames = playerNames.map((name) => name.trim().toLowerCase());
      const response = await axios.post(
        'http://localhost:5000/users/get-ids',
        { names: sanitizedNames },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const fetchedUsers = response.data.ids || [];
      const unmatchedNames = sanitizedNames.filter(
        (name) => !fetchedUsers.some((user) => user.name.toLowerCase() === name)
      );

      if (unmatchedNames.length > 0) {
        setError(`The following participants could not be found: ${unmatchedNames.join(', ')}`);
        return;
      }

      setUserIds(fetchedUsers.map((user) => user.id));
      setRegisteredUsers(
        sanitizedNames.map((name, index) => ({
          name,
          id: fetchedUsers[index]?.id || null,
        }))
      );
      setStep(3);
    } catch (err) {
      console.error('Error fetching user IDs:', err);
      setError(err.response?.data?.msg || 'Error fetching user IDs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await createTournamentAPI({
        numPlayers,
        userIds,
      });
      alert('Tournament created successfully!');
      console.log('Tournament Created:', response.data);
    } catch (err) {
      console.error('Error creating tournament:', err);
      setError(err.message || 'Error creating tournament. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <h2>Setup Tournament</h2>
      {/* Input and form components */}
      {/* Example UI logic */}
      <button onClick={fetchUserIds}>Fetch Player IDs</button>
      <button onClick={handleCreateTournament}>Create Tournament</button>
      <button onClick={handleLogout}>Logout</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default TournamentSetup;