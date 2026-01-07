<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
|
| These values are loaded from environment variables.
| See .env file for configuration.
*/

$environment = 'production';
$widget_uuid = env('OCROLUS_WIDGET_UUID', '');
$client_id = env('OCROLUS_CLIENT_ID', '');
$client_secret = env('OCROLUS_CLIENT_SECRET', '');

$TOKEN_ISSUER_URLS = [
    "production" => 'https://widget.ocrolus.com',
];

$API_ISSUER_URLS = [
    "production" => 'https://auth.ocrolus.com',
];

/*
|--------------------------------------------------------------------------
| Utility Methods
|--------------------------------------------------------------------------
*/

/**
 * Get the external ID for the current user.
 * In a real application, this would return your user's unique identifier.
 */
function getUserExternalId($userId = null) {
    // Return the passed userId or generate a unique one
    return $userId ?: 'user-' . time();
}

/*
|--------------------------------------------------------------------------
| CORS Preflight Handler
|--------------------------------------------------------------------------
| Handle OPTIONS requests for CORS preflight
*/

$router->options('/{any:.*}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization, Accept, X-Requested-With')
        ->header('Access-Control-Max-Age', '86400');
});

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
*/

// Health check endpoint
$router->get('/', function () use ($router) {
    return response()->json([
        'status' => 'ok',
        'service' => 'Ocrolus Widget Quickstart (PHP)',
        'timestamp' => date('c'),
    ]);
});

$router->get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => date('c'),
    ]);
});

// Token endpoint - POST for security
$router->post('/token', function (Request $request) use ($TOKEN_ISSUER_URLS, $environment, $widget_uuid, $client_id, $client_secret) {
    // Validate credentials are configured
    if (empty($widget_uuid) || empty($client_id) || empty($client_secret)) {
        return response()->json([
            'error' => 'Widget credentials not configured. Please check your .env file.',
        ], 500);
    }

    // Get request parameters
    $userId = $request->input('userId', getUserExternalId());
    $bookName = $request->input('bookName', 'Widget Book');

    // Build request data
    $request_data = [
        'client_id' => $client_id,
        'client_secret' => $client_secret,
        'custom_id' => $userId,
        'grant_type' => 'client_credentials',
        'book_name' => $bookName,
    ];

    try {
        // Make POST request to Ocrolus
        $ocrolus_response = Http::post(
            "{$TOKEN_ISSUER_URLS[$environment]}/v1/widget/{$widget_uuid}/token",
            $request_data
        );

        if ($ocrolus_response->failed()) {
            error_log('Ocrolus token request failed: ' . $ocrolus_response->body());
            return response()->json([
                'error' => 'Failed to get token from Ocrolus',
                'details' => $ocrolus_response->json(),
            ], $ocrolus_response->status());
        }

        $response_data = $ocrolus_response->json();

        return response()->json([
            'accessToken' => $response_data['access_token'],
            'expiresIn' => $response_data['expires_in'] ?? 900,
            'tokenType' => $response_data['token_type'] ?? 'Bearer',
        ]);

    } catch (\Exception $e) {
        error_log('Token request error: ' . $e->getMessage());
        return response()->json([
            'error' => 'Internal server error',
            'message' => $e->getMessage(),
        ], 500);
    }
});

// Webhook handler for document events
$router->post('/webhook', function (Request $request) use ($API_ISSUER_URLS, $environment, $client_id, $client_secret) {
    $event = $request->input('event_name');
    $bookUuid = $request->input('book_uuid');
    $docUuid = $request->input('doc_uuid');

    error_log("Received webhook: {$event} for book {$bookUuid}");

    // Only process verification succeeded events
    if ($event !== 'document.verification_succeeded') {
        return response()->json(['status' => 'ignored']);
    }

    // Here you would typically:
    // 1. Verify the webhook is from Ocrolus (check IP or signature)
    // 2. Get an API token
    // 3. Download the document if needed
    // 4. Process the document in your system

    return response()->json([
        'status' => 'received',
        'event' => $event,
        'book_uuid' => $bookUuid,
        'doc_uuid' => $docUuid,
    ]);
});
