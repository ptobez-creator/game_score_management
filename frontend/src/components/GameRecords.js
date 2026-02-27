import React from "react";

function Leaderboard() {
  const players = [
    { name: "K_choice", wins: 10 },
    { name: "Xander_smart", wins: 8 },
    { name: "mr_ryte", wins: 5 },
    // Add more players here
  ];

  return (
    <div>
      <h2>Leaderboard</h2>
      <ul>
        {players
          .sort((a, b) => b.wins - a.wins) // Sort players by wins in descending order
          .map((player, index) => (
            <li key={index}>
              {player.name} - {player.wins} wins
            </li>
          ))}
      </ul>
    </div>
  );
}

export default Leaderboard;