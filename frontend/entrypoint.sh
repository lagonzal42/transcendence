#!/bin/bash

npm install

#ng serve --host 0.0.0.0
# Start the English version (default)
ng serve --host 0.0.0.0 --port 4200 &

# Start the Spanish version
#ng serve --configuration=es --host 0.0.0.0 --port 4201 &

# Start the French version
#ng serve --configuration=fr --host 0.0.0.0 --port 4202 &

# Wait for all background processes
wait