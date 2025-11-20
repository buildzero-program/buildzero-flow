import { describe, it, expect, beforeEach, vi } from 'vitest'
import { requireUser } from '~/lib/auth/helpers'

// Mock do Clerk
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn()
}))

import { auth, currentUser } from '@clerk/nextjs/server'

describe('Auth Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('requireUser', () => {
    it('should throw error when not authenticated', async () => {
      (currentUser as any).mockResolvedValue(null)

      let errorThrown = false
      try {
        await requireUser()
      } catch (error) {
        errorThrown = true
        expect((error as Error).message).toBe('Unauthorized - Please sign in')
      }
      expect(errorThrown).toBe(true)
    })

    it('should throw error when user has no email', async () => {
      (currentUser as any).mockResolvedValue({
        id: 'user_123',
        emailAddresses: []
      })

      let errorThrown = false
      try {
        await requireUser()
      } catch (error) {
        errorThrown = true
        expect((error as Error).message).toBe('Unauthorized - Please sign in')
      }
      expect(errorThrown).toBe(true)
    })

    it('should return user when authenticated', async () => {
      (currentUser as any).mockResolvedValue({
        id: 'user_clerk_123',
        emailAddresses: [{ emailAddress: 'pedro@buildzero.ai' }],
        firstName: 'Pedro',
        lastName: 'Silva',
        imageUrl: 'https://example.com/photo.jpg'
      })

      const user = await requireUser()

      expect(user).not.toBeNull()
      expect(user.id).toBe('user_clerk_123')
      expect(user.email).toBe('pedro@buildzero.ai')
      expect(user.name).toBe('Pedro Silva')
    })
  })
})
