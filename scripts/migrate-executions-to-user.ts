import { db } from '~/lib/db'

async function migrateExecutions() {
  try {
    console.log('🔄 Migrando executions para o usuário correto...\n')

    // Email do usuário real
    const targetEmail = 'pedrohnas0@gmail.com'

    // Buscar ou criar usuário target
    let targetUser = await db.user.findUnique({
      where: { email: targetEmail }
    })

    if (!targetUser) {
      console.log(`📝 Criando usuário ${targetEmail}...`)
      targetUser = await db.user.create({
        data: {
          email: targetEmail,
          name: 'Pedro Henrique'
        }
      })
      console.log(`✅ Usuário criado: ${targetUser.id}\n`)
    } else {
      console.log(`✓ Usuário já existe: ${targetUser.id}\n`)
    }

    // Buscar usuário system
    const systemUser = await db.user.findUnique({
      where: { email: 'system@buildzero.ai' }
    })

    if (!systemUser) {
      console.log('⚠️  Usuário system não encontrado!')
      return
    }

    console.log(`📊 Usuário system: ${systemUser.id}`)

    // Contar executions do system
    const systemExecutions = await db.execution.count({
      where: { userId: systemUser.id }
    })

    console.log(`   Executions do system: ${systemExecutions}\n`)

    if (systemExecutions === 0) {
      console.log('✓ Nenhuma execution para migrar')
      return
    }

    // Migrar todas as executions
    console.log(`🔄 Migrando ${systemExecutions} executions...`)

    const result = await db.execution.updateMany({
      where: { userId: systemUser.id },
      data: { userId: targetUser.id }
    })

    console.log(`✅ ${result.count} executions migradas!\n`)

    // Verificação final
    const targetExecutions = await db.execution.count({
      where: { userId: targetUser.id }
    })

    const remainingSystemExecutions = await db.execution.count({
      where: { userId: systemUser.id }
    })

    console.log('📋 Verificação:')
    console.log(`   Executions do ${targetEmail}: ${targetExecutions}`)
    console.log(`   Executions do system restantes: ${remainingSystemExecutions}`)

    if (remainingSystemExecutions === 0) {
      console.log('\n✅ Migration concluída com sucesso!')
      console.log(`   Todas as executions agora pertencem a ${targetEmail}`)
    }

  } catch (error) {
    console.error('\n❌ Erro durante migration:')
    console.error(error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

migrateExecutions()
