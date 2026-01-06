-- 1. Helper function for slugify (MUST BE RUN FIRST)
CREATE OR REPLACE FUNCTION slugify(value TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Lowercase, remove non-alphanumeric (except space/hyphen), replace spaces with hyphens
  RETURN lower(regexp_replace(regexp_replace(value, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

-- 2. Materialized View: pseo_page_index
-- Pre-calculates 20,000+ valid page combinations for static site generation.

-- DROP VIEW IF EXISTS (Uncomment if needed to recreate)
DROP MATERIALIZED VIEW IF EXISTS pseo_page_index;

CREATE MATERIALIZED VIEW pseo_page_index AS

WITH raw_pages AS (
    -- A. Industry + Location
    -- Path: /tenders/[industry]/[location] (e.g., /tenders/construction/london)
    SELECT 
        'industry-location' as page_type,
        slugify(industry) || '/' || slugify(coalesce(location, region, 'uk')) as slug_path,
        jsonb_build_object(
            'type', 'industry-location',
            'industry', industry,
            'location', coalesce(location, region, 'uk')
        ) as params,
        count(*) as tender_count
    FROM uk_tenders
    WHERE stage = 'tender' AND industry IS NOT NULL
    GROUP BY industry, coalesce(location, region, 'uk')
    HAVING count(*) > 0

    UNION ALL

    -- B. CPV Description + Location
    -- Path: /tenders/service/[service-name]/[location] (e.g., /tenders/service/cleaning/london)
    SELECT 
        'service-location' as page_type,
        'service/' || slugify(main_cpv_description) || '/' || slugify(coalesce(location, region, 'uk')) as slug_path,
        jsonb_build_object(
            'type', 'service-location',
            'service', main_cpv_description,
            'location', coalesce(location, region, 'uk')
        ) as params,
        count(*) as tender_count
    FROM uk_tenders
    WHERE stage = 'tender' AND main_cpv_description IS NOT NULL
    GROUP BY main_cpv_description, coalesce(location, region, 'uk')
    HAVING count(*) > 0

    UNION ALL

    -- C. CPV Code + Location
    -- Path: /tenders/code/[cpv-code]/[location]
    SELECT 
        'code-location' as page_type,
        'code/' || slugify(cpv_code[1]) || '/' || slugify(coalesce(location, region, 'uk')) as slug_path,
        jsonb_build_object(
            'type', 'code-location',
            'cpv_code', cpv_code[1],
            'location', coalesce(location, region, 'uk')
        ) as params,
        count(*) as tender_count
    FROM uk_tenders
    WHERE stage = 'tender' AND array_length(cpv_code, 1) > 0
    GROUP BY cpv_code[1], coalesce(location, region, 'uk')
    HAVING count(*) > 0

    UNION ALL

    -- D. Buyer + Industry (Meta: "Ministry of Defence IT Tenders")
    -- Path: /tenders/buyer/[buyer]/[industry]
    SELECT 
        'buyer-industry' as page_type,
        'buyer/' || slugify(buyer_name) || '/' || slugify(industry) as slug_path,
        jsonb_build_object(
            'type', 'buyer-industry',
            'buyer', buyer_name,
            'industry', industry
        ) as params,
        count(*) as tender_count
    FROM uk_tenders
    WHERE stage = 'tender' AND buyer_name IS NOT NULL AND industry IS NOT NULL
    GROUP BY buyer_name, industry
    HAVING count(*) > 0

    UNION ALL

    -- E. Buyer + Location + Industry
    -- Path: /tenders/buyer/[buyer]/[location]/[industry]
    SELECT 
        'buyer-location-industry' as page_type,
        'buyer/' || slugify(buyer_name) || '/' || slugify(coalesce(location, region, 'uk')) || '/' || slugify(industry) as slug_path,
        jsonb_build_object(
            'type', 'buyer-location-industry',
            'buyer', buyer_name,
            'location', coalesce(location, region, 'uk'),
            'industry', industry
        ) as params,
        count(*) as tender_count
    FROM uk_tenders
    WHERE stage = 'tender' AND buyer_name IS NOT NULL AND industry IS NOT NULL
    GROUP BY buyer_name, coalesce(location, region, 'uk'), industry
    HAVING count(*) > 0

    UNION ALL

    -- F. SME Friendly + Industry + Location
    -- Path: /tenders/sme/[industry]/[location]
    SELECT 
        'sme-industry-location' as page_type,
        'sme/' || slugify(industry) || '/' || slugify(coalesce(location, region, 'uk')) as slug_path,
        jsonb_build_object(
            'type', 'sme-industry-location',
            'industry', industry,
            'location', coalesce(location, region, 'uk'),
            'is_sme_friendly', true
        ) as params,
        count(*) as tender_count
    FROM uk_tenders
    WHERE stage = 'tender' AND industry IS NOT NULL AND is_sme_friendly = true
    GROUP BY industry, coalesce(location, region, 'uk')
    HAVING count(*) > 0

    UNION ALL

    -- G. Stage + CPV Description + Location
    -- Path: /tenders/[stage]/service/[service-name]/[location]
    SELECT 
        'stage-service-location' as page_type,
        slugify(stage) || '/service/' || slugify(main_cpv_description) || '/' || slugify(coalesce(location, region, 'uk')) as slug_path,
        jsonb_build_object(
            'type', 'stage-service-location',
            'stage', stage,
            'service', main_cpv_description,
            'location', coalesce(location, region, 'uk')
        ) as params,
        count(*) as tender_count
    FROM uk_tenders
    WHERE stage = 'tender' AND main_cpv_description IS NOT NULL
    GROUP BY stage, main_cpv_description, coalesce(location, region, 'uk')
    HAVING count(*) > 0

    UNION ALL

    -- H. Stage + CPV Code + Location
    -- Path: /tenders/[stage]/code/[cpv-code]/[location]
    SELECT 
        'stage-code-location' as page_type,
        slugify(stage) || '/code/' || slugify(cpv_code[1]) || '/' || slugify(coalesce(location, region, 'uk')) as slug_path,
        jsonb_build_object(
            'type', 'stage-code-location',
            'stage', stage,
            'cpv_code', cpv_code[1],
            'location', coalesce(location, region, 'uk')
        ) as params,
        count(*) as tender_count
    FROM uk_tenders
    WHERE stage = 'tender' AND array_length(cpv_code, 1) > 0
    GROUP BY stage, cpv_code[1], coalesce(location, region, 'uk')
    HAVING count(*) > 0
    UNION ALL

    -- I. Region Only
    -- Path: /tenders/region/[region]
    SELECT 
        'region-only' as page_type,
        'region/' || slugify(coalesce(location, region, 'uk')) as slug_path,
        jsonb_build_object(
            'type', 'region-only',
            'location', coalesce(location, region, 'uk')
        ) as params,
        count(*) as tender_count
    FROM uk_tenders
    WHERE stage = 'tender' AND coalesce(location, region) IS NOT NULL
    GROUP BY coalesce(location, region, 'uk')
    HAVING count(*) > 0

    UNION ALL

    -- J. Topic (Keyword)
    -- Path: /tenders/topic/[keyword-slug]
    SELECT 
        'topic' as page_type,
        'topic/' || slugify(keyword) as slug_path,
        jsonb_build_object(
            'type', 'topic',
            'keyword', keyword
        ) as params,
        count(*) as tender_count
    FROM uk_tenders, unnest(keywords) as keyword
    WHERE stage = 'tender' AND length(keyword) > 2
    GROUP BY keyword
    HAVING count(*) >= 3
)

-- Fix: Wrap in query with DISTINCT ON to prevent Unique Key Violation
SELECT DISTINCT ON (slug_path) *
FROM raw_pages
ORDER BY slug_path;

-- 3. Indexes for performance
CREATE UNIQUE INDEX idx_pseo_page_index_slug ON pseo_page_index(slug_path);
