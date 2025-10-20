# 🚀 Setup Rápido

Guia de instalação em 5 minutos.

## 1. Instalar Dependências

```bash
npm install
# ou
yarn install
```

## 2. Configurar Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.local.example .env.local

# Editar com suas credenciais
nano .env.local  # ou seu editor preferido
```

**Mínimo necessário:**

```env
LEAD_WEBHOOK_URL=https://seu-webhook.com/endpoint
```

**Opcional (mas recomendado):**

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=123456789012345
```

## 3. Configurar Webhook

### Opção A: Zapier

1. Acesse [zapier.com/app/zaps](https://zapier.com/app/zaps)
2. Criar novo Zap
3. Trigger: **Webhooks by Zapier** → **Catch Hook**
4. Copiar URL do webhook
5. Action: escolher destino (Google Sheets, Airtable, CRM, etc.)
6. Colar URL em `.env.local`

### Opção B: Make.com

1. Acesse [make.com](https://make.com)
2. Criar novo cenário
3. Adicionar módulo **Webhooks** → **Custom webhook**
4. Copiar URL do webhook
5. Adicionar módulo de destino (Google Sheets, Notion, etc.)
6. Colar URL em `.env.local`

### Opção C: Webhook Simples (Teste)

Use [webhook.site](https://webhook.site) para testes rápidos (temporário).

## 4. Rodar Projeto

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 5. Testar Lead Capture

1. Abra `/quiz`
2. Clique em "Iniciar teste"
3. Preencha e-mail e WhatsApp
4. Verifique se chegou no webhook

**Logs importantes:**

```
[Lead] Successfully sent to webhook: user@example.com
[Lead] Saved to file as fallback: user@example.com
```

## 6. Testar Analytics (Opcional)

Abra DevTools Console e procure por:

```
[Analytics] GA4 Event: quiz_view
[Analytics] Meta Pixel Event: quiz_view
```

## ✅ Checklist Final

- [ ] `npm install` sem erros
- [ ] `.env.local` configurado
- [ ] `npm run dev` rodando
- [ ] Quiz abre em `/quiz`
- [ ] Modal de captura funciona
- [ ] Lead chega no webhook
- [ ] Quiz completo redireciona para resultado
- [ ] Oferta abre com segmento correto

## 🆘 Problemas Comuns

### Erro: Cannot find module

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Webhook não recebe

1. Verifique se URL está correta em `.env.local`
2. Teste com curl:
   ```bash
   curl -X POST https://seu-webhook.com \
     -H "Content-Type: application/json" \
     -d '{"test":"data"}'
   ```
3. Leads ficam salvos em `/tmp/leads.jsonl` como fallback

### Build Error

```bash
npm run build
```

Verifique erros de TypeScript e corrija antes de deploy.

## 📚 Próximos Passos

1. Personalizar perguntas em `lib/questions.ts`
2. Ajustar textos em `lib/segments.ts`
3. Atualizar links de checkout em `components/PricingCards.tsx`
4. Configurar domínio customizado
5. Deploy em produção (Vercel recomendado)

## 🎯 Deploy em Produção

### Vercel (Recomendado)

```bash
# Instalar CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Configurar variáveis de ambiente:**

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione o projeto
3. Settings → Environment Variables
4. Adicione todas as variáveis do `.env.local`

---

**Pronto! Seu quiz está no ar! 🎉**
