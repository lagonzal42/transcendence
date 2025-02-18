FROM grafana/grafana-enterprise

# Copy provisioning files
COPY ./grafana/dashboards /etc/grafana/provisioning/dashboards
COPY ./grafana/provisioning /etc/grafana/provisioning

# ADD ./grafana/dashboards /var/lib/grafana/dashboards
# ADD ./grafana/provisioning /etc/grafana/provisioning

# Set correct permissions
USER root
RUN chown -R 472:472 /etc/grafana/provisioning
USER grafana