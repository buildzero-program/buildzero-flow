import { describe, it, expect } from 'vitest'
import { Workflow } from './Workflow'
import { TriggerNode } from './nodes/TriggerNode'

describe('Workflow', () => {
  describe('constructor', () => {
    it('should create a workflow with valid config', () => {
      const workflow = new Workflow({
        id: 'test',
        name: 'Test Workflow',
        ownerEmails: ['test@example.com'],
        nodes: [
          new TriggerNode({
            id: 'trigger',
            name: 'Test Trigger'
          })
        ]
      })

      expect(workflow.id).toBe('test')
      expect(workflow.name).toBe('Test Workflow')
      expect(workflow.ownerEmails).toEqual(['test@example.com'])
      expect(workflow.nodes).toHaveLength(1)
    })

    it('should throw error if no nodes provided', () => {
      expect(() => {
        new Workflow({
          id: 'test',
          name: 'Test',
          ownerEmails: ['test@example.com'],
          nodes: []
        })
      }).toThrow('Workflow must have at least one node')
    })

    it('should throw error if no ownerEmails provided', () => {
      expect(() => {
        new Workflow({
          id: 'test',
          name: 'Test',
          ownerEmails: [],
          nodes: [
            new TriggerNode({
              id: 'trigger',
              name: 'Test Trigger'
            })
          ]
        })
      }).toThrow('Workflow must have at least one owner email')
    })
  })

  describe('hasAccess', () => {
    it('should return true if user email is in ownerEmails', () => {
      const workflow = new Workflow({
        id: 'test',
        name: 'Test',
        ownerEmails: ['owner@example.com', 'admin@example.com'],
        nodes: [
          new TriggerNode({
            id: 'trigger',
            name: 'Test Trigger'
          })
        ]
      })

      expect(workflow.hasAccess('owner@example.com')).toBe(true)
      expect(workflow.hasAccess('admin@example.com')).toBe(true)
    })

    it('should return false if user email is not in ownerEmails', () => {
      const workflow = new Workflow({
        id: 'test',
        name: 'Test',
        ownerEmails: ['owner@example.com'],
        nodes: [
          new TriggerNode({
            id: 'trigger',
            name: 'Test Trigger'
          })
        ]
      })

      expect(workflow.hasAccess('stranger@example.com')).toBe(false)
    })

    it('should handle multiple owners correctly', () => {
      const workflow = new Workflow({
        id: 'stripe-to-meta',
        name: 'Stripe → Meta',
        ownerEmails: ['pedrohnas0@gmail.com', 'pedro@startu.com.br'],
        nodes: [
          new TriggerNode({
            id: 'trigger',
            name: 'Test Trigger'
          })
        ]
      })

      expect(workflow.hasAccess('pedrohnas0@gmail.com')).toBe(true)
      expect(workflow.hasAccess('pedro@startu.com.br')).toBe(true)
      expect(workflow.hasAccess('other@example.com')).toBe(false)
    })
  })
})
