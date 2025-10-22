# 📊 Google Analytics 4 - Tracking Completo

## ✅ Status: IMPLEMENTADO

Todos os CTAs e screens principais da jornada do usuário estão sendo rastreados automaticamente.

---

## 🎯 EVENTOS IMPLEMENTADOS

### **1. NAVEGAÇÃO AUTOMÁTICA** (`AnalyticsProvider`)

- ✅ Rastreia TODAS as mudanças de página automaticamente
- ✅ Inclui query params (`?seg=devastacao`)
- ✅ Funciona com navegação client-side (Next.js)

**Localização:** `app/providers/AnalyticsProvider.tsx`

---

### **2. QUIZ - Landing Page** (`/quiz`)

#### Screen:

- ✅ `page_view` → Rastreado automaticamente pelo `AnalyticsProvider`

#### CTAs:

- ✅ `cta_start_quiz` → Clique em "Começar diagnóstico"
  - **Parâmetros:**
    - `page`: "/quiz"
    - `has_lead`: true/false
    - `source`: "landing_page"

**Localização:** `app/quiz/page.tsx` → `handleStartClick()`

---

### **3. LEAD CAPTURE** (`LeadModal`)

#### Screen:

- ✅ Modal é aberto automaticamente quando necessário

#### Eventos:

- ✅ `lead_capture` → Lead capturado com sucesso

  - **Parâmetros:**
    - `email_domain`: "gmail.com", "hotmail.com", etc.
    - `gender`: "M", "F", "not_informed"
    - `source`: "quiz_flow"

- ✅ `lead_error` → Erro ao capturar lead
  - **Parâmetros:**
    - `error`: mensagem do erro
    - `step`: "submit"

**Localização:** `components/LeadModal.tsx` → `onSubmit()`

---

### **4. RESULTADO** (`/quiz/resultado`)

#### Screen:

- ✅ `page_view` → Rastreado automaticamente

#### CTAs - Múltiplas Localizações:

- ✅ `cta_unlock_report` → Clique em qualquer CTA de desbloqueio
  - **Parâmetros:**
    - `segment`: "devastacao", "abstinencia", etc.
    - `page`: "/quiz/resultado"
    - `location`: identificador da posição do CTA

**Localizações do CTA:**

1. `"hero_top"` → CTA acima da dobra (primeiro botão visível)
2. `"bloco_2_cta"` → CTA no Bloco 2 (8 processos emocionais)
3. `"card_locked"` → CTA nos cards de conteúdo bloqueado
4. `"bloco_3_cta"` → CTA no Bloco 3 (por que o relatório completo)
5. `"final_cta"` → CTA final (bottom)
6. `"sticky_cta"` → CTA sticky (barra flutuante)

**Localização:** `components/ElegantResultCard.tsx` → `handleUnlockClick()`

---

### **5. OFERTA** (`/oferta`)

#### Screen:

- ✅ `page_view` → Rastreado automaticamente
- ✅ `offer_viewed` → Helper já existe em `lib/analytics.ts`

#### CTAs:

- 🔜 **TODO:** Adicionar tracking nos botões de compra
  - Sugestão: `cta_purchase_plan`
  - Parâmetros: `plan`, `price`, `segment`

---

## 📂 ARQUIVOS MODIFICADOS

### **Configuração Base:**

- ✅ `lib/analytics.ts` → Funções `gtagEvent` e `gtagPageView` adicionadas
- ✅ `app/layout.tsx` → Script do GA4 já configurado
- ✅ `app/providers/AnalyticsProvider.tsx` → Rastreamento automático de navegação

### **Tracking de CTAs:**

- ✅ `app/quiz/page.tsx` → CTA "Começar diagnóstico"
- ✅ `components/LeadModal.tsx` → Lead capture + error
- ✅ `components/ElegantResultCard.tsx` → 6 CTAs de desbloqueio

---

## 🔑 VARIÁVEL DE AMBIENTE

**Arquivo:** `.env.local` (raiz do projeto)

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-2J5C7Q63Z3
```

⚠️ **IMPORTANTE:** Reinicie o servidor após criar/editar o `.env.local`

---

## 🧪 COMO TESTAR

### **1. Console do Navegador:**

Abra o DevTools (F12) e veja os logs:

```
[Analytics] gtag Event: cta_start_quiz {page: "/quiz", has_lead: false, source: "landing_page"}
[Analytics] gtag Event: lead_capture {email_domain: "gmail.com", gender: "M", source: "quiz_flow"}
[Analytics] gtag Event: cta_unlock_report {segment: "devastacao", page: "/quiz/resultado", location: "hero_top"}
```

### **2. Google Analytics 4:**

1. Acesse o GA4: https://analytics.google.com
2. Vá em **Relatórios** → **Realtime** → **Events**
3. Navegue pelo site e veja os eventos aparecendo em tempo real

### **3. DebugView (Recomendado):**

1. Instale a extensão **Google Analytics Debugger**
2. Ative a extensão
3. Recarregue o site
4. Vá em **Admin** → **DebugView** no GA4
5. Veja eventos detalhados em tempo real

---

## 📊 EVENTOS RASTREADOS (RESUMO)

| Evento              | Tela              | Ação                      | Parâmetros                         |
| ------------------- | ----------------- | ------------------------- | ---------------------------------- |
| `page_view`         | Todas             | Navegação automática      | `page_path`, `page_title`          |
| `cta_start_quiz`    | `/quiz`           | Clique "Começar"          | `page`, `has_lead`, `source`       |
| `lead_capture`      | Modal             | Lead capturado            | `email_domain`, `gender`, `source` |
| `lead_error`        | Modal             | Erro no lead              | `error`, `step`                    |
| `cta_unlock_report` | `/quiz/resultado` | Clique "Desbloquear" (6x) | `segment`, `page`, `location`      |

---

## 🎯 PRÓXIMOS PASSOS (OPCIONAL)

### **Página de Oferta:**

Adicionar tracking nos botões de compra:

```typescript
// app/oferta/page.tsx
import { gtagEvent } from "@/lib/analytics";

const handlePurchaseClick = (plan: string, price: number) => {
  gtagEvent("cta_purchase_plan", {
    plan,
    price,
    segment,
    page: "/oferta",
  });

  // Redirecionar para checkout
};
```

### **QuizStepper:**

Tracking de progresso detalhado:

```typescript
// components/QuizStepper.tsx
gtagEvent("quiz_step_progress", {
  step: currentStep,
  total_steps: totalSteps,
  percentage: Math.round((currentStep / totalSteps) * 100),
});
```

---

## 🔧 HELPER FUNCTIONS DISPONÍVEIS

### **`gtagEvent(action, params)`**

Envia evento customizado para o GA4.

```typescript
import { gtagEvent } from "@/lib/analytics";

gtagEvent("custom_event_name", {
  param1: "value1",
  param2: 123,
  param3: true,
});
```

### **`gtagPageView(url)`**

Rastreia pageview manualmente (já usado pelo `AnalyticsProvider`).

```typescript
import { gtagPageView } from "@/lib/analytics";

gtagPageView("/pagina-customizada");
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [x] Google Analytics 4 configurado no `layout.tsx`
- [x] Variável de ambiente `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- [x] Funções `gtagEvent` e `gtagPageView` criadas
- [x] `AnalyticsProvider` para navegação automática
- [x] Tracking de CTA "Começar Quiz"
- [x] Tracking de Lead Capture
- [x] Tracking de 6 CTAs de Desbloqueio
- [ ] Tracking de CTAs de Compra (Oferta)
- [ ] Tracking detalhado de progresso do Quiz

---

## 📞 SUPORTE

Se precisar adicionar mais eventos, siga o padrão:

1. Importe `gtagEvent` de `@/lib/analytics`
2. Chame no momento correto (onClick, onSubmit, etc.)
3. Use parâmetros descritivos para análise posterior

**Exemplo:**

```typescript
import { gtagEvent } from "@/lib/analytics";

const handleClick = () => {
  gtagEvent("nome_do_evento", {
    parametro1: "valor",
    parametro2: 123,
  });

  // Resto da lógica...
};
```

---

🎉 **Tracking Completo Implementado com Sucesso!**

