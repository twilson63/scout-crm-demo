// Contact entity from Scout CRM
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: ContactStatus;
}

export type ContactStatus = 'lead' | 'prospect' | 'customer';

// Activity entity from Scout CRM
export interface Activity {
  id: string;
  contactId: string;
  type: ActivityType;
  description: string;
  outcome?: string;
  timestamp: string;
}

export type ActivityType = 'call' | 'email' | 'meeting' | 'note';

// Dashboard data structure
export interface DashboardData {
  contactCounts: {
    lead: number;
    prospect: number;
    customer: number;
    total: number;
  };
  activityCount: number;
  recentActivities: Activity[];
}

// Authentication state
export interface AuthState {
  username: string;
  apiKey: string;
  isAuthenticated: boolean;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  rawResponse?: unknown;
}

// Contact with activities for detail view
export interface ContactWithActivities extends Contact {
  activities: Activity[];
}

// Form data for creating a contact
export interface CreateContactData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status?: ContactStatus;
}

// Form data for logging an activity
export interface LogActivityData {
  contactId: string;
  type: ActivityType;
  description: string;
  outcome?: string;
}
