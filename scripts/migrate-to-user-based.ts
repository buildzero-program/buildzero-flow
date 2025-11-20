/**
 * Migration Script: Organization-based -> User-based Tenancy
 *
 * Este script migra dados existentes em produção de forma segura:
 * 1. Cria tabela User (se não existir)
 * 2. Cria usuário "system" padrão
 * 3. Adiciona coluna userId em Execution (nullable)
 * 4. Popula userId com o user system
 * 5. Torna userId NOT NULL
 * 6. Adiciona foreign key
 */

import { db } from '~/lib/db'

async function migrate() {
  console.log('🚀 Iniciando migration para user-based tenancy...\n')

  try {
    // ========================================
    // ETAPA 1: Verificar tabelas existentes
    // ========================================
    console.log('📋 [1/7] Verificando estrutura atual...')

    const tables = await db.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `

    const tableNames = tables.map(t => t.tablename)
    console.log(`   Tabelas encontradas: ${tableNames.join(', ')}`)

    const hasUserTable = tableNames.includes('User')
    const hasExecution = tableNames.includes('Execution')

    if (!hasExecution) {
      throw new Error('Tabela Execution não encontrada! Verifique o banco.')
    }

    // ========================================
    // ETAPA 2: Criar tabela User
    // ========================================
    if (!hasUserTable) {
      console.log('\n📝 [2/7] Criando tabela User...')

      await db.$executeRaw`
        CREATE TABLE "User" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "name" TEXT,
          "image" TEXT,
          "clerkUserId" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
        )
      `

      await db.$executeRaw`
        CREATE UNIQUE INDEX "User_email_key" ON "User"("email")
      `

      await db.$executeRaw`
        CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId")
      `

      await db.$executeRaw`
        CREATE INDEX "User_email_idx" ON "User"("email")
      `

      await db.$executeRaw`
        CREATE INDEX "User_clerkUserId_idx" ON "User"("clerkUserId")
      `

      console.log('   ✅ Tabela User criada com sucesso!')
    } else {
      console.log('\n✓ [2/7] Tabela User já existe')
    }

    // ========================================
    // ETAPA 3: Criar usuário system
    // ========================================
    console.log('\n👤 [3/7] Criando usuário "system"...')

    const systemEmail = 'system@buildzero.ai'

    // Verificar se já existe
    const existingUser = await db.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "User" WHERE email = ${systemEmail}
    `

    let systemUserId: string

    if (existingUser.length > 0) {
      systemUserId = existingUser[0]!.id
      console.log(`   ✓ Usuário system já existe (ID: ${systemUserId})`)
    } else {
      // Gerar ID único (cuid-like)
      systemUserId = `cm_system_${Date.now()}`

      await db.$executeRaw`
        INSERT INTO "User" ("id", "email", "name", "createdAt", "updatedAt")
        VALUES (
          ${systemUserId},
          ${systemEmail},
          'System User (Legacy Data)',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      `

      console.log(`   ✅ Usuário system criado (ID: ${systemUserId})`)
    }

    // ========================================
    // ETAPA 4: Verificar se coluna userId já existe
    // ========================================
    console.log('\n🔍 [4/7] Verificando coluna userId...')

    const columns = await db.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Execution'
    `

    const hasUserId = columns.some(c => c.column_name === 'userId')

    // ========================================
    // ETAPA 5: Adicionar coluna userId (nullable)
    // ========================================
    if (!hasUserId) {
      console.log('\n➕ [5/7] Adicionando coluna userId (nullable)...')

      await db.$executeRaw`
        ALTER TABLE "Execution"
        ADD COLUMN "userId" TEXT
      `

      console.log('   ✅ Coluna userId adicionada!')
    } else {
      console.log('\n✓ [5/7] Coluna userId já existe')
    }

    // ========================================
    // ETAPA 6: Popular userId com system user
    // ========================================
    console.log('\n📊 [6/7] Populando userId nos registros existentes...')

    const updateResult = await db.$executeRaw`
      UPDATE "Execution"
      SET "userId" = ${systemUserId}
      WHERE "userId" IS NULL
    `

    console.log(`   ✅ ${updateResult} registros atualizados`)

    // Verificar se ainda há registros sem userId
    const nullCount = await db.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM "Execution" WHERE "userId" IS NULL
    `

    if (Number(nullCount[0]?.count) > 0) {
      throw new Error(`Ainda há ${nullCount[0]?.count} executions sem userId!`)
    }

    // ========================================
    // ETAPA 7: Tornar userId NOT NULL e adicionar FK
    // ========================================
    console.log('\n🔒 [7/7] Aplicando constraints...')

    // Verificar se a constraint NOT NULL já existe
    const constraints = await db.$queryRaw<Array<{ is_nullable: string }>>`
      SELECT is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Execution' AND column_name = 'userId'
    `

    const isNullable = constraints[0]?.is_nullable === 'YES'

    if (isNullable) {
      await db.$executeRaw`
        ALTER TABLE "Execution"
        ALTER COLUMN "userId" SET NOT NULL
      `
      console.log('   ✅ Coluna userId agora é NOT NULL')
    } else {
      console.log('   ✓ Coluna userId já é NOT NULL')
    }

    // Verificar se FK já existe
    const fks = await db.$queryRaw<Array<{ constraint_name: string }>>`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'Execution'
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name = 'Execution_userId_fkey'
    `

    if (fks.length === 0) {
      await db.$executeRaw`
        ALTER TABLE "Execution"
        ADD CONSTRAINT "Execution_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id")
        ON DELETE CASCADE
      `
      console.log('   ✅ Foreign key adicionada')
    } else {
      console.log('   ✓ Foreign key já existe')
    }

    // Adicionar índice
    const indexes = await db.$queryRaw<Array<{ indexname: string }>>`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'Execution' AND indexname = 'Execution_userId_idx'
    `

    if (indexes.length === 0) {
      await db.$executeRaw`
        CREATE INDEX "Execution_userId_idx" ON "Execution"("userId")
      `
      console.log('   ✅ Índice criado')
    } else {
      console.log('   ✓ Índice já existe')
    }

    // ========================================
    // VERIFICAÇÃO FINAL
    // ========================================
    console.log('\n✅ [VERIFICAÇÃO] Validando integridade dos dados...')

    const finalCount = await db.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM "Execution" WHERE "userId" IS NOT NULL
    `

    const totalExecs = await db.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM "Execution"
    `

    console.log(`   Total de Executions: ${totalExecs[0]?.count}`)
    console.log(`   Com userId válido: ${finalCount[0]?.count}`)

    if (finalCount[0]?.count !== totalExecs[0]?.count) {
      throw new Error('Alguns registros ainda estão sem userId!')
    }

    console.log('\n🎉 Migration concluída com sucesso!')
    console.log('\n📋 Resumo:')
    console.log(`   - User "system" criado: ${systemUserId}`)
    console.log(`   - Executions migradas: ${finalCount[0]?.count}`)
    console.log(`   - Coluna userId: NOT NULL ✓`)
    console.log(`   - Foreign key: Adicionada ✓`)
    console.log(`   - Índice: Criado ✓`)

  } catch (error) {
    console.error('\n❌ ERRO durante migration:')
    console.error(error)
    console.error('\n⚠️  O banco pode estar em estado inconsistente!')
    console.error('   Revise manualmente ou faça rollback.')
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

// Executar migration
migrate()
