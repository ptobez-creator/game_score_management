const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const authMiddleware = require('../middleware/authMiddleware');

// When a player updates the score
router.put('/update-score', authMiddleware, async (req, res) => {
  const { gameId, score1, score2, opponentId } = req.body;

  if (!gameId || score1 === undefined || score2 === undefined || !opponentId) {
    return res.status(400).json({ msg: 'All fields (gameId, score1, score2, opponentId) are required' });
  }

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ msg: 'Game not found' });
    }

    // Update the game score
    game.scores = [score1, score2];
    await game.save();

    // Notify the opponent (e.g., using socket.io or email)
    notifyOpponent(opponentId, { gameId, score1, score2 });

    res.json({ msg: 'Score updated, awaiting opponent approval' });
  } catch (err) {
    console.error('Error updating score:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Approve the score
router.put('/approve-score', authMiddleware, async (req, res) => {
  const { gameId, approved } = req.body;

  if (!gameId || approved === undefined) {
    return res.status(400).json({ msg: 'gameId and approved status are required' });
  }

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ msg: 'Game not found' });
    }

    if (approved) {
      game.status = 'approved';
    } else {
      game.status = 'disputed';
    }

    await game.save();
    res.json({ msg: `Score ${approved ? 'approved' : 'disputed'}` });
  } catch (err) {
    console.error('Error approving score:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

function notifyOpponent(opponentId, gameData) {
  // Implement email notification or Socket.IO message to notify the opponent
  console.log(`Notifying opponent ${opponentId} about game score update:`, gameData);
  // TODO: Implement actual notification mechanism (email, websocket, etc.)
}

module.exports = router;