import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import invitationService from '../services/invitationService';import {
  Users,
  Calendar,
  UserCheck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Shield
} from 'lucide-react';

const InvitationAccept = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user, login } = useAuth();
  
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchInvitation();
  }, [code]);

  const fetchInvitation = async () => {
    try {
      setLoading(true);
      const response = await invitationService.getInvitation(code);
      setInvitation(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired invitation');
      console.error('Error fetching invitation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    try {
      setAccepting(true);
      const response = await invitationService.acceptInvitation(code);
      setResult(response.data);
      
      // Show success message based on status
      if (response.data.status === 'already_member') {
        alert('You are already a member of this group!');
      } else if (response.data.status === 'pending_approval') {
        alert('Join request submitted! Waiting for admin approval.');
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation');
      console.error('Error accepting invitation:', err);
    } finally {
      setAccepting(false);
    }
  };

  const handleLoginRedirect = () => {
    // Redirect to login with return URL
    navigate('/login', { 
      state: { 
        returnUrl: `/invite/${code}`,
        message: 'Please login to accept this group invitation'
      } 
    });
  };

  const handleRegisterRedirect = () => {
    // Redirect to registration with invitation data
    navigate('/register', {
      state: {
        invitationCode: code,
        phone: invitation?.invitedPhone,
        returnUrl: `/invite/${code}`
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-600 mx-auto mb-4"></div>
          <p className="text-warm-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-warm-900 mb-2">Invitation Error</h1>
          <p className="text-warm-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-trust-500 hover:bg-trust-600 text-white py-3 rounded-lg transition-colors"
            >
              Go Home
            </button>
            <Link
              to="/groups"
              className="block w-full bg-transparent border border-warm-300 text-warm-700 hover:bg-warm-50 py-3 rounded-lg transition-colors"
            >
              Browse Groups
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          {result.status === 'already_member' ? (
            <>
              <CheckCircle className="h-16 w-16 text-success-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-warm-900 mb-2">Already a Member</h1>
              <p className="text-warm-600 mb-4">
                You're already a member of <strong>{invitation.groupId.name}</strong>
              </p>
            </>
          ) : (
            <>
              <Clock className="h-16 w-16 text-warning-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-warm-900 mb-2">Request Submitted</h1>
              <p className="text-warm-600 mb-4">
                Your request to join <strong>{invitation.groupId.name}</strong> has been sent to the group admin for approval.
              </p>
              <p className="text-warm-500 text-sm mb-6">
                You'll be notified once the admin reviews your request.
              </p>
            </>
          )}
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-trust-500 hover:bg-trust-600 text-white py-3 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
            {result.groupId && (
              <button
                onClick={() => navigate(`/groups/${result.groupId}`)}
                className="w-full bg-transparent border border-warm-300 text-warm-700 hover:bg-warm-50 py-3 rounded-lg transition-colors"
              >
                View Group
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-warm-200 max-w-md w-full">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="h-16 w-16 rounded-full bg-trust-100 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-trust-600" />
            </div>
            <h1 className="text-2xl font-bold text-warm-900 mb-2">Group Invitation</h1>
            <p className="text-warm-600">
              You've been invited to join a savings group
            </p>
          </div>

          {/* Invitation Details */}
          <div className="bg-warm-50 rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-trust-600 mb-1">
                {invitation.groupId.name}
              </h2>
              <p className="text-warm-600 text-sm">
                {invitation.groupId.description}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-warm-500">Invited by:</span>
                <span className="font-medium text-warm-900">
                  {invitation.invitedBy.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-500">Purpose:</span>
                <span className="font-medium text-warm-900">
                  {invitation.groupId.purpose || 'General savings'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-500">Invitation for:</span>
                <span className="font-medium text-warm-900">
                  {invitation.invitedName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-500">Expires:</span>
                <span className="font-medium text-warm-900">
                  {new Date(invitation.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Section */}
          {!user ? (
            // Not logged in - show login/register options
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-warm-600 mb-4">
                  Please login or register to accept this invitation
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleLoginRedirect}
                  className="w-full bg-trust-500 hover:bg-trust-600 text-white py-3 rounded-lg transition-colors"
                >
                  Login to Accept
                </button>
                <button
                  onClick={handleRegisterRedirect}
                  className="w-full bg-transparent border border-warm-300 text-warm-700 hover:bg-warm-50 py-3 rounded-lg transition-colors"
                >
                  Create Account
                </button>
              </div>
            </div>
          ) : (
            // Logged in - show accept button
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-warm-600">
                <UserCheck className="h-4 w-4" />
                <span>Logged in as {user.name}</span>
              </div>
              
              <button
                onClick={handleAcceptInvitation}
                disabled={accepting}
                className="w-full bg-success-500 hover:bg-success-600 disabled:bg-success-300 text-white py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {accepting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Accept Invitation</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-warm-500 text-xs">
                  <Shield className="h-3 w-3 inline mr-1" />
                  Your request will be sent to the group admin for approval
                </p>
              </div>
            </div>
          )}

          {/* Footer Links */}
          <div className="mt-6 pt-6 border-t border-warm-200 text-center">
            <Link
              to="/"
              className="text-warm-600 hover:text-warm-900 text-sm flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to TrustSave</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationAccept;