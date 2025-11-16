import fs from 'fs'
import { parse } from 'csv-parse/sync'

// ClickUp API Config
const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY
const CLICKUP_LIST_ID = '901322211570'
const EMAIL_CUSTOM_FIELD_ID = '3705639e-668f-4eb4-977c-5f865653b3c3'
const WHATSAPP_CUSTOM_FIELD_ID = '081c88b5-97a6-4e36-8c1f-61f2ac879913'
const SUBMISSION_ID_CUSTOM_FIELD_ID = 'd85e2e81-6a0a-4d4f-bc47-974c273cfb71'
const RESPONDENT_ID_CUSTOM_FIELD_ID = '0d49322b-72b5-4c3a-bb29-d784b894c1ee'
const SUBMISSION_DATE_CUSTOM_FIELD_ID = 'eeb58134-ec6f-4c35-a0f2-728f6b863bc9'

// Evolution API Config (WhatsApp)
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'https://evo.buildzero.ai'
const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'BuildZero Team'
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY

// Avatar API Config (Email to Profile Picture)
const AVATAR_API_USERNAME = process.env.AVATAR_API_USERNAME
const AVATAR_API_PASSWORD = process.env.AVATAR_API_PASSWORD

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
  const url = `https://api.clickup.com/api/v2/list/${CLICKUP_LIST_ID}/task`

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

  // Format date for description
  const dateFormatted = submittedAt
    ? new Date(submittedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    : ''

  return {
    name: `${nome} ${sobrenome}`,
    markdown_description: `📅 **Data de Submissão:** ${dateFormatted}

---
**Como ficou sabendo do BuildZero:**
${comoSoube}

---
**Ocupação atual:**
${ocupacao}

---
**Faturamento mensal:**
${faturamento}

---
**Objetivo nos próximos 90 dias:**
${objetivo}

---
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

async function uploadProfilePhoto(taskId: string, email: string, whatsapp: string, nome: string): Promise<{ uploaded: boolean; source: string }> {
  let photoUrl: string | null = null
  let photoSource: string = 'none'

  // === 1. Try WhatsApp (Evolution API) ===
  if (whatsapp) {
    try {
      console.log(`      🔍 Buscando foto do WhatsApp (${whatsapp})...`)

      const instanceName = encodeURIComponent(EVOLUTION_INSTANCE_NAME)
      const number = whatsapp.replace(/\D/g, '')

      // Helper function to fetch WhatsApp photo
      const fetchWhatsAppPhoto = async (num: string) => {
        const response = await fetch(
          `${EVOLUTION_API_URL}/chat/fetchProfilePictureUrl/${instanceName}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': EVOLUTION_API_KEY
            },
            body: JSON.stringify({
              number: `${num}@s.whatsapp.net`
            })
          }
        )

        if (response.ok) {
          const data = await response.json()
          return data.profilePictureUrl || null
        }
        return null
      }

      // Try with original number
      photoUrl = await fetchWhatsAppPhoto(number)

      // If Brazilian number (13 digits: 55 + 2 DDD + 9 digits) and no photo found,
      // try without the 9th digit (old format before Brazil's mobile number change)
      if (!photoUrl && number.startsWith('55') && number.length === 13) {
        console.log(`      ⚠️  Tentando formato antigo (sem o 9)...`)
        const numberWithout9 = number.substring(0, 4) + number.substring(5)
        photoUrl = await fetchWhatsAppPhoto(numberWithout9)
      }

      if (photoUrl) {
        photoSource = 'whatsapp'
        console.log(`      ✅ Foto WhatsApp encontrada`)
      } else {
        console.log(`      ⚠️  WhatsApp sem foto de perfil`)
      }
    } catch (error: any) {
      console.log(`      ⚠️  Erro Evolution API: ${error.message}`)
    }
  }

  // === 2. Fallback: Try Avatar API (email) ===
  if (!photoUrl && email) {
    try {
      console.log(`      🔍 Buscando foto do email (${email})...`)

      const response = await fetch('https://avatarapi.com/v2/api.aspx', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          username: AVATAR_API_USERNAME,
          password: AVATAR_API_PASSWORD,
          email: email
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.Success && data.Image && !data.IsDefault) {
          photoUrl = data.Image
          photoSource = `email-${data.Source.Name.toLowerCase()}`
          console.log(`      ✅ Foto encontrada via ${data.Source.Name}`)
        } else {
          console.log(`      ⚠️  Email sem foto disponível`)
        }
      }
    } catch (error: any) {
      console.log(`      ⚠️  Erro Avatar API: ${error.message}`)
    }
  }

  // === 3. Upload photo to ClickUp (if found) ===
  if (photoUrl) {
    try {
      console.log(`      📤 Fazendo upload da foto...`)

      // Download photo
      const photoResponse = await fetch(photoUrl)
      const photoBlob = await photoResponse.blob()

      // Upload to ClickUp
      const formData = new FormData()
      formData.append('attachment', photoBlob, `profile-${photoSource}.jpg`)

      const uploadResponse = await fetch(
        `https://api.clickup.com/api/v2/task/${taskId}/attachment`,
        {
          method: 'POST',
          headers: {
            'Authorization': CLICKUP_API_KEY
          },
          body: formData
        }
      )

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json()
        console.log(`      ✅ Foto anexada com sucesso!`)
        return { uploaded: true, source: photoSource }
      } else {
        console.log(`      ❌ Erro upload: ${uploadResponse.status}`)
      }
    } catch (error: any) {
      console.log(`      ❌ Erro ao fazer upload: ${error.message}`)
    }
  } else {
    console.log(`      ℹ️  Nenhuma foto encontrada`)
  }

  return { uploaded: false, source: 'none' }
}

async function main() {
  console.log('🚀 Starting CSV import to ClickUp...\n')

  // Read CSV file
  const csvPath = '/home/pedro/dev/sandbox/buildzero-flow/Aplicação BuildZero_Submissions_2025-11-16 (2).csv'
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
  let photosUploaded = 0
  let photosFromWhatsApp = 0
  let photosFromEmail = 0
  let photosNotFound = 0

  for (const [index, row] of records.entries()) {
    const submissionId = row['Submission ID']?.trim()
    const nome = row.Nome?.trim()
    const sobrenome = row.Sobrenome?.trim()
    const email = row['E-mail\n']?.trim() || ''
    const whatsapp = row.WhatsApp?.trim() || ''

    if (!submissionId) {
      console.log(`⚠️  [${index + 1}/${records.length}] Skipping - no Submission ID`)
      skipped++
      continue
    }

    const existingTaskId = submissionIdToTaskId.get(submissionId)

    try {
      let taskId: string

      if (existingTaskId) {
        // Update existing task
        await updateClickUpTask(existingTaskId, row)
        console.log(`🔄 [${index + 1}/${records.length}] Updated ${nome} ${sobrenome} (${submissionId})`)
        taskId = existingTaskId
        updated++
      } else {
        // Create new task
        const task = await createClickUpTask(row)
        console.log(`✅ [${index + 1}/${records.length}] Created ${nome} ${sobrenome} (${submissionId})`)
        taskId = task.id
        created++
      }

      // Upload profile photo
      const photoResult = await uploadProfilePhoto(taskId, email, whatsapp, `${nome} ${sobrenome}`)

      if (photoResult.uploaded) {
        photosUploaded++
        if (photoResult.source === 'whatsapp') {
          photosFromWhatsApp++
        } else if (photoResult.source.startsWith('email-')) {
          photosFromEmail++
        }
      } else {
        photosNotFound++
      }

      // Rate limiting: wait 300ms between requests (increased due to photo upload)
      await new Promise(resolve => setTimeout(resolve, 300))
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
  console.log('📸 Profile Photos:')
  console.log('='.repeat(60))
  console.log(`📤 Uploaded:          ${photosUploaded}`)
  console.log(`📱 From WhatsApp:     ${photosFromWhatsApp}`)
  console.log(`📧 From Email:        ${photosFromEmail}`)
  console.log(`❓ Not Found:         ${photosNotFound}`)
  console.log('='.repeat(60))
}

main()
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
