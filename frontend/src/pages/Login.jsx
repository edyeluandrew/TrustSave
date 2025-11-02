import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/logo.png';

const Login = () => {
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lampPulled, setLampPulled] = useState(false);

  const { login } = useAuth();
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
  setLampPulled(true); // Turn on the lamp

  try {
    await login(formData.phone, formData.password);
    navigate('/dashboard'); // Lamp stays on during redirect
  } catch (err) {
    setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    setLampPulled(false); // Only turn off lamp if login fails
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen gradient-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Lamp */}
      <div className="absolute top-8 right-8 z-10">
        <div className={`transition-transform duration-500 ${lampPulled ? 'translate-x-12' : ''}`}>
          {/* Lamp Cord */}
          <div className="relative">
            <svg width="120" height="200" className="absolute -top-4 left-8">
              <path
                d={lampPulled ? "M 60 0 Q 80 50 90 100 Q 95 150 90 200" : "M 60 0 L 60 200"}
                stroke="#8B7355"
                strokeWidth="2"
                fill="none"
                className="transition-all duration-500"
              />
            </svg>
          </div>
          
          {/* Lamp */}
          <div className={`relative transition-all duration-500 ${lampPulled ? 'rotate-12' : ''}`}>
            {/* Lamp Shade */}
            <div className={`w-20 h-16 rounded-b-full transition-colors duration-300 ${
              lampPulled ? 'bg-yellow-400' : 'bg-amber-600'
            }`} style={{
              clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
              boxShadow: lampPulled ? '0 0 30px rgba(251, 191, 36, 0.6)' : 'none'
            }}>
              {/* Light bulb glow when on */}
              {lampPulled && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-yellow-300 rounded-full animate-pulse" 
                       style={{ filter: 'blur(8px)' }}></div>
                </div>
              )}
            </div>
            
            {/* Light Bulb */}
            <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-8 rounded-full transition-colors duration-300 ${
              lampPulled ? 'bg-yellow-200' : 'bg-gray-300'
            }`}>
              <div className={`w-4 h-2 mx-auto mt-6 rounded transition-colors duration-300 ${
                lampPulled ? 'bg-gray-400' : 'bg-gray-500'
              }`}></div>
            </div>

            {/* Pull String */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <div className="w-0.5 h-8 bg-amber-900 mx-auto"></div>
              <div className="w-3 h-3 bg-amber-700 rounded-full mx-auto"></div>
            </div>
          </div>

          {/* Cute Character Hand */}
          {lampPulled && (
            <div className="absolute top-32 -right-8 animate-bounce">
              {/* Simple hand/paw */}
              <div className="relative">
                <div className="w-8 h-10 bg-orange-300 rounded-full"></div>
                <div className="absolute -bottom-2 left-0 flex gap-1">
                  <div className="w-2 h-3 bg-orange-300 rounded-full"></div>
                  <div className="w-2 h-3 bg-orange-300 rounded-full"></div>
                  <div className="w-2 h-3 bg-orange-300 rounded-full"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Light beam effect */}
        {lampPulled && (
          <div className="absolute top-16 left-10 w-32 h-64 opacity-20"
               style={{
                 background: 'linear-gradient(180deg, rgba(251, 191, 36, 0.4) 0%, transparent 100%)',
                 clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)',
                 animation: 'flicker 2s infinite'
               }}>
          </div>
        )}
      </div>

      <style>{`
        @keyframes flicker {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="mx-auto h-24 w-24 flex items-center justify-center">
            <img 
              src={logo} 
              alt="TrustSave Logo"
              className="h-32 w-32 object-contain"
            />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-warm-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-warm-600">
            Sign in to your TrustSave account
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card py-8 px-6 sm:px-10">
          {error && (
            <div className="alert-error mb-6">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-warm-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-primary pl-10"
                  placeholder="Enter your phone number"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-warm-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-primary pl-10"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-trust-500 focus:ring-trust-500 border-warm-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-warm-600">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-trust-500 hover:text-trust-600 transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign in to your account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-warm-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-warm-500 font-medium">
                  New to TrustSave?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="btn-secondary"
              >
                Create your TrustSave account
              </Link>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-4 text-warm-500 text-xs">
              <div className="flex items-center">
                <svg className="h-4 w-4 text-success-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Secure & Encrypted
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 text-success-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Trusted by Communities
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;