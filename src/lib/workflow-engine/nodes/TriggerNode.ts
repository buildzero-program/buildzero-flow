import { Node } from '../Node'
import type { Item, NodeExecutionContext } from '../types'

export class TriggerNode extends Node {
  async execute(input: Item, context: NodeExecutionContext): Promise<Record<string, any>> {
    context.logger('Trigger received data')
    return input.data
  }
}
