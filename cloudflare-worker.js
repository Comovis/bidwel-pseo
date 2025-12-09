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
    async fetch(request, env) {
        const url = new URL(request.url);

        // This worker only handles /tenders/* requests
        // Construct the Cloudflare Pages URL
        const pagesUrl = new URL(url.pathname + url.search, 'https://bidwel-pseo.pages.dev');

        // Prepare headers: Remove the original 'Host' header to prevent 
        // "Misdirected Request" errors when fetching the Pages domain.
        const newHeaders = new Headers(request.headers);
        newHeaders.delete('Host');

        // Fetch from Cloudflare Pages
        return fetch(pagesUrl, {
            method: request.method,
            headers: newHeaders,
            body: request.body,
            redirect: 'manual',
        });
    }
};
