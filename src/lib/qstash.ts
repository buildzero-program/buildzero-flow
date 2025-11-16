import { Client } from '@upstash/qstash'

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!
})

export async function enqueueNode(payload: {
  executionId: string
  nodeIndex: number
  input: any
}) {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  const url = `${baseUrl}/api/workers/execute-node`

  await qstash.publishJSON({
    url,
    body: payload,
    retries: 3
  })
}
