# Second stage: build the Nginx server
FROM nginx:1.26

# Copying our .conf files
COPY ./nginx.conf /etc/nginx/conf.d/nginx.conf 

# remove the log files in order to remove symlink between nginx logs & container log paths to ensure logs are available in default nginx log path
RUN rm -f /var/log/nginx/* 