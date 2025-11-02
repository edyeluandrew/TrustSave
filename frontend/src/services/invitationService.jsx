import api from './api';
import notificationService from './notificationService';

class InvitationService {
  /**
   * Send invitations via SMS, WhatsApp, or Link
   * Matches backend route: POST /api/invitations/send
   */
  async sendInvitations(groupId, members, method = 'sms') {
    try {
      const response = await api.post('/invitations/send', {
        groupId,
        members,
        method
      });

      if (response.data.success) {
        notificationService.success(`Invitations sent via ${method}!`);
        return {
          success: true,
          data: response.data
        };
      }

      return response.data;

    } catch (error) {
      console.error('Error sending invitations:', error);
      const errorMessage = error.response?.data?.error || 'Failed to send invitations';
      notificationService.error(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Create invitations (alias for sendInvitations for backward compatibility)
   */
  async createInvitations(groupId, members, method = 'sms') {
    return this.sendInvitations(groupId, members, method);
  }

  /**
   * Accept an invitation
   * Matches backend route: POST /api/invitations/:invitationId/accept
   */
  async acceptInvitation(invitationId) {
    try {
      const response = await api.post(`/invitations/${invitationId}/accept`);
      
      if (response.data.success) {
        notificationService.success(response.data.message || 'Successfully joined the group!');
      }
      
      return response.data;

    } catch (error) {
      console.error('Error accepting invitation:', error);
      const errorMessage = error.response?.data?.error || 'Failed to accept invitation';
      notificationService.error(errorMessage);
      throw error;
    }
  }

  /**
   * Get pending invitations for a group
   * Matches backend route: GET /api/invitations/group/:groupId
   */
  async getGroupInvitations(groupId) {
    try {
      const response = await api.get(`/invitations/group/${groupId}`);
      return response.data;

    } catch (error) {
      console.error('Error fetching invitations:', error);
      const errorMessage = error.response?.data?.error || 'Failed to fetch invitations';
      notificationService.error(errorMessage);
      throw error;
    }
  }

  /**
   * Cancel/delete an invitation
   * Matches backend route: DELETE /api/invitations/:invitationId
   */
  async cancelInvitation(invitationId) {
    try {
      const response = await api.delete(`/invitations/${invitationId}`);
      
      if (response.data.success) {
        notificationService.success('Invitation cancelled successfully');
      }
      
      return response.data;

    } catch (error) {
      console.error('Error cancelling invitation:', error);
      const errorMessage = error.response?.data?.error || 'Failed to cancel invitation';
      notificationService.error(errorMessage);
      throw error;
    }
  }

  /**
   * Get invitation details by ID (for invitation accept page)
   */
  async getInvitationDetails(invitationId) {
    try {
      const response = await api.get(`/invitations/${invitationId}`);
      return response.data;

    } catch (error) {
      console.error('Error fetching invitation details:', error);
      throw error.response?.data || error;
    }
  }
}

// Export as default (singleton instance)
const invitationService = new InvitationService();
export default invitationService;