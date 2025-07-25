const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype.startsWith('image/') ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and images are allowed.'));
    }
  }
});

// Home page
router.get('/', (req, res) => {
  res.render('home', { 
    title: 'AdvanceTravels - Land Your Dream Job Abroad',
    user: req.session.user
  });
});

// Initial application submission
router.post('/apply', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Please provide a valid phone number'),
  body('preferredCountry').notEmpty().withMessage('Please select a preferred country')
], upload.single('resume'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { name, email, phone, preferredCountry } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.json({ 
        success: true, 
        message: 'Welcome back! Redirecting to your application...',
        redirect: '/application-form'
      });
    }

    // Create new user
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    user = new User({
      name,
      email,
      phone,
      preferredCountry,
      sessionId
    });

    // Handle resume upload
    if (req.file) {
      user.documents.push({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    }

    await user.save();

    // Store user in session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      sessionId: user.sessionId
    };

    res.json({ 
      success: true, 
      message: 'Application started successfully!',
      redirect: '/application-form'
    });

  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    });
  }
});

// Application form page
router.get('/application-form', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  
  res.render('application-form', { 
    title: 'Complete Your Application - AdvanceTravels',
    user: req.session.user
  });
});

// Complete application submission
router.post('/complete-application', [
  body('experience').notEmpty().withMessage('Please select your experience level'),
  body('education').notEmpty().withMessage('Please select your education level'),
  body('profession').trim().isLength({ min: 2 }).withMessage('Please enter your profession'),
  body('relocationReadiness').notEmpty().withMessage('Please select your relocation readiness')
], upload.array('documents', 5), async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Session expired' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { experience, education, profession, linkedin, relocationReadiness } = req.body;
    
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update user information
    user.experience = experience;
    user.education = education;
    user.profession = profession;
    user.linkedin = linkedin;
    user.relocationReadiness = relocationReadiness;
    user.applicationStatus = 'In Review';

    // Add status history
    user.statusHistory.push({
      status: 'In Review',
      notes: 'Application completed and submitted for review'
    });

    // Handle additional document uploads
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        user.documents.push({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        });
      });
    }

    await user.save();

    res.json({ 
      success: true, 
      message: 'Application completed successfully!',
      redirect: '/dashboard'
    });

  } catch (error) {
    console.error('Complete application error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    });
  }
});

module.exports = router;