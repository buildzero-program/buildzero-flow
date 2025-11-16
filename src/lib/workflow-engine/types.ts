export interface Item {
  data: Record<string, any>
  itemIndex: number
}

export interface NodeExecutionContext {
  executionId: string
  workflowId: string
  nodeIndex: number
  secrets: Record<string, string>
  logger: (message: string) => void
}
