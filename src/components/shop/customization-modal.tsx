'use client'

import { useState, useRef } from 'react'
import { X, Upload, Check, AlertTriangle, MessageCircle, FileText } from 'lucide-react'
import type {
  CustomizationField,
  CustomizationValue,
  CustomizationSnapshot,
} from '@/lib/customization'
import { calcCustomizationTotal, FILE_LIMITS } from '@/lib/customization'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '55'

interface Props {
  productName: string
  basePrice: number
  schema: CustomizationField[]
  onConfirm: (snapshot: CustomizationSnapshot, customizationPrice: number) => void
  onClose: () => void
}

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function FileUploadField({
  field,
  value,
  onChange,
  productName,
}: {
  field: CustomizationField
  value: CustomizationValue | undefined
  onChange: (v: CustomizationValue | null) => void
  productName: string
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const limits = FILE_LIMITS[field.type as keyof typeof FILE_LIMITS]
  const kind = field.type // image_ref | file_3d

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)

    const form = new FormData()
    form.append('file', file)
    form.append('kind', kind)

    const res = await fetch('/api/uploads/customization', { method: 'POST', body: form })
    const data = await res.json()

    if (res.status === 413) {
      // Arquivo grande demais — redirecionar para WhatsApp
      const msg = encodeURIComponent(
        `Olá! Quero personalizar o produto "${productName}" mas meu arquivo (${file.name}) tem ${(file.size / 1024 / 1024).toFixed(1)}MB e excede o limite. Podem me ajudar?`
      )
      setError(`too_large:${msg}`)
      setUploading(false)
      return
    }

    if (!res.ok) {
      setError(data.error || 'Erro no upload')
      setUploading(false)
      return
    }

    onChange({
      fieldId: field.id,
      fieldType: field.type,
      label: field.label,
      value: file.name,
      displayValue: file.name,
      priceAdd: field.priceAdd,
      fileUrl: data.url,
    })
    setUploading(false)
  }

  const isTooLarge = error.startsWith('too_large:')
  const waMsg = isTooLarge ? error.split('too_large:')[1] : ''

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={limits?.accept}
        onChange={handleFile}
        className="hidden"
      />

      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:bg-green-950/20">
          <Check className="h-4 w-4 shrink-0 text-green-600" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-green-800 dark:text-green-300">{value.displayValue}</p>
            {field.priceAdd > 0 && <p className="text-xs text-green-600">+{formatBRL(field.priceAdd)}</p>}
          </div>
          <button
            type="button"
            onClick={() => { onChange(null); if (inputRef.current) inputRef.current.value = '' }}
            className="shrink-0 rounded-full p-1 text-green-600 hover:bg-green-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
        >
          <Upload className="h-4 w-4 shrink-0" />
          {uploading ? 'Enviando...' : `Selecionar arquivo`}
          <span className="ml-auto text-xs opacity-60">até {limits?.label}</span>
        </button>
      )}

      {isTooLarge && (
        <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:bg-amber-950/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Arquivo muito grande</p>
              <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                O limite é {limits?.label}. Você pode enviar o arquivo diretamente pelo WhatsApp e nossa equipe cuida do resto.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP}?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Enviar pelo WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {!isTooLarge && error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
          <AlertTriangle className="h-3 w-3" /> {error}
        </p>
      )}

      <p className="mt-1 text-xs text-muted-foreground">
        {field.type === 'image_ref'
          ? `JPG, PNG ou WebP — máx. ${limits?.label}`
          : `STL, OBJ ou 3MF — máx. ${limits?.label}`}
      </p>
    </div>
  )
}

export function CustomizationModal({ productName, basePrice, schema, onConfirm, onClose }: Props) {
  const [values, setValues] = useState<Record<string, CustomizationValue>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  function setValue(fieldId: string, v: CustomizationValue | null) {
    setValues((prev) => {
      const next = { ...prev }
      if (v) next[fieldId] = v
      else delete next[fieldId]
      return next
    })
    setErrors((prev) => { const n = { ...prev }; delete n[fieldId]; return n })
  }

  function getTextValue(field: CustomizationField): string {
    return values[field.id]?.value || ''
  }

  function setTextValue(field: CustomizationField, text: string) {
    if (!text) { setValue(field.id, null); return }
    setValue(field.id, {
      fieldId: field.id,
      fieldType: field.type,
      label: field.label,
      value: text,
      displayValue: text,
      priceAdd: field.priceAdd,
    })
  }

  function setOptionValue(field: CustomizationField, optionValue: string) {
    const opt = field.options?.find((o) => o.value === optionValue)
    if (!optionValue || !opt) { setValue(field.id, null); return }
    setValue(field.id, {
      fieldId: field.id,
      fieldType: field.type,
      label: field.label,
      value: opt.value,
      displayValue: opt.label,
      priceAdd: opt.priceAdd,
    })
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    schema.forEach((f) => {
      if (f.required && !values[f.id]) {
        errs[f.id] = 'Campo obrigatório'
      }
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleConfirm() {
    if (!validate()) return
    const snapshot: CustomizationSnapshot = Object.values(values)
    const customizationPrice = calcCustomizationTotal(snapshot)
    onConfirm(snapshot, customizationPrice)
  }

  const snapshot = Object.values(values)
  const customizationPrice = calcCustomizationTotal(snapshot)
  const total = basePrice + customizationPrice

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card sm:rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card px-5 py-4">
          <div>
            <h2 className="font-heading text-lg font-bold">Personalizar</h2>
            <p className="text-xs text-muted-foreground">{productName}</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-5 px-5 py-5">
          {schema.map((field) => (
            <div key={field.id}>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-2">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
                {field.priceAdd > 0 && (
                  <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    +{formatBRL(field.priceAdd)}
                  </span>
                )}
              </label>

              {/* Text */}
              {field.type === 'text' && (
                <input
                  type="text"
                  value={getTextValue(field)}
                  onChange={(e) => setTextValue(field, e.target.value)}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${errors[field.id] ? 'border-red-400' : ''}`}
                />
              )}

              {/* Textarea */}
              {field.type === 'textarea' && (
                <textarea
                  value={getTextValue(field)}
                  onChange={(e) => setTextValue(field, e.target.value)}
                  placeholder={field.placeholder || 'Escreva aqui...'}
                  maxLength={field.maxLength}
                  rows={3}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none ${errors[field.id] ? 'border-red-400' : ''}`}
                />
              )}

              {/* Color select */}
              {field.type === 'color_select' && (
                <div className="flex flex-wrap gap-2">
                  {(field.options || []).map((opt) => {
                    const selected = values[field.id]?.value === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setOptionValue(field, opt.value)}
                        className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition-all ${selected ? 'border-primary shadow-md' : 'border-transparent hover:border-muted-foreground/30'}`}
                      >
                        <span
                          className="h-8 w-8 rounded-full border shadow-sm"
                          style={{ backgroundColor: opt.color || '#ccc' }}
                        />
                        <span className="text-[11px] font-medium">{opt.label}</span>
                        {opt.priceAdd > 0 && <span className="text-[10px] text-primary">+{formatBRL(opt.priceAdd)}</span>}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Size / Option select */}
              {(field.type === 'size_select' || field.type === 'option_select') && (
                <div className="flex flex-wrap gap-2">
                  {(field.options || []).map((opt) => {
                    const selected = values[field.id]?.value === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setOptionValue(field, opt.value)}
                        className={`rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all ${selected ? 'border-primary bg-primary/10 text-primary' : 'border-muted hover:border-primary/50'}`}
                      >
                        {opt.label}
                        {opt.priceAdd > 0 && <span className="ml-1.5 text-xs opacity-70">+{formatBRL(opt.priceAdd)}</span>}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* File uploads */}
              {(field.type === 'image_ref' || field.type === 'file_3d') && (
                <FileUploadField
                  field={field}
                  value={values[field.id]}
                  onChange={(v) => setValue(field.id, v)}
                  productName={productName}
                />
              )}

              {errors[field.id] && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertTriangle className="h-3 w-3" /> {errors[field.id]}
                </p>
              )}

              {field.maxLength && (field.type === 'text' || field.type === 'textarea') && (
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {getTextValue(field).length}/{field.maxLength}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Footer — preço + confirmação */}
        <div className="sticky bottom-0 border-t bg-card px-5 py-4">
          <div className="mb-3 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Preço base</span>
              <span>{formatBRL(basePrice)}</span>
            </div>
            {customizationPrice > 0 && (
              <div className="flex justify-between text-primary">
                <span>Personalização</span>
                <span>+{formatBRL(customizationPrice)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-semibold text-base">
              <span>Total do item</span>
              <span>{formatBRL(total)}</span>
            </div>
          </div>
          <button
            onClick={handleConfirm}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
          >
            Confirmar personalização
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Versão "sugestão" para produtos sem schema ───
export function CustomizationSuggestion({ productName }: { productName: string }) {
  const msg = encodeURIComponent(
    `Olá! Tenho interesse em personalizar o produto "${productName}". Quais são as opções disponíveis?`
  )
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-dashed bg-muted/30 px-4 py-3">
      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
      <p className="flex-1 text-xs text-muted-foreground">
        Quer algo diferente ou personalizado?
      </p>
      <a
        href={`https://wa.me/${WHATSAPP}?text=${msg}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex shrink-0 items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Fale conosco
      </a>
    </div>
  )
}
