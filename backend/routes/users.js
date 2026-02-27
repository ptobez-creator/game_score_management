const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware'); // Ensure your authMiddleware is working properly
const router = express.Router();

// Fetch current user's profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Check if the user object exists in the request (this should be set by authMiddleware)
    if (!req.user || !req.user.id) {
      return res.status(400).json({ msg: 'User ID is required' });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update current user's profile
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, profilePicture } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(400).json({ msg: 'User ID is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update fields
    if (name && name.trim()) {
      user.name = name.trim();
    }
    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }

    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Fetch user IDs by names or validate existing IDs
router.post('/get-ids', async (req, res) => {
  const { names } = req.body;

  if (!names || !Array.isArray(names) || names.length === 0) {
    return res.status(400).json({ msg: 'A valid array of names or IDs is required' });
  }

  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/;
    
    let filter;
    if (names.every(name => isObjectId.test(name))) {
      filter = { _id: { $in: names } };
    } else {
      // Use case-insensitive regex for name matching
      filter = {
        name: {
          $in: names.map(name => new RegExp(`^${name}$`, 'i'))
        }
      };
    }

    const users = await User.find(filter).select('_id name');

    const userIds = users.map(user => user._id.toString());
    const foundNames = users.map(user => user.name);
    const missingInputs = names.filter(
      input => !foundNames.some(name => name.toLowerCase() === input.toLowerCase())
    );

    // Return user objects with id and name, not just IDs
    res.json({ 
      ids: users.map(user => ({ id: user._id.toString(), name: user.name })), 
      missing: missingInputs 
    });
  } catch (error) {
    console.error('Error fetching user IDs:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Search users by name (autocomplete functionality)
router.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim().length === 0) {
    return res.status(400).json({ msg: 'Search query is required' });
  }

  try {
    const users = await User.find({ name: { $regex: query, $options: 'i' } }).limit(10);
    const names = users.map(user => user.name);

    res.json(names);
  } catch (error) {
    console.error('Error searching for users:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Validate participant IDs
router.post('/validate-ids', async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ msg: 'A valid array of user IDs is required' });
  }

  try {
    const users = await User.find({ _id: { $in: ids } }).select('_id name');

    const validIds = users.map(user => user._id.toString());
    const invalidIds = ids.filter(id => !validIds.includes(id));

    res.json({ valid: validIds, invalid: invalidIds });
  } catch (error) {
    console.error('Error validating user IDs:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Fetch all registered players
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    if (!users || users.length === 0) {
      return res.json([]);
    }

    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Fetch a specific user by ID
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;