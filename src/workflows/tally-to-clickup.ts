import { Workflow } from '~/lib/workflow-engine/Workflow'
import { TriggerNode } from '~/lib/workflow-engine/nodes/TriggerNode'

export const tallyToClickup = new Workflow({
  id: 'tally-to-clickup',
  name: 'Tally → ClickUp',
  description: 'Captura aplicações do Tally e cria tasks no ClickUp',
  nodes: [
    new TriggerNode({
      id: 'trigger',
      name: 'Tally Webhook'
    })
  ]
})
