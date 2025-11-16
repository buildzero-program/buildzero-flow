import { Workflow } from '~/lib/workflow-engine/Workflow'
import { TriggerNode } from '~/lib/workflow-engine/nodes/TriggerNode'
import { NormalizeNode } from '~/lib/workflow-engine/nodes/NormalizeNode'
import { HttpNode } from '~/lib/workflow-engine/nodes/HttpNode'
import crypto from 'crypto'

export const stripeToMetaPixel = new Workflow({
  id: 'stripe-to-meta-pixel',
  name: 'Stripe → Meta Pixel',
  description: 'Recebe webhooks do Stripe e envia eventos de conversão para Meta Conversions API',
  nodes: [
    // Node 0: Receive Stripe webhook
    new TriggerNode({
      id: 'trigger',
      name: 'Stripe Webhook'
    }),

    // Node 1: Transform Stripe data → Meta Conversions API format
    new NormalizeNode({
      id: 'normalize',
      name: 'Normalize Data',
      transform: (input, context) => {
        context.logger('Normalizing Stripe webhook data')

        const session = input.data.data?.object || {}
        const email = session.customer_details?.email || ''

        // Hash email with SHA256 (Meta requirement)
        const emailHash = email
          ? crypto.createHash('sha256')
              .update(email.toLowerCase().trim())
              .digest('hex')
          : ''

        const eventTime = session.created || Math.floor(Date.now() / 1000)
        const value = session.amount_total ? session.amount_total / 100 : 0 // Convert cents to currency
        const currency = session.currency?.toUpperCase() || 'USD'

        context.logger(`Processed purchase: ${email} - ${currency} ${value}`)

        return {
          event_name: 'Purchase',
          event_time: eventTime,
          event_id: session.id, // Unique ID for deduplication
          action_source: 'website',
          user_data: {
            em: emailHash,
            client_ip_address: session.metadata?.client_ip_address || '',
            client_user_agent: session.metadata?.client_user_agent || ''
          },
          custom_data: {
            currency,
            value,
            order_id: session.id
          }
        }
      }
    }),

    // Node 2: Send event to Meta Conversions API
    new HttpNode({
      id: 'send-to-meta',
      name: 'Send to Meta Conversions API',
      method: 'POST',
      url: 'https://graph.facebook.com/v19.0/YOUR_PIXEL_ID/events', // TODO: Replace YOUR_PIXEL_ID
      headers: (context) => ({
        'Content-Type': 'application/json'
      }),
      body: (input, context) => {
        const event = input.data
        context.logger(`Sending ${event.event_name} event to Meta Pixel`)

        return {
          data: [event],
          access_token: context.secrets.META_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN'
        }
      }
    })
  ]
})
