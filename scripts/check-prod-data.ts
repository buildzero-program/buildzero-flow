import { db } from '~/lib/db'

async function checkProdData() {
  try {
    const executionCount = await db.execution.count()
    const userCount = await db.user.count()

    console.log('📊 Dados em Produção:')
    console.log(`   Users: ${userCount}`)
    console.log(`   Executions: ${executionCount}`)

    if (executionCount > 0) {
      console.log('\n⚠️  HÁ DADOS EM PRODUÇÃO!')
      console.log('   A migration vai QUEBRAR se não for feita corretamente.')
    } else {
      console.log('\n✅ Banco vazio - migration segura!')
    }
  } catch (error) {
    console.error('Erro ao verificar:', error)
  } finally {
    await db.$disconnect()
  }
}

checkProdData()
