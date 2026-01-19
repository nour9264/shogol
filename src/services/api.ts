import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { RegisterData, LoginData, AuthResponse, User, JobRequest, Proposal, Freelancer } from '@/types';

// Define global window interface for runtime config
declare global {
  interface Window {
    ENV?: {
      API_BASE_URL?: string;
    };
  }
}


export const API_BASE_URL = '/api-proxy';
export const HUB_URL = '/chatHub';
export const NOTIFICATION_HUB_URL = '/notificationHub';

// Extend AxiosRequestConfig to include metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    requestId: string;
    startTime: number;
  };
}

// Console styling helpers
const logStyles = {
  request: 'color: #2196F3; font-weight: bold;',
  success: 'color: #4CAF50; font-weight: bold;',
  error: 'color: #F44336; font-weight: bold;',
  info: 'color: #FF9800; font-weight: bold;',
  divider: 'color: #9E9E9E; font-size: 10px;',
};

const getTimestamp = (): string => {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  } as Intl.DateTimeFormatOptions);
};

const logDivider = (): void => {
  console.log('%c' + '═'.repeat(80), logStyles.divider);
};

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Detailed logging
api.interceptors.request.use(
  (config: ExtendedAxiosRequestConfig) => {
    const timestamp = getTimestamp();
    const requestId = Math.random().toString(36).substr(2, 9);
    config.metadata = { requestId, startTime: Date.now() };

    // Get token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Log request details
    logDivider();
    console.log(`%c[REQUEST] ${timestamp} - ${config.method?.toUpperCase()} ${config.url}`, logStyles.request);
    console.log(`%cRequest ID: ${requestId}`, logStyles.info);
    console.log('%cBase URL:', logStyles.info, API_BASE_URL);
    console.log('%cFull URL:', logStyles.info, `${API_BASE_URL}${config.url}`);
    console.log('%cMethod:', logStyles.info, config.method?.toUpperCase());

    // Log headers (without sensitive data)
    const safeHeaders = { ...config.headers };
    if (safeHeaders.Authorization && typeof safeHeaders.Authorization === 'string') {
      safeHeaders.Authorization = `Bearer ${safeHeaders.Authorization.substring(0, 20)}...`;
    }
    console.log('%cHeaders:', logStyles.info, safeHeaders);

    // Log request data
    if (config.data) {
      if (config.data instanceof FormData) {
        console.log('%cRequest Data: (FormData)', logStyles.info);
        console.log('%cFormData entries:', logStyles.info);
        for (const pair of config.data.entries()) {
          if (pair[1] instanceof File) {
            console.log(`  - ${pair[0]}: File(${pair[1].name}, ${pair[1].size} bytes, ${pair[1].type})`);
          } else {
            console.log(`  - ${pair[0]}:`, pair[1]);
          }
        }
      } else {
        console.log('%cRequest Data:', logStyles.info, JSON.stringify(config.data, null, 2));
      }
    }

    // Log query params if any
    if (config.params) {
      console.log('%cQuery Params:', logStyles.info, config.params);
    }

    console.log('%c────────────────────────────────────────────────────────────────────────────────', logStyles.divider);

    return config;
  },
  (error) => {
    const timestamp = getTimestamp();
    console.error(`%c[REQUEST ERROR] ${timestamp}`, logStyles.error);
    console.error('%cError Details:', logStyles.error, error);
    return Promise.reject(error);
  }
);

// Response interceptor - Detailed logging
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const timestamp = getTimestamp();
    const config = response.config as ExtendedAxiosRequestConfig;
    const requestId = config.metadata?.requestId;
    const duration = config.metadata?.startTime
      ? `${Date.now() - config.metadata.startTime}ms`
      : 'N/A';

    logDivider();
    console.log(`%c[RESPONSE SUCCESS] ${timestamp} - ${config.method?.toUpperCase()} ${config.url}`, logStyles.success);
    console.log(`%cRequest ID: ${requestId || 'N/A'}`, logStyles.info);
    console.log(`%cStatus: ${response.status} ${response.statusText}`, logStyles.success);
    console.log(`%cDuration: ${duration}`, logStyles.info);

    // Log response headers
    console.log('%cResponse Headers:', logStyles.info, response.headers);

    // Log response data
    if (response.data) {
      console.log('%cResponse Data:', logStyles.success, JSON.stringify(response.data, null, 2));
    }

    console.log('%c────────────────────────────────────────────────────────────────────────────────', logStyles.divider);

    return response;
  },
  (error) => {
    const timestamp = getTimestamp();
    const config = error.config as ExtendedAxiosRequestConfig | undefined;
    const requestId = config?.metadata?.requestId;
    const duration = config?.metadata?.startTime
      ? `${Date.now() - config.metadata.startTime}ms`
      : 'N/A';

    logDivider();
    console.error(`%c[RESPONSE ERROR] ${timestamp} - ${config?.method?.toUpperCase()} ${config?.url || 'UNKNOWN'}`, logStyles.error);
    console.error(`%cRequest ID: ${requestId || 'N/A'}`, logStyles.error);

    if (error.response) {
      // Server responded with error
      console.error(`%cStatus: ${error.response.status} ${error.response.statusText}`, logStyles.error);
      console.error(`%cDuration: ${duration}`, logStyles.error);
      console.error('%cError Response Headers:', logStyles.error, error.response.headers);
      console.error('%cError Response Data:', logStyles.error, error.response.data);
      console.error('%cFull Error Response:', logStyles.error, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        config: {
          url: config?.url,
          method: config?.method,
          baseURL: config?.baseURL,
        },
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('%cNo response received from server', logStyles.error);
      console.error('%cRequest Details:', logStyles.error, {
        url: config?.url,
        method: config?.method,
        baseURL: config?.baseURL,
      });
      console.error('%cError Request:', logStyles.error, error.request);
    } else {
      // Something else happened
      console.error('%cError Message:', logStyles.error, error.message);
      console.error('%cFull Error:', logStyles.error, error);
    }

    console.error('%c────────────────────────────────────────────────────────────────────────────────', logStyles.divider);

    // Handle 401 Unauthorized
    // Don't redirect if we are already on login page or if it's a login request failure
    const isLoginRequest = config?.url?.toLowerCase().includes('/auth/login');
    const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';

    if (error.response?.status === 401 && typeof window !== 'undefined' && !isLoginRequest && !isLoginPage) {
      console.warn('%c[UNAUTHORIZED] Token expired or invalid. Redirecting to login...', logStyles.error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Log API configuration on load
if (typeof window !== 'undefined') {
  console.log('%c🔧 API Configuration Loaded', 'color: #9C27B0; font-weight: bold; font-size: 14px;');
  console.log('%cBase URL:', logStyles.info, API_BASE_URL);
  console.log('%cHub URL:', logStyles.info, HUB_URL);
  console.log('%cAxios Version:', logStyles.info, axios.VERSION || 'Unknown');
}

// ==================== AUTH ENDPOINTS ====================

export const authService = {
  // Register with FormData for profile picture support
  register: (data: RegisterData, profilePicture?: File) => {
    const formData = new FormData();

    // Add required fields
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('email', data.email);
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('password', data.password);
    formData.append('accountType', data.accountType);
    formData.append('userType', data.userType);

    // Add optional fields
    if (data.companyName) formData.append('companyName', data.companyName);
    if (data.nationality) formData.append('nationality', data.nationality);
    if (data.gender) formData.append('gender', data.gender);

    // Add profile picture if provided
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    // IMPORTANT: Set Content-Type to undefined to let browser set it with boundary for FormData
    return api.post<AuthResponse>('/Auth/register', formData, {
      headers: {
        'Content-Type': undefined as unknown as string,
      },
    });
  },

  verifyOtp: (data: { phoneNumber: string; otpCode: string }) =>
    api.post<AuthResponse>('/Auth/verify-otp', data),

  login: (data: LoginData) => api.post<AuthResponse>('/Auth/login', data),

  resendOtp: (phoneNumber: string) =>
    api.post<AuthResponse>('/Auth/resend-otp', { phoneNumber }),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/Auth/forgot-password', { email }),

  resetPassword: (data: { email: string; resetToken: string; newPassword: string }) =>
    api.post<{ message: string }>('/Auth/reset-password', data),
};

// ==================== USER ENDPOINTS ====================

export const userService = {
  getProfile: () => api.get<User>('/User/profile'),

  updateProfile: (data: Partial<User>) => api.put<{ message: string }>('/User/profile', data),

  updateProfilePicture: (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return api.post<{ imageUrl: string; message: string }>('/User/profile-picture', formData, {
      headers: {
        'Content-Type': undefined as unknown as string,
      },
    });
  },

  updateCoverImage: (file: File) => {
    const formData = new FormData();
    formData.append('CoverImage', file);
    return api.post<{ imageUrl: string; message: string }>('/User/cover-image', formData, {
      headers: {
        'Content-Type': undefined as unknown as string,
      },
    });
  },

  getAllSkills: () => api.get('/User/skills'),

  // Get available skills for selection (categorized)
  getAvailableSkills: () => api.get('/Skill'),

  // Get user's current skills
  getUserSkills: () => api.get('/Skill/user-skills'),

  // Add multiple skills at once (for onboarding)
  addMultipleSkills: (skillIds: number[]) =>
    api.post<{ message: string }>('/Skill/add-multiple', { skillIds }),

  addSkill: (data: { skillId: number; proficiencyLevel: string }) =>
    api.post<{ message: string }>('/User/skills', data),

  removeSkill: (userSkillId: number) =>
    api.delete<{ message: string }>(`/Skill/${userSkillId}`),

  // Get user portfolios
  getPortfolios: () => api.get('/User/portfolios'),

  // Add new portfolio
  addPortfolio: (data: FormData) =>
    api.post('/User/portfolios', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // Delete portfolio
  deletePortfolio: (portfolioId: number) =>
    api.delete(`/User/portfolios/${portfolioId}`),

  // Get freelancer public details
  getFreelancerDetails: (freelancerId: string) =>
    api.get(`/User/freelancer-account-details/${freelancerId}`),

  // Get user bio
  getBio: () => api.get<{ bio: string }>('/User/bio'),

  // Update user bio
  updateBio: (bio: string) =>
    api.put<{ message: string }>('/User/bio', { bio }),

  addLanguage: (data: { languageName: string; proficiencyLevel: string }) =>
    api.post<{ message: string }>('/User/languages', data),

  removeLanguage: (languageId: number) =>
    api.delete<{ message: string }>(`/User/languages/${languageId}`),



  addCertificate: (data: {
    title: string;
    issuer?: string;
    issueDate?: string;
    certificateFile?: File;
  }) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.issuer) formData.append('issuer', data.issuer);
    if (data.issueDate) formData.append('issueDate', data.issueDate);
    if (data.certificateFile) formData.append('certificateFile', data.certificateFile);
    return api.post<{ message: string }>('/User/certificates', formData, {
      headers: {
        'Content-Type': undefined as unknown as string,
      },
    });
  },

  removeCertificate: (certificateId: number) =>
    api.delete<{ message: string }>(`/User/certificates/${certificateId}`),

  searchFreelancers: (filters: {
    searchTerm?: string;
    skillIds?: number[];
    nationality?: string;
    minRating?: number;
    pageNumber?: number;
    pageSize?: number;
  }) => api.post<{ freelancers: Freelancer[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number }>('/User/freelancers/search', filters),


  // Client Reviews
  getFreelancerReviews: (freelancerId: string) => api.get(`/FreelancerReview/${freelancerId}`),
  addReview: (data: { jobRequestId: number; rating: number; comment: string }) => api.post('/FreelancerReview/add', data),
  updateReview: (data: { reviewId: number; rating: number; comment: string }) => api.put('/FreelancerReview/update', data),
  deleteReview: (reviewId: number) => api.delete(`/FreelancerReview/${reviewId}`),
};

export const reviewService = {
  getFreelancerReviews: userService.getFreelancerReviews,
  addReview: userService.addReview,
  updateReview: userService.updateReview,
  deleteReview: userService.deleteReview,
};

// ==================== JOB REQUEST ENDPOINTS ====================

export const jobService = {
  createJob: (data: {
    title: string;
    description: string;
    budget: number;
    durationInDays: number;
    deadline?: string;
    skillIds: number[];
    attachments?: File[];
  }) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('budget', data.budget.toString());
    formData.append('durationInDays', data.durationInDays.toString());
    if (data.deadline) formData.append('deadline', data.deadline);

    // Add skill IDs
    data.skillIds.forEach((skillId) => {
      formData.append('skillIds', skillId.toString());
    });

    // Add attachments
    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    return api.post<{ jobRequestId: number; message: string }>('/JobRequest', formData, {
      headers: {
        'Content-Type': undefined as unknown as string,
      },
    });
  },

  getJobDetails: (jobRequestId: number) => api.get<JobRequest>(`/JobRequest/${jobRequestId}`),

  searchJobs: (filters: {
    searchTerm?: string;
    skillIds?: number[];
    minBudget?: number;
    maxBudget?: number;
    status?: string;
    pageNumber?: number;
    pageSize?: number;
  }) => api.post('/JobRequest/search', filters),

  autocomplete: (searchTerm: string, limit = 8) =>
    api.get(`/JobRequest/autocomplete?q=${encodeURIComponent(searchTerm)}&limit=${limit}`),

  getMyJobs: (pageNumber = 1, pageSize = 10) =>
    api.get(`/JobRequest/my-requests?pageNumber=${pageNumber}&pageSize=${pageSize}`),

  updateJob: (jobRequestId: number, data: Partial<JobRequest>) =>
    api.put<{ message: string }>(`/JobRequest/${jobRequestId}`, data),

  deleteJob: (jobRequestId: number) =>
    api.delete<{ message: string }>(`/JobRequest/${jobRequestId}`),

  markJobAsCompleted: (jobRequestId: number) =>
    api.post<{ message: string }>(`/JobRequest/${jobRequestId}/freelancer-completed`),
};

// ==================== PROPOSAL ENDPOINTS ====================

export const proposalService = {
  createProposal: (data: {
    jobRequestId: number;
    description: string;
    proposedPrice: number;
    proposedDurationInDays: number;
  }) => api.post<{ proposalId: number; message: string }>('/Proposal', data),

  getProposalDetails: (proposalId: number) => api.get<Proposal>(`/Proposal/${proposalId}`),

  getMyProposals: (pageNumber = 1, pageSize = 10) =>
    api.get(`/Proposal/my-proposals?pageNumber=${pageNumber}&pageSize=${pageSize}`),

  updateProposal: (proposalId: number, data: {
    description?: string;
    proposedPrice?: number;
    proposedDurationInDays?: number;
  }) => api.put<{ message: string }>(`/Proposal/${proposalId}`, data),

  withdrawProposal: (proposalId: number) =>
    api.delete<{ message: string }>(`/Proposal/${proposalId}`),

  acceptProposal: (proposalId: number) =>
    api.post<{ message: string }>(`/Proposal/${proposalId}/accept`),
};

// ==================== CHAT ENDPOINTS ====================

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  sentAt: string;
  isRead: boolean;
}

// Backend response format
export interface ConversationResponse {
  id: number;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

// Frontend format (mapped from backend)
export interface Conversation {
  id: number;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline?: boolean;
}

export const chatService = {
  sendMessage: (data: {
    receiverId: string;
    content?: string;
    attachment?: File;
  }) => {
    const formData = new FormData();
    formData.append('ReceiverId', data.receiverId);
    if (data.content) formData.append('Content', data.content);
    if (data.attachment) formData.append('Attachment', data.attachment);

    return api.post<{ messageId: number; message: string }>('/Chat/send', formData, {
      headers: {
        'Content-Type': undefined as unknown as string,
      },
    });
  },

  getConversations: async () => {
    try {
      const response = await api.get<any>('/Chat/conversations');
      console.log('🔍 Raw conversations response:', response.data);

      let rawData: any[] = [];
      if (Array.isArray(response.data)) {
        rawData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        rawData = response.data.conversations || response.data.items || response.data.data || [];
      }

      // Map backend response to frontend format
      const mapped: Conversation[] = rawData
        .filter(conv => conv !== null && conv !== undefined)
        .map(conv => {
          const mappedConv = {
            id: conv.id || conv.Id,
            participantId: conv.otherUserId || conv.OtherUserId,
            participantName: conv.otherUserName || conv.OtherUserName,
            participantAvatar: conv.otherUserAvatar || conv.OtherUserAvatar,
            lastMessage: conv.lastMessage || conv.LastMessage,
            lastMessageTime: conv.lastMessageAt || conv.LastMessageAt,
            unreadCount: conv.unreadCount || conv.UnreadCount || 0,
            isOnline: conv.isOnline || conv.IsOnline || false,
          };
          return mappedConv;
        });

      console.log('🔍 Mapped conversations:', mapped);
      return { ...response, data: mapped };
      // ...
    } catch (error: any) {
      // Handle 404 (No conversations found) gracefully
      if (error.response && error.response.status === 404) {
        console.log('⚠️ 404 received for conversations, treating as empty list.');
        return { data: [], status: 404, statusText: 'Not Found', headers: {}, config: error.config };
      }

      console.error('❌ Failed to get conversations:', error);
      if (error.response) {
        console.error('❌ Error Response Data:', error.response.data);
      }
      throw error;
    }
  },

  getMessages: async (conversationId: number, pageNumber = 1, pageSize = 50) => {
    try {
      const response = await api.get<any>(`/Chat/conversations/${conversationId}/messages?pageNumber=${pageNumber}&pageSize=${pageSize}`);

      let rawData: any[] = [];
      if (Array.isArray(response.data)) {
        rawData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Try to find the array in common properties
        rawData = response.data.messages || response.data.items || response.data.data || [];
      }

      // Map backend response to frontend format
      const mapped: ChatMessage[] = rawData
        .filter(msg => msg !== null && msg !== undefined)
        .map(msg => ({
          id: msg.id || msg.Id,
          conversationId: msg.conversationId || msg.ConversationId,
          senderId: msg.senderId || msg.SenderId,
          senderName: msg.senderName || msg.SenderName,
          senderAvatar: msg.senderAvatar || msg.SenderAvatar,
          content: msg.content || msg.Content,
          fileUrl: msg.fileUrl || msg.FileUrl,
          fileName: msg.fileName || msg.FileName,
          sentAt: msg.sentAt || msg.SentAt,
          isRead: msg.isRead || msg.IsRead,
        }));

      return { ...response, data: mapped };
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.log('⚠️ 404 received for messages, treating as empty list.');
        return { data: [], status: 404, statusText: 'Not Found', headers: {}, config: error.config };
      }
      console.error('❌ Failed to get messages:', error);
      throw error;
    }
  },

  markAsRead: (conversationId: number) =>
    api.post<{ message: string }>(`/Chat/conversations/${conversationId}/mark-read`),

  // Check if a specific user is online
  checkUserOnlineStatus: (userId: string) =>
    api.get<{ userId: string; isOnline: boolean; timestamp: string }>(`/Chat/user/${userId}/online-status`),

  // Get all online users
  getOnlineUsers: () =>
    api.get<{ onlineUsers: string[]; count: number; timestamp: string }>('/Chat/online-users'),
};

// ==================== NOTIFICATION ENDPOINTS ====================

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

export const notificationService = {
  // Get all notifications with pagination
  getNotifications: (pageNumber = 1, pageSize = 20) =>
    api.get<any>(`/Notification?pageNumber=${pageNumber}&pageSize=${pageSize}`),

  // Get unread notification count
  getUnreadCount: () =>
    api.get<{ unreadCount: number }>('/Notification/unread-count'),

  // Mark a specific notification as read
  markAsRead: (notificationId: number) =>
    api.post<{ message: string }>(`/Notification/${notificationId}/mark-read`),

  // Mark all notifications as read
  markAllAsRead: () =>
    api.post<{ message: string }>('/Notification/mark-all-read'),
};

export default api;
