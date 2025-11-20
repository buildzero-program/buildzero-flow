import { describe, it, expect } from 'vitest'
import { db } from '~/lib/db'

describe('Prisma Client', () => {
  it('should connect to database', async () => {
    await expect(db.$connect()).resolves.toBeUndefined()
  })
})
