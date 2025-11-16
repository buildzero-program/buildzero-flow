# Plan 03: CodeNode + Profile Photo Upload

## 📋 Overview

Implementar **CodeNode** (executar código JavaScript customizado) e usar para adicionar upload automático de foto de perfil ao workflow Tally → ClickUp.

**Objetivo:**
1. Criar novo tipo de node: `CodeNode` (mencionado no Plan 02 como next step)
2. Após criar task no ClickUp, tentar anexar foto de perfil
3. Buscar foto em: WhatsApp (Evolution API) → Email (Avatar API) → None
4. Workflow sempre continua, mesmo se foto não for encontrada

---

## 🔍 Análise da Codebase Atual

### Nodes Existentes

```
src/lib/workflow-engine/nodes/
├── TriggerNode.ts     - Recebe webhooks
├── NormalizeNode.ts   - Transforma dados (função transform)
└── HttpNode.ts        - Faz requests HTTP (GET/POST/PUT/etc)
```

### HttpNode Atual

✅ **Já retorna JSON da response:**
```typescript
// HttpNode.ts linha 44-47
const data = await response.json()
context.logger(`Request successful, received response`)
return data  // ← Passa para próximo node
```

**Isso significa:** O workflow atual já passa o objeto da task criada (com `id`, `url`, etc.) para o próximo node! ✅

### Workflow Atual

```typescript
// src/workflows/tally-to-clickup.ts
export const tallyToClickup = new Workflow({
  nodes: [
    new TriggerNode({ id: 'trigger' }),           // Node 0
    new NormalizeNode({ id: 'normalize' }),       // Node 1
    new HttpNode({ id: 'create-task', ... })      // Node 2
  ]
})
```

---

## 🎯 O que Precisamos

### 1. Criar CodeNode

**Inspiração: n8n Code Node**
- Aceita função JavaScript customizada
- Tem acesso a `input.data` (output do node anterior)
- Tem acesso a `context` (secrets, logger)
- Pode fazer qualquer lógica: loops, conditions, async/await, fetch, etc.

**Nossa implementação:**

```typescript
// src/lib/workflow-engine/nodes/CodeNode.ts
import { Node, type NodeConfig } from '../Node'
import type { Item, NodeExecutionContext } from '../types'

export interface CodeNodeConfig extends NodeConfig {
  /**
   * Função JavaScript customizada para executar
   * Recebe: input (data do node anterior), context (secrets, logger)
   * Retorna: qualquer objeto (será passado para próximo node)
   */
  execute: (input: Item, context: NodeExecutionContext) => Promise<any> | any
}

export class CodeNode extends Node {
  private executeFn: (input: Item, context: NodeExecutionContext) => Promise<any> | any

  constructor(config: CodeNodeConfig) {
    super(config)
    this.executeFn = config.execute
  }

  async execute(input: Item, context: NodeExecutionContext): Promise<any> {
    return await this.executeFn(input, context)
  }
}
```

### 2. Adicionar ao Workflow

```typescript
// src/workflows/tally-to-clickup.ts
import { CodeNode } from '~/lib/workflow-engine/nodes/CodeNode'

export const tallyToClickup = new Workflow({
  id: 'tally-to-clickup',
  name: 'Tally → ClickUp',
  nodes: [
    // Node 0: Trigger
    new TriggerNode({
      id: 'trigger',
      name: 'Tally Webhook'
    }),

    // Node 1: Normalize Tally Data
    new NormalizeNode({
      id: 'normalize',
      name: 'Normalize Data',
      transform: (input, context) => {
        // ... código existente ...
        return { nome, sobrenome, email, whatsapp, ... }
      }
    }),

    // Node 2: Create ClickUp Task
    new HttpNode({
      id: 'create-task',
      name: 'Create ClickUp Task',
      method: 'POST',
      url: 'https://api.clickup.com/api/v2/list/901322211570/task',
      headers: (context) => ({
        'Authorization': context.secrets.CLICKUP_API_KEY,
        'Content-Type': 'application/json'
      }),
      body: (input, context) => {
        // ... código existente que cria task ...
        return { name, markdown_description, custom_fields }
      }
    }),
    // ↑ Retorna: { id: "86ad9e92h", url: "...", custom_fields: [...], ... }

    // Node 3: Upload Profile Photo (NOVO!)
    new CodeNode({
      id: 'upload-profile-photo',
      name: 'Upload Profile Photo',
      execute: async (input, context) => {
        // input.data = task criada no node anterior
        const task = input.data
        const taskId = task.id

        // Pegar email e whatsapp dos custom_fields da task
        const emailField = task.custom_fields?.find(
          f => f.id === '3705639e-668f-4eb4-977c-5f865653b3c3'
        )
        const whatsappField = task.custom_fields?.find(
          f => f.id === '081c88b5-97a6-4e36-8c1f-61f2ac879913'
        )

        const email = emailField?.value
        const whatsapp = whatsappField?.value

        let photoUrl = null
        let photoSource = null

        // === 1. Try WhatsApp (Evolution API) ===
        if (whatsapp) {
          try {
            context.logger('🔍 Buscando foto do WhatsApp...')

            const instanceName = encodeURIComponent(
              context.secrets.EVOLUTION_INSTANCE_NAME || ''
            )
            const number = whatsapp.replace(/\D/g, '')

            const response = await fetch(
              `${context.secrets.EVOLUTION_API_URL}/chat/fetchProfilePictureUrl/${instanceName}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': context.secrets.EVOLUTION_API_KEY || ''
                },
                body: JSON.stringify({
                  number: `${number}@s.whatsapp.net`
                })
              }
            )

            if (response.ok) {
              const data = await response.json()
              if (data.profilePictureUrl) {
                photoUrl = data.profilePictureUrl
                photoSource = 'whatsapp'
                context.logger('✅ Foto WhatsApp encontrada')
              } else {
                context.logger('⚠️  WhatsApp sem foto de perfil')
              }
            }
          } catch (error: any) {
            context.logger(`⚠️  Erro Evolution API: ${error.message}`)
          }
        }

        // === 2. Fallback: Try Avatar API (email) ===
        if (!photoUrl && email) {
          try {
            context.logger('🔍 Buscando foto do email...')

            const response = await fetch('https://avatarapi.com/v2/api.aspx', {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify({
                username: context.secrets.AVATAR_API_USERNAME || '',
                password: context.secrets.AVATAR_API_PASSWORD || '',
                email: email
              })
            })

            if (response.ok) {
              const data = await response.json()
              if (data.Success && data.Image && !data.IsDefault) {
                photoUrl = data.Image
                photoSource = `email-${data.Source.Name.toLowerCase()}`
                context.logger(`✅ Foto encontrada via ${data.Source.Name}`)
              } else {
                context.logger('⚠️  Email sem foto disponível')
              }
            }
          } catch (error: any) {
            context.logger(`⚠️  Erro Avatar API: ${error.message}`)
          }
        }

        // === 3. Upload photo to ClickUp (if found) ===
        if (photoUrl) {
          try {
            context.logger('📤 Fazendo upload da foto...')

            // Download photo
            const photoResponse = await fetch(photoUrl)
            const photoBlob = await photoResponse.blob()

            // Upload to ClickUp
            const formData = new FormData()
            formData.append('attachment', photoBlob, `profile-${photoSource}.jpg`)

            const uploadResponse = await fetch(
              `https://api.clickup.com/api/v2/task/${taskId}/attachment`,
              {
                method: 'POST',
                headers: {
                  'Authorization': context.secrets.CLICKUP_API_KEY || ''
                },
                body: formData
              }
            )

            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json()
              context.logger(`✅ Foto anexada: ${uploadData.url}`)

              return {
                taskId,
                taskUrl: task.url,
                photoUploaded: true,
                photoSource,
                photoUrl: uploadData.url
              }
            } else {
              context.logger(`❌ Erro upload: ${uploadResponse.status}`)
            }
          } catch (error: any) {
            context.logger(`❌ Erro ao fazer upload: ${error.message}`)
          }
        } else {
          context.logger('ℹ️  Nenhuma foto encontrada')
        }

        // Sempre retorna (mesmo sem foto)
        return {
          taskId,
          taskUrl: task.url,
          photoUploaded: false,
          photoSource: 'none'
        }
      }
    })
  ]
})
```

---

## 🔧 Implementação Passo a Passo

### Fase 1: Criar CodeNode

**Arquivos a criar:**
```
src/lib/workflow-engine/nodes/CodeNode.ts
__tests__/workflow-engine/nodes/CodeNode.test.ts
```

**CodeNode.ts:**
```typescript
import { Node, type NodeConfig } from '../Node'
import type { Item, NodeExecutionContext } from '../types'

export interface CodeNodeConfig extends NodeConfig {
  execute: (input: Item, context: NodeExecutionContext) => Promise<any> | any
}

export class CodeNode extends Node {
  private executeFn: (input: Item, context: NodeExecutionContext) => Promise<any> | any

  constructor(config: CodeNodeConfig) {
    super(config)
    this.executeFn = config.execute
  }

  async execute(input: Item, context: NodeExecutionContext): Promise<any> {
    return await this.executeFn(input, context)
  }
}
```

**Test:**
```typescript
// __tests__/workflow-engine/nodes/CodeNode.test.ts
import { CodeNode } from '~/lib/workflow-engine/nodes/CodeNode'

describe('CodeNode', () => {
  it('should execute custom code', async () => {
    const node = new CodeNode({
      id: 'test-code',
      name: 'Test Code',
      execute: async (input, context) => {
        return { result: input.data.value * 2 }
      }
    })

    const output = await node.execute(
      { data: { value: 10 }, itemIndex: 0 },
      {
        executionId: 'test',
        workflowId: 'test',
        nodeIndex: 0,
        secrets: {},
        logger: jest.fn()
      }
    )

    expect(output).toEqual({ result: 20 })
  })

  it('should have access to context.secrets', async () => {
    const node = new CodeNode({
      id: 'test-secrets',
      name: 'Test Secrets',
      execute: async (input, context) => {
        return { apiKey: context.secrets.MY_API_KEY }
      }
    })

    const output = await node.execute(
      { data: {}, itemIndex: 0 },
      {
        executionId: 'test',
        workflowId: 'test',
        nodeIndex: 0,
        secrets: { MY_API_KEY: 'secret123' },
        logger: jest.fn()
      }
    )

    expect(output).toEqual({ apiKey: 'secret123' })
  })

  it('should support async operations', async () => {
    const node = new CodeNode({
      id: 'test-async',
      name: 'Test Async',
      execute: async (input, context) => {
        const response = await fetch('https://api.example.com/data')
        const data = await response.json()
        return data
      }
    })

    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true })
      })
    ) as jest.Mock

    const output = await node.execute(
      { data: {}, itemIndex: 0 },
      {
        executionId: 'test',
        workflowId: 'test',
        nodeIndex: 0,
        secrets: {},
        logger: jest.fn()
      }
    )

    expect(output).toEqual({ success: true })
  })
})
```

### Fase 2: Atualizar Workflow

**Arquivo:** `src/workflows/tally-to-clickup.ts`

1. Import CodeNode
2. Adicionar Node 3 com lógica de upload (código fornecido acima)

### Fase 3: Testar Localmente

**Criar teste E2E:**
```typescript
// __tests__/e2e/photo-upload.test.ts
describe('Photo Upload Workflow', () => {
  it('should upload WhatsApp photo when available', async () => {
    // Mock Tally webhook com WhatsApp válido
    // Mock Evolution API retornando foto
    // Verificar que foto foi anexada na task
  })

  it('should fallback to Avatar API when WhatsApp fails', async () => {
    // Mock Evolution API retornando null
    // Mock Avatar API retornando foto
    // Verificar que foto do email foi anexada
  })

  it('should continue workflow when no photo found', async () => {
    // Mock ambas APIs retornando null/erro
    // Verificar que task foi criada normalmente
    // Verificar que workflow completou com sucesso
  })
})
```

---

## ✅ Checklist de Implementação

### Preparação
- [x] Testar Evolution API
- [x] Testar Avatar API
- [x] Testar upload ClickUp
- [x] Configurar env vars

### Desenvolvimento
- [ ] Criar `CodeNode.ts`
- [ ] Criar `CodeNode.test.ts`
- [ ] Exportar CodeNode em index
- [ ] Atualizar workflow `tally-to-clickup.ts`
- [ ] Rodar testes: `bun test`

### Testes E2E
- [ ] Teste: WhatsApp com foto
- [ ] Teste: WhatsApp sem foto + email com foto
- [ ] Teste: Ambos sem foto
- [ ] Teste: APIs com erro
- [ ] Teste: Upload falha mas workflow continua

### Deploy
- [ ] Commit changes
- [ ] Push para Vercel
- [ ] Testar em produção com Tally real
- [ ] Monitorar executions no dashboard

---

## 🎯 Critérios de Sucesso

1. ✅ CodeNode funciona como esperado (testes passam)
2. ✅ Task criada no ClickUp com todos dados
3. ✅ Foto WhatsApp anexada quando disponível
4. ✅ Fallback Avatar API funciona
5. ✅ Workflow SEMPRE completa (mesmo sem foto)
6. ✅ Logs claros de cada etapa
7. ✅ Performance < 5s total
8. ✅ Código limpo e testável

---

## 📊 Estrutura de Arquivos

```
src/
├── lib/
│   └── workflow-engine/
│       ├── Node.ts
│       ├── Workflow.ts
│       └── nodes/
│           ├── TriggerNode.ts
│           ├── NormalizeNode.ts
│           ├── HttpNode.ts
│           └── CodeNode.ts          # ← NOVO
└── workflows/
    └── tally-to-clickup.ts          # ← ATUALIZAR (adicionar Node 3)

__tests__/
└── workflow-engine/
    └── nodes/
        ├── TriggerNode.test.ts
        ├── NormalizeNode.test.ts
        ├── HttpNode.test.ts
        └── CodeNode.test.ts          # ← NOVO
```

---

## 🔗 Referências

- **Plan 02:** Mencionou CodeNode como next step
- **n8n Code Node:** https://docs.n8n.io/code/code-node/
- **ClickUp Attachments API:** https://developer.clickup.com/reference/createtaskattachment
- **Evolution API:** https://doc.evolution-api.com/v2/api-reference/chat-controller/fetch-profilepic-url
- **Avatar API:** https://docs.avatarapi.com/

---

## 💡 Vantagens do CodeNode

1. **Flexibilidade Total:** Aceita qualquer código JavaScript
2. **Reutilizável:** Pode ser usado em outros workflows
3. **Testável:** Fácil de testar unitariamente
4. **Simples:** Apenas 20 linhas de código
5. **Poderoso:** Acesso a fetch, async/await, loops, etc.
6. **Familiar:** Pattern comum (n8n, Zapier Code by Zapier, etc.)

---

## 🚀 Melhorias Futuras

### Fase 1: Error Handling Explícito

Adicionar flag `continueOnError`:

```typescript
new CodeNode({
  id: 'upload-photo',
  continueOnError: true,  // ← Explícito
  execute: async (input, context) => { ... }
})
```

### Fase 2: SwitchNode

Para lógica condicional mais complexa:

```typescript
new SwitchNode({
  routes: [
    { condition: (input) => input.hasPhoto, output: 0 },
    { condition: (input) => !input.hasPhoto, output: 1 }
  ]
})
```

### Fase 3: Visual Editor

- Renderizar nodes como blocos
- Arrastar e conectar
- Ver status em tempo real
- Editar código inline

---

## 📝 Notas Importantes

1. **CodeNode vs NormalizeNode:**
   - NormalizeNode: transformações síncronas simples
   - CodeNode: lógica complexa, async, múltiplas operações

2. **Error Handling:**
   - Todos erros em try/catch
   - Logs detalhados
   - Sempre retorna objeto (nunca throw)

3. **Performance:**
   - Download + upload de foto: ~2-3s
   - Não bloqueia criação da task
   - Aceitável para workflow async

4. **Segurança:**
   - Secrets via `context.secrets` (não hardcoded)
   - Env vars configuradas em Vercel
   - API keys nunca expostas

---

**Status:** Ready to implement 🚀
