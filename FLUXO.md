# Fluxo do Quiz - Visitável

## 📋 Fluxo Correto

```
1. Landing Page (/quiz)
   └─> Usuário clica "Iniciar teste"

2. Modal de Captura (LeadModal)
   ├─> Email *
   ├─> WhatsApp *
   ├─> ───────────────────────
   ├─> Data de nascimento (opcional)
   ├─> Data de nascimento do ex (opcional)
   └─> Consentimento *

3. Quiz (12 perguntas)
   ├─> Progresso salvo automaticamente
   ├─> Navegação entre perguntas
   └─> Cálculo do segmento ao final

4. Página de Resultado (/quiz/resultado?seg=X)
   ├─> ✅ RESUMO BÁSICO (grátis)
   │   ├─> Headline do segmento
   │   ├─> Descrição breve
   │   ├─> Bullets principais
   │   └─> Ícone visual
   │
   ├─> ❌ NÃO gerar relatório AI
   │   └─> (Só após pagamento)
   │
   └─> CTAs:
       ├─> CTA Principal: "Quero o Kit Anti-Recaída Completo"
       └─> CTA Secundário: "Receber resumo por e-mail"
            └─> Ambos redirecionam para /oferta?seg=X

5. Página de Ofertas (/oferta?seg=X)
   ├─> Apresentação dos pacotes
   ├─> Seleção do pacote
   └─> Pagamento

6. Pós-Pagamento (após confirmação)
   └─> ✅ AGORA SIM: Gerar relatório completo com IA
       ├─> Usar respostas salvas (loadQuizProgress)
       ├─> Usar lead info (getLeadInfo) com datas
       ├─> Chamar API /api/generate-report
       └─> Exibir relatório completo
```

## ⚠️ Importante: Datas de Nascimento

### Coleta (LeadModal)

- ✅ Campos estão no fluxo principal
- ✅ Totalmente opcionais
- ✅ Sem menção a astrologia/horóscopo/signos
- ✅ Textos neutros ("recomendações", "dinâmica do relacionamento")

### Uso (Backend)

- 🔮 Sistema de astrologia INTERNO (/lib/astrology.ts)
- 🤐 Insights incorporados SUTILMENTE no relatório
- 🚫 NUNCA mencionar astrologia para o usuário
- 💡 IA trata como "características comportamentais"

### Quando é Usado

```typescript
// ❌ NÃO: Na página de resultado gratuita
// ✅ SIM: Após pagamento, ao gerar relatório completo

// Exemplo pós-pagamento:
const leadInfo = getLeadInfo();
const response = await fetch("/api/generate-report", {
  body: JSON.stringify({
    segment,
    answers,
    scores,
    birthdate: leadInfo?.birthdate, // Opcional
    exBirthdate: leadInfo?.exBirthdate, // Opcional
  }),
});
```

## 🔒 Privacidade e Comunicação

### O que o usuário vê:

- "Sua data de nascimento (opcional)"
- "Ajuda a criar recomendações mais específicas para você"
- "Permite análise mais profunda da dinâmica do relacionamento"

### O que o usuário NÃO vê:

- ❌ "Astrologia"
- ❌ "Horóscopo"
- ❌ "Signo"
- ❌ "Mapa astral"
- ❌ "Compatibilidade astrológica"

### O que acontece por trás:

- Sistema calcula signo automaticamente
- Gera insights baseados em arquétipos astrológicos
- IA incorpora sutilmente como "padrões comportamentais"
- Resultado final: relatório mais rico SEM parecer "místico"

## 📊 Estrutura de Dados

### Lead Info (armazenado)

```typescript
{
  email: string;
  whatsapp: string;
  capturedAt: string;
  birthdate?: string;        // YYYY-MM-DD
  exBirthdate?: string;      // YYYY-MM-DD
}
```

### Quiz Progress (armazenado)

```typescript
{
  currentStep: number;
  answers: Record<string, string | string[]>;
  startedAt: string;
  lastUpdated: string;
}
```

### Generate Report Request (API)

```typescript
{
  segment: Segment;
  answers: Record<string, string | string[]>;
  scores: Record<Segment, number>;
  birthdate?: string;        // Opcional
  exBirthdate?: string;      // Opcional
}
```

## 🎯 Componentes

### Usado na Página de Resultado (Grátis)

- ✅ `<ResultCard />` - Resumo básico
- ❌ `<AIReport />` - NÃO usar aqui

### Usado Pós-Pagamento

- ✅ `<AIReport />` - Relatório completo gerado pela IA

## 📝 To-Do para Implementação Completa

- [ ] Criar página /oferta com pacotes
- [ ] Integrar gateway de pagamento
- [ ] Criar página pós-pagamento com relatório completo
- [ ] Adicionar envio de resumo por email
- [ ] Webhook de confirmação de pagamento
- [ ] Trigger para gerar relatório após pagamento confirmado

---

**Importante**: Este documento descreve o fluxo CORRETO. O relatório AI só deve ser gerado após pagamento, não automaticamente na página de resultado gratuita.
