import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.jsx';
import invitationService from '../services/invitationService.jsx';
import { contributionService } from '../services/contributionService.jsx';
import PendingRequests from '../components/PendingRequests.jsx';
import ContributionModal from '../components/ContributionModal.jsx';
import {
  Users,
  Calendar,
  Wallet,
  TrendingUp,
  HandCoins,
  Eye,
  Download,
  Plus,
  ArrowLeft,
  Bell,
  MessageCircle,
  Settings,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  X,
  Phone,
  Mail,
  Crown,
  Shield,
  PieChart,
  Send,
  Link as LinkIcon
} from 'lucide-react';

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [inviteMembers, setInviteMembers] = useState([{ id: `member-${Date.now()}-${Math.random()}`, name: '', phone: '' }]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [inviteMethod, setInviteMethod] = useState('sms');
  const [contributions, setContributions] = useState([]);
  const [contributionsLoading, setContributionsLoading] = useState(false);

  useEffect(() => {
    fetchGroupDetails();
    if (activeTab === 'transactions') {
      fetchContributions();
    }
  }, [groupId, activeTab]);

  const fetchGroupDetails = async () => {
    try {
      const response = await api.get(`/groups/${groupId}`);
      setGroup(response.data.data);
    } catch (err) {
      setError('Failed to load group details');
      console.error('Error fetching group:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContributions = async () => {
    setContributionsLoading(true);
    try {
      const data = await contributionService.getGroupContributions(groupId);
      setContributions(data);
    } catch (error) {
      console.error('Error fetching contributions:', error);
    } finally {
      setContributionsLoading(false);
    }
  };

  const isAdmin = group?.admin?._id?.toString() === user?._id?.toString();

  // Mock data for loans
  const mockLoans = [
    {
      id: 1,
      memberName: 'John Doe',
      amount: 50000,
      purpose: 'Business expansion',
      status: 'active',
      issuedDate: '2024-01-10',
      dueDate: '2024-04-10',
      remainingBalance: 35000,
      progress: 30
    },
    {
      id: 2,
      memberName: 'Jane Smith',
      amount: 30000,
      purpose: 'School fees',
      status: 'repaid',
      issuedDate: '2024-01-05',
      dueDate: '2024-03-05',
      remainingBalance: 0,
      progress: 100
    }
  ];

  const handleContributionSuccess = (result) => {
    // Refresh contributions list if on transactions tab
    if (activeTab === 'transactions') {
      fetchContributions();
    }
    // Show success message
    alert(`Contribution initiated! Transaction ID: ${result.contribution.transactionId}`);
  };

  // Invite Members Functions
  const addInviteField = useCallback(() => {
    setInviteMembers(prev => [...prev, { id: `member-${Date.now()}-${Math.random()}`, name: '', phone: '' }]);
  }, []);

  const removeInviteField = useCallback((id) => {
    if (inviteMembers.length > 1) {
      setInviteMembers(prev => prev.filter(member => member.id !== id));
    }
  }, [inviteMembers.length]);

  const updateInviteMember = useCallback((id, field, value) => {
    setInviteMembers(prev => {
      const newMembers = prev.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      );
      return newMembers;
    });
  }, []);

  const resetInviteForm = () => {
    setInviteMembers([{ id: `member-${Date.now()}-${Math.random()}`, name: '', phone: '' }]);
    setInviteError('');
    setInviteMethod('sms');
  };

  const handleInviteMembers = async () => {
    const validMembers = inviteMembers.filter(member => 
      member.name.trim() && member.phone.trim()
    );

    if (validMembers.length === 0) {
      setInviteError('Please add at least one member with name and phone number');
      return;
    }

    const invalidPhones = validMembers.filter(member => !/^\+?[\d\s-()]{10,}$/.test(member.phone.trim()));
    if (invalidPhones.length > 0) {
      setInviteError('Please enter valid phone numbers for all members');
      return;
    }

    setInviteLoading(true);
    setInviteError('');

    try {
      const result = await invitationService.createInvitations(
        group._id, 
        validMembers, 
        inviteMethod
      );

      if (result.success) {
        setShowInviteModal(false);
        resetInviteForm();
        const successfulSends = result.sendResults.filter(r => r.success).length;
        alert(`Successfully sent ${successfulSends}/${validMembers.length} invitations via ${inviteMethod.toUpperCase()}!`);
        fetchGroupDetails();
      } else {
        setInviteError(result.error || 'Failed to send invitations');
      }
      
    } catch (err) {
      setInviteError('Failed to invite members. Please try again.');
      console.error('Invitation error:', err);
    } finally {
      setInviteLoading(false);
    }
  };

  // Progress Bar Component
  const ProgressBar = ({ percentage, color = 'trust' }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full bg-${color}-500 transition-all duration-300`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );

  // Invite Modal Component
  const InviteModal = useMemo(() => {
    if (!showInviteModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-warm-900">Invite Members</h3>
              <button 
                onClick={() => {
                  setShowInviteModal(false);
                  resetInviteForm();
                }}
                className="p-1 hover:bg-warm-100 rounded transition-colors"
              >
                <X className="h-5 w-5 text-warm-500" />
              </button>
            </div>

            <p className="text-warm-600 text-sm mb-6">
              Add members to <span className="font-semibold text-trust-600">{group?.name}</span> by entering their names and phone numbers.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-warm-700 mb-2">
                Invitation Method
              </label>
              <div className="flex space-x-3">
                {['sms', 'whatsapp', 'link'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setInviteMethod(method)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      inviteMethod === method
                        ? 'bg-trust-500 text-white border-trust-500'
                        : 'bg-white text-warm-700 border-warm-300 hover:bg-warm-50'
                    }`}
                  >
                    {method.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {inviteError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{inviteError}</p>
                </div>
              </div>
            )}

            <div className="space-y-4 mb-6">
              {inviteMembers.map((member, index) => (
                <div 
                  key={member.id} 
                  className="flex items-start space-x-3 p-4 bg-warm-50 rounded-lg border border-warm-200"
                >
                  <div className="flex-1 space-y-3">
                    <div className="relative">
                      <UserCheck className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                        focusedField === `${member.id}-name` ? 'text-trust-500' : 'text-warm-400'
                      } transition-colors`} />
                      <input
                        type="text"
                        placeholder="Member Name"
                        value={member.name}
                        onChange={(e) => updateInviteMember(member.id, 'name', e.target.value)}
                        onFocus={() => setFocusedField(`${member.id}-name`)}
                        onBlur={() => setFocusedField(null)}
                        autoComplete="off"
                        className="w-full pl-10 pr-4 py-3 border border-warm-300 rounded-lg focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div className="relative">
                      <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                        focusedField === `${member.id}-phone` ? 'text-trust-500' : 'text-warm-400'
                      } transition-colors`} />
                      <input
                        type="tel"
                        placeholder="Phone Number (e.g., 0712345678)"
                        value={member.phone}
                        onChange={(e) => updateInviteMember(member.id, 'phone', e.target.value)}
                        onFocus={() => setFocusedField(`${member.id}-phone`)}
                        onBlur={() => setFocusedField(null)}
                        autoComplete="off"
                        className="w-full pl-10 pr-4 py-3 border border-warm-300 rounded-lg focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                  {inviteMembers.length > 1 && (
                    <button
                      onClick={() => removeInviteField(member.id)}
                      className="p-2 hover:bg-red-50 rounded transition-colors mt-1 flex-shrink-0"
                      type="button"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={addInviteField}
                className="flex-1 bg-transparent border border-warm-300 text-warm-700 hover:bg-warm-50 py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                type="button"
              >
                <Plus className="h-4 w-4" />
                <span>Add Another</span>
              </button>
              <button
                onClick={handleInviteMembers}
                disabled={inviteLoading}
                className="flex-1 bg-trust-500 hover:bg-trust-600 disabled:bg-trust-300 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                type="button"
              >
                {inviteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Inviting...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Invite {inviteMembers.filter(m => m.name && m.phone).length} Members</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-xs">
                <strong>Method:</strong> {inviteMethod.toUpperCase()} - {
                  inviteMethod === 'sms' ? 'Members will receive an SMS invitation' :
                  inviteMethod === 'whatsapp' ? 'Members will receive a WhatsApp message' :
                  'You will get a shareable link to send to members'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }, [showInviteModal, inviteMembers, inviteError, inviteLoading, focusedField, group?.name, inviteMethod, updateInviteMember, addInviteField, removeInviteField, handleInviteMembers, resetInviteForm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-600 mx-auto mb-4"></div>
          <p className="text-warm-600">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-warm-900 mb-2">Group Not Found</h2>
          <p className="text-warm-600 mb-4">{error || 'The group you are looking for does not exist.'}</p>
          <button 
            onClick={() => navigate('/groups')}
            className="bg-trust-500 hover:bg-trust-600 text-white py-2 px-6 rounded-lg transition-colors"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100">
      {/* Modals */}
      {InviteModal}
      <ContributionModal
        groupId={groupId}
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        onSuccess={handleContributionSuccess}
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-warm-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/groups')}
                className="p-2 hover:bg-warm-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-warm-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-warm-900">{group.name}</h1>
                <p className="text-sm text-warm-500">Group Details</p>
              </div>
              {isAdmin && (
                <span className="bg-warning-100 text-warning-700 text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1">
                  <Crown className="h-3 w-3" />
                  <span>Admin</span>
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-warm-600 hover:text-warm-900 text-sm font-medium">
                Dashboard
              </Link>
              {isAdmin && (
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="bg-success-500 hover:bg-success-600 text-white text-sm py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Invite Members</span>
                </button>
              )}
              <button 
                onClick={() => setShowContributionModal(true)}
                className="bg-trust-500 hover:bg-trust-600 text-white text-sm py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Wallet className="h-4 w-4" />
                <span>Contribute</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Group Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm-200 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-warm-900 mb-2">{group.name}</h1>
              <p className="text-warm-600 text-lg mb-4">{group.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-trust-100 flex items-center justify-center mx-auto mb-2">
                    <Wallet className="h-6 w-6 text-trust-600" />
                  </div>
                  <p className="text-sm text-warm-500">Total Savings</p>
                  <p className="text-xl font-bold text-warm-900">
                    {(group.totalBalance || 0).toLocaleString()} UGX
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-2">
                    <Users className="h-6 w-6 text-success-600" />
                  </div>
                  <p className="text-sm text-warm-500">Members</p>
                  <p className="text-xl font-bold text-warm-900">{group.members?.length || 0}</p>
                </div>
                
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-warning-100 flex items-center justify-center mx-auto mb-2">
                    <HandCoins className="h-6 w-6 text-warning-600" />
                  </div>
                  <p className="text-sm text-warm-500">Active Loans</p>
                  <p className="text-xl font-bold text-warm-900">
                    {mockLoans.filter(loan => loan.status === 'active').length}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-info-100 flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="h-6 w-6 text-info-600" />
                  </div>
                  <p className="text-sm text-warm-500">Progress</p>
                  <p className="text-xl font-bold text-warm-900">65%</p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <span className="bg-success-100 text-success-700 text-xs px-2 py-1 rounded-full font-medium mb-2 inline-block">
                {group.isActive ? 'Active' : 'Inactive'}
              </span>
              <p className="text-sm text-warm-500">Admin</p>
              <p className="font-medium text-warm-900">{group.admin?.name}</p>
              {group.meetingSchedule && (
                <>
                  <p className="text-sm text-warm-500 mt-2">Next Meeting</p>
                  <p className="font-medium text-warm-900">{group.meetingSchedule}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-warm-200 mb-6">
          <div className="border-b border-warm-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: Eye },
                { id: 'members', name: 'Members', icon: Users },
                { id: 'loans', name: 'Loans', icon: HandCoins },
                { id: 'transactions', name: 'Transactions', icon: TrendingUp },
                { id: 'settings', name: 'Settings', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-trust-500 text-trust-600'
                        : 'border-transparent text-warm-500 hover:text-warm-700 hover:border-warm-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-warm-900 mb-4">Group Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-warm-500">Purpose</span>
                        <span className="text-warm-900 font-medium">{group.purpose || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-warm-500">Minimum Contribution</span>
                        <span className="text-warm-900 font-medium">
                          {(group.minContribution || 10000).toLocaleString()} UGX
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-warm-500">Contribution Multiple</span>
                        <span className="text-warm-900 font-medium">
                          {(group.contributionMultiple || 10000).toLocaleString()} UGX
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-warm-500">Meeting Schedule</span>
                        <span className="text-warm-900 font-medium">
                          {group.meetingSchedule || 'Not scheduled'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-warm-500">Created</span>
                        <span className="text-warm-900 font-medium">
                          {new Date(group.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Invite Section for Admins */}
                  {isAdmin && (
                    <div className="bg-success-50 border border-success-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-success-900 flex items-center space-x-2">
                          <UserPlus className="h-5 w-5" />
                          <span>Grow Your Group</span>
                        </h4>
                        <span className="bg-success-100 text-success-700 text-xs px-2 py-1 rounded-full">
                          Admin Only
                        </span>
                      </div>
                      <p className="text-success-700 text-sm mb-3">
                        Invite new members to join your savings group. Enter their names and phone numbers to send invitations.
                      </p>
                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="w-full bg-success-500 hover:bg-success-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Invite Members to Group</span>
                      </button>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-warm-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setShowContributionModal(true)}
                        className="bg-trust-500 hover:bg-trust-600 text-white text-sm py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <Wallet className="h-4 w-4" />
                        <span>Contribute</span>
                      </button>
                      <button className="bg-transparent border border-warm-300 text-warm-700 hover:bg-warm-50 text-sm py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
                        <HandCoins className="h-4 w-4" />
                        <span>Apply Loan</span>
                      </button>
                      <button className="bg-transparent border border-warm-300 text-warm-700 hover:bg-warm-50 text-sm py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <span>Notify</span>
                      </button>
                      <button className="bg-transparent border border-warm-300 text-warm-700 hover:bg-warm-50 text-sm py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
                        <MessageCircle className="h-4 w-4" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-warm-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {contributions.slice(0, 5).map((contribution) => (
                      <div key={contribution._id} className="flex items-center justify-between p-3 bg-warm-50 rounded-lg hover:bg-warm-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            contribution.status === 'completed' ? 'bg-success-100' : 
                            contribution.status === 'pending' ? 'bg-warning-100' : 'bg-red-100'
                          }`}>
                            <Wallet className={`h-4 w-4 ${
                              contribution.status === 'completed' ? 'text-success-600' : 
                              contribution.status === 'pending' ? 'text-warning-600' : 'text-red-600'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-warm-900">
                              Contribution - {contribution.mobileMoneyProvider.toUpperCase()}
                            </p>
                            <p className="text-xs text-warm-500">{contribution.userId?.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-trust-600">
                            {contribution.amount?.toLocaleString()} UGX
                          </p>
                          <p className="text-xs text-warm-500">
                            {new Date(contribution.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {contributions.length === 0 && (
                      <div className="text-center py-8">
                        <Wallet className="h-12 w-12 text-warm-300 mx-auto mb-2" />
                        <p className="text-warm-500">No contributions yet</p>
                        <button 
                          onClick={() => setShowContributionModal(true)}
                          className="text-trust-600 hover:text-trust-700 text-sm mt-2"
                        >
                          Be the first to contribute
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-warm-900">Group Members</h3>
                    <p className="text-warm-500 text-sm">
                      {group.members?.length || 0} member{group.members?.length !== 1 ? 's' : ''} in this group
                    </p>
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={() => setShowInviteModal(true)}
                      className="bg-success-500 hover:bg-success-600 text-white text-sm py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Invite Members</span>
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {group.members?.map((member) => (
                    <div key={member.user?._id} className="flex items-center justify-between p-4 bg-warm-50 rounded-lg hover:bg-warm-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-trust-100 flex items-center justify-center">
                          <span className="text-trust-600 font-semibold text-sm">
                            {member.user?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-warm-900 flex items-center space-x-2">
                            {member.user?.name}
                            {member.user?._id?.toString() === group.admin?._id?.toString() && (
                              <span className="bg-warning-100 text-warning-700 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                                <Crown className="h-3 w-3" />
                                <span>Admin</span>
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-warm-500">{member.user?.phone}</p>
                          <p className="text-xs text-warm-400">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`bg-${
                          member.role === 'assistant_admin' ? 'warning' : 'info'
                        }-100 text-${member.role === 'assistant_admin' ? 'warning' : 'info'}-700 text-xs px-2 py-1 rounded-full`}>
                          {member.role === 'assistant_admin' ? 'Assistant Admin' : 'Member'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add PendingRequests component for admins */}
                {isAdmin && (
                  <div className="mt-8">
                    <PendingRequests 
                      groupId={group._id} 
                      isAdmin={isAdmin}
                      onUpdate={fetchGroupDetails}
                    />
                  </div>
                )}

                {/* Invite Call-to-Action for Admins */}
                {isAdmin && group.members?.length < 10 && (
                  <div className="mt-6 p-4 bg-success-50 border border-success-200 rounded-xl text-center">
                    <UserPlus className="h-8 w-8 text-success-500 mx-auto mb-2" />
                    <h4 className="font-semibold text-success-900 mb-1">Grow Your Group</h4>
                    <p className="text-success-700 text-sm mb-3">
                      Invite more members to strengthen your savings group and increase collective savings.
                    </p>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="bg-success-500 hover:bg-success-600 text-white py-2 px-6 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Invite New Members</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Loans Tab */}
            {activeTab === 'loans' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-warm-900">Group Loans</h3>
                  <button className="bg-trust-500 hover:bg-trust-600 text-white text-sm py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors">
                    <HandCoins className="h-4 w-4" />
                    <span>New Loan</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {mockLoans.map((loan) => (
                    <div key={loan.id} className="bg-warm-50 rounded-lg p-4 hover:bg-warm-100 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-warm-900">{loan.memberName}</h4>
                          <p className="text-sm text-warm-500">{loan.purpose}</p>
                        </div>
                        <span className={`bg-${
                          loan.status === 'active' ? 'warning' : 'success'
                        }-100 text-${loan.status === 'active' ? 'warning' : 'success'}-700 text-xs px-2 py-1 rounded-full`}>
                          {loan.status === 'active' ? 'Active' : 'Repaid'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-warm-500">Amount</p>
                          <p className="font-medium text-warm-900">{loan.amount.toLocaleString()} UGX</p>
                        </div>
                        <div>
                          <p className="text-warm-500">Issued</p>
                          <p className="font-medium text-warm-900">
                            {new Date(loan.issuedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-warm-500">Due Date</p>
                          <p className="font-medium text-warm-900">
                            {new Date(loan.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-warm-500">Balance</p>
                          <p className="font-medium text-warm-900">
                            {loan.remainingBalance.toLocaleString()} UGX
                          </p>
                        </div>
                      </div>
                      
                      {loan.status === 'active' && (
                        <div className="mt-3 pt-3 border-t border-warm-200">
                          <div className="flex justify-between text-xs text-warm-600 mb-1">
                            <span>Repayment Progress</span>
                            <span>{loan.progress}%</span>
                          </div>
                          <ProgressBar percentage={loan.progress} color="success" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-warm-900">Recent Contributions</h3>
                  <button 
                    onClick={() => setShowContributionModal(true)}
                    className="bg-trust-500 hover:bg-trust-600 text-white text-sm py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Wallet className="h-4 w-4" />
                    <span>Make Contribution</span>
                  </button>
                </div>
                
                {contributionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trust-600 mx-auto mb-2"></div>
                    <p className="text-warm-500">Loading contributions...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contributions.map((contribution) => (
                      <div key={contribution._id} className="flex items-center justify-between p-4 bg-warm-50 rounded-lg hover:bg-warm-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            contribution.status === 'completed' ? 'bg-success-100' : 
                            contribution.status === 'pending' ? 'bg-warning-100' : 'bg-red-100'
                          }`}>
                            <Wallet className={`h-5 w-5 ${
                              contribution.status === 'completed' ? 'text-success-600' : 
                              contribution.status === 'pending' ? 'text-warning-600' : 'text-red-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-warm-900 capitalize">
                              {contribution.mobileMoneyProvider} Contribution
                            </p>
                            <p className="text-sm text-warm-500">{contribution.userId?.name}</p>
                            <p className="text-xs text-warm-400">
                              Transaction: {contribution.transactionId}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-trust-600">
                            {contribution.amount?.toLocaleString()} UGX
                          </p>
                          <span className={`bg-${
                            contribution.status === 'completed' ? 'success' : 
                            contribution.status === 'pending' ? 'warning' : 'red'
                          }-100 text-${contribution.status === 'completed' ? 'success' : 
                            contribution.status === 'pending' ? 'warning' : 'red'}-700 text-xs px-2 py-1 rounded-full capitalize`}>
                            {contribution.status}
                          </span>
                          <p className="text-xs text-warm-400 mt-1">
                            {new Date(contribution.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {contributions.length === 0 && (
                      <div className="text-center py-12">
                        <Wallet className="h-16 w-16 text-warm-300 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-warm-700 mb-2">No Contributions Yet</h4>
                        <p className="text-warm-500 mb-4">Be the first to contribute to this group</p>
                        <button 
                          onClick={() => setShowContributionModal(true)}
                          className="bg-trust-500 hover:bg-trust-600 text-white py-2 px-6 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
                        >
                          <Wallet className="h-4 w-4" />
                          <span>Make First Contribution</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h3 className="text-lg font-semibold text-warm-900 mb-6">Group Settings</h3>
                {isAdmin ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium text-warm-900">Basic Information</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-warm-700 mb-1">Group Name</label>
                            <input 
                              type="text" 
                              defaultValue={group.name}
                              className="w-full border border-warm-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-trust-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-warm-700 mb-1">Description</label>
                            <textarea 
                              defaultValue={group.description}
                              rows="3"
                              className="w-full border border-warm-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-trust-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-medium text-warm-900">Danger Zone</h4>
                        <div className="space-y-3">
                          <button className="w-full bg-transparent border border-red-300 text-red-600 hover:bg-red-50 py-2 px-4 rounded-lg transition-colors">
                            Archive Group
                          </button>
                          <button className="w-full bg-transparent border border-red-300 text-red-600 hover:bg-red-50 py-2 px-4 rounded-lg transition-colors">
                            Delete Group
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-warm-300 mx-auto mb-4" />
                    <p className="text-warm-500">Only group administrators can manage settings</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;