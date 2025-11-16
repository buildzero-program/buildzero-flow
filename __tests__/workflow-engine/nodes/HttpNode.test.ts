import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpNode } from '~/lib/workflow-engine/nodes/HttpNode'
import type { NodeExecutionContext } from '~/lib/workflow-engine/types'

describe('HttpNode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should make POST request with dynamic body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'created-123', success: true })
    })
    global.fetch = mockFetch

    const node = new HttpNode({
      id: 'http-post',
      name: 'Create Resource',
      method: 'POST',
      url: 'https://api.example.com/resources',
      headers: (context) => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${context.secrets.API_TOKEN}`
      }),
      body: (input, context) => {
        context.logger(`Creating resource for ${input.data.email}`)
        return {
          name: input.data.name,
          email: input.data.email
        }
      }
    })

    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'test',
      nodeIndex: 2,
      secrets: { API_TOKEN: 'secret-token-123' },
      logger: vi.fn()
    }

    const input = {
      data: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      itemIndex: 0
    }

    const output = await node.execute(input, context)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/resources',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer secret-token-123'
        },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com'
        })
      }
    )

    expect(output).toEqual({ id: 'created-123', success: true })
    expect(context.logger).toHaveBeenCalledWith('Creating resource for john@example.com')
  })

  it('should throw error if HTTP request fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () => 'Invalid data'
    })
    global.fetch = mockFetch

    const node = new HttpNode({
      id: 'http-fail',
      name: 'Failing Request',
      method: 'POST',
      url: 'https://api.example.com/fail',
      body: () => ({ test: true })
    })

    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'test',
      nodeIndex: 2,
      secrets: {},
      logger: () => {}
    }

    const input = { data: {}, itemIndex: 0 }

    await expect(node.execute(input, context)).rejects.toThrow(
      'HTTP request failed: 400 Bad Request'
    )
  })

  it('should create ClickUp task with correct format', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: '86ad99cn2',
        name: 'Gustavo Martins',
        url: 'https://app.clickup.com/t/86ad99cn2'
      })
    })
    global.fetch = mockFetch

    const node = new HttpNode({
      id: 'create-clickup-task',
      name: 'Create ClickUp Task',
      method: 'POST',
      url: 'https://api.clickup.com/api/v2/list/901322211570/task',
      headers: (context) => ({
        'Authorization': context.secrets.CLICKUP_API_KEY || '',
        'Content-Type': 'application/json'
      }),
      body: (input, context) => {
        const data = input.data
        context.logger(`Creating task for: ${data.nome} ${data.sobrenome}`)

        return {
          name: `${data.nome} ${data.sobrenome}`,
          description: `**Como ficou sabendo do BuildZero:**
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
              id: '3705639e-668f-4eb4-977c-5f865653b3c3',
              value: data.email
            },
            {
              id: '081c88b5-97a6-4e36-8c1f-61f2ac879913',
              value: data.whatsapp
            }
          ]
        }
      }
    })

    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'tally-to-clickup',
      nodeIndex: 2,
      secrets: { CLICKUP_API_KEY: 'pk_test_123' },
      logger: vi.fn()
    }

    const input = {
      data: {
        nome: 'Gustavo',
        sobrenome: 'Martins',
        email: 'gustavo9br@gmail.com',
        whatsapp: '+5522999996333',
        comoSoube: 'Já acompanho o Pedro no YouTube',
        ocupacao: 'Desenvolvedor/Colaborador',
        faturamento: 'R$ 10.000 - R$ 20.000',
        objetivo: 'Lançar meu aplicativo',
        porqueBuildZero: 'Estou afim de não só conhecer o buildzero mas tb contribuir pra comunidade'
      },
      itemIndex: 0
    }

    const output = await node.execute(input, context)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.clickup.com/api/v2/list/901322211570/task',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Authorization': 'pk_test_123',
          'Content-Type': 'application/json'
        }
      })
    )

    const requestBody = JSON.parse(mockFetch.mock.calls[0]?.[1]?.body as string)
    expect(requestBody).toMatchObject({
      name: 'Gustavo Martins',
      description: expect.stringContaining('Já acompanho o Pedro no YouTube'),
      custom_fields: [
        {
          id: '3705639e-668f-4eb4-977c-5f865653b3c3',
          value: 'gustavo9br@gmail.com'
        },
        {
          id: '081c88b5-97a6-4e36-8c1f-61f2ac879913',
          value: '+5522999996333'
        }
      ]
    })

    expect(output).toEqual({
      id: '86ad99cn2',
      name: 'Gustavo Martins',
      url: 'https://app.clickup.com/t/86ad99cn2'
    })
  })
})
