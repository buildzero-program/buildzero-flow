import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '~/lib/db'
import { getAllWorkflows } from '~/workflows/registry'

/**
 * GET /api/workflows/list
 * Returns all workflows for the authenticated user with webhook URLs
 * Workflows are filtered from code registry by ownerEmails
 */
export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find user in database
  const user = await db.user.findUnique({
    where: { clerkUserId: userId }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Get user's workflows from code registry (filter by ownerEmails)
  const allWorkflows = getAllWorkflows()
  const userWorkflows = allWorkflows.filter(wf => wf.hasAccess(user.email))

  // Build webhook URLs
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  const workflowsWithWebhooks = userWorkflows.map(wf => ({
    id: wf.id,
    name: wf.name,
    description: wf.description,
    isActive: true, // Workflows in code are always active
    webhookUrl: `${baseUrl}/api/webhooks/${wf.id}`
  }))

  return NextResponse.json({
    user: {
      email: user.email,
      name: user.name
    },
    workflows: workflowsWithWebhooks
  })
}
