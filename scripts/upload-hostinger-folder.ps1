param(
    [Parameter(Mandatory = $true)]
    [string]$SourceRoot,

    [string]$DestinationRoot = 'curso-presencial'
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Net.Http

$workspaceRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$sourceRootFull = [System.IO.Path]::GetFullPath((Resolve-Path -LiteralPath $SourceRoot).Path)
if (-not $sourceRootFull.StartsWith($workspaceRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'A origem do upload precisa estar dentro do projeto.'
}

$credentialLine = [Console]::In.ReadLine()
if ([string]::IsNullOrWhiteSpace($credentialLine)) {
    throw 'Credenciais de upload nao recebidas pela entrada padrao.'
}

$credentials = $credentialLine | ConvertFrom-Json
if (-not $credentials.url -or -not $credentials.auth_key -or -not $credentials.rest_auth_key) {
    throw 'Credenciais de upload incompletas.'
}

$baseUrl = [string]$credentials.url
$baseUrl = $baseUrl.TrimEnd('/')
$rootUri = [Uri]::new($sourceRootFull.TrimEnd('\') + '\')
$files = @(Get-ChildItem -LiteralPath $sourceRootFull -Recurse -File | Sort-Object FullName)
if ($files.Count -eq 0) {
    throw 'Nenhum arquivo encontrado para upload.'
}

$client = [System.Net.Http.HttpClient]::new()
$client.Timeout = [TimeSpan]::FromMinutes(10)
$uploadedBytes = [int64]0

try {
    for ($index = 0; $index -lt $files.Count; $index++) {
        $file = $files[$index]
        $fileUri = [Uri]::new($file.FullName)
        $relativePath = [Uri]::UnescapeDataString($rootUri.MakeRelativeUri($fileUri).ToString())
        $destination = ($DestinationRoot.Trim('/').Trim('\') + '/' + $relativePath).Replace('\', '/')
        $encodedDestination = (($destination -split '/') | ForEach-Object { [Uri]::EscapeDataString($_) }) -join '/'
        $uploadUri = "${baseUrl}/${encodedDestination}?override=true"
        $length = [int64]$file.Length

        $createRequest = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::Post, $uploadUri)
        $createRequest.Headers.TryAddWithoutValidation('X-Auth', [string]$credentials.auth_key) | Out-Null
        $createRequest.Headers.TryAddWithoutValidation('X-Auth-Rest', [string]$credentials.rest_auth_key) | Out-Null
        $createRequest.Headers.TryAddWithoutValidation('Tus-Resumable', '1.0.0') | Out-Null
        $createRequest.Headers.TryAddWithoutValidation('Upload-Length', [string]$length) | Out-Null
        $createRequest.Headers.TryAddWithoutValidation('Upload-Offset', '0') | Out-Null
        $createRequest.Content = [System.Net.Http.ByteArrayContent]::new([byte[]]@())

        $createResponse = $client.SendAsync($createRequest).GetAwaiter().GetResult()
        if ([int]$createResponse.StatusCode -ne 201) {
            throw "Falha ao iniciar upload de $relativePath (HTTP $([int]$createResponse.StatusCode))."
        }

        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        $uploadRequest = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::new('PATCH'), $uploadUri)
        $uploadRequest.Headers.TryAddWithoutValidation('X-Auth', [string]$credentials.auth_key) | Out-Null
        $uploadRequest.Headers.TryAddWithoutValidation('X-Auth-Rest', [string]$credentials.rest_auth_key) | Out-Null
        $uploadRequest.Headers.TryAddWithoutValidation('Tus-Resumable', '1.0.0') | Out-Null
        $uploadRequest.Headers.TryAddWithoutValidation('Upload-Offset', '0') | Out-Null
        $uploadRequest.Content = [System.Net.Http.ByteArrayContent]::new($bytes)
        $uploadRequest.Content.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::new('application/offset+octet-stream')

        $uploadResponse = $client.SendAsync($uploadRequest).GetAwaiter().GetResult()
        if ([int]$uploadResponse.StatusCode -ne 204) {
            throw "Falha ao enviar $relativePath (HTTP $([int]$uploadResponse.StatusCode))."
        }

        $offsetValues = [System.Collections.Generic.IEnumerable[string]]$null
        if (-not $uploadResponse.Headers.TryGetValues('Upload-Offset', [ref]$offsetValues)) {
            throw "O servidor nao confirmou o tamanho enviado para $relativePath."
        }
        $confirmedOffset = [int64](@($offsetValues)[0])
        if ($confirmedOffset -ne $length) {
            throw "Upload incompleto de ${relativePath}: $confirmedOffset de $length bytes."
        }

        $uploadedBytes += $length
        Write-Output ("Enviado {0}/{1}: {2}" -f ($index + 1), $files.Count, $relativePath)
    }

    [PSCustomObject]@{
        ok = $true
        destination = $DestinationRoot
        files = $files.Count
        bytes = $uploadedBytes
    } | ConvertTo-Json -Compress
}
finally {
    $client.Dispose()
}
