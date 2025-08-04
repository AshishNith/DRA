export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Initiative {
  _id: string;
  title: string;
  description: string;
  location: Location | string;
  category: 'Education' | 'Healthcare' | 'Environment' | 'Technology' | 'Community' | 'Other';
  status: 'Planning' | 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  startDate: string;
  endDate?: string;
  budget: number;
  participants: number;
  contactPerson?: {
    name: string;
    email: string;
    phone: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  initiatives?: Initiative[];
}

export interface ComplianceRequirement {
  _id?: string;
  title: string;
  description?: string;
  completed: boolean;
  completedDate?: string;
  assignedTo?: string;
}

export interface ComplianceAttachment {
  _id?: string;
  name: string;
  url: string;
  uploadDate: string;
}

export interface Compliance {
  _id: string;
  title: string;
  description: string;
  category: 'Environmental' | 'Safety' | 'Legal' | 'Financial' | 'Operational' | 'Other';
  status: 'Active' | 'Inactive' | 'Pending' | 'Expired';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  location?: Location | string;
  effectiveDate: string;
  expiryDate?: string;
  regulatoryBody?: string;
  documentNumber?: string;
  tags: string[];
  requirements: ComplianceRequirement[];
  attachments: ComplianceAttachment[];
  reminderDays: number;
  isActive: boolean;
  createdBy: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
  createdAt: string;
  updatedAt: string;
  daysUntilExpiry?: number;
  completionPercentage?: number;
}

export interface ComplianceStats {
  overview: {
    total: number;
    active: number;
    expired: number;
    expiring: number;
  };
  categoryStats: Array<{
    _id: string;
    count: number;
  }>;
  priorityStats: Array<{
    _id: string;
    count: number;
  }>;
}

export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalInitiatives: number;
    totalLocations: number;
    totalCompliance: number;
    activeInitiatives: number;
    completedInitiatives: number;
    pendingCompliance: number;
    overdueCompliance: number;
  };
  completionRates: {
    initiatives: number;
    compliance: number;
  };
  recentActivities?: Initiative[];
  locationStats?: Array<{
    id: string;
    name: string;
    initiativeCount: number;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  total: number;
}

// Legacy types for components that haven't been updated yet
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface WorkLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  employeeCount: number;
  createdAt: string;
}