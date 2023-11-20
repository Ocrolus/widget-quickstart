<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| Util Methods
|--------------------------------------------------------------------------
|
| We stub out customer logical space methods
*/

$environment = env('APP_ENV', 'production');
$widget_uuid = env('WIDGET_UUID', '');

$TOKEN_ISSUER_URLS = [
    "production" => 'https://widget.ocrolus.com',
];

$API_ISSUER_URLS = [
    "production" => 'https://auth.ocrolus.com',
];

function is_user_logged_in() {
    return false;
}

function get_current_user_id() {
    return 7;
}

function getUserExternalId() {
    // Check if the user is logged in.
    if (is_user_logged_in()) {
        // Get the current user's ID.
        $user_id = get_current_user_id();
        return $user_id;
    } else {
        $user_id = "999999";
        return $user_id;
    }
}


/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$router->get('/', function () use ($router) {
    return $router->app->version();
});

$router->get('/token', function (Request $request) use ($router, $TOKEN_ISSUER_URLS, $environment, $widget_uuid) {
    // Get user token from the request headers or set a default value (e.g., 1234).
    $user_token = $request->header('Authorization') || '1234';

    // You should define the getUserExternalId function to retrieve the user's external ID.
    $user_id = getUserExternalId($user_token);

    // Define the request data to send to Ocrolus.
    $request_data = [
        'client_id' => 'ls2wy5PH86OOVTFw7TkAB3Kd8IB0OBU9',
        'client_secret' => 'lsrItRO3TKY2POYO2jMstb_PGj5ebyNfy3kgok07hJzNsApiQIE3qEut_buJSKt9',
        'custom_id' => $user_id,
        'grant_type' => 'client_credentials',
        'name' => 'bookName', // Customize the book name as needed.
    ];

    // Make a POST request to Ocrolus using the Laravel HTTP client.
    $ocrolus_response = Http::post(
        "{$TOKEN_ISSUER_URLS[$environment]}/v1/widget/{$widget_uuid}/token",
        $request_data
    );

    // Log the request data and response for debugging.
    error_log(json_encode($request_data));
    error_log($ocrolus_response->body());

    if ($ocrolus_response->failed()) {
        return response()->json(['error' => 'ocrolus_error: Failed to get a token from Ocrolus'], 500);
    }

    $response_data = $ocrolus_response->json();

    return response()->json(['accessToken' => $response_data['access_token']]);
});
