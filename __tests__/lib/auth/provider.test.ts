import { describe, it, expect, beforeEach } from 'vitest'
import type { AuthProvider, AuthUser, AuthSession } from '~/lib/auth/provider'

// Mock AuthProvider for testing
class MockAuthProvider implements AuthProvider {
  private mockUser: AuthUser | null = null
  private mockSession: AuthSession | null = null

  setMockUser(user: AuthUser | null) {
    this.mockUser = user
  }

  setMockSession(session: AuthSession | null) {
    this.mockSession = session
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.mockUser
  }

  async getSession(): Promise<AuthSession | null> {
    return this.mockSession
  }

  async requireAuth(): Promise<AuthUser> {
    if (!this.mockUser) {
      throw new Error('Unauthorized')
    }
    return this.mockUser
  }

  async signOut(): Promise<void> {
    this.mockUser = null
    this.mockSession = null
  }
}

describe('AuthProvider Interface', () => {
  let provider: MockAuthProvider

  beforeEach(() => {
    provider = new MockAuthProvider()
  })

  describe('getCurrentUser', () => {
    it('should return null when not authenticated', async () => {
      const user = await provider.getCurrentUser()
      expect(user).toBeNull()
    })

    it('should return user when authenticated', async () => {
      const mockUser: AuthUser = {
        id: 'user_clerk_123',
        email: 'pedro@buildzero.ai',
        name: 'Pedro',
        image: 'https://example.com/photo.jpg'
      }

      provider.setMockUser(mockUser)
      const user = await provider.getCurrentUser()

      expect(user).not.toBeNull()
      expect(user?.id).toBe('user_clerk_123')
      expect(user?.email).toBe('pedro@buildzero.ai')
      expect(user?.name).toBe('Pedro')
    })

    it('should return user without optional fields', async () => {
      const mockUser: AuthUser = {
        id: 'user_123',
        email: 'test@test.com'
      }

      provider.setMockUser(mockUser)
      const user = await provider.getCurrentUser()

      expect(user).not.toBeNull()
      expect(user?.name).toBeUndefined()
      expect(user?.image).toBeUndefined()
    })
  })

  describe('getSession', () => {
    it('should return null when no session exists', async () => {
      const session = await provider.getSession()
      expect(session).toBeNull()
    })

    it('should return session with organization context', async () => {
      const mockSession: AuthSession = {
        userId: 'user_123',
        orgId: 'org_buildzero',
        role: 'OWNER'
      }

      provider.setMockSession(mockSession)
      const session = await provider.getSession()

      expect(session).not.toBeNull()
      expect(session?.userId).toBe('user_123')
      expect(session?.orgId).toBe('org_buildzero')
      expect(session?.role).toBe('OWNER')
    })

    it('should return session without organization context', async () => {
      const mockSession: AuthSession = {
        userId: 'user_123'
      }

      provider.setMockSession(mockSession)
      const session = await provider.getSession()

      expect(session).not.toBeNull()
      expect(session?.orgId).toBeUndefined()
      expect(session?.role).toBeUndefined()
    })
  })

  describe('requireAuth', () => {
    it('should throw error when not authenticated', async () => {
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
      const mockUser: AuthUser = {
        id: 'user_123',
        email: 'test@test.com',
        name: 'Test User'
      }

      provider.setMockUser(mockUser)
      const user = await provider.requireAuth()

      expect(user.id).toBe('user_123')
      expect(user.email).toBe('test@test.com')
    })
  })

  describe('signOut', () => {
    it('should clear user and session on sign out', async () => {
      const mockUser: AuthUser = {
        id: 'user_123',
        email: 'test@test.com'
      }

      const mockSession: AuthSession = {
        userId: 'user_123',
        orgId: 'org_123'
      }

      provider.setMockUser(mockUser)
      provider.setMockSession(mockSession)

      // Verify user is set
      expect(await provider.getCurrentUser()).not.toBeNull()
      expect(await provider.getSession()).not.toBeNull()

      // Sign out
      await provider.signOut()

      // Verify cleared
      expect(await provider.getCurrentUser()).toBeNull()
      expect(await provider.getSession()).toBeNull()
    })
  })
})
