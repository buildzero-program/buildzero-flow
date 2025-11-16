import type { Item, NodeExecutionContext } from './types'

export interface NodeConfig {
  id: string
  name: string
}

export abstract class Node {
  id: string
  name: string

  constructor(config: NodeConfig) {
    this.id = config.id
    this.name = config.name
  }

  abstract execute(
    input: Item,
    context: NodeExecutionContext
  ): Promise<Record<string, any>>
}
