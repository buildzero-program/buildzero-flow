import { describe, it, expect, vi } from 'vitest'
import { NormalizeNode } from '~/lib/workflow-engine/nodes/NormalizeNode'
import type { NodeExecutionContext } from '~/lib/workflow-engine/types'

describe('NormalizeNode', () => {
  it('should transform input data using transform function', async () => {
    const node = new NormalizeNode({
      id: 'normalize',
      name: 'Transform Data',
      transform: (input, context) => {
        context.logger('Transforming data')
        return {
          fullName: input.data.firstName + ' ' + input.data.lastName,
          email: input.data.email
        }
      }
    })

    const logs: string[] = []
    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'test',
      nodeIndex: 1,
      secrets: {},
      logger: (msg) => logs.push(msg)
    }

    const input = {
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      },
      itemIndex: 0
    }

    const output = await node.execute(input, context)

    expect(output).toEqual({
      fullName: 'John Doe',
      email: 'john@example.com'
    })
    expect(logs).toContain('Transforming data')
  })

  it('should throw error if transform function throws', async () => {
    const node = new NormalizeNode({
      id: 'normalize',
      name: 'Faulty Transform',
      transform: () => {
        throw new Error('Transform failed')
      }
    })

    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'test',
      nodeIndex: 1,
      secrets: {},
      logger: () => {}
    }

    const input = { data: { test: 'value' }, itemIndex: 0 }

    await expect(node.execute(input, context)).rejects.toThrow('Transform failed')
  })

  it('should normalize Tally webhook to ClickUp format', async () => {
    const node = new NormalizeNode({
      id: 'normalize-tally',
      name: 'Tally to ClickUp',
      transform: (input, context) => {
        context.logger('Normalizing Tally data')

        const fields = input.data.data.fields
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

        return {
          nome,
          sobrenome,
          email,
          whatsapp,
          comoSoube,
          ocupacao,
          faturamento,
          objetivo,
          porqueBuildZero
        }
      }
    })

    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'tally-to-clickup',
      nodeIndex: 1,
      secrets: {},
      logger: vi.fn()
    }

    const tallyWebhook = {
      data: {
        eventId: 'b9ef7acb-abd9-4cdd-84c6-702db57535bd',
        data: {
          formName: 'Aplicação BuildZero',
          fields: [
            { key: 'question_xYBKRo', label: 'Nome', type: 'INPUT_TEXT', value: 'Gustavo' },
            { key: 'question_Zay01y', label: 'Sobrenome', type: 'INPUT_TEXT', value: 'Martins' },
            { key: 'question_NoykbQ', label: 'E-mail\n', type: 'INPUT_EMAIL', value: 'gustavo9br@gmail.com' },
            { key: 'question_qVe6J7', label: 'WhatsApp', type: 'INPUT_PHONE_NUMBER', value: '+5522999996333' },
            {
              key: 'question_QVyLzp',
              label: 'Como você ficou sabendo do BuildZero?',
              type: 'MULTIPLE_CHOICE',
              value: ['d0721b68-9648-4f1a-9a15-3fe81f3793ef'],
              options: [
                { id: 'd0721b68-9648-4f1a-9a15-3fe81f3793ef', text: 'Já acompanho o Pedro no YouTube' },
                { id: '7c737ee5-c8e0-48a4-9ac6-1db716494830', text: 'Comunidade Automatik' }
              ]
            },
            {
              key: 'question_Gly80O',
              label: 'Ocupação atual',
              type: 'MULTIPLE_CHOICE',
              value: ['7ae2fa02-8c3a-41fb-97d2-1b35005f92f0'],
              options: [
                { id: 'df90a00d-ca1c-4ddc-9460-df9208a237f9', text: 'Founder/Empresário' },
                { id: '7ae2fa02-8c3a-41fb-97d2-1b35005f92f0', text: 'Desenvolvedor/Colaborador' }
              ]
            },
            {
              key: 'question_OGyO0M',
              label: 'Faixa de faturamento mensal do seu negócio/operação',
              type: 'MULTIPLE_CHOICE',
              value: ['e85e063d-9a72-4a46-9943-0549569a2544'],
              options: [
                { id: '855b1bcc-8623-405a-ac26-c8de622bb020', text: 'Menos de R$ 3.000' },
                { id: 'e85e063d-9a72-4a46-9943-0549549a2544', text: 'R$ 10.000 - R$ 20.000' }
              ]
            },
            { key: 'question_VJy286', label: 'Qual seu principal objetivo nos próximos 90 dias?', type: 'TEXTAREA', value: 'Lançar meu aplicativo' },
            { key: 'question_POyV0x', label: 'Por que BuildZero faz sentido pro seu momento atual e por que devemos te aceitar na comunidade?', type: 'TEXTAREA', value: 'Estou afim de não só conhecer o buildzero mas tb contribuir pra comunidade' }
          ]
        }
      },
      itemIndex: 0
    }

    const output = await node.execute(tallyWebhook, context)

    expect(output).toEqual({
      nome: 'Gustavo',
      sobrenome: 'Martins',
      email: 'gustavo9br@gmail.com',
      whatsapp: '+5522999996333',
      comoSoube: 'Já acompanho o Pedro no YouTube',
      ocupacao: 'Desenvolvedor/Colaborador',
      faturamento: expect.any(String),
      objetivo: 'Lançar meu aplicativo',
      porqueBuildZero: 'Estou afim de não só conhecer o buildzero mas tb contribuir pra comunidade'
    })
  })
})
