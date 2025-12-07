import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Zap } from 'lucide-react';

// Get week number to determine base bid count
const getWeekNumber = (date: Date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
};

// Dynamic stat templates with realistic variability
const generateStats = () => {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const weekNumber = getWeekNumber(now);

    // Determine if it's a weekend
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Weekly bid pattern: Reset on Monday, grow through week
    const getDayOfWeekMultiplier = () => {
        if (isWeekend) return 0.05;
        switch (dayOfWeek) {
            case 1: return 0.3;
            case 2: return 0.6;
            case 3: return 0.8;
            case 4: return 0.95;
            case 5: return 1.0;
            default: return 0.3;
        }
    };

    const weekBase = 120 + (weekNumber * 2);
    const dayMultiplier = getDayOfWeekMultiplier();
    const randomVariance = Math.floor(Math.random() * 30) - 15;
    const bidsThisWeek = Math.max(10, Math.floor(weekBase * dayMultiplier) + randomVariance);
    const totalCompanies = 500 + (weekNumber * 2);
    const getActiveNow = () => {
        if (isWeekend) return 2 + Math.floor(Math.random() * 4);
        if (hour >= 9 && hour <= 17) return 25 + Math.floor(Math.random() * 20);
        else if (hour >= 18 && hour <= 21) return 10 + Math.floor(Math.random() * 10);
        else return 3 + Math.floor(Math.random() * 5);
    };

    return {
        bidsThisWeek,
        totalCompanies,
        activeNow: getActiveNow(),
        timestamp: Date.now()
    };
};

const statTemplates = [
    {
        icon: TrendingUp,
        getMessage: (stats: ReturnType<typeof generateStats>) =>
            `${stats.bidsThisWeek.toLocaleString()} bids prepared this week`,
    },
    {
        icon: Users,
        getMessage: (stats: ReturnType<typeof generateStats>) =>
            `${stats.totalCompanies}+ companies trust Bidwel`,
    },
    {
        icon: Zap,
        getMessage: (stats: ReturnType<typeof generateStats>) =>
            `${stats.activeNow} companies preparing bids right now`,
    },
];

const AVATAR_POOL = [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    "https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80",
];

export const SocialProof: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stats, setStats] = useState(generateStats());
    const [isAnimating, setIsAnimating] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % statTemplates.length);
                setStats(generateStats());
                setIsAnimating(false);
            }, 500);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    if (!isClient) return null; // Avoid hydration mismatch

    const currentStat = statTemplates[currentIndex];
    const Icon = currentStat.icon;
    const AVATARS = AVATAR_POOL.slice(0, 4);

    return (
        <div className="group relative overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 max-w-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-50" />
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-xl" />

            <div className="relative px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
                <div className="hidden sm:flex -space-x-2 flex-shrink-0">
                    {AVATARS.map((src, i) => (
                        <img key={i} src={src} alt="User" className="w-8 h-8 rounded-full border-2 border-white object-cover ring-1 ring-gray-100" />
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 ring-1 ring-gray-100">+500</div>
                </div>

                <div className="flex-1 flex justify-center min-w-0 px-1 sm:px-2">
                    <div className={`flex items-center gap-2 transition-all duration-500 transform ${isAnimating ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>
                        <p className="text-xs sm:text-sm font-bold text-gray-900 leading-none truncate">
                            {currentStat.getMessage(stats)}
                        </p>
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 flex-shrink-0 border-l border-gray-200 pl-4">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Live</span>
                </div>
            </div>
        </div>
    );
};
