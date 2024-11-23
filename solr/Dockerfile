FROM solr:9.6.1

# Switch to root for setup tasks
USER root

# Copy the directory ProyectoFinal to the Solr data directory
COPY ProyectoFinal /var/solr/data/ProyectoFinal

# Set permissions for the Solr user (UID 8983)
RUN chown -R 8983:8983 /var/solr/data/ProyectoFinal

# Switch back to the solr user for execution
USER solr

# Set Solr entry point
ENTRYPOINT ["docker-entrypoint.sh"]

# Expose Solr's default port
EXPOSE 8983

# Default command to run Solr in the foreground
CMD ["solr-foreground"]
