'use client';

import Link from 'next/link';
import { FaShieldAlt, FaUserLock, FaDatabase, FaCookie, FaShareAlt, FaUserShield, FaEnvelope } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';

interface PrivacySection {
  icon: React.ReactNode;
  title: { ar: string; en: string };
  content: { ar: string; en: string };
}

const privacySections: PrivacySection[] = [
  {
    icon: <FaDatabase className="text-2xl" />,
    title: { ar: 'البيانات التي نجمعها', en: 'Data We Collect' },
    content: {
      ar: 'نجمع المعلومات التي تقدمها مباشرة عند التسجيل مثل: الاسم، البريد الإلكتروني، رقم الهاتف، والمعلومات المهنية. كما نجمع بيانات الاستخدام تلقائيًا مثل عنوان IP، نوع المتصفح، والصفحات التي تزورها لتحسين تجربتك.',
      en: 'We collect information you provide directly when registering such as: name, email, phone number, and professional information. We also automatically collect usage data such as IP address, browser type, and pages you visit to improve your experience.',
    },
  },
  {
    icon: <FaUserLock className="text-2xl" />,
    title: { ar: 'كيف نستخدم بياناتك', en: 'How We Use Your Data' },
    content: {
      ar: 'نستخدم بياناتك لتقديم خدماتنا وتحسينها، التواصل معك بشأن حسابك ومشاريعك، إرسال إشعارات مهمة، تخصيص تجربتك على المنصة، ومنع الاحتيال وضمان أمان المنصة.',
      en: 'We use your data to provide and improve our services, communicate with you about your account and projects, send important notifications, personalize your experience on the platform, and prevent fraud and ensure platform security.',
    },
  },
  {
    icon: <FaShareAlt className="text-2xl" />,
    title: { ar: 'مشاركة البيانات', en: 'Data Sharing' },
    content: {
      ar: 'لا نبيع بياناتك الشخصية أبدًا. نشارك بعض المعلومات مع: المستخدمين الآخرين (الاسم والملف الشخصي العام)، مزودي الخدمات الموثوقين الذين يساعدوننا في تشغيل المنصة، والسلطات القانونية عند الضرورة.',
      en: 'We never sell your personal data. We share some information with: other users (name and public profile), trusted service providers who help us operate the platform, and legal authorities when necessary.',
    },
  },
  {
    icon: <FaCookie className="text-2xl" />,
    title: { ar: 'ملفات تعريف الارتباط', en: 'Cookies' },
    content: {
      ar: 'نستخدم ملفات تعريف الارتباط لتذكر تفضيلاتك، تحليل استخدام الموقع، وتقديم محتوى مخصص. يمكنك التحكم في ملفات تعريف الارتباط من إعدادات متصفحك، لكن تعطيلها قد يؤثر على بعض وظائف الموقع.',
      en: 'We use cookies to remember your preferences, analyze site usage, and deliver personalized content. You can control cookies from your browser settings, but disabling them may affect some site functionality.',
    },
  },
  {
    icon: <FaUserShield className="text-2xl" />,
    title: { ar: 'حقوقك', en: 'Your Rights' },
    content: {
      ar: 'لديك الحق في: الوصول إلى بياناتك الشخصية، تصحيح البيانات غير الدقيقة، حذف حسابك وبياناتك، الاعتراض على معالجة بياناتك، ونقل بياناتك إلى خدمة أخرى. تواصل معنا لممارسة أي من هذه الحقوق.',
      en: 'You have the right to: access your personal data, correct inaccurate data, delete your account and data, object to processing of your data, and transfer your data to another service. Contact us to exercise any of these rights.',
    },
  },
  {
    icon: <FaShieldAlt className="text-2xl" />,
    title: { ar: 'أمان البيانات', en: 'Data Security' },
    content: {
      ar: 'نتخذ إجراءات أمنية صارمة لحماية بياناتك، منها: التشفير باستخدام SSL/TLS، تخزين آمن للبيانات، مراقبة مستمرة للأنظمة، وتدريب الموظفين على أمان البيانات. ومع ذلك، لا يمكن ضمان الأمان المطلق عبر الإنترنت.',
      en: 'We take strict security measures to protect your data, including: SSL/TLS encryption, secure data storage, continuous system monitoring, and employee training on data security. However, absolute security cannot be guaranteed over the internet.',
    },
  },
];

export default function PrivacyPage() {
  const { isArabic } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
          <div className="container-custom text-center">
            <FaShieldAlt className="text-5xl mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isArabic ? 'سياسة الخصوصية وضمان الحقوق' : 'Privacy Policy & Rights Guarantee'}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {isArabic 
                ? 'نحن ملتزمون بحماية خصوصيتك وضمان حقوقك على منصتنا'
                : 'We are committed to protecting your privacy and guaranteeing your rights on our platform'}
            </p>
            <p className="text-sm text-white/70 mt-4">
              {isArabic ? 'آخر تحديث: ديسمبر 2024' : 'Last updated: December 2024'}
            </p>
          </div>
        </section>

        <div className="container-custom py-12">
          {/* Rights Guarantee Banner */}
          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-8 mb-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FaUserShield className="text-4xl" />
              </div>
              <div className="text-center md:text-right">
                <h2 className="text-2xl font-bold mb-2">
                  {isArabic ? 'ضمان حقوقك 100%' : '100% Rights Guarantee'}
                </h2>
                <p className="text-white/90">
                  {isArabic 
                    ? 'نضمن حقوق جميع المستخدمين من خلال نظام الضمان المالي، فريق دعم متخصص لحل النزاعات، وتشفير كامل لجميع البيانات والمعاملات.'
                    : 'We guarantee the rights of all users through our escrow system, specialized support team for dispute resolution, and full encryption of all data and transactions.'}
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Sections */}
          <div className="grid md:grid-cols-2 gap-6">
            {privacySections.map((section, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6 transition-colors"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                    {section.icon}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {isArabic ? section.title.ar : section.title.en}
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {isArabic ? section.content.ar : section.content.en}
                </p>
              </div>
            ))}
          </div>

          {/* Escrow System */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-8 transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              {isArabic ? 'كيف نحمي حقوقك المالية؟' : 'How Do We Protect Your Financial Rights?'}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {isArabic ? 'حجز المبلغ' : 'Amount Escrow'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isArabic 
                    ? 'عند قبول العرض، يتم حجز المبلغ في حساب آمن'
                    : 'When the offer is accepted, the amount is held in a secure account'}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">2</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {isArabic ? 'تنفيذ العمل' : 'Work Execution'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isArabic 
                    ? 'المستقل ينفذ العمل والعميل يتابع التقدم'
                    : 'Freelancer executes the work and client monitors progress'}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">3</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {isArabic ? 'تحرير المبلغ' : 'Amount Release'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isArabic 
                    ? 'بعد موافقة العميل، يتم تحويل المبلغ للمستقل'
                    : 'After client approval, the amount is transferred to the freelancer'}
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 text-center transition-colors">
            <FaEnvelope className="text-4xl text-primary-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'لديك استفسار عن الخصوصية؟' : 'Have a Privacy Question?'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {isArabic 
                ? 'إذا كان لديك أي سؤال أو طلب يتعلق بخصوصيتك، تواصل معنا'
                : 'If you have any question or request related to your privacy, contact us'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn btn-primary">
                {isArabic ? 'تواصل معنا' : 'Contact Us'}
              </Link>
              <a href="mailto:privacy@shogol.com" className="btn border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                privacy@shogol.com
              </a>
            </div>
          </div>
        </div>
    </div>
  );
}

