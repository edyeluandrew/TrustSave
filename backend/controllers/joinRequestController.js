import JoinRequest from '../models/JoinRequest.js';
import Group from '../models/Group.js';
import User from '../models/User.js';

// @desc    Get pending join requests for a group
// @route   GET /api/groups/:groupId/join-requests
// @access  Private (Admin only)
export const getJoinRequests = async (req, res) => {
  try {
    const { groupId } = req.params;
    const adminId = req.user.id;

    // Check if group exists and user is admin
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.admin.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view join requests for this group'
      });
    }

    const joinRequests = await JoinRequest.find({ 
      groupId, 
      status: 'pending' 
    })
    .populate('userId', 'name phone email')
    .populate('invitationId', 'invitedName invitedPhone method')
    .sort({ requestedAt: -1 });

    res.status(200).json({
      success: true,
      count: joinRequests.length,
      data: joinRequests
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve a join request
// @route   POST /api/join-requests/:requestId/approve
// @access  Private (Admin only)
export const approveJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const adminId = req.user.id;

    const joinRequest = await JoinRequest.findById(requestId)
      .populate('groupId')
      .populate('userId');

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found'
      });
    }

    // Check if user is group admin
    const group = await Group.findById(joinRequest.groupId._id);
    if (group.admin.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve requests for this group'
      });
    }

    // Check if request is still pending
    if (joinRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed'
      });
    }

    // Check if user is already a member
    const isAlreadyMember = group.members.some(member => 
      member.user.toString() === joinRequest.userId._id.toString()
    );

    if (isAlreadyMember) {
      // Update request status
      joinRequest.status = 'approved';
      joinRequest.processedAt = new Date();
      joinRequest.processedBy = adminId;
      joinRequest.adminNotes = 'User was already a member';
      await joinRequest.save();

      return res.status(200).json({
        success: true,
        message: 'User is already a member of this group',
        data: joinRequest
      });
    }

    // Add user to group members
    group.members.push({
      user: joinRequest.userId._id,
      role: 'member'
    });

    await group.save();

    // Update request status
    joinRequest.status = 'approved';
    joinRequest.processedAt = new Date();
    joinRequest.processedBy = adminId;
    await joinRequest.save();

    res.status(200).json({
      success: true,
      message: 'User successfully added to the group',
      data: joinRequest
    });

  } catch (error) {
    console.error('Approve join request error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject a join request
// @route   POST /api/join-requests/:requestId/reject
// @access  Private (Admin only)
export const rejectJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    const joinRequest = await JoinRequest.findById(requestId)
      .populate('groupId');

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found'
      });
    }

    // Check if user is group admin
    const group = await Group.findById(joinRequest.groupId._id);
    if (group.admin.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject requests for this group'
      });
    }

    // Check if request is still pending
    if (joinRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed'
      });
    }

    // Update request status
    joinRequest.status = 'rejected';
    joinRequest.processedAt = new Date();
    joinRequest.processedBy = adminId;
    joinRequest.adminNotes = notes || 'Request rejected by admin';
    await joinRequest.save();

    res.status(200).json({
      success: true,
      message: 'Join request rejected successfully',
      data: joinRequest
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};