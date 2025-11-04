import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function InvitationAccept() {
  const { invitationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [group, setGroup] = useState(null);
  const [invitedBy, setInvitedBy] = useState(null);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(false);

  // ============================================
  // STEP 1: Load invitation details (NO AUTH NEEDED)
  // ============================================
  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching invitation:', invitationId);

        // Call PUBLIC endpoint - no auth header needed
        const response = await fetch(`/api/invitations/${invitationId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        console.log('📨 Invitation response:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load invitation');
        }

        setInvitation(data.data.invitation);
        setGroup(data.data.group);
        setInvitedBy(data.data.invitedBy);
        setLoading(false);

      } catch (err) {
        console.error('❌ Error loading invitation:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (invitationId) {
      fetchInvitation();
    }
  }, [invitationId]);

  // ============================================
  // STEP 2: Accept invitation (AUTH REQUIRED)
  // ============================================
  const handleAccept = async () => {
    // Check if user is logged in
    if (!user) {
      localStorage.setItem('redirectAfterLogin', `/invite/${invitationId}`);
      toast.error('Please log in to accept this invitation');
      navigate('/login', { 
        state: { 
          message: 'Please log in to accept this invitation',
          returnUrl: `/invite/${invitationId}`
        } 
      });
      return;
    }

    try {
      setAccepting(true);
      setError(null);

      console.log('✅ Accepting invitation:', invitationId);

      // 🔧 FIX: Remove /api prefix since api service already has baseURL='/api'
      const response = await api.post(`/invitations/${invitationId}/accept`);

      if (response.data.success) {
        console.log('🎉 Invitation accepted!');
        toast.success('Successfully joined the group!');
        // Redirect to group details
        setTimeout(() => {
          navigate(`/groups/${response.data.data.group._id}`);
        }, 1000);
      }

    } catch (err) {
      console.error('❌ Error accepting invitation:', err);
      const errorMsg = err.response?.data?.error || 'Failed to accept invitation';
      setError(errorMsg);
      toast.error(errorMsg);
      setAccepting(false);
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go Home
            </button>
            <button
              onClick={() => navigate('/groups')}
              className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Browse Groups
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // ALREADY ACCEPTED STATE
  // ============================================
  if (invitation?.status === 'accepted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Accepted</h2>
          <p className="text-gray-600 mb-6">This invitation has already been accepted.</p>
          <button
            onClick={() => navigate('/groups')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            View My Groups
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // EXPIRED/FAILED STATE
  // ============================================
  if (invitation?.status === 'expired' || invitation?.status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Expired</h2>
          <p className="text-gray-600 mb-6">
            This invitation is no longer valid. Please contact the group admin for a new invitation.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN INVITATION SCREEN
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          You're Invited!
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Join this savings group
        </p>

        {/* Group Info */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{group?.name}</h3>
          {group?.description && (
            <p className="text-gray-600 mb-4">{group.description}</p>
          )}
          
          <div className="space-y-2">
            {invitedBy && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Invited by: {invitedBy.name}
              </div>
            )}
            {group?.purpose && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Purpose: {group.purpose}
              </div>
            )}
            {invitation?.name && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                For: {invitation.name}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {accepting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Accepting...
              </>
            ) : user ? (
              'Accept Invitation'
            ) : (
              'Log In to Accept'
            )}
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-white text-gray-700 py-3 rounded-lg font-semibold border-2 border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Decline
          </button>
        </div>

        {/* Login Prompt for Non-Authenticated Users */}
        {!user && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register', { 
                  state: { returnUrl: `/invite/${invitationId}` }
                })}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Sign up here
              </button>
            </p>
          </div>
        )}

        {/* User Info if Logged In */}
        {user && (
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Logged in as {user.name}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}