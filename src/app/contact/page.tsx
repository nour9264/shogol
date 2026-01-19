'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';

export const dynamic = 'force-dynamic';

export default function ContactPage() {
  const { isArabic } = useLanguage();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending message
    setTimeout(() => {
      success(isArabic ? 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً' : 'Your message has been sent successfully! We will contact you soon');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen transition-colors" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {isArabic ? 'تواصل معنا' : 'Contact Us'}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {isArabic
              ? 'نحن هنا لمساعدتك! تواصل معنا لأي استفسار أو اقتراح'
              : 'We are here to help! Contact us for any inquiry or suggestion'}
          </p>
        </div>
      </section>

      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Email Card */}
            <div className="card rounded-2xl p-6 transition-colors">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
                <FaEnvelope className="text-2xl text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                {isArabic ? 'البريد الإلكتروني' : 'Email'}
              </h3>
              <p style={{ color: 'rgb(var(--text-secondary))' }}>support@shogol.com</p>
              <p style={{ color: 'rgb(var(--text-secondary))' }}>info@shogol.com</p>
            </div>

            {/* Phone Card */}
            <div className="card rounded-2xl p-6 transition-colors">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
                <FaPhone className="text-2xl text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                {isArabic ? 'الهاتف' : 'Phone'}
              </h3>
              <p style={{ color: 'rgb(var(--text-secondary))' }} dir="ltr">+966 50 123 4567</p>
              <p style={{ color: 'rgb(var(--text-secondary))' }} dir="ltr">+20 10 123 4567</p>
            </div>

            {/* Location Card */}
            <div className="card rounded-2xl p-6 transition-colors">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4">
                <FaMapMarkerAlt className="text-2xl text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                {isArabic ? 'العنوان' : 'Address'}
              </h3>
              <p style={{ color: 'rgb(var(--text-secondary))' }}>
                {isArabic ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}
              </p>
            </div>

            {/* Social Media */}
            <div className="card rounded-2xl p-6 transition-colors">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>
                {isArabic ? 'تابعنا' : 'Follow Us'}
              </h3>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors">
                  <FaFacebook size={18} />
                </a>
                <a href="#" className="w-10 h-10 bg-sky-500 hover:bg-sky-600 text-white rounded-full flex items-center justify-center transition-colors">
                  <FaTwitter size={18} />
                </a>
                <a href="#" className="w-10 h-10 bg-pink-600 hover:bg-pink-700 text-white rounded-full flex items-center justify-center transition-colors">
                  <FaInstagram size={18} />
                </a>
                <a href="#" className="w-10 h-10 bg-blue-700 hover:bg-blue-800 text-white rounded-full flex items-center justify-center transition-colors">
                  <FaLinkedin size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card rounded-2xl p-8 transition-colors">
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'rgb(var(--text-primary))' }}>
                {isArabic ? 'أرسل لنا رسالة' : 'Send us a message'}
              </h2>
              <form
                onSubmit={handleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13) {
                    const tagName = (e.target as HTMLElement).tagName.toLowerCase();
                    if (tagName === 'textarea') return;
                    e.preventDefault();
                    const form = e.currentTarget;
                    if (form && typeof form.requestSubmit === 'function') {
                      form.requestSubmit();
                    }
                  }
                }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">
                      {isArabic ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      placeholder={isArabic ? 'أدخل اسمك' : 'Enter your name'}
                    />
                  </div>
                  <div>
                    <label className="label">
                      {isArabic ? 'البريد الإلكتروني' : 'Email'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                      placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">
                    {isArabic ? 'الموضوع' : 'Subject'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input"
                    placeholder={isArabic ? 'موضوع الرسالة' : 'Message subject'}
                  />
                </div>
                <div>
                  <label className="label">
                    {isArabic ? 'الرسالة' : 'Message'} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="input resize-none"
                    placeholder={isArabic ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary w-full md:w-auto px-8 flex items-center justify-center gap-2">
                  <FaPaperPlane />
                  {loading
                    ? (isArabic ? 'جاري الإرسال...' : 'Sending...')
                    : (isArabic ? 'إرسال الرسالة' : 'Send Message')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

