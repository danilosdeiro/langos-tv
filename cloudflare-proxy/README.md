# 🚀 Lango's TV - Cloudflare Streaming Proxy (Banda Ilimitada)

Este Cloudflare Worker atua como o **Proxy de Streaming Oficial do Lango's TV**, fornecendo:
- **Tráfego Ilimitado (Banda Gratuita):** Zero consumo da cota de 10 GB da Vercel.
- **Latência Mínima:** Servidores Edge da Cloudflare no Brasil (São Paulo, Rio de Janeiro).
- **CORS 100% Liberado:** Compatibilidade total com HLS.js em qualquer navegador ou TV Box (BTV).
- **Reescrita Inteligente:** Suporte a redirecionamentos 302, caminhos relativos e fragmentos pesados de TS.

---

## 🛠️ Como Ativar em 1 Minuto

### Método 1: Pelo Painel Web da Cloudflare (Sem instalar nada)
1. Acesse **[dash.cloudflare.com](https://dash.cloudflare.com/)** (crie uma conta gratuita se não tiver).
2. No menu lateral esquerdo, clique em **Workers & Pages**.
3. Clique no botão azul **Create application** (Criar aplicativo) e depois em **Create Worker**.
4. Dê o nome de `langos-proxy` e clique em **Deploy**.
5. Na tela seguinte, clique em **Edit code** (Editar código).
6. Copie todo o conteúdo do arquivo `worker.js` desta pasta e cole substituindo o código existente.
7. Clique em **Save and deploy** (Salvar e implantar).
8. Copie a URL gerada (exemplo: `https://langos-proxy.<seu-subdominio>.workers.dev`).

---

### Método 2: Pelo Terminal com Wrangler
No terminal do projeto:
```bash
npx wrangler login
cd cloudflare-proxy
npx wrangler deploy
```

---

## 🔗 Conectando ao Lango's TV na Vercel
Assim que tiver a sua URL do Worker (ex: `https://langos-proxy.danilo.workers.dev`):
1. Vá no painel da **Vercel** -> Seu Projeto -> **Settings** -> **Environment Variables**.
2. Adicione a variável:
   - **Key:** `VITE_STREAM_PROXY_URL`
   - **Value:** `https://langos-proxy.<seu-subdominio>.workers.dev`
3. Pronto! 100% do tráfego de streaming sairá da Vercel e passará pela Cloudflare com banda livre e ilimitada.
