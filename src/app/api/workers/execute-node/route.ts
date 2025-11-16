import { NextRequest, NextResponse } from 'next/server'
import { db } from '~/lib/db'
import { getWorkflow } from '~/workflows/registry'
import type { NodeExecutionContext } from '~/lib/workflow-engine/types'
import { enqueueNode } from '~/lib/qstash'

export async function POST(req: NextRequest) {
  const { executionId, nodeIndex, input } = await req.json()

  // Find execution
  const execution = await db.execution.findUnique({
    where: { id: executionId }
  })

  if (!execution) {
    return NextResponse.json({ error: 'Execution not found' }, { status: 404 })
  }

  const workflow = getWorkflow(execution.workflowId)
  if (!workflow) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
  }

  const node = workflow.nodes[nodeIndex]
  if (!node) {
    return NextResponse.json({ error: 'Node not found' }, { status: 404 })
  }

  // Create log (RUNNING)
  const startTime = Date.now()
  const log = await db.executionLog.create({
    data: {
      executionId,
      nodeIndex,
      nodeId: node.id,
      nodeName: node.name,
      input,
      status: 'RUNNING',
      startedAt: new Date()
    }
  })

  try {
    // Execute node with context
    const context: NodeExecutionContext = {
      executionId,
      workflowId: execution.workflowId,
      nodeIndex,
      secrets: process.env as Record<string, string>,
      logger: (message: string) => {
        console.log(`[${executionId}][${node.id}] ${message}`)
      }
    }

    const output = await node.execute(input, context)
    const duration = Date.now() - startTime

    // Update log (SUCCESS)
    await db.executionLog.update({
      where: { id: log.id },
      data: {
        output: { data: output, itemIndex: input.itemIndex },
        status: 'SUCCESS',
        finishedAt: new Date(),
        durationMs: duration
      }
    })

    // Is last node?
    const isLastNode = nodeIndex === workflow.nodes.length - 1

    if (isLastNode) {
      // Mark execution as COMPLETED
      await db.execution.update({
        where: { id: executionId },
        data: {
          status: 'COMPLETED',
          finishedAt: new Date()
        }
      })
    } else {
      // Enqueue next node with current node's output
      await enqueueNode({
        executionId,
        nodeIndex: nodeIndex + 1,
        input: { data: output, itemIndex: input.itemIndex }
      })

      await db.execution.update({
        where: { id: executionId },
        data: { currentNodeIndex: nodeIndex + 1 }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    // Update log (FAILED)
    await db.executionLog.update({
      where: { id: log.id },
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'FAILED',
        finishedAt: new Date(),
        durationMs: Date.now() - startTime
      }
    })

    // Mark execution as FAILED
    await db.execution.update({
      where: { id: executionId },
      data: { status: 'FAILED' }
    })

    return NextResponse.json(
      { error: 'Node execution failed' },
      { status: 500 }
    )
  }
}
