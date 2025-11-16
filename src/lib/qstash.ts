import { Client } from '@upstash/qstash'

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!
})

export async function enqueueNode(payload: {
  executionId: string
  nodeIndex: number
  input: any
}) {
  // Use custom domain in production, localhost in dev
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://flow.buildzero.ai'
    : 'http://localhost:3000'

  const url = `${baseUrl}/api/workers/execute-node`

  console.log(`[QStash] Enqueuing node ${payload.nodeIndex} for execution ${payload.executionId} to ${url}`)

  try {
    const result = await qstash.publishJSON({
      url,
      body: payload,
      retries: 3
    })
    console.log(`[QStash] Successfully enqueued:`, result)
    return result
  } catch (error) {
    console.error(`[QStash] Failed to enqueue:`, error)
    throw error
  }
}
