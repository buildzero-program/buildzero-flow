import { db } from '~/lib/db'

async function verify() {
  try {
    console.log('🔍 Verificando integridade após migration...\n')

    // Contar users
    const userCount = await db.user.count()
    console.log(`✓ Users: ${userCount}`)

    // Buscar user system
    const systemUser = await db.user.findUnique({
      where: { email: 'system@buildzero.ai' }
    })

    if (!systemUser) {
      throw new Error('User "system" não encontrado!')
    }

    console.log(`✓ User "system" encontrado: ${systemUser.id}`)

    // Contar executions
    const execCount = await db.execution.count()
    console.log(`✓ Executions: ${execCount}`)

    // Verificar se todas tem userId (usando raw query)
    const execWithUserId = await db.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM "Execution" WHERE "userId" IS NOT NULL
    `
    const execWithUserIdCount = Number(execWithUserId[0]?.count)

    console.log(`✓ Executions com userId: ${execWithUserIdCount}`)

    if (execCount !== execWithUserIdCount) {
      throw new Error(`${execCount - execWithUserIdCount} executions sem userId!`)
    }

    // Buscar uma amostra
    const sample = await db.execution.findMany({
      take: 3,
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    console.log('\n📄 Amostra de dados migrados:')
    sample.forEach((exec, i) => {
      console.log(`   [${i + 1}] Execution ${exec.id}`)
      console.log(`       → Workflow: ${exec.workflowId}`)
      console.log(`       → Status: ${exec.status}`)
      console.log(`       → User: ${exec.user.email}`)
    })

    console.log('\n✅ Migration verificada com sucesso!')
    console.log('   Todos os dados estão íntegros e prontos para uso.')

  } catch (error) {
    console.error('\n❌ Erro na verificação:')
    console.error(error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

verify()
