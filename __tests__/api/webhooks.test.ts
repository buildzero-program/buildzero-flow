import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { db } from '~/lib/db'

// Mock QStash
vi.mock('~/lib/qstash', () => ({
  enqueueNode: vi.fn().mockResolvedValue(undefined)
}))

describe.sequential('POST /api/webhooks/[workflowId]', () => {
  // Cleanup
  afterEach(async () => {
    await db.executionLog.deleteMany()
    await db.execution.deleteMany()
  })

  it('should create execution and return 200', async () => {
    // Import the route handler
    const { POST } = await import('~/app/api/webhooks/[workflowId]/route')

    const request = new Request('http://localhost:3000/api/webhooks/test-workflow', {
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

    // Verify execution was created
    const execution = await db.execution.findUnique({
      where: { id: body.executionId }
    })

    expect(execution).toBeDefined()
    expect(execution?.workflowId).toBe('test-workflow')
    expect(execution?.status).toBe('RUNNING')
    expect(execution?.currentNodeIndex).toBe(0)
  })

  it('should return 404 if workflow not found', async () => {
    const { POST } = await import('~/app/api/webhooks/[workflowId]/route')

    const request = new Request('http://localhost:3000/api/webhooks/nonexistent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })

    const response = await POST(request, {
      params: { workflowId: 'nonexistent' }
    })

    expect(response.status).toBe(404)

    const body = await response.json()
    expect(body.error).toBe('Workflow not found')
  })

  it('should handle empty payload', async () => {
    const { POST } = await import('~/app/api/webhooks/[workflowId]/route')

    const request = new Request('http://localhost:3000/api/webhooks/test-workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })

    const response = await POST(request, {
      params: { workflowId: 'test-workflow' }
    })

    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.executionId).toBeDefined()
  })
})
