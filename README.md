## Ocrolus Widget Quickstart

This repository is meant to demonstrate a simplified environment running the Ocrolus quickstart widget. The intent is to show in a couple of languages what a widget integration would entail so that developers can apply their knowledge of typical web development environments to the interfaces of the Ocrolus widget.

![Ocrolus Widget quickstart](/sample.png)

# Table of Contents
- [Implementing the Widget](#implementing-widget-in-a-site)
  - [Widget Interfaces](#widget-interfaces)
    - [Base Functionality](#base-functionality-for-upload)
    - [Extended Functionality](#extended-functionality)
    - [Endpoints and Responses](#endpoints-and-responses)
      - [Widget Token](#widget-token-request)
      - [Ocrolus Token](#ocrolus-token-request) 
      - [Ocrolus Book](#ocrolus-book-request)
      - [Document](#document-request)
      - [Webhook](#webhook-example)
- [Setting up Example Sites](#setting-up-the-example-site)
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
    - [Run with Docker](#run-with-docker)
      - [Pre-requisites](#pre-requisites-1)
      - [Running](#running)
    - [Run without Docker](#run-without-docker)
      - [Pre-requisites](#pre-requisites)
      - [1. Initializing the certs and dependencies](#1-initializing-the-certs-and-dependencies)
      - [2. Running the backend](#2-running-the-backend)
        - [Node](#node)
      - [3. Running the frontend](#3-running-the-frontend)
    - [Custom Configuration](#custom-configuration)
      - [Custom Dashboard](#custom-dashboard)
      - [Custom Caddyfile](#custom-caddyfile)
      - [Custom Routing](#custom-routing)
  - [5. Optional Webhooks](#5-optional-webhooks)
    - [Setting up ngrok](#setting-up-ngrok)
  - [6. React Example](#6-react-example)


# Implementing Widget in a Site

## Widget Interfaces

At a high level to integrate the widget one must implement a couple of interfaces to get the base functionality, there's extra interfaces for extended functionality.

![Ocrolus Widget quickstart](/interfaces.png)

### Base Functionality For Upload

First a backend server must be set up with the widget credentials generated at [widget creation in the dashboard](https://dashboard.ocrolus.com/settings/widgets). Set up a back end server, prefabricated back end server examples can be found in the [node](/node/index.js) or [php](/php/routes/web.php).

As seen in the examples, an endpoint we'll call `/my_token` must be set up. This should be an endpoint visible to the internet, ideally behind some level of customer authentication, as the token coming back from this endpoint will be used to upload files to your ocrolus account. In that endpoint write code leveraging the `WIDGET_CLIENT_ID` and `WIDGET_CLIENT_SECRET` we will call the [widget token endpoint](#widget-token-request) found in the [endpoints section](#endpoints-and-responses) and return the `access_token` value. Tokens generated via this endpoint have a TTL of 15 minutes so appropriately managing the lifespan of your token is on the client side.

#### getAuthToken Interface
Second within the website where the widget will be embedded set a global **function** `getAuthToken` on the window object. This must be of type function or this will not initialize. This method should make an HTTP request to our previously set up `/my_token` endpoint and return the access_token from our endpoint [exemplified here](/frontend/src/App.tsx) lines 9-13. The widget initializer code will show a spinner and check every 500ms for the existence of this function. This must returns a legitimate JWE token and setup will be completed.

Paste the widget initializer code snippet from the widget creation screen and that completes the setup for the base widget functionality

### Extended Functionality

There's a second set of interfaces to implement for the reingestion flow of documents back into a lender's system. This flow outlines how to get documents uploaded directly to Ocrolus via the widget back into a the file system owned by the lender (you).

First set up an endpoint for handling Ocrolus webhooks we'll call this `/handler`. Expose this to the internet on our back end server from the previous step, be aware of the risks associated with handling any request sent to this endpoint be sure to take common sense precautions. The handler then needs to handle the `document.verification_succeeded` event from Ocrolus. Go to https://dashboard.ocrolus.com/settings/webhooks and set up a new webhook pointing to `https://www.yourwebsite.com/handler` and make sure the webhook is sending `document.verification_succeeded` events. Inside the code of our `/handler` endpoint we need to do a few things:
1. Filter all non verification_succeeded events. Validate that this is a document from a widget book.
    1. if your company doesn't use the xid value on book creation endpoint you could check for non-null value for book.xid.
    2. if your company leverages the xid field then you'll need to use some logic to determine whether this is a document you want to download. To do this you could leverage whether book_type is equal to 'WIDGET' or if you have a dictionary of xids you've used in the past you can look at the xid on the book. This requires a token from the [ocrolus token endpoint](#ocrolus-token-request) and a request to the [book endpoint](#ocrolus-book-request) with the access_token.
2. Once we find a verification_succeeded event we need to send a request to to the [ocrolus token endpoint](#ocrolus-token-request)
3. We then use the token from the ocrolus token endpoint, then we can make a document download request to the [document download endpoint](#document-request). Then write the file to the lender's file system.

### Endpoints and Responses
#### Widget Token Request
https://widget.ocrolus.com/v1/widget/${WIDGET_UUID}/token
```javascript
{
  client_id: WIDGET_CLIENT_ID,
  client_secret: WIDGET_CLIENT_SECRET,
  custom_id: YOUR_CUSTOM_ID_VALUE,
  grant_type: 'client_credentials',
  book_name: YOUR_CUSTOM_BOOK_NAME, // This is for your purposes. This value can be anything and is the way you'll be able to find these books later inside the dashboard. So name it something meaningful to your organization
}
```

Widget Token Response
```javascript
{
  "access_token": JWT_TOKEN,
  "expires_in": NUMBER_OF_MILLISECONDS,
  "token_type": 'Bearer'
}
```

#### Ocrolus Token Request
https://auth.ocrolus.com/oauth/token

```javascript
{
  client_id: WIDGET_CLIENT_ID,
  client_secret: WIDGET_CLIENT_SECRET,
  grant_type: 'client_credentials',
}
```

Ocrolus Token Response
```javascript
{ 
  "access_token": JWT_TOKEN,
  "token_type": 'Bearer',
  "expires_in": NUMBER_OF_MILLISECONDS,
}
```

#### Ocrolus Book Request

```
GET https://api.ocrolus.com/v1/book/info?book_uuid=${BOOK_UUID}
```

Ocrolus Book Request
```javascript
 {
  status: 200,
  response: {
    name: 'Widget Book',
    created: '2023-11-20T18:52:07Z',
    created_ts: '2023-11-20T18:52:07Z',
    pk: 41970113,
    owner_email: 'EMAIL_OF_BOOK_CREATOR',
    is_public: true,
    book_uuid: '67234233-f8ae-4345-9f7a-cb80509540df4',
    xid: YOUR_CUSTOM_ID_VALUE,
    book_type: 'WIDGET',
    id: 41970113,
    is_shared_or_public_book: true,
    docs: [ [DOCUMENT_DATA_OBJECT], ],
    mixed_docs: [ [DOCUMENT_DATA_OBJECT], ],
    bank_accounts: { '162222119': [BANK_ACCOUNT_DATA_OBJECT] },
    custom_filters: {},
    status_tags: { '2386333': [Object], '2386480': [Object] },
    book_class: 'INSTANT'
  },
  message: 'OK'
}
```

#### Document Request

```javascript
GET https://api.ocrolus.com/v2/document/download?doc_uuid=${YOUR_DOC_UUID}
```

Document Response
```javascript
<Buffer 25 50 44 46 2d 31 2e 33 0a 25 93 8c 8b 9e 20 52 65 70 6f 72 74 4c 61 62 20 47 65 6e 65 72 61 74 65 64 20 50 44 46 20 64 6f 63 75 6d 65 6e 74 20 68 74 ... 891313 more bytes>
```

#### Webhook Example

```javascript
{
  mixed_uploaded_doc_pk: 8458742,
  book_pk: 98871,
  uploaded_image_group_uuid: null,
  status: 'VERIFICATION_COMPLETE',
  mixed_uploaded_doc_uuid: 'e7e35a16-0240-4c46-a290-7f0ad933f93e',
  notification_reason: 'Document verified',
  book_uuid: 'fc8f9719-0089-44f1-b2hf-053320239930',
  uploaded_doc_uuid: '06bdw77de-e97l-22f8-vzdd-a710447c4ed5',
  event_name: 'document.verification_succeeded',
  notification_type: 'STATUS',
  doc_uuid: '06gh45dh-o83v-86v8-vvvv-v713347b5ed5',
  severity: 'LOW',
  uploaded_image_group_pk: null,
  uploaded_doc_pk: 64241242
}
```

# Setting Up The Example Site
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

Copy `.env.example` to a new file called `.env`. `OCROLUS_CLIENT_ID`, `OCROLUS_CLIENT_SECRET`, `OCROLUS_WIDGET_UUID`, `ENVIRONMENT` must all be set. Get your Client ID and secrets from the dashboard: https://dashboard.ocrolus.com/settings/widgets.

Open `/frontend/public/index.html` and delete the example snippet code on line 47 and paste the widget snippet code from the dashboard website on that line 47.

## 3. Global Prerequisites

### Mkcert
Install `mkcert` [how-to](https://github.com/FiloSottile/mkcert#installation). This is a global pre-requisite as the development certificate to be trusted locally via your browser it needs to be executed in the browser's executing environment.

Generate and install new CA root certificate using `mkcert`
```sh
mkcert -install
```

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

This will run both the `node` and `php` instances at port 8000 and 8001 respectively. In order to switch which backend you want to use augment the routing in your caddyfile to point to `php:8001`

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

##### PHP

```bash
$ cd ./php
$ composer install --working-dir=php
$ php -S localhost:8001 -t public
```

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


## 6. React Example
There is a react built example for Ocrolus widget found in [react example](/react-example). It will naturally build on the docker build or it can be built locally. 

In order to switch the frontend being leveraged in place update [the reverse proxy](/reverse-proxy/Caddyfile) change routing the entry for www.ocrolusexample.com from `frontend:3000` to `frontend-react:3001` and it will switch out the front end module being used. 

Interface and usage examples can be found at [ocrolus-widget-react](https://www.npmjs.com/package/ocrolus-widget-react).
