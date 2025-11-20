import { db } from '~/lib/db'

async function checkOldSchema() {
  try {
    // Verificar tabelas existentes
    const tables = await db.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `

    console.log('📊 Tabelas no banco de PRODUÇÃO:')
    tables.forEach(t => console.log(`   - ${t.tablename}`))

    // Contar executions e logs
    const execCount = await db.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM "Execution"
    `

    const logCount = await db.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM "ExecutionLog"
    `

    // Ver colunas da tabela Execution
    const columns = await db.$queryRaw<Array<{ column_name: string, data_type: string }>>`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'Execution'
      ORDER BY ordinal_position
    `

    console.log('\n📋 Colunas da tabela Execution:')
    columns.forEach(c => console.log(`   - ${c.column_name} (${c.data_type})`))

    console.log('\n📈 Dados encontrados:')
    console.log(`   Executions: ${execCount[0]?.count}`)
    console.log(`   ExecutionLogs: ${logCount[0]?.count}`)

    if (Number(execCount[0]?.count) > 0) {
      console.log('\n⚠️  HÁ DADOS EM PRODUÇÃO!')
      console.log('   Precisa criar script de migration!')

      // Mostrar uma amostra dos dados
      const sample = await db.$queryRaw<Array<any>>`
        SELECT * FROM "Execution" LIMIT 3
      `
      console.log('\n📄 Amostra de dados:')
      console.log(JSON.stringify(sample, null, 2))
    } else {
      console.log('\n✅ Banco vazio - migration segura!')
    }

  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await db.$disconnect()
  }
}

checkOldSchema()
