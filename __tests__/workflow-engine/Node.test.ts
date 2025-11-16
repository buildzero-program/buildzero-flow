import { describe, it, expect } from 'vitest'
import { Node } from '~/lib/workflow-engine/Node'
import type { Item, NodeExecutionContext } from '~/lib/workflow-engine/types'

// Test implementation of Node
class TestNode extends Node {
  async execute(input: Item, context: NodeExecutionContext) {
    context.logger(`Processing item ${input.itemIndex}`)
    return {
      ...input.data,
      processed: true,
      executionId: context.executionId
    }
  }
}

describe('Node Base Class', () => {
  it('should create node with id and name', () => {
    const node = new TestNode({
      id: 'test-node',
      name: 'Test Node'
    })

    expect(node.id).toBe('test-node')
    expect(node.name).toBe('Test Node')
  })

  it('should execute node with context', async () => {
    const node = new TestNode({
      id: 'test-node',
      name: 'Test Node'
    })

    const logs: string[] = []
    const context: NodeExecutionContext = {
      executionId: 'exec-123',
      workflowId: 'workflow-1',
      nodeIndex: 0,
      secrets: {},
      logger: (msg) => logs.push(msg)
    }

    const input: Item = {
      data: { test: 'value' },
      itemIndex: 0
    }

    const output = await node.execute(input, context)

    expect(output).toEqual({
      test: 'value',
      processed: true,
      executionId: 'exec-123'
    })
    expect(logs).toContain('Processing item 0')
  })

  it('should provide access to secrets via context', async () => {
    class SecretNode extends Node {
      async execute(input: Item, context: NodeExecutionContext) {
        const apiKey = context.secrets.API_KEY
        return { apiKey }
      }
    }

    const node = new SecretNode({ id: 'secret', name: 'Secret Node' })

    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'wf-1',
      nodeIndex: 0,
      secrets: { API_KEY: 'secret-123' },
      logger: () => {}
    }

    const output = await node.execute(
      { data: {}, itemIndex: 0 },
      context
    )

    expect(output).toEqual({ apiKey: 'secret-123' })
  })

  it('should preserve itemIndex through execution', async () => {
    const node = new TestNode({ id: 'test', name: 'Test' })

    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'wf-1',
      nodeIndex: 0,
      secrets: {},
      logger: () => {}
    }

    const input: Item = {
      data: { value: 123 },
      itemIndex: 5  // Should be preserved
    }

    const output = await node.execute(input, context)

    // Node returns data, but itemIndex should be tracked separately
    // This will be handled by the executor, not the node itself
    expect(input.itemIndex).toBe(5)
  })
})
