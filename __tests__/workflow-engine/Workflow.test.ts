import { describe, it, expect } from 'vitest'
import { Workflow } from '~/lib/workflow-engine/Workflow'
import { Node } from '~/lib/workflow-engine/Node'
import type { Item, NodeExecutionContext } from '~/lib/workflow-engine/types'

// Mock node for testing
class MockNode extends Node {
  async execute(input: Item, context: NodeExecutionContext) {
    return input.data
  }
}

describe('Workflow', () => {
  it('should create workflow with id and nodes', () => {
    const mockNode = new MockNode({ id: 'mock', name: 'Mock Node' })

    const workflow = new Workflow({
      id: 'test-workflow',
      name: 'Test Workflow',
      ownerEmails: ['test@example.com'],
      nodes: [mockNode]
    })

    expect(workflow.id).toBe('test-workflow')
    expect(workflow.name).toBe('Test Workflow')
    expect(workflow.ownerEmails).toEqual(['test@example.com'])
    expect(workflow.nodes).toHaveLength(1)
    expect(workflow.nodes[0]).toBe(mockNode)
  })

  it('should throw error if no nodes provided', () => {
    expect(() => {
      new Workflow({
        id: 'test',
        name: 'Test',
        nodes: []
      })
    }).toThrow('Workflow must have at least one node')
  })

  it('should accept optional description', () => {
    const mockNode = new MockNode({ id: 'mock', name: 'Mock' })

    const workflow = new Workflow({
      id: 'test',
      name: 'Test',
      description: 'Test description',
      ownerEmails: ['owner@test.com'],
      nodes: [mockNode]
    })

    expect(workflow.description).toBe('Test description')
  })
})
