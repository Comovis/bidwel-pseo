export interface Lot {
    id: string;
    title: string;
    description?: string;
    value?: string;
    status?: string;
}

export interface Tender {
    id: string;
    ocid: string;
    title: string;
    buyer: string;
    location: string;
    region?: string;
    value: string | number;
    deadline: string;
    isSmeFriendly: boolean;
    isVcseFriendly: boolean;
    confidenceScore: number;
    description: string;
    industry: string;
    publishDate: string;
    stage: 'Open' | 'Closed' | 'Awarded' | 'Planning' | 'award';
    status?: string;
    savedId?: string;
    companyId?: string;
    reminderEnabled?: boolean;
    reminderDaysBefore?: number[];
    lots?: Lot[];
    timeline?: {
        submissionDeadline: string;
        rfpExpected?: string;
        contractStart?: string;
        deliveryDue?: string;
    };
    contactDetails?: {
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
    };
    method?: string;
    category?: string;
    contractType?: string;
    duration?: string;
    publishedRelative?: string;
    tenderAccessUrl?: string;
    keywords?: string[];
    aiSummary?: string;
    cpvCodes?: string[];
    cpvDescriptions?: string[];
    accessInstructions?: string;
    expectedContractDuration?: string;
    contractEndDate?: string;
    awardContractValue?: number;
    awardSupplierName?: string;
    awardSupplierId?: string;
    awardDateSigned?: string;
    awardBidsReceived?: number;
    awardCriteria?: string;
    awardLowestBidValue?: number;
    awardHighestBidValue?: number;
    isUrgent?: boolean; // Added for pSEO urgency styling
}
