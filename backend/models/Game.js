const mongoose = require('mongoose');

// Define the Game Schema
const GameSchema = new mongoose.Schema({
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    scores: [{
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                // Ensure scores array length matches players array length
                return this.players.length === v.length;
            },
            message: 'Scores array must have the same length as players array.',
        },
    }],
    date: {
        type: Date,
        default: Date.now,
    },
});

// Model export
const Game = mongoose.model('Game', GameSchema);
module.exports = Game;