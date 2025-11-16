import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock publishJSON function that we can spy on
const mockPublishJSON = vi.fn().mockResolvedValue({ messageId: 'test-msg-id' })

// Mock QStash SDK
vi.mock('@upstash/qstash', () => {
  return {
    Client: class MockClient {
      publishJSON = mockPublishJSON
    }
  }
})

describe('QStash Client', () => {
  beforeEach(() => {
    // Mock environment variables
    process.env.QSTASH_TOKEN = 'test-token'
    process.env.VERCEL_URL = 'test.vercel.app'
    vi.clearAllMocks()
  })

  it('should have enqueueNode function', async () => {
    const { enqueueNode } = await import('~/lib/qstash')
    expect(typeof enqueueNode).toBe('function')
  })

  it('should call QStash publishJSON with correct parameters', async () => {
    const { enqueueNode } = await import('~/lib/qstash')

    await enqueueNode({
      executionId: 'exec-123',
      nodeIndex: 1,
      input: { data: { test: true }, itemIndex: 0 }
    })

    expect(mockPublishJSON).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/api/workers/execute-node'),
        body: {
          executionId: 'exec-123',
          nodeIndex: 1,
          input: { data: { test: true }, itemIndex: 0 }
        },
        retries: 3
      })
    )
  })
})
