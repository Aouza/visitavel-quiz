# ⚡ Quick Start

Comece em **3 minutos**.

## 🚀 Instalação Rápida

### 1️⃣ Clonar e Instalar (1 min)

```bash
cd visitavel-quiz
npm install
```

### 2️⃣ Configurar (1 min)

```bash
# Criar arquivo de ambiente
cat > .env.local << EOF
LEAD_WEBHOOK_URL=https://webhook.site/unique-url
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_FB_PIXEL_ID=
EOF
```

> 💡 Use [webhook.site](https://webhook.site) para testar rapidamente

### 3️⃣ Rodar (30 seg)

```bash
npm run dev
```

✅ Abra: [http://localhost:3000](http://localhost:3000)

---

## 🎯 Fluxo Básico

```
1. Acessar /quiz
   ↓
2. Clicar "Iniciar teste"
   ↓
3. Preencher e-mail + WhatsApp
   ↓
4. Responder 12 perguntas
   ↓
5. Ver resultado
   ↓
6. Acessar oferta
```

---

## ✏️ Personalizar (5 min)

### Editar Perguntas

```bash
# Abrir no editor
code lib/questions.ts

# Ou usar seu editor preferido
nano lib/questions.ts
```

### Editar Textos dos Resultados

```bash
code lib/segments.ts
```

### Editar Preços e Checkout

```bash
code components/PricingCards.tsx

# Procure por:
checkoutUrl: 'https://pay.hotmart.com/...'

# Substitua pelo seu link
```

---

## 🔗 Configurar Webhook Real

### Opção 1: Zapier (Grátis)

1. Criar conta: [zapier.com](https://zapier.com)
2. New Zap → Webhooks → Catch Hook
3. Copiar URL
4. Colar em `.env.local`
5. Test → Enviar um lead
6. Configurar destino (Google Sheets, etc.)

### Opção 2: Make.com (Grátis)

1. Criar conta: [make.com](https://make.com)
2. New Scenario → HTTP Webhook
3. Copiar URL
4. Colar em `.env.local`
5. Configurar destino

### Opção 3: n8n (Self-hosted)

```bash
docker run -it --rm \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

---

## 📊 Ver Analytics

### Console do Navegador

```javascript
// Abrir DevTools (F12)
// Procurar por logs:
[Analytics] GA4 Event: quiz_view
[Analytics] Meta Pixel Event: quiz_view
```

### Ver Leads Capturados

```bash
# No servidor onde está rodando
cat tmp/leads.jsonl

# Ou em JSON formatado
cat tmp/leads.jsonl | jq
```

---

## 🚀 Deploy Rápido (Vercel)

```bash
# Instalar CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Configurar variáveis no dashboard
```

✅ Pronto! Seu quiz está online.

---

## 🎨 Temas e Cores

### Mudar Cor Primária

Editar `app/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%; /* HSL: Hue Saturation Lightness */
}
```

**Geradores:**

- [uicolors.app](https://uicolors.app/create)
- [tailwindcss.com/docs/colors](https://tailwindcss.com/docs/customizing-colors)

---

## 🧪 Testar Tudo

### Checklist de 2 Minutos

```bash
# 1. Página inicial carrega?
curl http://localhost:3000

# 2. Quiz abre?
curl http://localhost:3000/quiz

# 3. API de lead funciona?
curl -X POST http://localhost:3000/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "whatsapp":"5511999999999",
    "consent":true
  }'

# 4. Ver resposta
cat tmp/leads.jsonl
```

---

## 📚 Próximos Passos

1. ✅ Quiz funcionando localmente
2. 🎨 Personalizar perguntas e textos
3. 🔗 Configurar webhook real
4. 💰 Adicionar links de checkout
5. 📊 Configurar analytics (GA4 + Meta)
6. 🚀 Deploy em produção
7. 🎯 Testar fluxo completo
8. 📈 Monitorar conversões

---

## 🆘 Problemas?

### Erro: Cannot find module

```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: Port 3000 already in use

```bash
# Usar outra porta
PORT=3001 npm run dev

# Ou matar processo na porta 3000
lsof -ti:3000 | xargs kill
```

### Webhook não recebe

1. Verificar URL em `.env.local`
2. Verificar logs: `cat tmp/leads.jsonl`
3. Testar webhook com curl (ver acima)

---

## 📖 Documentação Completa

- **README.md** - Visão geral
- **SETUP.md** - Instalação detalhada
- **CUSTOMIZATION.md** - Guia de personalização
- **DEPLOY.md** - Deploy em produção
- **PROJECT_STRUCTURE.md** - Arquitetura

---

## 💬 Perguntas Frequentes

**P: Posso usar sem analytics?**  
R: Sim! As variáveis de analytics são opcionais.

**P: Funciona sem webhook?**  
R: Sim, leads são salvos em `tmp/leads.jsonl`.

**P: Posso adicionar mais perguntas?**  
R: Sim, edite `lib/questions.ts`.

**P: Como mudar os preços?**  
R: Edite `components/PricingCards.tsx`.

**P: Funciona com qualquer gateway de pagamento?**  
R: Sim, apenas atualize os links de checkout.

---

## 🎉 Pronto!

Seu quiz já está funcionando!

**Teste agora:** [http://localhost:3000](http://localhost:3000)

---

**Tempo total:** ~5 minutos ⏱️  
**Dificuldade:** Fácil 🟢  
**Custo:** Grátis 💚
