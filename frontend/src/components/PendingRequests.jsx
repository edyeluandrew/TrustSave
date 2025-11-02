import React, { useState, useEffect } from 'react';
import invitationService from '../services/invitationService';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Phone,
  Mail
} from 'lucide-react';

const PendingRequests = ({ groupId, isAdmin, onUpdate }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (isAdmin && groupId) {
      fetchJoinRequests();
    }
  }, [groupId, isAdmin]);

  const fetchJoinRequests = async () => {
    try {
      setLoading(true);
      const response = await invitationService.getJoinRequests(groupId);
      setRequests(response.data || []);
    } catch (err) {
      setError('Failed to load join requests');
      console.error('Error fetching join requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setProcessing(requestId);
      await invitationService.approveJoinRequest(requestId);
      
      // Refresh the list
      await fetchJoinRequests();
      if (onUpdate) onUpdate();
      
      // Show success message
      alert('User approved successfully!');
    } catch (err) {
      alert('Failed to approve user: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId) => {
    const notes = prompt('Please provide a reason for rejection (optional):');
    if (notes === null) return; // User cancelled

    try {
      setProcessing(requestId);
      await invitationService.rejectJoinRequest(requestId, notes);
      
      // Refresh the list
      await fetchJoinRequests();
      if (onUpdate) onUpdate();
      
      // Show success message
      alert('Join request rejected successfully!');
    } catch (err) {
      alert('Failed to reject request: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessing(null);
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-warm-200">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trust-600"></div>
          <span className="ml-3 text-warm-600">Loading join requests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-warm-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-warm-900 flex items-center space-x-2">
            <Clock className="h-5 w-5 text-warning-500" />
            <span>Pending Join Requests</span>
          </h3>
          <p className="text-warm-500 text-sm mt-1">
            {requests.length} request{requests.length !== 1 ? 's' : ''} awaiting approval
          </p>
        </div>
        
        <button
          onClick={fetchJoinRequests}
          className="bg-trust-500 hover:bg-trust-600 text-white text-sm py-2 px-4 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-8">
          <UserCheck className="h-12 w-12 text-warm-300 mx-auto mb-3" />
          <p className="text-warm-500">No pending join requests</p>
          <p className="text-warm-400 text-sm mt-1">
            When users request to join, they'll appear here for approval.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="flex items-center justify-between p-4 bg-warm-50 rounded-lg border border-warm-200">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-trust-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-trust-600" />
                </div>
                <div>
                  <p className="font-semibold text-warm-900">
                    {request.userId?.name || 'Unknown User'}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-warm-500 mt-1">
                    <span className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>{request.userId?.phone || 'No phone'}</span>
                    </span>
                    {request.userId?.email && (
                      <span className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{request.userId.email}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-warm-400 mt-1">
                    Requested {new Date(request.requestedAt).toLocaleDateString()}
                  </p>
                  {request.invitationId && (
                    <p className="text-xs text-warm-500 mt-1">
                      Invited via {request.invitationId.method.toUpperCase()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleApprove(request._id)}
                  disabled={processing === request._id}
                  className="bg-success-500 hover:bg-success-600 disabled:bg-success-300 text-white text-sm py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                  {processing === request._id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <span>Approve</span>
                </button>

                <button
                  onClick={() => handleReject(request._id)}
                  disabled={processing === request._id}
                  className="bg-transparent border border-red-300 text-red-600 hover:bg-red-50 disabled:bg-red-100 text-sm py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingRequests;