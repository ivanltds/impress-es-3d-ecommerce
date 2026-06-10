// ─── F3: Prisma Client Singleton ───
// Atende aos cenários Gherkin: 3.1 (conexão), 3.2 (migration)
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
