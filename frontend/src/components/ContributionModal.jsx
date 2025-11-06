import React, { useState, useEffect } from 'react';
import { contributionService } from '../services/contributionService.jsx';
import { X, Wallet, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';

// Import the logos - update the file extensions if needed
import mtnLogo from '../assets/images/mtn-logo.png';
import airtelLogo from '../assets/images/airtel-logo.png';

const ContributionModal = ({ groupId, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    mobileMoneyProvider: 'mtn',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneValidation, setPhoneValidation] = useState({
    isValid: false,
    message: '',
    type: '' // 'valid', 'invalid', 'empty'
  });

  // Phone number validation rules for Ugandan numbers
  const phoneValidators = {
    mtn: {
      prefixes: ['077', '078', '076', '079'],
      pattern: /^(077|078|076|079)\d{7}$/,
      example: '0772123456',
      message: 'MTN numbers must start with 077, 078, 076, or 079 and be 10 digits'
    },
    airtel: {
      prefixes: ['075', '074', '070'],
      pattern: /^(075|074|070)\d{7}$/,
      example: '0752123456',
      message: 'Airtel numbers must start with 075, 074, or 070 and be 10 digits'
    }
  };

  // Validate phone number when it changes
  useEffect(() => {
    validatePhoneNumber(formData.phoneNumber, formData.mobileMoneyProvider);
  }, [formData.phoneNumber, formData.mobileMoneyProvider]);

  const validatePhoneNumber = (phoneNumber, provider) => {
    const validator = phoneValidators[provider];
    
    if (!phoneNumber.trim()) {
      setPhoneValidation({
        isValid: false,
        message: '',
        type: 'empty'
      });
      return;
    }

    // Remove any spaces, dashes, or other characters
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    // Check if it's a valid Ugandan number (10 digits starting with 07)
    if (!/^07\d{8}$/.test(cleanPhone)) {
      setPhoneValidation({
        isValid: false,
        message: 'Please enter a valid 10-digit Ugandan phone number (e.g., 0772123456)',
        type: 'invalid'
      });
      return;
    }

    // Check if it matches the selected provider's prefixes
    const isValidPrefix = validator.prefixes.some(prefix => cleanPhone.startsWith(prefix));
    
    if (!isValidPrefix) {
      const expectedPrefixes = validator.prefixes.join(', ');
      const currentPrefix = cleanPhone.substring(0, 3);
      
      setPhoneValidation({
        isValid: false,
        message: `This appears to be a ${getProviderByPrefix(currentPrefix)} number. Please use ${expectedPrefixes} for ${provider.toUpperCase()}.`,
        type: 'invalid'
      });
      return;
    }

    // Valid number
    setPhoneValidation({
      isValid: true,
      message: `Valid ${provider.toUpperCase()} number`,
      type: 'valid'
    });
  };

  // Helper function to detect provider by prefix
  const getProviderByPrefix = (prefix) => {
    if (['077', '078', '076', '079'].includes(prefix)) return 'MTN';
    if (['075', '074', '070'].includes(prefix)) return 'Airtel';
    return 'unknown';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Final validation before submission
    if (!phoneValidation.isValid && formData.phoneNumber.trim()) {
      setError('Please fix the phone number validation errors before submitting.');
      setLoading(false);
      return;
    }

    if (!formData.phoneNumber.trim()) {
      setError('Please enter your phone number.');
      setLoading(false);
      return;
    }

    try {
      const contributionData = {
        groupId,
        amount: parseFloat(formData.amount),
        mobileMoneyProvider: formData.mobileMoneyProvider,
        phoneNumber: formData.phoneNumber.replace(/\D/g, '') // Clean the phone number
      };

      console.log('Sending contribution data:', contributionData);

      const result = await contributionService.initiateContribution(contributionData);
      onSuccess(result);
      onClose();
      
      // Reset form
      setFormData({
        amount: '',
        mobileMoneyProvider: 'mtn',
        phoneNumber: ''
      });
      setPhoneValidation({
        isValid: false,
        message: '',
        type: 'empty'
      });
    } catch (err) {
      console.error('Contribution error:', err);
      setError(err.response?.data?.message || 'Failed to initiate contribution');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phoneNumber') {
      // Auto-format: allow only digits and limit to 10 characters
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: digitsOnly
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProviderChange = (provider) => {
    setFormData(prev => ({
      ...prev,
      mobileMoneyProvider: provider,
      phoneNumber: '' // Clear phone number when provider changes
    }));
    setPhoneValidation({
      isValid: false,
      message: '',
      type: 'empty'
    });
  };

  // Get validation styles based on state
  const getValidationStyles = () => {
    switch (phoneValidation.type) {
      case 'valid':
        return {
          borderColor: 'border-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          icon: <CheckCircle className="h-4 w-4 text-green-500" />
        };
      case 'invalid':
        return {
          borderColor: 'border-red-500',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          icon: <AlertCircle className="h-4 w-4 text-red-500" />
        };
      default:
        return {
          borderColor: 'border-gray-300',
          textColor: 'text-gray-500',
          bgColor: 'bg-white',
          icon: null
        };
    }
  };

  const validationStyles = getValidationStyles();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-trust-600" />
            <span>Make Contribution</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-warm-100 rounded transition-colors"
          >
            <X className="h-5 w-5 text-warm-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (UGX)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="1000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500 focus:border-transparent"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mobile Money Provider
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* MTN Option with Logo */}
              <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.mobileMoneyProvider === 'mtn' 
                  ? 'border-yellow-500 bg-yellow-50 shadow-sm' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="mobileMoneyProvider"
                  value="mtn"
                  checked={formData.mobileMoneyProvider === 'mtn'}
                  onChange={(e) => handleProviderChange('mtn')}
                  className="sr-only"
                />
                <div className="w-16 h-10 mb-2 flex items-center justify-center">
                  <img 
                    src={mtnLogo} 
                    alt="MTN Mobile Money" 
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 text-center">MTN Mobile Money</span>
                {formData.mobileMoneyProvider === 'mtn' && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                )}
              </label>

              {/* Airtel Option with Logo */}
              <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.mobileMoneyProvider === 'airtel' 
                  ? 'border-red-500 bg-red-50 shadow-sm' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="mobileMoneyProvider"
                  value="airtel"
                  checked={formData.mobileMoneyProvider === 'airtel'}
                  onChange={(e) => handleProviderChange('airtel')}
                  className="sr-only"
                />
                <div className="w-16 h-10 mb-2 flex items-center justify-center">
                  <img 
                    src={airtelLogo} 
                    alt="Airtel Money" 
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 text-center">Airtel Money</span>
                {formData.mobileMoneyProvider === 'airtel' && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className={`w-full pl-10 pr-10 py-3 border ${validationStyles.borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-colors`}
                placeholder={phoneValidators[formData.mobileMoneyProvider].example}
                maxLength={10}
              />
              {validationStyles.icon && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validationStyles.icon}
                </div>
              )}
            </div>
            
            {/* Validation Message */}
            {phoneValidation.message && (
              <div className={`mt-2 p-2 rounded-lg text-sm ${validationStyles.bgColor} ${validationStyles.textColor} flex items-center space-x-2`}>
                {validationStyles.icon}
                <span>{phoneValidation.message}</span>
              </div>
            )}
            
            {/* Helper Text */}
            {!phoneValidation.message && (
              <p className="text-xs text-gray-500 mt-1">
                Enter your {formData.mobileMoneyProvider.toUpperCase()} number starting with {phoneValidators[formData.mobileMoneyProvider].prefixes.join(', ')}
              </p>
            )}
          </div>

          {/* Provider-specific instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-700 text-sm">
              <strong>Instructions:</strong> You will receive a {formData.mobileMoneyProvider === 'mtn' ? 'MTN Mobile Money' : 'Airtel Money'} prompt on your phone to complete the payment.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (formData.phoneNumber && !phoneValidation.isValid)}
              className="px-6 py-3 text-sm font-medium text-white bg-trust-600 rounded-lg hover:bg-trust-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  <span>Contribute</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContributionModal;