/**
 * AuthUser - Representa um usuário autenticado
 * Abstração que funciona tanto com Clerk quanto NextAuth
 */
export interface AuthUser {
  /** ID único do provider (clerkUserId ou nextAuthId) */
  id: string
  /** Email do usuário */
  email: string
  /** Nome do usuário (opcional) */
  name?: string
  /** URL da foto do usuário (opcional) */
  image?: string
}

/**
 * AuthSession - Representa uma sessão autenticada (simplified, user-based)
 */
export interface AuthSession {
  /** ID do usuário */
  userId: string
}

/**
 * AuthProvider - Interface abstrata para providers de autenticação
 * Permite trocar entre Clerk e NextAuth sem alterar o código da aplicação
 */
export interface AuthProvider {
  /**
   * Retorna o usuário autenticado atual ou null se não autenticado
   */
  getCurrentUser(): Promise<AuthUser | null>

  /**
   * Retorna a sessão autenticada atual
   */
  getSession(): Promise<AuthSession | null>

  /**
   * Require autenticação - lança erro se não autenticado
   * Útil para proteger rotas/procedures
   */
  requireAuth(): Promise<AuthUser>

  /**
   * Faz logout do usuário
   */
  signOut(): Promise<void>
}
