import { Node, type NodeConfig } from '../Node'
import type { Item, NodeExecutionContext } from '../types'

export interface HttpNodeConfig extends NodeConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  headers?: (context: NodeExecutionContext) => Record<string, string>
  body?: (input: Item, context: NodeExecutionContext) => any
}

export class HttpNode extends Node {
  private method: string
  private url: string
  private headersFn?: (context: NodeExecutionContext) => Record<string, string>
  private bodyFn?: (input: Item, context: NodeExecutionContext) => any

  constructor(config: HttpNodeConfig) {
    super(config)
    this.method = config.method
    this.url = config.url
    this.headersFn = config.headers
    this.bodyFn = config.body
  }

  async execute(input: Item, context: NodeExecutionContext): Promise<Record<string, any>> {
    const headers = this.headersFn ? this.headersFn(context) : {}
    const body = this.bodyFn ? this.bodyFn(input, context) : undefined

    context.logger(`Making ${this.method} request to ${this.url}`)

    const response = await fetch(this.url, {
      method: this.method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `HTTP request failed: ${response.status} ${response.statusText} - ${errorText}`
      )
    }

    const data = await response.json()
    context.logger(`Request successful, received response`)

    return data
  }
}
