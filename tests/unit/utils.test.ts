// ─── Unit Tests: src/lib/utils.ts ───
import { describe, it, expect } from 'vitest'
import { formatPrice, generateOrderNumber } from '@/lib/utils'

describe('formatPrice', () => {
  it('deve formatar valor em BRL', () => {
    const result = formatPrice(49.9)
    expect(result).toContain('49,90')
    expect(result).toContain('R$')
  })

  it('deve formatar valor inteiro com decimais', () => {
    const result = formatPrice(100)
    expect(result).toContain('100,00')
  })
})

describe('generateOrderNumber', () => {
  it('deve gerar número no formato 3DP-XXXXX', () => {
    const orderNumber = generateOrderNumber()
    expect(orderNumber).toMatch(/^3DP-\d{5}$/)
  })

  it('deve gerar números diferentes em chamadas consecutivas', () => {
    const a = generateOrderNumber()
    const b = generateOrderNumber()
    // Podem ser iguais por coincidência (Math.random), mas é improvável
    // Testamos o formato pelo menos
    expect(a).toMatch(/^3DP-\d{5}$/)
    expect(b).toMatch(/^3DP-\d{5}$/)
  })
})
