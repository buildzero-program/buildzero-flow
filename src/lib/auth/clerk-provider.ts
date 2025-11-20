import { auth, currentUser } from '@clerk/nextjs/server'
import type { AuthProvider, AuthUser, AuthSession } from './provider'

/**
 * ClerkAuthProvider - Implementação do AuthProvider usando Clerk
 */
export class ClerkAuthProvider implements AuthProvider {
  async getCurrentUser(): Promise<AuthUser | null> {
    const user = await currentUser()

    if (!user) {
      return null
    }

    const email = user.emailAddresses[0]?.emailAddress
    if (!email) {
      return null
    }

    return {
      id: user.id,
      email,
      name: user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName ?? user.lastName ?? undefined,
      image: user.imageUrl ?? undefined
    }
  }

  async getSession(): Promise<AuthSession | null> {
    const { userId } = await auth()

    if (!userId) {
      return null
    }

    // Simplified: no organization context, just user session
    return {
      userId
    }
  }

  async requireAuth(): Promise<AuthUser> {
    const user = await this.getCurrentUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    return user
  }

  async signOut(): Promise<void> {
    // Clerk gerencia o sign out via componentes
    // Esta função é principalmente para compatibilidade com a interface
    // O logout real será feito via <SignOutButton /> ou redirect
    throw new Error('Use Clerk SignOutButton or redirect to sign-out endpoint')
  }
}

/**
 * Instância singleton do ClerkAuthProvider
 */
export const clerkAuth = new ClerkAuthProvider()
