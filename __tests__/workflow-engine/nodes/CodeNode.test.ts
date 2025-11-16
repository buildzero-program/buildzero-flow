import { describe, it, expect, vi } from 'vitest'
import { CodeNode } from '~/lib/workflow-engine/nodes/CodeNode'
import type { NodeExecutionContext } from '~/lib/workflow-engine/types'

describe('CodeNode', () => {
  it('should execute custom code function', async () => {
    const node = new CodeNode({
      id: 'test-code',
      name: 'Test Code',
      execute: async (input, context) => {
        context.logger('Executing custom code')
        return { result: input.data.value * 2 }
      }
    })

    const logs: string[] = []
    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'test',
      nodeIndex: 2,
      secrets: {},
      logger: (msg) => logs.push(msg)
    }

    const input = {
      data: { value: 10 },
      itemIndex: 0
    }

    const output = await node.execute(input, context)

    expect(output).toEqual({ result: 20 })
    expect(logs).toContain('Executing custom code')
  })

  it('should have access to context.secrets', async () => {
    const node = new CodeNode({
      id: 'test-secrets',
      name: 'Test Secrets',
      execute: async (input, context) => {
        return {
          apiKey: context.secrets.MY_API_KEY,
          token: context.secrets.MY_TOKEN
        }
      }
    })

    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'test',
      nodeIndex: 0,
      secrets: {
        MY_API_KEY: 'secret123',
        MY_TOKEN: 'token456'
      },
      logger: vi.fn()
    }

    const input = { data: {}, itemIndex: 0 }
    const output = await node.execute(input, context)

    expect(output).toEqual({
      apiKey: 'secret123',
      token: 'token456'
    })
  })

  it('should support async operations with fetch', async () => {
    // Mock global fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: 'mock-data' })
      })
    ) as any

    const node = new CodeNode({
      id: 'test-async',
      name: 'Test Async',
      execute: async (input, context) => {
        context.logger('Making API call')
        const response = await fetch('https://api.example.com/data')
        const data = await response.json()
        return data
      }
    })

    const logs: string[] = []
    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'test',
      nodeIndex: 0,
      secrets: {},
      logger: (msg) => logs.push(msg)
    }

    const input = { data: {}, itemIndex: 0 }
    const output = await node.execute(input, context)

    expect(output).toEqual({ success: true, data: 'mock-data' })
    expect(logs).toContain('Making API call')
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/data')
  })

  it('should handle errors in execute function', async () => {
    const node = new CodeNode({
      id: 'test-error',
      name: 'Test Error',
      execute: async (input, context) => {
        throw new Error('Custom code failed')
      }
    })

    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'test',
      nodeIndex: 0,
      secrets: {},
      logger: vi.fn()
    }

    const input = { data: {}, itemIndex: 0 }

    await expect(node.execute(input, context)).rejects.toThrow('Custom code failed')
  })

  it('should support synchronous execute functions', async () => {
    const node = new CodeNode({
      id: 'test-sync',
      name: 'Test Sync',
      execute: (input, context) => {
        // Not async
        return { doubled: input.data.number * 2 }
      }
    })

    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'test',
      nodeIndex: 0,
      secrets: {},
      logger: vi.fn()
    }

    const input = { data: { number: 5 }, itemIndex: 0 }
    const output = await node.execute(input, context)

    expect(output).toEqual({ doubled: 10 })
  })

  it('should pass input data from previous node', async () => {
    const node = new CodeNode({
      id: 'test-input',
      name: 'Test Input',
      execute: async (input, context) => {
        // Simulate processing task data from HttpNode
        const task = input.data

        return {
          processedTaskId: task.id,
          processedTaskName: task.name,
          customField: task.custom_fields?.[0]?.value
        }
      }
    })

    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'tally-to-clickup',
      nodeIndex: 3,
      secrets: {},
      logger: vi.fn()
    }

    // Simulating output from HttpNode (ClickUp task creation)
    const input = {
      data: {
        id: '86ad9e92h',
        name: 'John Doe',
        url: 'https://app.clickup.com/t/86ad9e92h',
        custom_fields: [
          { id: 'email-field', value: 'john@example.com' },
          { id: 'whatsapp-field', value: '+5527992297049' }
        ]
      },
      itemIndex: 0
    }

    const output = await node.execute(input, context)

    expect(output).toEqual({
      processedTaskId: '86ad9e92h',
      processedTaskName: 'John Doe',
      customField: 'john@example.com'
    })
  })

  it('should support complex workflow logic with try/catch', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ profilePictureUrl: 'https://photo.url' })
      })
      .mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(new Blob(['photo-data']))
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ url: 'https://clickup.com/attachment/123' })
      }) as any

    const node = new CodeNode({
      id: 'upload-photo',
      name: 'Upload Profile Photo',
      execute: async (input, context) => {
        const task = input.data
        let photoUploaded = false
        let photoSource = 'none'

        try {
          // 1. Fetch profile photo
          context.logger('Fetching profile photo')
          const photoResponse = await fetch('https://api.example.com/photo')
          const photoData = await photoResponse.json()

          if (photoData.profilePictureUrl) {
            // 2. Download photo
            const downloadResponse = await fetch(photoData.profilePictureUrl)
            const photoBlob = await downloadResponse.blob()

            // 3. Upload to ClickUp
            const formData = new FormData()
            formData.append('attachment', photoBlob, 'profile.jpg')

            const uploadResponse = await fetch(
              `https://api.clickup.com/task/${task.id}/attachment`,
              {
                method: 'POST',
                headers: { 'Authorization': context.secrets.CLICKUP_API_KEY || '' },
                body: formData
              }
            )

            if (uploadResponse.ok) {
              photoUploaded = true
              photoSource = 'whatsapp'
              context.logger('Photo uploaded successfully')
            }
          }
        } catch (error: any) {
          context.logger(`Error: ${error.message}`)
        }

        return {
          taskId: task.id,
          photoUploaded,
          photoSource
        }
      }
    })

    const logs: string[] = []
    const context: NodeExecutionContext = {
      executionId: 'exec-1',
      workflowId: 'tally-to-clickup',
      nodeIndex: 3,
      secrets: { CLICKUP_API_KEY: 'test-key' },
      logger: (msg) => logs.push(msg)
    }

    const input = {
      data: {
        id: '86ad9e92h',
        name: 'John Doe'
      },
      itemIndex: 0
    }

    const output = await node.execute(input, context)

    expect(output).toEqual({
      taskId: '86ad9e92h',
      photoUploaded: true,
      photoSource: 'whatsapp'
    })
    expect(logs).toContain('Fetching profile photo')
    expect(logs).toContain('Photo uploaded successfully')
  })
})
