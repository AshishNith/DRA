import { User, Initiative, WorkLocation, ComplianceItem } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@company.com',
    role: 'user',
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane@company.com',
    role: 'user',
    createdAt: '2024-01-25',
  },
];

export const mockInitiatives: Initiative[] = [
  {
    id: '1',
    title: 'Customer Service Improvement',
    description: 'Implement new customer service protocols to improve satisfaction ratings',
    status: 'active',
    priority: 'high',
    createdBy: '2',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
  },
  {
    id: '2',
    title: 'Digital Marketing Campaign',
    description: 'Launch comprehensive digital marketing campaign for Q2',
    status: 'draft',
    priority: 'medium',
    createdBy: '2',
    createdAt: '2024-02-05',
    updatedAt: '2024-02-05',
  },
  {
    id: '3',
    title: 'Office Space Optimization',
    description: 'Redesign office layout for better collaboration and productivity',
    status: 'completed',
    priority: 'low',
    createdBy: '3',
    createdAt: '2024-01-30',
    updatedAt: '2024-02-10',
  },
];

export const mockWorkLocations: WorkLocation[] = [
  {
    id: '1',
    name: 'Headquarters',
    address: '123 Business Ave',
    city: 'New York',
    country: 'USA',
    employeeCount: 150,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'West Coast Office',
    address: '456 Tech Street',
    city: 'San Francisco',
    country: 'USA',
    employeeCount: 85,
    createdAt: '2024-01-15',
  },
  {
    id: '3',
    name: 'European Branch',
    address: '789 Innovation Blvd',
    city: 'London',
    country: 'UK',
    employeeCount: 65,
    createdAt: '2024-02-01',
  },
];

export const mockComplianceItems: ComplianceItem[] = [
  {
    id: '1',
    title: 'Annual Security Training',
    description: 'Complete mandatory security awareness training',
    status: 'pending',
    dueDate: '2024-03-15',
    assignedTo: '2',
    createdAt: '2024-02-01',
  },
  {
    id: '2',
    title: 'Data Privacy Certification',
    description: 'Obtain GDPR compliance certification',
    status: 'approved',
    dueDate: '2024-02-28',
    assignedTo: '3',
    createdAt: '2024-01-20',
  },
];