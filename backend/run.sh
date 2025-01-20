#!/bin/bash

# Move to the directory
cd /code/backend/
pip install --upgrade pip

cd /code/backend/

python manage.py makemigrations
python manage.py migrate

# Create superuser
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@gmail.com', 'admin') if not User.objects.filter(username='admin').exists() else None" | python manage.py shell

#python manage.py runserver_plus --cert-file cert.pem 0.0.0.0:8000
# run server
python manage.py runserver 0.0.0.0:8000
#gunicorn --bind 0.0.0.0:8000 myproject.wsgi