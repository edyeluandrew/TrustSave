import Group from '../models/Group.js';

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
export const createGroup = async (req, res) => {
  try {
    const { name, description, purpose, meetingSchedule } = req.body;

    // Create group with admin as current user
    const group = await Group.create({
      name,
      description,
      purpose,
      meetingSchedule,
      admin: req.user.id,
      minContribution: 10000, // Fixed for now
      contributionMultiple: 10000 // Fixed for now
    });

    // Populate admin details
    await group.populate('admin', 'name phone email');

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all groups for user
// @route   GET /api/groups
// @access  Private
export const getGroups = async (req, res) => {
  try {
    // Get groups where user is admin or member
    const groups = await Group.find({
      $or: [
        { admin: req.user.id },
        { 'members.user': req.user.id }
      ]
    })
    .populate('admin', 'name phone')
    .populate('members.user', 'name phone')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single group
// @route   GET /api/groups/:id
// @access  Private
export const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('admin', 'name phone email')
      .populate('members.user', 'name phone email');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is member or admin of group
    const isMember = group.admin._id.toString() === req.user.id || 
                     group.members.some(member => member.user._id.toString() === req.user.id);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this group'
      });
    }

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private (Admin only)
export const updateGroup = async (req, res) => {
  try {
    let group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is group admin
    if (group.admin.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this group'
      });
    }

    group = await Group.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('admin', 'name phone').populate('members.user', 'name phone');

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private (Admin only)
export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is group admin
    if (group.admin.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this group'
      });
    }

    await Group.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add member to group
// @route   POST /api/groups/:id/members
// @access  Private (Admin only)
export const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is group admin
    if (group.admin.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add members to this group'
      });
    }

    const memberAdded = group.addMember(userId);
    
    if (!memberAdded) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this group'
      });
    }

    await group.save();
    await group.populate('members.user', 'name phone email');

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove member from group
// @route   DELETE /api/groups/:id/members
// @access  Private (Admin only)
export const removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is group admin
    if (group.admin.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove members from this group'
      });
    }

    // Cannot remove admin
    if (userId === group.admin.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove group admin'
      });
    }

    group.members = group.members.filter(
      member => member.user.toString() !== userId
    );

    await group.save();
    await group.populate('members.user', 'name phone email');

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};