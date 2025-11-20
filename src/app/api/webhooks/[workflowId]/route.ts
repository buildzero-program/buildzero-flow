import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { db } from '~/lib/db'
import { qstash } from '~/lib/qstash'
import { getWorkflow } from '~/workflows/registry'

/**
 * Webhook endpoint (user-based tenancy with ownerEmails validation)
 * POST /api/webhooks/[workflowId]
 *
 * Validates workflow exists in code registry and creates execution for first owner
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const { workflowId } = await params

    // 1. Get workflow from code registry
    const workflow = getWorkflow(workflowId)

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    // 2. Find first owner user in database
    // Webhook creates execution for the first owner in the list
    const firstOwnerEmail = workflow.ownerEmails[0]
    const user = await db.user.findUnique({
      where: { email: firstOwnerEmail }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'No workflow owner found in database' },
        { status: 404 }
      )
    }

    // 3. Parse webhook payload
    const payload = await req.json()

    // 4. Create execution
    const execution = await db.execution.create({
      data: {
        workflowId: workflow.id,
        userId: user.id,
        status: 'RUNNING',
        currentNodeIndex: 0
      }
    })

    // 5. Enqueue first node execution in QStash
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    await qstash.publishJSON({
      url: `${baseUrl}/api/workers/execute-node`,
      body: {
        executionId: execution.id,
        nodeIndex: 0,
        input: { data: payload, itemIndex: 0 }
      }
    })

    return NextResponse.json({
      success: true,
      executionId: execution.id,
      workflowId: workflow.id
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
