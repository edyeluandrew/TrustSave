import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { groupService } from '../services/groupService';
import logo from '../assets/images/logo.png';
import { 
  Wallet, 
  Users, 
  TrendingUp, 
  Target,
  Plus,
  Eye,
  Download,
  Bell,
  LogOut,
  MessageCircle,
  HelpCircle,
  ArrowUpRight,
  Calendar,
  PieChart,
  Send,
  Loader,
  AlertCircle,
  HandCoins
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State for real data
  const [dashboardData, setDashboardData] = useState({
    groups: [],
    transactions: [],
    stats: {
      totalSavings: 0,
      activeGroups: 0,
      totalLoans: 0,
      availableLoans: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await groupService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { groups, transactions, stats } = dashboardData;

  const quickActions = [
    { 
      id: 1, 
      title: 'Make Contribution', 
      description: 'Add to your savings', 
      icon: Download,
      path: '/contribute',
      color: 'trust'
    },
    { 
      id: 2, 
      title: 'Request Loan', 
      description: 'Apply for a group loan', 
      icon: HandCoins,
      path: '/loans',
      color: 'success'
    },
    { 
      id: 3, 
      title: 'View Reports', 
      description: 'Analytics & insights', 
      icon: PieChart,
      path: '/reports',
      color: 'warning'
    },
    { 
      id: 4, 
      title: 'Invite Friends', 
      description: 'Grow your network', 
      icon: Send,
      path: '/invite',
      color: 'info'
    },
  ];

  // Handle logout with redirect
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const ProgressBar = ({ percentage, color = 'trust' }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full bg-${color}-500`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );

  const StatCard = ({ title, value, prefix, icon: Icon, change, color, onClick }) => (
    <div 
      className={`bg-white rounded-2xl p-6 shadow-sm border border-warm-200 group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-warm-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-warm-900">
            {prefix && `${prefix} `}{value.toLocaleString()}
          </p>
          {change && (
            <p className={`text-xs font-medium mt-2 ${
              color === 'trust' ? 'text-trust-600' :
              color === 'success' ? 'text-success-600' :
              color === 'warning' ? 'text-warning-600' : 'text-info-600'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-${color}-100 group-hover:scale-110 transition-transform`}>
          <Icon className={`h-6 w-6 ${
            color === 'trust' ? 'text-trust-600' :
            color === 'success' ? 'text-success-600' :
            color === 'warning' ? 'text-warning-600' : 'text-info-600'
          }`} />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, path, color }) => (
    <button
      onClick={() => navigate(path)}
      className={`bg-white rounded-xl p-5 text-left group hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-${color}-200 hover:scale-[1.02]`}
    >
      <div className={`p-3 rounded-lg bg-${color}-100 w-fit mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className={`h-6 w-6 ${
          color === 'trust' ? 'text-trust-600' :
          color === 'success' ? 'text-success-600' :
          color === 'warning' ? 'text-warning-600' : 'text-info-600'
        }`} />
      </div>
      <h3 className="font-semibold text-warm-900 mb-2 text-sm">{title}</h3>
      <p className="text-xs text-warm-500 leading-relaxed">{description}</p>
    </button>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-trust-600 animate-spin mx-auto mb-4" />
          <p className="text-warm-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-warm-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-warm-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-trust-500 hover:bg-trust-600 text-white py-2 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-warm-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <img 
                src={logo} 
                alt="TrustSave Logo"
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-trust-600">TrustSave</h1>
                <p className="text-xs text-warm-500">Secure Group Savings & Loans</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm font-medium text-warm-900">{user?.name}</p>
                <p className="text-xs text-warm-500">{user?.phone}</p>
                <p className="text-xs text-success-600 font-medium flex items-center">
                  <span className="w-2 h-2 bg-success-600 rounded-full mr-1"></span>
                  Active
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="p-2 rounded-lg hover:bg-warm-100 transition-colors relative">
                  <Bell className="h-5 w-5 text-warm-600" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-trust-500 rounded-full"></span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-sm py-2 px-4 border border-warm-300 text-warm-700 hover:bg-warm-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-warm-900 mb-2">
                {getGreeting()}, {user?.name}!
              </h1>
              <p className="text-warm-600 text-lg">
                Manage your savings groups and loans in one place.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-warm-500">Last updated</p>
              <p className="text-sm font-medium text-warm-700">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid - Focused on the 4 key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Savings" 
            value={stats.totalSavings} 
            prefix="Ksh" 
            icon={Wallet}
            change="+15%"
            color="trust"
            onClick={() => navigate('/savings')}
          />
          <StatCard 
            title="Active Groups" 
            value={stats.activeGroups} 
            icon={Users}
            change={`+${groups.length}`}
            color="success"
            onClick={() => navigate('/groups')}
          />
          <StatCard 
            title="My Loans" 
            value={stats.totalLoans} 
            prefix="Ksh" 
            icon={HandCoins}
            change={`${stats.availableLoans > 0 ? 'Available' : 'None'}`}
            color="warning"
            onClick={() => navigate('/loans')}
          />
          <StatCard 
            title="Create Group" 
            value="New" 
            icon={Plus}
            change="Start saving"
            color="info"
            onClick={() => navigate('/create-group')}
          />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <QuickActionCard key={action.id} {...action} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Groups */}
          <div className="lg:col-span-2 space-y-6">
            {/* Savings Groups */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-warm-900">My Savings Groups</h2>
                  <p className="text-sm text-warm-500">
                    {groups.length} group{groups.length !== 1 ? 's' : ''} • Total: Ksh {stats.totalSavings?.toLocaleString()}
                  </p>
                </div>
                <button 
                  className="bg-trust-500 hover:bg-trust-600 text-white text-sm py-3 px-4 rounded-lg flex items-center space-x-2 transition-colors"
                  onClick={() => navigate('/create-group')}
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Group</span>
                </button>
              </div>

              {groups.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-warm-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-warm-900 mb-2">No groups yet</h3>
                  <p className="text-warm-500 mb-6">Create your first savings group to start saving with others</p>
                  <button 
                    onClick={() => navigate('/create-group')}
                    className="bg-trust-500 hover:bg-trust-600 text-white py-2 px-6 rounded-lg transition-colors"
                  >
                    Create Your First Group
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {groups.map((group) => (
                    <div key={group._id} className="bg-warm-50 rounded-xl p-5 border-l-4 border-trust-500 hover:shadow-md transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="font-semibold text-warm-900 text-lg">{group.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              group.status === 'active' 
                                ? 'bg-success-100 text-success-700'
                                : group.status === 'pending'
                                ? 'bg-warning-100 text-warning-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {group.status || 'Active'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-warm-500" />
                              <div>
                                <p className="text-warm-500 text-xs">Members</p>
                                <p className="font-medium text-warm-900">{group.memberCount} people</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-warm-500 text-xs">My Contribution</p>
                              <p className="font-medium text-warm-900">Ksh {group.myContribution?.toLocaleString() || '0'}</p>
                            </div>
                            <div>
                              <p className="text-warm-500 text-xs">Total Savings</p>
                              <p className="font-medium text-warm-900">Ksh {group.totalSavings?.toLocaleString() || '0'}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-warm-500" />
                              <div>
                                <p className="text-warm-500 text-xs">Next Meeting</p>
                                <p className="font-medium text-warm-900">
                                  {group.nextMeeting || 'Not scheduled'}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {group.progress && (
                            <div className="mb-2">
                              <div className="flex justify-between text-xs text-warm-600 mb-2">
                                <span>Group Progress</span>
                                <span>{group.progress}%</span>
                              </div>
                              <ProgressBar percentage={group.progress} />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 pt-4 border-t border-warm-200">
                        <button 
                          className="flex-1 bg-transparent border border-warm-300 text-warm-700 hover:bg-warm-50 text-sm py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                          onClick={() => navigate(`/groups/${group._id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                        <button 
                          className="flex-1 bg-trust-500 hover:bg-trust-600 text-white text-sm py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                          onClick={() => navigate(`/contribute?group=${group._id}`)}
                        >
                          <Download className="h-4 w-4" />
                          <span>Contribute</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-warm-900">Recent Activity</h2>
                <button className="text-sm text-trust-600 hover:text-trust-700 font-medium flex items-center space-x-1">
                  <span>View All</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
              
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-warm-300 mx-auto mb-3" />
                  <p className="text-warm-500">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction._id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-warm-50 transition-colors group">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'contribution' ? 'bg-trust-100' : 
                        transaction.type === 'loan' ? 'bg-warning-100' : 'bg-success-100'
                      } group-hover:scale-110 transition-transform`}>
                        {transaction.type === 'contribution' ? (
                          <Download className="h-4 w-4 text-trust-600" />
                        ) : transaction.type === 'loan' ? (
                          <HandCoins className="h-4 w-4 text-warning-600" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-success-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-warm-900">
                              {transaction.type === 'contribution' ? 'Contribution Made' : 
                               transaction.type === 'loan' ? 'Loan Disbursed' : 'Payout Received'}
                            </p>
                            <p className="text-xs text-warm-500 mt-1">
                              {transaction.groupName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${
                              transaction.type === 'contribution' ? 'text-trust-600' :
                              transaction.type === 'loan' ? 'text-warning-600' : 'text-success-600'
                            }`}>
                              {transaction.type === 'contribution' ? '-' : '+'}Ksh {transaction.amount?.toLocaleString()}
                            </p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              transaction.status === 'completed' 
                                ? 'bg-success-100 text-success-700' 
                                : transaction.status === 'pending'
                                ? 'bg-warning-100 text-warning-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-warm-400 mt-2">
                          {new Date(transaction.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-br from-trust-50 to-trust-100 border border-trust-200 rounded-2xl p-6">
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-trust-100 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-trust-600" />
                </div>
                <h3 className="font-bold text-trust-900 mb-2 text-lg">Need Help?</h3>
                <p className="text-trust-700 text-sm mb-4 leading-relaxed">
                  Our support team is here to help you with savings, loans, and group management.
                </p>
                <div className="space-y-2">
                  <button className="w-full bg-trust-500 hover:bg-trust-600 text-white text-sm py-3 rounded-lg transition-colors">
                    Contact Support
                  </button>
                  <button className="w-full bg-transparent border border-trust-300 text-trust-600 hover:bg-trust-50 text-sm py-2 rounded-lg transition-colors flex items-center justify-center space-x-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>View FAQs</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;