const express = require('express');
const User = require('../models/User');
const ChatMessage = require('../models/ChatMessage');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Middleware to check if admin is authenticated
const requireAdmin = (req, res, next) => {
  if (!req.session.admin) {
    return res.redirect('/admin/login');
  }
  next();
};

// Admin login page
router.get('/login', (req, res) => {
  if (req.session.admin) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { title: 'Admin Login - AdvanceTravels' });
});

// Admin dashboard
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newApplications = await User.countDocuments({ applicationStatus: 'New' });
    const inReview = await User.countDocuments({ applicationStatus: 'In Review' });

    // Get recent applications
    const recentApplications = await User.find()
      .sort({ createdAt: -1 })
      .limit(10);

    const stats = {
      totalUsers,
      activeUsers,
      newApplications,
      inReview
    };

    res.render('admin/dashboard', { 
      title: 'Admin Dashboard - AdvanceTravels',
      admin: req.session.admin,
      stats,
      recentApplications
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Something went wrong loading the admin dashboard.'
    });
  }
});

// Users management
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status && req.query.status !== 'all') {
      filter.applicationStatus = req.query.status;
    }
    if (req.query.country && req.query.country !== 'all') {
      filter.preferredCountry = req.query.country;
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    // Get unique countries for filter
    const countries = await User.distinct('preferredCountry');

    res.render('admin/users', { 
      title: 'User Management - AdvanceTravels',
      admin: req.session.admin,
      users,
      countries,
      currentPage: page,
      totalPages,
      query: req.query
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Something went wrong loading users.'
    });
  }
});

// Update user status
router.post('/users/:id/status', requireAdmin, [
  body('status').isIn(['New', 'In Review', 'Documents Received', 'Interview Scheduled', 'Visa Approved', 'Rejected'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { status } = req.body;
    const notes = req.body.notes || '';

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.applicationStatus = status;
    user.statusHistory.push({
      status,
      notes,
      date: new Date()
    });

    await user.save();

    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// Chat management
router.get('/chat', requireAdmin, async (req, res) => {
  try {
    // Get all users with their latest messages
    const users = await User.find({ isActive: true }).sort({ createdAt: -1 });
    
    const chatsWithMessages = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await ChatMessage.findOne({ sessionId: user.sessionId })
          .sort({ createdAt: -1 });
        
        const unreadCount = await ChatMessage.countDocuments({ 
          sessionId: user.sessionId, 
          senderType: 'user', 
          isRead: false 
        });

        return {
          user,
          lastMessage,
          unreadCount
        };
      })
    );

    res.render('admin/chat', { 
      title: 'Chat Management - AdvanceTravels',
      admin: req.session.admin,
      chats: chatsWithMessages
    });
  } catch (error) {
    console.error('Admin chat error:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Something went wrong loading chat.'
    });
  }
});

// Get messages for a specific user
router.get('/chat/:sessionId', requireAdmin, async (req, res) => {
  try {
    const user = await User.findOne({ sessionId: req.params.sessionId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const messages = await ChatMessage.find({ sessionId: req.params.sessionId })
      .sort({ createdAt: 1 });

    // Mark admin messages as read
    await ChatMessage.updateMany(
      { sessionId: req.params.sessionId, senderType: 'user', isRead: false },
      { isRead: true }
    );

    res.json({ success: true, messages, user });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to load messages' });
  }
});

module.exports = router;