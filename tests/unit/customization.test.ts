// ─── Unit Tests: src/lib/customization.ts ───
import { describe, it, expect } from 'vitest'
import {
  calcCustomizationTotal,
  fieldTypeLabel,
  FILE_LIMITS,
} from '@/lib/customization'
import type { CustomizationValue, CustomizationFieldType } from '@/lib/customization'

// ─── Fixtures ───────────────────────────────────────────────────────────────

function makeValue(overrides: Partial<CustomizationValue> = {}): CustomizationValue {
  return {
    fieldId: 'field-1',
    fieldType: 'text',
    label: 'Nome',
    value: 'Ivan',
    displayValue: 'Ivan',
    priceAdd: 0,
    ...overrides,
  }
}

// ─── calcCustomizationTotal ──────────────────────────────────────────────────

describe('calcCustomizationTotal', () => {
  it('retorna 0 para array vazio', () => {
    expect(calcCustomizationTotal([])).toBe(0)
  })

  it('soma os priceAdd de todos os campos', () => {
    const values = [
      makeValue({ priceAdd: 10 }),
      makeValue({ fieldId: 'field-2', priceAdd: 5.5 }),
      makeValue({ fieldId: 'field-3', priceAdd: 2 }),
    ]
    expect(calcCustomizationTotal(values)).toBeCloseTo(17.5)
  })

  it('ignora campos com priceAdd zero', () => {
    const values = [
      makeValue({ priceAdd: 0 }),
      makeValue({ fieldId: 'field-2', priceAdd: 20 }),
    ]
    expect(calcCustomizationTotal(values)).toBe(20)
  })

  it('funciona com um único campo', () => {
    expect(calcCustomizationTotal([makeValue({ priceAdd: 9.99 })])).toBeCloseTo(9.99)
  })

  it('lida com priceAdd undefined tratado como 0', () => {
    const values = [
      makeValue({ priceAdd: undefined as unknown as number }),
      makeValue({ fieldId: 'field-2', priceAdd: 5 }),
    ]
    // priceAdd undefined deve contribuir 0 (o || 0 no reduce garante)
    expect(calcCustomizationTotal(values)).toBe(5)
  })

  it('soma valores decimais com precisão', () => {
    const values = [
      makeValue({ priceAdd: 0.1 }),
      makeValue({ fieldId: 'f2', priceAdd: 0.2 }),
    ]
    expect(calcCustomizationTotal(values)).toBeCloseTo(0.3)
  })
})

// ─── fieldTypeLabel ──────────────────────────────────────────────────────────

describe('fieldTypeLabel', () => {
  const cases: [CustomizationFieldType, string][] = [
    ['text',          'Texto curto'],
    ['textarea',      'Observação (texto longo)'],
    ['color_select',  'Seleção de cor'],
    ['size_select',   'Seleção de tamanho'],
    ['option_select', 'Opções (select)'],
    ['image_ref',     'Imagem de referência'],
    ['file_3d',       'Arquivo 3D (.STL/.OBJ)'],
  ]

  it.each(cases)('fieldTypeLabel("%s") retorna "%s"', (type, expected) => {
    expect(fieldTypeLabel(type)).toBe(expected)
  })

  it('cobre todos os 7 tipos de campo', () => {
    const allTypes: CustomizationFieldType[] = [
      'text', 'textarea', 'color_select', 'size_select',
      'option_select', 'image_ref', 'file_3d',
    ]
    allTypes.forEach((t) => {
      expect(() => fieldTypeLabel(t)).not.toThrow()
      expect(fieldTypeLabel(t)).toBeTruthy()
    })
  })
})

// ─── FILE_LIMITS ─────────────────────────────────────────────────────────────

describe('FILE_LIMITS', () => {
  it('image_ref tem limite de 8MB', () => {
    expect(FILE_LIMITS.image_ref.maxMB).toBe(8)
  })

  it('file_3d tem limite de 20MB', () => {
    expect(FILE_LIMITS.file_3d.maxMB).toBe(20)
  })

  it('image_ref aceita formatos corretos', () => {
    expect(FILE_LIMITS.image_ref.accept).toContain('image/jpeg')
    expect(FILE_LIMITS.image_ref.accept).toContain('image/png')
  })

  it('file_3d aceita .stl, .obj, .3mf', () => {
    expect(FILE_LIMITS.file_3d.accept).toContain('.stl')
    expect(FILE_LIMITS.file_3d.accept).toContain('.obj')
    expect(FILE_LIMITS.file_3d.accept).toContain('.3mf')
  })
})
