# ============================================
# PostgreSQL with pg_cron extension
# ============================================
FROM postgres:17-alpine

# Install pg_cron extension
RUN apk add --no-cache \
    postgresql17-pg_cron

# Copy initialization scripts
COPY init/ /docker-entrypoint-initdb.d/

# Set permissions
RUN chmod +x /docker-entrypoint-initdb.d/*.sh 2>/dev/null || true
