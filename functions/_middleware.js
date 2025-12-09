/**
 * Cloudflare Pages Function - Middleware
 * 
 * UPDATE: The routing logic has been moved to the Zone-level Worker (bidwel-tenders-router).
 * This Pages project successfully serves purely as the static backend for that worker.
 * 
 * We now simply return next() for all requests so that Cloudflare Pages
 * serves the matching static file (e.g. /tenders/..., /_astro/...).
 */

export async function onRequest(context) {
    // Just serve the static files requested
    return context.next();
}
