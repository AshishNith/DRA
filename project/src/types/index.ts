export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Initiative {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
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

export interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  dueDate: string;
  assignedTo: string;
  createdAt: string;
}