# Changelog

Todas as alterações notáveis neste projeto serão documentadas aqui.

## [1.0.0] - 2024-01-20

### ✨ Features Iniciais

#### Quiz Multi-Step

- [x] 12 perguntas personalizadas (Likert, múltipla escolha, sim/não)
- [x] Barra de progresso visual
- [x] Navegação voltar/próximo com validação
- [x] Auto-save no localStorage
- [x] Botão "Salvar e continuar depois"
- [x] Responsivo mobile-first

#### Captura de Leads

- [x] Modal de captura (e-mail + WhatsApp + consentimento)
- [x] Validação com Zod + React Hook Form
- [x] Máscara e normalização de WhatsApp
- [x] Envio para webhook (Zapier/Make)
- [x] Fallback em arquivo JSONL local

#### Segmentação Inteligente

- [x] 5 segmentos identificados:
  - Devastação 💔
  - Abstinência 🔄
  - Interiorização 🤔
  - Ira 😤
  - Superação 🌟
- [x] Algoritmo de scoring por peso
- [x] Conteúdo dinâmico por segmento
- [x] 5 bullets de resumo gratuito por fase

#### Página de Resultado

- [x] Exibição do segmento identificado
- [x] Ícone e cor personalizados
- [x] Resumo gratuito com bullets
- [x] 2 CTAs (primário e secundário)
- [x] Redirecionamento para oferta

#### Página de Oferta

- [x] Topbar com resultado do usuário
- [x] Hero da oferta
- [x] Lista de benefícios
- [x] 3 pricing cards:
  - Relatório completo (R$ 47)
  - Kit completo + bônus (R$ 97) ⭐
  - Resumo grátis
- [x] Order bump (acesso antecipado)
- [x] Garantia de 7 dias
- [x] FAQ
- [x] Links de checkout com UTMs preservados

#### Analytics

- [x] Integração GA4 (dataLayer)
- [x] Integração Meta Pixel (fbq)
- [x] 10+ eventos rastreados:
  - quiz_view
  - quiz_cta_click
  - lead_submitted
  - quiz*step*{n}
  - quiz_completed
  - offer_viewed
  - order_bump_view
  - order_bump_click
  - cta_click_checkout

#### Persistência

- [x] localStorage para:
  - Progresso do quiz
  - Lead info
  - UTM parameters
- [x] Recuperação de sessão ao refresh
- [x] Limpeza inteligente de dados

#### UX/UI

- [x] Design mobile-first
- [x] Componentes shadcn/ui
- [x] Tailwind CSS
- [x] Tema light/dark pronto
- [x] Navegação por teclado
- [x] Estados de loading/disabled
- [x] Validações inline
- [x] Mensagens de erro amigáveis

#### Acessibilidade

- [x] Labels semânticos
- [x] Atributos ARIA
- [x] Contraste AA
- [x] Focus visible
- [x] Screen reader friendly

#### API

- [x] POST /api/lead - Captura de leads
- [x] POST /api/events - Log de eventos (opcional)
- [x] Fallback em arquivo local
- [x] CORS configurado

### 📚 Documentação

- [x] README.md completo
- [x] SETUP.md (guia rápido)
- [x] CUSTOMIZATION.md (guia de personalização)
- [x] Comentários inline nos arquivos
- [x] Type definitions completas

### 🏗️ Arquitetura

- [x] Next.js 14 (App Router)
- [x] TypeScript (strict mode)
- [x] Modularização clara (lib/, components/, app/)
- [x] Separação de responsabilidades
- [x] Reutilização de componentes
- [x] Performance otimizada

---

## [Futuras Melhorias]

### 🔮 Backlog

#### v1.1.0

- [ ] Dashboard admin para visualizar leads
- [ ] Exportação de leads em CSV
- [ ] Estatísticas de conversão
- [ ] A/B testing de perguntas
- [ ] Editor visual de perguntas

#### v1.2.0

- [ ] Suporte a múltiplos idiomas (i18n)
- [ ] Tema personalizável
- [ ] White-label (remoção de branding)
- [ ] API para integração externa
- [ ] Webhooks bidirecionais

#### v1.3.0

- [ ] Integração direta com CRMs (HubSpot, Salesforce)
- [ ] Envio automático de e-mails
- [ ] SMS via Twilio
- [ ] WhatsApp via Evolution API
- [ ] Notificações em tempo real

#### Ideias

- [ ] Quiz condicional (perguntas dinâmicas baseadas em respostas)
- [ ] Gamificação (pontos, badges)
- [ ] Compartilhamento social do resultado
- [ ] Comparação com média dos usuários
- [ ] Relatório em PDF gerado automaticamente
- [ ] Chatbot integrado
- [ ] Integração com calendário (agendamento)
- [ ] Modo offline (PWA)

---

## 📊 Métricas (Planejado)

### Conversão

- [ ] Taxa de início do quiz
- [ ] Taxa de conclusão do quiz
- [ ] Taxa de conversão para oferta
- [ ] Valor médio do pedido

### Segmentação

- [ ] Distribuição por segmento
- [ ] Tempo médio no quiz
- [ ] Taxa de abandono por pergunta

### Leads

- [ ] Leads capturados por dia
- [ ] Taxa de entrega do webhook
- [ ] Qualidade dos leads (e-mails válidos)

---

**Versão atual:** 1.0.0  
**Última atualização:** 20/01/2024  
**Status:** ✅ Produção
