# BuildZero Flow - Guia de Deploy

## Pré-requisitos

- [x] Conta na Vercel (autenticado)
- [ ] Conta na Upstash (para QStash)
- [ ] PostgreSQL na Vercel configurado

## Passo 1: Setup do Vercel PostgreSQL

1. Acesse: https://vercel.com/dashboard
2. No seu projeto (ou crie um novo), vá em **Storage**
3. Clique em **Create Database** → **PostgreSQL**
4. Nomeie: `buildzero-flow-db`
5. Região: `Washington D.C., USA (iad1)` ou mais próxima
6. Clique em **Create**

A Vercel vai gerar automaticamente as variáveis:
```
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NO_SSL
POSTGRES_URL_NON_POOLING
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE
```

## Passo 2: Setup do Upstash QStash

1. Acesse: https://console.upstash.com/
2. Crie conta (pode usar GitHub)
3. Vá em **QStash** → **Create QStash**
4. Copie o **QSTASH_TOKEN**

## Passo 3: Configurar Variáveis de Ambiente na Vercel

```bash
# No projeto da Vercel, vá em Settings → Environment Variables
# Adicione:

# QStash
QSTASH_TOKEN=<seu-token-do-qstash>

# Database (já configurado automaticamente pelo Vercel Postgres)
# DATABASE_URL será o POSTGRES_PRISMA_URL
```

## Passo 4: Atualizar .env local

Crie um arquivo `.env` local com:

```env
# Database - Pegar da Vercel Storage
DATABASE_URL="postgresql://..."

# QStash - Pegar do Upstash Console
QSTASH_TOKEN="..."

# Vercel URL (apenas para testes locais, em prod é automático)
VERCEL_URL="localhost:3000"
```

## Passo 5: Deploy

### Opção A: Deploy via CLI (Recomendado para primeira vez)

```bash
# No diretório do projeto
vercel

# Responda as perguntas:
# - Set up and deploy? Yes
# - Which scope? <sua-conta>
# - Link to existing project? No
# - Project name? buildzero-flow
# - In which directory is your code located? ./
# - Want to override settings? No
```

### Opção B: Deploy via Git (Recomendado para produção)

1. Crie repositório no GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create buildzero-flow --private --source=. --remote=origin --push
```

2. No dashboard da Vercel:
   - **Import Project**
   - Conecte com o repositório GitHub
   - Configure o domínio: `flow.buildzero.ai`

## Passo 6: Migrar o Banco de Dados

Após o deploy, rode as migrations:

```bash
# Se usando CLI, no diretório do projeto:
vercel env pull .env.production
bun prisma migrate deploy

# Ou conecte via Vercel CLI:
vercel --prod
```

## Passo 7: Configurar Domínio Customizado

1. No projeto Vercel → **Settings** → **Domains**
2. Adicione: `flow.buildzero.ai`
3. Configure o DNS:
   - Tipo: `CNAME`
   - Nome: `flow`
   - Valor: `cname.vercel-dns.com`

## Passo 8: Testar o Webhook

```bash
curl -X POST https://flow.buildzero.ai/api/webhooks/test-workflow \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "email": "test@example.com"}'
```

Deve retornar:
```json
{"executionId": "..."}
```

## Verificar Execução

Acesse:
```
https://flow.buildzero.ai/
```

Você verá o dashboard com a execução listada.

## Estrutura do Projeto

```
buildzero-flow/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── executions/[id]/      # Detalhes da execução
│   │   └── api/
│   │       ├── webhooks/         # Recebe webhook e cria execução
│   │       └── workers/          # QStash chama para executar nós
│   ├── lib/
│   │   ├── db.ts                 # Prisma client
│   │   ├── qstash.ts             # QStash client
│   │   └── workflow-engine/      # Engine de workflows
│   └── workflows/
│       ├── registry.ts           # Registro de workflows
│       └── test-workflow.ts      # Workflow de exemplo
├── prisma/
│   └── schema.prisma             # Schema do banco
└── __tests__/                    # Testes
```

## Troubleshooting

### Erro: "QSTASH_TOKEN is not set"
- Verifique se adicionou a variável no Vercel
- Rode `vercel env pull` para atualizar local

### Erro: Database connection
- Verifique se o DATABASE_URL está correto
- Rode `bun prisma migrate deploy` no ambiente de produção

### QStash não está chamando o worker
- Verifique se a URL está acessível publicamente
- No Upstash Console, vá em **QStash** → **Logs** para ver erros
- Certifique-se que VERCEL_URL está configurado corretamente

## Próximos Passos

1. Criar workflows personalizados em `src/workflows/`
2. Adicionar mais tipos de nós (HTTP, Code, Normalize)
3. Monitorar execuções no dashboard
4. Configurar alertas no Vercel
