import { Node, type NodeConfig } from '../Node'
import type { Item, NodeExecutionContext } from '../types'

export interface HttpNodeConfig extends NodeConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string | ((context: NodeExecutionContext) => string)
  headers?: (context: NodeExecutionContext) => Record<string, string>
  body?: (input: Item, context: NodeExecutionContext) => any
}

export class HttpNode extends Node {
  private method: string
  private url: string | ((context: NodeExecutionContext) => string)
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

    // Resolve URL: if function, call it with context; if string, use as is
    const url = typeof this.url === 'function' ? this.url(context) : this.url

    context.logger(`Making ${this.method} request to ${url}`)

    const response = await fetch(url, {
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
