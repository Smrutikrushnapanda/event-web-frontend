import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Registration Types
export interface CreateRegistrationData {
  name: string;
  village: string;
  district: string;
  block: string;
  mobile: string;
  aadhaarOrId: string;
  gender: 'male' | 'female' | 'others';
  caste: 'general' | 'obc' | 'sc' | 'st';
  category: string;
}

export interface RegistrationResponse {
  id: string;
  qrCode: string;
  name: string;
  village: string;
  district: string;
  block: string;
  mobile: string;
  aadhaarOrId: string;
  gender: 'male' | 'female' | 'others';
  caste: 'general' | 'obc' | 'sc' | 'st';
  category: string;
  createdAt: string;
}

export interface AadhaarCheckResponse {
  exists: boolean;
  qrCode?: string;
  name?: string;
}

// Statistics Types
export interface StatisticsResponse {
  totalRegistrations: number;
  totalAttendees: number;
  totalDelegatesAttending: number;
  checkIns: {
    entry: number;
    lunch: number;
    dinner: number;
    session: number;
    total: number;
  };
  generatedAt: string;
}

export interface ExportStatsResponse {
  totalRegistrations: number;
  totalBlocks: number;
  blockCounts: Record<string, number>;
  estimatedExcelSizeMB: number;
  estimatedCSVSizeKB: number;
  estimatedExcelTimeMinutes: number;
  recommendBlockWiseExport: boolean;
}

// Volunteer Types
export interface Volunteer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  age: number;
  gender: string;
  district: string;
  block: string;
  address: string;
  photoUrl: string | null;
  department: string;
  experience: string;
  status: "pending" | "approved" | "rejected";
  assignedRole: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  createdAt: string;
}

export interface ApproveVolunteerData {
  approvedBy: string;
  assignedRole: string;
}

// Guest Pass Types
export interface GuestPass {
  id: string;
  qrCode: string;
  category: 'DELEGATE' | 'VVIP' | 'VISITOR';
  sequenceNumber: number;
  isAssigned: boolean;
  name?: string;
  mobile?: string;
  assignedBy?: string;
  assignedAt?: string;
  hasEntryCheckIn: boolean;
  hasLunchCheckIn: boolean;
  hasDinnerCheckIn: boolean;
  hasSessionCheckIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GuestStatisticsResponse {
  totalPasses: number;
  totalAssigned: number;
  totalUnassigned: number;
  assignmentPercentage: number;
  byCategory: {
    DELEGATE: number;
    VVIP: number;
    VISITOR: number;
  };
  checkIns: {
    entry: number;
    lunch: number;
    dinner: number;
    session: number;
    total: number;
  };
  blockWise?: Record<string, {
    total: number;
    assigned: number;
    checkIns: {
      entry: number;
      lunch: number;
      dinner: number;
      session: number;
    };
  }>;
}

export interface GenerateGuestPassesData {
  delegates: number;
  vvip: number;
  visitors: number;
}

export interface GenerateGuestPassesResponse {
  generated: number;
  categories: {
    DELEGATE: { count: number; range: string };
    VVIP: { count: number; range: string };
    VISITOR: { count: number; range: string };
  };
}

export interface AssignGuestPassData {
  name: string;
  mobile: string;
  assignedBy: string;
}

export interface UpdateRegistrationData {
  name?: string;
  village?: string;
  district?: string;
  block?: string;
  mobile?: string;
  aadhaarOrId?: string;
  gender?: 'male' | 'female' | 'others';
  caste?: 'general' | 'obc' | 'sc' | 'st';
  category?: string;
}


export interface RegistrationFilters {
  search?: string;
  district?: string;
  block?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedRegistrations {
  data: RegistrationResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Registration APIs
export const registrationApi = {
  create: async (data: CreateRegistrationData): Promise<RegistrationResponse> => {
    try {
      const response = await api.post('/registrations', data);
      console.log('✅ Registration successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Registration API Error:', error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        throw new Error(error.response.data?.message || 'Registration failed');
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('Server not responding. Please check if backend is running.');
      } else {
        console.error('Request setup error:', error.message);
        throw new Error('Failed to send registration request');
      }
    }
  },

   getAllWithFilters: async (filters: RegistrationFilters): Promise<PaginatedRegistrations> => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.district) params.append('district', filters.district);
      if (filters.block) params.append('block', filters.block);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(`/registrations?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch registrations:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch registrations');
    }
  },

  getDistrictsList: async (): Promise<string[]> => {
    try {
      const response = await api.get('/registrations/districts');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch districts:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch districts');
    }
  },

  getBlocksByDistrict: async (district: string): Promise<string[]> => {
    try {
      const response = await api.get(`/registrations/blocks?district=${district}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch blocks:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch blocks');
    }
  },

  checkAadhaar: async (aadhaarOrId: string): Promise<AadhaarCheckResponse> => {
    try {
      const response = await api.post('/registrations/check-aadhaar', {
        aadhaarOrId,
      });
      return response.data;
    } catch (error: any) {
      console.error('Aadhaar check error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to check Aadhaar number');
    }
  },

  getAll: async (): Promise<RegistrationResponse[]> => {
    const response = await api.get('/registrations');
    return response.data;
  },

  getByQrCode: async (qrCode: string): Promise<RegistrationResponse> => {
    const response = await api.get(`/registrations/qr/${qrCode}`);
    return response.data;
  },

  getById: async (id: string): Promise<RegistrationResponse> => {
    const response = await api.get(`/registrations/${id}`);
    return response.data;
  },

  // Statistics APIs
  getStatistics: async (): Promise<StatisticsResponse> => {
    try {
      const response = await api.get('/registrations/statistics');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch statistics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
    }
  },

  getExportStats: async (): Promise<ExportStatsResponse> => {
    try {
      const response = await api.get('/registrations/export/stats');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch export stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch export stats');
    }
  },
update: async (id: string, data: UpdateRegistrationData): Promise<RegistrationResponse> => {
    try {
      const response = await api.patch(`/registrations/${id}`, data);
      console.log('✅ Registration updated:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Update API Error:', error);
      
      if (error.response) {
        throw new Error(error.response.data?.message || 'Update failed');
      } else if (error.request) {
        throw new Error('Server not responding');
      } else {
        throw new Error('Failed to update registration');
      }
    }
  },
};

// Guest Pass APIs
export const guestPassApi = {
  getAll: async (): Promise<GuestPass[]> => {
    try {
      const response = await api.get('/guest-passes');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch guest passes:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch guest passes');
    }
  },

  getStatistics: async (includeBlockWise: boolean = false): Promise<GuestStatisticsResponse> => {
    try {
      const url = includeBlockWise 
        ? '/guest-passes/statistics?includeBlockWise=true'
        : '/guest-passes/statistics';
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch guest pass statistics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
    }
  },

  generate: async (data: GenerateGuestPassesData): Promise<GenerateGuestPassesResponse> => {
    try {
      const response = await api.post('/guest-passes/generate', data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to generate guest passes:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate passes');
    }
  },

  assignDetails: async (qrCode: string, data: AssignGuestPassData): Promise<GuestPass> => {
    try {
      const response = await api.post(`/guest-passes/${qrCode}/assign`, data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to assign guest pass details:', error);
      throw new Error(error.response?.data?.message || 'Failed to assign details');
    }
  },

  getByQrCode: async (qrCode: string): Promise<GuestPass> => {
    try {
      const response = await api.get(`/guest-passes/qr/${qrCode}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch guest pass:', error);
      throw new Error(error.response?.data?.message || 'Guest pass not found');
    }
  },

  fastCheckIn: async (qrCode: string, data: { type: string; scannedBy?: string }) => {
    try {
      const response = await api.post(`/guest-passes/fast-checkin/${qrCode}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to check-in guest pass:', error);
      throw new Error(error.response?.data?.message || 'Check-in failed');
    }
  },

  exportCSV: async (): Promise<void> => {
    try {
      const response = await api.get('/guest-passes/export/csv', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `guest-passes-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      console.error('Failed to export CSV:', error);
      throw new Error(error.response?.data?.message || 'Export failed');
    }
  },

  exportExcel: async (): Promise<void> => {
    try {
      const response = await api.get('/guest-passes/export/excel', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `guest-passes-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      console.error('Failed to export Excel:', error);
      throw new Error(error.response?.data?.message || 'Export failed');
    }
  },

  exportQRPdf: async (): Promise<void> => {
    try {
      const response = await api.get('/guest-passes/export/qr-pdf', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `guest-passes-qr-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      console.error('Failed to export QR PDF:', error);
      throw new Error(error.response?.data?.message || 'Export failed');
    }
  },
};

// Volunteer APIs
export const getVolunteers = async (): Promise<Volunteer[]> => {
  try {
    const response = await api.get("/volunteers");
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch volunteers:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch volunteers');
  }
};

export const approveVolunteer = async (
  id: string,
  data: ApproveVolunteerData
): Promise<Volunteer> => {
  try {
    const response = await api.post(`/volunteers/${id}/approve`, data);
    return response.data;
  } catch (error: any) {
    console.error('Failed to approve volunteer:', error);
    throw new Error(error.response?.data?.message || 'Failed to approve volunteer');
  }
};

// Volunteer Login Types
export interface LoginCredentials {
  mobile: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  volunteer: Volunteer;
}

// Volunteer Login API
export const loginVolunteer = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await api.post('/volunteers/login', credentials);
    return response.data;
  } catch (error: any) {
    console.error('Login failed:', error);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export default api;