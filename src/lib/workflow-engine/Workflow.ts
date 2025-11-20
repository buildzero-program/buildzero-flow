import type { Node } from './Node'

export interface WorkflowConfig {
  id: string
  name: string
  description?: string
  ownerEmails: string[]
  nodes: Node[]
}

export class Workflow {
  id: string
  name: string
  description?: string
  ownerEmails: string[]
  nodes: Node[]

  constructor(config: WorkflowConfig) {
    if (!config.nodes || config.nodes.length === 0) {
      throw new Error('Workflow must have at least one node')
    }

    if (!config.ownerEmails || config.ownerEmails.length === 0) {
      throw new Error('Workflow must have at least one owner email')
    }

    this.id = config.id
    this.name = config.name
    this.description = config.description
    this.ownerEmails = config.ownerEmails
    this.nodes = config.nodes
  }

  /**
   * Check if a user has access to this workflow
   */
  hasAccess(userEmail: string): boolean {
    return this.ownerEmails.includes(userEmail)
  }
}
