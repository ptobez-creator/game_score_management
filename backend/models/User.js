const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'], // Added better validation
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'], // Email format validation
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null,
  },
  profilePicture: {
    type: String,
    default: '',
  },
}, { timestamps: true }); // Added timestamps for createdAt and updatedAt

const User = mongoose.model('User', userSchema);
module.exports = User;