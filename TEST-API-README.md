# 🧪 Teste da API de Relatório Gratuito (modo "free")

## 📋 Pré-requisitos

1. Servidor de desenvolvimento rodando:

```bash
yarn dev
```

2. Variável de ambiente configurada:

```bash
# .env.local
OPENAI_API_KEY=sk-your-api-key-here
```

---

## 🚀 Opção 1: Testar via Script Direto

### Passo 1: Instalar tsx (se não tiver)

```bash
npm install -g tsx
# ou
yarn global add tsx
```

### Passo 2: Executar o teste

```bash
npx tsx test-api-free.ts
```

### Resultado esperado:

```
✅ Resposta recebida!

📊 Metadata:
  - Segment: abstinencia
  - Mode: free
  - Generated at: 2025-01-...

📄 Estrutura do relatório:
  - Headline: [Título gerado pela AI]
  - Subheadline: [Subtítulo]
  - Progress: 1/8
  - Sections: 5
  - Locked chapters: 7

📝 Seções geradas:
  1. 🧠 Por que você volta a pensar nessa pessoa...
  2. 💗 O que o seu jeito de amar revela...
  3. 😔 Por que você sente que deu tudo...
  4. ⚠️ O que o seu corpo está tentando...
  5. ✓ O que vem agora: da compreensão...

💾 Arquivo salvo: test-report-output.json
```

---

## 🌐 Opção 2: Testar via cURL

```bash
curl -X POST http://localhost:3000/api/generate-report \
  -H "Content-Type: application/json" \
  -d '{
    "segment": "abstinencia",
    "answers": {
      "relationship-duration": "long",
      "breakup-initiator": "them",
      "contact-frequency": "high"
    },
    "scores": {
      "devastacao": 85,
      "abstinencia": 92,
      "interiorizacao": 45,
      "ira": 30,
      "superacao": 25
    },
    "mode": "free"
  }' | jq '.'
```

---

## 🎯 Opção 3: Testar via Thunder Client / Insomnia / Postman

### Endpoint:

```
POST http://localhost:3000/api/generate-report
```

### Headers:

```json
{
  "Content-Type": "application/json"
}
```

### Body (JSON):

```json
{
  "segment": "abstinencia",
  "answers": {
    "relationship-duration": "long",
    "breakup-initiator": "them",
    "contact-frequency": "high",
    "emotional-state": "anxious",
    "physical-symptoms": "yes"
  },
  "scores": {
    "devastacao": 85,
    "abstinencia": 92,
    "interiorizacao": 45,
    "ira": 30,
    "superacao": 25
  },
  "mode": "free"
}
```

---

## 🏃 Opção 4: Testar fazendo o quiz completo

1. Acesse: `http://localhost:3000`
2. Clique em "Começar diagnóstico"
3. Responda todas as perguntas
4. O relatório gratuito será gerado automaticamente

**Nota:** Atualmente o componente está usando `mode: "summary"`. Se quiser testar o modo "free" pelo fluxo real, você precisa alterar em `ElegantResultCard.tsx` linha 162:

```typescript
// ANTES:
mode: "summary",

// DEPOIS:
mode: "free",
```

---

## 📊 Estrutura da Resposta

```typescript
{
  "success": true,
  "report": {
    "headline": "Título principal",
    "subheadline": "Contexto",
    "progress": { "revealed": 1, "total": 8 },
    "sections": [
      {
        "id": "pensar_de_novo",
        "icon": "🧠",
        "title": "Por que você volta a pensar...",
        "severity": "high",
        "summary": "Parágrafo explicativo...",
        "insight": "Explicação científica...",
        "bullets": {
          "voce_pode_dizer_que": ["...", "...", "..."],
          "voce_vai_perceber": ["...", "...", "..."],
          "o_que_fazer_agora": ["...", "...", "..."]
        },
        "callouts": [
          {
            "type": "success",
            "title": "O que isso significa",
            "body": "Explicação..."
          }
        ]
      }
      // ... mais 4 seções
    ],
    "nextBlock": {
      "lockwallSummary": "Existem 7 processos...",
      "lockedChapters": [
        {
          "id": "autoestima",
          "title": "Por que o fim abalou...",
          "oneLine": "Como reconstruir..."
        }
        // ... mais 6 capítulos
      ],
      "cta": {
        "label": "Desbloquear relatório completo",
        "hint": "Veja o que ainda te prende"
      }
    },
    "disclaimer": "Este diagnóstico foi gerado..."
  },
  "segment": "abstinencia",
  "mode": "free",
  "generatedAt": "2025-01-21T..."
}
```

---

## 🔍 Debug

### Se a API retornar erro:

1. Verifique se o servidor está rodando
2. Verifique se `OPENAI_API_KEY` está configurada
3. Veja os logs no terminal do `yarn dev`

### Se retornar JSON inválido:

A OpenAI está configurada com `response_format: { type: "json_object" }`, então sempre retornará JSON válido. Se falhar, verifique os logs.

---

## ✅ Checklist de Teste

- [ ] Servidor rodando (`yarn dev`)
- [ ] OPENAI_API_KEY configurada
- [ ] Script de teste executado
- [ ] Resposta recebida em JSON
- [ ] 5 seções presentes
- [ ] 7 capítulos bloqueados
- [ ] Arquivo `test-report-output.json` criado
- [ ] Estrutura conforme `ReportFreePayload`

---

## 💡 Próximos Passos

Após validar que a API funciona corretamente:

1. Atualizar `ElegantResultCard.tsx` para usar `mode: "free"`
2. Criar componente para renderizar o JSON estruturado
3. Mapear cada seção do JSON para os cards visuais
4. Implementar os callouts e bullets
5. Renderizar o lockwall com os capítulos bloqueados
