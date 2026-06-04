# Site Elis - Imersao Bum Sculp 3D

Site estatico da imersao presencial Bum Sculp 3D, da Fada Bumbum / Dra. Elinis Almeida.

## Estrutura

- `index.html` - pagina principal da imersao presencial.
- `obrigado.html` - pagina de confirmacao depois do cadastro.
- `css/styles.css` - estilos visuais da pagina.
- `js/main.js` - links comerciais, Pixel, modal de cadastro, envio do lead, barra fixa e animacoes de entrada.
- `api/lead.js` - Vercel Function que cria o lead no ClickUp e envia o evento para Meta CAPI.
- `api/config.js` - Vercel Function que entrega configuracoes publicas do navegador, como Pixel ID.
- `js/tweaks-panel.jsx` e `js/tweaks.jsx` - painel visual de ajustes herdado do handoff, mantido como referencia e nao carregado em producao.
- `assets/` - imagens usadas pela pagina principal.
- `archive/design-handoff/` - pacote original exportado pela ferramenta de design.

## Como visualizar

Para testar apenas o visual, abra `index.html` diretamente no navegador ou rode um servidor local na raiz do projeto:

```bash
python -m http.server 4173
```

Depois acesse:

```text
http://localhost:4173
```

Para testar formulario, ClickUp e Pixel/CAPI, use Vercel:

```bash
vercel dev
```

## Variaveis de ambiente

Configure no Vercel:

- `CLICKUP_TOKEN` - token da API do ClickUp.
- `CLICKUP_LIST_ID` - lista de leads. Valor criado: `901327452649` (`CRM - Fada do Bumbum`).
- `META_PIXEL_ID` - ID do Pixel da Meta.
- `META_CAPI_TOKEN` - token da Conversions API da Meta.
- `META_API_VERSION` - versao da Graph API. Padrao: `v25.0`.

O Pixel ID e servido ao navegador por `/api/config`. Os tokens do ClickUp e da Meta ficam somente nas Functions.

## Testes

```bash
npm test
```

## Ajustes antes de publicar

Atualize em `js/main.js`:

- `WA_NUMBER` com o WhatsApp oficial.
- `IG_URL` com o Instagram oficial.
- `CONFIRMATION_WA_NUMBER` se o WhatsApp da pagina de confirmacao mudar.

O restante do material original foi preservado em `archive/design-handoff/`.
