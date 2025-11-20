import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '~/lib/db'

/**
 * E2E Test: Workflow Execution Flow
 *
 * Este teste valida o fluxo completo de execução de um workflow:
 * 1. Webhook recebe payload
 * 2. Cria execution no banco
 * 3. QStash deveria chamar o worker (simulamos aqui)
 * 4. Worker executa todos os nodes
 * 5. Logs são criados
 * 6. Execution é marcada como COMPLETED
 */

const BASE_URL = 'http://localhost:3000'

describe.sequential('E2E: Workflow Execution', () => {
  let testExecutionId: string | null = null
  let testUserId: string | null = null

  beforeAll(async () => {
    // Ensure test user exists
    const user = await db.user.upsert({
      where: { email: 'pedrohnas0@gmail.com' },
      create: {
        email: 'pedrohnas0@gmail.com',
        name: 'Pedro',
        clerkUserId: 'user_test_e2e'
      },
      update: {}
    })
    testUserId = user.id
  })

  afterAll(async () => {
    // Cleanup: delete test execution and logs
    if (testExecutionId) {
      await db.executionLog.deleteMany({
        where: { executionId: testExecutionId }
      })
      await db.execution.delete({
        where: { id: testExecutionId }
      })
    }
  })

  it('should complete full workflow execution', async () => {
    console.log('\n📋 TESTE E2E: Fluxo Completo de Execução')
    console.log('⚠️  Nota: QStash não funciona com localhost, então criamos a execution diretamente\n')

    // ============================================
    // STEP 1: Create execution directly (skip webhook/QStash)
    // ============================================
    console.log('1️⃣ Criando execution no banco...')

    const webhookPayload = {
      eventId: `test-e2e-${Date.now()}`,
      eventType: 'FORM_RESPONSE',
      createdAt: new Date().toISOString(),
      data: {
        responseId: 'test-response-e2e',
        submissionId: 'test-submission-e2e',
        respondentId: 'test-respondent-e2e',
        formId: 'test-form',
        formName: 'Aplicação BuildZero',
        createdAt: new Date().toISOString(),
        fields: [
          { key: 'q1', label: 'Nome', type: 'INPUT_TEXT', value: 'E2E' },
          { key: 'q2', label: 'Sobrenome', type: 'INPUT_TEXT', value: 'Test' },
          { key: 'q3', label: 'E-mail', type: 'INPUT_EMAIL', value: 'e2e@test.com' },
          { key: 'q4', label: 'WhatsApp', type: 'INPUT_PHONE_NUMBER', value: '+5511999999999' },
          {
            key: 'q5',
            label: 'Como você ficou sabendo do BuildZero?',
            type: 'MULTIPLE_CHOICE',
            value: ['opt1'],
            options: [{ id: 'opt1', text: 'LinkedIn' }]
          },
          {
            key: 'q6',
            label: 'Ocupação atual',
            type: 'MULTIPLE_CHOICE',
            value: ['opt2'],
            options: [{ id: 'opt2', text: 'Desenvolvedor' }]
          },
          {
            key: 'q7',
            label: 'Faixa de faturamento mensal do seu negócio/operação',
            type: 'MULTIPLE_CHOICE',
            value: ['opt3'],
            options: [{ id: 'opt3', text: 'R$ 10k - R$ 50k' }]
          },
          {
            key: 'q8',
            label: 'Qual seu principal objetivo nos próximos 90 dias?',
            type: 'TEXTAREA',
            value: 'Testar E2E'
          },
          {
            key: 'q9',
            label: 'Por que BuildZero faz sentido pro seu momento atual e por que devemos te aceitar na comunidade?',
            type: 'TEXTAREA',
            value: 'Teste E2E de integração'
          }
        ]
      }
    }

    // Create execution directly in database (skip webhook/QStash for local testing)
    const execution = await db.execution.create({
      data: {
        workflowId: 'tally-to-clickup',
        userId: testUserId!,
        status: 'RUNNING',
        currentNodeIndex: 0
      }
    })

    testExecutionId = execution.id
    console.log(`   ✅ Execution criada: ${execution.id}`)

    // ============================================
    // STEP 2: Verify execution was created
    // ============================================
    console.log('\n2️⃣ Verificando execution criada...')

    expect(execution.status).toBe('RUNNING')
    expect(execution.currentNodeIndex).toBe(0)
    expect(execution.workflowId).toBe('tally-to-clickup')
    expect(execution.userId).toBe(testUserId)

    console.log(`   📊 Status: ${execution.status}`)
    console.log(`   📍 Node: ${execution.currentNodeIndex}`)

    // ============================================
    // STEP 3: Simulate QStash calling worker (Node 0)
    // ============================================
    console.log('\n3️⃣ Simulando QStash → Worker (Node 0)...')

    const node0Response = await fetch(`${BASE_URL}/api/workers/execute-node`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        executionId: testExecutionId,
        nodeIndex: 0,
        input: { data: webhookPayload, itemIndex: 0 }
      })
    })

    const node0Data = await node0Response.json()
    console.log('   📡 Response:', node0Data)
    console.log('   📊 Status:', node0Response.status)

    expect(node0Response.ok).toBe(true)

    console.log('   ✅ Node 0 executado')
    console.log(`   📝 Próximo node: ${node0Data.nextNodeIndex}`)

    // ============================================
    // STEP 4: Execute remaining nodes (1, 2, 3)
    // ============================================
    let currentNodeIndex = 1
    let previousOutput = node0Data.output

    while (currentNodeIndex < 4) {
      console.log(`\n${currentNodeIndex + 3}️⃣ Executando Node ${currentNodeIndex}...`)

      const nodeResponse = await fetch(`${BASE_URL}/api/workers/execute-node`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          executionId: testExecutionId,
          nodeIndex: currentNodeIndex,
          input: { data: previousOutput, itemIndex: 0 }
        })
      })

      expect(nodeResponse.ok).toBe(true)
      const nodeData = await nodeResponse.json()

      console.log(`   ✅ Node ${currentNodeIndex} executado`)
      console.log(`   📝 Status: ${nodeData.status}`)

      previousOutput = nodeData.output
      currentNodeIndex++

      // Small delay to avoid race conditions
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // ============================================
    // STEP 5: Verify final state
    // ============================================
    console.log('\n5️⃣ Verificando estado final...')

    const finalExecution = await db.execution.findUnique({
      where: { id: testExecutionId ?? undefined },
      include: {
        logs: {
          orderBy: { nodeIndex: 'asc' }
        }
      }
    })

    expect(finalExecution).toBeDefined()
    expect(finalExecution?.status).toBe('COMPLETED')
    expect(finalExecution?.currentNodeIndex).toBe(3)
    expect(finalExecution?.logs).toBeDefined()
    expect(finalExecution?.logs.length).toBe(4)

    console.log(`\n✅ TESTE COMPLETO!`)
    console.log(`   📊 Status Final: ${finalExecution?.status}`)
    console.log(`   📍 Node Final: ${finalExecution?.currentNodeIndex}`)
    console.log(`   📝 Total de Logs: ${finalExecution?.logs.length}`)

    console.log('\n📋 LOGS:')
    finalExecution?.logs.forEach((log: { nodeName: string; status: string }, i: number) => {
      console.log(`   [${i + 1}] ${log.nodeName} - ${log.status}`)
    })

    // Verify all logs are SUCCESS
    const allSuccess = finalExecution?.logs.every((log: { status: string }) => log.status === 'SUCCESS')
    expect(allSuccess).toBe(true)
  }, 60000) // 60 second timeout for E2E test
})
