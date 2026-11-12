<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    json_response(405, ['ok' => false, 'error' => 'Metodo nao permitido.']);
}

$settings = app_settings();
json_response(200, ['metaPixelId' => clean_text($settings['meta_pixel_id'] ?? '')]);
