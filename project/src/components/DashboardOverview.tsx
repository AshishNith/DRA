import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { 
  Shield, 
  Users, 
  Eye, 
  TrendingUp, 
  MapPin, 
  BarChart3, 
  Download, 
  Clock,
  AlertTriangle
} from 'lucide-react';

interface DashboardOverviewProps {
  onSectionChange: (section: string) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onSectionChange }) => {
  const { isAdmin } = useAuth();

  const adminCards = [
    {
      id: 'compliance',
      title: 'Compliance Master',
      description: 'View and manage Compliance Master',
      icon: Shield,
      color: 'bg-teal-500',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
    },
    {
      id: 'manage-users',
      title: 'Manage Users',
      description: 'View and manage system users',
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      id: 'show-users',
      title: 'Show All Users',
      description: 'View the list of all registered users',
      icon: Eye,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      id: 'progress',
      title: 'Progress Overview',
      description: 'View initiative progress in charts',
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      id: 'locations',
      title: 'Add Work Location',
      description: 'Add new work locations here',
      icon: MapPin,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      id: 'graph',
      title: 'Graph',
      description: 'Visualize number of entries per location.',
      icon: BarChart3,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
    },
    {
      id: 'download',
      title: 'Download Details',
      description: 'Export all work location details to Excel',
      icon: Download,
      color: 'bg-cyan-500',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
    },
    {
      id: 'future',
      title: 'Future Feature',
      description: 'This area is reserved for upcoming projects',
      icon: Clock,
      color: 'bg-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
    },
  ];

  const userCards = [
    {
      id: 'initiatives',
      title: 'My Initiatives',
      description: 'View and manage your initiatives',
      icon: Shield,
      color: 'bg-teal-500',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
    },
    {
      id: 'progress',
      title: 'Progress Overview',
      description: 'View your initiative progress',
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
  ];

  const cards = isAdmin ? adminCards : userCards;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Modern Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onSectionChange(card.id)}
              className="group relative bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-gray-100 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              {/* Background Gradient */}
              <div className={`absolute top-0 right-0 w-16 h-16 lg:w-20 lg:h-20 ${card.bgColor} rounded-full -translate-y-8 translate-x-8 opacity-50 group-hover:scale-110 transition-transform duration-300`}></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3 lg:mb-4">
                  <div className={`${card.color} p-2 lg:p-3 rounded-lg lg:rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                
                <div className="space-y-1 lg:space-y-2">
                  <h3 className="font-semibold text-gray-900 text-sm lg:text-base group-hover:text-gray-700 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>
                
                {/* Action Indicator */}
                <div className="mt-3 lg:mt-4 flex items-center text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                  <span>Click to access</span>
                  <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Expiry Reminders Section */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl lg:rounded-2xl p-4 lg:p-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-20 h-20 lg:w-24 lg:h-24 bg-red-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
        
        <div className="relative z-10 flex items-start space-x-3 lg:space-x-4">
          <div className="bg-red-100 p-2 lg:p-3 rounded-lg lg:rounded-xl">
            <AlertTriangle className="h-5 w-5 lg:h-6 lg:w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-800 mb-1 lg:mb-2 text-sm lg:text-base">
              Expiry Reminders
            </h3>
            <p className="text-red-700 text-xs lg:text-sm">
              No upcoming expires within 30 days.
            </p>
            <div className="mt-2 lg:mt-3 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-red-600">All compliance items are up to date</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { label: "Active Projects", value: "24", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pending Reviews", value: "8", color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Completed Tasks", value: "156", color: "text-green-600", bg: "bg-green-50" },
          { label: "Team Members", value: "12", color: "text-purple-600", bg: "bg-purple-50" }
        ].map((stat, index) => (
          <div key={index} className={`${stat.bg} rounded-lg lg:rounded-xl p-3 lg:p-4 text-center`}>
            <div className={`text-lg lg:text-2xl font-bold ${stat.color} mb-1`}>
              {stat.value}
            </div>
            <div className="text-xs lg:text-sm text-gray-600">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardOverview;