import { clerkAuth } from './clerk-provider'
import type { AuthUser } from './provider'

/**
 * Require que o usuário esteja autenticado
 * Lança erro se não autenticado
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await clerkAuth.getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized - Please sign in')
  }

  return user
}
