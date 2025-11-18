# BuildZero Flow

**Plataforma de automação de workflows com observabilidade total**

BuildZero Flow é uma plataforma moderna de automação onde workflows são definidos em código TypeScript, garantindo type safety, versionamento Git e code review, com um dashboard poderoso para observabilidade completa.

## Características Principais

- **Workflows em Código**: Definidos em TypeScript com type safety completo
- **Execução Robusta**: Retry automático por nó via QStash
- **Observabilidade Total**: Dashboard com visualização detalhada de execuções
- **Deploy Automático**: Via Vercel com zero configuração
- **Item Provenance Tracking**: Rastreamento completo da origem de cada dado

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Vercel Postgres (via Prisma)
- **Queue**: Upstash QStash (retry + DLQ)
- **Hosting**: Vercel
- **Domain**: flow.buildzero.ai

## Arquitetura

```
External System (Tally) → Webhook Endpoint → QStash Queue
                              ↓
                         Execution Created (DB)
                              ↓
                         Worker processes Node 1 → Logs to DB → Enqueues Node 2
                              ↓
                         Worker processes Node 2 → Logs to DB → Enqueues Node 3
                              ↓
                         Worker processes Node 3 → Logs to DB → Marks Complete
                              ↓
                         Dashboard shows execution details
```

## Tipos de Nodes

### TriggerNode
Recebe dados de sistemas externos via HTTP POST.

### NormalizeNode
Transforma/mapeia dados de um formato para outro com funções type-safe.

### HttpNode
Faz chamadas HTTP para APIs externas com retry automático.

### CodeNode
Executa código JavaScript/TypeScript customizado com acesso completo ao contexto.

## Getting Started

### Pré-requisitos

- Node.js 18+
- Bun (recomendado) ou npm
- Conta Vercel
- Conta Upstash (QStash)

### Instalação

```bash
# Clone o repositório
git clone <seu-repo>
cd buildzero-flow

# Instale dependências
bun install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Execute migrações do banco
bunx prisma db push

# Inicie o servidor de desenvolvimento
bun dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Criando um Workflow

```typescript
import { Workflow } from '~/lib/workflow-engine/Workflow'
import { TriggerNode, NormalizeNode, HttpNode } from '~/lib/workflow-engine/nodes'

export const meuWorkflow = new Workflow({
  id: 'meu-workflow',
  name: 'Meu Workflow',
  nodes: [
    new TriggerNode({
      id: 'trigger',
      name: 'Webhook Trigger'
    }),
    new NormalizeNode({
      id: 'normalize',
      name: 'Transform Data',
      transform: (input, context) => {
        // Sua lógica de transformação
        return { processedData: input.data }
      }
    }),
    new HttpNode({
      id: 'api-call',
      name: 'Call External API',
      method: 'POST',
      url: 'https://api.example.com/endpoint',
      headers: (context) => ({
        'Authorization': context.secrets.API_KEY
      }),
      body: (input, context) => ({
        data: input.data
      })
    })
  ]
})
```

## Variáveis de Ambiente

```bash
# Database
DATABASE_URL="postgresql://..."

# QStash
QSTASH_TOKEN="..."
QSTASH_CURRENT_SIGNING_KEY="..."
QSTASH_NEXT_SIGNING_KEY="..."

# Vercel
VERCEL_URL="flow.buildzero.ai"

# Suas integrações
CLICKUP_API_KEY="..."
CLICKUP_LIST_ID="..."
```

## Deployment

```bash
# Deploy para produção
git add .
git commit -m "feat: meu novo workflow"
git push

# Vercel faz deploy automaticamente
```

## Estrutura do Projeto

```
buildzero-flow/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/
│   │   │   ├── webhooks/            # Webhook endpoints
│   │   │   └── workers/             # Worker processors
│   │   ├── executions/              # Dashboard pages
│   │   └── page.tsx
│   ├── lib/
│   │   ├── workflow-engine/         # Engine core
│   │   │   ├── Workflow.ts
│   │   │   ├── Node.ts
│   │   │   └── nodes/               # Node types
│   │   ├── db.ts                    # Prisma client
│   │   └── qstash.ts                # QStash client
│   └── workflows/                    # Workflow definitions
│       ├── tally-to-clickup.ts
│       └── registry.ts
├── prisma/
│   └── schema.prisma
├── docs/                             # Documentação
│   ├── system-design.md
│   └── visual-workflow-editor.md
└── plans/                            # Planos de implementação
    ├── plan-01.md
    ├── plan-02.md
    └── plan-03.md
```

## Documentação

- [System Design](./docs/system-design.md) - Arquitetura completa do sistema
- [Visual Workflow Editor](./docs/visual-workflow-editor.md) - Plano para editor visual
- [Plan 01](./plans/plan-01.md) - Infraestrutura core
- [Plan 02](./plans/plan-02.md) - Integração Tally → ClickUp
- [Plan 03](./plans/plan-03.md) - CodeNode + Upload de fotos

## Comandos Úteis

```bash
# Development
bun dev                    # Inicia servidor dev
bun test                   # Roda testes
bunx prisma studio         # Interface visual do banco

# Database
bunx prisma db push        # Atualiza schema
bunx prisma generate       # Gera client

# Deploy
vercel --prod             # Deploy manual
vercel logs               # Ver logs de produção
vercel env pull           # Baixar env vars
```

## Roadmap

### Implementado
- [x] Core workflow infrastructure
- [x] TriggerNode, NormalizeNode, HttpNode, CodeNode
- [x] QStash integration com retry
- [x] Dashboard com observabilidade
- [x] Integração Tally → ClickUp
- [x] Upload automático de fotos de perfil

### Próximos Passos
- [ ] Autenticação no dashboard
- [ ] Webhook signature validation
- [ ] Visual workflow editor
- [ ] Métricas e gráficos
- [ ] Parallel execution (fork/join)
- [ ] Conditional nodes

## Licença

Propriedade de BuildZero

## Suporte

Para questões e suporte, entre em contato com a equipe BuildZero.
