# 📂 Estrutura do Projeto

Visão completa da organização de arquivos e pastas.

```
visitavel-quiz/
│
├── 📄 Configuração
│   ├── package.json              # Dependências e scripts
│   ├── tsconfig.json             # Config TypeScript
│   ├── next.config.js            # Config Next.js
│   ├── tailwind.config.ts        # Config Tailwind
│   ├── postcss.config.js         # Config PostCSS
│   ├── components.json           # Config shadcn/ui
│   ├── .nvmrc                    # Versão Node.js
│   ├── .gitignore                # Arquivos ignorados
│   └── .env.local.example        # Template variáveis ambiente
│
├── 📚 Documentação
│   ├── README.md                 # Documentação principal
│   ├── SETUP.md                  # Guia de setup rápido
│   ├── CUSTOMIZATION.md          # Guia de customização
│   ├── CHANGELOG.md              # Histórico de versões
│   └── PROJECT_STRUCTURE.md      # Este arquivo
│
├── 🎨 App (Next.js 14)
│   ├── layout.tsx                # Layout raiz + analytics
│   ├── page.tsx                  # Home (redirect /quiz)
│   ├── globals.css               # Estilos globais
│   │
│   ├── 📝 quiz/
│   │   ├── page.tsx             # Landing + modal captura
│   │   └── resultado/
│   │       └── page.tsx         # Resultado do quiz
│   │
│   ├── 💰 oferta/
│   │   └── page.tsx             # Página de oferta
│   │
│   └── 🔌 api/
│       ├── lead/
│       │   └── route.ts         # POST /api/lead
│       └── events/
│           └── route.ts         # POST /api/events
│
├── 🧩 Components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx           # Botão
│   │   ├── dialog.tsx           # Modal/Dialog
│   │   ├── input.tsx            # Input de texto
│   │   ├── label.tsx            # Label
│   │   ├── progress.tsx         # Barra de progresso
│   │   ├── card.tsx             # Card
│   │   ├── checkbox.tsx         # Checkbox
│   │   ├── radio-group.tsx      # Radio buttons
│   │   └── alert.tsx            # Alertas
│   │
│   ├── LeadModal.tsx            # Modal captura lead
│   ├── QuizStepper.tsx          # Quiz multi-step (main)
│   ├── QuizQuestion.tsx         # Pergunta individual
│   ├── ProgressHeader.tsx       # Header com progresso
│   ├── ResultCard.tsx           # Card de resultado
│   └── PricingCards.tsx         # Cards de preço
│
├── 📚 Lib (Business Logic)
│   ├── utils.ts                 # Helpers shadcn (cn)
│   ├── questions.ts             # 12 perguntas + types
│   ├── scoring.ts               # Cálculo segmento
│   ├── storage.ts               # localStorage helpers
│   ├── analytics.ts             # GA4 + Meta Pixel
│   ├── validators.ts            # Schemas Zod
│   └── segments.ts              # Conteúdos por fase
│
└── 📦 Gerados (não commitar)
    ├── node_modules/            # Dependências
    ├── .next/                   # Build Next.js
    ├── tmp/                     # Logs e fallback
    │   ├── leads.jsonl         # Leads fallback
    │   └── events.jsonl        # Eventos (dev only)
    └── .env.local               # Variáveis ambiente (secret)
```

---

## 📁 Descrição das Pastas

### `app/` - Aplicação Next.js

Estrutura do App Router do Next.js 14. Cada pasta = uma rota.

**Responsabilidades:**

- Roteamento
- Layouts
- Server Components
- API Routes
- Metadata (SEO)

### `components/` - Componentes React

Componentes reutilizáveis da UI.

**Subpastas:**

- `ui/` - Componentes base do shadcn/ui
- Raiz - Componentes específicos do projeto

**Padrão de nomenclatura:**

- PascalCase para componentes
- Um componente por arquivo

### `lib/` - Lógica de Negócio

Funções puras, helpers, configurações.

**Responsabilidades:**

- Lógica de negócio
- Schemas de validação
- Integrações externas
- Utilitários
- Tipos TypeScript

**Sem JSX/React aqui!**

### `tmp/` - Arquivos Temporários

Gerado automaticamente. Fallback e logs.

**Conteúdo:**

- `leads.jsonl` - Leads quando webhook falha
- `events.jsonl` - Eventos (apenas dev)

**Ignorado pelo git.**

---

## 🔗 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────┐
│                    USUÁRIO                              │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│           /quiz (Landing + LeadModal)                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 1. Captura UTMs (lib/storage)                    │  │
│  │ 2. Valida formulário (lib/validators)            │  │
│  │ 3. POST /api/lead                                │  │
│  │ 4. Track: lead_submitted (lib/analytics)         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│               QuizStepper                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 1. Carrega perguntas (lib/questions)             │  │
│  │ 2. Renderiza QuizQuestion                        │  │
│  │ 3. Auto-save localStorage (lib/storage)          │  │
│  │ 4. Track: quiz_step_N (lib/analytics)            │  │
│  │ 5. Ao final: calcula segmento (lib/scoring)      │  │
│  │ 6. Track: quiz_completed                         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│         /quiz/resultado?seg=X                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 1. Recebe segmento da URL                        │  │
│  │ 2. Carrega conteúdo (lib/segments)               │  │
│  │ 3. Renderiza ResultCard                          │  │
│  │ 4. CTAs → redireciona /oferta?seg=X              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│            /oferta?seg=X                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 1. Exibe resultado + oferta                      │  │
│  │ 2. Track: offer_viewed (lib/analytics)           │  │
│  │ 3. Renderiza PricingCards                        │  │
│  │ 4. Adiciona UTMs aos links checkout              │  │
│  │ 5. Track: cta_click_checkout                     │  │
│  │ 6. Abre checkout em nova aba                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Responsabilidades por Arquivo

### Core do Quiz

| Arquivo                       | Responsabilidade     | Importado por        |
| ----------------------------- | -------------------- | -------------------- |
| `lib/questions.ts`            | Definir perguntas    | QuizStepper, scoring |
| `lib/scoring.ts`              | Calcular segmento    | QuizStepper          |
| `lib/segments.ts`             | Conteúdos por fase   | ResultCard, oferta   |
| `components/QuizStepper.tsx`  | Orquestração do quiz | /quiz/page           |
| `components/QuizQuestion.tsx` | Renderizar pergunta  | QuizStepper          |

### Captura de Lead

| Arquivo                    | Responsabilidade | Importado por     |
| -------------------------- | ---------------- | ----------------- |
| `lib/validators.ts`        | Validação Zod    | LeadModal         |
| `components/LeadModal.tsx` | UI de captura    | /quiz/page        |
| `app/api/lead/route.ts`    | Salvar lead      | LeadModal (fetch) |

### Oferta

| Arquivo                       | Responsabilidade | Importado por   |
| ----------------------------- | ---------------- | --------------- |
| `components/PricingCards.tsx` | Cards de preço   | /oferta/page    |
| `components/ResultCard.tsx`   | Resumo resultado | /resultado/page |

### Analytics & Storage

| Arquivo            | Responsabilidade | Importado por        |
| ------------------ | ---------------- | -------------------- |
| `lib/analytics.ts` | Tracking eventos | Todos os componentes |
| `lib/storage.ts`   | localStorage     | Todos os componentes |

---

## 📦 Dependências Principais

| Pacote            | Versão   | Uso           |
| ----------------- | -------- | ------------- |
| `next`            | 14.1.0   | Framework     |
| `react`           | 18.2.0   | UI            |
| `typescript`      | ^5       | Type safety   |
| `tailwindcss`     | ^3.3.0   | Styling       |
| `@radix-ui/*`     | ^1.x     | Primitivos UI |
| `react-hook-form` | ^7.50.1  | Formulários   |
| `zod`             | ^3.22.4  | Validação     |
| `lucide-react`    | ^0.344.0 | Ícones        |

---

## 🚀 Comandos Úteis

```bash
# Desenvolvimento
npm run dev           # Inicia dev server

# Build
npm run build         # Build produção
npm run start         # Roda build

# Linting
npm run lint          # ESLint

# Adicionar componente shadcn/ui
npx shadcn-ui@latest add [component]
```

---

## 🔒 Segurança

### Variáveis Sensíveis (nunca commitar)

- `.env.local` - Variáveis de ambiente
- `tmp/` - Logs e dados temporários

### Dados do Usuário

- E-mails e WhatsApps são enviados apenas para webhook configurado
- Fallback local deve ter acesso restrito
- localStorage é client-side only

### CORS

- APIs configuradas para aceitar apenas origin do próprio site
- Ajustar em produção conforme necessário

---

**Última atualização:** 20/01/2024  
**Versão da estrutura:** 1.0.0
