import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Users,
  Wallet,
  Calendar,
  Plus,
  ArrowLeft,
  Eye,
  Download,
  TrendingUp,
  HandCoins,
  Settings,
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  Clock,
  AlertCircle
} from 'lucide-react';

const GroupsDashboard = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data.data);
    } catch (err) {
      setError('Failed to load groups');
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter groups based on search and status
  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && group.isActive) ||
                         (filterStatus === 'inactive' && !group.isActive);
    return matchesSearch && matchesStatus;
  });

  // Calculate group statistics
  const groupStats = {
    totalGroups: groups.length,
    activeGroups: groups.filter(g => g.isActive).length,
    totalSavings: groups.reduce((sum, group) => sum + (group.totalBalance || 0), 0),
    totalMembers: groups.reduce((sum, group) => sum + group.members.length, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-600 mx-auto mb-4"></div>
          <p className="text-warm-600">Loading your groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-warm-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="p-2 hover:bg-warm-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-warm-600" />
              </Link>
              <div className="h-8 w-8 rounded-full bg-trust-500 flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-warm-900">TrustSave Groups</h1>
                <p className="text-xs text-warm-500">Manage your savings circles</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="text-warm-600 hover:text-warm-900 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link 
                to="/create-group" 
                className="bg-trust-500 hover:bg-trust-600 text-white text-sm py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create Group</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with Stats */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-warm-900 mb-2">My Savings Groups</h1>
              <p className="text-warm-600 text-lg">Manage your savings groups and track contributions</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-warm-500">Last updated</p>
              <p className="text-sm font-medium text-warm-700">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-warm-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-warm-600">Total Groups</p>
                  <p className="text-2xl font-bold text-warm-900">{groupStats.totalGroups}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-trust-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-trust-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-warm-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-warm-600">Active Groups</p>
                  <p className="text-2xl font-bold text-warm-900">{groupStats.activeGroups}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-success-100 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-success-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-warm-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-warm-600">Total Savings</p>
                  <p className="text-2xl font-bold text-warm-900">
                    {groupStats.totalSavings.toLocaleString()} UGX
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-warning-100 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-warning-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-warm-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-warm-600">Total Members</p>
                  <p className="text-2xl font-bold text-warm-900">{groupStats.totalMembers}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-info-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-info-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex-1">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-warm-400" />
                <input
                  type="text"
                  placeholder="Search groups by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-warm-300 rounded-lg focus:ring-2 focus:ring-trust-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-warm-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-warm-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-trust-500 focus:border-transparent"
                >
                  <option value="all">All Groups</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <button 
                onClick={fetchGroups}
                className="bg-trust-500 hover:bg-trust-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div 
              key={group._id} 
              className="bg-white rounded-2xl shadow-sm border border-warm-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
            >
              <div className="p-6">
                {/* Group Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-warm-900 group-hover:text-trust-600 transition-colors">
                      {group.name}
                    </h3>
                    <p className="text-warm-600 text-sm mt-1 line-clamp-2">
                      {group.description || 'No description provided'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`badge-${group.isActive ? 'success' : 'warning'} text-xs`}>
                      {group.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button className="p-1 hover:bg-warm-100 rounded transition-colors">
                      <MoreVertical className="h-4 w-4 text-warm-400" />
                    </button>
                  </div>
                </div>
                
                {/* Group Purpose */}
                {group.purpose && (
                  <div className="mb-4">
                    <p className="text-xs text-warm-500">Purpose</p>
                    <p className="text-sm text-warm-700 font-medium">{group.purpose}</p>
                  </div>
                )}
                
                {/* Group Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-warm-500" />
                    <div>
                      <p className="text-warm-500 text-xs">Members</p>
                      <p className="font-medium text-warm-900">{group.members.length}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-4 w-4 text-warm-500" />
                    <div>
                      <p className="text-warm-500 text-xs">Savings</p>
                      <p className="font-medium text-warm-900">
                        {(group.totalBalance || 0).toLocaleString()} UGX
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <HandCoins className="h-4 w-4 text-warm-500" />
                    <div>
                      <p className="text-warm-500 text-xs">Min. Contribution</p>
                      <p className="font-medium text-warm-900">
                        {(group.minContribution || 10000).toLocaleString()} UGX
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-warm-500" />
                    <div>
                      <p className="text-warm-500 text-xs">Meets</p>
                      <p className="font-medium text-warm-900">
                        {group.meetingSchedule || 'Flexible'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Admin Info */}
                <div className="flex items-center justify-between p-3 bg-warm-50 rounded-lg mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-full bg-trust-100 flex items-center justify-center">
                      <span className="text-trust-600 text-xs font-semibold">
                        {group.admin.name?.charAt(0) || 'A'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-warm-500">Admin</p>
                      <p className="text-sm font-medium text-warm-900">{group.admin.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-warm-500">Created</p>
                    <p className="text-xs font-medium text-warm-700">
                      {new Date(group.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Link
                    to={`/groups/${group._id}`}
                    className="flex-1 bg-transparent border border-warm-300 text-warm-700 hover:bg-warm-50 text-sm py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </Link>
                  <button 
                    className="flex-1 bg-trust-500 hover:bg-trust-600 text-white text-sm py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    onClick={() => {/* Add contribute functionality */}}
                  >
                    <Download className="h-4 w-4" />
                    <span>Contribute</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <div className="text-center py-16">
            <div className="h-24 w-24 rounded-3xl bg-warm-100 flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-warm-400" />
            </div>
            <h3 className="text-2xl font-bold text-warm-900 mb-3">
              {searchTerm || filterStatus !== 'all' ? 'No groups found' : 'No groups yet'}
            </h3>
            <p className="text-warm-600 text-lg mb-6 max-w-md mx-auto">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria to find your groups.'
                : 'Create your first savings group to start saving with friends and family.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/create-group" 
                className="bg-trust-500 hover:bg-trust-600 text-white py-3 px-8 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Create Your First Group</span>
              </Link>
              {(searchTerm || filterStatus !== 'all') && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  className="bg-transparent border border-warm-300 text-warm-700 hover:bg-warm-50 py-3 px-6 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading more indicator */}
        {filteredGroups.length > 0 && groups.length > 6 && (
          <div className="text-center mt-8">
            <button className="btn-outline">
              Load More Groups
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsDashboard;