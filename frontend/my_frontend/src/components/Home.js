import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '900px',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          color: 'white',
          marginBottom: '60px'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
          }}>
            ⚽ FIFA Tournament Manager
          </h1>
          <p style={{
            fontSize: '1.3rem',
            marginBottom: '40px',
            opacity: 0.95
          }}>
            Manage your team, organize tournaments, and track player statistics
          </p>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px',
          marginBottom: '60px'
        }}>
          {/* Feature 1 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            textAlign: 'center',
            transition: 'transform 0.3s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>👥</div>
            <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Team Management</h3>
            <p style={{ color: '#7f8c8d' }}>
              Create or join teams, manage players, and organize your group with ease.
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            textAlign: 'center',
            transition: 'transform 0.3s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🏆</div>
            <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Tournaments</h3>
            <p style={{ color: '#7f8c8d' }}>
              Create and manage tournaments with automatic leaderboard calculations based on standings.
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            textAlign: 'center',
            transition: 'transform 0.3s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📊</div>
            <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Live Statistics</h3>
            <p style={{ color: '#7f8c8d' }}>
              Track player performance with real-time stats, leaderboards, and comprehensive game records.
            </p>
          </div>

          {/* Feature 4 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            textAlign: 'center',
            transition: 'transform 0.3s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>✅</div>
            <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Score Verification</h3>
            <p style={{ color: '#7f8c8d' }}>
              Both players must approve scores before they're finalized, ensuring accuracy and fairness.
            </p>
          </div>

          {/* Feature 5 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            textAlign: 'center',
            transition: 'transform 0.3s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🔐</div>
            <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Private Teams</h3>
            <p style={{ color: '#7f8c8d' }}>
              Each team has private access to their players and tournaments for enhanced privacy.
            </p>
          </div>

          {/* Feature 6 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            textAlign: 'center',
            transition: 'transform 0.3s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚡</div>
            <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Easy Invites</h3>
            <p style={{ color: '#7f8c8d' }}>
              Share invite links with friends or let them join by team name - simple and fast.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '40px',
          marginBottom: '60px',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '30px', textAlign: 'center' }}>How It Works</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '30px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px'
              }}>
                1
              </div>
              <h4>Sign Up & Login</h4>
              <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Create your account or log in with existing credentials</p>
            </div>
            <div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px'
              }}>
                2
              </div>
              <h4>Join or Create Team</h4>
              <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Join an existing team or build your own</p>
            </div>
            <div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px'
              }}>
                3
              </div>
              <h4>Organize Games</h4>
              <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Create tournaments and schedule matches</p>
            </div>
            <div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px'
              }}>
                4
              </div>
              <h4>Track Scores</h4>
              <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Update scores and verify with opponents</p>
            </div>
            <div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px'
              }}>
                5
              </div>
              <h4>View Leaderboard</h4>
              <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Check final standings and player stats</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '15px 40px',
              backgroundColor: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              transition: 'transform 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Get Started Now
          </button>
          <button
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            style={{
              padding: '15px 40px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'white';
            }}
          >
            Learn More
          </button>
        </div>

        {/* Footer Info */}
        <div style={{
          marginTop: '80px',
          textAlign: 'center',
          color: 'white',
          opacity: 0.8,
          fontSize: '0.9rem'
        }}>
          <p>Already have an account? <span 
            style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
            onClick={() => navigate('/login')}
          >
            Sign In
          </span></p>
        </div>
      </div>
    </div>
  );
};

export default Home;
