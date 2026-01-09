# ==============================================================================
# Ocrolus Widget Quickstart - Makefile
# ==============================================================================

# ==============================================================================
# Quick Start Commands
# ==============================================================================

.PHONY: setup
setup:
	@chmod +x ./setup.sh
	@./setup.sh

# ==============================================================================
# Installation
# ==============================================================================

.PHONY: install_all
install_all:
	npm install --prefix ./frontend
	npm install --prefix ./node
	mkcert -install

.PHONY: initialize_certs
initialize_certs:
	mkcert www.ocrolusexample.com localhost 127.0.0.1 ::1
	mkcert auth.ocrolusexample.com localhost 127.0.0.1 ::1
	mv ./www.ocrolusexample.com+3-key.pem ./reverse-proxy/www.ocrolusexample.com+3-key.pem
	mv ./www.ocrolusexample.com+3.pem ./reverse-proxy/www.ocrolusexample.com+3.pem
	mv ./auth.ocrolusexample.com+3-key.pem ./reverse-proxy/auth.ocrolusexample.com+3-key.pem
	mv ./auth.ocrolusexample.com+3.pem ./reverse-proxy/auth.ocrolusexample.com+3.pem

# ==============================================================================
# Docker Mode
# ==============================================================================

.PHONY: run_docker
run_docker:
	docker-compose up

.PHONY: rebuild_docker
rebuild_docker:
	docker-compose up --build

.PHONY: stop_docker
stop_docker:
	docker-compose down

.PHONY: rebuild_node
rebuild_node:
	docker-compose up node --build

.PHONY: rebuild_frontend
rebuild_frontend:
	docker-compose up frontend --build

# ==============================================================================
# Local Mode (without Docker)
# ==============================================================================

.PHONY: run_node
run_node:
	node ./node/index.js

.PHONY: run_php
run_php:
	composer install --working-dir=php
	php -S localhost:8000 -t php/public

.PHONY: run_frontend
run_frontend:
	npm start --prefix ./frontend

.PHONY: run_caddy_docker
run_caddy_docker:
	cd reverse-proxy && sudo caddy run --config Caddyfile.docker

.PHONY: stop_caddy_docker
stop_caddy_docker:
	cd reverse-proxy && sudo caddy stop --config Caddyfile.docker

.PHONY: run_caddy_local
run_caddy_local:
	cd reverse-proxy && sudo caddy run --config Caddyfile.local

.PHONY: stop_caddy_local
stop_caddy_local:
	cd reverse-proxy && sudo caddy stop --config Caddyfile.local

# ==============================================================================
# Utilities
# ==============================================================================

.PHONY: clean
clean:
	rm -rf node/node_modules
	rm -rf frontend/node_modules

.PHONY: help
help:
	@echo "Ocrolus Widget Quickstart"
	@echo ""
	@echo "Quick Start:"
	@echo "  make setup              Run the setup script (one-time)"
	@echo "  make run                Run the quickstart (interactive)"
	@echo ""
	@echo "Docker Mode:"
	@echo "  make run_docker         Start with Docker Compose"
	@echo "  make rebuild_docker     Rebuild and start Docker containers"
	@echo "  make stop_docker        Stop Docker containers"
	@echo ""
	@echo "Local Mode:"
	@echo "  make run_caddy_local    Start Caddy reverse proxy (local)"
	@echo "  make run_node           Start Node.js backend"
	@echo "  make run_frontend       Start frontend"
	@echo "  make run_php            Start PHP backend"
	@echo ""
	@echo "Setup:"
	@echo "  make install_all        Install all dependencies"
	@echo "  make initialize_certs   Generate SSL certificates"
	@echo ""
	@echo "For more information, see README.md"
