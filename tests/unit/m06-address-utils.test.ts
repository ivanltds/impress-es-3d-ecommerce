// ─── Unit Tests: M06 — src/lib/address-utils.ts (setDefaultAddress) ───
// Spec: specs/M06-customer-area.spec.md — Cenário 5.6 / RN-M06-10 (atomicidade)
// Arquitetura: DA-M06-03 — prisma.$transaction([updateMany(false), update(true)])
// FASE 2 — TEST AUTHORING (🔴 RED)
// O módulo @/lib/address-utils ainda não existe — import dinâmico falha com
// "Cannot find module" (RED esperado).

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => {
  const prisma = {
    address: {
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  }
  // suporta tanto $transaction([...promises]) quanto $transaction(async (tx) => {...})
  prisma.$transaction.mockImplementation(async (arg: unknown) => {
    if (typeof arg === 'function') return (arg as (tx: typeof prisma) => unknown)(prisma)
    return Promise.all(arg as Promise<unknown>[])
  })
  return { prisma }
})

import { prisma } from '@/lib/db'

async function loadSetDefaultAddress() {
  const mod = await import('@/lib/address-utils')
  return mod.setDefaultAddress as (userId: string, addressId: string) => Promise<unknown>
}

describe('M06-F5: setDefaultAddress — src/lib/address-utils.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Cenário 5.6 / RN-M06-10: operação atômica no banco
  it('Cenário 5.6: usa prisma.$transaction (operação atômica — RN-M06-10)', async () => {
    const setDefaultAddress = await loadSetDefaultAddress()
    vi.mocked(prisma.address.updateMany).mockResolvedValue({ count: 1 } as never)
    vi.mocked(prisma.address.update).mockResolvedValue({} as never)

    await setDefaultAddress('user-001', 'addr-2')

    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
  })

  // Cenário 5.6: todos os outros endereços do usuário são desmarcados
  it('Cenário 5.6: desmarca todos os endereços do usuário (updateMany isDefault=false)', async () => {
    const setDefaultAddress = await loadSetDefaultAddress()
    vi.mocked(prisma.address.updateMany).mockResolvedValue({ count: 2 } as never)
    vi.mocked(prisma.address.update).mockResolvedValue({} as never)

    await setDefaultAddress('user-001', 'addr-2')

    expect(prisma.address.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user-001' }),
        data: expect.objectContaining({ isDefault: false }),
      })
    )
  })

  // Cenário 5.6: o endereço alvo é marcado como padrão
  it('Cenário 5.6: marca o endereço alvo com isDefault=true', async () => {
    const setDefaultAddress = await loadSetDefaultAddress()
    vi.mocked(prisma.address.updateMany).mockResolvedValue({ count: 2 } as never)
    vi.mocked(prisma.address.update).mockResolvedValue({} as never)

    await setDefaultAddress('user-001', 'addr-2')

    expect(prisma.address.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'addr-2' }),
        data: expect.objectContaining({ isDefault: true }),
      })
    )
  })
})
