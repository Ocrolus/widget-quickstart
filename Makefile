.PHONY: install_all
install_all:
	npm install --prefix ./frontend
	npm install --prefix ./node
	mkcert -install

.PHONY: initialize_certs
initialize_certs:
	mkcert auth.ocrolusexample.com localhost 127.0.0.1 ::1
	mkcert www.ocrolusexample.com localhost 127.0.0.1 ::1
	mv ./www.ocrolusexample.com+3-key.pem ./reverse-proxy/www.ocrolusexample.com+3-key.pem
	mv ./www.ocrolusexample.com+3.pem ./reverse-proxy/www.ocrolusexample.com+3.pem
	mv ./auth.ocrolusexample.com+3-key.pem ./reverse-proxy/auth.ocrolusexample.com+3-key.pem
	mv ./auth.ocrolusexample.com+3.pem ./reverse-proxy/auth.ocrolusexample.com+3.pem

.PHONY: initialize_reverse_proxy
initialize_reverse_proxy:
	sudo caddy run --config ./reverse-proxy/Caddyfile

.PHONY: run_all
run_all:
	terminal -e ./node/server.sh
	terminal -e npm run start --prefix ./frontend
	terminal -e sudo caddy run --config Caddyfile

.PHONY: run_node
run_node:
	node ./node/index.js

.PHONY: run_frontend
run_frontend:
	npm start --prefix ./frontend

.PHONY: run_docker
run_docker:
	docker-compose up

.PHONY: rebuild_docker
rebuild_docker:
	docker-compose up --build

.PHONY: rebuild_node
rebuild_node:
	docker-compose up node --build

.PHONY: rebuild_frontend
rebuild_frontend:
	docker-compose up frontend --build