import express from 'express';
import { initiateContribution, getGroupContributions, getUserContributions } from '../controllers/contributionController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/contributions
// @desc    Initiate a contribution
// @access  Private
router.post('/', auth, initiateContribution);

// @route   GET /api/contributions/group/:groupId
// @desc    Get all contributions for a group
// @access  Private
router.get('/group/:groupId', auth, getGroupContributions);

// @route   GET /api/contributions/user
// @desc    Get user's contributions
// @access  Private
router.get('/user', auth, getUserContributions);

export default router;