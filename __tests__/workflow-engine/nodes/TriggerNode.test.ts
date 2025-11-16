import { describe, it, expect, vi } from 'vitest'
import { TriggerNode } from '~/lib/workflow-engine/nodes/TriggerNode'
import type { NodeExecutionContext } from '~/lib/workflow-engine/types'

describe('TriggerNode', () => {
  it('should return input data as-is', async () => {
    const node = new TriggerNode({
      id: 'trigger',
      name: 'Webhook Trigger'
    })

    const logger = vi.fn()
    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'test',
      nodeIndex: 0,
      secrets: {},
      logger
    }

    const input = {
      data: { name: 'John', email: 'john@test.com' },
      itemIndex: 0
    }

    const output = await node.execute(input, context)

    expect(output).toEqual({ name: 'John', email: 'john@test.com' })
    expect(logger).toHaveBeenCalledWith('Trigger received data')
  })

  it('should work with complex data structures', async () => {
    const node = new TriggerNode({ id: 'trigger', name: 'Test Trigger' })

    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'wf-1',
      nodeIndex: 0,
      secrets: {},
      logger: () => {}
    }

    const complexData = {
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        metadata: {
          source: 'tally',
          formId: 'abc123'
        }
      },
      responses: [
        { question: 'Name', answer: 'John' },
        { question: 'Email', answer: 'john@example.com' }
      ]
    }

    const input = {
      data: complexData,
      itemIndex: 0
    }

    const output = await node.execute(input, context)

    expect(output).toEqual(complexData)
  })

  it('should extend Node class', () => {
    const node = new TriggerNode({ id: 'trigger', name: 'Trigger' })

    expect(node.id).toBe('trigger')
    expect(node.name).toBe('Trigger')
    expect(typeof node.execute).toBe('function')
  })
})
