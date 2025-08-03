import React from 'react';
import { useAuth } from '../contexts/AuthContext';
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onSectionChange(card.id)}
              className={`${card.bgColor} ${card.borderColor} border-l-4 p-6 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105`}
            >
              <div className="flex items-start space-x-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-600">{card.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expiry Reminders Section */}
      <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-500 mt-1" />
          <div>
            <h3 className="font-semibold text-red-800 mb-2">Expiry Reminders</h3>
            <p className="text-red-700">No upcoming expires within 30 days.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;