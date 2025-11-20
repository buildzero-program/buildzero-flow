import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ClerkAuthProvider } from '~/lib/auth/clerk-provider'
import { db } from '~/lib/db'

// Mock do Clerk
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn()
}))

// Import após mock
import { auth, currentUser } from '@clerk/nextjs/server'

describe('ClerkAuthProvider', () => {
  let provider: ClerkAuthProvider

  beforeEach(async () => {
    provider = new ClerkAuthProvider()

    // Limpar database
    await db.execution.deleteMany()
    await db.user.deleteMany()

    // Reset mocks
    vi.clearAllMocks()
  })

  describe('getCurrentUser', () => {
    it('should return null when user is not authenticated', async () => {
      (currentUser as any).mockResolvedValue(null)

      const user = await provider.getCurrentUser()
      expect(user).toBeNull()
    })

    it('should return null when user has no email', async () => {
      (currentUser as any).mockResolvedValue({
        id: 'user_123',
        emailAddresses: []
      })

      const user = await provider.getCurrentUser()
      expect(user).toBeNull()
    })

    it('should return user with full name', async () => {
      (currentUser as any).mockResolvedValue({
        id: 'user_clerk_123',
        emailAddresses: [{ emailAddress: 'pedro@buildzero.ai' }],
        firstName: 'Pedro',
        lastName: 'Silva',
        imageUrl: 'https://img.clerk.com/photo.jpg'
      })

      const user = await provider.getCurrentUser()

      expect(user).not.toBeNull()
      expect(user?.id).toBe('user_clerk_123')
      expect(user?.email).toBe('pedro@buildzero.ai')
      expect(user?.name).toBe('Pedro Silva')
      expect(user?.image).toBe('https://img.clerk.com/photo.jpg')
    })

    it('should return user with only first name', async () => {
      (currentUser as any).mockResolvedValue({
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@test.com' }],
        firstName: 'Pedro',
        lastName: null,
        imageUrl: null
      })

      const user = await provider.getCurrentUser()

      expect(user?.name).toBe('Pedro')
      expect(user?.image).toBeUndefined()
    })

    it('should return user with only last name', async () => {
      (currentUser as any).mockResolvedValue({
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@test.com' }],
        firstName: null,
        lastName: 'Silva',
        imageUrl: null
      })

      const user = await provider.getCurrentUser()

      expect(user?.name).toBe('Silva')
    })
  })

  describe('getSession', () => {
    it('should return null when not authenticated', async () => {
      (auth as any).mockResolvedValue({
        userId: null
      })

      const session = await provider.getSession()
      expect(session).toBeNull()
    })

    it('should return session when authenticated (simplified, user-based)', async () => {
      (auth as any).mockResolvedValue({
        userId: 'user_123'
      })

      const session = await provider.getSession()

      expect(session).not.toBeNull()
      expect(session?.userId).toBe('user_123')
    })
  })

  describe('requireAuth', () => {
    it('should throw error when not authenticated', async () => {
      (currentUser as any).mockResolvedValue(null)

      let errorThrown = false
      try {
        await provider.requireAuth()
      } catch (error) {
        errorThrown = true
        expect((error as Error).message).toBe('Unauthorized')
      }
      expect(errorThrown).toBe(true)
    })

    it('should return user when authenticated', async () => {
      (currentUser as any).mockResolvedValue({
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@test.com' }],
        firstName: 'Test',
        lastName: null,
        imageUrl: null
      })

      const user = await provider.requireAuth()

      expect(user.id).toBe('user_123')
      expect(user.email).toBe('test@test.com')
    })
  })

  describe('signOut', () => {
    it('should throw error instructing to use Clerk components', async () => {
      let errorThrown = false
      try {
        await provider.signOut()
      } catch (error) {
        errorThrown = true
        expect((error as Error).message).toContain('Clerk SignOutButton')
      }
      expect(errorThrown).toBe(true)
    })
  })
})
