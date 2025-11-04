# 🔐 Configuração de Variáveis de Ambiente

## ⚠️ CRÍTICO: META_ACCESS_TOKEN

**A cobertura CAPI está em 14% porque `META_ACCESS_TOKEN` provavelmente não está configurada!**

---

## 📋 Variáveis Obrigatórias

### 1. Meta / Facebook Pixel

```bash
# ID do Pixel (público - pode ser exposto no browser)
NEXT_PUBLIC_FB_PIXEL_ID=seu_pixel_id_aqui

# Token de Acesso CAPI (SECRETO - apenas server-side)
# ⚠️ SEM ESTE TOKEN = COBERTURA 14%
# ✅ COM ESTE TOKEN = COBERTURA 75%+
META_ACCESS_TOKEN=seu_token_aqui
```

**Como obter `META_ACCESS_TOKEN`:**

1. Acesse: https://business.facebook.com/events_manager2/
2. Selecione seu Pixel
3. Settings → Conversions API → **Generate Access Token**
4. Copie o token (começa com `EAA...`)

---

### 2. Google Analytics (Opcional)

```bash
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
```

### 3. Microsoft Clarity (Opcional)

```bash
NEXT_PUBLIC_CLARITY_PROJECT_ID=seu_project_id
```

---

## 🚀 Como Configurar

### Desenvolvimento Local

1. Crie o arquivo `.env.local` na raiz do projeto:

```bash
cp .env.example .env.local  # ou crie manualmente
```

2. Adicione suas variáveis:

```bash
NEXT_PUBLIC_FB_PIXEL_ID=123456789012345
META_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CLARITY_PROJECT_ID=xxxxxxxxx
```

3. Reinicie o servidor:

```bash
npm run dev
```

---

### Produção (Vercel)

1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables
2. Adicione as variáveis:
   - `NEXT_PUBLIC_FB_PIXEL_ID` (Production)
   - `META_ACCESS_TOKEN` (Production) ← **CRÍTICO!**
   - `NEXT_PUBLIC_GA_TRACKING_ID` (Production)
   - `NEXT_PUBLIC_CLARITY_PROJECT_ID` (Production)
3. Faça redeploy do projeto

---

### Produção (Outras Plataformas)

Configure as variáveis de ambiente conforme documentação da plataforma:

- **Railway**: Settings → Variables
- **Render**: Environment → Environment Variables
- **AWS/Docker**: `.env` ou secrets manager

---

## ✅ Como Validar se Está Funcionando

### 1. Logs no Console do Navegador

Abra DevTools (F12) e navegue pelas páginas. Procure por:

✅ **Sucesso:**

```
[Track Meta] ✅ CAPI enviado: PageView (abc123) - Success: true
```

❌ **Falha:**

```
[Track Meta] ❌ Backend retornou success=false para PageView
```

### 2. Logs no Console do Servidor

No terminal onde o Next.js roda, procure por:

✅ **Sucesso:**

```
[Meta CAPI] ✅ SUCESSO - Evento recebido pela Meta!
  - Event: PageView (abc123)
  - Quality Score: 8/17 parâmetros preenchidos
```

❌ **Falha (Token Faltando):**

```
[Meta CAPI] ❌ CONFIGURAÇÃO FALTANDO - CAPI NÃO FUNCIONARÁ:
  - NEXT_PUBLIC_FB_PIXEL_ID: ✅ Configurado
  - META_ACCESS_TOKEN: ❌ FALTANDO (CRÍTICO!)
  ⚠️ SOLUÇÃO: Configure META_ACCESS_TOKEN no .env.local
```

### 3. Meta Events Manager (24h depois)

1. Acesse: https://business.facebook.com/events_manager2/
2. Vá em **Overview** ou **Data Sources**
3. Verifique:
   - **Event Match Quality**: Deve subir de 14% para 75%+
   - **Deduplication**: Eventos mostram "Matched" (Pixel + Server)
   - **Events Received**: Gráfico mostra eventos chegando via Server

---

## 🔍 Troubleshooting

### Problema: "CAPI não está funcionando"

**Sintomas:**

- Logs mostram `success=false`
- Meta Events Manager mostra cobertura baixa (14%)
- Não aparecem eventos "Server" no dashboard

**Solução:**

1. ✅ Confirme que `META_ACCESS_TOKEN` está configurada
2. ✅ Verifique que o token não expirou (válido por 60 dias)
3. ✅ Confirme que o Pixel ID está correto
4. ✅ Teste com Test Event Code primeiro (opcional)

### Problema: "Quality Score baixo"

**Sintomas:**

- Logs mostram `Quality Score: 3/17`
- Meta mostra "Poor" event match quality

**Solução:**

- Adicione mais dados ao evento Lead:
  - ✅ External ID (automático)
  - ✅ Email (ao capturar lead)
  - ✅ Phone (ao capturar lead)
  - ✅ Nome completo (primeiro + sobrenome)
  - ✅ Gênero, cidade, estado (se possível)

### Problema: "Eventos não aparecem na Meta"

**Possíveis causas:**

1. Token inválido/expirado
2. Pixel ID errado
3. Eventos bloqueados por firewall corporativo
4. Domínio não verificado na Meta

**Diagnóstico:**

- Veja logs detalhados no servidor
- Use Test Event Code para debug em tempo real
- Verifique Network tab do DevTools

---

## 📚 Recursos Adicionais

- [Meta Conversions API Docs](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Event Match Quality Guide](https://www.facebook.com/business/help/765081237991954)
- [Test Events Tool](https://www.facebook.com/business/help/2040882655914671)
- [Deduplication Best Practices](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events)

---

## 🎯 Resumo

| Variável                         | Obrigatória?   | Impacto             | Onde Obter                       |
| -------------------------------- | -------------- | ------------------- | -------------------------------- |
| `NEXT_PUBLIC_FB_PIXEL_ID`        | ✅ Sim         | Pixel funcionar     | Events Manager                   |
| `META_ACCESS_TOKEN`              | ✅ **CRÍTICO** | **CAPI 14% → 75%**  | Events Manager → Settings → CAPI |
| `NEXT_PUBLIC_GA_TRACKING_ID`     | ⚪ Opcional    | Analytics           | Google Analytics                 |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | ⚪ Opcional    | Heatmaps            | Microsoft Clarity                |
| `META_TEST_EVENT_CODE`           | ⚪ Dev Only    | Debug em tempo real | Events Manager → Test Events     |

**A variável mais importante é `META_ACCESS_TOKEN`** - sem ela, CAPI não funciona!
