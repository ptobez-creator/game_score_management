import React, { useState, useEffect } from 'react';

const Leaderboard = () => {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            // Replace with your API URL to get leaderboard data
            const response = await fetch('/api/games/leaderboard');
            const data = await response.json();
            setPlayers(data);
        };

        fetchLeaderboard();
    }, []);

    return (
        <div className="container">
            <h1>Leaderboard</h1>
            <div className="card">
                {players.length > 0 ? (
                    players.map((player, index) => (
                        <div key={player._id} className="player-record">
                            <span>{index + 1}. {player.name}</span>
                            <span>Wins: {player.wins}</span>
                        </div>
                    ))
                ) : (
                    <p>No leaderboard data available.</p>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;