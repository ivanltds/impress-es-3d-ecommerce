// src/lib/address-utils.ts
// Utilitário para operações de endereço que requerem atomicidade (DA-M06-03).

import { prisma } from '@/lib/db'

/**
 * Marca o endereço `addressId` como padrão para o usuário `userId`.
 * Operação atômica: desmarca todos os outros endereços do usuário antes de
 * marcar o alvo — garante que apenas um isDefault=true exista (RN-M06-10).
 */
export async function setDefaultAddress(userId: string, addressId: string): Promise<void> {
  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    }),
    prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    }),
  ])
}
