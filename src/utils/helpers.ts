// Format numbers with Arabic numerals
export const formatNumber = (number: number | null | undefined): string => {
  if (!number) return '0';
  return new Intl.NumberFormat('ar-EG').format(number);
};

// Format currency
export const formatCurrency = (amount: number, currency = 'ريال'): string => {
  return `${formatNumber(amount)} ${currency}`;
};

// Format date to Arabic
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
};

// Format relative time (منذ 5 دقائق، منذ ساعة، إلخ)
export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'الآن';
  if (minutes < 60) return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`;
  if (hours < 24) return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
  if (days < 30) return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
  if (months < 12) return `منذ ${months} ${months === 1 ? 'شهر' : 'أشهر'}`;
  return `منذ ${years} ${years === 1 ? 'سنة' : 'سنوات'}`;
};

// Truncate text
export const truncateText = (text: string | null | undefined, maxLength = 100): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (International format - supports multiple countries)
export const isValidPhone = (phone: string | null | undefined): boolean => {
  if (!phone || typeof phone !== 'string') return false;

  const cleaned = phone.trim().replace(/[\s\-\(\)]/g, '');

  if (cleaned.length === 0) return false;

  if (cleaned.startsWith('+')) {
    const internationalRegex = /^\+[1-9][0-9]{6,14}$/;
    return internationalRegex.test(cleaned);
  }

  if (cleaned.startsWith('00')) {
    const doubleZeroRegex = /^00[1-9][0-9]{8,16}$/;
    return doubleZeroRegex.test(cleaned);
  }

  if (cleaned.startsWith('05') && cleaned.length === 11) {
    return /^05[0-9]{9}$/.test(cleaned);
  }

  if (cleaned.startsWith('01') && cleaned.length === 11) {
    return /^01[0-9]{9}$/.test(cleaned);
  }

  if (cleaned.length >= 9 && cleaned.length <= 11) {
    return /^[0-9]{9,11}$/.test(cleaned);
  }

  return false;
};

// Validate password strength
export const validatePassword = (password: string) => {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid: minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
    minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
  };
};

// Get file extension
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

// Check if file is image
export const isImageFile = (file: File): boolean => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return imageTypes.includes(file.type);
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 بايت';
  const k = 1024;
  const sizes = ['بايت', 'كيلو بايت', 'ميجا بايت', 'جيجا بايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Deep clone object
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(func: T, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Get status badge color
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    Pending: 'warning',
    InProgress: 'info',
    Completed: 'success',
    Cancelled: 'danger',
    Accepted: 'success',
    Rejected: 'danger',
    Withdrawn: 'danger',
  };
  return colors[status] || 'info';
};

// Get status text in Arabic
export const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    Pending: 'قيد الانتظار',
    InProgress: 'قيد التنفيذ',
    Completed: 'مكتمل',
    Cancelled: 'ملغي',
    Accepted: 'مقبول',
    Rejected: 'مرفوض',
    Withdrawn: 'منسحب',
    Active: 'نشط',
    Inactive: 'غير نشط',
  };
  return texts[status] || status;
};

// Get proficiency level text
export const getProficiencyText = (level: string): string => {
  const texts: Record<string, string> = {
    Beginner: 'مبتدئ',
    Intermediate: 'متوسط',
    Advanced: 'متقدم',
    Expert: 'خبير',
  };
  return texts[level] || level;
};

// Convert English numbers to Arabic
export const toArabicNumbers = (str: string | number): string => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.toString().replace(/[0-9]/g, (w) => arabicNumbers[+w]);
};

// Generate stars rating
export const generateStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return {
    full: fullStars,
    half: hasHalfStar ? 1 : 0,
    empty: emptyStars,
  };
};

// Get image URL (handle relative and absolute URLs)
// Backend returns full URLs: https://localhost:7035/Images/{guid}.{extension}
// Safe SVG placeholder
export const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";



export const getImageUrl = (url: string | null | undefined, fallback = DEFAULT_AVATAR): string => {
  if (!url || url.trim() === '') {
    return fallback;
  }

  // Define URLs
  const backLink = 'https://globallink.runasp.net';
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || backLink;

  let finalUrl = url;

  // 1. Handle localhost URLs -> Convert to Production Backend
  if (url.includes('localhost:7035') || url.includes('localhost:5001') || url.includes('localhost')) {
    finalUrl = url.replace(/https?:\/\/localhost:\d+/, backLink);
  }
  // 2. Handle Relative URLs -> Prepend Base URL
  else if (!url.startsWith('http')) {
    finalUrl = url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  }

  // 3. PROXY: If it points to the backend (runasp), route through our local proxy to avoid CORS/MIXED content issues if needed
  // Note: runasp.net is already https, so proxy might be optional but keeping it for consistency if it was needed for ngrok
  if (finalUrl.includes('runasp.net')) {
    return `/api/image-proxy?url=${encodeURIComponent(finalUrl)}`;
  }

  return finalUrl;
};

// Validate image file before upload
export const validateImageFile = (file: File, maxSizeMB = 5): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = maxSizeMB * 1024 * 1024;

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'يرجى تحميل صورة بصيغة صحيحة (JPEG, PNG, GIF, WebP)' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: `حجم الصورة يجب أن يكون أقل من ${maxSizeMB} ميجابايت` };
  }

  return { valid: true };
};

// Get file icon based on file type
export const getFileIcon = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  const icons: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    zip: '📦',
    rar: '📦',
  };

  return icons[extension || ''] || '📎';
};

// Handle API errors
export const handleApiError = (error: any): string => {
  if (error.response) {
    return error.response.data?.message || 'حدث خطأ في الخادم';
  } else if (error.request) {
    return 'لا يمكن الاتصال بالخادم';
  } else {
    return 'حدث خطأ غير متوقع';
  }
};

// Scroll to top
export const scrollToTop = (): void => {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

