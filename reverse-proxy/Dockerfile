
FROM caddy:2.6.4-alpine

WORKDIR /reverse_proxy

COPY ./reverse-proxy/Caddyfile /etc/caddy/Caddyfile
COPY ./reverse-proxy ./

EXPOSE 80
CMD ["caddy", "run"]
