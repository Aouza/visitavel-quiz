# 🔍 Guia de Debug e Validação - Meta Pixel + CAPI

## ✅ O QUE FOI IMPLEMENTADO

### 1. Sistema de Logs Completo

Adicionamos logs detalhados em toda a cadeia de tracking:

- **Frontend (`lib/track-meta-event.ts`)**: Logs de início, pixel event e chamada CAPI
- **API Endpoint (`/api/meta/track`)**: Logs de requisição recebida e dados do servidor
- **CAPI Handler (`lib/meta-capi.ts`)**: Logs de configuração, payload e resposta do Meta

### 2. Deduplicação Automática

- `event_id` (UUID) é gerado uma única vez
- Mesmo `event_id` é enviado para:
  - Meta Pixel (client-side via `fbq('track', ..., { eventID: ... })`)
  - Conversions API (server-side via Graph API)

### 3. Eventos Principais Implementados

Todos os eventos já estão usando `trackMetaEvent`:

- ✅ `quiz_view` (app/quiz/page.tsx)
- ✅ `quiz_start` (app/quiz/page.tsx)
- ✅ `quiz_complete` (components/QuizStepper.tsx)
- ✅ `Lead` (components/LeadModal.tsx)
- ✅ `InitiateCheckout` (components/ElegantResultCard.tsx - 6 locais)

---

## 🧪 COMO TESTAR LOCALMENTE

### 1. Verificar Variáveis de Ambiente

```bash
# Verificar se estão configuradas
cat .env | grep META
cat .env | grep FB_PIXEL
```

Deve ter:

```
NEXT_PUBLIC_FB_PIXEL_ID=1903527500233879
META_ACCESS_TOKEN=<seu_token_aqui>
```

### 2. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

### 3. Abrir Console do Navegador

1. Abra as DevTools (F12)
2. Vá para a aba **Console**
3. Filtre por `[Track Meta]` ou `[Meta CAPI]`

### 4. Executar Ações e Observar Logs

#### A. Testar `quiz_view`

1. Acesse: `http://localhost:3000/quiz`
2. **Logs esperados no console do navegador:**

   ```
   [Track Meta] ⚡ INICIANDO TRACK: { eventName: "quiz_view", ... }
   [Track Meta] 🎯 Pixel Event: { eventName: "quiz_view", isStandard: false, ... }
   [Track Meta] 🌐 Enviando para CAPI: { eventName: "quiz_view", ... }
   [Track Meta] 📬 Resposta CAPI: { status: 200, ok: true, result: {...} }
   ```

3. **Logs esperados no terminal (servidor):**
   ```
   [Meta Track API] 📨 Requisição recebida: { eventName: "quiz_view", ... }
   [Meta Track API] 🔧 Dados do servidor: { ip: "...", hasUserAgent: true }
   [Meta CAPI] 🚀 Iniciando envio: { eventName: "quiz_view", ... }
   [Meta CAPI] 📤 Payload: { event_name: "quiz_view", has_email: false, ... }
   [Meta CAPI] 📥 Resposta: { status: 200, ok: true, result: { events_received: 1 } }
   [Meta CAPI] ✅ Evento enviado com sucesso!
   [Meta Track API] ✅ Resultado final: { success: true }
   ```

#### B. Testar `Lead`

1. Preencha o formulário de lead
2. Verifique logs similares aos acima
3. **Diferença:** deve ter `has_email: true` e `has_phone: true`

#### C. Testar `InitiateCheckout`

1. Veja o resultado do quiz
2. Clique em qualquer botão "Desbloquear"
3. Verifique os logs

---

## 🔍 DIAGNÓSTICO DE PROBLEMAS

### Problema 1: "fbq não disponível"

**Sintoma:** `[Track Meta] ⚠️ fbq não disponível`

**Causa:** Meta Pixel não foi inicializado

**Solução:**

1. Verificar se `<MetaPixel />` está no `app/layout.tsx`
2. Verificar se `NEXT_PUBLIC_FB_PIXEL_ID` está no `.env`
3. Limpar cache do navegador

---

### Problema 2: Erro 400 na API

**Sintoma:** `[Meta Track API] ❌ Validação falhou`

**Causa:** `eventName` ou `eventId` não estão sendo enviados

**Solução:**

1. Verificar logs do frontend
2. Confirmar que `generateUUID()` está funcionando
3. Verificar se `trackMetaEvent` está sendo chamado corretamente

---

### Problema 3: Erro 401/403 do Meta

**Sintoma:** `[Meta CAPI] ❌ Erro na resposta: { error: { code: 190, ... } }`

**Causa:** Token inválido ou expirado

**Solução:**

1. Ir para **Meta Events Manager** > **Configurações** > **API de Conversões**
2. Gerar novo **Token de Acesso**
3. Atualizar `META_ACCESS_TOKEN` no `.env`
4. Reiniciar servidor

---

### Problema 4: `events_received: 0`

**Sintoma:** `[Meta CAPI] ⚠️ Evento não recebido`

**Causa:** Pixel ID ou Dataset ID incorreto

**Solução:**

1. Confirmar `NEXT_PUBLIC_FB_PIXEL_ID` no `.env`
2. Verificar se o Pixel ID é o mesmo no Events Manager
3. Verificar se o Token está vinculado ao mesmo Dataset

---

## 📊 VALIDAÇÃO NO META EVENTS MANAGER

### 1. Acessar o Painel

1. Vá para: https://business.facebook.com/events_manager2
2. Selecione seu Pixel
3. Vá para **Eventos de Teste** ou **Visão Geral**

### 2. Verificar Eventos em Tempo Real

Aguarde **30 segundos a 2 minutos** após executar a ação.

**O que deve aparecer:**

```
✅ quiz_view
   Origem: Navegador, API de Conversões
   Status: Deduplicado
   Qualidade de correspondência: 7-10/10

✅ Lead
   Origem: Navegador, API de Conversões
   Status: Deduplicado
   Qualidade de correspondência: 9-10/10
   (Deve ter email e phone hasheados)
```

### 3. Verificar Diagnóstico

1. Vá para **Diagnóstico** no menu lateral
2. Procure por avisos sobre:
   - Eventos duplicados (não deve ter mais)
   - Qualidade de correspondência baixa
   - Problemas de configuração

---

## 🎯 RESULTADO ESPERADO FINAL

### Antes (Problemático)

```
❌ quiz_view - Navegador (Qualidade: 3.7/10)
❌ Lead - Navegador (Qualidade: 4.2/10)
⚠️ Eventos não otimizam campanhas
⚠️ iOS/Safari bloqueados
```

### Depois (Correto)

```
✅ quiz_view - Navegador + API de Conversões (Deduplicado, Qualidade: 8.5/10)
✅ quiz_start - Navegador + API de Conversões (Deduplicado, Qualidade: 8.3/10)
✅ quiz_complete - Navegador + API de Conversões (Deduplicado, Qualidade: 8.7/10)
✅ Lead - Navegador + API de Conversões (Deduplicado, Qualidade: 9.8/10)
✅ InitiateCheckout - Navegador + API de Conversões (Deduplicado, Qualidade: 9.5/10)
```

---

## 🧹 REMOVER LOGS DE DEBUG (Produção)

Quando tudo estiver funcionando, remover os `console.log` de debug:

### Arquivos a limpar:

1. `lib/track-meta-event.ts` - Remover logs com 🔍
2. `lib/meta-capi.ts` - Remover logs com 🔍
3. `app/api/meta/track/route.ts` - Remover logs com 🔍

**Manter apenas:**

- `console.error()` para erros críticos
- `console.warn()` para avisos importantes

---

## 📞 SUPORTE

Se após seguir este guia o problema persistir:

1. **Copie todos os logs** do console e terminal
2. **Faça screenshot** do Meta Events Manager
3. **Verifique o Network tab** (DevTools) para ver se `/api/meta/track` está sendo chamado
4. **Teste no Meta Test Events** com o código de teste

---

**Status:** 🟢 Sistema configurado e pronto para teste!
**Data:** 2025-10-22
