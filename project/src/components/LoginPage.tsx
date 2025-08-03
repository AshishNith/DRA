import React, { useState, useEffect } from 'react';
import "../styles/Signup.css";
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Sparkles, Building2, Shield } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      navigate('/dashboard');
    }

    // Trigger animation
    setTimeout(() => setIsAnimated(true), 100);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = login(email, password);
      if (success) {
        // Save user data to localStorage
        localStorage.setItem('authToken', 'authenticated');
        localStorage.setItem('user', JSON.stringify({ email }));
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Google OAuth integration would go here
      console.log('Google login clicked');
      // For demo purposes, simulate successful Google login
      localStorage.setItem('authToken', 'authenticated');
      localStorage.setItem('user', JSON.stringify({ email: 'google-user@example.com', provider: 'google' }));
      navigate('/dashboard');
    } catch (err) {
      setError('Google login failed');
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

      <div className="relative flex min-h-screen">
        {/* Left Panel - Reduced */}
        <div className={`flex-1 flex flex-col justify-center items-center p-8 transition-all duration-1000 ${isAnimated ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
          <div className="text-center max-w-md">
            {/* Logo with Animation - Smaller */}
            <div className="mb-8 relative">
              <div className="w-32 h-32 mx-auto mb-6 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-spin-slow"></div>
                <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center shadow-inner">
                    <svg className="w-12 h-12 text-white transform group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="relative">
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-3 tracking-wider">
                  DRA
                </h1>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full"></div>
              </div>
            </div>

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

            {/* Feature Cards - Smaller */}
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

        {/* Right Panel - Reduced width and padding */}
        <div className={`w-[400px] bg-white/95 backdrop-blur-xl flex flex-col justify-center p-8 shadow-2xl border-l border-white/20 transition-all duration-1000 delay-300 ${isAnimated ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full animate-pulse"></div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                USER LOGIN
              </h3>
            </div>
            <div className="w-12 h-1 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full"></div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg flex items-center space-x-3 animate-shake">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700 font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-teal-500 transition-all duration-300 group-hover:border-gray-300 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400"
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-teal-500 transition-all duration-300 group-hover:border-gray-300 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400 pr-12"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center group cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${rememberMe ? 'bg-teal-500 border-teal-500' : 'border-gray-300 group-hover:border-gray-400'}`}>
                  {rememberMe && <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>}
                </div>
                <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-200">Remember Me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-teal-600 hover:text-teal-700 transition-colors duration-200 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-teal-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>LOGGING IN...</span>
                </div>
              ) : (
                'LOGIN'
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 font-medium">OR</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full mt-4 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Login with Google
            </button>
          </div>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">Don't have an account? </span>
            <Link to="/signup" className="text-sm text-teal-600 hover:text-teal-700 font-semibold transition-colors duration-200 hover:underline">
              Sign up here
            </Link>
          </div>

          {/* Demo Credentials Card - Smaller */}
          <div className="mt-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800 font-semibold mb-1 flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              Demo Credentials
            </p>
            <div className="text-xs text-blue-600 space-y-0.5">
              <p><strong>Admin:</strong> admin@company.com / password123</p>
              <p><strong>User:</strong> john@company.com / password123</p>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default LoginPage;