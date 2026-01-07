'use strict';

/**
 * Ocrolus Widget Quickstart - Node.js Backend
 * 
 * This server provides:
 * - Token endpoint for widget authentication
 * - Webhook handler for document events
 * - Health check endpoint
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { writeFile } = require('fs/promises');

// Configuration
const PORT = process.env.APP_PORT || 8000;
const OCROLUS_CLIENT_ID = process.env.OCROLUS_CLIENT_ID;
const OCROLUS_CLIENT_SECRET = process.env.OCROLUS_CLIENT_SECRET;
const OCROLUS_WIDGET_UUID = process.env.OCROLUS_WIDGET_UUID;

// API URLs (production only)
const WIDGET_TOKEN_URL = 'https://widget.ocrolus.com';
const AUTH_URL = 'https://auth.ocrolus.com';
const API_URL = 'https://api.ocrolus.com';

// Validate configuration
if (!OCROLUS_CLIENT_ID || !OCROLUS_CLIENT_SECRET || !OCROLUS_WIDGET_UUID) {
  console.error('❌ Missing required environment variables!');
  console.error('Please ensure OCROLUS_CLIENT_ID, OCROLUS_CLIENT_SECRET, and OCROLUS_WIDGET_UUID are set in your .env file.');
  console.error('Get these values from: https://dashboard.ocrolus.com/settings/widgets');
  process.exit(1);
}

// Ocrolus IP allowlist for webhook validation
const OCROLUS_IP_ALLOWLIST = [
  '18.205.30.63',
  '18.208.79.114',
  '18.213.224.210',
  '18.233.250.22',
  '35.173.140.133',
  '35.174.183.80',
  '54.164.238.206',
];

// Initialize Express
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Ocrolus Widget Quickstart (Node.js)',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Ocrolus Widget Quickstart Server',
    endpoints: {
      token: 'POST /token',
      webhook: 'POST /upload',
      health: 'GET /health',
    },
  });
});

/**
 * Token endpoint - exchanges credentials for a widget token
 * 
 * The frontend calls this endpoint to get a JWT token for the widget.
 * This keeps your credentials secure on the server.
 */
app.post('/token', async (req, res) => {
  const { userId, bookName } = req.body;
  
  // Generate a user ID if not provided
  const customId = userId || `user-${Date.now()}`;
  const book = bookName || 'Widget Book';

  console.log(`Token request - User: ${customId}, Book: ${book}`);

  try {
    const response = await fetch(`${WIDGET_TOKEN_URL}/v1/widget/${OCROLUS_WIDGET_UUID}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: OCROLUS_CLIENT_ID,
        client_secret: OCROLUS_CLIENT_SECRET,
        custom_id: customId,
        grant_type: 'client_credentials',
        book_name: book,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Ocrolus token error:', response.status, errorData);
      return res.status(response.status).json({
        error: 'Failed to get token from Ocrolus',
        details: errorData,
      });
    }

    const data = await response.json();
    console.log('Token acquired successfully');

    res.json({
      accessToken: data.access_token,
      expiresIn: data.expires_in || 900,
      tokenType: data.token_type || 'Bearer',
    });

  } catch (error) {
    console.error('Token request failed:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * Webhook endpoint - receives document events from Ocrolus
 * 
 * Configure this URL in your Ocrolus Dashboard:
 * https://dashboard.ocrolus.com/settings/webhooks
 */
app.post('/upload', async (req, res) => {
  const { event_name, book_uuid, doc_uuid, mixed_uploaded_doc_uuid } = req.body;

  // Validate sender IP (optional but recommended for production)
  const senderIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`Webhook received from ${senderIp}: ${event_name}`);

  // For production, validate the IP is from Ocrolus
  // if (!OCROLUS_IP_ALLOWLIST.includes(senderIp)) {
  //   console.log('Webhook ignored - unknown sender IP');
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  // Only process verification succeeded events
  if (event_name !== 'document.verification_succeeded' && event_name !== 'document.classification_succeeded') {
    console.log(`Ignoring event: ${event_name}`);
    return res.json({ status: 'ignored', event: event_name });
  }

  console.log(`Processing ${event_name} for book ${book_uuid}, doc ${doc_uuid}`);

  try {
    // Get an API token
    const tokenResponse = await fetch(`${AUTH_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: OCROLUS_CLIENT_ID,
        client_secret: OCROLUS_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get API token');
    }

    const { access_token } = await tokenResponse.json();

    // Get book info to verify it's a widget book
    const bookResponse = await fetch(`${API_URL}/v1/book/info?book_uuid=${book_uuid}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!bookResponse.ok) {
      throw new Error('Failed to get book info');
    }

    const bookData = await bookResponse.json();

    // Only process widget books
    if (bookData.response?.book_type !== 'WIDGET') {
      console.log('Ignoring non-widget book');
      return res.json({ status: 'ignored', reason: 'not a widget book' });
    }

    // Download the document
    console.log('Downloading document...');
    const docResponse = await fetch(`${API_URL}/v2/document/download?doc_uuid=${doc_uuid}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!docResponse.ok) {
      throw new Error('Failed to download document');
    }

    const docBuffer = await docResponse.arrayBuffer();
    const filename = `downloaded_${doc_uuid}.pdf`;
    await writeFile(filename, Buffer.from(docBuffer));

    console.log(`Document saved as ${filename}`);

    res.json({
      status: 'success',
      event: event_name,
      book_uuid,
      doc_uuid,
      filename,
    });

  } catch (error) {
    console.error('Webhook processing error:', error.message);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Ocrolus Widget Quickstart Server');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Port:     ${PORT}`);
  console.log(`  Widget:   ${OCROLUS_WIDGET_UUID.substring(0, 8)}...`);
  console.log('');
  console.log('  Endpoints:');
  console.log('    POST /token   - Get widget authentication token');
  console.log('    POST /upload  - Webhook for document events');
  console.log('    GET  /health  - Health check');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
