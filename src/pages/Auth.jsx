import React, { useState } from 'react';
import { supabase } from '../../supabaseClient.js';
import { Eye, EyeOff, Loader2, Sprout, Users, MapPin } from 'lucide-react';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState('distributor'); // Default to consumer
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_role: userRole,
              display_name: email.split('@')[0], // Use email prefix as display name
            }
          }
        });

        if (error) throw error;

        if (data.user && !data.session) {
          setMessage('Check your email for verification link!');
          setMessageType('success');
        } else if (data.session) {
          setMessage('Account created successfully!');
          setMessageType('success');
          
          // Get user role and redirect accordingly
          const role = data.user.user_metadata?.user_role || 'distributor';
          if (role === 'farmer') {
            window.location.href = '/farmer-dashboard';
          } else if (role === 'distributor') {
            window.location.href = '/distributor-dashboard';
          } else if (role === 'equipment_seller') {
            window.location.href = '/equipment-seller-dashboard';
          } else {
            // Default to distributor dashboard for any other role
            window.location.href = '/distributor-dashboard';
          }
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          setMessage('Signed in successfully!');
          setMessageType('success');
          
          // Get user role and redirect accordingly
          const role = data.user.user_metadata?.user_role || 'distributor';
          if (role === 'farmer') {
            window.location.href = '/farmer-dashboard';
          } else if (role === 'equipment_seller') {
            window.location.href = '/equipment-seller-dashboard';
          } else {
            // Default to distributor dashboard for any other role
            window.location.href = '/distributor-dashboard';
          }
        }
      }
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };



  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setMessage('');
    setEmail('');
    setPassword('');
    setUserRole('distributor'); // Reset to default role
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0F7FA] via-[#E0F7FA] to-[#B2EBF2] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#0097A7] opacity-5 rounded-full blur-xl"></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 bg-[#FF5722] opacity-5 rounded-full blur-xl"></div>
        </div>

        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0097A7] to-[#00BCD4] rounded-2xl flex items-center justify-center shadow-lg">
                  <Sprout className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#FF5722] rounded-full flex items-center justify-center">
                  <Users className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-[#212121] mb-2">
                {isSignUp ? 'Join FarmSwipe' : 'Welcome Back'}
              </h1>
              <p className="text-[#212121]/70 text-sm leading-relaxed">
                {isSignUp 
                  ? 'Join as a farmer, distributor, equipment seller, or consumer to be part of the agricultural ecosystem' 
                  : 'Sign in to continue exploring fresh connections'
                }
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="flex justify-center space-x-6 pt-2">
              <div className="flex items-center space-x-1 text-xs text-[#212121]/60">
                <MapPin className="w-3 h-3 text-[#0097A7]" />
                <span>Local</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-[#212121]/60">
                <Sprout className="w-3 h-3 text-[#0097A7]" />
                <span>Fresh</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-[#212121]/60">
                <Users className="w-3 h-3 text-[#0097A7]" />
                <span>Direct</span>
              </div>
            </div>
          </div>

          {/* Auth Form */}
          <div className="space-y-6">{/* Form functionality handled by handleAuth */}
            <div className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-[#212121]">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-[#0097A7]/20 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0097A7] focus:border-transparent transition-all duration-200 text-[#212121] placeholder-[#212121]/50"
                  placeholder="farmer@example.com"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-[#212121]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-white/50 border border-[#0097A7]/20 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0097A7] focus:border-transparent transition-all duration-200 text-[#212121] placeholder-[#212121]/50"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-[#0097A7]/5 rounded-r-xl transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-[#212121]/60 hover:text-[#0097A7]" />
                    ) : (
                      <Eye className="h-5 w-5 text-[#212121]/60 hover:text-[#0097A7]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Role Selection - Only show during signup */}
              {isSignUp && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#212121]">
                    I am a...
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setUserRole('farmer')}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                        userRole === 'farmer'
                          ? 'border-[#0097A7] bg-[#0097A7]/10 text-[#0097A7]'
                          : 'border-[#0097A7]/20 bg-white/50 text-[#212121]/70 hover:border-[#0097A7]/40'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <Sprout className="w-5 h-5" />
                        <span className="text-sm font-medium">Farmer</span>
                        <span className="text-xs opacity-75">Sell your produce</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUserRole('distributor')}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                        userRole === 'distributor'
                          ? 'border-[#0097A7] bg-[#0097A7]/10 text-[#0097A7]'
                          : 'border-[#0097A7]/20 bg-white/50 text-[#212121]/70 hover:border-[#0097A7]/40'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <Users className="w-5 h-5" />
                        <span className="text-sm font-medium">Distributor</span>
                        <span className="text-xs opacity-75">Buy & distribute crops</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUserRole('equipment_seller')}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                        userRole === 'equipment_seller'
                          ? 'border-[#0097A7] bg-[#0097A7]/10 text-[#0097A7]'
                          : 'border-[#0097A7]/20 bg-white/50 text-[#212121]/70 hover:border-[#0097A7]/40'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <Sprout className="w-5 h-5" />
                        <span className="text-sm font-medium">Equipment Seller</span>
                        <span className="text-xs opacity-75">Sell farming tools</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-xl text-sm font-medium border ${
                messageType === 'error' 
                  ? 'bg-red-50 text-red-700 border-red-200' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              } transition-all duration-200`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleAuth}
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-6 bg-gradient-to-r from-[#0097A7] to-[#00BCD4] hover:from-[#00838F] hover:to-[#0097A7] text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <div className="ml-2 w-2 h-2 bg-white/30 rounded-full"></div>
                </>
              )}
            </button>


          </div>

          {/* Toggle Mode */}
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={toggleMode}
              className="text-[#0097A7] hover:text-[#00838F] text-sm font-medium hover:underline transition-all duration-200"
            >
              {isSignUp 
                ? 'Already growing with us? Sign in →' 
                : "Ready to grow together? Sign up →"
              }
            </button>
          </div>

          {/* Navigation Links */}
          <div className="text-center border-t border-[#0097A7]/10 pt-6 space-y-3">
            <a
              href="/swipe"
              className="block text-[#0097A7] hover:text-[#00838F] text-sm font-medium hover:underline transition-all duration-200"
            >
              → Start Swiping
            </a>
            <a
              href="/"
              className="inline-flex items-center text-[#212121]/60 hover:text-[#0097A7] text-sm font-medium transition-colors duration-200 group"
            >
              <span className="mr-2 transform group-hover:-translate-x-1 transition-transform duration-200">←</span>
              Back to Home
            </a>
          </div>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="mt-6 flex justify-center space-x-8 text-xs text-[#212121]/50">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-[#FF5722] rounded-full"></div>
            <span>Secure</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-[#00BCD4] rounded-full"></div>
            <span>Trusted</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-[#0097A7] rounded-full"></div>
            <span>Local</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;