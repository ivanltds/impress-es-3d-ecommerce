// ─── Tipos compartilhados: Sistema de Personalização ───

export type CustomizationFieldType =
  | 'text'          // texto curto — nome, frase
  | 'textarea'      // texto longo — observações ao produtor
  | 'color_select'  // seleção de cor com swatches
  | 'size_select'   // seleção de tamanho (P/M/G ou custom)
  | 'option_select' // opções genéricas (acabamento, base, etc.)
  | 'image_ref'     // imagem de referência (JPG/PNG/WebP, até 8MB)
  | 'file_3d'       // arquivo 3D (.stl/.obj/.3mf, até 20MB)

export interface CustomizationOption {
  value: string       // identificador interno
  label: string       // texto exibido
  priceAdd: number    // acréscimo em R$
  color?: string      // hex — somente para color_select
}

export interface CustomizationField {
  id: string                       // slug único (gerado no admin)
  type: CustomizationFieldType
  label: string                    // ex: "Nome para gravar"
  placeholder?: string
  required: boolean
  maxLength?: number               // somente para text/textarea
  priceAdd: number                 // acréscimo fixo (text, textarea, uploads)
  options?: CustomizationOption[]  // somente para *_select
}

// ─── O que fica salvo no carrinho / pedido por campo preenchido ───

export interface CustomizationValue {
  fieldId: string
  fieldType: CustomizationFieldType
  label: string        // label do campo (congelado no momento da compra)
  value: string        // texto livre OU value da opção selecionada OU nome do arquivo
  displayValue: string // texto legível para exibição (label da opção, nome do arquivo, etc.)
  priceAdd: number     // acréscimo gerado por este campo
  fileUrl?: string     // data URL base64 — somente para uploads
}

export type CustomizationSnapshot = CustomizationValue[]

// ─── Limite de arquivo por tipo ───
export const FILE_LIMITS = {
  image_ref: { maxMB: 8,  label: '8MB',  accept: 'image/jpeg,image/png,image/webp' },
  file_3d:   { maxMB: 20, label: '20MB', accept: '.stl,.obj,.3mf' },
} as const

// ─── Helpers ───

export function calcCustomizationTotal(values: CustomizationValue[]): number {
  return values.reduce((acc, v) => acc + (v.priceAdd || 0), 0)
}

export function fieldTypeLabel(type: CustomizationFieldType): string {
  const map: Record<CustomizationFieldType, string> = {
    text:          'Texto curto',
    textarea:      'Observação (texto longo)',
    color_select:  'Seleção de cor',
    size_select:   'Seleção de tamanho',
    option_select: 'Opções (select)',
    image_ref:     'Imagem de referência',
    file_3d:       'Arquivo 3D (.STL/.OBJ)',
  }
  return map[type]
}
