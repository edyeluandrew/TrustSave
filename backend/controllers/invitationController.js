const Invitation = require('../models/Invitation');
const JoinRequest = require('../models/JoinRequest');
const Group = require('../models/Group');
const User = require('../models/User');
const { sendSMS, sendWhatsApp } = require('../utils/smsService');

// @desc    Create invitations for multiple members
// @route   POST /api/groups/:groupId/invite
// @access  Private (Admin only)
const createInvitations = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { members, method = 'sms' } = req.body;
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
        message: 'Not authorized to invite members to this group'
      });
    }

    // Validate members array
    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one member to invite'
      });
    }

    const invitations = [];
    const errors = [];

    // Create invitations for each member
    for (const member of members) {
      try {
        // Validate member data
        if (!member.name || !member.phone) {
          errors.push(`Missing name or phone for member: ${JSON.stringify(member)}`);
          continue;
        }

        // Check if user is already a member
        const isAlreadyMember = group.members.some(m => 
          m.user && m.user.toString() === member.phone
        );

        if (isAlreadyMember) {
          errors.push(`${member.name} (${member.phone}) is already a member`);
          continue;
        }

        // Generate unique invitation code
        let invitationCode;
        let isUnique = false;
        
        while (!isUnique) {
          invitationCode = Invitation.generateInvitationCode();
          const existingInvitation = await Invitation.findOne({ invitationCode });
          if (!existingInvitation) isUnique = true;
        }

        // Set expiry to 7 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Create invitation
        const invitation = new Invitation({
          groupId,
          invitedPhone: member.phone,
          invitedName: member.name,
          invitedBy: adminId,
          invitationCode,
          method,
          expiresAt
        });

        await invitation.save();
        invitations.push(invitation);

        // Send SMS/WhatsApp (simulated for now)
        try {
          await sendInvitationMessage(invitation, group, req.user, method);
        } catch (messageError) {
          console.error('Failed to send message:', messageError);
          errors.push(`Failed to send ${method} to ${member.phone}`);
        }

      } catch (error) {
        errors.push(`Failed to create invitation for ${member.name}: ${error.message}`);
      }
    }

    res.status(201).json({
      success: true,
      data: {
        sent: invitations.length,
        failed: errors.length,
        invitations: invitations.map(inv => ({
          id: inv._id,
          name: inv.invitedName,
          phone: inv.invitedPhone,
          code: inv.invitationCode,
          expiresAt: inv.expiresAt
        })),
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Create invitations error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get invitation details
// @route   GET /api/invitations/:code
// @access  Public
const getInvitation = async (req, res) => {
  try {
    const { code } = req.params;

    const invitation = await Invitation.findById(code)
      .populate('groupId', 'name description purpose')
      .populate('invitedBy', 'name phone');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    // Check if invitation is valid
    if (!invitation.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'This invitation has expired or is no longer valid'
      });
    }

    res.status(200).json({
      success: true,
      data: invitation
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Accept invitation
// @route   POST /api/invitations/:code/accept
// @access  Private
const acceptInvitation = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.user.id;

    const invitation = await Invitation.findOne({ invitationCode: code })
      .populate('groupId');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    // Check if invitation is valid
    if (!invitation.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'This invitation has expired or is no longer valid'
      });
    }

    // Check if user is already a member
    const group = await Group.findById(invitation.groupId);
    const isAlreadyMember = group.members.some(member => 
      member.user.toString() === userId
    );

    if (isAlreadyMember) {
      // Update invitation status
      invitation.status = 'accepted';
      await invitation.save();

      return res.status(200).json({
        success: true,
        message: 'You are already a member of this group',
        data: { groupId: group._id, status: 'already_member' }
      });
    }

    // Check if there's already a pending request
    const existingRequest = await JoinRequest.findOne({
      groupId: invitation.groupId._id,
      userId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(200).json({
        success: true,
        message: 'Your join request is already pending approval',
        data: { groupId: group._id, status: 'pending_approval' }
      });
    }

    // Create join request
    const joinRequest = new JoinRequest({
      groupId: invitation.groupId._id,
      userId,
      invitationId: invitation._id
    });

    await joinRequest.save();

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    res.status(201).json({
      success: true,
      message: 'Join request submitted successfully. Waiting for admin approval.',
      data: { 
        groupId: group._id, 
        groupName: group.name,
        status: 'pending_approval',
        requestId: joinRequest._id 
      }
    });

  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to send invitation messages
const sendInvitationMessage = async (invitation, group, admin, method) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const message = `
Hi ${invitation.invitedName}! You've been invited by ${admin.name} to join the TrustSave group "${group.name}".

Click to view invitation: ${baseUrl}/invite/${invitation.invitationCode}

Or download app: ${baseUrl}/download

(Invitation expires in 7 days)
  `.trim();

  // For MVP, we'll just log the message. Integrate with actual SMS/WhatsApp service later.
  console.log(`Sending ${method.toUpperCase()} to ${invitation.invitedPhone}:`);
  console.log(message);
  console.log('---');

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // In production, you would use:
  // if (method === 'sms') {
  //   await sendSMS(invitation.invitedPhone, message);
  // } else if (method === 'whatsapp') {
  //   await sendWhatsApp(invitation.invitedPhone, message);
  // }

  return { success: true, message: 'Message sent successfully' };
};

module.exports = {
  createInvitations,
  getInvitation,
  acceptInvitation
};