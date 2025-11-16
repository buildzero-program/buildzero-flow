import { describe, it, expect } from 'vitest'

describe('Prisma Client', () => {
  it('should connect to database', async () => {
    const { db } = await import('~/lib/db')
    await expect(db.$connect()).resolves.not.toThrow()
  })
})
