# Visual Workflow Editor - Plano Futuro

> **Status:** Planejamento
> **Data:** 2025-11-16
> **Viabilidade:** ✅ TOTALMENTE VIÁVEL

## 📋 Overview

Este documento descreve como implementar um **editor visual para workflows** (estilo n8n) na nossa arquitetura atual de workflows hardcoded em TypeScript.

**Objetivo:** Visualizar workflows, debugar execuções e facilitar onboarding - **SEM EDIÇÃO no UI** (workflows continuam sendo código).

---

## 🎯 Comparação: n8n vs Nossa Arquitetura

### n8n (Workflows Dinâmicos)
```
User cria workflow no UI → UI gera JSON → JSON salvo no PostgreSQL → Engine executa
```
- ✅ Criação/edição visual
- ❌ Sem type safety
- ❌ Difícil versionamento (Git)
- ❌ Difícil code review

### Nossa Arquitetura (Workflows Hardcoded + Viewer)
```
Dev escreve TypeScript → Build/Deploy → Engine executa → UI visualiza
```
- ✅ Type safety (TypeScript)
- ✅ Versionamento (Git)
- ✅ Code review (GitHub PR)
- ✅ Visualização/debug
- ❌ Não pode criar workflows no UI (precisa código)

---

## ✅ Por Que É Viável?

### 1. Arquitetura Atual Já Tem Tudo

```typescript
// Node base com metadados
export abstract class Node {
  id: string        // ✅ ID único
  name: string      // ✅ Nome amigável
  // + tipo implícito (classe)
}

// Workflow com lista de nodes
export class Workflow {
  id: string
  name: string
  nodes: Node[]     // ✅ Array sequencial
}
```

### 2. Conexões São Implícitas (Linear)

```
Nossa arquitetura = LINEAR
Node 0 → Node 1 → Node 2 → Node 3

n8n = GRAPH (qualquer node conecta com qualquer)
Node 1 → Node 3
Node 1 → Node 5
Node 2 → Node 4
```

**Para nós:** Basta desenhar linha de `nodes[i]` → `nodes[i+1]` ✅

### 3. React Flow é Perfeito

- **Biblioteca:** [React Flow](https://reactflow.dev) (MIT license)
- **Usado por:** Stripe, Typeform, n8n (conceito similar)
- **Features:** Zoom, pan, conexões, nodes customizados
- **Instalação:** `npm install reactflow`

---

## 🎨 Layout Visual

### Exemplo: Workflow `tally-to-clickup`

```
┌─────────────────┐
│  Tally Webhook  │ ← TriggerNode
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Normalize Data  │ ← NormalizeNode
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Create Task     │ ← HttpNode
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Upload Photo    │ ← CodeNode
└─────────────────┘
```

**Ao clicar em node:** Sidebar mostra configurações

---

## 🔍 Detalhes Por Tipo de Node

### TriggerNode
```
┌──────────────────────────────────────┐
│ 🔔 Tally Webhook                     │
├──────────────────────────────────────┤
│ Type: Trigger                        │
│ URL: /api/workflows/tally-to-clickup │
│ Method: POST                         │
└──────────────────────────────────────┘
```

### NormalizeNode
```
┌──────────────────────────────────────┐
│ 🔄 Normalize Data                    │
├──────────────────────────────────────┤
│ Type: Normalize                      │
│                                      │
│ 📝 Transform Function:               │
│ ┌──────────────────────────────────┐ │
│ │ (input, context) => {            │ │
│ │   const fields = input.data...   │ │
│ │   return { nome, email, ... }    │ │
│ │ }                                │ │
│ └──────────────────────────────────┘ │
│                                      │
│ [View Full Code] ← Monaco Editor    │
└──────────────────────────────────────┘
```

### HttpNode
```
┌──────────────────────────────────────┐
│ 🌐 Create ClickUp Task               │
├──────────────────────────────────────┤
│ Type: HTTP Request                   │
│                                      │
│ Method: POST                         │
│ URL: https://api.clickup.com/...     │
│                                      │
│ Headers:                             │
│   Authorization: {{ CLICKUP_API_KEY }}│
│   Content-Type: application/json     │
│                                      │
│ Body Template:                       │
│ ┌──────────────────────────────────┐ │
│ │ {                                │ │
│ │   "name": "{{ nome }} ...",      │ │
│ │   "custom_fields": [...]         │ │
│ │ }                                │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### CodeNode
```
┌──────────────────────────────────────┐
│ 💻 Upload Profile Photo              │
├──────────────────────────────────────┤
│ Type: Code                           │
│                                      │
│ 📝 Execute Function:                 │
│ ┌──────────────────────────────────┐ │
│ │ async (input, context) => {      │ │
│ │   // 1. Try WhatsApp             │ │
│ │   // 2. Fallback Avatar API      │ │
│ │   // 3. Upload to ClickUp        │ │
│ │   return { photoUploaded }       │ │
│ │ }                                │ │
│ └──────────────────────────────────┘ │
│                                      │
│ [View Full Code] ← Monaco Editor    │
└──────────────────────────────────────┘
```

---

## 🛠️ Implementação Técnica

### Fase 1: Adicionar Serialização nos Nodes

```typescript
// src/lib/workflow-engine/Node.ts
export interface NodeMetadata {
  id: string
  name: string
  type: 'trigger' | 'normalize' | 'http' | 'code'
  config: Record<string, any>
}

export abstract class Node {
  id: string
  name: string

  // ✨ NOVO - cada node implementa
  abstract getMetadata(): NodeMetadata
}
```

### Fase 2: Implementar em Cada Node

**TriggerNode:**
```typescript
export class TriggerNode extends Node {
  getMetadata(): NodeMetadata {
    return {
      id: this.id,
      name: this.name,
      type: 'trigger',
      config: {}
    }
  }
}
```

**HttpNode:**
```typescript
export class HttpNode extends Node {
  private method: string
  private url: string
  private headersFn?: Function
  private bodyFn?: Function

  getMetadata(): NodeMetadata {
    return {
      id: this.id,
      name: this.name,
      type: 'http',
      config: {
        method: this.method,
        url: this.url,
        hasHeaders: !!this.headersFn,
        hasBody: !!this.bodyFn
      }
    }
  }
}
```

**NormalizeNode:**
```typescript
export class NormalizeNode extends Node {
  private transform: Function

  getMetadata(): NodeMetadata {
    return {
      id: this.id,
      name: this.name,
      type: 'normalize',
      config: {
        code: this.transform.toString()
      }
    }
  }
}
```

**CodeNode:**
```typescript
export class CodeNode extends Node {
  private executeFn: Function

  getMetadata(): NodeMetadata {
    return {
      id: this.id,
      name: this.name,
      type: 'code',
      config: {
        code: this.executeFn.toString()
      }
    }
  }
}
```

### Fase 3: Workflow Serialização

```typescript
// src/lib/workflow-engine/Workflow.ts
export class Workflow {
  // ... existing code ...

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,

      // Nodes com posicionamento
      nodes: this.nodes.map((node, index) => ({
        ...node.getMetadata(),
        position: {
          x: 250,              // Centralizado
          y: index * 150       // Espaçamento vertical
        }
      })),

      // Edges (conexões lineares)
      edges: this.nodes.slice(0, -1).map((_, index) => ({
        id: `edge-${index}`,
        source: this.nodes[index].id,
        target: this.nodes[index + 1].id,
        animated: true        // Animação de fluxo
      }))
    }
  }
}
```

### Fase 4: API Endpoint

```typescript
// src/app/api/workflows/[id]/visualization/route.ts
import { tallyToClickup } from '~/workflows/tally-to-clickup'
import { stripeToMeta } from '~/workflows/stripe-to-meta'

const workflows = {
  'tally-to-clickup': tallyToClickup,
  'stripe-to-meta': stripeToMeta,
  // ... outros workflows
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const workflow = workflows[params.id]

  if (!workflow) {
    return Response.json({ error: 'Workflow not found' }, { status: 404 })
  }

  return Response.json(workflow.toJSON())
}

// Lista todos workflows
export async function GET(req: Request) {
  return Response.json({
    workflows: Object.keys(workflows).map(id => ({
      id,
      name: workflows[id].name,
      description: workflows[id].description
    }))
  })
}
```

### Fase 5: Frontend com React Flow

```tsx
// src/app/workflows/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap
} from 'reactflow'
import 'reactflow/dist/style.css'

// Componente customizado por tipo de node
import { TriggerNodeComponent } from './nodes/TriggerNode'
import { HttpNodeComponent } from './nodes/HttpNode'
import { NormalizeNodeComponent } from './nodes/NormalizeNode'
import { CodeNodeComponent } from './nodes/CodeNode'

const nodeTypes = {
  trigger: TriggerNodeComponent,
  http: HttpNodeComponent,
  normalize: NormalizeNodeComponent,
  code: CodeNodeComponent
}

export default function WorkflowViewer({
  params
}: {
  params: { id: string }
}) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [workflow, setWorkflow] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/workflows/${params.id}/visualization`)
      .then(res => res.json())
      .then(data => {
        setWorkflow(data)
        setNodes(data.nodes)
        setEdges(data.edges)
      })
  }, [params.id])

  return (
    <div className="flex h-screen">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b p-4">
        <h1 className="text-xl font-bold">{workflow?.name}</h1>
        <p className="text-sm text-gray-600">{workflow?.description}</p>
      </div>

      {/* Canvas */}
      <div className="flex-1 mt-20">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setSelectedNode(node)}
          fitView
          minZoom={0.5}
          maxZoom={1.5}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {/* Sidebar */}
      {selectedNode && (
        <div className="w-96 border-l p-4 overflow-y-auto bg-white mt-20">
          <NodeDetailsPanel node={selectedNode} />
        </div>
      )}
    </div>
  )
}
```

### Fase 6: Node Details Panel

```tsx
// src/app/workflows/[id]/NodeDetailsPanel.tsx
import { Editor } from '@monaco-editor/react'

export function NodeDetailsPanel({ node }: { node: any }) {
  const { type, config } = node.data

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">{node.data.name}</h2>
      <div className="mb-4">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
          {type.toUpperCase()}
        </span>
      </div>

      {/* TriggerNode */}
      {type === 'trigger' && (
        <div>
          <h3 className="font-semibold mb-2">Webhook URL</h3>
          <code className="block bg-gray-100 p-2 rounded text-xs">
            /api/workflows/{node.workflowId}
          </code>
        </div>
      )}

      {/* HttpNode */}
      {type === 'http' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Method</h3>
            <code className="bg-gray-100 px-2 py-1 rounded">{config.method}</code>
          </div>

          <div>
            <h3 className="font-semibold mb-2">URL</h3>
            <code className="block bg-gray-100 p-2 rounded text-xs break-all">
              {config.url}
            </code>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Headers</h3>
            <p className="text-sm text-gray-600">
              {config.hasHeaders ? '✅ Custom headers' : '❌ No headers'}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Body</h3>
            <p className="text-sm text-gray-600">
              {config.hasBody ? '✅ Custom body' : '❌ No body'}
            </p>
          </div>
        </div>
      )}

      {/* NormalizeNode / CodeNode */}
      {(type === 'normalize' || type === 'code') && (
        <div>
          <h3 className="font-semibold mb-2">Code</h3>
          <Editor
            height="400px"
            language="javascript"
            value={config.code}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12
            }}
          />
        </div>
      )}
    </div>
  )
}
```

---

## 🎁 Benefícios

### 1. Debug Visual
- Execução falhou? → Vê exatamente em qual node
- Node vermelho = erro
- Node verde = sucesso
- Node amarelo = executando

### 2. Documentação Automática
- Cada workflow = diagrama visual interativo
- Melhor que 100 linhas de markdown
- Auto-atualiza com código

### 3. Onboarding de Devs
- Dev novo: "Como funciona o workflow X?"
- Você: "Acessa /workflows/tally-to-clickup"
- Dev: "Ahh, entendi!" 🎉

### 4. Monitoramento em Tempo Real
- Webhook recebido → Node 0 acende
- Normalizado → Node 1 acende
- Task criada → Node 2 acende
- Foto enviada → Node 3 acende

---

## ⚠️ Limitações vs n8n

| Feature | n8n | Nossa Arquitetura |
|---------|-----|-------------------|
| **Criar workflow no UI** | ✅ Sim | ❌ Não (precisa código) |
| **Editar workflow no UI** | ✅ Sim | ❌ Não (precisa rebuild) |
| **Visualizar workflow** | ✅ Sim | ✅ **SIM!** |
| **Ver detalhes do node** | ✅ Sim | ✅ **SIM!** |
| **Debug visual** | ✅ Sim | ✅ **SIM!** |
| **Execuções em tempo real** | ✅ Sim | ✅ **SIM!** |
| **Versionamento (Git)** | ❌ Difícil | ✅ **SIM!** |
| **Type Safety** | ❌ Não | ✅ **SIM!** |
| **Code Review** | ❌ Difícil | ✅ **SIM!** |

---

## 🚀 Roadmap de Implementação

### MVP (1-2 dias)
- [ ] Adicionar `getMetadata()` em todos nodes
- [ ] Implementar `Workflow.toJSON()`
- [ ] Criar endpoint `/api/workflows/[id]/visualization`
- [ ] Página básica com React Flow
- [ ] Sidebar com detalhes do node

### v1 (3-5 dias)
- [ ] Componentes customizados por tipo de node
- [ ] Monaco Editor para CodeNode/NormalizeNode
- [ ] Formulário estilo n8n para HttpNode
- [ ] Lista de workflows disponíveis
- [ ] Cores por tipo de node

### v2 (1 semana)
- [ ] Histórico de execuções (lista de runs)
- [ ] Replay de execução (ver dados em cada node)
- [ ] Logs inline no canvas
- [ ] Status em tempo real (WebSocket)
- [ ] Export para PNG/SVG

### v3 (2 semanas)
- [ ] Dashboard com métricas
- [ ] Filtros e busca de workflows
- [ ] Comparação entre versões (Git diff)
- [ ] Templates de workflows
- [ ] Documentação gerada automaticamente

---

## 📦 Dependências

```json
{
  "dependencies": {
    "reactflow": "^11.10.0",
    "@monaco-editor/react": "^4.6.0"
  }
}
```

---

## 🎯 Decisão Arquitetural

### Opção A: Hardcoded + Viewer ✅ RECOMENDADO
- ✅ Workflows são código TypeScript (type-safe, versionado)
- ✅ Interface visual APENAS para visualização/debug
- ✅ Melhor Developer Experience
- ✅ Mais simples de implementar
- ✅ 80% dos benefícios do n8n com 20% do esforço

### Opção B: Full n8n Clone ❌ NÃO RECOMENDADO
- ❌ Workflows são JSONs (dinâmicos, editáveis no UI)
- ❌ Perde type safety
- ❌ Perde versionamento Git
- ❌ Muito mais complexo (parser, validator, etc)
- ❌ Precisa reescrever toda engine

---

## 📚 Referências

- **React Flow:** https://reactflow.dev
- **React Flow Examples:** https://reactflow.dev/examples
- **Monaco Editor:** https://microsoft.github.io/monaco-editor/
- **n8n Viewer (inspiração):** https://n8nviewer.com
- **n8n Architecture:** https://tuanla.vn/post/n8n/

---

## 💡 Próximos Passos

1. ✅ Implementar CodeNode (Plan 03)
2. ✅ Testar workflow completo com foto
3. 🔜 Adicionar `getMetadata()` nos nodes existentes
4. 🔜 Criar endpoint de visualização
5. 🔜 Implementar UI básico com React Flow

---

**Status:** Documentado e pronto para implementação futura 🚀
