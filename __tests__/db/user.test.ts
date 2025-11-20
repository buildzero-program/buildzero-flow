import { describe, it, expect, afterEach } from 'vitest'
import { db } from '~/lib/db'

describe.sequential('User Model', () => {
  // Cleanup after each test to avoid conflicts
  afterEach(async () => {
    // Order matters for foreign key constraints
    await db.executionLog.deleteMany()
    await db.execution.deleteMany()
    await db.user.deleteMany()
  })

  it('should create user with email', async () => {
    const user = await db.user.create({
      data: {
        email: 'pedro@buildzero.ai',
        name: 'Pedro',
        clerkUserId: 'user_clerk_123'
      }
    })

    expect(user.id).toBeDefined()
    expect(user.email).toBe('pedro@buildzero.ai')
    expect(user.name).toBe('Pedro')
    expect(user.clerkUserId).toBe('user_clerk_123')
    expect(user.createdAt).toBeInstanceOf(Date)
    expect(user.updatedAt).toBeInstanceOf(Date)
  })

  it('should create user without optional fields', async () => {
    const user = await db.user.create({
      data: {
        email: 'simple@test.com'
      }
    })

    expect(user.id).toBeDefined()
    expect(user.email).toBe('simple@test.com')
    expect(user.name).toBeNull()
    expect(user.image).toBeNull()
    expect(user.clerkUserId).toBeNull()
  })

  it('should enforce unique email', async () => {
    await db.user.create({
      data: { email: 'test@example.com', name: 'Test' }
    })

    await expect(
      db.user.create({
        data: { email: 'test@example.com', name: 'Duplicate' }
      })
    ).rejects.toThrow()
  })

  it('should enforce unique clerkUserId', async () => {
    await db.user.create({
      data: {
        email: 'user1@test.com',
        clerkUserId: 'clerk_123'
      }
    })

    await expect(
      db.user.create({
        data: {
          email: 'user2@test.com',
          clerkUserId: 'clerk_123'
        }
      })
    ).rejects.toThrow()
  })

  it('should update user fields', async () => {
    const user = await db.user.create({
      data: { email: 'update@test.com' }
    })

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        name: 'Updated Name',
        image: 'https://example.com/photo.jpg'
      }
    })

    expect(updated.name).toBe('Updated Name')
    expect(updated.image).toBe('https://example.com/photo.jpg')
    expect(updated.updatedAt.getTime()).toBeGreaterThan(user.updatedAt.getTime())
  })

  it('should find user by email', async () => {
    await db.user.create({
      data: { email: 'findme@test.com', name: 'Find Me' }
    })

    const found = await db.user.findUnique({
      where: { email: 'findme@test.com' }
    })

    expect(found).not.toBeNull()
    expect(found?.name).toBe('Find Me')
  })

  it('should find user by clerkUserId', async () => {
    await db.user.create({
      data: {
        email: 'clerk@test.com',
        clerkUserId: 'user_clerk_findme'
      }
    })

    const found = await db.user.findUnique({
      where: { clerkUserId: 'user_clerk_findme' }
    })

    expect(found).not.toBeNull()
    expect(found?.email).toBe('clerk@test.com')
  })
})
