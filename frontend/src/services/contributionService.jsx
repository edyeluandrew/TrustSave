import api from './api.jsx';

export const contributionService = {
  // Initiate contribution
  initiateContribution: async (contributionData) => {
    const response = await api.post('/contributions', contributionData);
    return response.data;
  },

  // Get group contributions
  getGroupContributions: async (groupId) => {
    const response = await api.get(`/contributions/group/${groupId}`);
    return response.data;
  },

  // Get user contributions
  getUserContributions: async () => {
    const response = await api.get('/contributions/user');
    return response.data;
  }
};