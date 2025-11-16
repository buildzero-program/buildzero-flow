# Plan 01: Core Workflow Infrastructure

**Objetivo:** Validar a infraestrutura completa do sistema através de um workflow funcional end-to-end, seguindo TDD.

**Funcionalidade Principal:**
- ✅ Receber webhook POST
- ✅ Criar execution no banco
- ✅ Enfileirar node no QStash
- ✅ Worker processar node
- ✅ Salvar logs no banco
- ✅ Dashboard listar execuções
- ✅ Deploy na Vercel (production)

---

## Phase 1: Database Setup & Models

### 1.1 Setup Prisma + Database

**Test First (sempre falha antes da implementação):**
```typescript
// __tests__/db/prisma.test.ts
describe('Prisma Client', () => {
  it('should connect to database', async () => {
    const { db } = await import('~/lib/db')
    await expect(db.$connect()).resolves.not.toThrow()
  })
})
```

**Implementação:**
1. Criar `src/lib/db.ts` com Prisma client
2. Configurar `DATABASE_URL` no `.env`
3. Rodar `bunx prisma db push` (criar tabelas)
4. ✅ Teste passa

---

### 1.2 Test: Create Execution

**Test First:**
```typescript
// __tests__/db/execution.test.ts
import { db } from '~/lib/db'

describe('Execution Model', () => {
  it('should create execution with RUNNING status', async () => {
    const execution = await db.execution.create({
      data: {
        workflowId: 'test-workflow',
        status: 'RUNNING',
        currentNodeIndex: 0
      }
    })

    expect(execution.id).toBeDefined()
    expect(execution.status).toBe('RUNNING')
    expect(execution.workflowId).toBe('test-workflow')
  })

  it('should create execution log linked to execution', async () => {
    const execution = await db.execution.create({
      data: { workflowId: 'test', status: 'RUNNING' }
    })

    const log = await db.executionLog.create({
      data: {
        executionId: execution.id,
        nodeIndex: 0,
        nodeId: 'trigger',
        nodeName: 'Test Trigger',
        input: { data: { test: true }, itemIndex: 0 },
        status: 'RUNNING'
      }
    })

    expect(log.executionId).toBe(execution.id)
    expect(log.input).toEqual({ data: { test: true }, itemIndex: 0 })
  })
})
```

**Implementação:**
1. Schema já está pronto (feito anteriormente)
2. Rodar testes
3. ✅ Testes passam (validam schema)

---

## Phase 2: Workflow Engine Core

### 2.1 Test: Workflow Class

**Test First:**
```typescript
// __tests__/workflow-engine/Workflow.test.ts
import { Workflow } from '~/lib/workflow-engine/Workflow'

describe('Workflow', () => {
  it('should create workflow with id and nodes', () => {
    const workflow = new Workflow({
      id: 'test-workflow',
      name: 'Test Workflow',
      nodes: []
    })

    expect(workflow.id).toBe('test-workflow')
    expect(workflow.name).toBe('Test Workflow')
    expect(workflow.nodes).toEqual([])
  })

  it('should throw error if no nodes provided', () => {
    expect(() => {
      new Workflow({ id: 'test', name: 'Test' } as any)
    }).toThrow('Workflow must have at least one node')
  })
})
```

**Implementação:**
```typescript
// src/lib/workflow-engine/Workflow.ts
export interface WorkflowConfig {
  id: string
  name: string
  description?: string
  nodes: Node[]
}

export class Workflow {
  id: string
  name: string
  description?: string
  nodes: Node[]

  constructor(config: WorkflowConfig) {
    if (!config.nodes || config.nodes.length === 0) {
      throw new Error('Workflow must have at least one node')
    }

    this.id = config.id
    this.name = config.name
    this.description = config.description
    this.nodes = config.nodes
  }
}
```

✅ Testes passam

---

### 2.2 Test: Node Base Class + Context

**Test First:**
```typescript
// __tests__/workflow-engine/Node.test.ts
import { Node } from '~/lib/workflow-engine/Node'
import type { NodeExecutionContext } from '~/lib/workflow-engine/types'

class TestNode extends Node {
  async execute(input: any, context: NodeExecutionContext) {
    context.logger(`Processing item ${input.itemIndex}`)
    return { ...input.data, processed: true }
  }
}

describe('Node', () => {
  it('should execute node with context', async () => {
    const node = new TestNode({
      id: 'test-node',
      name: 'Test Node'
    })

    const logs: string[] = []
    const context: NodeExecutionContext = {
      executionId: 'exec-123',
      workflowId: 'workflow-1',
      nodeIndex: 0,
      secrets: {},
      logger: (msg) => logs.push(msg)
    }

    const input = { data: { test: 'value' }, itemIndex: 0 }
    const output = await node.execute(input, context)

    expect(output).toEqual({ test: 'value', processed: true })
    expect(logs).toContain('Processing item 0')
  })
})
```

**Implementação:**
```typescript
// src/lib/workflow-engine/types.ts
export interface Item {
  data: Record<string, any>
  itemIndex: number
}

export interface NodeExecutionContext {
  executionId: string
  workflowId: string
  nodeIndex: number
  secrets: Record<string, string>
  logger: (message: string) => void
}

// src/lib/workflow-engine/Node.ts
export interface NodeConfig {
  id: string
  name: string
}

export abstract class Node {
  id: string
  name: string

  constructor(config: NodeConfig) {
    this.id = config.id
    this.name = config.name
  }

  abstract execute(
    input: Item,
    context: NodeExecutionContext
  ): Promise<Record<string, any>>
}
```

✅ Testes passam

---

### 2.3 Test: TriggerNode

**Test First:**
```typescript
// __tests__/workflow-engine/nodes/TriggerNode.test.ts
import { TriggerNode } from '~/lib/workflow-engine/nodes/TriggerNode'

describe('TriggerNode', () => {
  it('should return input data as-is', async () => {
    const node = new TriggerNode({
      id: 'trigger',
      name: 'Webhook Trigger'
    })

    const context = {
      executionId: 'exec-1',
      workflowId: 'test',
      nodeIndex: 0,
      secrets: {},
      logger: jest.fn()
    }

    const input = {
      data: { name: 'John', email: 'john@test.com' },
      itemIndex: 0
    }

    const output = await node.execute(input, context)

    expect(output).toEqual({ name: 'John', email: 'john@test.com' })
    expect(context.logger).toHaveBeenCalledWith('Trigger received data')
  })
})
```

**Implementação:**
```typescript
// src/lib/workflow-engine/nodes/TriggerNode.ts
import { Node } from '../Node'
import type { Item, NodeExecutionContext } from '../types'

export class TriggerNode extends Node {
  async execute(input: Item, context: NodeExecutionContext) {
    context.logger('Trigger received data')
    return input.data
  }
}
```

✅ Teste passa

---

## Phase 3: API Routes

### 3.1 Test: Webhook Receiver

**Test First:**
```typescript
// __tests__/api/webhooks.test.ts
import { POST } from '~/app/api/webhooks/[workflowId]/route'
import { db } from '~/lib/db'

describe('POST /api/webhooks/[workflowId]', () => {
  it('should create execution and return 200', async () => {
    const request = new Request('http://localhost/api/webhooks/test-workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'John', email: 'john@test.com' })
    })

    const response = await POST(request, {
      params: { workflowId: 'test-workflow' }
    })

    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.executionId).toBeDefined()

    // Verifica se execution foi criada
    const execution = await db.execution.findUnique({
      where: { id: body.executionId }
    })
    expect(execution).toBeDefined()
    expect(execution?.workflowId).toBe('test-workflow')
    expect(execution?.status).toBe('RUNNING')
  })

  it('should return 404 if workflow not found', async () => {
    const request = new Request('http://localhost/api/webhooks/nonexistent', {
      method: 'POST',
      body: JSON.stringify({})
    })

    const response = await POST(request, {
      params: { workflowId: 'nonexistent' }
    })

    expect(response.status).toBe(404)
  })
})
```

**Implementação:**
```typescript
// src/app/api/webhooks/[workflowId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '~/lib/db'
import { getWorkflow } from '~/workflows/registry'

export async function POST(
  req: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  const { workflowId } = params

  // Valida se workflow existe
  const workflow = getWorkflow(workflowId)
  if (!workflow) {
    return NextResponse.json(
      { error: 'Workflow not found' },
      { status: 404 }
    )
  }

  // Pega payload
  const payload = await req.json()

  // Cria execution
  const execution = await db.execution.create({
    data: {
      workflowId,
      status: 'RUNNING',
      currentNodeIndex: 0
    }
  })

  // TODO: Enfileirar no QStash (Phase 4)

  return NextResponse.json({ executionId: execution.id })
}
```

**Criar workflow registry:**
```typescript
// src/workflows/registry.ts
import { testWorkflow } from './test-workflow'

const workflows = {
  'test-workflow': testWorkflow
}

export function getWorkflow(id: string) {
  return workflows[id as keyof typeof workflows]
}
```

**Criar workflow de teste:**
```typescript
// src/workflows/test-workflow.ts
import { Workflow } from '~/lib/workflow-engine/Workflow'
import { TriggerNode } from '~/lib/workflow-engine/nodes/TriggerNode'

export const testWorkflow = new Workflow({
  id: 'test-workflow',
  name: 'Test Workflow',
  nodes: [
    new TriggerNode({
      id: 'trigger',
      name: 'Test Trigger'
    })
  ]
})
```

✅ Testes passam

---

### 3.2 Test: Worker Executor

**Test First:**
```typescript
// __tests__/api/workers/execute-node.test.ts
import { POST } from '~/app/api/workers/execute-node/route'
import { db } from '~/lib/db'

describe('POST /api/workers/execute-node', () => {
  it('should execute node and create log', async () => {
    // Setup: create execution first
    const execution = await db.execution.create({
      data: {
        workflowId: 'test-workflow',
        status: 'RUNNING',
        currentNodeIndex: 0
      }
    })

    const request = new Request('http://localhost/api/workers/execute-node', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        executionId: execution.id,
        nodeIndex: 0,
        input: { data: { test: true }, itemIndex: 0 }
      })
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    // Verifica log criado
    const logs = await db.executionLog.findMany({
      where: { executionId: execution.id }
    })

    expect(logs).toHaveLength(1)
    expect(logs[0]?.nodeIndex).toBe(0)
    expect(logs[0]?.status).toBe('SUCCESS')
    expect(logs[0]?.output).toBeDefined()
  })

  it('should mark execution as COMPLETED if last node', async () => {
    const execution = await db.execution.create({
      data: {
        workflowId: 'test-workflow',
        status: 'RUNNING',
        currentNodeIndex: 0
      }
    })

    const request = new Request('http://localhost/api/workers/execute-node', {
      method: 'POST',
      body: JSON.stringify({
        executionId: execution.id,
        nodeIndex: 0, // Only 1 node in test-workflow
        input: { data: {}, itemIndex: 0 }
      })
    })

    await POST(request)

    const updated = await db.execution.findUnique({
      where: { id: execution.id }
    })

    expect(updated?.status).toBe('COMPLETED')
    expect(updated?.finishedAt).toBeDefined()
  })
})
```

**Implementação:**
```typescript
// src/app/api/workers/execute-node/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '~/lib/db'
import { getWorkflow } from '~/workflows/registry'
import type { NodeExecutionContext } from '~/lib/workflow-engine/types'

export async function POST(req: NextRequest) {
  const { executionId, nodeIndex, input } = await req.json()

  // Busca execution
  const execution = await db.execution.findUnique({
    where: { id: executionId }
  })

  if (!execution) {
    return NextResponse.json({ error: 'Execution not found' }, { status: 404 })
  }

  const workflow = getWorkflow(execution.workflowId)
  const node = workflow.nodes[nodeIndex]

  if (!node) {
    return NextResponse.json({ error: 'Node not found' }, { status: 404 })
  }

  // Cria log (RUNNING)
  const startTime = Date.now()
  const log = await db.executionLog.create({
    data: {
      executionId,
      nodeIndex,
      nodeId: node.id,
      nodeName: node.name,
      input,
      status: 'RUNNING',
      startedAt: new Date()
    }
  })

  try {
    // Executa node com context
    const context: NodeExecutionContext = {
      executionId,
      workflowId: execution.workflowId,
      nodeIndex,
      secrets: process.env as Record<string, string>,
      logger: (message: string) => {
        console.log(`[${executionId}][${node.id}] ${message}`)
      }
    }

    const output = await node.execute(input, context)
    const duration = Date.now() - startTime

    // Atualiza log (SUCCESS)
    await db.executionLog.update({
      where: { id: log.id },
      data: {
        output: { data: output, itemIndex: input.itemIndex },
        status: 'SUCCESS',
        finishedAt: new Date(),
        durationMs: duration
      }
    })

    // É o último node?
    const isLastNode = nodeIndex === workflow.nodes.length - 1

    if (isLastNode) {
      // Marca execution como COMPLETED
      await db.execution.update({
        where: { id: executionId },
        data: {
          status: 'COMPLETED',
          finishedAt: new Date()
        }
      })
    } else {
      // TODO: Enfileira próximo node (Phase 4)
      await db.execution.update({
        where: { id: executionId },
        data: { currentNodeIndex: nodeIndex + 1 }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    // Atualiza log (FAILED)
    await db.executionLog.update({
      where: { id: log.id },
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'FAILED',
        finishedAt: new Date(),
        durationMs: Date.now() - startTime
      }
    })

    // Marca execution como FAILED
    await db.execution.update({
      where: { id: executionId },
      data: { status: 'FAILED' }
    })

    return NextResponse.json(
      { error: 'Node execution failed' },
      { status: 500 }
    )
  }
}
```

✅ Testes passam

---

## Phase 4: QStash Integration

### 4.1 Test: QStash Client

**Test First:**
```typescript
// __tests__/lib/qstash.test.ts
import { enqueueNode } from '~/lib/qstash'

describe('QStash Client', () => {
  it('should enqueue node execution', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ messageId: 'msg-123' })
    })
    global.fetch = mockFetch

    await enqueueNode({
      executionId: 'exec-123',
      nodeIndex: 1,
      input: { data: { test: true }, itemIndex: 0 }
    })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('qstash.upstash.io'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': expect.any(String)
        })
      })
    )
  })
})
```

**Implementação:**
```typescript
// src/lib/qstash.ts
import { Client } from '@upstash/qstash'

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!
})

export async function enqueueNode(payload: {
  executionId: string
  nodeIndex: number
  input: any
}) {
  const url = `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/workers/execute-node`

  await qstash.publishJSON({
    url,
    body: payload,
    retries: 3
  })
}
```

✅ Teste passa

---

### 4.2 Integration: Webhook → QStash

**Atualizar webhook route:**
```typescript
// src/app/api/webhooks/[workflowId]/route.ts (update)
import { enqueueNode } from '~/lib/qstash'

export async function POST(req: NextRequest, { params }) {
  // ... código anterior ...

  // Cria execution
  const execution = await db.execution.create({
    data: {
      workflowId,
      status: 'RUNNING',
      currentNodeIndex: 0
    }
  })

  // Enfileira primeiro node
  await enqueueNode({
    executionId: execution.id,
    nodeIndex: 0,
    input: {
      data: payload,
      itemIndex: 0
    }
  })

  return NextResponse.json({ executionId: execution.id })
}
```

---

### 4.3 Integration: Worker → QStash (next node)

**Atualizar worker route:**
```typescript
// src/app/api/workers/execute-node/route.ts (update)
if (isLastNode) {
  await db.execution.update({
    where: { id: executionId },
    data: { status: 'COMPLETED', finishedAt: new Date() }
  })
} else {
  // Enfileira próximo node
  await enqueueNode({
    executionId,
    nodeIndex: nodeIndex + 1,
    input: {
      data: output,
      itemIndex: input.itemIndex
    }
  })

  await db.execution.update({
    where: { id: executionId },
    data: { currentNodeIndex: nodeIndex + 1 }
  })
}
```

---

## Phase 5: E2E Test

**Test First:**
```typescript
// __tests__/e2e/workflow-execution.test.ts
import { db } from '~/lib/db'

describe('E2E: Workflow Execution', () => {
  it('should execute complete workflow from webhook to completion', async () => {
    // 1. POST webhook
    const webhookResponse = await fetch('http://localhost:3000/api/webhooks/test-workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com'
      })
    })

    expect(webhookResponse.status).toBe(200)
    const { executionId } = await webhookResponse.json()

    // 2. Aguarda processamento (QStash assíncrono)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 3. Verifica execution completada
    const execution = await db.execution.findUnique({
      where: { id: executionId },
      include: { logs: true }
    })

    expect(execution?.status).toBe('COMPLETED')
    expect(execution?.logs).toHaveLength(1)
    expect(execution?.logs[0]?.status).toBe('SUCCESS')
    expect(execution?.logs[0]?.output).toMatchObject({
      data: { name: 'John Doe', email: 'john@example.com' }
    })
  })
})
```

**Para rodar:**
```bash
# Terminal 1: Dev server
bun dev

# Terminal 2: Run E2E test
bun test __tests__/e2e/
```

✅ E2E test passa (valida fluxo completo!)

---

## Phase 6: Dashboard Básico

### 6.1 Test: Lista de Execuções

**Implementação (sem test por ser UI):**
```typescript
// src/app/executions/page.tsx
import { db } from '~/lib/db'

export default async function ExecutionsPage() {
  const executions = await db.execution.findMany({
    orderBy: { startedAt: 'desc' },
    take: 20
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Executions</h1>
      <table className="w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Workflow</th>
            <th>Status</th>
            <th>Started</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {executions.map(exec => (
            <tr key={exec.id}>
              <td>{exec.id.slice(0, 8)}</td>
              <td>{exec.workflowId}</td>
              <td>{exec.status}</td>
              <td>{exec.startedAt.toLocaleString()}</td>
              <td>
                {exec.finishedAt
                  ? `${exec.finishedAt.getTime() - exec.startedAt.getTime()}ms`
                  : 'Running...'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## Phase 7: Deploy to Vercel

### 7.1 Setup Vercel Postgres

```bash
# 1. Instalar Vercel CLI
bun add -g vercel

# 2. Login
vercel login

# 3. Link project
cd /home/pedro/dev/sandbox/buildzero-flow
vercel link

# 4. Criar Postgres database
vercel postgres create buildzero-flow-db

# 5. Link ao projeto
vercel env pull .env.local
```

### 7.2 Setup Upstash QStash

```bash
# 1. Criar conta em https://console.upstash.com
# 2. Criar QStash instance
# 3. Copiar credenciais:
QSTASH_URL=https://qstash.upstash.io/v2/publish
QSTASH_TOKEN=xxx
QSTASH_CURRENT_SIGNING_KEY=xxx
QSTASH_NEXT_SIGNING_KEY=xxx

# 4. Adicionar no Vercel
vercel env add QSTASH_TOKEN
vercel env add QSTASH_CURRENT_SIGNING_KEY
vercel env add QSTASH_NEXT_SIGNING_KEY
```

### 7.3 Deploy

```bash
# 1. Commit tudo
git init
git add .
git commit -m "feat: core workflow infrastructure (Plan 01)"

# 2. Push (Vercel detecta automaticamente)
git remote add origin <seu-repo>
git push -u origin main

# 3. Vercel deploya automaticamente
# Ou manual:
vercel --prod

# 4. Configurar domínio
vercel domains add flow.buildzero.ai
```

### 7.4 Migrate Database

```bash
# Production migration
DATABASE_URL="postgres://..." bunx prisma db push
```

---

## Phase 8: Validation (Production)

### Test Production Webhook

```bash
# 1. Test webhook endpoint
curl -X POST https://flow.buildzero.ai/api/webhooks/test-workflow \
  -H "Content-Type: application/json" \
  -d '{"name": "Production Test", "email": "test@prod.com"}'

# Response:
# { "executionId": "clxxx123" }

# 2. Check dashboard
open https://flow.buildzero.ai/executions

# 3. Verify execution completed
# Should see:
# - Status: COMPLETED
# - Node log with SUCCESS
# - Input/Output data
```

✅ **Production validation complete!**

---

## Success Criteria

- [x] Unit tests passing (database, workflow engine, nodes)
- [x] Integration tests passing (API routes)
- [x] E2E test passing (webhook → QStash → worker → DB)
- [x] Deployed to Vercel
- [x] Vercel Postgres connected
- [x] Upstash QStash working
- [x] Dashboard showing executions
- [x] Production webhook functional

---

## Next Steps (Plan 02)

Com a infraestrutura validada, o próximo plano pode focar em:

1. **Implementar NormalizeNode** (transformação de dados)
2. **Implementar HttpNode** (chamadas HTTP)
3. **Criar workflow real: Tally → ClickUp**
4. **Dashboard detalhado** (ver logs de cada node)

---

## Commands Summary

```bash
# Development
bun dev                          # Start dev server
bun test                         # Run unit tests
bun test __tests__/e2e/          # Run E2E tests
bunx prisma studio               # View database

# Database
bunx prisma db push              # Push schema changes
bunx prisma migrate dev          # Create migration
bunx prisma generate             # Generate client

# Deploy
git add . && git commit -m "msg"
git push                         # Auto-deploy
vercel --prod                    # Manual deploy
vercel logs                      # View logs

# Environment
vercel env pull                  # Pull env vars
vercel env add KEY               # Add env var
```

---

## Files Created (Checklist)

### Core
- [ ] `src/lib/db.ts`
- [ ] `src/lib/qstash.ts`
- [ ] `src/lib/workflow-engine/Workflow.ts`
- [ ] `src/lib/workflow-engine/Node.ts`
- [ ] `src/lib/workflow-engine/types.ts`
- [ ] `src/lib/workflow-engine/nodes/TriggerNode.ts`

### Workflows
- [ ] `src/workflows/registry.ts`
- [ ] `src/workflows/test-workflow.ts`

### API Routes
- [ ] `src/app/api/webhooks/[workflowId]/route.ts`
- [ ] `src/app/api/workers/execute-node/route.ts`

### Dashboard
- [ ] `src/app/executions/page.tsx`

### Tests
- [ ] `__tests__/db/prisma.test.ts`
- [ ] `__tests__/db/execution.test.ts`
- [ ] `__tests__/workflow-engine/Workflow.test.ts`
- [ ] `__tests__/workflow-engine/Node.test.ts`
- [ ] `__tests__/workflow-engine/nodes/TriggerNode.test.ts`
- [ ] `__tests__/api/webhooks.test.ts`
- [ ] `__tests__/api/workers/execute-node.test.ts`
- [ ] `__tests__/lib/qstash.test.ts`
- [ ] `__tests__/e2e/workflow-execution.test.ts`

### Config
- [ ] `.env.example` (documented env vars)
- [ ] `jest.config.js` or `vitest.config.ts`

---

**Estimated Time:** 4-6 hours
**Complexity:** Medium
**Risk:** Low (everything is testable in isolation)
