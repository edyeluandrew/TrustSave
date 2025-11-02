import api from './api';

export const groupService = {
  // Get all dashboard data
  getDashboardData: async () => {
    try {
      const response = await api.get('/dashboard');
      return response.data.data; // Return the data object
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  // Get user's groups (you can still use this separately if needed)
  getUserGroups: async () => {
    try {
      const response = await api.get('/groups');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user groups:', error);
      throw error;
    }
  },

  // Create new group
  createGroup: async (groupData) => {
    try {
      const response = await api.post('/groups', groupData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }
};