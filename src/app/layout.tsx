import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Cairo } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { NotificationProvider } from '@/context/NotificationContext';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ToastContainer from '@/components/Common/ToastContainer';
import '@/app/globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SHOGOL - منصة العمل الحر',
  description: 'منصة احترافية للعمل الحر والبحث عن الموهوبين',
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

// Script to prevent flash of wrong theme - default to light mode
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('shogol-theme');
      if (!theme) {
        theme = 'light';
      }
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      document.documentElement.classList.add('light');
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning className={cairo.className}>
        <Script src="/config.js" strategy="beforeInteractive" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <ToastProvider>
                <NotificationProvider>
                  <div className={`flex flex-col min-h-screen ${cairo.className}`}>
                    <Header />
                    <main className="flex-grow overflow-hidden">{children}</main>
                    <Footer />
                    <ToastContainer />
                  </div>
                </NotificationProvider>
              </ToastProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
