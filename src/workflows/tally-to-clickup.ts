import { Workflow } from '~/lib/workflow-engine/Workflow'
import { TriggerNode } from '~/lib/workflow-engine/nodes/TriggerNode'
import { NormalizeNode } from '~/lib/workflow-engine/nodes/NormalizeNode'
import { HttpNode } from '~/lib/workflow-engine/nodes/HttpNode'
import { CodeNode } from '~/lib/workflow-engine/nodes/CodeNode'

export const tallyToClickup = new Workflow({
  id: 'tally-to-clickup',
  name: 'Tally → ClickUp',
  description: 'Captura aplicações do Tally e cria tasks no ClickUp',
  nodes: [
    // Node 0: Receive Tally webhook
    new TriggerNode({
      id: 'trigger',
      name: 'Tally Webhook'
    }),

    // Node 1: Transform Tally data → ClickUp format
    new NormalizeNode({
      id: 'normalize',
      name: 'Normalize Data',
      transform: (input, context) => {
        context.logger('Normalizing Tally webhook data')

        const fields = input.data.data?.fields || []
        const submissionId = input.data.data?.submissionId || ''
        const respondentId = input.data.data?.respondentId || ''
        const createdAt = input.data.data?.createdAt || ''

        const findField = (label: string) =>
          fields.find((f: any) => f.label.trim() === label)?.value || ''

        const findMultipleChoice = (label: string) => {
          const field = fields.find((f: any) => f.label === label)
          if (!field || !field.options) return ''
          const selectedId = field.value[0]
          const option = field.options.find((o: any) => o.id === selectedId)
          return option?.text || ''
        }

        const nome = findField('Nome')
        const sobrenome = findField('Sobrenome')
        const email = findField('E-mail')
        const whatsapp = findField('WhatsApp')
        const comoSoube = findMultipleChoice('Como você ficou sabendo do BuildZero?')
        const ocupacao = findMultipleChoice('Ocupação atual')
        const faturamento = findMultipleChoice('Faixa de faturamento mensal do seu negócio/operação')
        const objetivo = findField('Qual seu principal objetivo nos próximos 90 dias?')
        const porqueBuildZero = findField('Por que BuildZero faz sentido pro seu momento atual e por que devemos te aceitar na comunidade?')

        context.logger(`Extracted: ${nome} ${sobrenome} (${email}) - Submission: ${submissionId}`)

        return {
          nome,
          sobrenome,
          email,
          whatsapp,
          comoSoube,
          ocupacao,
          faturamento,
          objetivo,
          porqueBuildZero,
          submissionId,
          respondentId,
          createdAt
        }
      }
    }),

    // Node 2: Create ClickUp task
    new HttpNode({
      id: 'create-task',
      name: 'Create ClickUp Task',
      method: 'POST',
      url: 'https://api.clickup.com/api/v2/list/901322211570/task',
      headers: (context) => ({
        'Authorization': context.secrets.CLICKUP_API_KEY || '',
        'Content-Type': 'application/json'
      }),
      body: (input, context) => {
        const data = input.data
        context.logger(`Creating ClickUp task for: ${data.nome} ${data.sobrenome}`)

        // Convert createdAt to Unix timestamp (milliseconds)
        const submissionDate = data.createdAt ? new Date(data.createdAt).getTime() : null

        // Format date for description
        const dateFormatted = data.createdAt
          ? new Date(data.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
          : ''

        return {
          name: `${data.nome} ${data.sobrenome}`,
          markdown_description: `📅 **Data de Submissão:** ${dateFormatted}

---
**Como ficou sabendo do BuildZero:**
${data.comoSoube}

---
**Ocupação atual:**
${data.ocupacao}

---
**Faturamento mensal:**
${data.faturamento}

---
**Objetivo nos próximos 90 dias:**
${data.objetivo}

---
**Por que BuildZero:**
${data.porqueBuildZero}`,
          custom_fields: [
            {
              id: '3705639e-668f-4eb4-977c-5f865653b3c3', // E-mail
              value: data.email
            },
            {
              id: '081c88b5-97a6-4e36-8c1f-61f2ac879913', // WhatsApp
              value: data.whatsapp
            },
            {
              id: 'd85e2e81-6a0a-4d4f-bc47-974c273cfb71', // Submission ID
              value: data.submissionId
            },
            {
              id: '0d49322b-72b5-4c3a-bb29-d784b894c1ee', // Respondent ID
              value: data.respondentId
            },
            {
              id: 'eeb58134-ec6f-4c35-a0f2-728f6b863bc9', // Data de Submissão
              value: submissionDate
            }
          ]
        }
      }
    }),

    // Node 3: Upload Profile Photo
    new CodeNode({
      id: 'upload-profile-photo',
      name: 'Upload Profile Photo',
      execute: async (input, context) => {
        // input.data = task created in previous node (HttpNode)
        const task = input.data
        const taskId = task.id

        // Extract email and whatsapp from task custom_fields
        const emailField = task.custom_fields?.find(
          (f: any) => f.id === '3705639e-668f-4eb4-977c-5f865653b3c3'
        )
        const whatsappField = task.custom_fields?.find(
          (f: any) => f.id === '081c88b5-97a6-4e36-8c1f-61f2ac879913'
        )

        const email = emailField?.value
        const whatsapp = whatsappField?.value

        let photoUrl: string | null = null
        let photoSource: string | null = null

        // === 1. Try WhatsApp (Evolution API) ===
        if (whatsapp) {
          try {
            context.logger('🔍 Buscando foto do WhatsApp...')

            const instanceName = encodeURIComponent(
              context.secrets.EVOLUTION_INSTANCE_NAME || ''
            )
            const number = whatsapp.replace(/\D/g, '')

            // Helper function to fetch WhatsApp photo
            const fetchWhatsAppPhoto = async (num: string) => {
              const response = await fetch(
                `${context.secrets.EVOLUTION_API_URL}/chat/fetchProfilePictureUrl/${instanceName}`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'apikey': context.secrets.EVOLUTION_API_KEY || ''
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
              context.logger('⚠️  Tentando formato antigo (sem o 9)...')
              const numberWithout9 = number.substring(0, 4) + number.substring(5)
              photoUrl = await fetchWhatsAppPhoto(numberWithout9)
            }

            if (photoUrl) {
              photoSource = 'whatsapp'
              context.logger('✅ Foto WhatsApp encontrada')
            } else {
              context.logger('⚠️  WhatsApp sem foto de perfil')
            }
          } catch (error: any) {
            context.logger(`⚠️  Erro Evolution API: ${error.message}`)
          }
        }

        // === 2. Fallback: Try Avatar API (email) ===
        if (!photoUrl && email) {
          try {
            context.logger('🔍 Buscando foto do email...')

            const response = await fetch('https://avatarapi.com/v2/api.aspx', {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify({
                username: context.secrets.AVATAR_API_USERNAME || '',
                password: context.secrets.AVATAR_API_PASSWORD || '',
                email: email
              })
            })

            if (response.ok) {
              const data = await response.json()
              if (data.Success && data.Image && !data.IsDefault) {
                photoUrl = data.Image
                photoSource = `email-${data.Source.Name.toLowerCase()}`
                context.logger(`✅ Foto encontrada via ${data.Source.Name}`)
              } else {
                context.logger('⚠️  Email sem foto disponível')
              }
            }
          } catch (error: any) {
            context.logger(`⚠️  Erro Avatar API: ${error.message}`)
          }
        }

        // === 3. Upload photo to ClickUp (if found) ===
        if (photoUrl) {
          try {
            context.logger('📤 Fazendo upload da foto...')

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
                  'Authorization': context.secrets.CLICKUP_API_KEY || ''
                },
                body: formData
              }
            )

            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json()
              context.logger(`✅ Foto anexada: ${uploadData.url}`)

              return {
                taskId,
                taskUrl: task.url,
                photoUploaded: true,
                photoSource,
                photoUrl: uploadData.url
              }
            } else {
              context.logger(`❌ Erro upload: ${uploadResponse.status}`)
            }
          } catch (error: any) {
            context.logger(`❌ Erro ao fazer upload: ${error.message}`)
          }
        } else {
          context.logger('ℹ️  Nenhuma foto encontrada')
        }

        // Always return (even without photo)
        return {
          taskId,
          taskUrl: task.url,
          photoUploaded: false,
          photoSource: 'none'
        }
      }
    })
  ]
})
