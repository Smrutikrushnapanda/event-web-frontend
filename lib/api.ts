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
  designation?: string;
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

export interface GeneratePassesDto {
  delegates?: number;
  vvip?: number;
  visitors?: number;
}

export interface AssignDetailsDto {
  name: string;
  mobile?: string;
  designation?: string;
  assignedBy?: string;
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

// ============================================
// FEEDBACK TYPES (UPDATED WITH NAME FIELD)
// ============================================

export interface FeedbackQuestion {
  id: string;
  questionEnglish: string;
  questionOdia: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  statistics?: {
    totalResponses: number;
    averageRating: string;
    ratings: Array<{
      rating: number;
      count: number;
      percentage: string;
    }>;
  };
}

export interface FeedbackResponse {
  questionId: string;
  rating: number;
  comment?: string;
}

// UPDATED: Added name field to BulkFeedbackSubmission
export interface BulkFeedbackSubmission {
  name: string;  // ← NEW FIELD
  responses: FeedbackResponse[];
}

export interface CreateFeedbackQuestionData {
  questionEnglish: string;
  questionOdia: string;
  order?: number;
}

export interface UpdateFeedbackQuestionData {
  questionEnglish?: string;
  questionOdia?: string;
  order?: number;
  isActive?: boolean;
}

// UPDATED: Added name to recent comments
export interface FeedbackStatistics {
  question: FeedbackQuestion;
  totalResponses: number;
  averageRating: string;
  ratings: {
    rating: number;
    count: number;
    percentage: string;
  }[];
  recentComments: {
    name: string;  // ← NEW FIELD
    rating: number;
    comment: string;
    createdAt: string;
  }[];
}

export interface AllFeedbackStatistics {
  totalQuestions: number;
  totalResponses: number;
  overallAverage: string;
  questionStats: FeedbackStatistics[];
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
  async generate(dto: GeneratePassesDto) {
    const response = await fetch(`${API_BASE_URL}/guest-passes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Failed to generate passes');
    return response.json();
  },

  async getAll(filters?: { category?: string; isAssigned?: boolean }): Promise<GuestPass[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.isAssigned !== undefined) params.append('isAssigned', String(filters.isAssigned));
    
    const response = await fetch(`${API_BASE_URL}/guest-passes?${params}`);
    if (!response.ok) throw new Error('Failed to fetch passes');
    return response.json();
  },

  async getStatistics(includeBreakdown = false): Promise<GuestStatisticsResponse> {
    const response = await fetch(
      `${API_BASE_URL}/guest-passes/statistics?includeBreakdown=${includeBreakdown}`
    );
    if (!response.ok) throw new Error('Failed to fetch statistics');
    return response.json();
  },

  async assignDetails(qrCode: string, dto: AssignDetailsDto): Promise<GuestPass> {
    const response = await fetch(`${API_BASE_URL}/guest-passes/${qrCode}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to assign details');
    }
    return response.json();
  },

  async getByQrCode(qrCode: string): Promise<GuestPass> {
    const response = await fetch(`${API_BASE_URL}/guest-passes/qr/${qrCode}`);
    if (!response.ok) throw new Error('Pass not found');
    return response.json();
  },
};

// ============================================
// FEEDBACK APIs (UPDATED)
// ============================================

export const feedbackApi = {
  // Public APIs
  getActiveQuestions: async (): Promise<FeedbackQuestion[]> => {
    try {
      const response = await api.get('/feedback/questions');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch questions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch questions');
    }
  },

  // UPDATED: Now accepts name in the submission
  submitFeedback: async (data: BulkFeedbackSubmission): Promise<{ submitted: number }> => {
    try {
      console.log('📤 Submitting feedback with name:', data);
      const response = await api.post('/feedback/submit', data);
      console.log('✅ Feedback submitted successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to submit feedback:', error);
      throw new Error(error.response?.data?.message || 'Failed to submit feedback');
    }
  },

  // Admin APIs - UPDATED: Returns questions with statistics
  getAllQuestions: async (includeInactive = false): Promise<FeedbackQuestion[]> => {
    try {
      const response = await api.get(`/feedback/admin/questions?includeInactive=${includeInactive}`);
      console.log('📊 Fetched questions with stats:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch all questions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch questions');
    }
  },

  createQuestion: async (data: CreateFeedbackQuestionData): Promise<FeedbackQuestion> => {
    try {
      const response = await api.post('/feedback/admin/questions', data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create question:', error);
      throw new Error(error.response?.data?.message || 'Failed to create question');
    }
  },

  updateQuestion: async (id: string, data: UpdateFeedbackQuestionData): Promise<FeedbackQuestion> => {
    try {
      const response = await api.put(`/feedback/admin/questions/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update question:', error);
      throw new Error(error.response?.data?.message || 'Failed to update question');
    }
  },

  deleteQuestion: async (id: string): Promise<void> => {
    try {
      await api.delete(`/feedback/admin/questions/${id}`);
    } catch (error: any) {
      console.error('Failed to delete question:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete question');
    }
  },

  reorderQuestions: async (orders: { id: string; order: number }[]): Promise<void> => {
    try {
      await api.post('/feedback/admin/questions/reorder', orders);
    } catch (error: any) {
      console.error('Failed to reorder questions:', error);
      throw new Error(error.response?.data?.message || 'Failed to reorder questions');
    }
  },

  // UPDATED: Returns overall statistics
  getAllStatistics: async (): Promise<AllFeedbackStatistics> => {
    try {
      const response = await api.get('/feedback/admin/statistics');
      console.log('📊 Overall statistics:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch statistics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
    }
  },

  // UPDATED: Returns statistics with names in comments
  getQuestionStatistics: async (questionId: string): Promise<FeedbackStatistics> => {
    try {
      const response = await api.get(`/feedback/admin/statistics/${questionId}`);
      console.log('📊 Question statistics:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch question statistics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
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