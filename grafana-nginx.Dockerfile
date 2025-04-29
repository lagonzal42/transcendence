FROM nginx:1.26

# Install OpenSSL
RUN apt-get update && apt-get install -y openssl

# Generate SSL certificates
RUN openssl genrsa -out /etc/nginx/server.key && \
    openssl req -new -key /etc/nginx/server.key -subj "/CN=lagonzal" -out /etc/nginx/server.csr && \
    openssl x509 -req -days 365 -in /etc/nginx/server.csr -signkey /etc/nginx/server.key -out /etc/nginx/server.crt

COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 443

# Start nginx in foreground
ENTRYPOINT ["nginx", "-g", "daemon off;"]