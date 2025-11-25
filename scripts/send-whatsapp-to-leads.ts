import { setTimeout } from 'timers/promises'

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY || ''
const CLICKUP_LIST_ID = '901322211570'
const WHATSAPP_CUSTOM_FIELD_ID = '081c88b5-97a6-4e36-8c1f-61f2ac879913'

const CHATWOOT_API_URL = process.env.CHATWOOT_API_URL || 'https://chat.buildzero.ai'
const CHATWOOT_API_TOKEN = process.env.CHATWOOT_API_TOKEN || ''
const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID || '1'
const CHATWOOT_INBOX_ID = process.env.CHATWOOT_INBOX_ID || '10'

// Limite de leads a processar (100 = processar todos)
const LEAD_LIMIT = 100

// Rate limiting (ms)
const MIN_DELAY = 40000 // 40 segundos
const MAX_DELAY = 50000 // 50 segundos

// ============================================================================
// TYPES
// ============================================================================

interface ClickUpTask {
  id: string
  name: string
  description: string
  status: {
    status: string
  }
  custom_fields: Array<{
    id: string
    value: string | null
  }>
}

interface ClickUpComment {
  id: string
  comment_text: string
  date: number
}

interface ChatwootContact {
  id: number
  name: string
  phone_number: string
  identifier: string
}

interface ChatwootConversation {
  id: number
  status: string
  inbox_id: number
  meta: {
    sender: {
      id: number
    }
  }
}

interface ChatwootMessage {
  id: number
  content: string
  message_type: number // 0 = incoming, 1 = outgoing
  created_at: number
}

interface ProcessResult {
  nome: string
  whatsapp: string
  status: 'enviado' | 'skipped_clickup' | 'skipped_chatwoot' | 'erro'
  tipo?: 'PRÉ-APROVADO' | 'NÃO PRÉ-APROVADO'
  motivo?: string
  chatwoot_message_id?: number
  clickup_comment_id?: string
}

// ============================================================================
// MENSAGENS
// ============================================================================

const MENSAGEM_PRE_APROVADO = (nome: string) => `Fala, ${nome}

Seu formulário foi pré-aprovado

Agora preciso marcar uma reunião contigo pra entender melhor se você realmente tem fit com o programa

A reunião é comigo, Pedro Nascimento

Estamos nas últimas vagas e vamos iniciar o programa já em dezembro

Agenda o quanto antes:
https://calendar.app.google/i6AUdmJiwT3qKEsj8

Importante: reserve um espaço tranquilo pro nosso encontro. Se você tem sócios ou outras pessoas importantes na tomada de decisão do negócio, é essencial que elas participem também dessa reunião

Valeu`

const MENSAGEM_NAO_PRE_APROVADO = (nome: string) => `Fala, ${nome}

Analisamos sua aplicação pro BuildZero

A gente entende que não é esse o momento ainda

Esse é um produto high-ticket desenhado pra quem já tem operação rodando e quer escalar com high-code de verdade

Mas continua acompanhando o conteúdo no YouTube, a gente vai estar produzindo muito material gratuito por lá

E vamos criar mais soluções personalizadas que vão te alcançar no momento certo

👉 Assiste esse vídeo pra começar no caminho certo:
https://youtu.be/esR1CkM8F3Q?si=AJJhS3XW7cLL7nuU

💬 Entra na comunidade BuildZero:
https://chat.whatsapp.com/Itx5ha7TYr9HPXNLAvQ69g

Quando estiver no momento certo, a gente conversa

Valeu`

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseFaturamento(description: string): { faturamento: string; isPreAprovado: boolean } {
  const lines = description.split('\n')
  const faturamentoLine = lines.find(line => line.includes('Faturamento mensal:'))

  if (!faturamentoLine) {
    return { faturamento: 'Não informado', isPreAprovado: false }
  }

  const faturamento = faturamentoLine.replace('Faturamento mensal:', '').trim()
  const isPreAprovado = !faturamento.includes('Menos de R$ 3.000')

  return { faturamento, isPreAprovado }
}

function getFirstName(fullName: string): string {
  return fullName.split(' ')[0] || fullName
}

function getRandomDelay(): number {
  return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY
}

async function sleep(ms: number): Promise<void> {
  await setTimeout(ms)
}

// ============================================================================
// CLICKUP API FUNCTIONS
// ============================================================================

async function getLeadTasks(): Promise<ClickUpTask[]> {
  console.log('🔍 Buscando tasks do ClickUp...')

  const response = await fetch(
    `https://api.clickup.com/api/v2/list/${CLICKUP_LIST_ID}/task?include_closed=false`,
    {
      headers: {
        'Authorization': CLICKUP_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const allTasks = data.tasks || []

  // Filtrar apenas leads
  const leadTasks = allTasks.filter((task: ClickUpTask) =>
    task.status.status === 'lead'
  )

  console.log(`   ✅ Total de tasks: ${allTasks.length}`)
  console.log(`   ✅ Tasks com status 'lead': ${leadTasks.length}`)
  console.log(`   ✅ Processando os primeiros: ${LEAD_LIMIT}`)

  return leadTasks.slice(0, LEAD_LIMIT)
}

async function checkClickUpComments(taskId: string): Promise<boolean> {
  const response = await fetch(
    `https://api.clickup.com/api/v2/task/${taskId}/comment`,
    {
      headers: {
        'Authorization': CLICKUP_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!response.ok) {
    console.log(`   ⚠️  Erro ao buscar comentários: ${response.status}`)
    return false
  }

  const data = await response.json()
  const comments = data.comments || []

  // Verificar se já existe comentário de mensagem automática
  const hasAutoComment = comments.some((comment: ClickUpComment) =>
    comment.comment_text.includes('MENSAGEM WHATSAPP ENVIADA AUTOMATICAMENTE')
  )

  return hasAutoComment
}

async function addClickUpComment(
  taskId: string,
  messageType: 'PRÉ-APROVADO' | 'NÃO PRÉ-APROVADO',
  message: string,
  conversationId: number,
  messageId: number
): Promise<string> {
  const timestamp = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const commentText = `🤖 MENSAGEM WHATSAPP ENVIADA AUTOMATICAMENTE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 METADATA DO DISPARO

⏰ Data/Hora: ${timestamp}
📱 Canal: Chatwoot (Inbox #${CHATWOOT_INBOX_ID} - PN)
🆔 Conversation ID: ${conversationId}
📬 Message ID: ${messageId}
✅ Status: Enviada com sucesso
🏷️  Tipo: ${messageType}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 MENSAGEM ENVIADA

${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 DETALHES TÉCNICOS

Sistema: BuildZero Flow - Automated Lead Messaging
Script: send-whatsapp-to-leads.ts
Filtro: Status=lead
⚠️ NÃO REENVIAR - Verificar comentário antes de disparar novamente`

  const response = await fetch(
    `https://api.clickup.com/api/v2/task/${taskId}/comment`,
    {
      method: 'POST',
      headers: {
        'Authorization': CLICKUP_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        comment_text: commentText,
        notify_all: false
      })
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to add comment: ${response.status}`)
  }

  const data = await response.json()
  return data.id
}

// ============================================================================
// CHATWOOT API FUNCTIONS
// ============================================================================

async function findChatwootContact(phone: string): Promise<ChatwootContact | null> {
  const response = await fetch(
    `${CHATWOOT_API_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts/search?q=${encodeURIComponent(phone)}`,
    {
      headers: {
        'api_access_token': CHATWOOT_API_TOKEN,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!response.ok) {
    console.log(`   ⚠️  Erro ao buscar contato: ${response.status}`)
    return null
  }

  const data = await response.json()
  return data.payload && data.payload.length > 0 ? data.payload[0] : null
}

async function checkChatwootMessages(contactId: number): Promise<boolean> {
  // Buscar todas conversas da inbox
  const response = await fetch(
    `${CHATWOOT_API_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations?inbox_id=${CHATWOOT_INBOX_ID}&status=all`,
    {
      headers: {
        'api_access_token': CHATWOOT_API_TOKEN,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!response.ok) {
    console.log(`   ⚠️  Erro ao buscar conversas: ${response.status}`)
    return false
  }

  const data = await response.json()
  const conversations = data.data?.payload || []

  // Filtrar conversas deste contato
  const contactConversations = conversations.filter((conv: ChatwootConversation) =>
    conv.meta?.sender?.id === contactId
  )

  if (contactConversations.length === 0) {
    return false
  }

  // Verificar mensagens de cada conversa
  for (const conv of contactConversations) {
    const messagesResponse = await fetch(
      `${CHATWOOT_API_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conv.id}/messages`,
      {
        headers: {
          'api_access_token': CHATWOOT_API_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!messagesResponse.ok) continue

    const messagesData = await messagesResponse.json()
    const messages = messagesData.payload || []

    // Verificar se tem mensagens automáticas (outgoing com textos identificadores)
    const hasAutoMessage = messages.some((msg: ChatwootMessage) => {
      if (msg.message_type !== 1) return false // não é outgoing
      if (!msg.content || typeof msg.content !== 'string') return false

      return msg.content.includes('Seu formulário foi pré-aprovado') ||
             msg.content.includes('Analisamos sua aplicação pro BuildZero')
    })

    if (hasAutoMessage) {
      return true
    }
  }

  return false
}

async function createChatwootContact(name: string, phone: string): Promise<ChatwootContact> {
  const response = await fetch(
    `${CHATWOOT_API_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts`,
    {
      method: 'POST',
      headers: {
        'api_access_token': CHATWOOT_API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inbox_id: CHATWOOT_INBOX_ID,
        name: name,
        phone_number: phone
      })
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to create contact: ${response.status}`)
  }

  const data = await response.json()
  return data.payload.contact
}

async function createChatwootConversation(contactId: number, sourceId: string): Promise<ChatwootConversation> {
  const response = await fetch(
    `${CHATWOOT_API_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations`,
    {
      method: 'POST',
      headers: {
        'api_access_token': CHATWOOT_API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inbox_id: CHATWOOT_INBOX_ID,
        contact_id: contactId.toString(),
        source_id: sourceId
      })
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to create conversation: ${response.status}`)
  }

  return await response.json()
}

async function sendChatwootMessage(conversationId: number, message: string): Promise<number> {
  const response = await fetch(
    `${CHATWOOT_API_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: {
        'api_access_token': CHATWOOT_API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: message,
        message_type: 'outgoing',
        private: false
      })
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.status}`)
  }

  const data = await response.json()
  return data.id
}

async function findOrCreateConversation(contact: ChatwootContact): Promise<number> {
  // Buscar conversas existentes
  const response = await fetch(
    `${CHATWOOT_API_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations?inbox_id=${CHATWOOT_INBOX_ID}&status=all`,
    {
      headers: {
        'api_access_token': CHATWOOT_API_TOKEN,
        'Content-Type': 'application/json'
      }
    }
  )

  if (response.ok) {
    const data = await response.json()
    const conversations = data.data?.payload || []

    const existingConv = conversations.find((conv: ChatwootConversation) =>
      conv.meta?.sender?.id === contact.id
    )

    if (existingConv) {
      return existingConv.id
    }
  }

  // Se não encontrou, criar nova conversa
  // Usar identifier ou gerar source_id a partir do phone_number
  const sourceId = contact.identifier ||
                   `${contact.phone_number.replace(/\D/g, '')}@s.whatsapp.net`

  const conversation = await createChatwootConversation(contact.id, sourceId)
  return conversation.id
}

// ============================================================================
// MAIN PROCESSING FUNCTION
// ============================================================================

async function processLead(task: ClickUpTask, index: number, total: number): Promise<ProcessResult> {
  const nome = task.name
  const whatsappField = task.custom_fields.find(f => f.id === WHATSAPP_CUSTOM_FIELD_ID)
  const whatsapp = whatsappField?.value || ''

  console.log('')
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`[${index + 1}/${total}] Processando: ${nome}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

  if (!whatsapp) {
    console.log('   ❌ Erro: WhatsApp não encontrado')
    return { nome, whatsapp: '', status: 'erro', motivo: 'WhatsApp não encontrado' }
  }

  console.log(`   📱 WhatsApp: ${whatsapp}`)

  // Parse faturamento
  const { faturamento, isPreAprovado } = parseFaturamento(task.description)
  const tipo = isPreAprovado ? 'PRÉ-APROVADO' : 'NÃO PRÉ-APROVADO'

  console.log(`   💰 Faturamento: ${faturamento}`)
  console.log(`   🏷️  Tipo: ${tipo}`)

  try {
    // VERIFICAÇÃO #1: CLICKUP
    console.log('   ')
    console.log('   🔍 Verificação #1: ClickUp Comments...')
    const hasClickUpComment = await checkClickUpComments(task.id)

    if (hasClickUpComment) {
      console.log('   ⚠️  Skip: Já enviado anteriormente (ClickUp)')
      return { nome, whatsapp, status: 'skipped_clickup', motivo: 'Comentário já existe no ClickUp' }
    }

    console.log('   ✅ ClickUp OK: Nenhum comentário de envio encontrado')

    // VERIFICAÇÃO #2: CHATWOOT
    console.log('   ')
    console.log('   🔍 Verificação #2: Chatwoot Messages...')

    const contact = await findChatwootContact(whatsapp)

    if (contact) {
      console.log(`   📋 Contato encontrado: ${contact.name} (ID: ${contact.id})`)

      const hasAutoMessage = await checkChatwootMessages(contact.id)

      if (hasAutoMessage) {
        console.log('   ⚠️  Skip: Já enviado anteriormente (Chatwoot)')
        return { nome, whatsapp, status: 'skipped_chatwoot', motivo: 'Mensagem automática já enviada no Chatwoot' }
      }

      console.log('   ✅ Chatwoot OK: Sem mensagens automáticas anteriores')
    } else {
      console.log('   ✅ Chatwoot OK: Contato não existe (será criado)')
    }

    // ENVIO
    console.log('   ')
    console.log('   📤 Enviando mensagem via Chatwoot...')

    // Buscar ou criar contato
    let finalContact: ChatwootContact
    if (contact) {
      finalContact = contact
      console.log(`   📱 Usando contato existente: ${contact.id}`)
    } else {
      finalContact = await createChatwootContact(nome, whatsapp)
      console.log(`   📱 Contato criado: ${finalContact.id}`)
    }

    // Buscar ou criar conversa
    const conversationId = await findOrCreateConversation(finalContact)
    console.log(`   💬 Conversa: ${conversationId}`)

    // Preparar mensagem
    const firstName = getFirstName(nome)
    const message = isPreAprovado
      ? MENSAGEM_PRE_APROVADO(firstName)
      : MENSAGEM_NAO_PRE_APROVADO(firstName)

    // Enviar mensagem
    const messageId = await sendChatwootMessage(conversationId, message)
    console.log(`   ✅ Mensagem enviada: ${messageId}`)
    console.log(`   📊 Status: sent`)

    // REGISTRAR NO CLICKUP
    console.log('   ')
    console.log('   📝 Registrando no ClickUp...')

    const commentId = await addClickUpComment(task.id, tipo, message, conversationId, messageId)
    console.log(`   ✅ ClickUp atualizado: Comment ${commentId}`)

    return {
      nome,
      whatsapp,
      status: 'enviado',
      tipo,
      chatwoot_message_id: messageId,
      clickup_comment_id: commentId
    }

  } catch (error: any) {
    console.log(`   ❌ Erro: ${error.message}`)
    return { nome, whatsapp, status: 'erro', motivo: error.message }
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const startTime = Date.now()

  console.log('🚀 BuildZero Flow - Automated Lead Messaging')
  console.log('══════════════════════════════════════════════════════════')
  console.log('')

  // Buscar leads
  const tasks = await getLeadTasks()

  if (tasks.length === 0) {
    console.log('⚠️  Nenhuma task encontrada com status "lead"')
    return
  }

  console.log('')
  console.log('══════════════════════════════════════════════════════════')
  console.log('🎯 INICIANDO PROCESSAMENTO')
  console.log('══════════════════════════════════════════════════════════')

  const results: ProcessResult[] = []

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    const result = await processLead(task, i, tasks.length)
    results.push(result)

    // Rate limiting (não aplicar no último)
    if (i < tasks.length - 1) {
      const delay = getRandomDelay()
      const seconds = Math.round(delay / 1000)
      console.log('')
      console.log(`   ⏳ Aguardando ${seconds}s antes do próximo...`)
      await sleep(delay)
    }
  }

  // RESUMO FINAL
  const duration = Math.round((Date.now() - startTime) / 1000)
  const enviados = results.filter(r => r.status === 'enviado')
  const skipped = results.filter(r => r.status.startsWith('skipped'))
  const erros = results.filter(r => r.status === 'erro')
  const preAprovados = enviados.filter(r => r.tipo === 'PRÉ-APROVADO')
  const naoPreAprovados = enviados.filter(r => r.tipo === 'NÃO PRÉ-APROVADO')

  console.log('')
  console.log('')
  console.log('══════════════════════════════════════════════════════════')
  console.log('📊 RESUMO DA EXECUÇÃO')
  console.log('══════════════════════════════════════════════════════════')
  console.log(`Total de leads processados:     ${results.length}`)
  console.log(`✅ Mensagens enviadas:          ${enviados.length}`)
  console.log(`⏭️  Skipped (já enviado):        ${skipped.length}`)
  console.log(`❌ Erros:                        ${erros.length}`)
  console.log('')
  console.log('📈 Detalhamento:')
  console.log(`• Pré-aprovados enviados:       ${preAprovados.length}`)
  console.log(`• Não pré-aprovados enviados:   ${naoPreAprovados.length}`)
  console.log('')
  console.log(`⏱️  Tempo total:                  ${duration}s`)
  console.log('══════════════════════════════════════════════════════════')

  if (erros.length > 0) {
    console.log('')
    console.log('❌ ERROS DETALHADOS:')
    erros.forEach(e => {
      console.log(`   • ${e.nome}: ${e.motivo}`)
    })
  }

  if (skipped.length > 0) {
    console.log('')
    console.log('⏭️  SKIPPED DETALHADOS:')
    skipped.forEach(s => {
      console.log(`   • ${s.nome}: ${s.motivo}`)
    })
  }
}

main()
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
