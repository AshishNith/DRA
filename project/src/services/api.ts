const API_BASE_URL = 'http://localhost:5000/api';
// const API_BASE_URL = 'https://dra-fp3l.onrender.com/api';

export interface Initiative {
  _id?: string;
  title: string;
  description: string;
  location: string | Location;
  category: 'Environmental' | 'Safety' | 'Legal' | 'Financial' | 'Operational' | 'Education' | 'Healthcare' | 'Technology' | 'Community' | 'Other';
  status: 'Planning' | 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  startDate: string;
  endDate?: string;
  budget: number;
  participants: number;
  contactPerson: {
    name: string;
    email: string;
    phone: string;
  };
  isActive: boolean;
  typeOfPermission?: 'Consent to Establish' | 'Consent to Operate' | 'Insurance' | 'NOC' | 'NOC/Permission from client' | 'Permission' | 'blank' | 'Government Approval' | 'Environmental Permit' | 'Construction License' | 'Operational Permit' | 'Not Applicable';
  agency?: 'Chief Controller of Explosives' | 'DEIAA/SEIAA' | 'Factories Department' | 'Forest Department' | 'Government/Private' | 'Labour Department Authority' | 'MOEFCC' | 'State Pollution Control Board' | 'State Water Department' | 'The Food Safety and Standards Authority of India' | 'Ministry of Environment' | 'Municipal Corporation' | 'State Government' | 'Central Government' | 'Not Applicable';
  applicable?: 'Yes' | 'No';
  registrationInfo: {
    registered: 'Yes' | 'No';
    licenseNumber: string;
    validity: string;
    quantity: string;
    remarks: string;
  };
  complianceStatus?: 'Compliant' | 'Non-Compliant' | 'Pending Review' | 'In Progress';
  lastComplianceCheck?: string;
  nextComplianceReview?: string;
  // Add new tracking fields
  statusCounts?: {
    planning: number;
    active: number;
    completed: number;
    onHold: number;
    cancelled: number;
  };
  projectPhase?: 'Initial' | 'Design' | 'Execution' | 'Monitoring' | 'Closure';
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  complianceScore?: number;
  lastUpdated?: Date | string;
}

export interface Location {
  _id?: string;
  name: string;
  description: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isActive: boolean;
}

export interface User {
  _id?: string;
  uid: string;
  name: string;
  email: string;
  imageURL?: string;
  isActive: boolean;
  lastLogin: string;
  role: 'admin' | 'user' | 'manager';
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  constructor(private baseURL: string) {}

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Location APIs
  async getLocations(params?: { page?: number; limit?: number; search?: string; isActive?: boolean }): Promise<Location[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await this.request<any>(`/locations?${queryParams.toString()}`);
    // Handle both direct array and wrapped response formats
    return Array.isArray(response) ? response : (response?.data?.locations || response?.locations || []);
  }

  async createLocation(location: Omit<Location, '_id'>): Promise<Location> {
    const response = await this.request<any>('/locations', {
      method: 'POST',
      body: JSON.stringify(location),
    });
    return response?.data || response;
  }

  async updateLocation(id: string, location: Partial<Location>): Promise<Location> {
    const response = await this.request<any>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(location),
    });
    return response?.data || response;
  }

  async deleteLocation(id: string): Promise<void> {
    return this.request<void>(`/locations/${id}`, {
      method: 'DELETE',
    });
  }

  // Initiative APIs
  async getInitiatives(params?: { page?: number; limit?: number; location?: string; status?: string; category?: string; search?: string }): Promise<Initiative[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await this.request<any>(`/initiatives?${queryParams.toString()}`);
    // Handle both direct array and wrapped response formats
    return Array.isArray(response) ? response : (response?.data?.initiatives || response?.initiatives || []);
  }

  async createInitiative(initiative: Omit<Initiative, '_id'>): Promise<Initiative> {
    const response = await this.request<any>('/initiatives', {
      method: 'POST',
      body: JSON.stringify(initiative),
    });
    return response?.data || response;
  }

  async updateInitiative(id: string, initiative: Partial<Initiative>): Promise<Initiative> {
    const response = await this.request<any>(`/initiatives/${id}`, {
      method: 'PUT',
      body: JSON.stringify(initiative),
    });
    return response?.data || response;
  }

  async deleteInitiative(id: string): Promise<void> {
    return this.request<void>(`/initiatives/${id}`, {
      method: 'DELETE',
    });
  }

  // Compliance endpoints
  async getCompliance(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    priority?: string;
    location?: string;
    expiring?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/compliance?${queryParams.toString()}`);
  }

  async getComplianceById(id: string) {
    return this.request(`/compliance/${id}`);
  }

  async getComplianceByLocation(locationId: string) {
    return this.request(`/compliance/location/${locationId}`);
  }

  async getExpiringCompliance(days: number = 30) {
    return this.request(`/compliance/expiring/${days}`);
  }

  async createCompliance(data: any) {
    return this.request('/compliance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCompliance(id: string, data: any) {
    console.log(`Updating compliance ${id} with data:`, data);
    return this.request(`/compliance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateComplianceRequirement(complianceId: string, requirementId: string, data: any) {
    return this.request(`/compliance/${complianceId}/requirements/${requirementId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCompliance(id: string) {
    return this.request(`/compliance/${id}`, {
      method: 'DELETE',
    });
  }

  async getComplianceStats() {
    return this.request('/compliance/stats/overview');
  }

  // User APIs
  async loginUser(userData: { uid: string; name: string; email: string; imageURL?: string }): Promise<User> {
    const response = await this.request<any>('/users/login', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response?.data || response;
  }

  async getUsers(params?: { page?: number; limit?: number; search?: string; isActive?: boolean }): Promise<User[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await this.request<any>(`/users?${queryParams.toString()}`);
    return Array.isArray(response) ? response : (response?.data?.users || response?.users || []);
  }

  async getUserByUid(uid: string): Promise<User> {
    const response = await this.request<any>(`/users/${uid}`);
    return response?.data || response;
  }

  async updateUser(uid: string, userData: Partial<User>): Promise<User> {
    const response = await this.request<any>(`/users/${uid}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response?.data || response;
  }

  async deleteUser(uid: string): Promise<void> {
    return this.request<void>(`/users/${uid}`, {
      method: 'DELETE',
    });
  }

  async getUserStats() {
    return this.request('/users/stats/overview');
  }

  // Dashboard stats endpoint
  async getDashboardStats() {
    try {
      const [locationsData, initiativesData] = await Promise.all([
        this.getLocations({ limit: 1000 }),
        this.getInitiatives({ limit: 1000 })
      ]);

      const locations = Array.isArray(locationsData) ? locationsData : [];
      const initiatives = Array.isArray(initiativesData) ? initiativesData : [];

      const totalLocations = locations.length;
      const totalInitiatives = initiatives.length;
      const activeInitiatives = initiatives.filter((i: any) => i.status === 'Active').length;
      const completedInitiatives = initiatives.filter((i: any) => i.status === 'Completed').length;
      const planningInitiatives = initiatives.filter((i: any) => i.status === 'Planning').length;

      const initiativeCompletionRate = totalInitiatives > 0 
        ? Math.round((completedInitiatives / totalInitiatives) * 100) 
        : 0;

      // Calculate total budget
      const totalBudget = initiatives.reduce((sum: number, i: any) => sum + (i.budget || 0), 0);
      
      // Calculate growth (mock for now)
      const monthlyGrowth = totalInitiatives > 0 ? Math.round((activeInitiatives / totalInitiatives) * 100) : 0;

      return {
        success: true,
        data: {
          overview: {
            totalUsers: 25, // This would come from a users API if available
            totalInitiatives,
            totalLocations,
            totalCompliance: 15, // This would come from compliance API
            activeInitiatives,
            completedInitiatives,
            planningInitiatives,
            pendingCompliance: 5,
            overdueCompliance: 2,
            totalBudget,
            monthlyGrowth
          },
          completionRates: {
            initiatives: initiativeCompletionRate,
            compliance: 85,
          },
          recentActivities: initiatives.slice(0, 5),
          locationStats: locations.map((location: any) => ({
            id: location._id,
            name: location.name,
            initiativeCount: initiatives.filter((i: any) => 
              i.location?._id === location._id || i.location === location._id
            ).length
          }))
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
      };
    }
  }
}

export const apiService = new ApiService(API_BASE_URL);
// export type { ApiResponse };
