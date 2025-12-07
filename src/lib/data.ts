
import { supabase } from './supabase';
import type { Tender } from '../types';

function getOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatFriendlyDate(dateStr: string): string {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    const day = getOrdinal(date.getDate());
    const month = date.toLocaleDateString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

function checkIsUrgent(dateStr: string): boolean {
    if (!dateStr) return false;
    const deadline = new Date(dateStr);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
}

export async function getTopPseoPages(limit = 5) {
    const { data } = await supabase
        .from('pseo_page_index')
        .select('slug_path, params, tender_count')
        .order('tender_count', { ascending: false })
        .limit(limit);

    return data || [];
}

export async function getAllPseoPaths() {
    // Fetch all pre-calculated pages from the View
    const { data, error } = await supabase
        .from('pseo_page_index')
        .select('slug_path, params, tender_count');

    if (error) {
        console.error('Error fetching pSEO paths:', error);
        return [];
    }

    return data.map((page: any) => ({
        params: { slug: page.slug_path },
        props: {
            pageParams: page.params,
            stats: { count: page.tender_count } // Pre-fetched count
        }
    }));
}

export async function getTendersForPage(params: any): Promise<Tender[]> {
    let query = supabase
        .from('uk_tenders')
        .select('*')
        .order('value_amount', { ascending: false, nullsFirst: false })
        .limit(50);

    // Filter by Stage (Default to 'tender' if not specified)
    if (params.stage) {
        query = query.ilike('stage', params.stage);
    } else {
        query = query.eq('stage', 'tender');
    }

    // Filter based on page type
    if (params.location && params.location !== 'uk') {
        query = query.ilike('location', `%${params.location}%`);
    }

    if (params.industry) {
        query = query.ilike('industry', `%${params.industry}%`);
    }

    if (params.service) { // for service-location
        query = query.ilike('main_cpv_description', `%${params.service}%`);
    }

    if (params.cpv_code) { // for code-location
        query = query.contains('cpv_code', `{${params.cpv_code}}`);
    }

    if (params.buyer) { // for buyer pages
        query = query.ilike('buyer_name', `%${params.buyer}%`);
    }

    if (params.is_sme_friendly) {
        query = query.eq('is_sme_friendly', true);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching tenders for page:', params, error);
        return [];
    }

    // Transform to Tender type
    return (data || []).map((t: any) => ({
        id: t.id,
        ocid: t.ocid || '',
        title: t.title,
        buyer: t.buyer_name,
        location: t.location || t.region || '',
        value: t.value_amount ? t.value_amount : 'TBD',
        deadline: formatFriendlyDate(t.deadline_date),
        isUrgent: checkIsUrgent(t.deadline_date),
        isSmeFriendly: t.is_sme_friendly || false,
        isVcseFriendly: false,
        confidenceScore: 0,
        description: t.description || '',
        industry: t.industry || '',
        publishDate: t.publish_date || '',
        stage: t.stage || 'Open',
    })) as any as Tender[];
}

export async function getStatsForPage(params: any) {
    // Similar to getTendersForPage but for stats (Value sum, SME %)
    // For MVP efficiency in build, we can just aggregate the fetched 50 items 
    // OR do a separate aggregate query if precision is key.
    // Given 6000 pages, let's just use the 'tenders' array we already fetch to avoid double DB hit per page.
    return null; // Will calculate in component
}
