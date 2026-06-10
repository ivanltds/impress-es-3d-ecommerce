// ─── M03: Shipping Mock ───
// ⚠️ TECH DEBT: Substituir por API dos Correios quando disponível
// Origem: Osasco/SP (CEP 06110-000)

export interface ShippingOption {
  id: string
  name: string
  price: number
  days: number
}

// Regiões aproximadas para simulação de frete a partir de Osasco/SP
function getRegion(cep: string): string {
  const prefix = cep.replace(/\D/g, '').slice(0, 2)
  // Grande SP (Osasco e arredores)
  if (['06', '01', '02', '03', '04', '05', '07', '08', '09'].includes(prefix)) return 'sp-capital'
  // Interior SP
  if (['1', '2'].includes(prefix[0])) return 'sp-interior'
  // Sul/Sudeste
  if (['3', '8'].includes(prefix[0])) return 'sudeste-sul'
  // Resto do Brasil
  return 'outros'
}

export async function calculateShipping(cep: string): Promise<ShippingOption[]> {
  if (!cep || cep.replace(/\D/g, '').length < 5) return []

  const region = getRegion(cep)

  const table: Record<string, { pac: number; sedex: number; pacDays: number; sedexDays: number }> = {
    'sp-capital':   { pac: 12.9, sedex: 22.9, pacDays: 2, sedexDays: 1 },
    'sp-interior':  { pac: 18.9, sedex: 29.9, pacDays: 4, sedexDays: 2 },
    'sudeste-sul':  { pac: 24.9, sedex: 39.9, pacDays: 7, sedexDays: 3 },
    'outros':       { pac: 32.9, sedex: 49.9, pacDays: 10, sedexDays: 5 },
  }

  const r = table[region]

  return [
    { id: 'pac', name: 'PAC — Correios', price: r.pac, days: r.pacDays },
    { id: 'sedex', name: 'SEDEX — Correios', price: r.sedex, days: r.sedexDays },
  ]
}
