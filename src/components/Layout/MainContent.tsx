'use client';

import { useLanguage } from '@/context/LanguageContext';
import styles from './MainContent.module.css';

interface MainContentProps {
    children: React.ReactNode;
}

const MainContent = ({ children }: MainContentProps) => {
    const { isArabic } = useLanguage();

    return (
        <div
            className="min-h-full flex flex-col"
            dir={isArabic ? 'rtl' : 'ltr'}
        >
            {children}
        </div>
    );
};

export default MainContent;
