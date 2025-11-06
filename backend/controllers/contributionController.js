import Contribution from '../models/Contribution.js';
import Group from '../models/Group.js';

// Initialize contribution
export const initiateContribution = async (req, res) => {
  try {
    const { groupId, amount, mobileMoneyProvider, phoneNumber } = req.body;
    const userId = req.user.id;

    console.log('Contribution request:', { groupId, userId, amount }); // Debug log

    // Validate group exists and user is a member
    const group = await Group.findById(groupId).populate('members.user');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // FIXED: Check if user is a member - handle both ObjectId and string comparisons
    const isMember = group.members.some(member => 
      member.user._id.toString() === userId.toString() || 
      member.user._id.toString() === userId
    );

    console.log('User membership check:', { 
      userId, 
      groupMembers: group.members.map(m => m.user._id.toString()),
      isMember 
    }); // Debug log

    if (!isMember) {
      return res.status(403).json({ 
        message: 'You are not a member of this group',
        details: {
          userId,
          groupMembers: group.members.map(m => m.user._id.toString())
        }
      });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    // Create contribution record
    const contribution = new Contribution({
      groupId,
      userId,
      amount,
      mobileMoneyProvider,
      phoneNumber,
      transactionId: `TS${Date.now()}${Math.random().toString(36).substr(2, 9)}`
    });

    await contribution.save();

    res.status(201).json({
      message: 'Contribution initiated successfully',
      contribution: {
        id: contribution._id,
        amount: contribution.amount,
        provider: contribution.mobileMoneyProvider,
        phoneNumber: contribution.phoneNumber,
        transactionId: contribution.transactionId,
        status: contribution.status
      }
    });

  } catch (error) {
    console.error('Contribution initiation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get contributions for a group
export const getGroupContributions = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Verify user is group member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(member => 
      member.user.toString() === userId.toString() || 
      member.user.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const contributions = await Contribution.find({ groupId })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(contributions);
  } catch (error) {
    console.error('Get contributions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's contributions
export const getUserContributions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const contributions = await Contribution.find({ userId })
      .populate('groupId', 'name description')
      .sort({ createdAt: -1 });

    res.json(contributions);
  } catch (error) {
    console.error('Get user contributions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};