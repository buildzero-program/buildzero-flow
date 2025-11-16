# BuildZero Flow - System Design

**Workflow automation platform with built-in observability**

## Overview

BuildZero Flow é uma plataforma de automação de workflows onde:
- ✅ Workflows são **definidos em código** (TypeScript)
- ✅ Execução **robusta e resiliente** (retry automático por nó)
- ✅ Dashboard para **observabilidade total**
- ✅ Deploy automático via **Vercel**

---

## Architecture

### High-Level Flow

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

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Vercel Postgres (via Prisma)
- **Queue**: Upstash QStash (retry + DLQ)
- **Hosting**: Vercel
- **Domain**: flow.buildzero.ai

---

## Core Concepts

### 1. Workflow

Um workflow é composto por múltiplos **nodes** executados sequencialmente.

```typescript
const workflow = new Workflow({
  id: 'tally-to-clickup',
  name: 'Tally Form → ClickUp Lead',
  nodes: [
    TriggerNode,
    NormalizeNode,
    HttpNode
  ]
})
```

### 2. Execution

Cada vez que um workflow é disparado, uma **execution** é criada:
- Status: `running` | `completed` | `failed`
- Timestamp de início/fim
- Current node index

### 3. Execution Log

Cada nó gera um **log** individual:
- Input/Output (JSONB)
- Status (success/failed/retrying)
- Error message
- Duration (ms)
- Attempt number

---

## Advanced Patterns (Inspired by n8n)

### 1. Item Provenance Tracking

Cada dado que flui pelo workflow mantém referência de sua origem via `itemIndex`.

**Estrutura:**
```typescript
{
  data: { name: "João", email: "joao@test.com" },
  itemIndex: 0  // Este é o item #0 do trigger original
}
```

**Benefício para Observabilidade:**
Quando um nó falha, você sabe EXATAMENTE qual input causou o erro.

**Exemplo no Dashboard:**
```
❌ ClickUp API Error (Item #2)
   Input: { email: "duplicate@test.com", name: "Test" }
   Error: "Contact already exists in ClickUp"

✅ Item #0 → Success
✅ Item #1 → Success
❌ Item #2 → Failed (duplicate email)
```

---

### 2. Node Execution Context

Nodes recebem um **contexto rico** além do input.

```typescript
interface NodeExecutionContext {
  // Metadata da execução
  executionId: string
  workflowId: string
  nodeIndex: number

  // Utilities
  secrets: Record<string, string>    // process.env.*
  logger: (message: string) => void  // Auto-loga no DB

  // Metrics (futuro)
  metrics: {
    startTime: number
    itemsProcessed: number
  }
}

// Nodes usam assim:
async execute(input: Item, context: NodeExecutionContext) {
  context.logger(`Processing ${input.data.email}`)

  const apiKey = context.secrets.CLICKUP_API_KEY

  // ... lógica do nó
}
```

**Benefícios:**
- ✅ Secrets centralizados (não passa por parâmetros)
- ✅ Logging padronizado (vai direto pro DB)
- ✅ Métricas automáticas (sem boilerplate)
- ✅ Testável (mock do context)

---

## Node Types

### 1. Trigger (Webhook Receiver)

Recebe dados de sistemas externos via HTTP POST.

```typescript
new TriggerNode({
  id: 'webhook-trigger',
  name: 'Tally Webhook'
})
```

**Características:**
- Sempre o primeiro nó
- Retorna 200 OK imediatamente
- Cria execution e enfileira Node 1

---

### 2. Normalize (Data Transformation)

Transforma/mapeia dados de um formato para outro.

```typescript
new NormalizeNode({
  id: 'normalize-lead',
  name: 'Normalize Tally Data',
  transform: (input, context) => ({
    name: input.data.fields.find(f => f.key === 'name')?.value,
    email: input.data.fields.find(f => f.key === 'email')?.value,
    phone: input.data.fields.find(f => f.key === 'phone')?.value,
  })
})
```

**Características:**
- Transform function type-safe
- Recebe context (logger, secrets, etc)
- Output automaticamente preserva `itemIndex`
- Validações opcionais

---

### 3. HTTP (API Call)

Faz chamadas HTTP para APIs externas.

```typescript
new HttpNode({
  id: 'create-clickup-task',
  name: 'Create ClickUp Task',
  method: 'POST',
  url: 'https://api.clickup.com/api/v2/list/LIST_ID/task',
  headers: (context) => ({
    'Authorization': context.secrets.CLICKUP_API_KEY,
    'Content-Type': 'application/json'
  }),
  body: (input, context) => {
    context.logger(`Creating task for ${input.data.email}`)
    return {
      name: `Lead: ${input.data.name}`,
      description: `Email: ${input.data.email}`
    }
  }
})
```

**Características:**
- Métodos: GET, POST, PUT, DELETE, PATCH
- Headers dinâmicos (acessa context.secrets)
- Body via função (acessa input.data + context)
- Retry automático via QStash
- Logging integrado

---

### 4. Code (Custom Logic)

Executa código JavaScript/TypeScript customizado.

```typescript
new CodeNode({
  id: 'custom-logic',
  name: 'Calculate Score',
  execute: async (input, context) => {
    context.logger(`Calculating score for ${input.data.email}`)

    // Lógica complexa aqui
    const score = calculateLeadScore(input.data)

    if (score > 80) {
      const slackWebhook = context.secrets.SLACK_WEBHOOK_URL
      await sendSlackAlert(slackWebhook, input.data.email)
    }

    // Return data (itemIndex preserved automatically)
    return { ...input.data, score }
  }
})
```

**Características:**
- Flexibilidade total
- Acesso ao contexto (executionId, secrets, logger)
- Pode fazer qualquer operação
- Async/await suportado
- Output automaticamente preserva `itemIndex`

---

## Database Schema

### executions

```prisma
model Execution {
  id                String   @id @default(cuid())
  workflowId        String
  status            ExecutionStatus
  currentNodeIndex  Int      @default(0)
  startedAt         DateTime @default(now())
  finishedAt        DateTime?
  logs              ExecutionLog[]
}

enum ExecutionStatus {
  RUNNING
  COMPLETED
  FAILED
}
```

### execution_logs

```prisma
model ExecutionLog {
  id           String   @id @default(cuid())
  executionId  String
  execution    Execution @relation(fields: [executionId], references: [id])
  nodeIndex    Int
  nodeId       String
  nodeName     String
  input        Json     // Structure: { data: {...}, itemIndex: 0 }
  output       Json?    // Structure: { data: {...}, itemIndex: 0 }
  error        String?  // Error message if node failed
  status       LogStatus
  attempt      Int      @default(1)
  startedAt    DateTime @default(now())
  finishedAt   DateTime?
  durationMs   Int?
}

enum LogStatus {
  RUNNING
  SUCCESS
  FAILED
  RETRYING
}
```

**Input/Output Structure:**
```typescript
// All inputs/outputs follow this structure
{
  data: Record<string, any>,  // Actual payload
  itemIndex: number           // Traceability (which original item)
}
```

---

## API Routes

### Webhook Receiver

```
POST /api/webhooks/[workflowId]
```

**Flow:**
1. Recebe payload
2. Cria execution no DB (status: RUNNING)
3. Enfileira Node 0 no QStash
4. Retorna 200 OK

---

### Node Worker

```
POST /api/workers/execute-node
Body: { executionId, nodeIndex, input }
```

**Flow:**
1. Busca execution + workflow
2. Cria log (status: RUNNING)
3. Executa o nó
4. Atualiza log com output/error
5. Se sucesso:
   - Tem próximo nó? → Enfileira próximo
   - É último? → Marca execution COMPLETED
6. Se erro:
   - Loga erro
   - QStash retenta automaticamente (3x)
   - Se falhar tudo → execution FAILED

---

## QStash Configuration

### Retry Strategy

```typescript
await qstash.publishJSON({
  url: `${process.env.VERCEL_URL}/api/workers/execute-node`,
  body: { executionId, nodeIndex, input },
  retries: 3,
  // Backoff exponencial:
  // Tentativa 1: imediato
  // Tentativa 2: +5s
  // Tentativa 3: +25s
  // Tentativa 4: +125s
})
```

### Dead Letter Queue

Se todas tentativas falharem:
- QStash move para DLQ
- Execution fica marcada como FAILED
- Dashboard mostra erro

---

## Dashboard

### Pages

```
/                           → Lista de workflows
/executions                 → Lista de execuções (todas)
/executions/[id]            → Detalhes da execução
```

### Execution Detail View

```
┌─────────────────────────────────────────┐
│ Execution #abc123                       │
│ Status: ✅ Completed                    │
│ Duration: 2.3s                          │
│ Started: 15/11/2025 14:32:10           │
└─────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Trigger     │────→│  Normalize   │────→│  HTTP Call   │
│  ✅ 100ms    │     │  ✅ 50ms     │     │  ✅ 2.1s     │
└──────────────┘     └──────────────┘     └──────────────┘

[Expandir cada nó para ver input/output]
```

---

## Security

### MVP (Phase 1)
- ❌ Dashboard público (sem autenticação)
- ❌ Webhooks sem validação
- ⚠️ **Não expor dados sensíveis nos logs**

### Future (Phase 2)
- ✅ Auth simples (password no .env)
- ✅ Webhook signature validation
- ✅ Rate limiting

---

## File Structure

```
buildzero-flow/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── webhooks/
│   │   │   │   └── [workflowId]/route.ts
│   │   │   └── workers/
│   │   │       └── execute-node/route.ts
│   │   ├── page.tsx                    (home)
│   │   ├── executions/
│   │   │   ├── page.tsx                (lista)
│   │   │   └── [id]/page.tsx           (detalhes)
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── workflow-engine/
│   │   │   ├── Workflow.ts
│   │   │   ├── Node.ts                 (base class)
│   │   │   └── nodes/
│   │   │       ├── TriggerNode.ts
│   │   │       ├── NormalizeNode.ts
│   │   │       ├── HttpNode.ts
│   │   │       └── CodeNode.ts
│   │   ├── db.ts                       (Prisma client)
│   │   └── qstash.ts                   (QStash client)
│   └── workflows/
│       ├── tally-to-clickup.ts
│       └── registry.ts
├── prisma/
│   └── schema.prisma
└── docs/
    └── system-design.md
```

---

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# QStash
QSTASH_URL="https://qstash.upstash.io/v2/publish"
QSTASH_TOKEN="..."
QSTASH_CURRENT_SIGNING_KEY="..."
QSTASH_NEXT_SIGNING_KEY="..."

# Vercel
VERCEL_URL="flow.buildzero.ai"

# Integrations
CLICKUP_API_KEY="..."
```

---

## Deployment Flow

```bash
# 1. Desenvolve localmente
cd /home/pedro/dev/sandbox/buildzero-flow
bun dev

# 2. Testa workflow
curl -X POST http://localhost:3000/api/webhooks/tally-to-clickup \
  -H "Content-Type: application/json" \
  -d '{"fields": [...]}'

# 3. Verifica dashboard
open http://localhost:3000/executions

# 4. Deploy
git add .
git commit -m "feat: add new workflow"
git push

# 5. Vercel deploya automaticamente
# URL: https://flow.buildzero.ai

# 6. Configura webhook externo (Tally)
# URL: https://flow.buildzero.ai/api/webhooks/tally-to-clickup
```

---

## Creating New Workflows

```typescript
// 1. Create file: src/workflows/typeform-to-notion.ts
import { Workflow } from '~/lib/workflow-engine/Workflow'
import { TriggerNode, NormalizeNode, HttpNode } from '~/lib/workflow-engine/nodes'

export const typeformToNotion = new Workflow({
  id: 'typeform-to-notion',
  name: 'Typeform → Notion Database',
  nodes: [
    new TriggerNode({
      id: 'trigger',
      name: 'Typeform Webhook'
    }),
    new NormalizeNode({
      id: 'normalize',
      name: 'Map Typeform Fields',
      transform: (input, context) => {
        context.logger(`Normalizing typeform response`)
        return {
          title: input.data.answers[0].text,
          email: input.data.answers[1].email
        }
      }
    }),
    new HttpNode({
      id: 'create-notion-page',
      name: 'Create Notion Page',
      method: 'POST',
      url: 'https://api.notion.com/v1/pages',
      headers: (context) => ({
        'Authorization': context.secrets.NOTION_TOKEN,
        'Notion-Version': '2022-06-28'
      }),
      body: (input, context) => {
        context.logger(`Creating Notion page for ${input.data.email}`)
        return {
          parent: { database_id: 'xxx' },
          properties: {
            Name: { title: [{ text: { content: input.data.title } }] },
            Email: { email: input.data.email }
          }
        }
      }
    })
  ]
})

// 2. Register in src/workflows/registry.ts
import { typeformToNotion } from './typeform-to-notion'

export const workflows = {
  'tally-to-clickup': tallyToClickup,
  'typeform-to-notion': typeformToNotion,  // ← Add here
}

// 3. Deploy → URL available:
// https://flow.buildzero.ai/api/webhooks/typeform-to-notion
```

---

## Monitoring & Observability

### Dashboard Features (MVP)

1. **Executions List**
   - Workflow name
   - Status (icon visual)
   - Duration
   - Timestamp
   - Link para detalhes

2. **Execution Details**
   - Timeline visual dos nodes
   - Input/Output de cada nó (collapsible)
   - Error messages (se houver)
   - Retry attempts
   - Duration por nó

### Metrics (Future)

- Success rate por workflow
- Average duration
- Error rate
- Most failed nodes

---

## Error Handling

### Node Execution Fails

```
1. Worker executa nó → erro
2. Worker loga erro no DB
3. Worker throw error
4. QStash detecta falha
5. QStash aguarda backoff (5s, 25s, 125s)
6. QStash retenta (até 3x)
7. Se todas falharem:
   - Execution marcada como FAILED
   - Log mostra todas tentativas
   - Dashboard exibe erro
```

### Idempotency

- Cada nó deve ser **idempotente** quando possível
- Use IDs únicos (execution ID + node index)
- APIs externas: verificar se recurso já existe

---

## Performance Considerations

### Database

- Index em `executions.workflowId`
- Index em `execution_logs.executionId`
- Pagination na lista de execuções

### Vercel Limits

- ✅ 60s timeout (Pro plan)
- ✅ Cada nó é requisição separada (não estoura timeout)
- ✅ QStash gratuito: 500 msgs/dia (suficiente para MVP)

### Costs (Estimated)

```
Vercel Pro:        $20/mês
Vercel Postgres:   $0 (Hobby) ou $20/mês (Pro)
Upstash QStash:    $0 (até 500/dia)

Total MVP: ~$20-40/mês
```

---

## Roadmap

### MVP (Phase 1) ✅
- [x] 4 node types (Trigger, Normalize, HTTP, Code)
- [x] Database schema
- [x] QStash integration
- [x] API routes
- [x] Dashboard básico
- [x] 1 workflow exemplo (Tally → ClickUp)

### Phase 2 (Future)
- [ ] Authentication (dashboard)
- [ ] Webhook signature validation
- [ ] Retry manual no dashboard
- [ ] Filtros/busca de execuções
- [ ] Métricas e gráficos
- [ ] Webhooks de notificação (ex: Slack on fail)

### Phase 3 (Advanced)
- [ ] Parallel execution (fork/join)
- [ ] Conditional nodes
- [ ] Delay nodes
- [ ] Workflow templates
- [ ] Visual workflow builder (?)

---

## What Changed After n8n Research

### Key Improvements Adopted:

**1. Item Provenance Tracking ✅**
- All data flows with `itemIndex`
- Dashboard can show exactly which input caused errors
- Massive observability improvement

**2. Node Execution Context ✅**
- Nodes receive rich context (secrets, logger, metrics)
- Cleaner API (no hardcoded env vars in node definitions)
- Better testability

**3. Structured Input/Output ✅**
```typescript
// Old: input = any
// New: input = { data: any, itemIndex: number }
```

These patterns are battle-tested (n8n has 400+ integrations) but adapted to our simpler, code-based architecture.

---

## References

- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma ORM](https://www.prisma.io/)
- [Upstash QStash](https://upstash.com/docs/qstash)
- [Vercel Deployment](https://vercel.com/docs)
- [n8n Architecture Research](https://github.com/n8n-io/n8n)
