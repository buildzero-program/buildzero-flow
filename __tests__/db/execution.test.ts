import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { db } from '~/lib/db'

describe('Execution Model', () => {
  // Cleanup after each test
  afterEach(async () => {
    await db.executionLog.deleteMany()
    await db.execution.deleteMany()
  })

  it('should create execution with RUNNING status', async () => {
    const execution = await db.execution.create({
      data: {
        workflowId: 'test-workflow',
        status: 'RUNNING',
        currentNodeIndex: 0
      }
    })

    expect(execution.id).toBeDefined()
    expect(execution.status).toBe('RUNNING')
    expect(execution.workflowId).toBe('test-workflow')
    expect(execution.currentNodeIndex).toBe(0)
    expect(execution.startedAt).toBeInstanceOf(Date)
    expect(execution.finishedAt).toBeNull()
  })

  it('should create execution log linked to execution', async () => {
    const execution = await db.execution.create({
      data: { workflowId: 'test', status: 'RUNNING' }
    })

    const log = await db.executionLog.create({
      data: {
        executionId: execution.id,
        nodeIndex: 0,
        nodeId: 'trigger',
        nodeName: 'Test Trigger',
        input: { data: { test: true }, itemIndex: 0 },
        status: 'RUNNING'
      }
    })

    expect(log.executionId).toBe(execution.id)
    expect(log.nodeIndex).toBe(0)
    expect(log.nodeId).toBe('trigger')
    expect(log.input).toEqual({ data: { test: true }, itemIndex: 0 })
    expect(log.status).toBe('RUNNING')
  })

  it('should update execution status to COMPLETED', async () => {
    const execution = await db.execution.create({
      data: { workflowId: 'test', status: 'RUNNING' }
    })

    const updated = await db.execution.update({
      where: { id: execution.id },
      data: {
        status: 'COMPLETED',
        finishedAt: new Date()
      }
    })

    expect(updated.status).toBe('COMPLETED')
    expect(updated.finishedAt).toBeInstanceOf(Date)
  })

  it('should cascade delete logs when execution is deleted', async () => {
    const execution = await db.execution.create({
      data: { workflowId: 'test', status: 'RUNNING' }
    })

    await db.executionLog.create({
      data: {
        executionId: execution.id,
        nodeIndex: 0,
        nodeId: 'test',
        nodeName: 'Test',
        input: {},
        status: 'RUNNING'
      }
    })

    // Delete execution
    await db.execution.delete({ where: { id: execution.id } })

    // Logs should be deleted too (cascade)
    const logs = await db.executionLog.findMany({
      where: { executionId: execution.id }
    })

    expect(logs).toHaveLength(0)
  })
})
