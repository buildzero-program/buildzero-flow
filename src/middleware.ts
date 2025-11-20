import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/**
 * Rotas públicas (não requerem autenticação)
 */
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/api/webhooks(.*)', // Webhooks públicos (validados por signature)
  '/api/workers(.*)', // Workers (validados por QStash signature)
])

/**
 * Rotas que requerem contexto organizacional
 */
const requiresOrgContext = createRouteMatcher([
  '/org/:orgSlug/workflows(.*)',
  '/org/:orgSlug/settings(.*)',
  '/org/:orgSlug/members(.*)',
  '/api/trpc(.*)', // tRPC procedures geralmente precisam de org context
])

/**
 * Middleware de autenticação e multi-tenancy
 */
export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId } = await auth()

  // Se rota pública, permite acesso
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Se não autenticado em rota protegida, redireciona para login
  if (!userId && !isPublicRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // Se rota requer org context mas não tem, redireciona para seleção de org
  if (requiresOrgContext(req) && !orgId) {
    const selectOrgUrl = new URL('/select-org', req.url)
    selectOrgUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(selectOrgUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
