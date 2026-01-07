# Ocrolus Widget Quickstart

The Ocrolus Widget is an embeddable document upload and bank connection interface that allows your users to securely submit financial documents directly from your application.

![Ocrolus Widget Quickstart](/sample.png)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Widget Setup in Dashboard](#widget-setup-in-dashboard)
  - [Creating a Widget](#creating-a-widget)
  - [Widget Configuration Options](#widget-configuration-options)
  - [Plaid Configuration](#plaid-configuration)
    - [Step 1: Connect Your Plaid Account](#step-1-connect-your-plaid-account)
    - [Step 2: Enable Plaid in Your Widget](#step-2-enable-plaid-in-your-widget)
- [How It Works](#how-it-works)
  - [Document Upload Flow](#document-upload-flow)
  - [Bank Connection (Plaid) Flow](#bank-connection-plaid-flow)
- [Integration Guide](#integration-guide)
  - [Prerequisites](#prerequisites)
  - [Step 1: Backend Token Endpoint](#step-1-backend-token-endpoint)
  - [Step 2: Frontend Integration](#step-2-frontend-integration)
  - [Step 3: Event Handling](#step-3-event-handling)
- [Running the Quickstart](#running-the-quickstart)
  - [Environment Setup](#environment-setup)
  - [Running with Docker](#running-with-docker)
  - [Running without Docker](#running-without-docker)
- [Events](#events)
  - [Upload Events](#upload-events)
  - [Plaid Events](#plaid-events)
  - [Widget Lifecycle Events](#widget-lifecycle-events)
- [Webhooks](#webhooks)
- [API Reference](#api-reference)
- [Support](#support)

---

## Overview

This repository provides working examples in multiple languages (Node.js, PHP) to demonstrate widget integration. Use these examples to understand how to embed the Ocrolus Widget in your application.

**Key Benefits:**
- **Secure** - Documents are uploaded directly to Ocrolus via encrypted iframe
- **Customizable** - Match your brand with custom colors and messaging
- **Easy Integration** - Simple script tag integration
- **Real-time Events** - Track upload progress and user actions

---

## Features

The Ocrolus Widget provides a secure, embeddable interface for collecting financial documents from your users.

### Key Features

| Feature | Description |
|---------|-------------|
| **Secure Upload** | Documents are uploaded directly to Ocrolus via an encrypted iframe |
| **Bank Connection** | Plaid integration for automatic bank statement retrieval |
| **Customizable UI** | Match your brand with custom colors and messaging |
| **Real-time Events** | Track upload progress and user actions via postMessage events |
| **Webhook Notifications** | Receive notifications when documents are processed |

### Document Upload
- Drag-and-drop file upload interface
- Supports PDF, JPG, JPEG, and PNG files (up to 200MB)
- Real-time upload status tracking
- Automatic document processing, classification, and data extraction

### Bank Connection (Plaid)
- Secure bank account linking via Plaid
- Automatic bank statement retrieval via Asset Reports
- Wide financial institution coverage
- User credentials entered directly with the bank (Ocrolus never sees them)

---

## Widget Setup in Dashboard

For complete details, see the [official Ocrolus Widget documentation](https://docs.ocrolus.com/docs/widget).

### Creating a Widget

1. Log in to the [Ocrolus Dashboard](https://dashboard.ocrolus.com)
2. Navigate to **Account & Settings → Embedded Widget**
3. Click **ADD WIDGET**
4. Configure your widget settings:
   - Enter a **Widget Name** for your reference
   - Add your website domain(s) to **Allowed URLs**
   - Enable **Show upload documents** and/or **Show connect to bank**
   - Customize colors and text as needed
5. Use the **Preview** section to test your widget:
   - Select **file-uploader** from the dropdown to test uploads
6. Click **SAVE** in the top right corner
7. Copy your generated credentials:
   - **Widget UUID**
   - **Client ID** 
   - **Client Secret** (save securely - not accessible later)
   - **JavaScript Snippet** for frontend integration

> **Security Note:** Store your Client ID and Client Secret securely on your server. Never expose them in frontend code.

### Widget Configuration Options

| Setting | Description |
|---------|-------------|
| **Widget Name** | A name for your reference (not shown to users) |
| **Allowed URLs** | Domains where the widget can be embedded (e.g., `https://yoursite.com`). The widget iframe will refuse to render unless your URL is in this list. |
| **Branding Color** | Primary color for buttons and accents (hex code) |
| **Text Color** | Text color (hex code) |
| **Show upload documents** | Enable the "Upload Documents" section |
| **Upload Header** | Header text (e.g., "Upload Your Bank Statements") |
| **Upload Description** | Description text (e.g., "Please upload your last 3 months of statements") |
| **Show connect to bank** | Enable the "Connect to Bank" section (requires Plaid configuration) |
| **Bank Header** | Header text for bank section |
| **Bank Description** | Description text for bank section |

### Plaid Configuration

The Ocrolus widget seamlessly supports Plaid integration, allowing you to securely store and manage Plaid API keys directly from the Dashboard.

#### Step 1: Connect Your Plaid Account

1. Navigate to **Dashboard → Account & Settings → Embedded Widget**
2. Click **CONNECT PLAID ACCOUNT** (or **UPDATE ACCOUNT DETAILS** if already connected)
3. Log in to your [Plaid Dashboard](https://dashboard.plaid.com) and retrieve:
   - **Plaid Client ID**
   - **Plaid Client Secret** (Production)
4. Enter these credentials in the **Configure Plaid Account** dialog
5. Click **Done** to save

> **Note:** Your Plaid credentials are securely stored by Ocrolus. You can update them at any time from the Embedded Widget settings.

#### Step 2: Enable Plaid in Your Widget

1. Go to **Dashboard → Account & Settings → Embedded Widget**
2. Edit an existing widget or create a new one
3. Turn ON the **Show connect to bank** toggle
4. Customize the bank connection header and description text
5. Click **SAVE**

> **Important:** Ensure at least one of **Show upload documents** or **Show connect to bank** is enabled. Don't disable one unless the other is active.

**Plaid Features:**
- Users can securely link their bank accounts
- Bank credentials are entered directly with the bank (Ocrolus never sees them)
- Bank statements are automatically retrieved via Plaid's Asset Reports
- Statements are processed and available in your Ocrolus dashboard

---

## How It Works

### Document Upload Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DOCUMENT UPLOAD FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

1. USER CLICKS "Upload Documents"
   │
   ▼
2. UPLOAD MODAL OPENS
   │  User drags & drops or selects files
   │  Supported: PDF, JPG, JPEG, PNG (max 200MB)
   │
   ▼
3. USER CLICKS "Submit"
   │  → EVENT: USER_FILE_UPLOADER_SUBMIT
   │
   ▼
4. FILES UPLOADED TO OCROLUS
   │  HTTP upload to Ocrolus servers
   │  → EVENT: USER_UPLOAD_RECEIVED
   │  Status: "Received" (processing)
   │
   ▼
5. DOCUMENT PROCESSING
   │  • Security scan
   │  • Document classification
   │  • OCR extraction
   │
   ▼
6. PROCESSING COMPLETE
   │  → EVENT: USER_UPLOAD_COMPLETE (success)
   │  → EVENT: USER_UPLOAD_FAILED (if error)
   │  Status: "Uploaded" or "Error"
   │
   ▼
7. USER CLOSES MODAL
   → EVENT: USER_FILE_UPLOADER_CLOSE
```

**Upload States:**

| State | Icon | Description |
|-------|------|-------------|
| Uploading | Spinner | File is being uploaded to Ocrolus |
| Received | Yellow dot | Upload successful, document is being processed |
| Uploaded | Green checkmark | Document processed and available in Ocrolus |
| Error | Red X | Upload or processing failed (see error message) |

### Bank Connection (Plaid) Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      BANK CONNECTION (PLAID) FLOW                        │
└─────────────────────────────────────────────────────────────────────────┘

1. USER CLICKS "Connect to Bank"
   │
   ▼
2. PLAID LINK OPENS
   │  Secure Plaid modal (not Ocrolus)
   │  User searches for their bank
   │
   ▼
3. USER LOGS INTO BANK
   │  Credentials entered directly with bank
   │  Ocrolus never sees user's bank credentials
   │
   ▼
4. USER SELECTS ACCOUNTS
   │  User chooses which accounts to connect
   │
   ▼
5. CONNECTION SUCCESSFUL
   │  → EVENT: LINK_SUCCESS
   │  Plaid modal closes
   │  Widget shows success state
   │
   ▼
6. ASSET REPORT GENERATED (Background)
   │  Plaid generates asset report (30 seconds - 5 minutes)
   │  Bank statements retrieved automatically
   │
   ▼
7. STATEMENTS AVAILABLE
   Documents appear in your Ocrolus dashboard
   Webhook notification sent (if configured)
```

**If an error occurs:**
- `PLAID_ERROR` event is emitted with error details
- User can retry the connection
- See [Events](#plaid-events) for error handling

---

## Integration Guide

### Prerequisites

1. An Ocrolus account with API access
2. A widget created in the [Ocrolus Dashboard](https://dashboard.ocrolus.com/settings/widgets)
3. Your **Widget UUID**, **Client ID**, and **Client Secret**
4. A backend server to securely generate tokens

### Step 1: Backend Token Endpoint

Create a server endpoint that exchanges your credentials for a widget token. **Never expose your Client Secret to the frontend.**

#### Node.js Example

```javascript
const express = require('express');
const app = express();

const WIDGET_UUID = process.env.OCROLUS_WIDGET_UUID;
const CLIENT_ID = process.env.OCROLUS_CLIENT_ID;
const CLIENT_SECRET = process.env.OCROLUS_CLIENT_SECRET;

app.post('/api/widget-token', async (req, res) => {
  const { userId, bookName } = req.body;
  
  const response = await fetch(
    `https://widget.ocrolus.com/v1/widget/${WIDGET_UUID}/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        custom_id: userId,           // Your user identifier (links documents to same book)
        book_name: bookName,         // Folder name in Ocrolus (e.g., "John Smith Application")
        grant_type: 'client_credentials'
      })
    }
  );
  
  const { access_token } = await response.json();
  res.json({ accessToken: access_token });
});
```

**Token Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `client_id` | Yes | Your Widget Client ID |
| `client_secret` | Yes | Your Widget Client Secret |
| `custom_id` | Yes | Your user identifier. Documents with the same `custom_id` go to the same book. Use this to link multiple uploads from the same user. |
| `book_name` | Yes | Book name in Ocrolus dashboard. This helps you identify the book later (e.g., "John Smith Loan Application"). |
| `grant_type` | Yes | Always `client_credentials` |

> **Tip:** Use a consistent `custom_id` for each user session. If a user uploads additional files later, using the same `custom_id` will add them to the existing book. You can search for books by this ID using the `xid` field in the [Book List API](https://docs.ocrolus.com/reference/book-list).

**Token Response:**

```json
{
  "access_token": "eyJhbGciOiJSU0...",
  "expires_in": 900,
  "token_type": "Bearer"
}
```

> **Note:** Tokens have a 15-minute TTL. Implement token refresh logic to handle long user sessions.

### Step 2: Frontend Integration

#### Script Tag Integration

1. Add the container element where you want the widget to appear:

```html
<div id="ocrolus-widget-frame"></div>
```

2. Define the token provider function (BEFORE the widget script):

```html
<script>
window.getAuthToken = async function() {
  const response = await fetch('/api/widget-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'user-123',          // Your user's ID
      bookName: 'Loan Application' // Descriptive name
    })
  });
  const { accessToken } = await response.json();
  return accessToken;
};
</script>
```

3. Add the widget initializer script (from your dashboard):

```html
<script id="ocrolus-initializer-script">
  (function(w, d, s, o, h, u, f, js, fjs) {
    w[o] = w[o] || function() { (w[o].q = w[o].q || []).push(arguments); };
    (js = d.createElement(s)), (fjs = d.getElementsByTagName(s)[0]);
    js.id = o;
    js.dataset.host = h;
    js.dataset.uuid = u;
    js.src = f;
    js.async = 1;
    fjs.parentNode.insertBefore(js, fjs);
  })(
    window,
    document,
    'script',
    'ocrolus_script',
    'https://widget.ocrolus.com',
    'YOUR_WIDGET_UUID',
    'https://widget.ocrolus.com/static/initializer-sdk.bundle.js'
  );
  ocrolus_script('init');
</script>
```

### Step 3: Event Handling

Listen for widget events to track user actions and update your UI:

```javascript
window.addEventListener('message', (event) => {
  const { type, ...data } = event.data;
  
  switch (type) {
    case 'USER_UPLOAD_COMPLETE':
      // Update your UI to show success
      showNotification(`Successfully uploaded ${data.uploads.length} file(s)`);
      // Store the bookUuid for later reference
      saveBookUuid(data.uploads[0]?.bookUuid);
      break;
      
    case 'USER_UPLOAD_FAILED':
      // Show error to user
      showError(`Upload failed: ${data.uploads[0]?.message}`);
      break;
      
    case 'LINK_SUCCESS':
      // Bank connection successful
      showNotification('Bank connected successfully!');
      break;
      
    case 'PLAID_ERROR':
      // Handle Plaid errors
      if (data.error.errorType === 'USER_ERROR') {
        showError(data.error.displayMessage);
      } else {
        showError('Unable to connect to your bank. Please try again later.');
      }
      break;
      
    case 'USER_FILE_UPLOADER_CLOSE':
      // User closed the modal
      console.log(`Session complete: ${data.uploadedFileCount} files uploaded`);
      break;
  }
});
```

---

## Running the Quickstart

This quickstart provides working examples you can run locally to test the widget integration. It supports both **Docker mode** and **Local mode** (without Docker).

### Quick Start (Recommended)

The easiest way to get started is using our setup script. This works on **macOS**, **Linux**, and **Windows** (Git Bash/WSL).

```bash
# Clone the repository
git clone https://github.com/Ocrolus/widget-quickstart.git
cd widget-quickstart

# Run setup (one-time)
./setup.sh
```

The **setup script** will:
1. ✅ Check prerequisites (mkcert, Docker/Node.js)
2. ✅ Guide you through hosts file configuration
3. ✅ Prompt for your widget credentials
4. ✅ Create the `.env` file
5. ✅ Update the widget configuration in the frontend
6. ✅ Generate SSL certificates automatically

After setup, choose your preferred run mode:
- **Docker mode**: Easiest setup, everything runs in containers
- **Local mode**: Run services directly on your machine

### Prerequisites

#### Install mkcert (Required)

```bash
# macOS
brew install mkcert

# Windows (with chocolatey)
choco install mkcert

# Linux (Ubuntu/Debian)
sudo apt install libnss3-tools
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
```

#### For Docker Mode
- [Docker](https://docs.docker.com/get-docker/) installed and running

#### For Local Mode
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Caddy](https://caddyserver.com/docs/install) (reverse proxy)

#### Configure Hosts File

Add these entries to your hosts file (the setup script will guide you):

**macOS/Linux** (`/etc/hosts`):
```bash
sudo sh -c 'echo "127.0.0.1 www.ocrolusexample.com" >> /etc/hosts'
sudo sh -c 'echo "127.0.0.1 auth.ocrolusexample.com" >> /etc/hosts'
```

**Windows** (Run Notepad as Administrator):
```
notepad C:\Windows\System32\drivers\etc\hosts
```
Add:
```
127.0.0.1 www.ocrolusexample.com
127.0.0.1 auth.ocrolusexample.com
```

#### Configure Allowed URLs in Dashboard

Add `www.ocrolusexample.com` to your widget's "Allowed URLs" in the [Ocrolus Dashboard](https://dashboard.ocrolus.com/settings/widgets).

### Option 1: Running with Docker

After running `./setup.sh`, start all services with Docker:

```bash
make run_docker
```

This starts:
- Node.js backend server (port 8000)
- Frontend (port 3000)
- Caddy reverse proxy (port 443)
- (Optional) ngrok for webhooks

Visit **`https://www.ocrolusexample.com`** in your browser.

To stop all services:
```bash
make stop_docker
```

### Option 2: Running Locally (without Docker)

After running `./setup.sh`, you need to start three services in separate terminal windows:

#### Terminal 1: Start the Reverse Proxy
```bash
make run_caddy_local
```

#### Terminal 2: Start the Backend
```bash
make run_node
```

#### Terminal 3: Start the Frontend
```bash
make run_frontend
```

Visit **`https://www.ocrolusexample.com`** in your browser.

> **Note:** All three services must be running simultaneously. Use `Ctrl+C` in each terminal to stop them.

### Manual Setup (Without Scripts)

If you prefer to set up manually without using the scripts:

1. **Clone and configure:**
```bash
git clone https://github.com/Ocrolus/widget-quickstart.git
cd widget-quickstart
```

2. **Create `.env` file with your credentials:**
```bash
OCROLUS_WIDGET_UUID=your-widget-uuid
OCROLUS_CLIENT_ID=your-client-id
OCROLUS_CLIENT_SECRET=your-client-secret
OCROLUS_WIDGET_ENVIRONMENT=production
```

3. **Update the widget UUID in frontend:**

Open `frontend/public/index.html` and replace `YOUR_WIDGET_UUID` with your actual Widget UUID.

4. **Generate SSL certificates:**
```bash
make initialize_certs
```

5. **Run with Docker:**
```bash
make run_docker
```

---

## Events

The widget communicates with your application via browser `postMessage` events. Listen for these to track user actions and upload status.

### Listening for Events

```javascript
window.addEventListener('message', (event) => {
  // Verify the event is from Ocrolus (recommended)
  if (!event.origin.includes('ocrolus.com')) return;
  
  const { type, ...data } = event.data;
  
  switch (type) {
    case 'USER_UPLOAD_COMPLETE':
      console.log('Upload complete:', data.uploads);
      break;
    case 'PLAID_ERROR':
      console.error('Plaid error:', data.error);
      break;
    // Handle other events...
  }
});
```

### Upload Events

#### `USER_FILE_UPLOADER_OPEN`
User clicked "Upload Documents" to open the upload modal.

```javascript
{ type: 'USER_FILE_UPLOADER_OPEN', timestamp: '2024-01-15T10:30:00.000Z' }
```

#### `USER_FILE_UPLOADER_SUBMIT`
User clicked "Submit" to upload selected files.

```javascript
{
  type: 'USER_FILE_UPLOADER_START',
  timestamp: '2024-01-15T10:30:15.000Z',
  uploads: [
    { name: 'bank_statement.pdf', size: 1024000, type: 'application/pdf' }
  ]
}
```

#### `USER_UPLOAD_RECEIVED`
Files have been received by Ocrolus and processing has started.

```javascript
{
  type: 'USER_UPLOAD_RECEIVED',
  timestamp: '2024-01-15T10:30:18.000Z',
  uploads: [
    { name: 'bank_statement.pdf', size: 1024000, type: 'application/pdf' }
  ]
}
```

#### `USER_UPLOAD_COMPLETE`
File has been fully processed and is available in your Ocrolus dashboard.

```javascript
{
  type: 'USER_UPLOAD_COMPLETE',
  timestamp: '2024-01-15T10:30:45.000Z',
  uploads: [
    {
      name: 'bank_statement.pdf',
      size: 1024000,
      type: 'application/pdf',
      bookUuid: 'abc123-def456-...'  // Book where document was added
    }
  ],
  errors: []
}
```

#### `USER_UPLOAD_FAILED`
File upload or processing failed.

```javascript
{
  type: 'USER_UPLOAD_FAILED',
  timestamp: '2024-01-15T10:30:20.000Z',
  uploads: [
    {
      name: 'corrupted.pdf',
      size: 1024000,
      type: 'application/pdf',
      message: 'Document could not be processed'
    }
  ]
}
```

#### `USER_FILE_UPLOADER_CLOSE`
User closed the upload modal.

```javascript
{ 
  type: 'USER_FILE_UPLOADER_CLOSE',
  timestamp: '2024-01-15T10:31:00.000Z',
  uploadedFileCount: 3  // Total successful uploads in this session
}
```

### Plaid Events

#### `LINK_SUCCESS`
User successfully connected their bank account.

```javascript
{ type: 'LINK_SUCCESS' }
```

#### `PLAID_ERROR`
An error occurred during the bank connection flow.

```javascript
 {
  type: 'PLAID_ERROR',
  error: {
    errorType: 'USER_ERROR' | 'INSTITUTION_ERROR' | 'OCROLUS_ERROR',
    errorCode: 'INVALID_CREDENTIALS',
    errorMessage: 'The credentials were not correct',
    displayMessage: 'The provided credentials were not correct. Please try again.',
    reason: 'User entered incorrect bank login credentials'
  }
}
```

**Error Types:**

| Error Type | Description | User Action |
|------------|-------------|-------------|
| `USER_ERROR` | User action issue (wrong password, timeout, etc.) | User can retry |
| `INSTITUTION_ERROR` | Bank is temporarily unavailable | Wait and retry later |
| `OCROLUS_ERROR` | System error | Contact support if persistent |

**Common Error Codes:**

| Code | Description |
|------|-------------|
| `INVALID_CREDENTIALS` | User entered wrong bank login |
| `INVALID_MFA` | User entered wrong MFA code |
| `ITEM_LOCKED` | Bank account locked (too many failed attempts) |
| `INSTITUTION_DOWN` | Bank is experiencing technical issues |
| `INSTITUTION_NOT_RESPONDING` | Bank is temporarily unavailable |

### Widget Lifecycle Events

#### `DESTROY_MODAL_IFRAME`
Send this event to programmatically close the current modal.

```javascript
window.postMessage({ type: 'DESTROY_MODAL_IFRAME' }, '*');
```

#### `DESTROY_OCROLUS_WIDGET`
Send this event to completely remove the widget from your page.

```javascript
window.postMessage({ type: 'DESTROY_OCROLUS_WIDGET' }, '*');
```

---

## Webhooks

Configure webhooks to receive notifications when documents are uploaded and processed. This is especially useful for downloading documents that users upload via the widget back to your own systems.

For detailed webhook documentation, see the [Ocrolus Webhooks Guide](https://docs.ocrolus.com/docs/configure-and-manage).

### Setup

1. Go to [Ocrolus Dashboard → Settings → Webhooks](https://dashboard.ocrolus.com/settings/webhooks)
2. Create a new webhook with your endpoint URL
3. Enable the `document.verification_succeeded` event

### Webhook Payload Example

```json
{
  "event_name": "document.verification_succeeded",
  "book_uuid": "fc8f9719-0089-44f1-b2hf-053320239930",
  "book_pk": 98871,
  "doc_uuid": "06gh45dh-o83v-86v8-vvvv-v713347b5ed5",
  "uploaded_doc_uuid": "06bdw77de-e97l-22f8-vzdd-a710447c4ed5",
  "mixed_uploaded_doc_uuid": "e7e35a16-0240-4c46-a290-7f0ad933f93e",
  "status": "VERIFICATION_COMPLETE",
  "notification_reason": "Document verified",
  "notification_type": "STATUS",
  "severity": "LOW"
}
```

### Identifying Widget Documents

To determine if a webhook is for a widget-uploaded document:

1. **Check book_type:** Query the Book Info API and check if `book_type === 'WIDGET'`
2. **Check xid:** If you use the `custom_id` parameter, it will appear as `xid` on the book

### Downloading Documents

After receiving a webhook, you can download the original document:

```javascript
// 1. Get an API token
const tokenResponse = await fetch('https://auth.ocrolus.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'client_credentials'
  })
});
const { access_token } = await tokenResponse.json();

// 2. (Optional) Verify this is a widget book
const bookResponse = await fetch(
  `https://api.ocrolus.com/v1/book/info?book_uuid=${bookUuid}`,
  { headers: { Authorization: `Bearer ${access_token}` } }
);
const bookData = await bookResponse.json();

if (bookData.response.book_type === 'WIDGET') {
  // 3. Download the document
  const docResponse = await fetch(
    `https://api.ocrolus.com/v2/document/download?doc_uuid=${docUuid}`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  );
  const fileBuffer = await docResponse.arrayBuffer();
  
  // Save to your file system
  fs.writeFileSync('document.pdf', Buffer.from(fileBuffer));
}
```

---

## API Reference

### Widget Token Endpoint

```
POST https://widget.ocrolus.com/v1/widget/{widget_uuid}/token
```

**Request:**
```json
{
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "custom_id": "user-identifier",
  "book_name": "Application Documents",
  "grant_type": "client_credentials"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSU0...",
  "expires_in": 900,
  "token_type": "Bearer"
}
```

### Auth Token Endpoint

For API calls (webhooks, document download):

```
POST https://auth.ocrolus.com/oauth/token
```

**Request:**
```json
{
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "grant_type": "client_credentials"
}
```

### Document Download

```
GET https://api.ocrolus.com/v2/document/download?doc_uuid={doc_uuid}
Authorization: Bearer {access_token}
```

### Book Info

```
GET https://api.ocrolus.com/v1/book/info?book_uuid={book_uuid}
Authorization: Bearer {access_token}
```

---

## Support

- **Widget Documentation:** [docs.ocrolus.com/docs/widget](https://docs.ocrolus.com/docs/widget)
- **API Documentation:** [docs.ocrolus.com](https://docs.ocrolus.com)
- **Webhooks Guide:** [docs.ocrolus.com/docs/configure-and-manage](https://docs.ocrolus.com/docs/configure-and-manage)
- **Dashboard:** [dashboard.ocrolus.com](https://dashboard.ocrolus.com)
- **Plaid Dashboard:** [dashboard.plaid.com](https://dashboard.plaid.com)
- **Support:** Contact your Ocrolus representative or [raise a request](https://docs.ocrolus.com)

---

## License

Copyright © Ocrolus. All rights reserved.
