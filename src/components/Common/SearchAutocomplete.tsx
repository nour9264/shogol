import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { jobService } from '@/services/api';
import { formatCurrency } from '@/utils/helpers';

interface JobSuggestion {
    id: number;
    title: string;
    budget: number;
    descriptionPreview: string;
}

export default function SearchAutocomplete() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<JobSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await jobService.autocomplete(query, 8);
                setSuggestions(response.data.suggestions || []);
                setIsOpen(true);
            } catch (error) {
                console.error('Search error:', error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleSelectJob(suggestions[selectedIndex].id);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                inputRef.current?.blur();
                break;
        }
    };

    const handleSelectJob = (jobId: number) => {
        setIsOpen(false);
        setQuery('');
        setSuggestions([]);
        router.push(`/jobs/${jobId}`);
    };

    const handleClear = () => {
        setQuery('');
        setSuggestions([]);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    return (
        <div ref={searchRef} className="relative w-full max-w-md">
            {/* Search Input */}
            <div className="relative">
                <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && suggestions.length > 0 && setIsOpen(true)}
                    placeholder="ابحث عن وظائف..."
                    className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all"
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <FaTimes size={14} />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                    {loading && (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                            جاري البحث...
                        </div>
                    )}

                    {!loading && suggestions.length === 0 && query.length >= 2 && (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                            لا توجد نتائج
                        </div>
                    )}

                    {!loading && suggestions.length > 0 && (
                        <ul className="py-2">
                            {suggestions.map((job, index) => (
                                <li
                                    key={job.id}
                                    onClick={() => handleSelectJob(job.id)}
                                    className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${index === selectedIndex
                                            ? 'bg-primary-50 dark:bg-primary-900/20'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                                                {job.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                {job.descriptionPreview}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold rounded">
                                                {formatCurrency(job.budget)}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
