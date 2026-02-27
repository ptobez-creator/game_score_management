const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  games: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
    },
  ],
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed'],
    default: 'scheduled',
  },
  matches: [
    {
      player1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      player2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      score1: { type: Number, default: null },
      score2: { type: Number, default: null },
      goalDifference1: { type: Number, default: 0 },
      goalDifference2: { type: Number, default: 0 },
      points1: { type: Number, default: 0 },
      points2: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ['pending', 'submitted', 'completed', 'disputed'],
        default: 'pending',
      },
      // Approval tracking
      scoreSumbittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      scoreSubmittedAt: { type: Date, default: null },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      approvedAt: { type: Date, default: null },
      disputedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      disputeReason: { type: String, default: null },
    },
  ],
  groupTable: [
    {
      player: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      played: { type: Number, default: 0 },
      won: { type: Number, default: 0 },
      lost: { type: Number, default: 0 },
      draw: { type: Number, default: 0 },
      points: { type: Number, default: 0 },
      goalsScored: { type: Number, default: 0 },
      goalsAgainst: { type: Number, default: 0 },
      goalDifference: { type: Number, default: 0 },
    },
  ],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Tournament', TournamentSchema);
