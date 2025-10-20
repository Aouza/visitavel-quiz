# 🚀 Guia de Deploy

Como fazer deploy do quiz em diferentes plataformas.

---

## 📋 Pré-requisitos

Antes de fazer deploy:

- [ ] Build local funcionando: `npm run build`
- [ ] Todas as variáveis de ambiente definidas
- [ ] Links de checkout atualizados
- [ ] Webhook configurado e testado
- [ ] Analytics configurado (opcional)

---

## 🌐 Vercel (Recomendado)

### Por que Vercel?

- Deploy automático a cada push
- Preview URLs para cada PR
- Edge Functions globais
- Zero config para Next.js
- SSL automático
- **Grátis** para hobby projects

### Setup

#### 1. Instalar CLI

```bash
npm i -g vercel
```

#### 2. Login

```bash
vercel login
```

#### 3. Deploy

```bash
# Deploy preview
vercel

# Deploy produção
vercel --prod
```

#### 4. Configurar Variáveis de Ambiente

**Opção A: Via Dashboard**

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione o projeto
3. Settings → Environment Variables
4. Adicione:
   - `LEAD_WEBHOOK_URL`
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID` (opcional)
   - `NEXT_PUBLIC_FB_PIXEL_ID` (opcional)

**Opção B: Via CLI**

```bash
vercel env add LEAD_WEBHOOK_URL production
# Cole o valor quando solicitado

vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production
vercel env add NEXT_PUBLIC_FB_PIXEL_ID production
```

#### 5. Redeploy

```bash
vercel --prod
```

#### 6. Configurar Domínio Customizado (Opcional)

1. Dashboard → Settings → Domains
2. Add Domain: `quiz.seudominio.com`
3. Configurar DNS (A record ou CNAME)
4. Aguardar propagação

### Deploy Automático (Git)

1. **Conectar repositório GitHub/GitLab**

   - Dashboard → Import Project
   - Autorizar acesso
   - Selecionar repositório

2. **Configurar variáveis de ambiente**

   - Settings → Environment Variables

3. **Pronto!**
   - Todo push em `main` → deploy automático
   - PRs → preview deployment

---

## ☁️ Netlify

### Setup

#### 1. Instalar CLI

```bash
npm i -g netlify-cli
```

#### 2. Login

```bash
netlify login
```

#### 3. Configurar `netlify.toml`

Crie na raiz do projeto:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NEXT_TELEMETRY_DISABLED = "1"
```

#### 4. Deploy

```bash
# Deploy preview
netlify deploy

# Deploy produção
netlify deploy --prod
```

#### 5. Variáveis de Ambiente

```bash
netlify env:set LEAD_WEBHOOK_URL "https://..."
netlify env:set NEXT_PUBLIC_GA_MEASUREMENT_ID "G-..."
netlify env:set NEXT_PUBLIC_FB_PIXEL_ID "123..."
```

---

## 🔶 AWS Amplify

### Setup

#### 1. Criar `amplify.yml`

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - "**/*"
  cache:
    paths:
      - node_modules/**/*
```

#### 2. Deploy via Console

1. Acesse [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. "New app" → "Host web app"
3. Conectar repositório Git
4. Configurar build settings (usar `amplify.yml`)
5. Adicionar variáveis de ambiente
6. Deploy

---

## 🐳 Docker

### Criar `Dockerfile`

```dockerfile
FROM node:20-alpine AS base

# Dependências
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Produção
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Adicionar ao `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
};

module.exports = nextConfig;
```

### Build e Run

```bash
# Build
docker build -t visitavel-quiz .

# Run
docker run -p 3000:3000 \
  -e LEAD_WEBHOOK_URL="https://..." \
  -e NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..." \
  visitavel-quiz
```

### Docker Compose

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - LEAD_WEBHOOK_URL=${LEAD_WEBHOOK_URL}
      - NEXT_PUBLIC_GA_MEASUREMENT_ID=${NEXT_PUBLIC_GA_MEASUREMENT_ID}
      - NEXT_PUBLIC_FB_PIXEL_ID=${NEXT_PUBLIC_FB_PIXEL_ID}
    restart: unless-stopped
```

```bash
docker-compose up -d
```

---

## 🌍 VPS Manual (Ubuntu)

### Requisitos

- Ubuntu 20.04+
- Node.js 20+
- Nginx
- SSL (Let's Encrypt)

### 1. Preparar Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx

# Instalar Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Deploy da Aplicação

```bash
# Clonar repositório
cd /var/www
sudo git clone https://github.com/seu-usuario/visitavel-quiz.git
cd visitavel-quiz

# Instalar dependências
sudo npm install

# Criar .env.local
sudo nano .env.local
# Cole suas variáveis de ambiente

# Build
sudo npm run build

# Iniciar com PM2
sudo pm2 start npm --name "quiz" -- start

# Auto-start no boot
sudo pm2 startup
sudo pm2 save
```

### 3. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/quiz
```

```nginx
server {
    listen 80;
    server_name quiz.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/quiz /etc/nginx/sites-enabled/

# Testar config
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### 4. Configurar SSL

```bash
sudo certbot --nginx -d quiz.seudominio.com
```

### 5. Atualizar Aplicação

```bash
cd /var/www/visitavel-quiz
sudo git pull
sudo npm install
sudo npm run build
sudo pm2 restart quiz
```

---

## 🔍 Monitoramento

### Logs

**Vercel:**

```bash
vercel logs
```

**Netlify:**

```bash
netlify logs
```

**PM2:**

```bash
pm2 logs quiz
```

**Docker:**

```bash
docker logs -f visitavel-quiz
```

### Health Check

Crie `app/api/health/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
```

Teste: `curl https://seu-dominio.com/api/health`

---

## 🚨 Troubleshooting

### Build falha

```bash
# Limpar cache
rm -rf .next node_modules
npm install
npm run build
```

### Variáveis de ambiente não funcionam

- Certifique-se de usar `NEXT_PUBLIC_` para variáveis client-side
- Redeploy após alterar variáveis
- Verifique logs do build

### 500 Internal Server Error

- Verifique logs do servidor
- Teste build local: `npm run build && npm start`
- Verifique se todas as dependências estão instaladas

### Webhook não recebe leads

- Verifique se `LEAD_WEBHOOK_URL` está correto
- Teste webhook manualmente com curl
- Verifique firewall/CORS do webhook

---

## 📊 Performance

### Otimizações Recomendadas

1. **CDN**: Vercel já usa, outras plataformas podem precisar Cloudflare

2. **Caching**:

   ```javascript
   // next.config.js
   module.exports = {
     async headers() {
       return [
         {
           source: "/api/:path*",
           headers: [{ key: "Cache-Control", value: "no-cache" }],
         },
       ];
     },
   };
   ```

3. **Compressão**: Nginx/Cloudflare automaticamente comprimem

4. **Images**: Use `next/image` para otimização automática

---

## ✅ Checklist Final

Antes de considerar deploy completo:

- [ ] SSL configurado (HTTPS)
- [ ] Domínio apontando corretamente
- [ ] Variáveis de ambiente configuradas
- [ ] Webhook recebendo leads
- [ ] Analytics rastreando eventos
- [ ] Todas as páginas carregando
- [ ] Links de checkout funcionando
- [ ] Responsivo testado
- [ ] Performance aceitável (Lighthouse > 80)
- [ ] Monitoramento configurado

---

## 🆘 Suporte

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

---

**Boa sorte com seu deploy! 🚀**
