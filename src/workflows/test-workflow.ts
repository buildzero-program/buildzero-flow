import { Workflow } from '~/lib/workflow-engine/Workflow'
import { TriggerNode } from '~/lib/workflow-engine/nodes/TriggerNode'

export const testWorkflow = new Workflow({
  id: 'test-workflow',
  name: 'Test Workflow',
  description: 'Simple workflow for testing infrastructure',
  ownerEmails: ['pedrohnas0@gmail.com'],
  nodes: [
    new TriggerNode({
      id: 'trigger',
      name: 'Test Trigger'
    })
  ]
})
