// ─── M03: Shipping Mock ───
// ⚠️ TECH DEBT: Substituir por API dos Correios quando disponível

export interface ShippingOption {
  id: string
  name: string
  price: number
  days: number
}

export async function calculateShipping(cep: string): Promise<ShippingOption[]> {
  // Mock: retorna PAC e SEDEX com valores fixos para qualquer CEP ≥ 5 dígitos
  if (!cep || cep.length < 5) {
    return []
  }
  return [
    { id: 'pac', name: 'PAC — Correios', price: 15.9, days: 7 },
    { id: 'sedex', name: 'SEDEX — Correios', price: 29.9, days: 3 },
  ]
}
