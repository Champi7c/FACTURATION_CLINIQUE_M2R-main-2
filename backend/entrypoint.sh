#!/bin/bash
set -e

echo "Waiting for database to be ready..."

# Attendre que la base de données soit prête
until python -c "
import os
import sys
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'facturation_clinique.settings')
django.setup()
from django.db import connection
try:
    with connection.cursor() as cursor:
        cursor.execute('SELECT 1')
except Exception:
    sys.exit(1)
"; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

echo "Running migrations..."
python manage.py migrate --noinput

echo "Creating default users (admin/manager)..."
python manage.py create_users || true

echo "Collecting static files..."
python manage.py collectstatic --noinput || true

echo "Starting server..."
exec "$@"

