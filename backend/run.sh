#!/bin/bash

# Move to the directory
cd /code/backend/
pip install --upgrade pip

cd /code/backend/

python manage.py makemigrations
python manage.py migrate

# run server
python manage.py runserver 0.0.0.0:8000
#gunicorn --bind 0.0.0.0:8000 myproject.wsgi