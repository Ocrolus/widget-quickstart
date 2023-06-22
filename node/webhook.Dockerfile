from ngrok/ngrok:latest

CMD ["http", "node:8000", "--config", "/etc/ngrok.yml", "--log=stdout"]