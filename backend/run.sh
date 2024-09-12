#!/bin/bash

# Move to the directory
cd /code/backend/
pip install --upgrade pip

echo "Im here\n"
cd /code/backend/

# run server
python manage.py runserver 0.0.0.0:8000