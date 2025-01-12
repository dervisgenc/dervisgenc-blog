-- Custom database objects that GORM cannot manage
BEGIN;

--------------------------------------------------------------------------------
-- Create unified trigger for like counts
--------------------------------------------------------------------------------
-- First drop triggers (dependencies) before dropping functions
DROP TRIGGER IF EXISTS update_post_like_count ON post_likes;
DROP TRIGGER IF EXISTS update_like_counts ON post_likes;

-- Now we can safely drop the functions
DROP FUNCTION IF EXISTS update_post_like_count() CASCADE;
DROP FUNCTION IF EXISTS update_like_counts() CASCADE;

-- Create new trigger function that handles both tables
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update stats first
        INSERT INTO stats (post_id, likes, created_at, updated_at)
        VALUES (NEW.post_id, 1, NOW(), NOW())
        ON CONFLICT (post_id)
        DO UPDATE SET 
            likes = (SELECT COUNT(*) FROM post_likes WHERE post_id = NEW.post_id),
            updated_at = NOW();
            
        -- Then update posts
        UPDATE posts 
        SET like_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = NEW.post_id)
        WHERE id = NEW.post_id;
            
    ELSIF TG_OP = 'DELETE' THEN
        -- Update stats first
        UPDATE stats 
        SET likes = (SELECT COUNT(*) FROM post_likes WHERE post_id = OLD.post_id),
            updated_at = NOW()
        WHERE post_id = OLD.post_id;
        
        -- Then update posts
        UPDATE posts 
        SET like_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = OLD.post_id)
        WHERE id = OLD.post_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_like_counts
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_like_counts();

--------------------------------------------------------------------------------
-- Create function to update stats on post_views insert
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Create stats record if it doesn't exist
    INSERT INTO stats (post_id, views, likes, shares, created_at, updated_at)
    VALUES (NEW.post_id, 0, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (post_id) DO NOTHING;

    -- Update view count
    UPDATE stats 
    SET views = views + 1,
        updated_at = CURRENT_TIMESTAMP,
        last_viewed = CURRENT_TIMESTAMP
    WHERE post_id = NEW.post_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS post_views_stats_trigger ON post_views;
CREATE TRIGGER post_views_stats_trigger
AFTER INSERT ON post_views
FOR EACH ROW
EXECUTE FUNCTION update_post_stats();

--------------------------------------------------------------------------------
-- Create function to clean up old data
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Archive data older than 6 months to daily_stats
    INSERT INTO daily_stats (date, total_visits, unique_visitors, total_post_views)
    SELECT 
        DATE(visit_time),
        COUNT(*),
        COUNT(DISTINCT ip_address),
        0
    FROM visitors
    WHERE visit_time < NOW() - INTERVAL '6 months'
    GROUP BY DATE(visit_time)
    ON CONFLICT (date) 
    DO UPDATE SET
        total_visits = daily_stats.total_visits + EXCLUDED.total_visits,
        unique_visitors = daily_stats.unique_visitors + EXCLUDED.unique_visitors;

    -- Delete old data
    DELETE FROM visitors WHERE visit_time < NOW() - INTERVAL '6 months';
    DELETE FROM post_views WHERE view_time < NOW() - INTERVAL '6 months';
    DELETE FROM post_likes WHERE created_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------------------------------------
-- Optional: Setup pg_cron for scheduled cleanup
-- Note: This requires superuser privileges and pg_cron extension
-- To install pg_cron:
--   1. Run as superuser: CREATE EXTENSION pg_cron;
--   2. Add "shared_preload_libraries = 'pg_cron'" to postgresql.conf
--   3. Restart PostgreSQL
--------------------------------------------------------------------------------
DO $$
BEGIN
    -- Check if pg_cron extension exists
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
    ) THEN
        -- Schedule the cleanup job
        PERFORM cron.schedule('cleanup-old-data', '0 0 * * *', 'SELECT cleanup_old_data()');
    ELSE
        RAISE NOTICE 'pg_cron extension not installed. Skipping scheduled cleanup setup.';
        RAISE NOTICE 'To enable automated cleanup, install pg_cron extension and run:';
        RAISE NOTICE 'SELECT cron.schedule(''cleanup-old-data'', ''0 0 * * *'', ''SELECT cleanup_old_data()'');';
    END IF;
END $$;

END;
