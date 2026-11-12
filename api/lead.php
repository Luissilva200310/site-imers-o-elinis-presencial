<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    header('Allow: POST');
    json_response(405, ['ok' => false, 'error' => 'Metodo nao permitido.']);
}

$payload = request_json();

// Campo invisivel: bots costumam preenche-lo; pessoas nao.
if (clean_text($payload['website'] ?? '') !== '') {
    json_response(200, ['ok' => true]);
}

$requiredFields = ['nome', 'whatsapp', 'formacao', 'objetivo', 'faturamentoMedio'];
foreach ($requiredFields as $field) {
    if (clean_text($payload[$field] ?? '') === '') {
        json_response(400, ['ok' => false, 'error' => 'Preencha todos os campos obrigatorios.']);
    }
}

$phone = normalize_phone($payload['whatsapp'] ?? '');
if (strlen($phone) < 12 || strlen($phone) > 13) {
    json_response(400, ['ok' => false, 'error' => 'Informe um WhatsApp valido com DDD.']);
}

$settings = app_settings();
$clickUpToken = clean_text($settings['clickup_token'] ?? '');
$clickUpListId = clean_text($settings['clickup_list_id'] ?? '');

if ($clickUpToken === '' || $clickUpListId === '') {
    error_log('Cadastro nao enviado: ClickUp nao configurado em api/settings.php.');
    json_response(503, [
        'ok' => false,
        'error' => 'O cadastro ainda nao foi configurado. Fale com nossa equipe pelo WhatsApp.',
    ]);
}

$pageUrl = clean_text($payload['pageUrl'] ?? $payload['url'] ?? '');
$eventId = clean_text($payload['eventId'] ?? '');
if ($eventId === '') {
    try {
        $eventId = 'lead-' . bin2hex(random_bytes(12));
    } catch (Throwable $error) {
        $eventId = 'lead-' . uniqid('', true);
    }
}

$task = [
    'name' => 'Lead - ' . clean_text($payload['nome']),
    'markdown_description' => implode("\n", [
        '**Nome:** ' . clean_text($payload['nome']),
        '**WhatsApp:** ' . $phone,
        '**Formacao:** ' . clean_text($payload['formacao']),
        '**Objetivo:** ' . clean_text($payload['objetivo']),
        '**Faturamento medio:** ' . clean_text($payload['faturamentoMedio']),
        '**Origem:** ' . ($pageUrl !== '' ? $pageUrl : 'Pagina da imersao'),
        '**Meta event_id:** ' . $eventId,
        '**Criado em:** ' . gmdate('c'),
    ]),
];

try {
    $clickUpResponse = http_post_json(
        'https://api.clickup.com/api/v2/list/' . rawurlencode($clickUpListId) . '/task',
        $task,
        ['Authorization: ' . $clickUpToken]
    );

    if ($clickUpResponse['status'] < 200 || $clickUpResponse['status'] >= 300) {
        throw new RuntimeException('ClickUp retornou HTTP ' . $clickUpResponse['status']);
    }

    $clickUpTask = json_decode($clickUpResponse['body'], true);
    if (!is_array($clickUpTask) || empty($clickUpTask['id'])) {
        throw new RuntimeException('Resposta inesperada do ClickUp.');
    }

    $metaSent = false;
    $pixelId = clean_text($settings['meta_pixel_id'] ?? '');
    $capiToken = clean_text($settings['meta_capi_token'] ?? '');

    if ($pixelId !== '' && $capiToken !== '') {
        $userData = ['ph' => hash('sha256', $phone)];
        $ipAddress = client_ip();
        $userAgent = clean_text($_SERVER['HTTP_USER_AGENT'] ?? '');
        if ($ipAddress !== '') {
            $userData['client_ip_address'] = $ipAddress;
        }
        if ($userAgent !== '') {
            $userData['client_user_agent'] = $userAgent;
        }
        if (clean_text($payload['fbp'] ?? '') !== '') {
            $userData['fbp'] = clean_text($payload['fbp']);
        }
        if (clean_text($payload['fbc'] ?? '') !== '') {
            $userData['fbc'] = clean_text($payload['fbc']);
        }

        $metaEvent = [
            'event_name' => 'Lead',
            'event_time' => time(),
            'event_id' => $eventId,
            'action_source' => 'website',
            'event_source_url' => $pageUrl,
            'user_data' => $userData,
            'custom_data' => [
                'content_name' => 'Imersao Bum Sculp 3D',
                'formacao' => clean_text($payload['formacao']),
                'objetivo' => clean_text($payload['objetivo']),
                'faturamento_medio' => clean_text($payload['faturamentoMedio']),
            ],
        ];

        try {
            $apiVersion = clean_text($settings['meta_api_version'] ?? 'v25.0');
            if (!preg_match('/^v\d+\.\d+$/', $apiVersion)) {
                $apiVersion = 'v25.0';
            }
            $metaResponse = http_post_json(
                'https://graph.facebook.com/' . rawurlencode($apiVersion) . '/' . rawurlencode($pixelId) . '/events?access_token=' . rawurlencode($capiToken),
                ['data' => [$metaEvent]]
            );
            $metaSent = $metaResponse['status'] >= 200 && $metaResponse['status'] < 300;
            if (!$metaSent) {
                error_log('Meta CAPI retornou HTTP ' . $metaResponse['status']);
            }
        } catch (Throwable $metaError) {
            error_log('Meta CAPI falhou depois do cadastro no ClickUp: ' . $metaError->getMessage());
        }
    }

    json_response(200, [
        'ok' => true,
        'taskId' => (string) $clickUpTask['id'],
        'taskUrl' => clean_text($clickUpTask['url'] ?? ''),
        'metaSent' => $metaSent,
    ]);
} catch (Throwable $error) {
    error_log('Falha ao registrar lead: ' . $error->getMessage());
    json_response(500, [
        'ok' => false,
        'error' => 'Nao foi possivel registrar seu cadastro agora. Tente novamente em instantes.',
    ]);
}
