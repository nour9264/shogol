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
import MainContent from '@/components/Layout/MainContent';
import ToastContainer from '@/components/Common/ToastContainer';
import OfflineToast from '@/components/Common/OfflineToast';
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
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SHOGOL',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'SHOGOL',
    title: 'SHOGOL - منصة العمل الحر',
    description: 'منصة احترافية للعمل الحر والبحث عن الموهوبين',
  },
  twitter: {
    card: 'summary',
    title: 'SHOGOL - منصة العمل الحر',
    description: 'منصة احترافية للعمل الحر والبحث عن الموهوبين',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
    <html suppressHydrationWarning>
      <body suppressHydrationWarning className={cairo.className}>
        <Script src="/config.js" strategy="beforeInteractive" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <ToastProvider>
                <NotificationProvider>
                  <div className={`flex flex-col h-screen overflow-hidden ${cairo.className}`} style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
                    <Header />
                    <main className="flex-grow overflow-y-auto custom-scrollbar" dir="ltr">
                      <MainContent>
                        {children}
                        <Footer />
                      </MainContent>
                    </main>
                    <ToastContainer />
                    <OfflineToast />
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
