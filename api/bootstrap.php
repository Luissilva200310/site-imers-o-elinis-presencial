<?php

declare(strict_types=1);

function app_settings(): array
{
    $settings = [
        'clickup_token' => '',
        'clickup_list_id' => '901327452649',
        'meta_pixel_id' => '',
        'meta_capi_token' => '',
        'meta_api_version' => 'v25.0',
    ];

    $settingsFile = __DIR__ . '/settings.php';
    if (is_file($settingsFile)) {
        $fileSettings = require $settingsFile;
        if (is_array($fileSettings)) {
            $settings = array_merge($settings, $fileSettings);
        }
    }

    $environmentMap = [
        'clickup_token' => 'CLICKUP_TOKEN',
        'clickup_list_id' => 'CLICKUP_LIST_ID',
        'meta_pixel_id' => 'META_PIXEL_ID',
        'meta_capi_token' => 'META_CAPI_TOKEN',
        'meta_api_version' => 'META_API_VERSION',
    ];

    foreach ($environmentMap as $key => $environmentName) {
        $value = getenv($environmentName);
        if ($value !== false && trim((string) $value) !== '') {
            $settings[$key] = trim((string) $value);
        }
    }

    return $settings;
}

function json_response(int $statusCode, array $body): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function clean_text($value): string
{
    return trim((string) ($value ?? ''));
}

function normalize_phone($value): string
{
    $digits = preg_replace('/\D+/', '', clean_text($value));
    if ($digits === null || $digits === '') {
        return '';
    }

    return strncmp($digits, '55', 2) === 0 ? $digits : '55' . $digits;
}

function request_json(): array
{
    $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > 32768) {
        json_response(413, ['ok' => false, 'error' => 'Requisicao muito grande.']);
    }

    $rawBody = file_get_contents('php://input');
    $payload = json_decode($rawBody !== false ? $rawBody : '', true);
    if (!is_array($payload)) {
        json_response(400, ['ok' => false, 'error' => 'Dados do formulario invalidos.']);
    }

    return $payload;
}

function client_ip(): string
{
    $forwarded = clean_text($_SERVER['HTTP_X_FORWARDED_FOR'] ?? '');
    $candidate = $forwarded !== '' ? trim(explode(',', $forwarded)[0]) : clean_text($_SERVER['REMOTE_ADDR'] ?? '');
    return filter_var($candidate, FILTER_VALIDATE_IP) ? $candidate : '';
}

function http_post_json(string $url, array $payload, array $headers = []): array
{
    $body = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($body === false) {
        throw new RuntimeException('Nao foi possivel preparar os dados da integracao.');
    }

    $requestHeaders = array_merge(['Content-Type: application/json'], $headers);

    if (function_exists('curl_init')) {
        $curl = curl_init($url);
        if ($curl === false) {
            throw new RuntimeException('Nao foi possivel iniciar a conexao externa.');
        }

        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_HTTPHEADER => $requestHeaders,
            CURLOPT_POSTFIELDS => $body,
        ]);

        $responseBody = curl_exec($curl);
        $statusCode = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        $curlError = curl_error($curl);
        curl_close($curl);

        if ($responseBody === false) {
            throw new RuntimeException('Falha de conexao externa: ' . $curlError);
        }

        return ['status' => $statusCode, 'body' => (string) $responseBody];
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $requestHeaders),
            'content' => $body,
            'timeout' => 15,
            'ignore_errors' => true,
        ],
    ]);
    $responseBody = file_get_contents($url, false, $context);
    $statusCode = 0;
    foreach ($http_response_header ?? [] as $responseHeader) {
        if (preg_match('#^HTTP/\S+\s+(\d{3})#', $responseHeader, $matches)) {
            $statusCode = (int) $matches[1];
            break;
        }
    }

    if ($responseBody === false) {
        throw new RuntimeException('Falha de conexao externa.');
    }

    return ['status' => $statusCode, 'body' => (string) $responseBody];
}
