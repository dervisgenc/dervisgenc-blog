#!/bin/bash
set -e

# Enable pg_cron extension configuration
echo "shared_preload_libraries = 'pg_cron'" >> "$PGDATA/postgresql.conf"
echo "cron.database_name = '${POSTGRES_DB:-website}'" >> "$PGDATA/postgresql.conf"

# Log that configuration is complete
echo "pg_cron configuration added to postgresql.conf"
