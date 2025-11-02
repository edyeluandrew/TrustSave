import React from 'react'
import { Link } from 'react-router-dom'

const Landing = () => {
  return (
    <div className="min-h-screen gradient-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo & Brand */}
        <div className="mx-auto h-20 w-20 rounded-full trust-gradient flex items-center justify-center mb-6 shadow-glow">
          <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-warm-900 mb-4">
          TrustSave
        </h1>
        <p className="text-xl text-warm-600 mb-2">
          Community Savings Made Simple
        </p>
        <p className="text-warm-500 mb-8 max-w-sm mx-auto">
          Digitize your savings groups, track contributions, and build financial trust together.
        </p>
        
        {/* Feature Highlights */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 card border border-white/20">
          <div className="grid grid-cols-1 gap-4 text-sm text-warm-700">
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Digital record keeping</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Secure & transparent</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Easy group management</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/register"
            className="btn-primary block text-base py-4"
          >
            Get Started - Create Account
          </Link>
          <Link
            to="/login"
            className="btn-secondary block text-base py-4"
          >
            Sign In to Your Account
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 pt-6 border-t border-warm-200/50">
          <div className="flex items-center justify-center space-x-6 text-warm-500 text-xs">
            <div className="flex items-center">
              <svg className="h-4 w-4 text-success-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Bank-level Security
            </div>
            <div className="flex items-center">
              <svg className="h-4 w-4 text-success-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Easy to Use
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing