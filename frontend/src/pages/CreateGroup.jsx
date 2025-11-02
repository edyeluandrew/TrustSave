import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CreateGroup = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purpose: '',
    meetingSchedule: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Creating group with data:', formData);
      
      const response = await api.post('/groups', {
        name: formData.name,
        description: formData.description,
        purpose: formData.purpose,
        meetingSchedule: formData.meetingSchedule
      });

      console.log('Group created successfully:', response.data);
      
      // Redirect to groups dashboard
      navigate('/groups');
    } catch (err) {
      console.error('Error creating group:', err);
      console.error('Error response:', err.response);
      
      // More detailed error message
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Failed to create group. Please try again.';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-warm-900">Create Savings Group</h1>
          <p className="text-warm-600 mt-2">
            Start a new flexible savings group with your community
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="alert-error mb-6">
              <svg className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Group Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-warm-700 mb-2">
                Group Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="input-primary"
                placeholder="e.g., Family Savings, Business Fund"
              />
            </div>

            {/* Group Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-warm-700 mb-2">
                Group Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="input-primary"
                placeholder="What is this group for? e.g., School fees, Business capital, Emergency fund"
              />
            </div>

            {/* Savings Purpose */}
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-warm-700 mb-2">
                Savings Purpose
              </label>
              <input
                type="text"
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="input-primary"
                placeholder="e.g., School fees, Business capital, Emergency fund"
              />
            </div>

            {/* Meeting Schedule */}
            <div>
              <label htmlFor="meetingSchedule" className="block text-sm font-medium text-warm-700 mb-2">
                Meeting Schedule (Optional)
              </label>
              <input
                type="text"
                id="meetingSchedule"
                name="meetingSchedule"
                value={formData.meetingSchedule}
                onChange={handleChange}
                className="input-primary"
                placeholder="e.g., Every Saturday 2PM, Monthly first Sunday"
              />
            </div>

            {/* Contribution Rules Display */}
            <div className="bg-trust-50 border border-trust-200 rounded-xl p-4">
              <h3 className="font-semibold text-trust-900 mb-2">Contribution Rules</h3>
              <div className="text-sm text-trust-700 space-y-1">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-trust-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Minimum contribution: <strong>10,000 UGX</strong>
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-trust-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Contributions must be in multiples of: <strong>10,000 UGX</strong>
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-trust-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Members can contribute any amount they can afford
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Creating Group...
                  </div>
                ) : (
                  'Create Group'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;