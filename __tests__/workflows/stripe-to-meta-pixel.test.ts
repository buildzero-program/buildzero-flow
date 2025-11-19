import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NormalizeNode } from '~/lib/workflow-engine/nodes/NormalizeNode'
import { HttpNode } from '~/lib/workflow-engine/nodes/HttpNode'
import type { Item, NodeExecutionContext } from '~/lib/workflow-engine/types'
import crypto from 'crypto'

describe('Stripe → Meta Pixel Workflow', () => {
  let context: NodeExecutionContext

  beforeEach(() => {
    context = {
      executionId: 'test-exec-123',
      workflowId: 'stripe-to-meta-pixel',
      nodeIndex: 0,
      logger: vi.fn(),
      secrets: {
        META_PIXEL_ID: 'YOUR_PIXEL_ID',
        META_ACCESS_TOKEN: 'YOUR_ACCESS_TOKEN'
      }
    }
  })

  describe('NormalizeNode: Stripe → Meta format', () => {
    it('should transform Stripe checkout.session.completed to Meta Conversions API format', async () => {
      const stripeWebhook: Item = {
        data: {
          id: 'evt_test123',
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_123abc',
              amount_total: 29700, // cents
              currency: 'brl',
              customer_details: {
                email: 'test@example.com',
                name: 'Pedro Silva'
              },
              metadata: {
                client_ip_address: '191.235.123.45',
                client_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
              },
              created: 1234567890
            }
          }
        },
        itemIndex: 0
      }

      const node = new NormalizeNode({
        id: 'normalize-stripe',
        name: 'Stripe to Meta',
        transform: (input, context) => {
          context.logger('Normalizing Stripe webhook data')

          const session = input.data.data.object
          const email = session.customer_details?.email || ''

          // Hash email with SHA256 (Meta requirement)
          const emailHash = crypto.createHash('sha256')
            .update(email.toLowerCase().trim())
            .digest('hex')

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
      })

      const result = await node.execute(stripeWebhook, context)

      // Verify structure
      expect(result.event_name).toBe('Purchase')
      expect(result.event_time).toBe(1234567890)
      expect(result.event_id).toBe('cs_test_123abc')
      expect(result.action_source).toBe('website')

      // Verify user_data (email should be hashed)
      expect(result.user_data.em).toBe(
        crypto.createHash('sha256').update('test@example.com').digest('hex')
      )
      expect(result.user_data.client_ip_address).toBe('191.235.123.45')

      // Verify custom_data
      expect(result.custom_data.currency).toBe('BRL')
      expect(result.custom_data.value).toBe(297.00)
      expect(result.custom_data.order_id).toBe('cs_test_123abc')
    })
  })

  describe('HttpNode: Send to Meta Conversions API', () => {
    it('should send event to Meta Conversions API with correct format', async () => {
      const normalizedData: Item = {
        data: {
          event_name: 'Purchase',
          event_time: 1234567890,
          event_id: 'cs_test_123abc',
          action_source: 'website',
          user_data: {
            em: 'hashed_email_sha256',
            client_ip_address: '191.235.123.45',
            client_user_agent: 'Mozilla/5.0'
          },
          custom_data: {
            currency: 'BRL',
            value: 297.00,
            order_id: 'cs_test_123abc'
          }
        },
        itemIndex: 0
      }

      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ events_received: 1, messages: [], fbtrace_id: 'test123' })
      })

      const node = new HttpNode({
        id: 'send-to-meta',
        name: 'Send to Meta Conversions API',
        method: 'POST',
        url: (context) => {
          const pixelId = context.secrets.META_PIXEL_ID || ''
          return `https://graph.facebook.com/v19.0/${pixelId}/events`
        },
        headers: () => ({
          'Content-Type': 'application/json'
        }),
        body: (input, context) => {
          const event = input.data
          context.logger(`Sending ${event.event_name} event to Meta Pixel`)

          return {
            data: [event],
            access_token: context.secrets.META_ACCESS_TOKEN || ''
          }
        }
      })

      const result = await node.execute(normalizedData, context)

      // Verify request was made
      expect(global.fetch).toHaveBeenCalledWith(
        'https://graph.facebook.com/v19.0/YOUR_PIXEL_ID/events',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      )

      // Verify request body structure
      const fetchCall = (global.fetch as any).mock.calls[0]
      const body = JSON.parse(fetchCall[1].body)

      expect(body.data).toHaveLength(1)
      expect(body.data[0].event_name).toBe('Purchase')
      expect(body.data[0].user_data.em).toBe('hashed_email_sha256')
      expect(body.data[0].custom_data.value).toBe(297.00)
      expect(body.access_token).toBe('YOUR_ACCESS_TOKEN')

      // Verify response
      expect(result.events_received).toBe(1)
    })
  })
})
