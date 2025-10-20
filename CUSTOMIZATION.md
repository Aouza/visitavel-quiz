# 🎨 Guia de Customização

Como personalizar o quiz para seu caso de uso.

## 📝 Editar Perguntas

### Localização

`lib/questions.ts`

### Estrutura de uma Pergunta

```typescript
{
  id: 'tempo_fim',                    // ID único (snake_case)
  title: 'Há quanto tempo...',        // Pergunta principal
  helper: 'Escolha o período...',     // Texto auxiliar (opcional)
  type: 'single',                     // single | likert | multi | boolean
  options: [
    {
      value: '0-7',                   // Valor único
      label: 'Até 7 dias',            // Texto exibido
      weight: 3                       // Peso 0-3 (maior = mais crítico)
    },
  ],
  mapTo: 'devastacao',                // Segmento que a pergunta mede
  required: true                      // Obrigatória?
}
```

### Tipos de Pergunta

#### 1. Single Choice (Radio)

```typescript
type: 'single',
options: [
  { value: 'sim', label: 'Sim', weight: 2 },
  { value: 'nao', label: 'Não', weight: 0 },
]
```

#### 2. Likert Scale

```typescript
type: 'likert',
options: [
  { value: 'nunca', label: 'Nunca', weight: 0 },
  { value: 'as_vezes', label: 'Às vezes', weight: 1 },
  { value: 'frequente', label: 'Frequentemente', weight: 2 },
  { value: 'sempre', label: 'Sempre', weight: 3 },
]
```

#### 3. Multiple Choice (Checkbox)

```typescript
type: 'multi',
options: [
  { value: 'opcao1', label: 'Opção 1', weight: 1 },
  { value: 'opcao2', label: 'Opção 2', weight: 2 },
  { value: 'opcao3', label: 'Opção 3', weight: 1 },
]
```

#### 4. Boolean (Sim/Não)

```typescript
type: 'boolean',
options: [
  { value: 'sim', label: 'Sim', weight: 2 },
  { value: 'nao', label: 'Não', weight: 0 },
]
```

### Segmentos Disponíveis

Use em `mapTo`:

- `devastacao` - Fase inicial, impacto forte
- `abstinencia` - Impulsos de contato, idealização
- `interiorizacao` - Reflexão, culpa
- `ira` - Raiva, ressentimento
- `superacao` - Voltando ao normal

### Sistema de Pesos

- **0**: Resposta neutra/positiva
- **1**: Leve preocupação
- **2**: Moderada preocupação
- **3**: Alta preocupação/criticidade

## 🎯 Editar Conteúdos por Segmento

### Localização

`lib/segments.ts`

### Estrutura

```typescript
devastacao: {
  headline: 'Você está na fase de Devastação',
  description: 'Descrição completa da fase...',
  bullets: [
    'Bullet point 1',
    'Bullet point 2',
    'Bullet point 3',
    'Bullet point 4',
    'Bullet point 5',
  ],
  ctaPrimary: 'Quero o Kit Anti-Recaída Completo',
  ctaSecondary: 'Receber resumo por e-mail',
  color: 'text-red-600',     // Cor Tailwind
  icon: '💔',                 // Emoji
}
```

### Cores por Segmento

```typescript
devastacao: "text-red-600"; // Vermelho (crítico)
abstinencia: "text-orange-600"; // Laranja (alerta)
interiorizacao: "text-blue-600"; // Azul (reflexão)
ira: "text-purple-600"; // Roxo (emoção intensa)
superacao: "text-green-600"; // Verde (positivo)
```

### Ícones Sugeridos

```
💔 🔥 ⚠️  - Crítico/Urgente
🔄 🌀 ⏳  - Processo/Ciclo
🤔 💭 🧠  - Reflexão
😤 😠 💢  - Raiva/Frustração
🌟 ✨ 🎯  - Positivo/Crescimento
```

## 💰 Editar Pricing

### Localização

`components/PricingCards.tsx`

### Estrutura de um Plano

```typescript
{
  id: 'kit-complete',                              // ID único
  name: 'Kit Anti-Recaída Completo',               // Nome do plano
  description: 'Recomendado para resultados...',   // Subtítulo
  price: 'R$ 97',                                  // Preço display
  priceNumeric: 97,                                // Preço numérico (analytics)
  checkoutUrl: 'https://pay.hotmart.com/...',     // Link checkout
  features: [
    'Feature 1',
    'Feature 2',
    '🎁 Bônus: Item especial',
  ],
  recommended: true,                               // Badge "Mais Popular"
  badge: 'Mais Popular',                          // Texto do badge
}
```

### Alterar Links de Checkout

**Hotmart:**

```typescript
checkoutUrl: "https://pay.hotmart.com/SEU_CODIGO_PRODUTO";
```

**Gumroad:**

```typescript
checkoutUrl: "https://app.gumroad.com/checkout?product=SEU_CODIGO";
```

**Pagar.me / Stripe:**

```typescript
checkoutUrl: "https://checkout.sua-plataforma.com/produto";
```

### UTMs Automáticos

Os UTMs são adicionados automaticamente ao link de checkout:

```
?seg=devastacao&utm_source=google&utm_campaign=quiz
```

## 🎨 Customizar Design

### Cores Principais

Edite `app/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%; /* Azul principal */
  --secondary: 210 40% 96.1%; /* Cinza claro */
  --destructive: 0 84.2% 60.2%; /* Vermelho erro */
  /* ... */
}
```

### Tailwind Colors

Use o configurador: [uicolors.app](https://uicolors.app/create)

### Fontes

Edite `app/layout.tsx`:

```typescript
import { Inter, Roboto } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
});
```

### Logo / Branding

Adicione em `app/quiz/page.tsx`:

```tsx
<div className="flex items-center justify-center mb-8">
  <Image src="/logo.png" alt="Logo" width={200} height={60} />
</div>
```

## 📊 Customizar Analytics

### Adicionar Novo Evento

1. **Definir evento** (`lib/analytics.ts`):

```typescript
export const EventNames = {
  // ...existentes
  CUSTOM_EVENT: "custom_event",
} as const;
```

2. **Criar helper** (opcional):

```typescript
export function trackCustomEvent(data: string): void {
  track(EventNames.CUSTOM_EVENT, { data });
}
```

3. **Usar no componente**:

```typescript
import { trackCustomEvent } from "@/lib/analytics";

function MyComponent() {
  const handleClick = () => {
    trackCustomEvent("valor");
  };
}
```

## 🌐 Traduzir / Internacionalizar

### Estrutura Sugerida

```
lib/
  locales/
    pt-BR.json
    en-US.json
    es-ES.json
```

### Exemplo `pt-BR.json`:

```json
{
  "quiz": {
    "title": "Descubra em que fase do pós-término você está",
    "subtitle": "Em 2 minutos...",
    "cta": "Iniciar teste"
  },
  "leadModal": {
    "title": "Envie o resultado para você",
    "email": "E-mail",
    "whatsapp": "WhatsApp"
  }
}
```

### Usar Next-Intl

```bash
npm install next-intl
```

Documentação: [next-intl.vercel.app](https://next-intl-docs.vercel.app/)

## 📧 Customizar E-mails

### Onde configurar

Na automação do webhook (Zapier/Make):

1. Trigger: webhook recebe lead
2. Action: Enviar e-mail
3. Template:

```html
Olá {{name}}, Seu resultado do quiz: {{segment}} {{segment_description}} Acesse
seu relatório completo: {{report_link}} Abraços, Equipe
```

### Variáveis Disponíveis

Do payload do lead:

- `email`
- `whatsapp`
- `timestamp`
- `utms.*` (utm_source, utm_campaign, etc.)

Adicionar no resultado:

- Passar `segment` e `score` para `/api/lead`

## 🔧 Adicionar Nova Página

### 1. Criar arquivo

```
app/
  nova-pagina/
    page.tsx
```

### 2. Implementar

```typescript
export default function NovaPaginaPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold">Nova Página</h1>
    </div>
  );
}
```

### 3. Link

```tsx
<Link href="/nova-pagina">Ver Página</Link>
```

## 🎁 Adicionar Order Bumps Adicionais

Em `app/oferta/page.tsx`:

```tsx
<Card className="border-2 border-green-500">
  <CardContent className="pt-6">
    <Checkbox id="bump2" />
    <Label htmlFor="bump2">🎁 Oferta 2: Descrição...</Label>
  </CardContent>
</Card>
```

## 📱 WhatsApp Automation

### Integrar com API do WhatsApp

Use Twilio, Zenvia ou Evolution API:

```typescript
// app/api/lead/route.ts

async function sendWhatsAppMessage(whatsapp: string, message: string) {
  await fetch("https://api.twilio.com/...", {
    method: "POST",
    body: JSON.stringify({
      to: whatsapp,
      body: message,
    }),
  });
}
```

---

## 🆘 Precisa de Ajuda?

- Documentação Next.js: [nextjs.org/docs](https://nextjs.org/docs)
- Tailwind CSS: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- shadcn/ui: [ui.shadcn.com](https://ui.shadcn.com)
- React Hook Form: [react-hook-form.com](https://react-hook-form.com)

---

**Happy Customizing! 🎨**
