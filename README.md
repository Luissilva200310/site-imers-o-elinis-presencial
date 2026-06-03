# Site Elis - Imersao Bum Sculp 3D

Site estatico da imersao presencial Bum Sculp 3D, da Fada Bumbum / Dra. Elinis Almeida.

## Estrutura

- `index.html` - pagina principal da imersao presencial.
- `css/styles.css` - estilos visuais da pagina.
- `js/main.js` - links comerciais, barra fixa e animacoes de entrada.
- `js/tweaks-panel.jsx` e `js/tweaks.jsx` - painel visual de ajustes herdado do handoff, mantido como referencia e nao carregado em producao.
- `assets/` - imagens usadas pela pagina principal.
- `archive/design-handoff/` - pacote original exportado pela ferramenta de design.

## Como visualizar

Abra `index.html` diretamente no navegador ou rode um servidor local na raiz do projeto:

```bash
python -m http.server 4173
```

Depois acesse:

```text
http://localhost:4173
```

## Ajustes antes de publicar

Atualize em `js/main.js`:

- `WA_NUMBER` com o WhatsApp oficial.
- `IG_URL` com o Instagram oficial.

O restante do material original foi preservado em `archive/design-handoff/`.
