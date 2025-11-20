import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { db } from '~/lib/db'

// Mock QStash
vi.mock('~/lib/qstash', () => ({
  enqueueNode: vi.fn().mockResolvedValue(undefined)
}))

describe.sequential('POST /api/workers/execute-node', () => {
  // Cleanup after each test
  afterEach(async () => {
    await db.executionLog.deleteMany()
    await db.execution.deleteMany()
    await db.user.deleteMany()
  })

  it('should execute node and create log', async () => {
    // Setup: create user first
    const user = await db.user.create({
      data: {
        email: 'test@test.com',
        clerkUserId: 'user_test_123'
      }
    })

    // Setup: create execution
    const execution = await db.execution.create({
      data: {
        workflowId: 'test-workflow',
        status: 'RUNNING',
        currentNodeIndex: 0,
        userId: user.id
      }
    })

    const { POST } = await import('~/app/api/workers/execute-node/route')

    const request = new Request('http://localhost:3000/api/workers/execute-node', {
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

    // Give DB a moment to process
    await new Promise(resolve => setTimeout(resolve, 50))

    // Verify log was created
    const logs = await db.executionLog.findMany({
      where: { executionId: execution.id }
    })

    expect(logs).toHaveLength(1)
    expect(logs[0]?.nodeIndex).toBe(0)
    expect(logs[0]?.nodeId).toBe('trigger')
    expect(logs[0]?.status).toBe('SUCCESS')
    expect(logs[0]?.output).toBeDefined()
    expect(logs[0]?.durationMs).toBeGreaterThan(0)
  })

  it('should mark execution as COMPLETED if last node', async () => {
    // Setup: create user first
    const user = await db.user.create({
      data: {
        email: 'test2@test.com',
        clerkUserId: 'user_test_456'
      }
    })

    const execution = await db.execution.create({
      data: {
        workflowId: 'test-workflow',
        status: 'RUNNING',
        currentNodeIndex: 0,
        userId: user.id
      }
    })

    const { POST } = await import('~/app/api/workers/execute-node/route')

    const request = new Request('http://localhost:3000/api/workers/execute-node', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        executionId: execution.id,
        nodeIndex: 0, // Only 1 node in test-workflow
        input: { data: {}, itemIndex: 0 }
      })
    })

    await POST(request)

    // Give DB a moment to process
    await new Promise(resolve => setTimeout(resolve, 50))

    const updated = await db.execution.findUnique({
      where: { id: execution.id }
    })

    expect(updated).toBeDefined()
    expect(updated?.status).toBe('COMPLETED')
    expect(updated?.finishedAt).toBeDefined()
  })

  it('should handle node execution errors', async () => {
    // Setup: create user first
    const user = await db.user.create({
      data: {
        email: 'test3@test.com',
        clerkUserId: 'user_test_789'
      }
    })

    const execution = await db.execution.create({
      data: {
        workflowId: 'test-workflow',
        status: 'RUNNING',
        currentNodeIndex: 0,
        userId: user.id
      }
    })

    const { POST } = await import('~/app/api/workers/execute-node/route')

    // Pass invalid node index to trigger error
    const request = new Request('http://localhost:3000/api/workers/execute-node', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        executionId: execution.id,
        nodeIndex: 999, // Invalid index
        input: { data: {}, itemIndex: 0 }
      })
    })

    const response = await POST(request)
    expect(response.status).toBe(404)

    const body = await response.json()
    expect(body.error).toBe('Node not found')
  })

  it('should return 404 if execution not found', async () => {
    const { POST } = await import('~/app/api/workers/execute-node/route')

    const request = new Request('http://localhost:3000/api/workers/execute-node', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        executionId: 'nonexistent',
        nodeIndex: 0,
        input: { data: {}, itemIndex: 0 }
      })
    })

    const response = await POST(request)
    expect(response.status).toBe(404)
  })
})
