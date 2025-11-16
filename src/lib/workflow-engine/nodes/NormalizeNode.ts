import { Node, type NodeConfig } from '../Node'
import type { Item, NodeExecutionContext } from '../types'

export interface NormalizeNodeConfig extends NodeConfig {
  transform: (input: Item, context: NodeExecutionContext) => Record<string, any>
}

export class NormalizeNode extends Node {
  private transform: (input: Item, context: NodeExecutionContext) => Record<string, any>

  constructor(config: NormalizeNodeConfig) {
    super(config)
    this.transform = config.transform
  }

  async execute(input: Item, context: NodeExecutionContext): Promise<Record<string, any>> {
    return this.transform(input, context)
  }
}
