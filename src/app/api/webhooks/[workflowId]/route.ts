import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { db } from '~/lib/db'
import { getWorkflow } from '~/workflows/registry'
import { enqueueNode } from '~/lib/qstash'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params

  // Validate workflow exists
  const workflow = getWorkflow(workflowId)
  if (!workflow) {
    return NextResponse.json(
      { error: 'Workflow not found' },
      { status: 404 }
    )
  }

  // Get payload
  const payload = await req.json()

  // Create execution
  const execution = await db.execution.create({
    data: {
      workflowId,
      status: 'RUNNING',
      currentNodeIndex: 0
    }
  })

  // Enqueue first node in QStash
  await enqueueNode({
    executionId: execution.id,
    nodeIndex: 0,
    input: { data: payload, itemIndex: 0 }
  })

  return NextResponse.json({ executionId: execution.id })
}
