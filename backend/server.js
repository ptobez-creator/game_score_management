require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const tournamentRoutes = require('./routes/tournaments');
const gameRoutes = require('./routes/games');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const leaderboardRoutes = require('./routes/leaderboard');
const usersRoutes = require('./routes/users');
const gameScoreApprovalRoutes = require('./routes/gamescoreapproval');
const teamsRoutes = require('./routes/teams');
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Allow multiple frontend origins (local + production)
const frontendOriginsFromEnv = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || '').split(',').map((origin) => origin.trim()),
].filter(Boolean);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://54.246.162.122',
  ...frontendOriginsFromEnv,
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/tournaments', tournamentRoutes);
app.use('/games', authMiddleware, gameRoutes); // Protected route
app.use('/games/score', authMiddleware, gameScoreApprovalRoutes); // Protected route for score approval
app.use('/users', authMiddleware, usersRoutes); // Protected route
app.use('/teams', authMiddleware, teamsRoutes); // Protected route for team management
app.use('/leaderboard', leaderboardRoutes);

// Socket.IO events
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('update-score', (data) => {
    console.log('Score updated:', data);
    io.emit('score-updated', {
      opponent: data.player2,
      message: `${data.player1} has updated the score. Please review the score.`,
    });
  });

  socket.on('score-approved', (data) => {
    console.log(`Player ${data.player} has approved the score.`);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Submit score endpoint (Player 1 submits score)
app.post('/submit-score', authMiddleware, async (req, res) => {
  const { tournamentId, matchId, player1Id, player2Id, score1, score2 } = req.body;
  const userId = req.user.id;

  if (!tournamentId || !matchId || score1 === undefined || score2 === undefined) {
    return res.status(400).json({ msg: 'All fields required' });
  }

  try {
    const Tournament = require('./models/Tournament');
    const tournament = await Tournament.findById(tournamentId).populate('matches.player1').populate('matches.player2');
    
    if (!tournament) {
      return res.status(404).json({ msg: 'Tournament not found' });
    }

    const match = tournament.matches.find(m => m._id.toString() === matchId);
    if (!match) {
      return res.status(404).json({ msg: 'Match not found' });
    }

    // Set scores and mark as submitted
    match.score1 = score1;
    match.score2 = score2;
    match.status = 'submitted';
    match.scoreSumbittedBy = userId;
    match.scoreSubmittedAt = new Date();
    match.approvedBy = null;
    match.approvedAt = null;

    await tournament.save();

    // Get opponent (player who didn't submit)
    const opponentId = userId.toString() !== player1Id.toString() ? player1Id : player2Id;

    io.emit('score-submitted', {
      tournamentId: tournamentId,
      matchId: matchId,
      score1: score1,
      score2: score2,
      submittedBy: userId,
      opponentId: opponentId,
      playerNames: `${match.player1.name} vs ${match.player2.name}`,
      message: `Score ${score1}-${score2} submitted. Awaiting opponent approval.`,
    });

    res.status(200).json({ 
      message: 'Score submitted. Awaiting opponent approval.',
      match: match
    });
  } catch (err) {
    console.error('Error submitting score:', err);
    res.status(500).json({ msg: 'Error submitting score' });
  }
});

// Approve score endpoint (Player 2 approves)
app.post('/approve-score', authMiddleware, async (req, res) => {
  const { tournamentId, matchId } = req.body;
  const userId = req.user.id;

  if (!tournamentId || !matchId) {
    return res.status(400).json({ msg: 'Tournament ID and Match ID required' });
  }

  try {
    const Tournament = require('./models/Tournament');
    const tournament = await Tournament.findById(tournamentId);
    
    if (!tournament) {
      return res.status(404).json({ msg: 'Tournament not found' });
    }

    const match = tournament.matches.find(m => m._id.toString() === matchId);
    if (!match) {
      return res.status(404).json({ msg: 'Match not found' });
    }

    const { score1, score2 } = match;

    // Mark as approved
    match.status = 'completed';
    match.approvedBy = userId;
    match.approvedAt = new Date();

    // Calculate points based on scores
    let player1Points = 0;
    let player2Points = 0;

    if (score1 > score2) {
      player1Points = 3;
    } else if (score2 > score1) {
      player2Points = 3;
    } else {
      player1Points = 1;
      player2Points = 1;
    }

    // Update groupTable for player1
    let player1Entry = tournament.groupTable.find(e => e.player.toString() === match.player1.toString());
    if (player1Entry) {
      player1Entry.played += 1;
      player1Entry.points += player1Points;
      player1Entry.goalsScored += score1;
      player1Entry.goalsAgainst += score2;
      player1Entry.goalDifference = player1Entry.goalsScored - player1Entry.goalsAgainst;
      if (score1 > score2) player1Entry.won += 1;
      else if (score1 < score2) player1Entry.lost += 1;
      else player1Entry.draw += 1;
    }

    // Update groupTable for player2
    let player2Entry = tournament.groupTable.find(e => e.player.toString() === match.player2.toString());
    if (player2Entry) {
      player2Entry.played += 1;
      player2Entry.points += player2Points;
      player2Entry.goalsScored += score2;
      player2Entry.goalsAgainst += score1;
      player2Entry.goalDifference = player2Entry.goalsScored - player2Entry.goalsAgainst;
      if (score2 > score1) player2Entry.won += 1;
      else if (score2 < score1) player2Entry.lost += 1;
      else player2Entry.draw += 1;
    }

    await tournament.save();

    io.emit('score-approved', {
      tournamentId: tournamentId,
      matchId: matchId,
      score1: score1,
      score2: score2,
      approvedBy: userId,
      message: `Score ${score1}-${score2} approved and finalized!`,
    });

    res.status(200).json({ 
      message: 'Score approved and finalized!',
      match: match
    });
  } catch (err) {
    console.error('Error approving score:', err);
    res.status(500).json({ msg: 'Error approving score' });
  }
});

// Dispute score endpoint (Player 2 disputes)
app.post('/dispute-score', authMiddleware, async (req, res) => {
  const { tournamentId, matchId, reason } = req.body;
  const userId = req.user.id;

  if (!tournamentId || !matchId || !reason) {
    return res.status(400).json({ msg: 'Tournament ID, Match ID, and reason required' });
  }

  try {
    const Tournament = require('./models/Tournament');
    const tournament = await Tournament.findById(tournamentId);
    
    if (!tournament) {
      return res.status(404).json({ msg: 'Tournament not found' });
    }

    const match = tournament.matches.find(m => m._id.toString() === matchId);
    if (!match) {
      return res.status(404).json({ msg: 'Match not found' });
    }

    // Reset scores and status
    match.status = 'pending';
    match.score1 = null;
    match.score2 = null;
    match.scoreSumbittedBy = null;
    match.scoreSubmittedAt = null;
    match.approvedBy = null;
    match.approvedAt = null;
    match.disputedBy = userId;
    match.disputeReason = reason;

    await tournament.save();

    io.emit('score-disputed', {
      tournamentId: tournamentId,
      matchId: matchId,
      disputedBy: userId,
      reason: reason,
      message: `Score disputed: ${reason}. Please re-enter the correct score.`,
    });

    res.status(200).json({ 
      message: 'Score disputed. Please re-enter the correct score.',
      match: match
    });
  } catch (err) {
    console.error('Error disputing score:', err);
    res.status(500).json({ msg: 'Error disputing score' });
  }
});

// Start the server
server.on('error', (error) => {
  if (error && error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the running process or change PORT in your .env file.`);
    process.exit(1);
    return;
  }

  console.error('Server failed to start:', error);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
