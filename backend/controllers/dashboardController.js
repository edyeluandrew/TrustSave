import Group from '../models/Group.js';

// @desc    Get dashboard statistics and data
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's groups
    const groups = await Group.find({
      $or: [
        { admin: userId },
        { 'members.user': userId }
      ]
    })
    .populate('admin', 'name phone')
    .populate('members.user', 'name phone');

    // Calculate statistics
    const totalSavings = groups.reduce((sum, group) => sum + (group.totalBalance || 0), 0);
    const activeGroups = groups.filter(group => group.isActive).length;
    
    // Mock loan data (you'll need to create a Loan model later)
    const totalLoans = Math.floor(totalSavings * 0.5); // Mock: 50% of total savings as available loans
    const availableLoans = Math.floor(totalSavings * 0.3); // Mock: 30% of total savings

    // Mock recent transactions including loans
    const mockTransactions = [
      {
        _id: '1',
        type: 'contribution',
        amount: 5000,
        groupName: groups[0]?.name || 'General Savings',
        status: 'completed',
        date: new Date().toISOString()
      },
      {
        _id: '2', 
        type: 'loan',
        amount: 15000,
        groupName: groups[0]?.name || 'General Savings',
        status: 'completed',
        date: new Date(Date.now() - 86400000).toISOString() // yesterday
      },
      {
        _id: '3',
        type: 'payout',
        amount: 25000,
        groupName: groups[0]?.name || 'General Savings', 
        status: 'pending',
        date: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalSavings,
          activeGroups,
          totalLoans,
          availableLoans
        },
        groups: groups.map(group => ({
          _id: group._id,
          name: group.name,
          description: group.description,
          memberCount: group.members.length,
          totalSavings: group.totalBalance || 0,
          myContribution: Math.floor((group.totalBalance || 0) * 0.3), // Mock user contribution
          nextMeeting: group.meetingSchedule,
          progress: Math.min(Math.floor(((group.totalBalance || 0) / 100000) * 100), 100), // Mock progress
          status: group.isActive ? 'active' : 'inactive',
          admin: group.admin
        })),
        transactions: mockTransactions
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};