import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    // Build query conditions dynamically
    const conditions = [{ phone }];
    
    // Only check email if it's provided and not empty
    if (email && email.trim() !== '') {
      conditions.push({ email: email.trim().toLowerCase() });
    }

    // Check if user exists
    const userExists = await User.findOne({ 
      $or: conditions
    });
    
    if (userExists) {
      // More specific error message
      if (userExists.phone === phone) {
        return res.status(400).json({ 
          message: 'User already exists with this phone number' 
        });
      } else {
        return res.status(400).json({ 
          message: 'User already exists with this email' 
        });
      }
    }

    // Create user - handle empty email
    const userData = {
      name,
      phone,
      password,
    };

    // Only add email if it's provided
    if (email && email.trim() !== '') {
      userData.email = email.trim().toLowerCase();
    }

    const user = await User.create(userData);

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `User already exists with this ${field}` 
      });
    }
    
    res.status(400).json({ 
      message: error.message 
    });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Check for user
    const user = await User.findOne({ phone });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ 
        message: 'Invalid phone or password' 
      });
    }
  } catch (error) {
    res.status(400).json({ 
      message: error.message 
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ 
      message: error.message 
    });
  }
};