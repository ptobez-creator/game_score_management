const express = require('express');
const Tournament = require('../models/Tournament');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Leaderboard route for a specific tournament
router.get('/:tournamentId', authMiddleware, async (req, res) => {
  try {
    const { tournamentId } = req.params;

    // Find tournament by ID and populate groupTable with user details
    const tournament = await Tournament.findById(tournamentId)
      .populate('groupTable.player', ['name', 'email']);

    if (!tournament) {
      return res.status(404).json({ msg: 'Tournament not found' });
    }

    // Sort the group table by points and goal difference
    const leaderboard = tournament.groupTable.sort((a, b) => {
      if (b.points === a.points) {
        return b.goalDifference - a.goalDifference;
      }
      return b.points - a.points;
    });

    res.status(200).json(leaderboard);
  } catch (err) {
    console.error('Error fetching leaderboard:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;