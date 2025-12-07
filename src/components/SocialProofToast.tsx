import React, { useState, useEffect } from 'react';

// Weights: Higher number = more likely to be picked
const LOCATIONS = [
    // UK (Prominent)
    { city: 'London', flag: '🇬🇧', weight: 10 },
    { city: 'Manchester', flag: '🇬🇧', weight: 8 },
    { city: 'Birmingham', flag: '🇬🇧', weight: 7 },
    { city: 'Leeds', flag: '🇬🇧', weight: 6 },
    { city: 'Bristol', flag: '🇬🇧', weight: 5 },
    { city: 'Liverpool', flag: '🇬🇧', weight: 5 },
    { city: 'Cardiff', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', weight: 4 }, // Wales
    { city: 'Belfast', flag: '🇬🇧', weight: 4 },

    // Scotland (Prominent)
    { city: 'Edinburgh', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', weight: 8 },
    { city: 'Glasgow', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', weight: 8 },
    { city: 'Aberdeen', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', weight: 4 },
    { city: 'Dundee', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', weight: 3 },

    // Europe (Accessing remotely/managing)
    { city: 'Dublin', flag: '🇮🇪', weight: 3 },
    { city: 'Berlin', flag: '🇩🇪', weight: 2 },
    { city: 'Paris', flag: '🇫🇷', weight: 2 },
    { city: 'Amsterdam', flag: '🇳🇱', weight: 2 },
    { city: 'Stockholm', flag: '🇸🇪', weight: 2 },
    { city: 'Madrid', flag: '🇪🇸', weight: 1 },
    { city: 'Copenhagen', flag: '🇩🇰', weight: 1 },
    { city: 'Brussels', flag: '🇧🇪', weight: 1 },
    { city: 'Warsaw', flag: '🇵🇱', weight: 1 },
    { city: 'Oslo', flag: '🇳🇴', weight: 1 }
];

const INDUSTRIES = [
    'Construction',
    'Healthcare',
    'IT Services',
    'Cleaning',
    'Security',
    'Education',
    'Transport',
    'Facilities',
    'Legal',
    'Marketing'
];

type ActionType = 'view' | 'analyse' | 'draft' | 'invite' | 'signup' | 'search';

const ACTIONS: { type: ActionType; template: (city: string, industry: string) => string; weight: number }[] = [
    {
        type: 'view',
        template: (city, industry) => `Someone from ${city} just viewed a ${industry} tender`,
        weight: 10
    },
    {
        type: 'analyse',
        template: (city) => `Someone from ${city} just analysed a tender document`,
        weight: 8
    },
    {
        type: 'draft',
        template: (city, industry) => `Someone from ${city} is drafting a ${industry} proposal`,
        weight: 6
    },
    {
        type: 'invite',
        template: (city) => `Someone from ${city} just invited a team member`,
        weight: 4
    },
    {
        type: 'signup',
        template: (city) => `Someone from ${city} just signed up for a free trial`,
        weight: 5
    },
    {
        type: 'search',
        template: (city, industry) => `Someone from ${city} searched for ${industry} contracts`,
        weight: 7
    }
];

// Weighted random selector
const getWeightedRandom = <T extends { weight: number }>(items: T[]): T => {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of items) {
        random -= item.weight;
        if (random <= 0) return item;
    }
    return items[0];
};

const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const SocialProofToast: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [config, setConfig] = useState({
        message: '',
        flag: '',
    });
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        // Initial delay
        const initialTimer = setTimeout(() => {
            showRandomToast();
        }, 2500);

        // Loop interval (varying slightly to feel natural)
        const loopTimer = setInterval(() => {
            showRandomToast();
        }, 12000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(loopTimer);
        };
    }, []);

    const showRandomToast = () => {
        // 1. Select Location (Weighted for UK/Scotland)
        const location = getWeightedRandom(LOCATIONS);

        // 2. Select Action (Weighted)
        const action = getWeightedRandom(ACTIONS);

        // 3. Select Random Industry (for context)
        const industry = getRandom(INDUSTRIES);

        // 4. Generate Message
        const message = action.template(location.city, industry);

        setConfig({ message, flag: location.flag });
        setIsVisible(true);

        // Hide after 6 seconds
        setTimeout(() => setIsVisible(false), 6000);
    };

    if (!isClient) return null;

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 transform transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
                }`}
        >
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100 p-4 flex items-center gap-4 max-w-sm hover:shadow-2xl transition-shadow cursor-default ring-1 ring-black/5">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-xl shadow-inner border border-gray-100">
                    {config.flag}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-snug">
                        {config.message}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Just now
                    </p>
                </div>
            </div>
        </div>
    );
};
