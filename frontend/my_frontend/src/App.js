import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import TeamJoin from './components/TeamJoin';
import Leaderboard from './components/Leaderboard';
import CreateTournament from './components/createTournament';
import RegisteredPlayers from './components/RegisteredPlayers';
import TournamentsList from './components/TournamentsList';
import TournamentMatches from './components/TournamentMatches';
import TeamAdmin from './components/TeamAdmin';
import UserProfile from './components/UserProfile';
import Dashboard from './components/Dashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

// Component that uses useLocation - must be inside Router
function AppContent() {
  const [user, setUser] = useState(null);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const location = useLocation();

  const isTokenValid = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && isTokenValid(token)) {
      const decoded = jwtDecode(token);
      setUser({ id: decoded.user.id, email: decoded.user.email });
      checkTeamStatus(token);
    } else {
      localStorage.removeItem('token');
    }
  }, []);

  const checkTeamStatus = async (token) => {
    setLoadingTeam(true);
    try {
      const response = await axios.get('http://localhost:5000/teams/my-team', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentTeam(response.data);
    } catch (err) {
      setCurrentTeam(null);
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentTeam(null);
  };

  const handleTeamSelected = (team) => {
    setCurrentTeam(team);
  };

  const showNavbar = user && !['/', '/login', '/team-join'].includes(location.pathname) && !loadingTeam;

  return (
    <>
      {showNavbar && (
        <nav style={{
          backgroundColor: '#667eea',
          padding: '15px 20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <ul style={{
            display: 'flex',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            gap: '30px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <li style={{ fontWeight: 'bold', color: 'white', marginRight: 'auto' }}>
              {currentTeam && `👥 ${currentTeam.name}`}
            </li>
            <li><Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link></li>
            <li><Link to="/create-game" style={{ color: 'white', textDecoration: 'none' }}>Create Tournament</Link></li>
            <li><Link to="/tournaments" style={{ color: 'white', textDecoration: 'none' }}>Tournaments</Link></li>
            <li><Link to="/players" style={{ color: 'white', textDecoration: 'none' }}>Team Players</Link></li>
            <li><Link to="/team-admin" style={{ color: 'white', textDecoration: 'none' }}>Team Admin</Link></li>
            <li><Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>Profile</Link></li>
            <li>
              <button onClick={handleLogout} style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to={currentTeam ? "/dashboard" : "/team-join"} />} />
        <Route path="/team-join" element={user ? <TeamJoin onTeamSelected={handleTeamSelected} /> : <Navigate to="/login" />} />
        
        <Route path="/dashboard" element={user && currentTeam && !loadingTeam ? <Dashboard /> : user ? <Navigate to="/team-join" /> : <Navigate to="/login" />} />

        <Route path="/create-game" element={user && currentTeam && !loadingTeam ? <CreateTournament /> : (user ? <Navigate to="/team-join" /> : <Navigate to="/login" />)} />
        <Route path="/tournaments" element={user && currentTeam && !loadingTeam ? <TournamentsList /> : (user ? <Navigate to="/team-join" /> : <Navigate to="/login" />)} />
        <Route path="/tournaments/:tournamentId/matches" element={user && currentTeam && !loadingTeam ? <TournamentMatches /> : (user ? <Navigate to="/team-join" /> : <Navigate to="/login" />)} />
        <Route path="/leaderboard/:tournamentId" element={user && currentTeam && !loadingTeam ? <Leaderboard /> : (user ? <Navigate to="/team-join" /> : <Navigate to="/login" />)} />
        <Route path="/players" element={user && currentTeam && !loadingTeam ? <RegisteredPlayers /> : (user ? <Navigate to="/team-join" /> : <Navigate to="/login" />)} />
        <Route path="/team-admin" element={user ? <TeamAdmin /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <UserProfile /> : <Navigate to="/login" />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

// Main App component - only wraps with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
