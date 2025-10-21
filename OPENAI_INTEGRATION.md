# Integração OpenAI - Relatórios Personalizados

## 📋 Visão Geral

Este projeto agora inclui integração com a API da OpenAI para gerar relatórios personalizados e profundos baseados nas respostas do quiz de pós-término.

## 🔧 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com sua chave da OpenAI:

```bash
OPENAI_API_KEY=sua_chave_da_openai_aqui
```

**Importante:** Nunca commite o arquivo `.env.local` no Git. Ele já está no `.gitignore`.

### 2. Instalação de Dependências

Execute o comando para instalar as novas dependências:

```bash
npm install
# ou
yarn install
```

Novas dependências adicionadas:

- `openai@^4.28.0` - SDK oficial da OpenAI
- `react-markdown@^9.0.1` - Renderização de markdown

## 🚀 Como Funciona

### Fluxo do Usuário

1. **Usuário completa o quiz** - Responde às 12 perguntas
2. **Sistema calcula o segmento** - Identifica a fase (Devastação, Abstinência, etc.)
3. **Redirecionamento para resultado** - Usuário vê o resumo inicial
4. **Geração automática do relatório AI** - Sistema chama a API da OpenAI
5. **Exibição do relatório** - Relatório personalizado é mostrado abaixo do resumo

### Arquitetura

```
📁 app/
  📁 api/
    📁 generate-report/
      📄 route.ts          # API route que chama OpenAI
  📁 quiz/
    📁 resultado/
      📄 page.tsx          # Página que integra o relatório

📁 components/
  📄 AIReport.tsx          # Componente de exibição do relatório
```

## 📄 Estrutura do Relatório

O relatório gerado pela IA contém:

1. **Análise do Momento Atual** - Análise profunda e personalizada do estado emocional
2. **Pontos de Atenção** - 3-4 aspectos específicos que merecem cuidado
3. **Recursos e Forças** - Pontos positivos identificados nas respostas
4. **Plano de Ação Personalizado** - 5-7 ações práticas específicas
5. **Mensagem de Apoio** - Mensagem final encorajadora

## 🎨 Componentes

### AIReport Component

Componente responsável por exibir o relatório com:

- **Loading State** - Spinner animado durante geração
- **Error State** - Mensagem de erro com opção de retry
- **Success State** - Relatório formatado com markdown
- **Actions** - Download e envio por email (futuro)

### API Route: /api/generate-report

**Método:** `POST`

**Body:**

```json
{
  "segment": "devastacao",
  "answers": {
    "tempo_fim": "0-7",
    "checagens": "6+",
    ...
  },
  "scores": {
    "devastacao": 12,
    "abstinencia": 8,
    "interiorizacao": 4,
    "ira": 6,
    "superacao": 2
  }
}
```

**Response:**

```json
{
  "success": true,
  "report": "# Relatório Personalizado\n\n...",
  "segment": "devastacao",
  "generatedAt": "2025-10-20T12:00:00.000Z"
}
```

## 🔒 Segurança

- ✅ API Key armazenada em variável de ambiente (nunca no código)
- ✅ Validação de entrada na API route
- ✅ Error handling robusto
- ✅ Rate limiting (implementar em produção)

## 💡 Personalização

### Ajustar o Prompt

Edite o arquivo `/app/api/generate-report/route.ts` para personalizar o prompt da IA:

```typescript
const systemPrompt = `Você é um psicólogo especializado...`;
```

### Ajustar o Modelo

Por padrão, usa `gpt-4o-mini` (rápido e econômico). Para maior qualidade:

```typescript
model: "gpt-4",  // Mais preciso, mais caro
```

### Ajustar Temperatura

Controla a criatividade da resposta (0.0 - 2.0):

```typescript
temperature: 0.7,  // Padrão: equilibrado
// 0.3 - Mais conservador e focado
// 1.0 - Mais criativo e variado
```

## 📊 Custos

Usando `gpt-4o-mini`:

- **Input:** ~$0.15 por 1M tokens
- **Output:** ~$0.60 por 1M tokens
- **Estimativa por relatório:** ~$0.01 - $0.02

## 🧪 Testando

### Opção 1: Página de Teste (Recomendado) 🚀

Acesse a página de teste dedicada para testar a API rapidamente:

```
http://localhost:3000/test-ai
```

**Funcionalidades:**

- ✅ Selecionar qualquer segmento (Devastação, Abstinência, etc.)
- ✅ Respostas mock pré-configuradas para cada segmento
- ✅ Gerar relatório com um clique
- ✅ Visualizar tempo de resposta da API
- ✅ Ver scores detalhados
- ✅ Debug info para desenvolvimento

### Opção 2: Fluxo Completo

1. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

2. Complete o quiz
3. Aguarde a geração do relatório na página de resultado
4. Verifique o console para logs de debug

## 🐛 Troubleshooting

### "OPENAI_API_KEY não configurada"

- Verifique se criou o arquivo `.env.local`
- Confirme que a variável está correta: `OPENAI_API_KEY=sk-...`
- Reinicie o servidor de desenvolvimento

### "Erro ao gerar relatório"

- Verifique sua chave da API no [OpenAI Dashboard](https://platform.openai.com/api-keys)
- Confirme que tem créditos disponíveis
- Verifique os logs do servidor para mais detalhes

### Relatório não aparece

- Abra o DevTools (F12) e verifique o Console
- Verifique a aba Network para ver a requisição
- Confirme que as respostas do quiz foram salvas corretamente

## 🔮 Melhorias Futuras

- [ ] Cache de relatórios gerados
- [ ] Envio de relatório por email
- [ ] Exportação em PDF
- [ ] Suporte a múltiplos idiomas
- [ ] Análise de sentimento visual (gráficos)
- [ ] Histórico de relatórios para usuários retornantes
- [ ] Integração com banco de dados para persistência

## 📚 Referências

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [React Markdown](https://github.com/remarkjs/react-markdown)
- [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)

---

**Desenvolvido para o Visitável Quiz - Pós-Término**
