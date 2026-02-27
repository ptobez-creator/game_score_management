const express = require('express');
const Tournament = require('../models/Tournament');
const User = require('../models/User');
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  const { name, participants, startDate, endDate } = req.body;
  try {
    if (!req.user || !req.user.id) return res.status(400).json({ msg: 'User ID missing' });
    const user = await User.findById(req.user.id);
    if (!user || !user.team) return res.status(400).json({ msg: 'Must belong to team' });
    if (!name || !participants || !Array.isArray(participants) || participants.length < 2 || !startDate || !endDate) {
      return res.status(400).json({ msg: 'All fields required' });
    }

    // Validate participants - ensure they are valid MongoDB ObjectIds and exist
    const participantIds = [];
    const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

    for (const participant of participants) {
      if (!isObjectId(participant)) {
        return res.status(400).json({ msg: `Invalid participant ID: ${participant}` });
      }
      participantIds.push(participant);
    }

    // Verify all participants exist in the User collection and belong to the same team
    const foundUsers = await User.find({ _id: { $in: participantIds }, team: user.team }).select('_id');
    if (foundUsers.length !== participantIds.length) {
      return res.status(400).json({ msg: 'Some participants not found or do not belong to your team' });
    }

    const groupTable = participantIds.map(id => ({ 
      player: id, 
      played: 0, 
      won: 0, 
      lost: 0, 
      draw: 0, 
      points: 0, 
      goalsScored: 0, 
      goalsAgainst: 0, 
      goalDifference: 0 
    }));

    const matches = [];
    for (let i = 0; i < participantIds.length; i++) {
      for (let j = i + 1; j < participantIds.length; j++) {
        matches.push({ player1: participantIds[i], player2: participantIds[j], status: 'pending' });
      }
    }

    const newTournament = new Tournament({ 
      name, 
      team: user.team, 
      participants: participantIds, 
      groupTable, 
      matches, 
      startDate, 
      endDate, 
      status: 'scheduled', 
      creator: req.user.id 
    });

    await newTournament.save();
    res.status(201).json(newTournament);
  } catch (err) {
    console.error('Tournament creation error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.team) return res.status(404).json({ msg: 'No team' });
    const tournaments = await Tournament.find({ team: user.team }).select('-__v').sort({ createdAt: -1 }).limit(100);
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/:tournamentId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.team) return res.status(404).json({ msg: 'No team' });
    const tournament = await Tournament.findOne({ _id: req.params.tournamentId, team: user.team }).select('-__v');
    if (!tournament) return res.status(404).json({ msg: 'Not found' });
    res.json(tournament);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
