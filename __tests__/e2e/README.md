# Testes E2E - BuildZero Flow

Este diretório contém testes end-to-end (E2E) que validam o fluxo completo de execução de workflows.

## Como Rodar

### 1. Iniciar o servidor de desenvolvimento

Em um terminal, inicie o servidor Next.js:

```bash
npm run dev
```

Aguarde até ver a mensagem:
```
✓ Ready in XXXms
○ Local:   http://localhost:3000
```

### 2. Rodar os testes E2E

Em outro terminal, execute:

```bash
npm run test:e2e
```

## O que o teste valida

O teste E2E `workflow-execution.test.ts` valida todo o fluxo de execução:

1. **Webhook recebe payload** - POST para `/api/webhooks/tally-to-clickup`
2. **Execution é criada** - Verifica registro no banco com status RUNNING
3. **Worker executa Node 0** - Simula chamada do QStash
4. **Worker executa Nodes 1-3** - Executa todos os nodes sequencialmente
5. **Execution é completada** - Verifica status COMPLETED e 4 logs SUCCESS

## Estrutura do teste

```typescript
describe('E2E: Workflow Execution', () => {
  it('should complete full workflow execution', async () => {
    // 1. Call webhook
    // 2. Verify execution created
    // 3. Simulate QStash calling worker
    // 4. Execute remaining nodes
    // 5. Verify final state
  })
})
```

## Troubleshooting

### Erro: "fetch failed" ou "ECONNREFUSED"

O servidor Next.js não está rodando. Execute `npm run dev` primeiro.

### Worker endpoint retorna 404

Se o endpoint `/api/workers/execute-node` retornar 404, pode ser um problema com Turbopack. O projeto foi configurado para usar `next dev` sem Turbopack para garantir compatibilidade.

### Erro: "No workflow owner found in database"

O usuário `pedrohnas0@gmail.com` não existe no banco. O teste cria automaticamente via `upsert`.

### Erro: "Workflow not found"

O workflow `tally-to-clickup` não está registrado em `src/workflows/registry.ts`.

## Variáveis de ambiente

O teste usa `BASE_URL` para definir a URL do servidor:

```bash
# Default
BASE_URL=http://localhost:3000

# Customizar porta
BASE_URL=http://localhost:3001 npm run test:e2e
```

## Limpeza

O teste faz limpeza automática:
- Deleta logs criados (`afterAll`)
- Deleta execution criada (`afterAll`)

Execuções e logs de teste são identificados por:
- `submissionId: "test-submission-e2e"`
- `respondentId: "test-respondent-e2e"`
