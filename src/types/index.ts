// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl: string | null;
  gender: string | null;
  nationality: string | null;
  bio: string | null;
  isFreelancer: boolean;
  isClient: boolean;
  accountType: 'Individual' | 'Company';
  companyName: string | null;
  status: string;
  rating: number;
  completedJobsCount: number;
  createdAt: string;
  skills?: UserSkill[];
  languages?: UserLanguage[];
  portfolios?: Portfolio[];
  certificates?: Certificate[];
}

export interface UserSkill {
  id: number;
  skillId: number;
  skillNameAr: string;
  skillNameEn: string;
  proficiencyLevel: string;
}

export interface UserLanguage {
  id: number;
  languageName: string;
  proficiencyLevel: string;
}

export interface Portfolio {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  projectUrl?: string;
  createdAt: string;
}

export interface Certificate {
  id: number;
  title: string;
  issuer?: string;
  issueDate?: string;
  certificateFileUrl?: string;
}

export interface AuthResponse {
  isAuthenticated: boolean;
  token?: string;
  tokenExpiration?: string;
  message: string;
  user?: User;
}

// Registration Types
export interface RegisterData {
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  accountType: 'Individual' | 'Company';
  companyName?: string;
  userType: 'Freelancer' | 'Client';
  nationality?: string;
  gender?: string;
}

// Login Types
export interface LoginData {
  emailOrPhone: string;
  password: string;
}

// Toast Types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

// Job Request Types
export interface JobRequest {
  id: number;
  title: string;
  description: string;
  budget: number;
  durationInDays: number;
  status: string;
  createdAt: string;
  deadline?: string;
  clientId: string;
  clientName?: string;
  clientAvatar?: string;
  clientCompany?: string;
  proposalsCount?: number;
  skills?: Skill[];
  attachments?: Attachment[];
  proposals?: Proposal[];
}

// Freelancer Types
export interface Freelancer {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl: string | null;
  bio: string | null;
  rating: number;
  completedJobsCount: number;
  nationality: string | null;
  skills?: Skill[];
  languages?: UserLanguage[];
  portfolios?: Portfolio[];
  certificates?: Certificate[];
}

// Skill Types
export interface Skill {
  id: number;
  nameAr: string;
  nameEn: string;
  proficiencyLevel?: string;
  parentId?: number;
  children?: Skill[];
}

// Proposal Types
export interface Proposal {
  id: number;
  jobRequestId: number;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string | null;
  freelancerRating: number;
  freelancerCompletedJobs: number;
  description: string;
  proposedPrice: number;
  proposedDurationInDays: number;
  status: string;
  createdAt: string;
}

// Attachment Types
export interface Attachment {
  id: number;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
}

// Chat Types
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

export interface Conversation {
  id: number;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

// Notification Types
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

// API Error Types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Search Filter Types
export interface JobSearchFilters {
  searchTerm?: string;
  skillIds?: number[];
  minBudget?: number;
  maxBudget?: number;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface FreelancerSearchFilters {
  searchTerm?: string;
  skillIds?: number[];
  nationality?: string;
  minRating?: number;
  pageNumber?: number;
  pageSize?: number;
}
