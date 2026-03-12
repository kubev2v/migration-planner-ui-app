#!/bin/sh
set -e

# Default upstream for migration-planner API (dev: host.containers.internal)
export MIGRATION_PLANNER_API_UPSTREAM="${MIGRATION_PLANNER_API_UPSTREAM:-host.containers.internal:3443}"
export MIGRATION_PLANNER_API_BASE_URL="${MIGRATION_PLANNER_API_BASE_URL:-/api/migration-assessment}"

# Substitute MIGRATION_PLANNER_API_UPSTREAM and MIGRATION_PLANNER_API_BASE_URL so nginx $variables are left intact
envsubst '${MIGRATION_PLANNER_API_UPSTREAM} ${MIGRATION_PLANNER_API_BASE_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

exec nginx -g "daemon off;"
