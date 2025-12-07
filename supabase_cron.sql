-- Enable the pg_cron extension (if not already enabled)
create extension if not exists pg_cron;

-- Schedule the refresh job to run every day at 3:00 AM UTC
-- NOTE: We use 'CONCURRENTLY' so it doesn't lock the table while refreshing (zero downtime)
select cron.schedule(
  'refresh-pseo-index',          -- unique name for the job
  '0 3 * * *',                   -- cron schedule (03:00 AM daily)
  $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY pseo_page_index;
  $$
);

-- To check if it's scheduled:
-- select * from cron.job;

-- To manually run it now for testing:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY pseo_page_index;
