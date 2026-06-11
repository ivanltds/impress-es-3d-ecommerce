'use client'

import { useState } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react'
import {
  CustomizationField,
  CustomizationFieldType,
  CustomizationOption,
  fieldTypeLabel,
} from '@/lib/customization'

interface Props {
  value: CustomizationField[]
  onChange: (fields: CustomizationField[]) => void
}

const FIELD_TYPES: CustomizationFieldType[] = [
  'text', 'textarea', 'color_select', 'size_select', 'option_select', 'image_ref', 'file_3d',
]

function genId(label: string) {
  return label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 20) + '_' + Math.random().toString(36).slice(2, 6)
}

function FieldCard({
  field, index, total,
  onChange, onDelete, onMove,
}: {
  field: CustomizationField
  index: number
  total: number
  onChange: (f: CustomizationField) => void
  onDelete: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const [open, setOpen] = useState(true)
  const hasOptions = ['color_select', 'size_select', 'option_select'].includes(field.type)
  const isUpload = field.type === 'image_ref' || field.type === 'file_3d'
  const isText = field.type === 'text' || field.type === 'textarea'

  function setField<K extends keyof CustomizationField>(k: K, v: CustomizationField[K]) {
    onChange({ ...field, [k]: v })
  }

  function addOption() {
    const opt: CustomizationOption = { value: `opcao_${(field.options?.length || 0) + 1}`, label: '', priceAdd: 0 }
    setField('options', [...(field.options || []), opt])
  }

  function updateOption(i: number, partial: Partial<CustomizationOption>) {
    const opts = [...(field.options || [])]
    opts[i] = { ...opts[i], ...partial }
    setField('options', opts)
  }

  function removeOption(i: number) {
    setField('options', (field.options || []).filter((_, idx) => idx !== i))
  }

  const typeColors: Record<string, string> = {
    text: 'bg-blue-50 text-blue-700',
    textarea: 'bg-indigo-50 text-indigo-700',
    color_select: 'bg-pink-50 text-pink-700',
    size_select: 'bg-purple-50 text-purple-700',
    option_select: 'bg-amber-50 text-amber-700',
    image_ref: 'bg-teal-50 text-teal-700',
    file_3d: 'bg-orange-50 text-orange-700',
  }

  return (
    <div className="rounded-xl border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${typeColors[field.type] || 'bg-muted text-muted-foreground'}`}>
          {fieldTypeLabel(field.type)}
        </span>
        <span className="flex-1 truncate text-sm font-medium">{field.label || <span className="text-muted-foreground italic">sem nome</span>}</span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="rounded p-1 hover:bg-muted disabled:opacity-20"><ChevronUp className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} className="rounded p-1 hover:bg-muted disabled:opacity-20"><ChevronDown className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => setOpen((v) => !v)} className="rounded p-1 hover:bg-muted text-xs text-muted-foreground">{open ? '▲' : '▼'}</button>
          <button type="button" onClick={onDelete} className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {open && (
        <div className="border-t px-4 pb-4 pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Label */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Label exibida ao cliente *</label>
              <input
                value={field.label}
                onChange={(e) => setField('label', e.target.value)}
                placeholder="Ex: Nome para gravar"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            {/* Placeholder (text/textarea only) */}
            {isText && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Placeholder</label>
                <input
                  value={field.placeholder || ''}
                  onChange={(e) => setField('placeholder', e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Required */}
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => setField('required', e.target.checked)}
                className="h-4 w-4 rounded"
              />
              Obrigatório
            </label>

            {/* MaxLength (text/textarea) */}
            {isText && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Máx. caracteres</label>
                <input
                  type="number"
                  value={field.maxLength || ''}
                  onChange={(e) => setField('maxLength', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="ex: 30"
                  className="w-20 rounded-lg border px-2 py-1.5 text-sm"
                />
              </div>
            )}

            {/* Price add (text, textarea, uploads — selects têm preço por opção) */}
            {!hasOptions && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Acréscimo R$</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={field.priceAdd}
                  onChange={(e) => setField('priceAdd', parseFloat(e.target.value) || 0)}
                  className="w-24 rounded-lg border px-2 py-1.5 text-sm"
                />
              </div>
            )}
          </div>

          {/* Options editor */}
          {hasOptions && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted-foreground">Opções</label>
                <button type="button" onClick={addOption} className="flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium hover:bg-muted/80">
                  <Plus className="h-3 w-3" /> Adicionar opção
                </button>
              </div>
              <div className="space-y-2">
                {(field.options || []).map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                    {/* Color swatch (color_select only) */}
                    {field.type === 'color_select' && (
                      <input
                        type="color"
                        value={opt.color || '#000000'}
                        onChange={(e) => updateOption(i, { color: e.target.value })}
                        className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                        title="Cor do filamento"
                      />
                    )}
                    <input
                      value={opt.label}
                      onChange={(e) => updateOption(i, { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      placeholder="Label da opção"
                      className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-muted-foreground">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={opt.priceAdd}
                        onChange={(e) => updateOption(i, { priceAdd: parseFloat(e.target.value) || 0 })}
                        className="w-20 rounded-md border bg-background px-2 py-1 text-sm"
                        placeholder="0,00"
                      />
                    </div>
                    <button type="button" onClick={() => removeOption(i)} className="text-muted-foreground hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {(!field.options || field.options.length === 0) && (
                  <p className="text-xs text-muted-foreground italic py-1">Nenhuma opção adicionada ainda.</p>
                )}
              </div>
            </div>
          )}

          {isUpload && (
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              {field.type === 'image_ref'
                ? '📎 Cliente pode anexar JPG, PNG ou WebP até 8MB. Se exceder, é direcionado ao WhatsApp.'
                : '📐 Cliente pode enviar .STL, .OBJ ou .3MF até 20MB. Se exceder, é direcionado ao WhatsApp.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function CustomizationBuilder({ value, onChange }: Props) {
  const [showTypeMenu, setShowTypeMenu] = useState(false)

  function addField(type: CustomizationFieldType) {
    const label = fieldTypeLabel(type)
    const newField: CustomizationField = {
      id: genId(label),
      type,
      label: '',
      required: false,
      priceAdd: 0,
      placeholder: type === 'text' ? 'Ex: João Silva' : undefined,
      options: ['color_select', 'size_select', 'option_select'].includes(type) ? [] : undefined,
    }
    onChange([...value, newField])
    setShowTypeMenu(false)
  }

  function updateField(index: number, field: CustomizationField) {
    const next = [...value]
    next[index] = field
    onChange(next)
  }

  function deleteField(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function moveField(index: number, dir: -1 | 1) {
    const next = [...value]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div>
      <div className="space-y-3">
        {value.map((field, i) => (
          <FieldCard
            key={field.id}
            field={field}
            index={i}
            total={value.length}
            onChange={(f) => updateField(i, f)}
            onDelete={() => deleteField(i)}
            onMove={(dir) => moveField(i, dir)}
          />
        ))}
      </div>

      {value.length === 0 && (
        <div className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
          Nenhum campo adicionado. Clique em "+ Adicionar campo" para começar.
        </div>
      )}

      <div className="relative mt-3">
        <button
          type="button"
          onClick={() => setShowTypeMenu((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          Adicionar campo
        </button>

        {showTypeMenu && (
          <div className="absolute left-0 top-full mt-1 z-20 w-64 rounded-xl border bg-card shadow-xl">
            <p className="px-3 pt-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tipo de campo</p>
            {FIELD_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => addField(t)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                {fieldTypeLabel(t)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
