'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaQuestionCircle, FaUserPlus, FaBriefcase, FaMoneyBillWave, FaShieldAlt, FaHeadset, FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';

interface FAQItem {
  question: { ar: string; en: string };
  answer: { ar: string; en: string };
}

interface FAQCategory {
  title: { ar: string; en: string };
  icon: React.ReactNode;
  faqs: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    title: { ar: 'التسجيل والحساب', en: 'Registration & Account' },
    icon: <FaUserPlus className="text-2xl" />,
    faqs: [
      {
        question: { ar: 'كيف أنشئ حساب جديد؟', en: 'How do I create a new account?' },
        answer: {
          ar: 'يمكنك إنشاء حساب جديد بالضغط على "تسجيل جديد" في الصفحة الرئيسية، ثم ملء البيانات المطلوبة واختيار نوع الحساب (مستقل أو عميل).',
          en: 'You can create a new account by clicking "Register" on the homepage, then filling in the required information and selecting your account type (Freelancer or Client).'
        },
      },
      {
        question: { ar: 'نسيت كلمة المرور، ماذا أفعل؟', en: 'I forgot my password, what should I do?' },
        answer: {
          ar: 'اضغط على "نسيت كلمة المرور" في صفحة تسجيل الدخول، ثم أدخل بريدك الإلكتروني وسنرسل لك رمز تحقق لإعادة تعيين كلمة المرور.',
          en: 'Click "Forgot Password" on the login page, enter your email, and we will send you a verification code to reset your password.'
        },
      },
      {
        question: { ar: 'كيف أعدل بيانات حسابي؟', en: 'How do I edit my account information?' },
        answer: {
          ar: 'بعد تسجيل الدخول، اذهب إلى "الملف الشخصي" واضغط على "تعديل الملف الشخصي" لتحديث بياناتك.',
          en: 'After logging in, go to "Profile" and click "Edit Profile" to update your information.'
        },
      },
    ],
  },
  {
    title: { ar: 'المشاريع والطلبات', en: 'Projects & Requests' },
    icon: <FaBriefcase className="text-2xl" />,
    faqs: [
      {
        question: { ar: 'كيف أنشر مشروعًا جديدًا؟', en: 'How do I post a new project?' },
        answer: {
          ar: 'سجل دخول كعميل، ثم اضغط على "انشر مشروع" واملأ تفاصيل المشروع والميزانية والمدة المتوقعة.',
          en: 'Log in as a client, then click "Post a Project" and fill in the project details, budget, and expected duration.'
        },
      },
      {
        question: { ar: 'كيف أقدم عرضًا على مشروع؟', en: 'How do I submit a proposal for a project?' },
        answer: {
          ar: 'سجل دخول كمستقل، ابحث عن المشاريع المناسبة، واضغط على "قدم عرضك" ثم أدخل السعر والمدة والرسالة.',
          en: 'Log in as a freelancer, search for suitable projects, click "Submit Proposal" and enter your price, duration, and message.'
        },
      },
      {
        question: { ar: 'هل يمكنني التعديل على عرضي بعد إرساله؟', en: 'Can I edit my proposal after submitting it?' },
        answer: {
          ar: 'نعم، يمكنك تعديل أو حذف عرضك طالما لم يتم قبوله من قبل العميل.',
          en: 'Yes, you can edit or delete your proposal as long as it has not been accepted by the client.'
        },
      },
    ],
  },
  {
    title: { ar: 'المدفوعات والأرباح', en: 'Payments & Earnings' },
    icon: <FaMoneyBillWave className="text-2xl" />,
    faqs: [
      {
        question: { ar: 'كيف أستلم أرباحي؟', en: 'How do I receive my earnings?' },
        answer: {
          ar: 'بعد اكتمال المشروع وموافقة العميل، تُحول الأرباح إلى رصيدك في المنصة ويمكنك سحبها عبر طرق الدفع المتاحة.',
          en: 'After the project is completed and approved by the client, the earnings are transferred to your platform balance and can be withdrawn via available payment methods.'
        },
      },
      {
        question: { ar: 'ما هي طرق الدفع المتاحة؟', en: 'What payment methods are available?' },
        answer: {
          ar: 'نوفر عدة طرق للدفع منها: التحويل البنكي، PayPal، البطاقات الائتمانية، وخدمات الدفع الإلكتروني المحلية.',
          en: 'We provide several payment methods including: Bank transfer, PayPal, Credit cards, and local electronic payment services.'
        },
      },
      {
        question: { ar: 'ما هي نسبة عمولة المنصة؟', en: 'What is the platform commission rate?' },
        answer: {
          ar: 'تأخذ المنصة عمولة 10% من قيمة كل مشروع مكتمل كرسوم خدمة.',
          en: 'The platform takes a 10% commission from each completed project as a service fee.'
        },
      },
    ],
  },
  {
    title: { ar: 'الأمان والحماية', en: 'Security & Protection' },
    icon: <FaShieldAlt className="text-2xl" />,
    faqs: [
      {
        question: { ar: 'كيف تحمي المنصة حقوقي؟', en: 'How does the platform protect my rights?' },
        answer: {
          ar: 'نوفر نظام ضمان يحمي حقوق الطرفين، حيث يتم حجز المبلغ حتى اكتمال المشروع وموافقة العميل.',
          en: 'We provide an escrow system that protects both parties, where the amount is held until the project is completed and approved by the client.'
        },
      },
      {
        question: { ar: 'ماذا أفعل في حالة نزاع؟', en: 'What do I do in case of a dispute?' },
        answer: {
          ar: 'يمكنك فتح نزاع من صفحة المشروع وسيتدخل فريق الدعم لحل المشكلة بشكل عادل.',
          en: 'You can open a dispute from the project page and our support team will intervene to resolve the issue fairly.'
        },
      },
      {
        question: { ar: 'هل بياناتي آمنة؟', en: 'Is my data safe?' },
        answer: {
          ar: 'نعم، نستخدم أحدث تقنيات التشفير لحماية بياناتك الشخصية والمالية.',
          en: 'Yes, we use the latest encryption technologies to protect your personal and financial data.'
        },
      },
    ],
  },
];

export const dynamic = 'force-dynamic';

export default function HelpCenterPage() {
  const { isArabic } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<number[]>([0]);
  const [openFaqs, setOpenFaqs] = useState<string[]>([]);

  const toggleCategory = (index: number) => {
    setOpenCategories(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const toggleFaq = (key: string) => {
    setOpenFaqs(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {isArabic ? 'مركز المساعدة' : 'Help Center'}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            {isArabic
              ? 'ابحث عن إجابات لأسئلتك أو تواصل مع فريق الدعم'
              : 'Find answers to your questions or contact our support team'}
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto relative">
            <FaSearch className="absolute right-4 rtl:right-4 ltr:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isArabic ? 'ابحث عن سؤالك...' : 'Search for your question...'}
              className="w-full px-12 py-4 rounded-xl text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-0 focus:ring-2 focus:ring-primary-300"
            />
          </div>
        </div>
      </section>

      <div className="container-custom py-12">
        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {faqCategories.map((category, index) => (
            <button
              key={index}
              onClick={() => {
                setOpenCategories([index]);
                document.getElementById(`category-${index}`)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-soft hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-3 text-primary-600 dark:text-primary-400 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                {category.icon}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                {isArabic ? category.title.ar : category.title.en}
              </h3>
            </button>
          ))}
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {faqCategories.map((category, catIndex) => (
            <div
              key={catIndex}
              id={`category-${catIndex}`}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleCategory(catIndex)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                    {category.icon}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isArabic ? category.title.ar : category.title.en}
                  </h2>
                </div>
                {openCategories.includes(catIndex) ? (
                  <FaChevronUp className="text-gray-400" />
                ) : (
                  <FaChevronDown className="text-gray-400" />
                )}
              </button>

              {openCategories.includes(catIndex) && (
                <div className="px-6 pb-6 space-y-3">
                  {category.faqs.map((faq, faqIndex) => {
                    const faqKey = `${catIndex}-${faqIndex}`;
                    const isOpen = openFaqs.includes(faqKey);
                    return (
                      <div
                        key={faqIndex}
                        className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFaq(faqKey)}
                          className="w-full flex items-center justify-between p-4 text-left bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">
                            {isArabic ? faq.question.ar : faq.question.en}
                          </span>
                          {isOpen ? (
                            <FaChevronUp className="text-gray-400 flex-shrink-0 ml-4" />
                          ) : (
                            <FaChevronDown className="text-gray-400 flex-shrink-0 ml-4" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="p-4 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                            {isArabic ? faq.answer.ar : faq.answer.en}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-8 text-center text-white">
          <FaHeadset className="text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {isArabic ? 'لم تجد إجابتك؟' : "Didn't find your answer?"}
          </h2>
          <p className="text-white/90 mb-6">
            {isArabic
              ? 'فريق الدعم جاهز لمساعدتك على مدار الساعة'
              : 'Our support team is ready to help you 24/7'}
          </p>
          <Link href="/contact" className="btn bg-white text-primary-600 hover:bg-gray-100">
            {isArabic ? 'تواصل مع الدعم' : 'Contact Support'}
          </Link>
        </div>
      </div>
    </div>
  );
}

