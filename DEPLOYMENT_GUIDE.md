# Cloudflare Routing Deployment Guide

## Overview

This guide sets up Cloudflare Workers to route `/tenders/*` traffic directly to Cloudflare Pages, eliminating Vercel bandwidth usage while keeping the `bidwel.com` domain.

**No environment variables needed!**

---

## Deployment Steps

### Step 1: Build the Site

```bash
cd /Applications/gemini_workspace/bidwel-pseo
npm run build
```

**Expected:** ~6-7 minutes to build all 8,626 static pages.

---

### Step 2: Deploy to Cloudflare Pages

**Option A: Using Wrangler (Recommended)**

```bash
npx wrangler pages deploy dist --project-name=bidwel-pseo
```

**Option B: Git Integration**

If you have Git connected to Cloudflare Pages, just push:

```bash
git add .
git commit -m "Update pSEO pages"
git push
```

---

### Step 3: Deploy the Cloudflare Worker

```bash
npx wrangler deploy cloudflare-worker.js
```

This creates a Worker called `bidwel-tenders-router`.

---

### Step 4: Configure Worker Route

1. Go to **Cloudflare Dashboard** → **Workers & Pages**
2. Click on `bidwel-tenders-router` worker
3. Navigate to **Settings** → **Triggers** → **Routes**
4. Click **Add route**
5. Enter:
   - **Route:** `bidwel.com/tenders/*`
   - **Zone:** `bidwel.com`
6. Click **Save**

---

### Step 5: Update Vercel Configuration

```bash
cd /Applications/gemini_workspace/bidwel/frontend
git add vercel.json
git commit -m "Remove rewrites - routing handled by Cloudflare Worker"
git push
```

Vercel will auto-deploy.

---

## Verification

### Test Tender Pages (Should Use Cloudflare)

```bash
curl -I https://bidwel.com/tenders/construction/london
```

**Look for:**
- ✅ `cf-cache-status` header
- ✅ `server: cloudflare`
- ❌ NO `x-vercel-id` header

### Test Main App (Should Use Vercel)

```bash
curl -I https://bidwel.com
```

**Should work normally** and load your main app.

### Check Vercel Bandwidth

After 24-48 hours:
- Go to **Vercel Dashboard** → **Analytics** → **Bandwidth**
- Traffic to `/tenders/*` should be **~0**

---

## How It Works

```
User Request: bidwel.com/tenders/construction/london
    ↓
Cloudflare DNS
    ↓
Worker Route Match (/tenders/*)
    ↓
Fetch from bidwel-pseo.pages.dev
    ↓
Return to User (URL stays bidwel.com)
```

```
User Request: bidwel.com/dashboard
    ↓
Cloudflare DNS
    ↓
No Worker Match
    ↓
Continue to Vercel
```

---

## Troubleshooting

### Worker Not Routing

- Check route is exactly: `bidwel.com/tenders/*`
- Verify zone is: `bidwel.com`
- Route should NOT include `*.bidwel.com`

### Pages Not Loading

- Test Pages URL directly: `https://bidwel-pseo.pages.dev/tenders/test-slug`
- Ensure Cloudflare Pages deployment succeeded

### Still Seeing Vercel Headers

- Wait 5-10 minutes for DNS/CDN cache to clear
- Try incognito/private browser window
- Clear browser cache

---

## Rollback Plan

If something breaks:

1. **Delete Worker Route:**
   - Cloudflare Dashboard → Workers → `bidwel-tenders-router` → Routes → Delete

2. **Restore Vercel Config:**
   ```bash
   cd /Applications/gemini_workspace/bidwel/frontend
   git revert HEAD
   git push
   ```

3. Wait 2-3 minutes for changes to propagate.

---

## Benefits

- ✅ **Zero Vercel bandwidth** for tender pages
- ✅ **Faster performance** (direct edge routing)
- ✅ **Lower costs** (no Vercel usage for 8,626 pages)
- ✅ **Same domain** (bidwel.com stays in URL)
- ✅ **Easy rollback** (quick revert if needed)

---

## Next Steps

After successful deployment:

1. Monitor Vercel bandwidth over 24-48 hours
2. Check Google Analytics for traffic patterns
3. Consider implementing ISR/SSR for even faster deployments (optional)
