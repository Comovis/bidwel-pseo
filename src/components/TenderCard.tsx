import React from 'react';
import { MapPin, Clock, Building2, ArrowRight, Trophy } from 'lucide-react';
import { slugify } from '../utils/slugify';
import { formatValueForCard } from '../utils/contractValue';
import type { Tender } from '../types';

interface TenderCardProps {
    tender: Tender;
    viewMode?: 'grid' | 'list';
}

export const TenderCard: React.FC<TenderCardProps> = ({ tender, viewMode = 'grid' }) => {
    // Clean title for URL (remove special chars, lowercase)
    const cleanedTitle = tender.title.replace(/[^a-zA-Z0-9\s-]/g, '').trim();

    // Extract last segment of OCID for shorter URLs
    const ocidParts = tender.ocid.split('-');
    const ocidSuffix = ocidParts[ocidParts.length - 1];
    const isAwarded = tender.stage?.toLowerCase() === 'award' || tender.stage?.toLowerCase() === 'awarded' || tender.status === 'complete';

    const industrySlug = tender.industry ? slugify(tender.industry) : (tender.region ? slugify(tender.region) : 'tenders');
    // Link to main app detail page with UTM params
    const tenderUrl = `https://bidwel.com/uk/tender/${industrySlug}/${slugify(cleanedTitle)}-${slugify(tender.location)}-${ocidSuffix}?utm_source=bidwel_pseo&utm_medium=referral`;

    const CardContent = () => (
        <>
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        {isAwarded ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                <Trophy className="w-3 h-3 mr-1" />
                                Awarded
                            </span>
                        ) : tender.isSmeFriendly ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                SME Friendly
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Open to All
                            </span>
                        )}
                        <span className={`text-xs flex items-center ${tender.isUrgent ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            <Clock className={`w-3 h-3 mr-1 ${tender.isUrgent ? 'text-red-600' : ''}`} />
                            {tender.deadline}
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[3.5rem] group-hover:text-blue-900 transition-colors">
                        {tender.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                        <Building2 className="w-4 h-4 mr-1.5" />
                        <span className="mr-4 truncate max-w-[100px]">{tender.buyer}</span>
                        <MapPin className="w-4 h-4 mr-1.5" />
                        <span className="truncate max-w-[80px]">{tender.location}</span>
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-600 mb-6 line-clamp-3 flex-grow">
                {tender.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                <div className="text-sm font-medium text-gray-900">
                    Value: <span className="text-gray-600">{formatValueForCard(tender.value)}</span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Free AI Summary Hook */}
                    <span className="hidden sm:inline-block px-3 py-1.5 text-xs font-medium text-blue-900 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors pointer-events-none">
                        ✨ Free AI Summary
                    </span>
                    <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                        {isAwarded ? 'View' : 'Check'}
                        <ArrowRight className="ml-2 -mr-1 h-4 w-4" />
                    </span>
                </div>
            </div>
        </>
    );

    return (
        <a
            href={tenderUrl}
            className={`bg-white rounded-xl shadow-sm border ${isAwarded ? 'border-green-200 bg-green-50/30' : 'border-gray-200'} p-6 hover:shadow-md transition-all duration-200 flex flex-col h-full cursor-pointer group`}
        >
            <CardContent />
        </a>
    );
};
