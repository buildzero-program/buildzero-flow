import { testWorkflow } from './test-workflow'
import { tallyToClickup } from './tally-to-clickup'
import { stripeToMetaPixel } from './stripe-to-meta-pixel'
import { leadSignupToMetaPixel } from './lead-signup-to-meta-pixel'
import type { Workflow } from '~/lib/workflow-engine/Workflow'

const workflows: Record<string, Workflow> = {
  'test-workflow': testWorkflow,
  'tally-to-clickup': tallyToClickup,
  'stripe-to-meta-pixel': stripeToMetaPixel,
  'lead-signup-to-meta-pixel': leadSignupToMetaPixel
}

export function getWorkflow(id: string): Workflow | undefined {
  return workflows[id]
}

export function getAllWorkflows(): Workflow[] {
  return Object.values(workflows)
}
