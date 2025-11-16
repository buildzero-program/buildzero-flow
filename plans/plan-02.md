# Plan 02: Tally → ClickUp Integration

**Objetivo:** Implementar workflow completo de integração Tally (formulário) → ClickUp (criar task), adicionando os nodes NormalizeNode e HttpNode seguindo TDD.

**Funcionalidade Principal:**
- ✅ Receber webhook do Tally com dados do formulário
- ✅ Normalizar dados (Tally format → ClickUp format)
- ✅ Criar task no ClickUp via API
- ✅ Dashboard mostrar execução completa com logs detalhados
- ✅ Tratamento de erros e retry automático

**Dependências:** Plan 01 completo (infraestrutura funcionando)

---

## Tally Webhook Format (Research)

O Tally envia dados neste formato quando um formulário é submetido:

```json
{
  "eventId": "evt_xxx",
  "eventType": "FORM_RESPONSE",
  "createdAt": "2025-11-16T01:00:00.000Z",
  "data": {
    "responseId": "resp_xxx",
    "submissionId": "subm_xxx",
    "respondentId": "user_xxx",
    "formId": "form_xxx",
    "formName": "Lead Capture Form",
    "createdAt": "2025-11-16T01:00:00.000Z",
    "fields": [
      {
        "key": "question_xxx1",
        "label": "Nome completo",
        "type": "INPUT_TEXT",
        "value": "João Silva"
      },
      {
        "key": "question_xxx2",
        "label": "Email",
        "type": "INPUT_EMAIL",
        "value": "joao@example.com"
      },
      {
        "key": "question_xxx3",
        "label": "Telefone",
        "type": "INPUT_PHONE",
        "value": "+5511999999999"
      },
      {
        "key": "question_xxx4",
        "label": "Empresa",
        "type": "INPUT_TEXT",
        "value": "ACME Inc"
      }
    ]
  }
}
```

---

## ClickUp API Format (Research)

Para criar uma task no ClickUp:

**Endpoint:**
```
POST https://api.clickup.com/api/v2/list/{list_id}/task
```

**Headers:**
```json
{
  "Authorization": "pk_xxx",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "name": "Lead: João Silva",
  "description": "Novo lead capturado via Tally\n\nEmail: joao@example.com\nTelefone: +5511999999999\nEmpresa: ACME Inc",
  "status": "to do",
  "priority": 3,
  "custom_fields": [
    {
      "id": "field_email_id",
      "value": "joao@example.com"
    },
    {
      "id": "field_phone_id",
      "value": "+5511999999999"
    }
  ]
}
```

**Response:**
```json
{
  "id": "task_xxx",
  "name": "Lead: João Silva",
  "status": {
    "status": "to do"
  },
  "url": "https://app.clickup.com/t/task_xxx"
}
```

---

## Phase 1: Implement NormalizeNode

### 1.1 Test: NormalizeNode Basic Transformation

**Test First:**
```typescript
// __tests__/workflow-engine/nodes/NormalizeNode.test.ts
import { NormalizeNode } from '~/lib/workflow-engine/nodes/NormalizeNode'
import type { NodeExecutionContext } from '~/lib/workflow-engine/types'

describe('NormalizeNode', () => {
  it('should transform input data using transform function', async () => {
    const node = new NormalizeNode({
      id: 'normalize',
      name: 'Transform Data',
      transform: (input, context) => {
        context.logger('Transforming data')
        return {
          fullName: input.data.firstName + ' ' + input.data.lastName,
          email: input.data.email
        }
      }
    })

    const logs: string[] = []
    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'test',
      nodeIndex: 1,
      secrets: {},
      logger: (msg) => logs.push(msg)
    }

    const input = {
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      },
      itemIndex: 0
    }

    const output = await node.execute(input, context)

    expect(output).toEqual({
      fullName: 'John Doe',
      email: 'john@example.com'
    })
    expect(logs).toContain('Transforming data')
  })

  it('should throw error if transform function throws', async () => {
    const node = new NormalizeNode({
      id: 'normalize',
      name: 'Faulty Transform',
      transform: () => {
        throw new Error('Transform failed')
      }
    })

    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'test',
      nodeIndex: 1,
      secrets: {},
      logger: () => {}
    }

    const input = { data: { test: 'value' }, itemIndex: 0 }

    await expect(node.execute(input, context)).rejects.toThrow('Transform failed')
  })
})
```

**Implementação:**
```typescript
// src/lib/workflow-engine/nodes/NormalizeNode.ts
import { Node, type NodeConfig } from '../Node'
import type { Item, NodeExecutionContext } from '../types'

export interface NormalizeNodeConfig extends NodeConfig {
  transform: (input: Item, context: NodeExecutionContext) => Record<string, any>
}

export class NormalizeNode extends Node {
  private transform: (input: Item, context: NodeExecutionContext) => Record<string, any>

  constructor(config: NormalizeNodeConfig) {
    super(config)
    this.transform = config.transform
  }

  async execute(input: Item, context: NodeExecutionContext): Promise<Record<string, any>> {
    return this.transform(input, context)
  }
}
```

✅ Testes passam

---

### 1.2 Test: Tally to ClickUp Normalization

**Test First:**
```typescript
// __tests__/workflow-engine/nodes/NormalizeNode.test.ts (add to existing file)
describe('NormalizeNode - Tally Integration', () => {
  it('should normalize Tally webhook to ClickUp format', async () => {
    const node = new NormalizeNode({
      id: 'normalize-tally',
      name: 'Tally to ClickUp',
      transform: (input, context) => {
        context.logger('Normalizing Tally data')

        const fields = input.data.data.fields
        const findField = (label: string) =>
          fields.find((f: any) => f.label === label)?.value || ''

        const name = findField('Nome completo')
        const email = findField('Email')
        const phone = findField('Telefone')
        const company = findField('Empresa')

        return {
          name,
          email,
          phone,
          company
        }
      }
    })

    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'tally-to-clickup',
      nodeIndex: 1,
      secrets: {},
      logger: vi.fn()
    }

    const tallyWebhook = {
      data: {
        eventId: 'evt_123',
        data: {
          formName: 'Lead Capture',
          fields: [
            { label: 'Nome completo', value: 'João Silva' },
            { label: 'Email', value: 'joao@example.com' },
            { label: 'Telefone', value: '+5511999999999' },
            { label: 'Empresa', value: 'ACME Inc' }
          ]
        }
      },
      itemIndex: 0
    }

    const output = await node.execute(tallyWebhook, context)

    expect(output).toEqual({
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '+5511999999999',
      company: 'ACME Inc'
    })
  })
})
```

✅ Teste passa (validando lógica de transformação)

---

## Phase 2: Implement HttpNode

### 2.1 Test: HttpNode Basic POST Request

**Test First:**
```typescript
// __tests__/workflow-engine/nodes/HttpNode.test.ts
import { HttpNode } from '~/lib/workflow-engine/nodes/HttpNode'
import type { NodeExecutionContext } from '~/lib/workflow-engine/types'

describe('HttpNode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should make POST request with dynamic body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'created-123', success: true })
    })
    global.fetch = mockFetch

    const node = new HttpNode({
      id: 'http-post',
      name: 'Create Resource',
      method: 'POST',
      url: 'https://api.example.com/resources',
      headers: (context) => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${context.secrets.API_TOKEN}`
      }),
      body: (input, context) => {
        context.logger(`Creating resource for ${input.data.email}`)
        return {
          name: input.data.name,
          email: input.data.email
        }
      }
    })

    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'test',
      nodeIndex: 2,
      secrets: { API_TOKEN: 'secret-token-123' },
      logger: vi.fn()
    }

    const input = {
      data: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      itemIndex: 0
    }

    const output = await node.execute(input, context)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/resources',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer secret-token-123'
        },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com'
        })
      }
    )

    expect(output).toEqual({ id: 'created-123', success: true })
    expect(context.logger).toHaveBeenCalledWith('Creating resource for john@example.com')
  })

  it('should throw error if HTTP request fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () => 'Invalid data'
    })
    global.fetch = mockFetch

    const node = new HttpNode({
      id: 'http-fail',
      name: 'Failing Request',
      method: 'POST',
      url: 'https://api.example.com/fail',
      body: () => ({ test: true })
    })

    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'test',
      nodeIndex: 2,
      secrets: {},
      logger: () => {}
    }

    const input = { data: {}, itemIndex: 0 }

    await expect(node.execute(input, context)).rejects.toThrow(
      'HTTP request failed: 400 Bad Request'
    )
  })
})
```

**Implementação:**
```typescript
// src/lib/workflow-engine/nodes/HttpNode.ts
import { Node, type NodeConfig } from '../Node'
import type { Item, NodeExecutionContext } from '../types'

export interface HttpNodeConfig extends NodeConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  headers?: (context: NodeExecutionContext) => Record<string, string>
  body?: (input: Item, context: NodeExecutionContext) => any
}

export class HttpNode extends Node {
  private method: string
  private url: string
  private headersFn?: (context: NodeExecutionContext) => Record<string, string>
  private bodyFn?: (input: Item, context: NodeExecutionContext) => any

  constructor(config: HttpNodeConfig) {
    super(config)
    this.method = config.method
    this.url = config.url
    this.headersFn = config.headers
    this.bodyFn = config.body
  }

  async execute(input: Item, context: NodeExecutionContext): Promise<Record<string, any>> {
    const headers = this.headersFn ? this.headersFn(context) : {}
    const body = this.bodyFn ? this.bodyFn(input, context) : undefined

    context.logger(`Making ${this.method} request to ${this.url}`)

    const response = await fetch(this.url, {
      method: this.method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `HTTP request failed: ${response.status} ${response.statusText} - ${errorText}`
      )
    }

    const data = await response.json()
    context.logger(`Request successful, received response`)

    return data
  }
}
```

✅ Testes passam

---

### 2.2 Test: ClickUp API Integration

**Test First:**
```typescript
// __tests__/workflow-engine/nodes/HttpNode.test.ts (add to existing)
describe('HttpNode - ClickUp Integration', () => {
  it('should create ClickUp task with correct format', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'task_abc123',
        name: 'Lead: João Silva',
        url: 'https://app.clickup.com/t/task_abc123'
      })
    })
    global.fetch = mockFetch

    const node = new HttpNode({
      id: 'create-clickup-task',
      name: 'Create ClickUp Task',
      method: 'POST',
      url: 'https://api.clickup.com/api/v2/list/LIST_ID/task',
      headers: (context) => ({
        'Authorization': context.secrets.CLICKUP_API_KEY,
        'Content-Type': 'application/json'
      }),
      body: (input, context) => {
        context.logger(`Creating task for lead: ${input.data.name}`)
        return {
          name: `Lead: ${input.data.name}`,
          description: `Novo lead capturado via Tally\n\nEmail: ${input.data.email}\nTelefone: ${input.data.phone}\nEmpresa: ${input.data.company}`,
          status: 'to do',
          priority: 3
        }
      }
    })

    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'tally-to-clickup',
      nodeIndex: 2,
      secrets: { CLICKUP_API_KEY: 'pk_test_123' },
      logger: vi.fn()
    }

    const input = {
      data: {
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '+5511999999999',
        company: 'ACME Inc'
      },
      itemIndex: 0
    }

    const output = await node.execute(input, context)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.clickup.com/api/v2/list/LIST_ID/task',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Authorization': 'pk_test_123',
          'Content-Type': 'application/json'
        }
      })
    )

    const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(requestBody).toMatchObject({
      name: 'Lead: João Silva',
      description: expect.stringContaining('joao@example.com'),
      status: 'to do',
      priority: 3
    })

    expect(output).toEqual({
      id: 'task_abc123',
      name: 'Lead: João Silva',
      url: 'https://app.clickup.com/t/task_abc123'
    })
  })
})
```

✅ Teste passa (validando integração ClickUp)

---

## Phase 3: Create Tally → ClickUp Workflow

### 3.1 Test: Complete Workflow Definition

**Test First:**
```typescript
// __tests__/workflows/tally-to-clickup.test.ts
import { tallyToClickup } from '~/workflows/tally-to-clickup'

describe('Tally to ClickUp Workflow', () => {
  it('should have 3 nodes in correct order', () => {
    expect(tallyToClickup.id).toBe('tally-to-clickup')
    expect(tallyToClickup.nodes).toHaveLength(3)
    expect(tallyToClickup.nodes[0]?.name).toBe('Tally Webhook')
    expect(tallyToClickup.nodes[1]?.name).toBe('Normalize Data')
    expect(tallyToClickup.nodes[2]?.name).toBe('Create ClickUp Task')
  })

  it('should execute complete workflow with mock data', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'task_123', url: 'https://clickup.com/task_123' })
    })
    global.fetch = mockFetch

    const context = {
      executionId: 'exec-test',
      workflowId: 'tally-to-clickup',
      nodeIndex: 0,
      secrets: { CLICKUP_API_KEY: 'pk_test' },
      logger: vi.fn()
    }

    // Node 0: Trigger
    const triggerOutput = await tallyToClickup.nodes[0]!.execute(
      {
        data: {
          eventId: 'evt_123',
          data: {
            fields: [
              { label: 'Nome completo', value: 'Test User' },
              { label: 'Email', value: 'test@example.com' },
              { label: 'Telefone', value: '+5511999999999' },
              { label: 'Empresa', value: 'Test Co' }
            ]
          }
        },
        itemIndex: 0
      },
      context
    )

    // Node 1: Normalize
    const normalizeOutput = await tallyToClickup.nodes[1]!.execute(
      { data: triggerOutput, itemIndex: 0 },
      { ...context, nodeIndex: 1 }
    )

    expect(normalizeOutput).toMatchObject({
      name: 'Test User',
      email: 'test@example.com',
      phone: '+5511999999999',
      company: 'Test Co'
    })

    // Node 2: HTTP (ClickUp)
    const clickupOutput = await tallyToClickup.nodes[2]!.execute(
      { data: normalizeOutput, itemIndex: 0 },
      { ...context, nodeIndex: 2 }
    )

    expect(clickupOutput).toMatchObject({
      id: 'task_123',
      url: 'https://clickup.com/task_123'
    })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('clickup.com'),
      expect.objectContaining({
        method: 'POST'
      })
    )
  })
})
```

**Implementação:**
```typescript
// src/workflows/tally-to-clickup.ts
import { Workflow } from '~/lib/workflow-engine/Workflow'
import { TriggerNode } from '~/lib/workflow-engine/nodes/TriggerNode'
import { NormalizeNode } from '~/lib/workflow-engine/nodes/NormalizeNode'
import { HttpNode } from '~/lib/workflow-engine/nodes/HttpNode'

export const tallyToClickup = new Workflow({
  id: 'tally-to-clickup',
  name: 'Tally Form → ClickUp Lead',
  description: 'Captura leads do Tally e cria tasks no ClickUp automaticamente',
  nodes: [
    // Node 0: Receive Tally webhook
    new TriggerNode({
      id: 'trigger',
      name: 'Tally Webhook'
    }),

    // Node 1: Transform Tally data → ClickUp format
    new NormalizeNode({
      id: 'normalize',
      name: 'Normalize Data',
      transform: (input, context) => {
        context.logger('Normalizing Tally webhook data')

        const fields = input.data.data?.fields || []
        const findField = (label: string) =>
          fields.find((f: any) => f.label === label)?.value || ''

        const name = findField('Nome completo')
        const email = findField('Email')
        const phone = findField('Telefone')
        const company = findField('Empresa')

        context.logger(`Extracted: ${name} (${email})`)

        return { name, email, phone, company }
      }
    }),

    // Node 2: Create ClickUp task
    new HttpNode({
      id: 'create-task',
      name: 'Create ClickUp Task',
      method: 'POST',
      url: `https://api.clickup.com/api/v2/list/${process.env.CLICKUP_LIST_ID}/task`,
      headers: (context) => ({
        'Authorization': context.secrets.CLICKUP_API_KEY || '',
        'Content-Type': 'application/json'
      }),
      body: (input, context) => {
        const { name, email, phone, company } = input.data
        context.logger(`Creating ClickUp task for: ${name}`)

        return {
          name: `Lead: ${name}`,
          description: `Novo lead capturado via Tally

**Informações de Contato:**
- Email: ${email}
- Telefone: ${phone}
- Empresa: ${company}

_Criado automaticamente via BuildZero Flow_`,
          status: 'to do',
          priority: 3,
          tags: ['lead', 'tally']
        }
      }
    })
  ]
})
```

**Atualizar registry:**
```typescript
// src/workflows/registry.ts
import { testWorkflow } from './test-workflow'
import { tallyToClickup } from './tally-to-clickup'

const workflows = {
  'test-workflow': testWorkflow,
  'tally-to-clickup': tallyToClickup
}

export function getWorkflow(id: string) {
  return workflows[id as keyof typeof workflows]
}
```

✅ Testes passam

---

## Phase 4: Enhanced Dashboard

### 4.1 Update Execution Detail Page

**Implementação:**
```typescript
// src/app/executions/[id]/page.tsx (enhanced version)
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "~/lib/db";

export const dynamic = 'force-dynamic';

export default async function ExecutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const execution = await db.execution.findUnique({
    where: { id },
    include: {
      logs: {
        orderBy: { startedAt: 'asc' }
      }
    }
  });

  if (!execution) {
    notFound();
  }

  const duration = execution.finishedAt
    ? new Date(execution.finishedAt).getTime() - new Date(execution.startedAt).getTime()
    : null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to executions
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Execution Details</h1>
          <p className="text-slate-400">{execution.id}</p>
        </div>

        {/* Execution Summary */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-slate-400">Workflow</div>
              <div className="text-white font-medium mt-1">{execution.workflowId}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Status</div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                execution.status === 'COMPLETED'
                  ? 'bg-green-500/20 text-green-400'
                  : execution.status === 'FAILED'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {execution.status}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Started</div>
              <div className="text-white font-medium mt-1">
                {new Date(execution.startedAt).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Duration</div>
              <div className="text-white font-medium mt-1">
                {duration !== null ? `${duration}ms` : 'In progress...'}
              </div>
            </div>
          </div>
        </div>

        {/* Node Pipeline Visual */}
        {execution.logs.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Pipeline</h2>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {execution.logs.map((log, index) => (
                <div key={log.id} className="flex items-center">
                  <div className={`px-4 py-2 rounded-lg border-2 min-w-32 text-center ${
                    log.status === 'SUCCESS'
                      ? 'border-green-500 bg-green-500/10'
                      : log.status === 'FAILED'
                      ? 'border-red-500 bg-red-500/10'
                      : log.status === 'RETRYING'
                      ? 'border-yellow-500 bg-yellow-500/10'
                      : 'border-blue-500 bg-blue-500/10'
                  }`}>
                    <div className="text-white font-medium text-sm">{log.nodeName}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {log.durationMs !== null ? `${log.durationMs}ms` : 'Running...'}
                    </div>
                  </div>
                  {index < execution.logs.length - 1 && (
                    <div className="w-8 h-0.5 bg-slate-600 mx-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Execution Logs */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">Execution Logs</h2>
          </div>

          <div className="divide-y divide-slate-700">
            {execution.logs.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400">
                No logs yet
              </div>
            ) : (
              execution.logs.map((log, index) => (
                <details key={log.id} className="px-6 py-4 group" open={log.status === 'FAILED'}>
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-slate-500 font-mono text-sm">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium">{log.nodeName}</div>
                          <div className="text-sm text-slate-400">{log.nodeId}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-slate-400">
                          {log.durationMs !== null ? `${log.durationMs}ms` : 'Running...'}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          log.status === 'SUCCESS'
                            ? 'bg-green-500/20 text-green-400'
                            : log.status === 'FAILED'
                            ? 'bg-red-500/20 text-red-400'
                            : log.status === 'RETRYING'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {log.status}
                        </div>
                        <div className="text-slate-400 group-open:rotate-180 transition-transform">
                          ▼
                        </div>
                      </div>
                    </div>
                  </summary>

                  {/* Input */}
                  <div className="mb-3 pl-12">
                    <div className="text-sm text-slate-400 mb-1">Input:</div>
                    <pre className="bg-slate-900 rounded p-3 text-sm text-slate-300 overflow-x-auto">
                      {JSON.stringify(log.input, null, 2)}
                    </pre>
                  </div>

                  {/* Output */}
                  {log.output && (
                    <div className="mb-3 pl-12">
                      <div className="text-sm text-slate-400 mb-1">Output:</div>
                      <pre className="bg-slate-900 rounded p-3 text-sm text-slate-300 overflow-x-auto">
                        {JSON.stringify(log.output, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Error */}
                  {log.error && (
                    <div className="pl-12">
                      <div className="text-sm text-red-400 mb-1">Error:</div>
                      <pre className="bg-red-900/20 rounded p-3 text-sm text-red-300 overflow-x-auto">
                        {log.error}
                      </pre>
                    </div>
                  )}
                </details>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
```

---

## Phase 5: E2E Test (Full Integration)

### 5.1 Test: Complete Tally → ClickUp Flow

**Test First:**
```typescript
// __tests__/e2e/tally-to-clickup.test.ts
import { db } from '~/lib/db'
import { POST as WebhookPOST } from '~/app/api/webhooks/[workflowId]/route'
import { POST as WorkerPOST } from '~/app/api/workers/execute-node/route'

// Mock QStash
vi.mock('~/lib/qstash', () => ({
  enqueueNode: vi.fn().mockResolvedValue(undefined)
}))

describe.sequential('E2E: Tally to ClickUp Workflow', () => {
  beforeEach(async () => {
    // Cleanup
    await db.executionLog.deleteMany()
    await db.execution.deleteMany()
  })

  it('should process Tally webhook and create ClickUp task', async () => {
    // Mock ClickUp API
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'task_abc123',
        name: 'Lead: João Silva',
        url: 'https://app.clickup.com/t/task_abc123'
      })
    })
    global.fetch = mockFetch

    // Step 1: Webhook receives Tally data
    const tallyPayload = {
      eventId: 'evt_test123',
      eventType: 'FORM_RESPONSE',
      data: {
        formName: 'Lead Capture Form',
        fields: [
          { label: 'Nome completo', value: 'João Silva' },
          { label: 'Email', value: 'joao@example.com' },
          { label: 'Telefone', value: '+5511999999999' },
          { label: 'Empresa', value: 'ACME Inc' }
        ]
      }
    }

    const webhookRequest = new Request('http://localhost/api/webhooks/tally-to-clickup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tallyPayload)
    })

    const webhookResponse = await WebhookPOST(webhookRequest, {
      params: Promise.resolve({ workflowId: 'tally-to-clickup' })
    })

    expect(webhookResponse.status).toBe(200)
    const { executionId } = await webhookResponse.json()

    // Step 2: Execute Node 0 (Trigger)
    let workerRequest = new Request('http://localhost/api/workers/execute-node', {
      method: 'POST',
      body: JSON.stringify({
        executionId,
        nodeIndex: 0,
        input: { data: tallyPayload, itemIndex: 0 }
      })
    })

    let workerResponse = await WorkerPOST(workerRequest)
    expect(workerResponse.status).toBe(200)

    // Step 3: Execute Node 1 (Normalize)
    const node0Log = await db.executionLog.findFirst({
      where: { executionId, nodeIndex: 0 }
    })

    workerRequest = new Request('http://localhost/api/workers/execute-node', {
      method: 'POST',
      body: JSON.stringify({
        executionId,
        nodeIndex: 1,
        input: node0Log?.output
      })
    })

    workerResponse = await WorkerPOST(workerRequest)
    expect(workerResponse.status).toBe(200)

    // Step 4: Execute Node 2 (ClickUp API)
    const node1Log = await db.executionLog.findFirst({
      where: { executionId, nodeIndex: 1 }
    })

    workerRequest = new Request('http://localhost/api/workers/execute-node', {
      method: 'POST',
      body: JSON.stringify({
        executionId,
        nodeIndex: 2,
        input: node1Log?.output
      })
    })

    workerResponse = await WorkerPOST(workerRequest)
    expect(workerResponse.status).toBe(200)

    // Step 5: Verify execution completed
    const execution = await db.execution.findUnique({
      where: { id: executionId },
      include: { logs: { orderBy: { startedAt: 'asc' } } }
    })

    expect(execution?.status).toBe('COMPLETED')
    expect(execution?.logs).toHaveLength(3)

    // Verify Node 0 (Trigger)
    expect(execution?.logs[0]?.nodeName).toBe('Tally Webhook')
    expect(execution?.logs[0]?.status).toBe('SUCCESS')

    // Verify Node 1 (Normalize)
    expect(execution?.logs[1]?.nodeName).toBe('Normalize Data')
    expect(execution?.logs[1]?.status).toBe('SUCCESS')
    expect(execution?.logs[1]?.output).toMatchObject({
      data: {
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '+5511999999999',
        company: 'ACME Inc'
      }
    })

    // Verify Node 2 (ClickUp)
    expect(execution?.logs[2]?.nodeName).toBe('Create ClickUp Task')
    expect(execution?.logs[2]?.status).toBe('SUCCESS')
    expect(execution?.logs[2]?.output).toMatchObject({
      data: {
        id: 'task_abc123',
        url: expect.stringContaining('clickup.com')
      }
    })

    // Verify ClickUp API was called
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('api.clickup.com'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    )
  })
})
```

✅ E2E test passa (validação completa!)

---

## Phase 6: Environment Variables Setup

### 6.1 Update .env.example

```bash
# Database - Neon PostgreSQL
DATABASE_URL="postgresql://user:password@host:5432/database"

# QStash - Upstash
QSTASH_TOKEN="your-qstash-token-here"

# Vercel URL (automático em produção)
VERCEL_URL=""

# ClickUp Integration
CLICKUP_API_KEY="pk_your_clickup_api_key"
CLICKUP_LIST_ID="123456789"  # ID da lista onde criar tasks
```

### 6.2 Configure Vercel Production

```bash
# Add ClickUp credentials to Vercel
vercel env add CLICKUP_API_KEY
# Enter: pk_xxxxx (from ClickUp Settings → Apps → API Token)

vercel env add CLICKUP_LIST_ID
# Enter: 123456789 (from ClickUp List → Copy ID)
```

---

## Phase 7: Production Deployment

### 7.1 Deploy to Production

```bash
# 1. Run all tests locally
bun test

# 2. Commit changes
git add .
git commit -m "feat(plan-02): add Tally to ClickUp integration with NormalizeNode and HttpNode"

# 3. Push to deploy
git push origin main

# 4. Vercel auto-deploys
# Or manual: vercel --prod
```

### 7.2 Configure Tally Webhook

**Steps:**
1. Go to Tally form settings
2. Navigate to "Integrations" → "Webhooks"
3. Add webhook URL: `https://flow.buildzero.ai/api/webhooks/tally-to-clickup`
4. Select event: "Form Response"
5. Save

### 7.3 Test Production Integration

```bash
# Option 1: Submit real Tally form
# Go to your Tally form and submit a test entry

# Option 2: Manual webhook test
curl -X POST https://flow.buildzero.ai/api/webhooks/tally-to-clickup \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "evt_manual_test",
    "data": {
      "formName": "Test",
      "fields": [
        {"label": "Nome completo", "value": "Test User"},
        {"label": "Email", "value": "test@example.com"},
        {"label": "Telefone", "value": "+5511999999999"},
        {"label": "Empresa", "value": "Test Company"}
      ]
    }
  }'

# Expected response:
# {"executionId": "clxxx..."}

# Then check:
# 1. Dashboard: https://flow.buildzero.ai
# 2. ClickUp: New task should appear in your list
```

---

## Success Criteria

- [x] NormalizeNode implemented with tests
- [x] HttpNode implemented with tests
- [x] Tally → ClickUp workflow created
- [x] All unit tests passing
- [x] E2E test passing
- [x] Enhanced dashboard with pipeline visualization
- [x] Deployed to production
- [x] Tally webhook configured
- [x] ClickUp API integration working
- [x] Real form submission creates task in ClickUp

---

## Testing Checklist

### Unit Tests
```bash
bun test __tests__/workflow-engine/nodes/NormalizeNode.test.ts
bun test __tests__/workflow-engine/nodes/HttpNode.test.ts
bun test __tests__/workflows/tally-to-clickup.test.ts
```

### Integration Tests
```bash
bun test __tests__/e2e/tally-to-clickup.test.ts
```

### Manual Production Test
1. ✅ Submit Tally form
2. ✅ Check dashboard shows execution
3. ✅ Verify all 3 nodes executed successfully
4. ✅ Confirm task created in ClickUp
5. ✅ Verify task contains correct data

---

## Rollback Plan

If production fails:
```bash
# 1. Check logs
vercel logs --prod

# 2. Check recent executions in dashboard
open https://flow.buildzero.ai/executions

# 3. If critical, rollback deployment
vercel rollback

# 4. Fix locally, test, redeploy
git revert HEAD
git push
```

---

## Next Steps (Plan 03 - Optional)

Future enhancements:
1. **CodeNode** - Custom JavaScript execution
2. **Conditional routing** - If/else logic between nodes
3. **Error notifications** - Slack alert on failure
4. **Retry dashboard** - Manual retry from UI
5. **Webhook signature validation** - Security
6. **Multiple ClickUp lists** - Dynamic list selection
7. **Custom field mapping** - Configure Tally → ClickUp field mapping via UI

---

## Commands Summary

```bash
# Development
bun dev                                        # Start dev server
bun test                                       # Run all tests
bun test __tests__/e2e/tally-to-clickup.test.ts  # Run E2E test

# Database
bunx prisma studio                             # View database

# Deploy
git add . && git commit -m "message"
git push                                       # Auto-deploy via Vercel

# Production
vercel logs --prod                             # View production logs
vercel env pull                                # Pull env vars locally
```

---

## Files Created (Checklist)

### Core Nodes
- [ ] `src/lib/workflow-engine/nodes/NormalizeNode.ts`
- [ ] `src/lib/workflow-engine/nodes/HttpNode.ts`

### Workflows
- [ ] `src/workflows/tally-to-clickup.ts`
- [ ] `src/workflows/registry.ts` (update)

### Tests
- [ ] `__tests__/workflow-engine/nodes/NormalizeNode.test.ts`
- [ ] `__tests__/workflow-engine/nodes/HttpNode.test.ts`
- [ ] `__tests__/workflows/tally-to-clickup.test.ts`
- [ ] `__tests__/e2e/tally-to-clickup.test.ts`

### Dashboard
- [ ] `src/app/executions/[id]/page.tsx` (enhanced)

### Config
- [ ] `.env.example` (update with ClickUp vars)

---

**Estimated Time:** 3-4 hours
**Complexity:** Medium
**Risk:** Low (all nodes are testable, ClickUp API is well-documented)

---

## ClickUp Configuration Notes

**Getting ClickUp API Key:**
1. Go to ClickUp → Settings
2. Click "Apps" in sidebar
3. Click "Generate" under API Token
4. Copy the `pk_xxxxx` token

**Getting List ID:**
1. Open ClickUp list where you want tasks created
2. Click "..." menu → "Copy Link"
3. URL format: `https://app.clickup.com/123456789/v/li/987654321`
4. List ID is the last number: `987654321`

**Testing ClickUp API:**
```bash
# Test API key works
curl https://api.clickup.com/api/v2/user \
  -H "Authorization: pk_your_key_here"

# Should return your user info
```
