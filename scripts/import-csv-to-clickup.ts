import fs from 'fs'
import { parse } from 'csv-parse/sync'

// ClickUp API Config
const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY || ''
const CLICKUP_LIST_ID = '901322211570'
const EMAIL_CUSTOM_FIELD_ID = '3705639e-668f-4eb4-977c-5f865653b3c3'
const WHATSAPP_CUSTOM_FIELD_ID = '081c88b5-97a6-4e36-8c1f-61f2ac879913'
const SUBMISSION_ID_CUSTOM_FIELD_ID = 'd85e2e81-6a0a-4d4f-bc47-974c273cfb71'
const RESPONDENT_ID_CUSTOM_FIELD_ID = '0d49322b-72b5-4c3a-bb29-d784b894c1ee'
const SUBMISSION_DATE_CUSTOM_FIELD_ID = 'eeb58134-ec6f-4c35-a0f2-728f6b863bc9'

interface CSVRow {
  'Submission ID': string
  'Respondent ID': string
  'Submitted at': string
  Nome: string
  Sobrenome: string
  'E-mail\n': string // Note: tem \n no header
  WhatsApp: string
  'Como você ficou sabendo do BuildZero?': string
  'Ocupação atual': string
  'Faixa de faturamento mensal do seu negócio/operação': string
  'Qual seu principal objetivo nos próximos 90 dias?': string
  'Por que BuildZero faz sentido pro seu momento atual e por que devemos te aceitar na comunidade?': string
}

async function getExistingTasks() {
  const url = `https://api.clickup.com/api/v2/list/${CLICKUP_LIST_ID}/task?subtasks=true&include_closed=true`

  const response = await fetch(url, {
    headers: {
      'Authorization': CLICKUP_API_KEY,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  // Map Submission ID -> Task ID
  const submissionIdToTaskId = new Map<string, string>()

  for (const task of data.tasks || []) {
    const submissionField = task.custom_fields?.find((f: any) => f.id === SUBMISSION_ID_CUSTOM_FIELD_ID)
    if (submissionField?.value) {
      submissionIdToTaskId.set(submissionField.value.trim(), task.id)
    }
  }

  return submissionIdToTaskId
}

function prepareTaskData(row: CSVRow) {
  const email = row['E-mail\n']?.trim() || ''
  const nome = row.Nome?.trim() || ''
  const sobrenome = row.Sobrenome?.trim() || ''
  const whatsapp = row.WhatsApp?.trim() || ''
  const comoSoube = row['Como você ficou sabendo do BuildZero?']?.trim() || ''
  const ocupacao = row['Ocupação atual']?.trim() || ''
  const faturamento = row['Faixa de faturamento mensal do seu negócio/operação']?.trim() || ''
  const objetivo = row['Qual seu principal objetivo nos próximos 90 dias?']?.trim() || ''
  const porqueBuildZero = row['Por que BuildZero faz sentido pro seu momento atual e por que devemos te aceitar na comunidade?']?.trim() || ''
  const submissionId = row['Submission ID']?.trim() || ''
  const respondentId = row['Respondent ID']?.trim() || ''
  const submittedAt = row['Submitted at']?.trim() || ''

  // Convert "2025-11-13 17:58:20" to Unix timestamp (milliseconds)
  const submissionDate = submittedAt ? new Date(submittedAt).getTime() : null

  return {
    name: `${nome} ${sobrenome}`,
    markdown_description: `**Como ficou sabendo do BuildZero:**
${comoSoube}

**Ocupação atual:**
${ocupacao}

**Faturamento mensal:**
${faturamento}

**Objetivo nos próximos 90 dias:**
${objetivo}

**Por que BuildZero:**
${porqueBuildZero}`,
    custom_fields: [
      { id: EMAIL_CUSTOM_FIELD_ID, value: email },
      { id: WHATSAPP_CUSTOM_FIELD_ID, value: whatsapp },
      { id: SUBMISSION_ID_CUSTOM_FIELD_ID, value: submissionId },
      { id: RESPONDENT_ID_CUSTOM_FIELD_ID, value: respondentId },
      { id: SUBMISSION_DATE_CUSTOM_FIELD_ID, value: submissionDate }
    ]
  }
}

async function createClickUpTask(row: CSVRow) {
  const taskData = prepareTaskData(row)

  const response = await fetch(`https://api.clickup.com/api/v2/list/${CLICKUP_LIST_ID}/task`, {
    method: 'POST',
    headers: {
      'Authorization': CLICKUP_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to create task: ${response.status} - ${errorText}`)
  }

  return await response.json()
}

async function updateClickUpTask(taskId: string, row: CSVRow) {
  const taskData = prepareTaskData(row)

  const response = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
    method: 'PUT',
    headers: {
      'Authorization': CLICKUP_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to update task: ${response.status} - ${errorText}`)
  }

  return await response.json()
}

async function main() {
  console.log('🚀 Starting CSV import to ClickUp...\n')

  // Read CSV file
  const csvPath = '/home/pedro/dev/sandbox/buildzero-flow/Aplicação BuildZero_Submissions_2025-11-16.csv'
  const fileContent = fs.readFileSync(csvPath, 'utf-8')

  // Parse CSV (skip BOM if present)
  const cleanContent = fileContent.replace(/^\uFEFF/, '')
  const records = parse(cleanContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as CSVRow[]

  console.log(`📄 Found ${records.length} submissions in CSV\n`)

  // Get existing tasks from ClickUp
  console.log('🔍 Fetching existing tasks from ClickUp...')
  const submissionIdToTaskId = await getExistingTasks()
  console.log(`✅ Found ${submissionIdToTaskId.size} existing tasks\n`)

  // Process each row
  let created = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  for (const [index, row] of records.entries()) {
    const submissionId = row['Submission ID']?.trim()
    const nome = row.Nome?.trim()
    const sobrenome = row.Sobrenome?.trim()

    if (!submissionId) {
      console.log(`⚠️  [${index + 1}/${records.length}] Skipping - no Submission ID`)
      skipped++
      continue
    }

    const existingTaskId = submissionIdToTaskId.get(submissionId)

    try {
      if (existingTaskId) {
        // Update existing task
        await updateClickUpTask(existingTaskId, row)
        console.log(`🔄 [${index + 1}/${records.length}] Updated ${nome} ${sobrenome} (${submissionId})`)
        updated++
      } else {
        // Create new task
        await createClickUpTask(row)
        console.log(`✅ [${index + 1}/${records.length}] Created ${nome} ${sobrenome} (${submissionId})`)
        created++
      }

      // Rate limiting: wait 200ms between requests
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      console.error(`❌ [${index + 1}/${records.length}] Failed to process ${nome} ${sobrenome}: ${error}`)
      errors++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Import Summary:')
  console.log('='.repeat(60))
  console.log(`Total submissions:    ${records.length}`)
  console.log(`✅ Created:           ${created}`)
  console.log(`🔄 Updated:           ${updated}`)
  console.log(`⏭️  Skipped:           ${skipped}`)
  console.log(`❌ Errors:            ${errors}`)
  console.log('='.repeat(60))
}

main()
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
