import { testWorkflow } from './test-workflow'
import type { Workflow } from '~/lib/workflow-engine/Workflow'

const workflows: Record<string, Workflow> = {
  'test-workflow': testWorkflow
}

export function getWorkflow(id: string): Workflow | undefined {
  return workflows[id]
}

export function getAllWorkflows(): Workflow[] {
  return Object.values(workflows)
}
