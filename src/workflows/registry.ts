import { testWorkflow } from './test-workflow'
import { tallyToClickup } from './tally-to-clickup'
import type { Workflow } from '~/lib/workflow-engine/Workflow'

const workflows: Record<string, Workflow> = {
  'test-workflow': testWorkflow,
  'tally-to-clickup': tallyToClickup
}

export function getWorkflow(id: string): Workflow | undefined {
  return workflows[id]
}

export function getAllWorkflows(): Workflow[] {
  return Object.values(workflows)
}
