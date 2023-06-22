## Ocrolus Widget Quickstart

This repository is meant to demonstrate a simplified environment running the Ocrolus quickstart widget. The intent is to show in a couple of languages what a widget integration would entail so that developers can apply their knowledge of typical web development environments to the interfaces of the Ocrolus widget.

![Ocrolus Widget quickstart](/sample.png)


- [1. Pull the repository](#1-pull-the-repository)
  - [Note for Windows](#note-for-windows)
- [2. Set up widget environment variables](#2-set-up-widget-environment-variables)
- [3. Global prerequisites](#3-global-prerequisites)
  - [MKcert](#MKcert)
  - [Default Configuration](#default-configuration)
    - [Default Dashboard](#default-dashboard)
    - [Default Caddyfile](#default-caddyfile)
    - [Default Routing](#default-routing)
- [4. Run the quickstart](#4-run-the-quickstart)
  - [Run without Docker](#run-without-docker)
    - [Pre-requisites](#pre-requisites)
    - [1. Initializing the certs and dependencies](#1-initializing-the-certs-and-dependencies)
    - [2. Running the backend](#2-running-the-backend)
      - [Node](#node)
    - [3. Running the frontend](#3-running-the-frontend)
  - [Run with Docker](#run-with-docker)
    - [Pre-requisites](#pre-requisites-1)
    - [Running](#running)
  - [Custom Configuration](#custom-configuration)
    - [Custom Dashboard](#custom-dashboard)
    - [Custom Caddyfile](#custom-caddyfile)
    - [Custom Routing](#custom-routing)
- [5. Optional Webhooks](#5-optinal-webhooks)
  - [Setting up ngrok](#setting-up-ngrok)
## 1. Pull the repository

Using https:

```sh
git clone https://github.com/Ocrolus/widget-quickstart;
cd widget-quickstart
```

Alternatively, if you use ssh:

```sh
git clone git@github.com:Ocrolus/widget-quickstart.git;
cd widget-quickstart
```

### Note for Windows
Note - because this repository makes use of symbolic links, to run this on a Windows machine, make sure you have checked the "enable symbolic links" box when you download Git to your local machine. Then you can run the above commands to clone the quickstart. Otherwise, you may open your Git Bash terminal as an administrator and use the following command when cloning the project

```sh
git clone -c core.symlinks=true https://github.com/Ocrolus/widget-quickstart
```

## 2. Set up widget environment variables

```bash
cp .env.example .env
```

Copy `.env.example` to a new file called `.env`. `OCROLUS_CLIENT_ID`, `OCROLUS_CLIENT_SECRET`, `ENVIRONMENT` must all be set. Get your Client ID and secrets from the dashboard: https://dashboard-demo.ocrolus.com/settings/widgets.

## 3. Global Prerequisites

### Mkcert
Install `mkcert` [how-to](https://github.com/FiloSottile/mkcert#installation). This is a global pre-requisite as the development certificate to be trusted locally via your browser it needs to be executed in the browser's executing environment.

### Default Configuration

#### Default Dashboard
Configure a widget in dashboard and make sure that in the `Allowed URLS` field of your configuration the URL you expect to use is allowed. The widget iframe will refuse to render unless your URL is in the allow list. To allow for the default configuration to work simply add `www.ocrolusexample.com`.

#### Default Caddyfile
Running `make initialize_certs` will create two sets of CA signed keys to be utilized by your reverse proxy for the backend and the front end respectively. It will copy those certs into the `reverse-proxy` directory.

The caddyfile should be configured to run functionally as is provided the `Routing` step is followed.

#### Default Routing
Configure /etc/hosts to contain a record for `127.0.0.1 <MY.ALLOWED_URL.TLD>` replace the `MY.ALLOWED_URL.TLD` with the URL you want to host locally. If you want to use the base configuration set the etc hosts to contain

```
127.0.0.1 www.ocrolusexample.com
127.0.0.1 auth.ocrolusexample.com
```

## 4. Run the quickstart

### Run without Docker

#### Pre-requisites

- This repo should work with node versions >=14.
- `.env` copied and values enumerated
- [npm](https://www.npmjs.com/get-npm)
- If using Windows, a command line utility capable of running basic Unix shell commands including `Make`, otherwise look at the `Makefile` and run the commands defined under each macro command individually.
- [caddy](https://caddyserver.com/docs/install) or some other form of reverse proxy mechanism we'll discuss as if using caddy 

#### 1. Initializing the certs and dependencies

##### Certs

We need to modify and run the reverse proxy.

Update the /reverse-proxy/Caddyfile reverse-proxy url to localhost rather than the docker network alias.

```
<my_frontend_url> {
	tls <my_frontend_url>+3.pem <my_frontend_url>+3-key.pem
	reverse_proxy localhost:3000
}
<my_server_url> {
	tls <my_server_url>+3.pem <my_server_url>+3-key.pem
	reverse_proxy localhost:8000
}
```

```bash
cd ./reverse-proxy  
sudo caddy start --config Caddyfile
```

##### Dependencies

Install all dependencies via `make install_all`

#### 2. Running the backend

Once executing with one of the commands below the backend will be running on http://localhost:8000. This backend should represent your customer server.


##### Node

```bash
$ cd ./node
$ npm ci
$ ./server.sh
```

alternatively 

`make run_node`

#### 3. Running the frontend

```bash
$ cd ./frontend
$ npm start
```

alternatively `make run_frontend`

### Run with Docker

#### Pre-requisites

- `make` available in command line 
- Docker installed and running [installation](https://docs.docker.com/get-docker/)
- Your `.env` variables initialized

#### Running

There are two `make` commands relative to running with docker.

`make rebuild_docker` Which will rebuild and run the docker containers.
`make run_docker` Which will do a cached, if possible, build and run the docker containers

`make rebuild_docker` will allow you to, if needed, update any contextual values, docker environment, or otherwise environmental changes. Otherwise just run `make run_docker`

### Custom Configuration
**Only follow this set of steps if you're looking to use a custom URL for your example app.**

If the configuration is custom then the `initialize the certs` step will not be sufficient. If configuring custom urls then run locally the following commands:

Generate and install new CA root certificate using `mkcert`
```sh
mkcert -install
```
Generate self-signed ssl certificate to us in caddy
```sh
mkcert <my_frontend_url> localhost 127.0.0.1 ::1
mkcert <my_server_url> localhost 127.0.0.1 ::1
mv <my_frontend_url>+3-key.pem reverse-proxy/
mv <my_frontend_url>+3.pem reverse-proxy/
mv <my_server_url>+3-key.pem reverse-proxy/
mv <my_server_url>+3.pem reverse-proxy/
```


#### Custom Dashboard
Configure a widget in dashboard and add <my_frontend_url> to the `Allowed URLS` field.

#### Custom Caddyfile
If a custom configuration is desired configure the /reverse-proxy/Caddyfile such that `www.ocrolusexample.com` and `auth.ocrolusexample.com` are updated to the URLs that you want to use for your development machine.

```
<my_frontend_url> {
	tls <my_frontend_url>+3.pem <my_frontend_url>+3-key.pem
	reverse_proxy frontend:3000
}
<my_server_url> {
	tls <my_server_url>+3.pem <my_server_url>+3-key.pem
	reverse_proxy node:8000
}
```

#### Custom Routing
Configure /etc/hosts to contain a record for `127.0.0.1 <MY.ALLOWED_URL.TLD>` replace the `MY.ALLOWED_URL.TLD` with the URL you want to host locally.

```
127.0.0.1 <my_frontend_url>
127.0.0.1 <my_server_url>
```

## 5. Optional Webhooks
Webhooks are a pattern to be notified of events within the ocrolus system. Lenders may want to download the file data that is uploaded through the widget as it bypasses the lender source data may need to be stored in some properietary manner to the lender. As such Webhooks and the `/v2/document/download` endpoint on the ocrolus API can be leveraged to get resources in any other system programatically. 

### Setting Up The Webhook for Running
The quickstart leverages `ngrok` to create a URL available to the wider internet and Ocrolus that points at the local server. To get started [Sign up with ngrok](https://dashboard.ngrok.com/get-started/your-authtoken) and get an auth token. Make a local copy of the `ngrok-example.yml` file rename it `ngrok.yml` and paste your auth token inside the authtoken field.

Ngrok will now get launched with the typical `make run_docker` command. Once the ngrok container has been launched there will be log output from the `widget-quickstart-ngrok-1` pod akin to the following:

```bash
widget-quickstart-ngrok-1     | t=2023-06-22T17:07:21+0000 lvl=info msg="started tunnel" obj=tunnels name=command_line addr=http://node:8000 url=https://5264-104-28-236-176.ngrok-free.app
```

Copy this URL and navigate a browser to the dashboard and create a webhook with this ngrok url as the outbound URL. Steps to set up the webhook in dashboard can be found [here](https://docs.ocrolus.com/docs/configure-and-manage). The event that needs to be enabled is `document.verification_succeeded`.

**Note**
Due to the drawbacks of the free version of ngrok a new URL will be generated each time so every time the ngrok server is restarted, killed, and run again a new URL will be generated. The webhook to be used will need to be updated with this outbound url. As such if local changes are desired to be made within this widget example the commands `rebuild_node` and `rebuild_frontend` are preferrable to a full rebuild or rerun of the docker containers.

Now whenever a document is verified, the local server will be notified via webhook that a document is ready for download and downloaded to the local docker container. Logically in a production scenario this would be specified by the implementer to download the document to whatever desired file system that is specified.