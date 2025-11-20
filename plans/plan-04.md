# Plan 04: Multi-Tenant Authentication

**Objetivo:** Implementar sistema de autenticação multi-tenant onde cada organização possui seus próprios workflows e execuções. Usuários só veem dados da sua organização.

**Funcionalidade Principal:**
- Autenticação via Clerk (com abstração para futura migração)
- Organizações isoladas (Pedro P só vê workflows dele)
- RBAC (Owner, Admin, Member)
- Webhooks públicos continuam funcionando (sem auth)
- Dashboard protegido com autenticação

**Dependências:** Plans 01, 02, 03 completos

---

## 🎯 Contexto e Decisões de Arquitetura

### Multi-Tenancy Model: Organization-Based

**Decisão:** Usar modelo de tenancy baseado em **Organizations** (não User-based).

**Rationale:**
- BuildZero Flow é uma ferramenta de equipe (não SaaS individual)
- Workflows pertencem a organizações (não a usuários)
- Múltiplos usuários compartilham workflows de uma org
- Exemplos: Pedro Paulinetti e sua equipe compartilham workflows

**Modelo de Dados:**
```
Organization (buildzero)
  ├── Users: [pedro@buildzero.ai (OWNER), maria@buildzero.ai (ADMIN)]
  ├── Workflows: [tally-to-clickup, stripe-to-meta-pixel]
  └── Executions: [todas execuções desses workflows]
```

---

### Authentication Strategy: Clerk with Abstraction Layer

**Decisão:** Usar Clerk inicialmente, mas com camada de abstração para permitir migração futura.

**Problema Resolvido:**
- Google OAuth requer app verificado (warning assusta usuários)
- Clerk oferece social login sem verificação de app
- Mas não queremos vendor lock-in

**Solução:** AuthProvider abstraction

```typescript
// Qualquer provider que implemente essa interface funciona
interface AuthProvider {
  getSession(): Promise<Session | null>
  signIn(provider: string): Promise<void>
  signOut(): Promise<void>
}

// Clerk implementation
class ClerkAuthProvider implements AuthProvider { ... }

// NextAuth implementation (futuro)
class NextAuthProvider implements AuthProvider { ... }

// App usa a abstração (não Clerk diretamente)
const authProvider = getAuthProvider() // Factory pattern
const session = await authProvider.getSession()
```

**Benefício:** Trocar Clerk por NextAuth requer apenas:
1. Implementar `NextAuthProvider`
2. Mudar factory (`getAuthProvider()`)
3. **Zero mudanças no código da aplicação**

---

## 🗄️ Database Schema Changes

### Phase 1: Add Multi-Tenancy Tables

**Schema Completo:**

```prisma
// ===== NOVOS MODELS =====

model Organization {
  id          String               @id @default(cuid())
  name        String               // "BuildZero", "Pedro Paulinetti Studio"
  slug        String               @unique // "buildzero", "pedro-paulinetti"
  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt
  members     OrganizationMember[]
  workflows   Workflow[]
  executions  Execution[]          @relation("OrganizationExecutions")
}

model User {
  id            String               @id @default(cuid())
  email         String               @unique
  name          String?
  image         String?              // Profile photo URL
  clerkUserId   String?              @unique // Clerk external ID
  createdAt     DateTime             @default(now())
  updatedAt     DateTime             @updatedAt
  organizations OrganizationMember[]
}

model OrganizationMember {
  id             String       @id @default(cuid())
  organizationId String
  userId         String
  role           Role         @default(MEMBER)
  createdAt      DateTime     @default(now())
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([organizationId, userId])
  @@index([userId])
  @@index([organizationId])
}

enum Role {
  OWNER   // Pode gerenciar org, adicionar/remover membros, ver tudo
  ADMIN   // Pode criar workflows, ver todas execuções da org
  MEMBER  // Pode apenas ver execuções
}

model Workflow {
  id             String       @id @default(cuid())
  workflowId     String       // "tally-to-clickup" (code-based ID)
  name           String       // "Tally → ClickUp"
  description    String?
  organizationId String
  isActive       Boolean      @default(true)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([workflowId, organizationId])
  @@index([organizationId])
}

// ===== MODELS EXISTENTES (MODIFICADOS) =====

model Execution {
  id               String          @id @default(cuid())
  workflowId       String
  organizationId   String          // ← NOVO
  status           ExecutionStatus @default(RUNNING)
  currentNodeIndex Int             @default(0)
  startedAt        DateTime        @default(now())
  finishedAt       DateTime?
  logs             ExecutionLog[]
  organization     Organization    @relation("OrganizationExecutions", fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([workflowId])
  @@index([status])
  @@index([startedAt])
  @@index([organizationId]) // ← NOVO (critical for multi-tenant queries)
}

// ExecutionLog permanece igual (herda organizationId via Execution)
```

---

## 🔐 Authentication Flow

### 1. User Registration & Login

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. GET /login
       v
┌─────────────────────┐
│  Login Page         │
│  [Sign in with      │
│   Google/Email]     │
└──────┬──────────────┘
       │
       │ 2. Click "Sign in with Google"
       v
┌─────────────────────┐
│  Clerk OAuth        │
│  (handles Google)   │
└──────┬──────────────┘
       │
       │ 3. OAuth Callback
       v
┌─────────────────────┐
│  Webhook from Clerk │
│  POST /api/webhooks/│
│       clerk         │
└──────┬──────────────┘
       │
       │ 4. Create/Update User in DB
       v
┌─────────────────────┐
│  Check Organizations│
│  - Has orgs? → /    │
│  - No orgs? → /new  │
└─────────────────────┘
```

### 2. Organization Context

**Every authenticated request includes:**

```typescript
interface Session {
  user: {
    id: string          // Internal user ID (DB)
    email: string
    name?: string
    image?: string
  }
  organizationId: string  // Current active org
  organizationSlug: string
  role: Role              // User's role in this org
}
```

**Organization Switcher:**
```
┌──────────────────────────┐
│  Dashboard Header        │
│                          │
│  [BuildZero ▼]  Logout   │
│    ├─ BuildZero (Owner)  │
│    └─ Pedro Studio (Adm) │
└──────────────────────────┘
```

---

### 3. Webhook Security

**Challenge:** Webhooks devem ser públicos (Tally, Stripe, etc chamam), mas precisam saber qual organização.

**Solução: Organization API Keys**

```prisma
model OrganizationApiKey {
  id             String       @id @default(cuid())
  organizationId String
  key            String       @unique  // "bzf_live_abc123..."
  name           String                // "Tally Webhook Key"
  lastUsedAt     DateTime?
  createdAt      DateTime     @default(now())
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId])
}
```

**Webhook URL Format:**
```bash
# Opção 1: Query param
POST /api/webhooks/tally-to-clickup?api_key=bzf_live_abc123

# Opção 2: Header
POST /api/webhooks/tally-to-clickup
Authorization: Bearer bzf_live_abc123

# Opção 3: Slug in path (preferred)
POST /api/webhooks/buildzero/tally-to-clickup
```

**Implementação (Opção 3 - Slug):**

```typescript
// src/app/api/webhooks/[orgSlug]/[workflowId]/route.ts
export async function POST(
  req: NextRequest,
  { params }: { params: { orgSlug: string; workflowId: string } }
) {
  // 1. Buscar org pelo slug
  const org = await db.organization.findUnique({
    where: { slug: params.orgSlug }
  })

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  // 2. Buscar workflow da org
  const workflow = await db.workflow.findUnique({
    where: {
      workflowId_organizationId: {
        workflowId: params.workflowId,
        organizationId: org.id
      }
    }
  })

  if (!workflow || !workflow.isActive) {
    return NextResponse.json({ error: 'Workflow not found or inactive' }, { status: 404 })
  }

  // 3. Criar execution (com organizationId)
  const execution = await db.execution.create({
    data: {
      workflowId: params.workflowId,
      organizationId: org.id,  // ← Vincula à organização
      status: 'RUNNING'
    }
  })

  // 4. Enfileirar node 0
  await enqueueNode({ executionId: execution.id, nodeIndex: 0, input: ... })

  return NextResponse.json({ executionId: execution.id })
}
```

---

## 🧪 Test-Driven Implementation

### Phase 1: Database Models & User Management

#### 1.1 Test: Create User

**Test First:**
```typescript
// __tests__/db/user.test.ts
import { db } from '~/lib/db'

describe('User Model', () => {
  it('should create user with email', async () => {
    const user = await db.user.create({
      data: {
        email: 'pedro@buildzero.ai',
        name: 'Pedro',
        clerkUserId: 'user_clerk_123'
      }
    })

    expect(user.id).toBeDefined()
    expect(user.email).toBe('pedro@buildzero.ai')
    expect(user.clerkUserId).toBe('user_clerk_123')
  })

  it('should enforce unique email', async () => {
    await db.user.create({
      data: { email: 'test@example.com', name: 'Test' }
    })

    await expect(
      db.user.create({
        data: { email: 'test@example.com', name: 'Duplicate' }
      })
    ).rejects.toThrow()
  })
})
```

**Implementação:**
1. Adicionar models ao `schema.prisma` (User, Organization, OrganizationMember)
2. Rodar `bunx prisma db push`
3. ✅ Testes passam

---

#### 1.2 Test: Create Organization with Owner

**Test First:**
```typescript
// __tests__/db/organization.test.ts
import { db } from '~/lib/db'

describe('Organization Model', () => {
  it('should create organization with owner', async () => {
    const user = await db.user.create({
      data: { email: 'pedro@buildzero.ai', name: 'Pedro' }
    })

    const org = await db.organization.create({
      data: {
        name: 'BuildZero',
        slug: 'buildzero',
        members: {
          create: {
            userId: user.id,
            role: 'OWNER'
          }
        }
      }
    })

    expect(org.slug).toBe('buildzero')

    const members = await db.organizationMember.findMany({
      where: { organizationId: org.id }
    })

    expect(members).toHaveLength(1)
    expect(members[0]?.role).toBe('OWNER')
  })

  it('should enforce unique slug', async () => {
    await db.organization.create({
      data: { name: 'Org 1', slug: 'test-org' }
    })

    await expect(
      db.organization.create({
        data: { name: 'Org 2', slug: 'test-org' }
      })
    ).rejects.toThrow()
  })

  it('should prevent duplicate user in same org', async () => {
    const user = await db.user.create({
      data: { email: 'test@test.com', name: 'Test' }
    })

    const org = await db.organization.create({
      data: { name: 'Test', slug: 'test' }
    })

    await db.organizationMember.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role: 'MEMBER'
      }
    })

    await expect(
      db.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          role: 'ADMIN'
        }
      })
    ).rejects.toThrow() // Unique constraint
  })
})
```

✅ Testes passam

---

#### 1.3 Test: Workflow Belongs to Organization

**Test First:**
```typescript
// __tests__/db/workflow.test.ts
import { db } from '~/lib/db'

describe('Workflow Model', () => {
  it('should create workflow for organization', async () => {
    const org = await db.organization.create({
      data: { name: 'Test Org', slug: 'test-org' }
    })

    const workflow = await db.workflow.create({
      data: {
        workflowId: 'tally-to-clickup',
        name: 'Tally → ClickUp',
        organizationId: org.id
      }
    })

    expect(workflow.organizationId).toBe(org.id)
    expect(workflow.isActive).toBe(true)
  })

  it('should allow same workflowId in different organizations', async () => {
    const org1 = await db.organization.create({
      data: { name: 'Org 1', slug: 'org1' }
    })

    const org2 = await db.organization.create({
      data: { name: 'Org 2', slug: 'org2' }
    })

    const wf1 = await db.workflow.create({
      data: {
        workflowId: 'tally-to-clickup',
        name: 'Tally → ClickUp',
        organizationId: org1.id
      }
    })

    const wf2 = await db.workflow.create({
      data: {
        workflowId: 'tally-to-clickup',
        name: 'Tally → ClickUp',
        organizationId: org2.id
      }
    })

    expect(wf1.id).not.toBe(wf2.id)
    expect(wf1.workflowId).toBe(wf2.workflowId)
  })

  it('should prevent duplicate workflowId in same organization', async () => {
    const org = await db.organization.create({
      data: { name: 'Test', slug: 'test' }
    })

    await db.workflow.create({
      data: {
        workflowId: 'test-workflow',
        name: 'Test',
        organizationId: org.id
      }
    })

    await expect(
      db.workflow.create({
        data: {
          workflowId: 'test-workflow',
          name: 'Duplicate',
          organizationId: org.id
        }
      })
    ).rejects.toThrow() // Unique constraint
  })
})
```

✅ Testes passam

---

### Phase 2: Authentication Abstraction Layer

#### 2.1 Test: AuthProvider Interface

**Test First:**
```typescript
// __tests__/lib/auth/clerk-provider.test.ts
import { ClerkAuthProvider } from '~/lib/auth/providers/clerk'
import { auth } from '@clerk/nextjs/server'

vi.mock('@clerk/nextjs/server')

describe('ClerkAuthProvider', () => {
  it('should return session when user is authenticated', async () => {
    const mockClerkSession = {
      userId: 'user_clerk_123',
      orgId: 'org_clerk_abc',
      orgSlug: 'buildzero',
      orgRole: 'org:admin'
    }

    vi.mocked(auth).mockResolvedValue(mockClerkSession as any)

    const provider = new ClerkAuthProvider()
    const session = await provider.getSession()

    expect(session).not.toBeNull()
    expect(session?.user.id).toBeDefined()
    expect(session?.organizationSlug).toBe('buildzero')
    expect(session?.role).toBe('ADMIN')
  })

  it('should return null when user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const provider = new ClerkAuthProvider()
    const session = await provider.getSession()

    expect(session).toBeNull()
  })

  it('should map Clerk roles to internal roles', async () => {
    const testCases = [
      { clerkRole: 'org:admin', expected: 'ADMIN' },
      { clerkRole: 'org:member', expected: 'MEMBER' }
    ]

    for (const testCase of testCases) {
      vi.mocked(auth).mockResolvedValue({
        userId: 'user_123',
        orgId: 'org_abc',
        orgRole: testCase.clerkRole
      } as any)

      const provider = new ClerkAuthProvider()
      const session = await provider.getSession()

      expect(session?.role).toBe(testCase.expected)
    }
  })
})
```

**Implementação:**

```typescript
// src/lib/auth/types.ts
export interface AuthProvider {
  getSession(): Promise<Session | null>
  signIn(provider: string): Promise<void>
  signOut(): Promise<void>
}

export interface Session {
  user: {
    id: string
    email: string
    name?: string
    image?: string
  }
  organizationId: string
  organizationSlug: string
  role: Role
}

export type Role = 'OWNER' | 'ADMIN' | 'MEMBER'
```

```typescript
// src/lib/auth/providers/clerk.ts
import { auth, clerkClient } from '@clerk/nextjs/server'
import type { AuthProvider, Session, Role } from '../types'
import { db } from '~/lib/db'

export class ClerkAuthProvider implements AuthProvider {
  async getSession(): Promise<Session | null> {
    const clerkAuth = await auth()

    if (!clerkAuth.userId || !clerkAuth.orgId) {
      return null
    }

    // Buscar ou criar User no nosso DB
    let user = await db.user.findUnique({
      where: { clerkUserId: clerkAuth.userId }
    })

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkAuth.userId)
      user = await db.user.create({
        data: {
          clerkUserId: clerkAuth.userId,
          email: clerkUser.emailAddresses[0]!.emailAddress,
          name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : null,
          image: clerkUser.imageUrl
        }
      })
    }

    // Buscar organização
    const org = await db.organization.findFirst({
      where: {
        members: {
          some: {
            userId: user.id
          }
        }
      }
    })

    if (!org) {
      throw new Error('User not member of any organization')
    }

    // Buscar role do usuário
    const member = await db.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: org.id,
          userId: user.id
        }
      }
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        image: user.image || undefined
      },
      organizationId: org.id,
      organizationSlug: org.slug,
      role: member!.role
    }
  }

  async signIn(provider: string): Promise<void> {
    // Clerk handles this via redirects
    throw new Error('Use Clerk UI for sign in')
  }

  async signOut(): Promise<void> {
    // Clerk handles this via redirects
    throw new Error('Use Clerk UI for sign out')
  }
}
```

```typescript
// src/lib/auth/index.ts
import type { AuthProvider } from './types'
import { ClerkAuthProvider } from './providers/clerk'

let authProvider: AuthProvider | null = null

export function getAuthProvider(): AuthProvider {
  if (!authProvider) {
    // Factory: troca provider aqui quando migrar
    authProvider = new ClerkAuthProvider()
  }
  return authProvider
}

export async function getSession() {
  const provider = getAuthProvider()
  return provider.getSession()
}

export * from './types'
```

✅ Testes passam

---

### Phase 3: Middleware & Route Protection

#### 3.1 Test: Middleware Protects Dashboard

**Test First:**
```typescript
// __tests__/middleware.test.ts
import { middleware } from '~/middleware'
import { getSession } from '~/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('~/lib/auth')

describe('Middleware', () => {
  it('should allow public webhooks without auth', async () => {
    const req = new NextRequest('http://localhost:3000/api/webhooks/buildzero/tally-to-clickup', {
      method: 'POST'
    })

    const response = await middleware(req)

    expect(response?.status).not.toBe(302) // Not redirected
  })

  it('should allow worker endpoint without auth', async () => {
    const req = new NextRequest('http://localhost:3000/api/workers/execute-node', {
      method: 'POST'
    })

    const response = await middleware(req)

    expect(response?.status).not.toBe(302)
  })

  it('should redirect to login when accessing dashboard without auth', async () => {
    vi.mocked(getSession).mockResolvedValue(null)

    const req = new NextRequest('http://localhost:3000/executions')

    const response = await middleware(req)

    expect(response?.status).toBe(302)
    expect(response?.headers.get('location')).toContain('/login')
  })

  it('should allow dashboard access when authenticated', async () => {
    vi.mocked(getSession).mockResolvedValue({
      user: { id: 'user1', email: 'test@test.com' },
      organizationId: 'org1',
      organizationSlug: 'test-org',
      role: 'MEMBER'
    })

    const req = new NextRequest('http://localhost:3000/executions')

    const response = await middleware(req)

    expect(response?.status).not.toBe(302)
  })
})
```

**Implementação:**

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '~/lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip auth for public routes
  const publicRoutes = [
    '/api/webhooks',     // Webhooks públicos
    '/api/workers',      // Worker interno (chamado por QStash)
    '/login',
    '/signup',
    '/_next',
    '/favicon.ico'
  ]

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Require auth for all other routes
  const session = await getSession()

  if (!session) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Add organization context to headers (available in API routes)
  const response = NextResponse.next()
  response.headers.set('x-organization-id', session.organizationId)
  response.headers.set('x-organization-slug', session.organizationSlug)
  response.headers.set('x-user-role', session.role)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}
```

✅ Testes passam

---

### Phase 4: Multi-Tenant Data Access

#### 4.1 Test: Executions Filtered by Organization

**Test First:**
```typescript
// __tests__/api/executions-list.test.ts
import { db } from '~/lib/db'

describe('Executions List (Multi-Tenant)', () => {
  it('should only return executions from user organization', async () => {
    // Create two organizations
    const org1 = await db.organization.create({
      data: { name: 'Org 1', slug: 'org1' }
    })

    const org2 = await db.organization.create({
      data: { name: 'Org 2', slug: 'org2' }
    })

    // Create workflows
    await db.workflow.create({
      data: {
        workflowId: 'test-wf',
        name: 'Test',
        organizationId: org1.id
      }
    })

    await db.workflow.create({
      data: {
        workflowId: 'test-wf',
        name: 'Test',
        organizationId: org2.id
      }
    })

    // Create executions
    const exec1 = await db.execution.create({
      data: {
        workflowId: 'test-wf',
        organizationId: org1.id,
        status: 'COMPLETED'
      }
    })

    const exec2 = await db.execution.create({
      data: {
        workflowId: 'test-wf',
        organizationId: org2.id,
        status: 'COMPLETED'
      }
    })

    // User from org1 should only see exec1
    const org1Executions = await db.execution.findMany({
      where: { organizationId: org1.id }
    })

    expect(org1Executions).toHaveLength(1)
    expect(org1Executions[0]?.id).toBe(exec1.id)

    // User from org2 should only see exec2
    const org2Executions = await db.execution.findMany({
      where: { organizationId: org2.id }
    })

    expect(org2Executions).toHaveLength(1)
    expect(org2Executions[0]?.id).toBe(exec2.id)
  })
})
```

✅ Teste passa

---

#### 4.2 Test: tRPC Procedures with Organization Context

**Test First:**
```typescript
// __tests__/api/trpc/executions.test.ts
import { appRouter } from '~/server/api/root'
import { createInnerTRPCContext } from '~/server/api/trpc'
import { db } from '~/lib/db'

describe('tRPC Executions Procedures', () => {
  it('should list executions filtered by organization', async () => {
    const org = await db.organization.create({
      data: { name: 'Test Org', slug: 'test-org' }
    })

    const user = await db.user.create({
      data: { email: 'test@test.com', name: 'Test' }
    })

    await db.organizationMember.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role: 'MEMBER'
      }
    })

    // Create workflow
    await db.workflow.create({
      data: {
        workflowId: 'test-wf',
        name: 'Test',
        organizationId: org.id
      }
    })

    // Create execution
    await db.execution.create({
      data: {
        workflowId: 'test-wf',
        organizationId: org.id,
        status: 'COMPLETED'
      }
    })

    // Create context with session
    const ctx = createInnerTRPCContext({
      session: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name || undefined
        },
        organizationId: org.id,
        organizationSlug: org.slug,
        role: 'MEMBER'
      }
    })

    // Call procedure
    const caller = appRouter.createCaller(ctx)
    const executions = await caller.execution.list()

    expect(executions).toHaveLength(1)
    expect(executions[0]?.organizationId).toBe(org.id)
  })

  it('should prevent accessing execution from different organization', async () => {
    const org1 = await db.organization.create({
      data: { name: 'Org 1', slug: 'org1' }
    })

    const org2 = await db.organization.create({
      data: { name: 'Org 2', slug: 'org2' }
    })

    const user = await db.user.create({
      data: { email: 'test@test.com', name: 'Test' }
    })

    await db.organizationMember.create({
      data: { organizationId: org1.id, userId: user.id, role: 'MEMBER' }
    })

    // Create workflow in org2
    await db.workflow.create({
      data: {
        workflowId: 'test-wf',
        name: 'Test',
        organizationId: org2.id
      }
    })

    // Create execution in org2
    const execution = await db.execution.create({
      data: {
        workflowId: 'test-wf',
        organizationId: org2.id,
        status: 'COMPLETED'
      }
    })

    // User from org1 tries to access execution from org2
    const ctx = createInnerTRPCContext({
      session: {
        user: { id: user.id, email: user.email },
        organizationId: org1.id,
        organizationSlug: 'org1',
        role: 'MEMBER'
      }
    })

    const caller = appRouter.createCaller(ctx)

    await expect(
      caller.execution.getById({ id: execution.id })
    ).rejects.toThrow('Execution not found')
  })
})
```

**Implementação:**

```typescript
// src/server/api/routers/execution.ts
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const executionRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().default(0)
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { organizationId } = ctx.session

      return ctx.db.execution.findMany({
        where: {
          organizationId  // ← Filtra por org
        },
        orderBy: { startedAt: 'desc' },
        take: input?.limit || 20,
        skip: input?.offset || 0,
        include: {
          logs: {
            orderBy: { startedAt: 'asc' }
          }
        }
      })
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { organizationId } = ctx.session

      const execution = await ctx.db.execution.findFirst({
        where: {
          id: input.id,
          organizationId  // ← Valida acesso
        },
        include: {
          logs: {
            orderBy: { startedAt: 'asc' }
          }
        }
      })

      if (!execution) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Execution not found'
        })
      }

      return execution
    })
})
```

✅ Testes passam

---

### Phase 5: Webhook Multi-Tenant Support

#### 5.1 Test: Webhook with Organization Slug

**Test First:**
```typescript
// __tests__/api/webhooks-multi-tenant.test.ts
import { POST } from '~/app/api/webhooks/[orgSlug]/[workflowId]/route'
import { db } from '~/lib/db'

describe('POST /api/webhooks/[orgSlug]/[workflowId]', () => {
  it('should create execution for correct organization', async () => {
    const org = await db.organization.create({
      data: { name: 'Test Org', slug: 'test-org' }
    })

    await db.workflow.create({
      data: {
        workflowId: 'tally-to-clickup',
        name: 'Tally → ClickUp',
        organizationId: org.id
      }
    })

    const request = new Request('http://localhost/api/webhooks/test-org/tally-to-clickup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' })
    })

    const response = await POST(request, {
      params: Promise.resolve({ orgSlug: 'test-org', workflowId: 'tally-to-clickup' })
    })

    expect(response.status).toBe(200)

    const body = await response.json()
    const execution = await db.execution.findUnique({
      where: { id: body.executionId }
    })

    expect(execution?.organizationId).toBe(org.id)
  })

  it('should return 404 if organization not found', async () => {
    const request = new Request('http://localhost/api/webhooks/nonexistent/workflow', {
      method: 'POST',
      body: JSON.stringify({})
    })

    const response = await POST(request, {
      params: Promise.resolve({ orgSlug: 'nonexistent', workflowId: 'workflow' })
    })

    expect(response.status).toBe(404)
  })

  it('should return 404 if workflow not active', async () => {
    const org = await db.organization.create({
      data: { name: 'Test', slug: 'test' }
    })

    await db.workflow.create({
      data: {
        workflowId: 'inactive-workflow',
        name: 'Inactive',
        organizationId: org.id,
        isActive: false
      }
    })

    const request = new Request('http://localhost/api/webhooks/test/inactive-workflow', {
      method: 'POST',
      body: JSON.stringify({})
    })

    const response = await POST(request, {
      params: Promise.resolve({ orgSlug: 'test', workflowId: 'inactive-workflow' })
    })

    expect(response.status).toBe(404)
  })
})
```

**Implementação:**

```typescript
// src/app/api/webhooks/[orgSlug]/[workflowId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '~/lib/db'
import { getWorkflow } from '~/workflows/registry'
import { enqueueNode } from '~/lib/qstash'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; workflowId: string }> }
) {
  const { orgSlug, workflowId } = await params

  // 1. Buscar organization pelo slug
  const org = await db.organization.findUnique({
    where: { slug: orgSlug }
  })

  if (!org) {
    return NextResponse.json(
      { error: 'Organization not found' },
      { status: 404 }
    )
  }

  // 2. Buscar workflow da organização
  const workflowRecord = await db.workflow.findUnique({
    where: {
      workflowId_organizationId: {
        workflowId,
        organizationId: org.id
      }
    }
  })

  if (!workflowRecord || !workflowRecord.isActive) {
    return NextResponse.json(
      { error: 'Workflow not found or inactive' },
      { status: 404 }
    )
  }

  // 3. Validar se workflow existe no código
  const workflow = getWorkflow(workflowId)
  if (!workflow) {
    return NextResponse.json(
      { error: 'Workflow not implemented' },
      { status: 404 }
    )
  }

  // 4. Pegar payload
  const payload = await req.json()

  // 5. Criar execution (com organizationId)
  const execution = await db.execution.create({
    data: {
      workflowId,
      organizationId: org.id,
      status: 'RUNNING',
      currentNodeIndex: 0
    }
  })

  // 6. Enfileirar Node 0
  await enqueueNode({
    executionId: execution.id,
    nodeIndex: 0,
    input: {
      data: payload,
      itemIndex: 0
    }
  })

  return NextResponse.json({ executionId: execution.id })
}
```

**Mover arquivo:**
```bash
# Old: src/app/api/webhooks/[workflowId]/route.ts
# New: src/app/api/webhooks/[orgSlug]/[workflowId]/route.ts
```

✅ Testes passam

---

### Phase 6: Dashboard UI with Auth

#### 6.1 Login Page

**Implementação:**
```typescript
// src/app/login/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          BuildZero Flow
        </h1>
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-slate-800 shadow-xl'
            }
          }}
          afterSignInUrl="/"
          afterSignUpUrl="/onboarding"
        />
      </div>
    </div>
  )
}
```

#### 6.2 Onboarding (Create Organization)

```typescript
// src/app/onboarding/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '~/trpc/react'

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  const createOrg = api.organization.create.useMutation({
    onSuccess: () => {
      router.push('/')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createOrg.mutate({ name, slug })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="max-w-md w-full bg-slate-800 rounded-lg p-8">
        <h1 className="text-2xl font-bold text-white mb-6">
          Create Your Organization
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded"
              placeholder="BuildZero"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Slug (webhook URL)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded"
              placeholder="buildzero"
              pattern="[a-z0-9-]+"
              required
            />
            <p className="text-sm text-slate-400 mt-1">
              Your webhook URL: flow.buildzero.ai/api/webhooks/<strong>{slug || 'your-slug'}</strong>/workflow-id
            </p>
          </div>

          <button
            type="submit"
            disabled={createOrg.isPending}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
          >
            {createOrg.isPending ? 'Creating...' : 'Create Organization'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

#### 6.3 Update Dashboard to Show Organization Context

```typescript
// src/app/page.tsx (ou executions/page.tsx)
import { getSession } from '~/lib/auth'
import { db } from '~/lib/db'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const executions = await db.execution.findMany({
    where: {
      organizationId: session.organizationId
    },
    orderBy: { startedAt: 'desc' },
    take: 20,
    include: {
      logs: true
    }
  })

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">BuildZero Flow</h1>
            <p className="text-sm text-slate-400">
              Organization: {session.organizationSlug}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{session.user.email}</span>
            <span className="px-3 py-1 bg-slate-700 text-xs text-slate-300 rounded-full">
              {session.role}
            </span>
            {/* Clerk UserButton component here */}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Recent Executions</h2>
        {/* Execution list here */}
      </main>
    </div>
  )
}
```

---

### Phase 7: Migration Script (Existing Data)

**Script para migrar dados existentes:**

```typescript
// scripts/migrate-to-multi-tenant.ts
import { db } from '~/lib/db'

async function migrate() {
  console.log('🚀 Starting multi-tenant migration...')

  // 1. Criar organização padrão
  const defaultOrg = await db.organization.create({
    data: {
      name: 'BuildZero (Migrated)',
      slug: 'buildzero'
    }
  })

  console.log(`✅ Created default organization: ${defaultOrg.slug}`)

  // 2. Criar workflows para a org
  const workflowIds = ['tally-to-clickup', 'stripe-to-meta-pixel']

  for (const workflowId of workflowIds) {
    await db.workflow.create({
      data: {
        workflowId,
        name: workflowId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        organizationId: defaultOrg.id
      }
    })
    console.log(`✅ Created workflow: ${workflowId}`)
  }

  // 3. Atualizar todas executions existentes
  const executionsUpdated = await db.execution.updateMany({
    where: {
      organizationId: null
    },
    data: {
      organizationId: defaultOrg.id
    }
  })

  console.log(`✅ Migrated ${executionsUpdated.count} executions`)

  console.log('🎉 Migration complete!')
}

migrate()
  .catch(console.error)
  .finally(() => process.exit())
```

**Rodar migration:**
```bash
bun run scripts/migrate-to-multi-tenant.ts
```

---

## 🔧 Environment Variables

```bash
# .env (add to existing)

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/login"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/signup"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"

# Clerk Webhook (for syncing users)
CLERK_WEBHOOK_SECRET="whsec_..."
```

---

## 📋 Deployment Checklist

### Pre-Deploy

- [ ] Todos os testes passando (`bun test`)
- [ ] Schema Prisma atualizado
- [ ] Migration script pronto
- [ ] Clerk app configurado (Dashboard, OAuth, etc)

### Deploy Steps

1. **Database Migration:**
   ```bash
   # Backup database first!
   pg_dump $DATABASE_URL > backup.sql

   # Apply schema changes
   bunx prisma db push

   # Run migration script
   bun run scripts/migrate-to-multi-tenant.ts
   ```

2. **Configure Clerk:**
   ```bash
   # Add env vars to Vercel
   vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   vercel env add CLERK_SECRET_KEY
   vercel env add CLERK_WEBHOOK_SECRET
   ```

3. **Update Webhooks:**
   ```
   Old: https://flow.buildzero.ai/api/webhooks/tally-to-clickup
   New: https://flow.buildzero.ai/api/webhooks/buildzero/tally-to-clickup
                                                        ^^^^^^^^ org slug
   ```

4. **Deploy:**
   ```bash
   git add .
   git commit -m "feat(plan-04): add multi-tenant authentication"
   git push
   ```

5. **Smoke Test:**
   - [ ] Login funciona
   - [ ] Dashboard mostra apenas executions da org
   - [ ] Webhook com org slug funciona
   - [ ] Novo usuário pode criar org

---

## ✅ Success Criteria

- [ ] User model implementado
- [ ] Organization model implementado
- [ ] OrganizationMember com RBAC
- [ ] Workflow pertence a org
- [ ] Execution vinculada a org
- [ ] AuthProvider abstraction (Clerk)
- [ ] Middleware protege dashboard
- [ ] Webhooks com org slug funcionam
- [ ] Dashboard filtra por organizationId
- [ ] tRPC procedures validam org
- [ ] Login/Signup UI
- [ ] Onboarding (create org)
- [ ] Migration script testado
- [ ] Todos testes passando
- [ ] Deploy em produção funcionando

---

## 🎯 Testing Strategy

### Unit Tests (Models)
```bash
bun test __tests__/db/user.test.ts
bun test __tests__/db/organization.test.ts
bun test __tests__/db/workflow.test.ts
```

### Integration Tests (Auth)
```bash
bun test __tests__/lib/auth/clerk-provider.test.ts
bun test __tests__/middleware.test.ts
```

### Integration Tests (API)
```bash
bun test __tests__/api/webhooks-multi-tenant.test.ts
bun test __tests__/api/trpc/executions.test.ts
```

### E2E Test (Full Flow)
```bash
bun test __tests__/e2e/multi-tenant-workflow.test.ts
```

**E2E Test Example:**
```typescript
describe('E2E: Multi-Tenant Workflow', () => {
  it('should isolate executions between organizations', async () => {
    // 1. Create two organizations
    const org1 = await createTestOrg('Org 1', 'org1')
    const org2 = await createTestOrg('Org 2', 'org2')

    // 2. Create workflows for each
    await createTestWorkflow('test-wf', org1.id)
    await createTestWorkflow('test-wf', org2.id)

    // 3. Trigger webhooks
    await fetch('/api/webhooks/org1/test-wf', { method: 'POST', body: '{}' })
    await fetch('/api/webhooks/org2/test-wf', { method: 'POST', body: '{}' })

    // 4. Verify isolation
    const org1Executions = await getExecutions(org1.id)
    const org2Executions = await getExecutions(org2.id)

    expect(org1Executions).toHaveLength(1)
    expect(org2Executions).toHaveLength(1)
    expect(org1Executions[0]?.id).not.toBe(org2Executions[0]?.id)
  })
})
```

---

## 🚀 Next Steps (Phase 5 - Future)

Após Plan 04 completo, futuras melhorias:

1. **Organization Settings Page**
   - Gerenciar membros
   - API keys management
   - Workflow activation/deactivation

2. **Audit Log**
   - Track who did what (member added, workflow created, etc)

3. **Usage Metrics**
   - Executions per organization
   - Cost tracking

4. **Team Invitations**
   - Email invites
   - Pending invitations

5. **NextAuth Migration**
   - Implementar `NextAuthProvider`
   - Migrar de Clerk sem breaking changes

---

## 📚 References

- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Organizations](https://clerk.com/docs/organizations/overview)
- [Multi-Tenant Architecture Patterns](https://docs.aws.amazon.com/whitepapers/latest/saas-architecture-fundamentals/multi-tenant-architecture.html)
- [tRPC Context & Auth](https://trpc.io/docs/server/context)
- [Prisma Multi-Tenant](https://www.prisma.io/docs/guides/database/multi-tenancy)

---

**Estimated Time:** 8-12 hours
**Complexity:** High (architectural changes)
**Risk:** Medium (requires careful testing + migration)

---

## 💡 Key Architectural Decisions Summary

1. **Organization-based tenancy** (not user-based)
2. **Clerk with abstraction layer** (not vendor lock-in)
3. **Webhook slug-based routing** (public, no API keys needed)
4. **RBAC with 3 roles** (Owner, Admin, Member)
5. **Execution isolation via organizationId** (indexed for performance)
6. **Middleware for dashboard protection** (webhooks remain public)
7. **Migration-friendly design** (can add NextAuth later without code changes)
