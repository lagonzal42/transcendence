#!/bin/bash

# Move to the directory
cd /code/backend/
pip install --upgrade pip

cd /code/backend/

ls

# First create migrations for specific apps if they don't exist
for app in accounts live_chat two_factor_auth; do
  if [ ! -f "${app}/migrations/0001_initial.py" ]; then
    echo "Creating initial migrations for ${app}"
    python manage.py makemigrations ${app}
  fi
done

python manage.py migrate

# Create superuser
# echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@gmail.com', 'admin') if not User.objects.filter(username='admin').exists() else None" | python manage.py shell

# run server
python manage.py runserver 0.0.0.0:8000
#gunicorn --bind 0.0.0.0:8000 myproject.wsgi