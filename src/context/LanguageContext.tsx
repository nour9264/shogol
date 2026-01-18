'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';
type Direction = 'rtl' | 'ltr';

// Translation keys - Comprehensive translations for the entire app
const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    jobs: 'الإعلانات',
    freelancers: 'المشتغلين',
    requests: 'الطلبات',
    contact: 'تواصل معنا',
    login: 'تسجيل الدخول',
    register: 'كن مشتغل',
    logout: 'تسجيل الخروج',
    profile: 'الملف الشخصي',
    myJobs: 'طلباتي',
    myProposals: 'عروضي',
    notifications: 'الإشعارات',
    messages: 'الرسائل',
    postJob: 'اطلب عرض سعر',

    // User Types
    freelancer: 'مستقل',
    client: 'عميل',

    // Auth
    createAccount: 'إنشاء حساب',
    selectAccountType: 'حدد نوع الحساب، يمكن تغييره لاحقاً',
    freelancerAccount: 'حساب مستقل',
    clientAccount: 'حساب عميل',
    freelancerDesc: 'للمستقلين والموظفين المستقلين الذين يبحثون عن فرص عمل ومشاريع',
    clientDesc: 'لأصحاب المشاريع والشركات الذين يبحثون عن موظفين مستقلين محترفين',
    haveAccount: 'لديك حساب بالفعل؟',
    noAccount: 'ليس لديك حساب؟',
    firstName: 'الاسم الأول',
    lastName: 'الاسم الأخير',
    email: 'البريد الإلكتروني',
    phone: 'رقم الجوال',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    accountType: 'نوع الحساب',
    individual: 'حساب فرد',
    company: 'حساب شركة',
    companyName: 'اسم الشركة',
    gender: 'النوع',
    male: 'ذكر',
    female: 'أنثى',
    nationality: 'الجنسية',
    selectCountry: 'اختر الدولة',
    agreeTerms: 'أوافق على',
    termsAndConditions: 'الشروط والأحكام',
    createAccountBtn: 'إنشاء الحساب',
    loginBtn: 'تسجيل الدخول',
    changeAccountType: 'تغيير نوع الحساب',
    emailOrPhone: 'البريد الإلكتروني أو رقم الجوال',

    // Reviews
    rateFreelancer: 'تقييم المستقل',
    veryPoor: 'سيء جداً',
    poor: 'سيء',
    good: 'جيد',
    veryGood: 'جيد جداً',
    excellent: 'ممتاز',
    yourReview: 'تقييمك',
    writeReviewPlaceholder: 'شارك تجربتك في العمل مع هذا المستقل...',
    submitting: 'جاري الإرسال...',
    submitReview: 'إرسال التقييم',
    cancel: 'إلغاء',
    enterEmailOrPhone: 'أدخل البريد الإلكتروني أو رقم الجوال',
    forgotPassword: 'نسيت كلمة المرور؟',

    // OTP
    verificationCode: 'رمز التحقق',
    otpSentToEmail: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
    verify: 'تحقق',
    verifying: 'جاري التحقق...',
    didntReceiveCode: 'لم تستلم الرمز؟',
    resend: 'إعادة الإرسال',
    resending: 'جاري الإرسال...',
    changeEmail: 'تغيير البريد الإلكتروني',
    enterFullCode: 'يرجى إدخال رمز التحقق كاملاً',

    // Profile Picture
    profilePicture: 'الصورة الشخصية',
    optional: 'اختياري',
    addPhoto: 'إضافة صورة',
    supportedFormats: 'صيغ مدعومة: JPEG, PNG, GIF, WebP (الحد الأقصى 5MB)',
    cropImage: 'قص الصورة',
    cropProfilePicture: 'قص الصورة الشخصية',
    confirm: 'تأكيد',
    cancel: 'إلغاء',
    rotate: 'تدوير 90°',
    processing: 'جاري المعالجة...',

    // Common
    loading: 'جاري التحميل...',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    view: 'عرض',
    search: 'بحث',
    filter: 'تصفية',
    all: 'الكل',
    required: 'مطلوب',

    // Settings
    settings: 'الإعدادات',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',

    // Home Page - Hero
    platformTitle: 'منصة شغل',
    platformName: 'منصة شغل',
    platformSubtitle: 'هناك حقيقة مثبتة منذ زمن طويل وهي أن المحتوى المقروء لصفحة ما سيلهي القارئ عن التركيز على الشكل الخارجي للنص أو شكل توضع الفقرات في الصفحة التي يقرأها',
    searchPlaceholder: 'ابحث عن مشروع، مهارة، أو مستقل...',
    searchBtn: 'بحث',
    startAsFreelancer: 'ابدأ كمستقل',
    postYourProject: 'انشر مشروعك',

    // Home Page - Features
    whyRequestQuote: 'لماذا طلب عرض سعر أفضل؟',
    uniqueExperience: 'نوفر لك تجربة فريدة في عالم العمل الحر',
    newConcept: 'مفهوم جديد',
    newConceptDesc: 'منصة عصرية تجمع أفضل المواهب مع أفضل المشاريع',
    comprehensiveServices: 'شمولية في الخدمات',
    comprehensiveServicesDesc: 'نوفر لك كل ما تحتاجه لإنجاز مشروعك بنجاح',
    valueForTime: 'ثمن للوقت',
    valueForTimeDesc: 'نحترم وقتك ونساعدك على إنجاز مشاريعك في أسرع وقت',
    freedomInDealings: 'حرية في التعامل',
    freedomInDealingsDesc: 'تواصل مباشر بين أصحاب المشاريع والمستقلين المحترفين',

    // Home Page - Stats
    completedProjects: 'مشروع مكتمل',
    professionalFreelancers: 'مستقل محترف',
    satisfiedClients: 'عميل راضٍ',
    successRate: 'نسبة النجاح',

    // Home Page - How it Works
    howItWorks: 'كيف يعمل شغل؟',
    threeSimpleSteps: 'ثلاث خطوات بسيطة لإنجاز مشروعك',
    postYourProjectStep: 'انشر مشروعك',
    postYourProjectStepDesc: 'أضف تفاصيل مشروعك وميزانيتك والمدة الزمنية المطلوبة',
    receiveOffers: 'استقبل العروض',
    receiveOffersDesc: 'سيتقدم المستقلون بعروضهم وستختار الأفضل منهم',
    completeProject: 'أنجز المشروع',
    completeProjectDesc: 'تعاون مع المستقل المختار وأنجز مشروعك بنجاح',

    // Home Page - New
    searchServices: 'ابحث عن وظائف...',
    browseAll: 'تصفح الكل',
    servicesTitle: 'أهم الخدمات الاحترافية لتطوير وتنمية أعمالك',
    someServices: 'بعض الخدمات وظائف شغل',
    marketPrice: 'تكشف أسعار السوق',
    saveTime: 'توفير الوقت',
    infoTitle: 'معلومات',
    whyRequestQuoteTitle: 'لماذا طلب عرض السعر؟',
    firstReason: 'أولاً : ستطلب ولن تبحث وستوفر عنا البحث',
    secondReason: 'ثانياً : ستكشف سعر السوق للخدمة التي تبحث عنها',
    thirdReason: 'ثالثاً : ستتصفح السيرة الذكية للمشتغلين الجاهزين لخدمتك',
    fourthReason: 'رابعاً : ستختار السعر والمشتغل الأنسب لك بكل ثقه وراحة بال',
    newProjects: 'مشاريع جديدة',
    technicalSupport: 'دعم فني متكامل',
    transparency: 'شفافية في الخدمات',
    heroDesc: 'منصة متميزة تجمع بين طالبي الخدمات والمحترفين المتخصصين. انشر مشروعك واحصل على أفضل العروض من المستقلين، أو ابحث وتقدم للمشاريع التي تناسبك',
    noResults: 'لا توجد نتائج',
    searching: 'جاري البحث...',

    // Public Profile
    aboutMe: 'نبذة عني',
    portfolio: 'معرض الأعمال',
    reviewsRatings: 'التقييمات والآراء',
    skills: 'المهارات',
    location: 'الموقع',
    joinedSince: 'انضم منذ',
    lastOnline: 'آخر ظهور',
    contactMe: 'تواصل معي',
    copyLink: 'نسخ الرابط',
    report: 'إبلاغ',
    completedProjectsCount: 'مشاريع مكتملة',
    completionRate: 'نسبة الإكمال',
    viewProject: 'استعراض المشروع',
    worksCount: 'عمل',
    noWorks: 'لم يتم إضافة أعمال للمعرض بعد',
    noReviews: 'لا توجد تقييمات بعد',
    noSkills: 'لا توجد مهارات مضافة',
    online: 'متصل',
    viewPublicProfile: 'عرض الملف العام',
    noBio: 'لا توجد نبذة تعريفية.',
    unknown: 'غير معروف',
    unspecified: 'غير محدد',

    // Home Page - CTA
    readyToStart: 'هل أنت مستعد للبدء؟',
    joinThousands: 'انضم إلى آلاف المستقلين وأصحاب المشاريع الناجحين',
    startNowFree: 'ابدأ الآن مجاناً',
    learnMore: 'تعرف على المزيد',

    // Footer
    footerDesc: 'منصة احترافية للعمل الحر تربط بين أصحاب المشاريع والمستقلين المحترفين في الوطن العربي',
    links: 'روابط',
    helpCenter: 'مركز المساعدة',
    termsOfUse: 'شروط الاستخدام',
    guaranteeRights: 'ضمان حقوقك',
    pages: 'صفحات',
    newRegistration: 'تسجيل جديد',
    browseAllRequests: 'تصفح كل الطلبات',
    applyAsExpert: 'قدم كخبيرك',
    downloadApp: 'حمل تطبيق شغل',
    downloadAppDesc: 'شمولية في الخدمات، ثمن للوقت، حرية في التعامل',
    availableOn: 'متوفر على',
    allRightsReserved: 'جميع الحقوق محفوظة',
    professionalPlatform: 'منصة العمل الحر الاحترافية',

    // Notifications
    notificationsTitle: 'الإشعارات',
    unreadNotifications: 'لديك {count} إشعارات غير مقروءة',
    markAllAsRead: 'تعيين الكل كمقروء',
    marking: 'جاري التعيين...',
    noNewNotifications: 'لا توجد إشعارات جديدة',
    allNotificationsMarkedAsRead: 'تم تعيين جميع الإشعارات كمقروءة',

    // Messages
    allMessages: 'جميع الرسائل',
    refreshConversations: 'تحديث المحادثات',
    connected: 'متصل',
    connecting: 'جاري الاتصال...',
    reconnecting: 'إعادة الاتصال...',
    disconnected: 'غير متصل',
    searchHere: 'ابحث هنا',
    noConversations: 'لا توجد محادثات',
    typing: 'يكتب...',
    noMessagesYet: 'لا توجد رسائل بعد. ابدأ المحادثة!',
    sendMessage: 'إرسال رسالة',
    sending: 'جاري الإرسال',
    send: 'إرسال',
    selectConversation: 'اختر محادثة للبدء',
    selectToStart: 'اختر محادثة',
    attachment: 'مرفق',
    read: 'تم القراءة',
    sent: 'تم الإرسال',
  },
  en: {
    // Navigation
    home: 'Home',
    jobs: 'Jobs',
    freelancers: 'Freelancers',
    requests: 'Requests',
    contact: 'Contact Us',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    myJobs: 'My Jobs',
    myProposals: 'My Proposals',
    notifications: 'Notifications',
    messages: 'Messages',
    postJob: 'Post a Job',

    // User Types
    freelancer: 'Freelancer',
    client: 'Client',

    // Auth
    createAccount: 'Create Account',
    selectAccountType: 'Select account type, you can change it later',
    freelancerAccount: 'Freelancer Account',
    clientAccount: 'Client Account',
    freelancerDesc: 'For freelancers looking for job opportunities and projects',
    clientDesc: 'For project owners and companies looking for professional freelancers',
    haveAccount: 'Already have an account?',
    noAccount: "Don't have an account?",
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone Number',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    accountType: 'Account Type',
    individual: 'Individual',
    company: 'Company',
    companyName: 'Company Name',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    nationality: 'Nationality',
    selectCountry: 'Select Country',
    agreeTerms: 'I agree to the',
    termsAndConditions: 'Terms and Conditions',
    createAccountBtn: 'Create Account',
    loginBtn: 'Login',
    changeAccountType: 'Change Account Type',
    emailOrPhone: 'Email or Phone Number',

    // Reviews
    rateFreelancer: 'Rate Freelancer',
    veryPoor: 'Very Poor',
    poor: 'Poor',
    good: 'Good',
    veryGood: 'Very Good',
    excellent: 'Excellent',
    yourReview: 'Your Review',
    writeReviewPlaceholder: 'Share your experience working with this freelancer...',
    submitting: 'Submitting...',
    submitReview: 'Submit Review',
    cancel: 'Cancel',
    enterEmailOrPhone: 'Enter your email or phone number',
    forgotPassword: 'Forgot Password?',

    // OTP
    verificationCode: 'Verification Code',
    otpSentToEmail: 'Verification code has been sent to your email',
    verify: 'Verify',
    verifying: 'Verifying...',
    didntReceiveCode: "Didn't receive the code?",
    resend: 'Resend',
    resending: 'Resending...',
    changeEmail: 'Change Email',
    enterFullCode: 'Please enter the full verification code',

    // Profile Picture
    profilePicture: 'Profile Picture',
    optional: 'optional',
    addPhoto: 'Add Photo',
    supportedFormats: 'Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)',
    cropImage: 'Crop Image',
    cropProfilePicture: 'Crop Profile Picture',
    confirm: 'Confirm',
    cancel: 'Cancel',
    rotate: 'Rotate 90°',
    processing: 'Processing...',

    // Common
    loading: 'Loading...',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    required: 'Required',

    // Settings
    settings: 'Settings',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    arabic: 'العربية',
    english: 'English',

    // Home Page - Hero
    platformTitle: 'SHOGOL Platform',
    platformName: 'SHOGOL Platform',
    platformSubtitle: 'A professional freelancing platform connecting project owners with talented freelancers across the Arab world. Find the perfect match for your projects.',
    searchPlaceholder: 'Search for project, skill, or freelancer...',
    searchBtn: 'Search',
    startAsFreelancer: 'Start as Freelancer',
    postYourProject: 'Post Your Project',

    // Home Page - Features
    whyRequestQuote: 'Why Request a Quote?',
    uniqueExperience: 'We provide you with a unique experience in the freelancing world',
    newConcept: 'New Concept',
    newConceptDesc: 'A modern platform connecting the best talents with the best projects',
    comprehensiveServices: 'Comprehensive Services',
    comprehensiveServicesDesc: 'We provide everything you need to complete your project successfully',
    valueForTime: 'Value for Time',
    valueForTimeDesc: 'We respect your time and help you complete your projects quickly',
    freedomInDealings: 'Freedom in Dealings',
    freedomInDealingsDesc: 'Direct communication between project owners and professional freelancers',

    // Home Page - Stats
    completedProjects: 'Completed Projects',
    professionalFreelancers: 'Professional Freelancers',
    satisfiedClients: 'Satisfied Clients',
    successRate: 'Success Rate',

    // Home Page - How it Works
    howItWorks: 'How SHOGOL Works?',
    threeSimpleSteps: 'Three simple steps to complete your project',
    postYourProjectStep: 'Post Your Project',
    postYourProjectStepDesc: 'Add your project details, budget, and required timeline',
    receiveOffers: 'Receive Offers',
    receiveOffersDesc: 'Freelancers will submit their offers and you choose the best one',
    completeProject: 'Complete Project',
    completeProjectDesc: 'Collaborate with the chosen freelancer and complete your project successfully',

    // Home Page - New
    searchServices: 'Search for jobs...',
    browseAll: 'Browse All',
    servicesTitle: 'Top professional services to develop and grow your business',
    someServices: 'Some SHOGOL services',
    marketPrice: 'Discover Market Prices',
    saveTime: 'Save Time',
    infoTitle: 'Information',
    whyRequestQuoteTitle: 'Why Request a Quote?',
    firstReason: 'First: You will request, not search, saving search effort',
    secondReason: 'Second: You will discover the market price for the service you need',
    thirdReason: 'Third: You will browse CVs of freelancers ready to serve you',
    fourthReason: 'Fourth: You will choose the price and freelancer that suits you with confidence',
    newProjects: 'New Projects',
    technicalSupport: 'Integrated Technical Support',
    transparency: 'Service Transparency',
    heroDesc: 'A distinctive platform collecting service seekers and specialized professionals. Post your project and get the best offers, or search and apply for projects that suit you.',
    noResults: 'No results found',
    searching: 'Searching...',

    // Public Profile
    aboutMe: 'About Me',
    portfolio: 'Portfolio',
    reviewsRatings: 'Reviews & Ratings',
    skills: 'Skills',
    location: 'Location',
    joinedSince: 'Joined Since',
    lastOnline: 'Last Online',
    contactMe: 'Contact Me',
    copyLink: 'Copy Link',
    report: 'Report',
    completedProjectsCount: 'Completed Projects',
    completionRate: 'Completion Rate',
    viewProject: 'View Project',
    worksCount: 'Works',
    noWorks: 'No portfolio items added yet',
    noReviews: 'No reviews yet',
    noSkills: 'No skills added',
    online: 'Online',
    viewPublicProfile: 'View Public Profile',
    noBio: 'No bio available.',
    unknown: 'Unknown',
    unspecified: 'Unspecified',

    // Home Page - CTA
    readyToStart: 'Ready to Get Started?',
    joinThousands: 'Join thousands of successful freelancers and project owners',
    startNowFree: 'Start Now for Free',
    learnMore: 'Learn More',

    // Footer
    footerDesc: 'A professional freelancing platform connecting project owners with professional freelancers in the Arab world',
    links: 'Links',
    helpCenter: 'Help Center',
    termsOfUse: 'Terms of Use',
    guaranteeRights: 'Guarantee Your Rights',
    pages: 'Pages',
    newRegistration: 'New Registration',
    browseAllRequests: 'Browse All Requests',
    applyAsExpert: 'Apply as Expert',
    downloadApp: 'Download SHOGOL App',
    downloadAppDesc: 'Comprehensive services, value for time, freedom in dealings',
    availableOn: 'Available on',
    allRightsReserved: 'All Rights Reserved',
    professionalPlatform: 'Professional Freelancing Platform',

    // Notifications
    notificationsTitle: 'Notifications',
    unreadNotifications: 'You have {count} unread notifications',
    markAllAsRead: 'Mark all as read',
    marking: 'Marking...',
    noNewNotifications: 'No new notifications',
    allNotificationsMarkedAsRead: 'All notifications marked as read',

    // Messages
    allMessages: 'All Messages',
    refreshConversations: 'Refresh Conversations',
    connected: 'Connected',
    connecting: 'Connecting...',
    reconnecting: 'Reconnecting...',
    disconnected: 'Disconnected',
    searchHere: 'Search here',
    noConversations: 'No conversations',
    typing: 'typing...',
    noMessagesYet: 'No messages yet. Start the conversation!',
    sendMessage: 'Send a message',
    sending: 'Sending...',
    send: 'Send',
    selectConversation: 'Select a conversation to start',
    selectToStart: 'Select chat',
    attachment: 'Attachment',
    read: 'Read',
    sent: 'Sent',
  },
};

export type TranslationKey = keyof typeof translations.ar;

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  isArabic: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>('ar');
  const [mounted, setMounted] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage);
        updateDocumentDirection(savedLanguage);
      }
    }
  }, []);

  const updateDocumentDirection = (lang: Language) => {
    if (typeof document !== 'undefined') {
      const dir: Direction = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir', dir);
      document.documentElement.setAttribute('lang', lang);
    }
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLanguage);
    }
    updateDocumentDirection(newLanguage);
  };

  const toggleLanguage = () => {
    const newLanguage: Language = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLanguage);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  const value: LanguageContextType = {
    language,
    direction,
    setLanguage,
    toggleLanguage,
    t,
    isArabic: language === 'ar',
  };

  // Prevent flash
  if (!mounted) {
    return null;
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

