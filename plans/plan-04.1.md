# Plan 4.1 - Simplify to User-Based Tenancy

**Objetivo:** Simplificar arquitetura multi-tenant removendo Organizations e mantendo isolamento por User.

**Status:** 🔴 TODO

---

## 🎯 Problema Identificado

A arquitetura atual com Organizations está **excessivamente complexa** para o caso de uso:
- ❌ User → OrganizationMember → Organization → Workflows (4 níveis)
- ❌ UI usando componentes Clerk (UserButton, OrganizationList)
- ❌ Rotas complexas: `/org/[orgSlug]/[workflowId]`
- ❌ Desviou do design original (dark theme slate)

## ✅ Solução Simplificada

**User-Based Tenancy:**
- ✅ User → Workflows (2 níveis)
- ✅ Cada user vê apenas seus próprios workflows
- ✅ Clerk apenas como motor de auth (sem componentes na UI)
- ✅ Manter design original (dark theme slate)

---

## 📝 Mudanças Necessárias

### 1. Database Schema (Prisma)

**REMOVER:**
```prisma
model Organization { ... }
model OrganizationMember { ... }
enum Role { OWNER, ADMIN, MEMBER }
```

**MODIFICAR:**
```prisma
model User {
  id          String      @id @default(cuid())
  email       String      @unique
  clerkUserId String?     @unique
  name        String?
  image       String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  workflows   Workflow[]
  executions  Execution[]
  
  @@index([email])
  @@index([clerkUserId])
}

model Workflow {
  id          String    @id @default(cuid())
  workflowId  String
  name        String
  description String?
  userId      String    // ← CHANGE: era organizationId
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([workflowId, userId])
  @@index([userId])
  @@index([workflowId])
}

model Execution {
  id               String          @id @default(cuid())
  workflowId       String
  userId           String          // ← CHANGE: era organizationId
  status           ExecutionStatus @default(RUNNING)
  currentNodeIndex Int             @default(0)
  startedAt        DateTime        @default(now())
  finishedAt       DateTime?
  logs             ExecutionLog[]
  user             User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([workflowId])
  @@index([userId])
  @@index([status])
}
```

### 2. Auth Layer Simplification

**MANTER:**
- ✅ `AuthProvider` abstraction
- ✅ `ClerkAuthProvider` implementation
- ✅ `requireUser()` helper

**REMOVER:**
- ❌ `requireOrgContext()` helper
- ❌ `OrgContext` type
- ❌ Lógica de org selection no `getSession()`

**MODIFICAR:**
```typescript
// src/lib/auth/clerk-provider.ts
async getSession(): Promise<AuthSession | null> {
  const { userId } = await auth()
  
  if (!userId) return null
  
  // SIMPLIFICADO: apenas userId, sem org context
  return { userId }
}
```

### 3. Middleware Simplification

**REMOVER:**
- ❌ `/select-org` redirect logic
- ❌ `requiresOrgContext` matcher
- ❌ Org-scoped routes (`/org/:orgSlug/*`)

**MANTER:**
```typescript
// src/middleware.ts
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)', // Webhook validation by signature
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  
  // Se não autenticado em rota protegida, redireciona
  if (!userId && !isPublicRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }
  
  return NextResponse.next()
})
```

### 4. Webhook Simplification

**MUDAR ROTA:**
```
De: /api/webhooks/[orgSlug]/[workflowId]
Para: /api/webhooks/[workflowId]
```

**HANDLER:**
```typescript
// src/app/api/webhooks/[workflowId]/route.ts
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params

  // 1. Validate workflow exists in registry
  const workflowDefinition = getWorkflow(workflowId)
  if (!workflowDefinition) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
  }

  // 2. Get auth from header or query param (webhook secret)
  const authHeader = req.headers.get('authorization')
  const secret = new URL(req.url).searchParams.get('secret')
  
  // 3. Find user by webhook secret or auth
  const user = await db.user.findFirst({
    where: {
      // Implementar lógica de webhook auth
      // Por enquanto, pode buscar por workflowId único
    }
  })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 4. Check if user has this workflow active
  const workflow = await db.workflow.findUnique({
    where: {
      workflowId_userId: { workflowId, userId: user.id }
    }
  })

  if (!workflow) {
    return NextResponse.json(
      { error: 'Workflow not found for user' },
      { status: 404 }
    )
  }

  if (!workflow.isActive) {
    return NextResponse.json(
      { error: 'Workflow is inactive' },
      { status: 403 }
    )
  }

  // 5. Create execution
  const payload = await req.json()
  const execution = await db.execution.create({
    data: {
      workflowId,
      userId: user.id,
      status: 'RUNNING',
      currentNodeIndex: 0
    }
  })

  // 6. Enqueue first node
  await enqueueNode({
    executionId: execution.id,
    nodeIndex: 0,
    input: { data: payload, itemIndex: 0 }
  })

  return NextResponse.json({ executionId: execution.id })
}
```

### 5. tRPC Simplification

**REMOVER:**
- ❌ `orgProcedure`
- ❌ `organization` do context
- ❌ `orgId` do context

**CONTEXT:**
```typescript
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const user = await clerkAuth.getCurrentUser()
  const { userId } = await auth()

  return {
    db,
    user,
    userId,
    ...opts,
  }
}
```

**PROCEDURES:**
```typescript
// Manter apenas:
export const publicProcedure = t.procedure.use(timingMiddleware)

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.user || !ctx.userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in',
      })
    }
    return next({ ctx: { ...ctx, user: ctx.user, userId: ctx.userId } })
  })
```

### 6. UI Pages (Manter Design Original)

**REMOVER:**
- ❌ `/select-org` page
- ❌ Componentes Clerk: `<UserButton />`, `<OrganizationList />`
- ❌ `/workflows` page (temporária)

**MODIFICAR:**
- ✅ `/` (home) - Dashboard de executions **do usuário logado**
- ✅ `/sign-in` - Página de login (manter design original)
- ✅ `/sign-up` - Página de cadastro (manter design original)
- ✅ `/onboarding` - Criar user no banco e redirecionar para `/`

**HOME PAGE (`src/app/page.tsx`):**
```typescript
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { db } from "~/lib/db"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { userId } = await auth()
  
  // Se não logado, mostrar landing page ou redirecionar
  if (!userId) {
    redirect('/sign-in')
  }
  
  // Buscar user no banco
  const user = await db.user.findUnique({
    where: { clerkUserId: userId }
  })
  
  if (!user) {
    redirect('/onboarding')
  }
  
  // Buscar executions DO USUÁRIO
  const executions = await db.execution.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: 'desc' },
    take: 50
  })

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">BuildZero Flow</h1>
            <p className="text-slate-400 mt-2">
              Workflow execution dashboard - {user.email}
            </p>
          </div>
          <Link
            href="/api/auth/signout"
            className="text-slate-400 hover:text-white text-sm"
          >
            Sign out
          </Link>
        </div>

        <div className="bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">Recent Executions</h2>
          </div>

          <div className="divide-y divide-slate-700">
            {executions.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400">
                No executions yet
              </div>
            ) : (
              executions.map((execution) => (
                <Link
                  key={execution.id}
                  href={`/executions/${execution.id}`}
                  className="block px-6 py-4 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">
                        {execution.workflowId}
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        {execution.id}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-slate-400">
                        {new Date(execution.startedAt).toLocaleString()}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        execution.status === 'COMPLETED'
                          ? 'bg-green-500/20 text-green-400'
                          : execution.status === 'FAILED'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {execution.status}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
```

### 7. Auth Pages (Sem Componentes Clerk)

**Sign In (`src/app/sign-in/[[...sign-in]]/page.tsx`):**
```typescript
import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">BuildZero Flow</h1>
          <p className="mt-2 text-slate-400">Sign in to your account</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-slate-800/50 border border-slate-700",
            }
          }}
        />
      </div>
    </div>
  )
}
```

**Sign Up (similar):**
```typescript
// Mesmo padrão, usando SignUp component
```

**Onboarding (`src/app/onboarding/page.tsx`):**
```typescript
import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "~/lib/db"

export default async function OnboardingPage() {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId || !user) {
    redirect("/sign-in")
  }

  const email = user.emailAddresses[0]?.emailAddress
  if (!email) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="text-white">Error: No email found</div>
    </div>
  }

  // Criar ou atualizar user no banco
  let dbUser = await db.user.findUnique({
    where: { clerkUserId: userId }
  })

  if (!dbUser) {
    dbUser = await db.user.create({
      data: {
        email,
        clerkUserId: userId,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}`
          : user.firstName ?? user.lastName ?? undefined,
        image: user.imageUrl ?? undefined
      }
    })
  }

  redirect("/")
}
```

---

## 🧪 TDD Test Plan

### Phase 1: Database Schema Migration

**Red Phase - Testes que vão FALHAR:**

1. **User → Workflow relationship**
   ```typescript
   // __tests__/db/workflow-user.test.ts
   it('should create workflow for user', async () => {
     const user = await db.user.create({
       data: { email: 'test@test.com', clerkUserId: 'user_123' }
     })
     
     const workflow = await db.workflow.create({
       data: {
         workflowId: 'test-workflow',
         name: 'Test',
         userId: user.id // ← userId instead of organizationId
       }
     })
     
     expect(workflow.userId).toBe(user.id)
   })
   ```

2. **Execution → User relationship**
   ```typescript
   it('should create execution for user', async () => {
     const user = await db.user.create({
       data: { email: 'test@test.com', clerkUserId: 'user_123' }
     })
     
     const execution = await db.execution.create({
       data: {
         workflowId: 'test',
         userId: user.id, // ← userId instead of organizationId
         status: 'RUNNING'
       }
     })
     
     expect(execution.userId).toBe(user.id)
   })
   ```

3. **User isolation test**
   ```typescript
   it('should isolate workflows by user', async () => {
     const user1 = await db.user.create({
       data: { email: 'user1@test.com', clerkUserId: 'user_1' }
     })
     
     const user2 = await db.user.create({
       data: { email: 'user2@test.com', clerkUserId: 'user_2' }
     })
     
     await db.workflow.create({
       data: {
         workflowId: 'test-workflow',
         name: 'Test',
         userId: user1.id
       }
     })
     
     await db.workflow.create({
       data: {
         workflowId: 'test-workflow',
         name: 'Test',
         userId: user2.id
       }
     })
     
     const user1Workflows = await db.workflow.findMany({
       where: { userId: user1.id }
     })
     
     expect(user1Workflows).toHaveLength(1)
     expect(user1Workflows[0]?.userId).toBe(user1.id)
   })
   ```

**Green Phase - Implementar:**
1. Atualizar `prisma/schema.prisma`
2. Rodar `prisma db push`
3. Regenerar Prisma Client
4. Testes passam ✅

### Phase 2: Webhook Simplification

**Red Phase:**
```typescript
// __tests__/api/webhooks-simple.test.ts
it('should accept webhook without org slug', async () => {
  const user = await db.user.create({
    data: { email: 'test@test.com', clerkUserId: 'user_123' }
  })
  
  await db.workflow.create({
    data: {
      workflowId: 'test-workflow',
      name: 'Test',
      userId: user.id,
      isActive: true
    }
  })
  
  const req = new NextRequest(
    'http://localhost:3000/api/webhooks/test-workflow?secret=user_123',
    {
      method: 'POST',
      body: JSON.stringify({ test: 'data' })
    }
  )
  
  const response = await POST(req, {
    params: Promise.resolve({ workflowId: 'test-workflow' })
  })
  
  expect(response.status).toBe(200)
  
  const data = await response.json()
  expect(data.executionId).toBeDefined()
})
```

**Green Phase:**
1. Criar nova rota `/api/webhooks/[workflowId]/route.ts`
2. Implementar handler simplificado
3. Remover rota antiga `/api/webhooks/[orgSlug]/[workflowId]`
4. Testes passam ✅

### Phase 3: Auth & Middleware

**Red Phase:**
```typescript
// __tests__/lib/auth/helpers-simple.test.ts
it('should require user without org context', async () => {
  (currentUser as any).mockResolvedValue({
    id: 'user_123',
    emailAddresses: [{ emailAddress: 'test@test.com' }]
  })
  
  const user = await requireUser()
  
  expect(user.id).toBe('user_123')
  expect(user.email).toBe('test@test.com')
})
```

**Green Phase:**
1. Atualizar `src/lib/auth/helpers.ts` (remover `requireOrgContext`)
2. Atualizar `src/middleware.ts` (simplificar)
3. Testes passam ✅

### Phase 4: tRPC

**Red Phase:**
```typescript
// __tests__/server/trpc-simple.test.ts
it('should have user context in protected procedure', async () => {
  // Mock context
  const ctx = await createTRPCContext({ headers: new Headers() })
  
  expect(ctx.userId).toBeDefined()
  expect(ctx.user).toBeDefined()
  expect(ctx.organization).toBeUndefined() // ← Não existe mais
})
```

**Green Phase:**
1. Atualizar `src/server/api/trpc.ts`
2. Remover `orgProcedure`
3. Simplificar context
4. Testes passam ✅

### Phase 5: UI Pages

**Red Phase:**
```typescript
// __tests__/app/home.test.ts
it('should show user executions on home page', async () => {
  // Teste de integração da página home
  // Verificar que apenas executions do usuário logado aparecem
})
```

**Green Phase:**
1. Atualizar `src/app/page.tsx`
2. Criar `src/app/onboarding/page.tsx`
3. Atualizar sign-in/sign-up pages
4. Remover `/workflows` e `/select-org`
5. Testes passam ✅

---

## 📊 Checklist de Implementação

### Database
- [ ] Atualizar schema.prisma (remover Organization, OrganizationMember, Role)
- [ ] Modificar Workflow (organizationId → userId)
- [ ] Modificar Execution (organizationId → userId)
- [ ] Criar testes de relacionamento User → Workflow
- [ ] Criar testes de relacionamento User → Execution
- [ ] Criar testes de isolamento por user
- [ ] Rodar prisma db push
- [ ] Regenerar Prisma Client
- [ ] ✅ Testes passam

### Auth & Middleware
- [ ] Remover `requireOrgContext()` de helpers.ts
- [ ] Remover lógica de org do `getSession()`
- [ ] Simplificar middleware (remover org routes)
- [ ] Atualizar .env (remover AFTER_SIGN_IN_URL=/select-org)
- [ ] Criar testes de auth simplificada
- [ ] ✅ Testes passam

### Webhook
- [ ] Criar nova rota `/api/webhooks/[workflowId]/route.ts`
- [ ] Implementar auth por secret/header
- [ ] Criar testes de webhook simplificado
- [ ] Remover rota antiga `/api/webhooks/[orgSlug]/[workflowId]`
- [ ] ✅ Testes passam

### tRPC
- [ ] Remover `orgProcedure` de trpc.ts
- [ ] Simplificar context (remover organization, orgId)
- [ ] Atualizar testes de tRPC
- [ ] ✅ Testes passam

### UI
- [ ] Atualizar `src/app/page.tsx` (filtrar executions por userId)
- [ ] Criar `src/app/onboarding/page.tsx` (criar user no banco)
- [ ] Atualizar sign-in page (manter design slate)
- [ ] Atualizar sign-up page (manter design slate)
- [ ] Remover `/workflows` page
- [ ] Remover `/select-org` page
- [ ] Remover componentes Clerk da UI (UserButton, etc)
- [ ] Adicionar link de "Sign out" no header
- [ ] ✅ Build passa

### Cleanup
- [ ] Remover testes antigos de Organization
- [ ] Remover testes antigos de OrganizationMember
- [ ] Atualizar MULTI_TENANT_IMPLEMENTATION.md
- [ ] Criar SIMPLIFIED_ARCHITECTURE.md
- [ ] ✅ Todos os testes passam

---

## 🎯 Resultado Final

**Antes (Complexo):**
```
User → OrganizationMember → Organization → Workflows
                                        ↓
                                    Executions
```

**Depois (Simples):**
```
User → Workflows
    ↓
  Executions
```

**Benefícios:**
- ✅ 50% menos código
- ✅ 3 tabelas a menos no banco
- ✅ Webhook mais simples: `/api/webhooks/[workflowId]`
- ✅ UI mantém design original (dark slate theme)
- ✅ Clerk apenas como motor (sem componentes na UI)
- ✅ Isolamento por user (cada user vê apenas seus workflows)

---

**Tempo Estimado:** 45-60 minutos com TDD rigoroso
**Risco:** Baixo (mantemos abstração de AuthProvider)
**Reversível:** Sim (temos testes cobrindo tudo)
