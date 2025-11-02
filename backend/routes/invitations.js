import express from 'express';
import twilio from 'twilio';
import auth from '../middleware/auth.js';
import Invitation from '../models/Invitation.js';
import Group from '../models/Group.js';

const router = express.Router();

// 🔍 DEBUG: Check environment variables
console.log('========================================');
console.log('🔍 Twilio Environment Variables Debug:');
console.log('========================================');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Loaded' : '❌ MISSING');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Loaded' : '❌ MISSING');
console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER ? '✅ Loaded' : '❌ MISSING');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || process.env.REACT_APP_FRONTEND_URL || '❌ MISSING');
console.log('========================================\n');

// Initialize Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// POST /api/invitations/send - Send invitations
router.post('/send', auth, async (req, res) => {
  try {
    const { groupId, members, method } = req.body;
    const userId = req.user.id;

    // Get group details
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is admin
    if (group.admin.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Only group admin can send invitations'
      });
    }

    // Save invitations to database and send via Twilio
    const results = [];
    
    for (const member of members) {
      try {
        // Create invitation in database
        const invitation = new Invitation({
          group: groupId,
          phone: member.phone,
          name: member.name,
          method: method,
          invitedBy: userId,
          status: 'pending'
        });

        await invitation.save();

        // Generate invite link - use FRONTEND_URL from env
        const frontendUrl = process.env.FRONTEND_URL || process.env.REACT_APP_FRONTEND_URL || 'http://localhost:5173';
        const inviteLink = `${frontendUrl}/invite/${invitation._id}`;
        
        // Prepare message
        const message = `Hello${member.name ? ` ${member.name}` : ''}! You've been invited by ${req.user.name} to join the savings group "${group.name}". Click here to join: ${inviteLink}`;

        let sendResult;
        if (method === 'sms') {
          sendResult = await sendSMS(member.phone, message);
        } else if (method === 'whatsapp') {
          sendResult = await sendWhatsApp(member.phone, message);
        } else {
          // For link method, just return the link
          sendResult = { success: true, link: inviteLink };
        }

        // Update invitation with send result
        invitation.sentAt = new Date();
        if (sendResult.success) {
          invitation.messageId = sendResult.messageId;
          invitation.status = 'sent';
        } else {
          invitation.status = 'failed';
          invitation.error = sendResult.error;
        }
        await invitation.save();

        results.push({
          member: member.phone,
          name: member.name,
          success: sendResult.success,
          messageId: sendResult.messageId,
          link: inviteLink,
          error: sendResult.error
        });

      } catch (memberError) {
        console.error(`Error processing member ${member.phone}:`, memberError);
        results.push({
          member: member.phone,
          name: member.name,
          success: false,
          error: memberError.message
        });
      }
    }

    res.json({
      success: true,
      message: `Invitations processed via ${method}`,
      results: results,
      group: {
        _id: group._id,
        name: group.name
      }
    });

  } catch (error) {
    console.error('Error sending invitations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send invitations'
    });
  }
});

// GET /api/invitations/group/:groupId - Get pending invitations for a group
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Verify user has access to this group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is group admin or member
    const isAdmin = group.admin.toString() === userId;
    const isMember = group.members.some(member => member.user.toString() === userId);
    
    if (!isAdmin && !isMember) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get pending invitations (only admin sees all)
    const query = { group: groupId, status: 'pending' };
    if (!isAdmin) {
      // Regular members only see their own invitations
      query.invitedBy = userId;
    }

    const invitations = await Invitation.find(query)
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: invitations
    });

  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invitations'
    });
  }
});

// POST /api/invitations/:invitationId/accept - Accept invitation
router.post('/:invitationId/accept', auth, async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.id;

    // Find invitation
    const invitation = await Invitation.findById(invitationId)
      .populate('group');
    
    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found'
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Invitation already used or expired'
      });
    }

    // Check if user is already a member of the group
    const group = await Group.findById(invitation.group._id);
    const isAlreadyMember = group.members.some(member => 
      member.user.toString() === userId
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        error: 'You are already a member of this group'
      });
    }

    // Add user to group
    group.members.push({
      user: userId,
      joinedAt: new Date(),
      role: 'member'
    });

    await group.save();

    // Update invitation status
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    invitation.acceptedBy = userId;
    await invitation.save();

    res.json({
      success: true,
      message: 'Successfully joined the group',
      data: {
        group: {
          _id: group._id,
          name: group.name
        },
        invitation: {
          _id: invitation._id,
          status: invitation.status
        }
      }
    });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept invitation'
    });
  }
});

// DELETE /api/invitations/:invitationId - Cancel invitation
router.delete('/:invitationId', auth, async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.id;

    const invitation = await Invitation.findById(invitationId)
      .populate('group');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found'
      });
    }

    // Check if user is group admin
    if (invitation.group.admin.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Only group admin can cancel invitations'
      });
    }

    await Invitation.findByIdAndDelete(invitationId);

    res.json({
      success: true,
      message: 'Invitation cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling invitation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel invitation'
    });
  }
});

// Helper function to send SMS
async function sendSMS(to, message) {
  try {
    const response = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formatPhoneNumber(to)
    });

    return {
      success: true,
      messageId: response.sid,
      status: response.status
    };
  } catch (error) {
    console.error('Twilio SMS error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Helper function to send WhatsApp
async function sendWhatsApp(to, message) {
  try {
    const from = `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`;
    const toWhatsApp = `whatsapp:${formatPhoneNumber(to)}`;

    const response = await twilioClient.messages.create({
      body: message,
      from: from,
      to: toWhatsApp
    });

    return {
      success: true,
      messageId: response.sid,
      status: response.status
    };
  } catch (error) {
    console.error('Twilio WhatsApp error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Phone number formatting
function formatPhoneNumber(phone) {
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = '256' + cleaned.substring(1);
  }
  
  if (!cleaned.startsWith('+') && !cleaned.startsWith('256')) {
    cleaned = '256' + cleaned;
  }
  
  return '+' + cleaned;
}

export default router;