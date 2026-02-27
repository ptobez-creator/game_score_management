const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const games = await Game.find({ 
      $or: [{ player1: req.user.id }, { player2: req.user.id }] 
    })
      .populate('player1', ['name', 'email'])
      .populate('player2', ['name', 'email']);

    res.json(games);
  } catch (err) {
    console.error('Error fetching games:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;