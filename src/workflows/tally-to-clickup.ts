import { Workflow } from '~/lib/workflow-engine/Workflow'
import { TriggerNode } from '~/lib/workflow-engine/nodes/TriggerNode'
import { NormalizeNode } from '~/lib/workflow-engine/nodes/NormalizeNode'
import { HttpNode } from '~/lib/workflow-engine/nodes/HttpNode'

export const tallyToClickup = new Workflow({
  id: 'tally-to-clickup',
  name: 'Tally → ClickUp',
  description: 'Captura aplicações do Tally e cria tasks no ClickUp',
  nodes: [
    // Node 0: Receive Tally webhook
    new TriggerNode({
      id: 'trigger',
      name: 'Tally Webhook'
    }),

    // Node 1: Transform Tally data → ClickUp format
    new NormalizeNode({
      id: 'normalize',
      name: 'Normalize Data',
      transform: (input, context) => {
        context.logger('Normalizing Tally webhook data')

        const fields = input.data.data?.fields || []
        const submissionId = input.data.data?.submissionId || ''
        const respondentId = input.data.data?.respondentId || ''
        const createdAt = input.data.data?.createdAt || ''

        const findField = (label: string) =>
          fields.find((f: any) => f.label.trim() === label)?.value || ''

        const findMultipleChoice = (label: string) => {
          const field = fields.find((f: any) => f.label === label)
          if (!field || !field.options) return ''
          const selectedId = field.value[0]
          const option = field.options.find((o: any) => o.id === selectedId)
          return option?.text || ''
        }

        const nome = findField('Nome')
        const sobrenome = findField('Sobrenome')
        const email = findField('E-mail')
        const whatsapp = findField('WhatsApp')
        const comoSoube = findMultipleChoice('Como você ficou sabendo do BuildZero?')
        const ocupacao = findMultipleChoice('Ocupação atual')
        const faturamento = findMultipleChoice('Faixa de faturamento mensal do seu negócio/operação')
        const objetivo = findField('Qual seu principal objetivo nos próximos 90 dias?')
        const porqueBuildZero = findField('Por que BuildZero faz sentido pro seu momento atual e por que devemos te aceitar na comunidade?')

        context.logger(`Extracted: ${nome} ${sobrenome} (${email}) - Submission: ${submissionId}`)

        return {
          nome,
          sobrenome,
          email,
          whatsapp,
          comoSoube,
          ocupacao,
          faturamento,
          objetivo,
          porqueBuildZero,
          submissionId,
          respondentId,
          createdAt
        }
      }
    }),

    // Node 2: Create ClickUp task
    new HttpNode({
      id: 'create-task',
      name: 'Create ClickUp Task',
      method: 'POST',
      url: 'https://api.clickup.com/api/v2/list/901322211570/task',
      headers: (context) => ({
        'Authorization': context.secrets.CLICKUP_API_KEY || '',
        'Content-Type': 'application/json'
      }),
      body: (input, context) => {
        const data = input.data
        context.logger(`Creating ClickUp task for: ${data.nome} ${data.sobrenome}`)

        // Convert createdAt to Unix timestamp (milliseconds)
        const submissionDate = data.createdAt ? new Date(data.createdAt).getTime() : null

        return {
          name: `${data.nome} ${data.sobrenome}`,
          markdown_description: `**Como ficou sabendo do BuildZero:**
${data.comoSoube}

**Ocupação atual:**
${data.ocupacao}

**Faturamento mensal:**
${data.faturamento}

**Objetivo nos próximos 90 dias:**
${data.objetivo}

**Por que BuildZero:**
${data.porqueBuildZero}`,
          custom_fields: [
            {
              id: '3705639e-668f-4eb4-977c-5f865653b3c3', // E-mail
              value: data.email
            },
            {
              id: '081c88b5-97a6-4e36-8c1f-61f2ac879913', // WhatsApp
              value: data.whatsapp
            },
            {
              id: 'd85e2e81-6a0a-4d4f-bc47-974c273cfb71', // Submission ID
              value: data.submissionId
            },
            {
              id: '0d49322b-72b5-4c3a-bb29-d784b894c1ee', // Respondent ID
              value: data.respondentId
            },
            {
              id: 'eeb58134-ec6f-4c35-a0f2-728f6b863bc9', // Data de Submissão
              value: submissionDate
            }
          ]
        }
      }
    })
  ]
})
