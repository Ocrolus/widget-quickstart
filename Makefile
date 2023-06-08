install_all:
	npm install --prefix ./frontend
	npm install --prefix ./node
	mkcert -install

initialize_certs:
	mkcert auth.ocrolusexample.com localhost 127.0.0.1 ::1
	mkcert www.ocrolusexample.com localhost 127.0.0.1 ::1

initialize_reverse_proxy:
	sudo caddy run --config Caddyfile

run_all:
	terminal -e ./node/server.sh
	terminal -e npm run start --prefix ./frontend
	terminal -e sudo caddy run --config Caddyfile