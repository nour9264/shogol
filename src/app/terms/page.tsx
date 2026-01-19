'use client';

import Link from 'next/link';
import { FaFileContract, FaUserCheck, FaBriefcase, FaMoneyBillWave, FaShieldAlt, FaBan, FaGavel } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';

interface TermsSection {
  icon: React.ReactNode;
  title: { ar: string; en: string };
  content: { ar: string[]; en: string[] };
}

const termsSections: TermsSection[] = [
  {
    icon: <FaUserCheck className="text-2xl" />,
    title: { ar: 'شروط التسجيل', en: 'Registration Terms' },
    content: {
      ar: [
        'يجب أن يكون عمر المستخدم 18 عامًا على الأقل للتسجيل في المنصة.',
        'يجب تقديم معلومات صحيحة ودقيقة عند التسجيل.',
        'المستخدم مسؤول عن الحفاظ على سرية بيانات حسابه.',
        'يحق للمنصة إيقاف أو حذف الحسابات التي تنتهك الشروط.',
        'لا يجوز امتلاك أكثر من حساب واحد على المنصة.',
      ],
      en: [
        'Users must be at least 18 years old to register on the platform.',
        'Accurate and correct information must be provided during registration.',
        'Users are responsible for maintaining the confidentiality of their account information.',
        'The platform reserves the right to suspend or delete accounts that violate the terms.',
        'Having more than one account on the platform is not allowed.',
      ],
    },
  },
  {
    icon: <FaBriefcase className="text-2xl" />,
    title: { ar: 'شروط استخدام الخدمات', en: 'Service Usage Terms' },
    content: {
      ar: [
        'يجب استخدام المنصة للأغراض المشروعة فقط.',
        'يُمنع نشر محتوى مخالف للقوانين أو الآداب العامة.',
        'يجب الالتزام بالمواعيد النهائية المتفق عليها للمشاريع.',
        'التواصل مع العملاء يجب أن يتم عبر المنصة فقط.',
        'يُمنع محاولة التعامل خارج المنصة لتجنب العمولة.',
      ],
      en: [
        'The platform must be used for legitimate purposes only.',
        'Publishing content that violates laws or public morals is prohibited.',
        'Agreed-upon project deadlines must be respected.',
        'Communication with clients must be done through the platform only.',
        'Attempting to deal outside the platform to avoid commission is prohibited.',
      ],
    },
  },
  {
    icon: <FaMoneyBillWave className="text-2xl" />,
    title: { ar: 'شروط الدفع والعمولة', en: 'Payment & Commission Terms' },
    content: {
      ar: [
        'تأخذ المنصة عمولة 10% من قيمة كل مشروع مكتمل.',
        'يتم تحويل المدفوعات خلال 3-5 أيام عمل بعد اكتمال المشروع.',
        'الحد الأدنى للسحب هو 50 دولار أمريكي أو ما يعادله.',
        'المنصة غير مسؤولة عن رسوم التحويل البنكي.',
        'يجب إكمال المشروع بالكامل لاستحقاق الدفع.',
      ],
      en: [
        'The platform takes a 10% commission from each completed project.',
        'Payments are transferred within 3-5 business days after project completion.',
        'The minimum withdrawal amount is $50 USD or equivalent.',
        'The platform is not responsible for bank transfer fees.',
        'The project must be fully completed to be eligible for payment.',
      ],
    },
  },
  {
    icon: <FaShieldAlt className="text-2xl" />,
    title: { ar: 'حماية الملكية الفكرية', en: 'Intellectual Property Protection' },
    content: {
      ar: [
        'جميع حقوق العمل المنجز تنتقل للعميل بعد الدفع الكامل.',
        'يُمنع استخدام أعمال الآخرين دون إذن.',
        'المستقل مسؤول عن ضمان أصالة أعماله.',
        'يحق للمستقل عرض الأعمال في معرض أعماله بعد موافقة العميل.',
        'المنصة تحترم حقوق الملكية الفكرية وتتعامل مع الشكاوى بجدية.',
      ],
      en: [
        'All rights to completed work transfer to the client after full payment.',
        'Using others\' work without permission is prohibited.',
        'Freelancers are responsible for ensuring the originality of their work.',
        'Freelancers may display work in their portfolio with client approval.',
        'The platform respects intellectual property rights and handles complaints seriously.',
      ],
    },
  },
  {
    icon: <FaBan className="text-2xl" />,
    title: { ar: 'السلوكيات المحظورة', en: 'Prohibited Behaviors' },
    content: {
      ar: [
        'التحرش أو الإساءة للمستخدمين الآخرين.',
        'نشر معلومات كاذبة أو مضللة.',
        'محاولة الاحتيال أو النصب.',
        'استخدام المنصة لأغراض غير قانونية.',
        'إنشاء حسابات وهمية أو تقييمات مزيفة.',
        'مشاركة بيانات التواصل الشخصية لتجنب العمولة.',
      ],
      en: [
        'Harassment or abuse of other users.',
        'Posting false or misleading information.',
        'Attempting fraud or scams.',
        'Using the platform for illegal purposes.',
        'Creating fake accounts or reviews.',
        'Sharing personal contact information to avoid commission.',
      ],
    },
  },
  {
    icon: <FaGavel className="text-2xl" />,
    title: { ar: 'حل النزاعات', en: 'Dispute Resolution' },
    content: {
      ar: [
        'في حالة النزاع، يجب محاولة الحل الودي أولاً.',
        'يمكن فتح نزاع رسمي خلال 14 يومًا من اكتمال المشروع.',
        'فريق الدعم سيراجع الأدلة ويتخذ قرارًا عادلاً.',
        'قرار المنصة في النزاعات يكون نهائيًا وملزمًا.',
        'المنصة تحتفظ بحق تعليق الحسابات أثناء التحقيق.',
      ],
      en: [
        'In case of dispute, an amicable resolution should be attempted first.',
        'A formal dispute can be opened within 14 days of project completion.',
        'The support team will review evidence and make a fair decision.',
        'The platform\'s decision in disputes is final and binding.',
        'The platform reserves the right to suspend accounts during investigation.',
      ],
    },
  },
];

export const dynamic = 'force-dynamic';

export default function TermsPage() {
  const { isArabic } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container-custom text-center">
          <FaFileContract className="text-5xl mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {isArabic ? 'شروط الاستخدام' : 'Terms of Use'}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {isArabic
              ? 'يرجى قراءة شروط الاستخدام بعناية قبل استخدام منصة شغل'
              : 'Please read the terms of use carefully before using the SHOGOL platform'}
          </p>
          <p className="text-sm text-white/70 mt-4">
            {isArabic ? 'آخر تحديث: ديسمبر 2024' : 'Last updated: December 2024'}
          </p>
        </div>
      </section>

      <div className="container-custom py-12">
        {/* Introduction */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-8 mb-8 transition-colors">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {isArabic ? 'مقدمة' : 'Introduction'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {isArabic
              ? 'مرحبًا بك في منصة شغل للعمل الحر. باستخدامك للمنصة، فإنك توافق على الالتزام بشروط الاستخدام هذه. تحكم هذه الشروط العلاقة بينك وبين المنصة وتحدد حقوق والتزامات كل طرف. نحتفظ بحق تعديل هذه الشروط في أي وقت، وسيتم إعلامك بأي تغييرات جوهرية.'
              : 'Welcome to the SHOGOL freelancing platform. By using the platform, you agree to comply with these terms of use. These terms govern the relationship between you and the platform and define the rights and obligations of each party. We reserve the right to modify these terms at any time, and you will be notified of any material changes.'}
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {termsSections.map((section, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-8 transition-colors"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isArabic ? section.title.ar : section.title.en}
                </h2>
              </div>
              <ul className="space-y-3">
                {(isArabic ? section.content.ar : section.content.en).map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    className="flex items-start gap-3 text-gray-600 dark:text-gray-300"
                  >
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 text-center transition-colors">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {isArabic ? 'هل لديك أسئلة؟' : 'Have questions?'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {isArabic
              ? 'إذا كان لديك أي استفسار حول شروط الاستخدام، تواصل معنا'
              : 'If you have any questions about the terms of use, contact us'}
          </p>
          <Link href="/contact" className="btn btn-primary">
            {isArabic ? 'تواصل معنا' : 'Contact Us'}
          </Link>
        </div>
      </div>
    </div>
  );
}

