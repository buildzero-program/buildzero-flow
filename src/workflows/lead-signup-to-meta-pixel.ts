import { Workflow } from '~/lib/workflow-engine/Workflow'
import { TriggerNode } from '~/lib/workflow-engine/nodes/TriggerNode'
import { NormalizeNode } from '~/lib/workflow-engine/nodes/NormalizeNode'
import { HttpNode } from '~/lib/workflow-engine/nodes/HttpNode'
import crypto from 'crypto'

export const leadSignupToMetaPixel = new Workflow({
  id: 'lead-signup-to-meta-pixel',
  name: 'Lead Signup → Meta Pixel',
  description: 'Recebe cadastros de leads da LP e envia eventos para Meta Conversions API',
  ownerEmails: ['pedro@startu.com.br', 'pedrohnas0@gmail.com'],
  nodes: [
    // Node 0: Receive lead signup webhook
    new TriggerNode({
      id: 'trigger',
      name: 'Lead Signup Webhook'
    }),

    // Node 1: Transform lead signup data → Meta Conversions API format
    new NormalizeNode({
      id: 'normalize',
      name: 'Normalize Lead Data',
      transform: (input, context) => {
        context.logger('Normalizing lead signup data')

        const lead = input.data || {}
        const email = lead.email || ''
        const phone = lead.phone || ''
        const fullName = lead.full_name || ''

        // Hash email with SHA256 (Meta requirement)
        const emailHash = email
          ? crypto.createHash('sha256')
              .update(email.toLowerCase().trim())
              .digest('hex')
          : ''

        // Hash phone with SHA256 (remove formatting first)
        const cleanPhone = phone.replace(/\D/g, '') // Remove all non-digits
        const phoneHash = cleanPhone
          ? crypto.createHash('sha256')
              .update(cleanPhone)
              .digest('hex')
          : ''

        // Split name into first and last name
        const nameParts = fullName.trim().split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        // Hash names
        const fnHash = firstName
          ? crypto.createHash('sha256')
              .update(firstName.toLowerCase().trim())
              .digest('hex')
          : ''

        const lnHash = lastName
          ? crypto.createHash('sha256')
              .update(lastName.toLowerCase().trim())
              .digest('hex')
          : ''

        // Hash city and state
        const cityHash = lead.city
          ? crypto.createHash('sha256')
              .update(lead.city.toLowerCase().trim())
              .digest('hex')
          : ''

        const stateHash = lead.state
          ? crypto.createHash('sha256')
              .update(lead.state.toLowerCase().trim())
              .digest('hex')
          : ''

        const eventTime = Math.floor(Date.now() / 1000)
        const eventId = lead.event_id || `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        context.logger(`Processed lead signup: ${email} - ${lead.company_name || 'N/A'}`)

        return {
          event_name: 'Lead', // or 'CompleteRegistration'
          event_time: eventTime,
          event_id: eventId, // Unique ID for deduplication
          action_source: 'website',
          user_data: {
            em: emailHash, // Hashed email
            ph: phoneHash, // Hashed phone
            fn: fnHash, // Hashed first name
            ln: lnHash, // Hashed last name
            ct: cityHash, // Hashed city
            st: stateHash, // Hashed state
            client_ip_address: lead.client_ip_address || '',
            client_user_agent: lead.client_user_agent || '',
            fbc: lead.fbc || '', // Facebook click ID (if available)
            fbp: lead.fbp || '' // Facebook browser ID (if available)
          },
          custom_data: {
            company_name: lead.company_name || '',
            cpf: lead.cpf || '',
            cnpj: lead.cnpj || '',
            registration_source: lead.source || 'landing_page'
          }
        }
      }
    }),

    // Node 2: Send event to Meta Conversions API
    new HttpNode({
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
          access_token: context.secrets.META_ACCESS_TOKEN || '',
          test_event_code: context.secrets.META_TEST_EVENT_CODE || undefined // Optional: for testing
        }
      }
    })
  ]
})
