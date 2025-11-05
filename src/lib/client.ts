// lib/client.ts
import { PrismaClient } from "@/generated/prisma"

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | undefined
}

// ✅ Configuration optimisée avec options de logging et pool
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['error', 'warn'] // ✅ Réduit les logs pour de meilleures performances
    : ['error'],
  // ✅ Options de configuration supplémentaires
  errorFormat: 'pretty',
})

// ✅ Gestion propre de la déconnexion (UNIQUEMENT côté serveur)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// ✅ Ne s'exécute QUE côté serveur Node.js (pas Edge Runtime)
if (typeof window === 'undefined' && typeof process.on === 'function') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}

export default prisma