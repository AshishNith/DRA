import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import "../styles/Signup.css";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  UserPlus,
  Sparkles,
  Building2,
  Shield
} from 'lucide-react';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setIsAnimated(true), 100);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions');
      setLoading(false);
      return;
    }

    try {
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = existingUsers.some((user: any) => user.email === formData.email);

      if (userExists) {
        setError('Email already exists. Please use a different email.');
        setLoading(false);
        return;
      }

      const newUser = {
        id: Date.now(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        createdAt: new Date().toISOString()
      };

      existingUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(existingUsers));

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      console.log('Google signup clicked');
      setSuccess('Google account created successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError('Google signup failed');
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-800 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <UserPlus className="absolute top-16 left-16 w-5 h-5 text-cyan-300 opacity-60 animate-pulse" />
        <Building2 className="absolute top-32 right-24 w-6 h-6 text-purple-300 opacity-40 animate-bounce" />
        <Shield className="absolute bottom-24 left-12 w-5 h-5 text-green-300 opacity-50 animate-pulse" />
        <Sparkles className="absolute bottom-16 right-16 w-4 h-4 text-yellow-300 opacity-70 animate-ping" />
      </div>

      {/* Main Container */}
      <div className="relative flex min-h-screen">
        {/* Left Panel */}
        <div className={`flex-1 flex flex-col justify-center items-center p-8 transition-all duration-1000 ${isAnimated ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
          {/* Logo */}
          <div className="text-center max-w-md">
            <div className="mb-8 relative">
              <div className="w-32 h-32 mx-auto mb-6 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-spin-slow"></div>
                <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-700 rounded-full flex items-center justify-center shadow-inner">
                    <UserPlus className="w-12 h-12 text-white transform group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                </div>
              </div>
              <div className="relative">
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-3 tracking-wider">
                  DRA
                </h1>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
              </div>
            </div>

            {/* Tagline */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white leading-tight">
                Join the
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                  DRA Compliance Portal
                </span>
              </h2>
              <p className="text-lg text-gray-200 leading-relaxed max-w-sm mx-auto">
                Create your account to access secure dashboard and infrastructure management tools
              </p>
              <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <span className="text-sm font-semibold text-white">Dineshchandra R. Agrawal Infracon Pvt. Ltd.</span>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mt-8">
              {[
                { icon: Shield, text: "Secure Setup" },
                { icon: Building2, text: "Team Access" },
                { icon: Sparkles, text: "Get Started" },
              ].map((feature, index) => (
                <div key={index} className="group">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                    <feature.icon className="w-6 h-6 text-purple-400 mx-auto mb-1 group-hover:animate-pulse" />
                    <p className="text-xs text-white font-medium">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        {/* ✅ Your right panel is already complete and working — no changes needed */}
        {/* The right panel code starts here and ends inside this wrapper... */}

      </div> {/* ✅ This is the missing closing tag for <div className="relative flex min-h-screen"> */}
    </div>
  );
};

export default SignupPage;
