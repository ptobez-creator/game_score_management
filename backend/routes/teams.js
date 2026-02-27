const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');

router.get('/ping', (req, res) => res.json({ ok: true, msg: 'teams ping' }));
router.get('/me', authMiddleware, (req, res) => res.json({ msg: 'auth ok', user: req.user }));

// Get current user's team
router.get('/my-team', authMiddleware, async (req, res) => {
	try {
		const team = await Team.findOne({ $or: [{ owner: req.user.id }, { members: req.user.id }] })
			.populate('owner', ['name', 'email'])
			.populate('members', ['name', 'email']);
		
		if (!team) {
			return res.status(404).json({ msg: 'No team found' });
		}
		
		return res.status(200).json(team);
	} catch (err) {
		console.error('Error fetching my-team:', err.message);
		return res.status(500).json({ msg: 'Server error' });
	}
});

// Get team members
router.get('/team-members', authMiddleware, async (req, res) => {
	try {
		const team = await Team.findOne({ $or: [{ owner: req.user.id }, { members: req.user.id }] })
			.populate('owner', ['_id'])
			.populate('members', ['_id', 'name', 'email', 'profilePicture', 'createdAt']);
		
		if (!team) {
			return res.status(404).json({ msg: 'No team found' });
		}
		
		// Only show emails to team owner or for user's own profile
		const isOwner = team.owner._id.toString() === req.user.id;
		const members = team.members.map(member => {
			const memberData = {
				_id: member._id,
				name: member.name,
				profilePicture: member.profilePicture,
				createdAt: member.createdAt
			};
			
			// Only include email for owner or for the user's own profile
			if (isOwner || member._id.toString() === req.user.id) {
				memberData.email = member.email;
			}
			
			return memberData;
		});
		
		return res.status(200).json({ members });
	} catch (err) {
		console.error('Error fetching team members:', err.message);
		return res.status(500).json({ msg: 'Server error' });
	}
});

// Create a new team
router.post('/create', authMiddleware, async (req, res) => {
	try {
		const { name, description } = req.body;
		
		if (!name || !name.trim()) {
			return res.status(400).json({ msg: 'Team name is required' });
		}
		
		// Check if user already owns a team
		const existingTeam = await Team.findOne({ owner: req.user.id });
		if (existingTeam) {
			return res.status(400).json({ msg: 'You already own a team' });
		}
		
		const newTeam = new Team({
			name: name.trim(),
			description: description || '',
			owner: req.user.id,
			members: [req.user.id],
		});
		
		await newTeam.save();
		await newTeam.populate('owner', ['name', 'email']);
		await newTeam.populate('members', ['name', 'email']);
		
		return res.status(201).json(newTeam);
	} catch (err) {
		console.error('Error creating team:', err.message);
		return res.status(500).json({ msg: 'Server error' });
	}
});

// Update team
router.put('/update', authMiddleware, async (req, res) => {
	try {
		const { name, description } = req.body;
		
		const team = await Team.findOne({ owner: req.user.id });
		if (!team) {
			return res.status(403).json({ msg: 'Only team owner can update team' });
		}
		
		if (name && name.trim()) {
			team.name = name.trim();
		}
		if (description !== undefined) {
			team.description = description;
		}
		
		team.updatedAt = new Date();
		await team.save();
		await team.populate('owner', ['name', 'email']);
		await team.populate('members', ['name', 'email']);
		
		return res.status(200).json(team);
	} catch (err) {
		console.error('Error updating team:', err.message);
		return res.status(500).json({ msg: 'Server error' });
	}
});

// Search available members to add
router.get('/search-available-members', authMiddleware, async (req, res) => {
	try {
		const { query } = req.query;
		
		if (!query || query.trim().length === 0) {
			return res.status(400).json({ msg: 'Search query is required' });
		}
		
		// Find users (excluding current user and already in team)
		const team = await Team.findOne({ $or: [{ owner: req.user.id }, { members: req.user.id }] });
		
		const currentMembers = team ? team.members.map(m => m.toString()) : [];
		
		const users = await User.find({
			name: { $regex: query, $options: 'i' },
			_id: { $ne: req.user.id, $nin: currentMembers }
		}).select('_id name email').limit(10);
		
		return res.status(200).json(users);
	} catch (err) {
		console.error('Error searching members:', err.message);
		return res.status(500).json({ msg: 'Server error' });
	}
});

// Add member to team
router.post('/add-member', authMiddleware, async (req, res) => {
	try {
		const { memberId } = req.body;
		
		if (!memberId) {
			return res.status(400).json({ msg: 'Member ID is required' });
		}
		
		const team = await Team.findOne({ owner: req.user.id });
		if (!team) {
			return res.status(403).json({ msg: 'Only team owner can add members' });
		}
		
		// Check if member already in team
		if (team.members.includes(memberId)) {
			return res.status(400).json({ msg: 'Member already in team' });
		}
		
		// Check if member exists
		const member = await User.findById(memberId);
		if (!member) {
			return res.status(404).json({ msg: 'User not found' });
		}
		
		team.members.push(memberId);
		await team.save();
		await team.populate('members', ['_id', 'name', 'email']);
		
		return res.status(200).json({ msg: 'Member added successfully', members: team.members });
	} catch (err) {
		console.error('Error adding member:', err.message);
		return res.status(500).json({ msg: 'Server error' });
	}
});

// Remove member from team
router.post('/remove-member', authMiddleware, async (req, res) => {
	try {
		const { memberId } = req.body;
		
		if (!memberId) {
			return res.status(400).json({ msg: 'Member ID is required' });
		}
		
		const team = await Team.findOne({ owner: req.user.id });
		if (!team) {
			return res.status(403).json({ msg: 'Only team owner can remove members' });
		}
		
		// Don't allow removing the owner
		if (team.owner.toString() === memberId) {
			return res.status(400).json({ msg: 'Cannot remove team owner' });
		}
		
		team.members = team.members.filter(m => m.toString() !== memberId);
		await team.save();
		await team.populate('members', ['_id', 'name', 'email']);
		
		return res.status(200).json({ msg: 'Member removed successfully', members: team.members });
	} catch (err) {
		console.error('Error removing member:', err.message);
		return res.status(500).json({ msg: 'Server error' });
	}
});

// Delete team
router.delete('/delete', authMiddleware, async (req, res) => {
	try {
		const team = await Team.findOne({ owner: req.user.id });
		if (!team) {
			return res.status(403).json({ msg: 'Only team owner can delete team' });
		}
		
		await Team.findByIdAndDelete(team._id);
		
		return res.status(200).json({ msg: 'Team deleted successfully' });
	} catch (err) {
		console.error('Error deleting team:', err.message);
		return res.status(500).json({ msg: 'Server error' });
	}
});

// Join team by name
router.post('/join-by-name', authMiddleware, async (req, res) => {
	try {
		const { teamName } = req.body;
		
		if (!teamName || !teamName.trim()) {
			return res.status(400).json({ msg: 'Team name is required' });
		}
		
		// Check if user already in a team
		const existingTeam = await Team.findOne({ members: req.user.id });
		if (existingTeam) {
			return res.status(400).json({ msg: 'You are already in a team' });
		}
		
		const team = await Team.findOne({ name: new RegExp(teamName, 'i') });
		if (!team) {
			return res.status(404).json({ msg: 'Team not found' });
		}
		
		team.members.push(req.user.id);
		await team.save();
		await team.populate('owner', ['name', 'email']);
		await team.populate('members', ['name', 'email']);
		
		return res.status(200).json({ msg: 'Successfully joined team', team });
	} catch (err) {
		console.error('Error joining team:', err.message);
		return res.status(500).json({ msg: 'Server error' });
	}
});

// Join team by invite code
router.post('/join-by-code', authMiddleware, async (req, res) => {
	try {
		const { code } = req.body;
		
		if (!code || !code.trim()) {
			return res.status(400).json({ msg: 'Invite code is required' });
		}
		
		// Check if user already in a team
		const existingTeam = await Team.findOne({ members: req.user.id });
		if (existingTeam) {
			return res.status(400).json({ msg: 'You are already in a team' });
		}
		
		const team = await Team.findOne({ inviteCode: code });
		if (!team) {
			return res.status(404).json({ msg: 'Invalid or expired invite code' });
		}
		
		team.members.push(req.user.id);
		await team.save();
		await team.populate('owner', ['name', 'email']);
		await team.populate('members', ['name', 'email']);
		
		return res.status(200).json({ msg: 'Successfully joined team', team });
	} catch (err) {
		console.error('Error joining team:', err.message);
		return res.status(500).json({ msg: 'Server error' });
	}
});

module.exports = router;
