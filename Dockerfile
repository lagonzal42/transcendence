FROM grafana/grafana-enterprise

# Copy provisioning files

COPY ./grafana/dashboards/node_exporter.json /var/lib/grafana/dashboards
COPY ./grafana/dashboards/prometheus.json /var/lib/grafana/dashboards
COPY ./grafana/dashboards/pg-exporter.json /var/lib/grafana/dashboards

COPY ./grafana/provisioning /etc/grafana/provisioning

# Set correct permissions
USER root
RUN chown -R 472:472 /etc/grafana/provisioning
USER grafana