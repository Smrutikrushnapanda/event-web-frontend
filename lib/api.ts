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
  gp: string;
  district: string;
  block: string;
  mobile: string;
  aadhaarOrId: string;
  category: string;
  photo?: File;
}

export interface RegistrationResponse {
  id: string;
  qrCode: string;
  name: string;
  village: string;
  gp: string;
  district: string;
  block: string;
  mobile: string;
  aadhaarOrId: string;
  category: string;
  photoUrl?: string;
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

// ============================================
// GUEST PASSES TYPES
// ============================================

export interface GeneratePassesData {
  delegates?: number;
  vvip?: number;
  visitors?: number;
}

export interface GeneratePassesResponse {
  generated: number;
  categories: {
    [key: string]: {
      count: number;
      range: string;
    };
  };
}

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
  createdAt: string;
  hasEntryCheckIn: boolean;
  hasLunchCheckIn: boolean;
  hasDinnerCheckIn: boolean;
  hasSessionCheckIn: boolean;
  checkIns?: Array<{
    id: string;
    type: 'entry' | 'lunch' | 'dinner' | 'session';
    scannedAt: string;
    scannedBy: string;
  }>;
}

export interface AssignDetailsData {
  name: string;
  mobile: string;
  assignedBy: string;
}

export interface GuestCheckInData {
  type: 'entry' | 'lunch' | 'dinner' | 'session';
  scannedBy?: string;
}

export interface GuestStatisticsResponse {
  totalPasses: number;
  totalAssigned: number;
  totalUnassigned: number;
  assignmentPercentage: string;
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
  generatedAt: string;
  categoryBreakdown?: Array<{
    category: string;
    totalPasses: string;
    assignedPasses: string;
    entryCheckIns: string;
    lunchCheckIns: string;
    dinnerCheckIns: string;
    sessionCheckIns: string;
  }>;
}

// ============================================
// REGISTRATION APIs
// ============================================

export const registrationApi = {
  create: async (data: CreateRegistrationData): Promise<RegistrationResponse> => {
    const formData = new FormData();
    
    formData.append('name', data.name.trim());
    formData.append('village', data.village.trim());
    formData.append('gp', data.gp.trim());
    formData.append('district', data.district);
    formData.append('block', data.block);
    formData.append('mobile', data.mobile);
    formData.append('aadhaarOrId', data.aadhaarOrId);
    formData.append('category', data.category);
    
    if (data.photo) {
      formData.append('photo', data.photo);
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/registrations`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        }
      );
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Registration failed');
      } else if (error.request) {
        throw new Error('Server not responding. Please check if backend is running.');
      } else {
        throw new Error('Failed to send registration request');
      }
    }
  },

  checkAadhaar: async (aadhaarOrId: string): Promise<AadhaarCheckResponse> => {
    try {
      const response = await api.post('/registrations/check-aadhaar', {
        aadhaarOrId,
      });
      return response.data;
    } catch (error: any) {
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

  getStatistics: async (): Promise<StatisticsResponse> => {
    try {
      const response = await api.get('/registrations/statistics');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
    }
  },

  getExportStats: async (): Promise<ExportStatsResponse> => {
    try {
      const response = await api.get('/registrations/export/stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch export stats');
    }
  },
};

// ============================================
// VOLUNTEER APIs
// ============================================

export const getVolunteers = async (): Promise<Volunteer[]> => {
  try {
    const response = await api.get("/volunteers");
    return response.data;
  } catch (error: any) {
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
    throw new Error(error.response?.data?.message || 'Failed to approve volunteer');
  }
};

export interface LoginCredentials {
  mobile: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  volunteer: Volunteer;
}

export const loginVolunteer = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await api.post('/volunteers/login', credentials);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

// ============================================
// GUEST PASSES APIs
// ============================================

export const guestPassApi = {
  // Generate passes
  generate: async (data: GeneratePassesData): Promise<GeneratePassesResponse> => {
    try {
      const response = await api.post('/guest-passes/generate', data);
      return response.data;
    } catch (error: any) {
      console.error('Generate passes error:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate passes');
    }
  },

  // Assign details to a pass
  assignDetails: async (qrCode: string, data: AssignDetailsData): Promise<GuestPass> => {
    try {
      const response = await api.post(`/guest-passes/${qrCode}/assign`, data);
      return response.data;
    } catch (error: any) {
      console.error('Assign details error:', error);
      throw new Error(error.response?.data?.message || 'Failed to assign details');
    }
  },

  // Fast check-in
  fastCheckIn: async (qrCode: string, data: GuestCheckInData): Promise<any> => {
    try {
      const response = await api.post(`/guest-passes/fast-checkin/${qrCode}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Check-in error:', error);
      throw new Error(error.response?.data?.message || 'Check-in failed');
    }
  },

  // Get all passes
  getAll: async (filters?: { category?: string; isAssigned?: boolean }): Promise<GuestPass[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.isAssigned !== undefined) params.append('isAssigned', String(filters.isAssigned));
      
      const response = await api.get(`/guest-passes?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Get passes error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch passes');
    }
  },

  // Get pass by QR code
  getByQrCode: async (qrCode: string): Promise<GuestPass> => {
    try {
      const response = await api.get(`/guest-passes/qr/${qrCode}`);
      return response.data;
    } catch (error: any) {
      console.error('Get pass error:', error);
      throw new Error(error.response?.data?.message || 'Pass not found');
    }
  },

  // Get statistics
  getStatistics: async (includeBreakdown = false): Promise<GuestStatisticsResponse> => {
    try {
      const response = await api.get(`/guest-passes/statistics?includeBreakdown=${includeBreakdown}`);
      return response.data;
    } catch (error: any) {
      console.error('Get statistics error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
    }
  },
};

export default api;