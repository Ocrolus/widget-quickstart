
FROM caddy:2.6.4-alpine

WORKDIR /reverse_proxy

# Copy the Docker-specific Caddyfile
COPY ./reverse-proxy/Caddyfile.docker /etc/caddy/Caddyfile
COPY ./reverse-proxy ./

EXPOSE 80
EXPOSE 443

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["caddy", "run"]
