import { Node, type NodeConfig } from '../Node'
import type { Item, NodeExecutionContext } from '../types'

export interface CodeNodeConfig extends NodeConfig {
  /**
   * Custom JavaScript function to execute
   * Receives: input (data from previous node), context (secrets, logger)
   * Returns: any object (will be passed to next node)
   */
  execute: (input: Item, context: NodeExecutionContext) => Promise<Record<string, any>> | Record<string, any>
}

export class CodeNode extends Node {
  private executeFn: (input: Item, context: NodeExecutionContext) => Promise<Record<string, any>> | Record<string, any>

  constructor(config: CodeNodeConfig) {
    super(config)
    this.executeFn = config.execute
  }

  async execute(input: Item, context: NodeExecutionContext): Promise<Record<string, any>> {
    return await this.executeFn(input, context)
  }
}
