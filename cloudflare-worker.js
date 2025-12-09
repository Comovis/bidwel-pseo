/**
 * Cloudflare Worker - Route /tenders/* to Pages
 * 
 * This worker runs at the zone level (bidwel.com) and intercepts
 * only /tenders/* requests to serve them from Cloudflare Pages.
 * All other traffic continues to Vercel as normal.
 * 
 * Deploy this as a Worker with a route: bidwel.com/tenders/*
 */

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Handle /tenders/*, /_astro/* AND sitemap requests
        if (!url.pathname.startsWith('/tenders') &&
            !url.pathname.startsWith('/_astro') &&
            !url.pathname.startsWith('/sitemap-index.xml') &&
            !url.pathname.match(/\/sitemap-\d+\.xml/)) {
            return fetch(request);
        }

        // Target Cloudflare Pages URL
        const targetUrl = `https://bidwel-pseo.pages.dev${url.pathname}${url.search}`;

        // Fetch from Pages
        const response = await fetch(targetUrl, {
            method: request.method,
            headers: request.headers,
        });

        return response;
    }
};