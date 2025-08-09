import React, { useState, useEffect } from 'react';
import "../styles/Signup.css";
import { useAuth } from '../auth/AuthContext';
import { doSignInWithEmailAndPass, doSignInWithGoogle } from '../auth/auth';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Sparkles, Building2, Shield } from 'lucide-react';
import { apiService } from '../services/api';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    if (user) {
      navigate('/dashboard');
    }

    // Trigger animation
    setTimeout(() => setIsAnimated(true), 100);
  }, [navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await doSignInWithEmailAndPass(email, password);
      const user = userCredential.user;
      
      // Store user data in database
      await apiService.loginUser({
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        imageURL: user.photoURL || ''
      });

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const userCredential = await doSignInWithGoogle();
      const user = userCredential.user;
      
      // Store user data in database
      await apiService.loginUser({
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        imageURL: user.photoURL || ''
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Sparkles className="absolute top-16 left-16 w-5 h-5 text-yellow-300 opacity-60 animate-pulse" />
        <Building2 className="absolute top-32 right-24 w-6 h-6 text-blue-300 opacity-40 animate-bounce" />
        <Shield className="absolute bottom-24 left-12 w-5 h-5 text-green-300 opacity-50 animate-pulse" />
        <Sparkles className="absolute bottom-16 right-16 w-4 h-4 text-purple-300 opacity-70 animate-ping" />
      </div>

      {/* Main Container */}
      <div className="relative flex min-h-screen">
        {/* Left Panel */}
        <div className={`flex-1 flex flex-col justify-center items-center p-8 transition-all duration-1000 ${isAnimated ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
          <div className="text-center max-w-md">
            {/* Logo with Animation */}
            <div className="mb-8 relative">
              <div className="w-32 h-32 mx-auto mb-6 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-spin-slow"></div>
                <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-300 p-2">
                  <img 
                    src="https://draipl.com/images/logo.png" 
                    alt="DRA Logo"
                    className="w-20 h-20 object-contain transform group-hover:rotate-12 transition-transform duration-300"
                  />
                </div>
              </div>
              <div className="relative">
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-3 tracking-wider">
                  DRA
                </h1>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full"></div>
              </div>
            </div>

            {/* Tagline */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white leading-tight">
                Welcome to
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                  DRA Compliance Portal
                </span>
              </h2>
              <p className="text-lg text-gray-200 leading-relaxed max-w-sm mx-auto">
                Access your secure dashboard and stay connected with ongoing infrastructure initiatives
              </p>
              <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <span className="text-sm font-semibold text-white">Dineshchandra R. Agrawal Infracon Pvt. Ltd.</span>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-3 gap-3 mt-8">
              {[
                { icon: Shield, text: "Secure Access" },
                { icon: Building2, text: "Infrastructure" },
                { icon: Sparkles, text: "Innovation" }
              ].map((feature, index) => (
                <div key={index} className="group">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                    <feature.icon className="w-6 h-6 text-cyan-400 mx-auto mb-1 group-hover:animate-pulse" />
                    <p className="text-xs text-white font-medium">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className={`flex-1 flex flex-col justify-center p-8 transition-all duration-1000 ${isAnimated ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
          <div className="max-w-md w-full mx-auto">
            {/* Form Title */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-extrabold text-white leading-tight">
                Welcome Back
              </h2>
              <p className="text-lg text-gray-200 mt-2">
                Sign in to your account
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4">
                <p className="text-red-500 text-sm font-medium flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300 text-white placeholder-gray-300"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300 text-white placeholder-gray-300"
                    placeholder="Enter your password"
                    required
                  />
                  <div
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-white" />
                    ) : (
                      <Eye className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-400 border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
                  />
                  <label className="ml-2 text-sm text-gray-200">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm text-blue-400 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-500 transition-all duration-300 flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v16a8 8 0 01-8-8z"
                    ></path>
                  </svg>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 border-t border-white/20">
              <p className="text-center text-sm text-gray-400">
                Or sign in with
              </p>
            </div>

            {/* Social Login & Signup Link */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleGoogleLogin}
                className="flex items-center justify-center py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v16a8 8 0 01-8-8z"
                    ></path>
                  </svg>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2 " viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <p className="text-sm font-semibold text-white">Sign In with Google</p>
                  </>
                )}
              </button>
              <Link
                to="/signup"
                className="flex items-center justify-center py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 text-center"
              >
                <span className="text-sm font-semibold text-white">
                  Don't have an account? Sign up
                </span>
              </Link>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;