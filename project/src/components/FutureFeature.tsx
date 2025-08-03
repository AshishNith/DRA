import React from 'react';
import { Clock, Lightbulb, Rocket, Star, Zap } from 'lucide-react';

const FutureFeature: React.FC = () => {
  const upcomingFeatures = [
    {
      title: 'Advanced Analytics',
      description: 'Comprehensive reporting and analytics dashboard with custom metrics',
      icon: Star,
      status: 'Planning',
      priority: 'High',
      eta: 'Q2 2024',
    },
    {
      title: 'Mobile Application',
      description: 'Native mobile app for iOS and Android with offline capabilities',
      icon: Rocket,
      status: 'In Development',
      priority: 'Medium',
      eta: 'Q3 2024',
    },
    {
      title: 'AI-Powered Insights',
      description: 'Machine learning algorithms for predictive analytics and recommendations',
      icon: Zap,
      status: 'Research',
      priority: 'High',
      eta: 'Q4 2024',
    },
    {
      title: 'Integration Hub',
      description: 'Connect with popular third-party tools and services',
      icon: Lightbulb,
      status: 'Planning',
      priority: 'Medium',
      eta: 'Q1 2025',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Development': return 'bg-blue-100 text-blue-800';
      case 'Planning': return 'bg-yellow-100 text-yellow-800';
      case 'Research': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Clock className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Future Features</h2>
      </div>

      {/* Hero Section */}
      <div className="card p-8 text-center bg-gradient-to-r from-blue-50 to-purple-50">
        <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Exciting Features Coming Soon</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We're constantly working to improve your experience. Here's a preview of the amazing features 
          we're developing for future releases.
        </p>
      </div>

      {/* Upcoming Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {upcomingFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="card p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start space-x-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(feature.status)}`}>
                    {feature.status}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(feature.priority)}`}>
                    {feature.priority} Priority
                  </span>
                </div>
                <span className="text-sm text-gray-500 font-medium">ETA: {feature.eta}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Roadmap Timeline */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Development Roadmap</h3>
        <div className="space-y-4">
          {upcomingFeatures.map((feature, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
              <div className="flex-1 flex items-center justify-between py-2">
                <div>
                  <span className="font-medium text-gray-900">{feature.title}</span>
                  <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getStatusColor(feature.status)}`}>
                    {feature.status}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{feature.eta}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Section */}
      <div className="card p-6 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="text-center">
          <Lightbulb className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Have a Feature Request?</h3>
          <p className="text-gray-600 mb-4">
            We'd love to hear your ideas! Your feedback helps us prioritize and build features that matter most to you.
          </p>
          <button className="btn-primary">
            Submit Feature Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default FutureFeature;