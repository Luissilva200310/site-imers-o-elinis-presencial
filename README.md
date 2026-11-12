# Site Elis - Imersao Bum Sculp 3D

Site estatico da imersao presencial Bum Sculp 3D, da Fada Bumbum / Dra. Elinis Almeida.

Todos os botoes de inscricao abrem diretamente o WhatsApp `55 98 9163-1745` com a mensagem:

> Ola Dra Elinis, tenho interesse em participar do curso presencial em Sao Paulo

## Estrutura publicada

- `index.html` - pagina principal da imersao presencial.
- `css/styles.css` - estilos visuais da pagina.
- `js/main.js` - link do WhatsApp, Instagram, barra fixa e animacoes de entrada.
- `assets/` - imagens usadas pela pagina.
- `.htaccess` - HTTPS, cache e compressao.

## Como visualizar

Abra `index.html` diretamente no navegador ou rode um servidor local na raiz do projeto:

```bash
python -m http.server 4173
```

## Publicar na Hostinger

### Automático (padrão)

Todo push na `main` dispara `.github/workflows/deploy-branch.yml`, que roda os testes e
grava somente os arquivos do site na branch `deploy`. A integração GitHub da Hostinger
publica essa branch em `public_html/curso-presencial`
(https://metodobumsculp.com/curso-presencial).

### Manual (alternativa)

1. Gere o pacote com PowerShell:

```powershell
.\scripts\build-hostinger.ps1
```

2. No hPanel, abra **Sites > Gerenciar > Gerenciador de arquivos > public_html**.
3. Envie `dist/site-elis-hostinger.zip` para `public_html` e extraia o ZIP ali.
4. Confirme que `index.html`, `assets`, `css` e `js` ficaram diretamente dentro de `public_html`.
5. Abra o dominio em uma janela anonima e teste um botao de inscricao.

O site publicado nao depende de PHP, banco de dados, ClickUp ou formulario.

## Testes

```bash
npm test
```

Antes de publicar, atualize `IG_URL` em `js/main.js` com o Instagram oficial.
