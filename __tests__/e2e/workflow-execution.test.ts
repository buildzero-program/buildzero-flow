import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { db } from '~/lib/db'

// Mock QStash
vi.mock('~/lib/qstash', () => ({
  enqueueNode: vi.fn().mockResolvedValue(undefined)
}))

describe.sequential('E2E: Full Workflow Execution', () => {
  beforeEach(async () => {
    await db.executionLog.deleteMany()
    await db.execution.deleteMany()
  })

  afterEach(async () => {
    await db.executionLog.deleteMany()
    await db.execution.deleteMany()
  })

  it('should execute a complete workflow from webhook to completion', async () => {
    // Step 1: Trigger workflow via webhook
    const { POST: WebhookPOST } = await import('~/app/api/webhooks/[workflowId]/route')

    const webhookRequest = new Request('http://localhost:3000/api/webhooks/test-workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: 'test@example.com' })
    })

    const webhookResponse = await WebhookPOST(webhookRequest, {
      params: { workflowId: 'test-workflow' }
    })

    expect(webhookResponse.status).toBe(200)
    const { executionId } = await webhookResponse.json()
    expect(executionId).toBeDefined()

    // Verify execution was created
    let execution = await db.execution.findUnique({
      where: { id: executionId }
    })
    expect(execution).toBeDefined()
    expect(execution?.status).toBe('RUNNING')
    expect(execution?.currentNodeIndex).toBe(0)

    // Step 2: Execute the trigger node (simulating QStash worker)
    const { POST: WorkerPOST } = await import('~/app/api/workers/execute-node/route')

    const workerRequest = new Request('http://localhost:3000/api/workers/execute-node', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        executionId,
        nodeIndex: 0,
        input: { data: { name: 'Test User', email: 'test@example.com' }, itemIndex: 0 }
      })
    })

    const workerResponse = await WorkerPOST(workerRequest)
    expect(workerResponse.status).toBe(200)

    // Give DB time to process
    await new Promise(resolve => setTimeout(resolve, 50))

    // Step 3: Verify execution is completed (test-workflow has only 1 node)
    execution = await db.execution.findUnique({
      where: { id: executionId }
    })
    expect(execution?.status).toBe('COMPLETED')
    expect(execution?.finishedAt).toBeDefined()

    // Step 4: Verify execution log was created
    const logs = await db.executionLog.findMany({
      where: { executionId },
      orderBy: { startedAt: 'asc' }
    })

    expect(logs).toHaveLength(1)
    expect(logs[0]?.nodeIndex).toBe(0)
    expect(logs[0]?.nodeId).toBe('trigger')
    expect(logs[0]?.status).toBe('SUCCESS')
    expect(logs[0]?.output).toBeDefined()
    expect(logs[0]?.durationMs).toBeGreaterThan(0)
    expect(logs[0]?.error).toBeNull()
  })
})
