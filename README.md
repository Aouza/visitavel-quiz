# Quiz Pós-Término - Qualificação de Leads

Sistema completo de quiz multi-step para qualificar leads pós-término de relacionamento, com captura de e-mail/WhatsApp, segmentação inteligente e direcionamento para oferta personalizada.

## 🚀 Stack Tecnológico

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (componentes UI)
- **React Hook Form** + **Zod** (validação)
- **localStorage** (persistência do quiz)
- **Analytics**: GA4 (dataLayer) + Meta Pixel (fbq)

## 📁 Estrutura do Projeto

```
visitavel-quiz/
├── app/
│   ├── layout.tsx              # Layout raiz com analytics
│   ├── page.tsx                # Redirect para /quiz
│   ├── globals.css             # Estilos globais + Tailwind
│   ├── quiz/
│   │   ├── page.tsx           # Landing + modal de captura
│   │   └── resultado/
│   │       └── page.tsx       # Resultado do quiz
│   ├── oferta/
│   │   └── page.tsx           # Página de oferta com pricing
│   └── api/
│       ├── lead/
│       │   └── route.ts       # POST /api/lead (webhook + fallback)
│       └── events/
│           └── route.ts       # POST /api/events (opcional)
├── components/
│   ├── ui/                     # Componentes shadcn/ui
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── progress.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── radio-group.tsx
│   │   └── alert.tsx
│   ├── LeadModal.tsx          # Modal de captura de lead
│   ├── QuizStepper.tsx        # Componente principal do quiz
│   ├── QuizQuestion.tsx       # Renderização de pergunta individual
│   ├── ProgressHeader.tsx     # Barra de progresso
│   ├── ResultCard.tsx         # Card de resultado
│   └── PricingCards.tsx       # Cards de pricing
├── lib/
│   ├── utils.ts               # Helpers do shadcn (cn)
│   ├── questions.ts           # Definição das 12 perguntas
│   ├── scoring.ts             # Lógica de cálculo de segmento
│   ├── storage.ts             # Helpers localStorage
│   ├── analytics.ts           # Tracking GA4 + Meta
│   ├── validators.ts          # Schemas Zod
│   └── segments.ts            # Conteúdos por segmento
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── .gitignore
└── README.md
```

## 🛠️ Instalação

### 1. Clonar e instalar dependências

```bash
# Clonar o repositório
cd visitavel-quiz

# Instalar dependências
npm install
# ou
yarn install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Webhook para envio de leads (Zapier/Make)
LEAD_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/xxxxx/xxxxx

# Analytics (opcional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=123456789012345
```

**Observações:**

- `LEAD_WEBHOOK_URL`: URL do webhook (Zapier, Make, n8n, etc.) para receber leads
- Se o webhook falhar, os leads são salvos em `/tmp/leads.jsonl` como fallback
- As variáveis de analytics são opcionais, mas recomendadas para rastreamento

### 3. Rodar em desenvolvimento

```bash
npm run dev
# ou
yarn dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### 4. Build para produção

```bash
npm run build
npm run start
# ou
yarn build
yarn start
```

## 📊 Fluxo do Usuário

### 1. Landing do Quiz (`/quiz`)

- Headline empática e clara
- Benefícios do quiz
- CTA "Iniciar teste"
- Ao clicar, abre modal de captura

### 2. Modal de Captura (Lead Gate)

**Campos obrigatórios:**

- E-mail (formato válido)
- WhatsApp com DDI (apenas números, 10-16 dígitos)
- Checkbox de consentimento

**Ao enviar:**

- POST para `/api/lead`
- Salva lead no localStorage
- Dispara evento `lead_submitted`
- Libera o quiz

### 3. Quiz Multi-Step

**Características:**

- 12 perguntas (Likert + múltipla escolha + sim/não)
- Barra de progresso visual
- Botões "Voltar" e "Próximo"
- Botão "Salvar e continuar depois" (localStorage)
- Validação por pergunta
- Auto-save no localStorage

**Eventos disparados:**

- `quiz_step_{n}` (a cada pergunta)
- `quiz_completed` (ao finalizar)

### 4. Resultado (`/quiz/resultado?seg=...`)

**Mostra:**

- Fase identificada (devastação, abstinência, interiorização, ira, superação)
- Ícone e cor do segmento
- 5 bullets de resumo gratuito
- 2 CTAs:
  - Primário: "Quero o Kit Anti-Recaída" → `/oferta`
  - Secundário: "Receber por e-mail" → `/oferta` (com mensagem)

### 5. Oferta (`/oferta?seg=...`)

**Estrutura:**

- Topbar com resultado do usuário
- Hero da oferta
- Benefícios do Kit Anti-Recaída
- 3 pricing cards:
  - Relatório completo (R$ 47)
  - Kit completo + bônus (R$ 97) - **recomendado**
  - Resumo grátis (free)
- Order bump (acesso antecipado ao grupo)
- Garantia de 7 dias
- FAQ

**Eventos:**

- `offer_viewed` (ao carregar)
- `order_bump_view` (ao passar o mouse)
- `order_bump_click` (ao selecionar)
- `cta_click_checkout` (ao clicar em plano)

## 🎯 Segmentos e Lógica

### Segmentos Identificados

1. **Devastação** 💔

   - Término muito recente (0-30 dias)
   - Impacto forte no sono e apetite
   - Fase mais crítica

2. **Abstinência** 🔄

   - Impulso constante de contato
   - Checagens frequentes nas redes
   - Idealização do relacionamento

3. **Interiorização** 🤔

   - Reflexão profunda sobre si
   - Culpa e questionamentos
   - Processo de autoconhecimento

4. **Ira** 😤

   - Raiva e ressentimento
   - Foco no que deu errado
   - Energia emocional intensa

5. **Superação** 🌟
   - Voltando às atividades
   - Aberto(a) a novas conexões
   - Visão de futuro sem a pessoa

### Cálculo do Segmento

Cada pergunta tem um `mapTo` (segmento) e cada resposta tem um `weight` (0-3).

**Algoritmo:**

1. Somar pontos por segmento
2. Segmento vencedor = maior pontuação
3. Em caso de empate, prioridade: devastação > abstinência > interiorização > ira > superação

Ver: `lib/scoring.ts`

## 📝 Personalização de Conteúdos

### Editar Perguntas

Edite `lib/questions.ts`:

```typescript
export const QUESTIONS: Question[] = [
  {
    id: "tempo_fim",
    title: "Há quanto tempo aconteceu o término?",
    type: "single",
    options: [
      { value: "0-7", label: "Até 7 dias", weight: 3 },
      // ...
    ],
    mapTo: "devastacao",
    required: true,
  },
  // ...
];
```

### Editar Conteúdos por Segmento

Edite `lib/segments.ts`:

```typescript
export const SEGMENT_CONTENT: Record<Segment, SegmentContent> = {
  devastacao: {
    headline: "Você está na fase de Devastação",
    description: "...",
    bullets: ["...", "..."],
    ctaPrimary: "Quero o Kit Anti-Recaída Completo",
    ctaSecondary: "Receber resumo por e-mail",
    color: "text-red-600",
    icon: "💔",
  },
  // ...
};
```

### Editar Links de Checkout

Edite `components/PricingCards.tsx`:

```typescript
const PLANS: PricingPlan[] = [
  {
    id: "kit-complete",
    name: "Kit Anti-Recaída Completo",
    price: "R$ 97",
    priceNumeric: 97,
    checkoutUrl: "https://pay.hotmart.com/SEU_PRODUTO",
    // ...
  },
];
```

## 🔐 Privacidade e Armazenamento

### localStorage

**Dados armazenados:**

- `visitavel_quiz_progress`: progresso do quiz (auto-save)
- `visitavel_lead_info`: e-mail e WhatsApp capturados
- `visitavel_utms`: UTM parameters da URL

**Limpeza:**

- Quiz finalizado: limpa `quiz_progress`
- Não limpa `lead_info` e `utms` (útil para múltiplas sessões)

### Fallback de Leads

Se o webhook falhar, leads são salvos em:

```
/tmp/leads.jsonl
```

Formato JSONL (uma linha por lead):

```json
{
  "email": "user@example.com",
  "whatsapp": "5511999999999",
  "consent": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📈 Analytics

### Eventos Disparados

| Evento               | Quando                     | Payload                                      |
| -------------------- | -------------------------- | -------------------------------------------- |
| `quiz_view`          | Usuário entra em `/quiz`   | -                                            |
| `quiz_cta_click`     | Clica em "Iniciar teste"   | -                                            |
| `lead_submitted`     | Lead capturado com sucesso | `email_domain`                               |
| `lead_error`         | Erro ao enviar lead        | `error_message`                              |
| `quiz_step`          | A cada pergunta respondida | `step`, `total_steps`, `progress_percentage` |
| `quiz_completed`     | Finaliza o quiz            | `segment`, `score`, `answers_hash`           |
| `offer_viewed`       | Entra na página de oferta  | `segment`                                    |
| `order_bump_view`    | Mouse sobre order bump     | -                                            |
| `order_bump_click`   | Seleciona order bump       | -                                            |
| `cta_click_checkout` | Clica em plano             | `plan`, `price`                              |

### Integração GA4

Os eventos são enviados via `window.dataLayer`:

```javascript
window.dataLayer.push({
  event: "quiz_completed",
  segment: "devastacao",
  score: 18,
});
```

### Integração Meta Pixel

```javascript
window.fbq("trackCustom", "quiz_completed", {
  segment: "devastacao",
  score: 18,
});
```

## 🧪 Checklist de Testes

- [ ] Validação de e-mail e WhatsApp
- [ ] Modal abre e fecha corretamente
- [ ] Lead enviado para webhook (verificar logs)
- [ ] Lead salvo em fallback se webhook falhar
- [ ] Progresso do quiz salvo no localStorage
- [ ] Refresh da página mantém progresso
- [ ] Todas as 12 perguntas renderizam corretamente
- [ ] Cálculo de segmento correto
- [ ] Redirecionamento para resultado
- [ ] Resultado mostra segmento correto
- [ ] UTMs preservados até checkout
- [ ] Eventos disparando (verificar DevTools Console)
- [ ] Responsivo (320px - desktop)
- [ ] Navegação por teclado funcional
- [ ] Links de checkout abrem em nova aba

## 🚨 Troubleshooting

### Webhook não recebe leads

1. Verifique se `LEAD_WEBHOOK_URL` está configurado em `.env.local`
2. Teste o webhook com curl:
   ```bash
   curl -X POST https://seu-webhook.com \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","whatsapp":"5511999999999","consent":true}'
   ```
3. Verifique logs do servidor Next.js
4. Leads estão salvos em `/tmp/leads.jsonl` como fallback

### Analytics não rastreia

1. Verifique se as variáveis `NEXT_PUBLIC_GA_MEASUREMENT_ID` e `NEXT_PUBLIC_FB_PIXEL_ID` estão definidas
2. Abra DevTools Console e procure por logs `[Analytics]`
3. Verifique Network tab para chamadas ao GA4 e Meta

### localStorage não persiste

1. Verifique se o navegador permite localStorage
2. Modo anônimo pode limpar dados ao fechar a aba
3. Verifique Console por erros

### Erro de TypeScript

```bash
npm run build
```

Verifique erros de tipo e corrija antes de fazer deploy.

## 📦 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variáveis de ambiente no dashboard da Vercel
```

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js 14:

- Netlify
- AWS Amplify
- Google Cloud Run
- Docker

## 📄 Licença

Este projeto é proprietário e confidencial.

## 🤝 Suporte

Para dúvidas ou problemas, entre em contato com o time de desenvolvimento.

---

**Desenvolvido com ❤️ usando Next.js 14 + TypeScript + Tailwind CSS**
