import type { Node } from './Node'

export interface WorkflowConfig {
  id: string
  name: string
  description?: string
  nodes: Node[]
}

export class Workflow {
  id: string
  name: string
  description?: string
  nodes: Node[]

  constructor(config: WorkflowConfig) {
    if (!config.nodes || config.nodes.length === 0) {
      throw new Error('Workflow must have at least one node')
    }

    this.id = config.id
    this.name = config.name
    this.description = config.description
    this.nodes = config.nodes
  }
}
