'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Calendar, ChevronDown, ChevronRight, MessageSquare } from 'lucide-react'

interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  source: string
  interestCollection?: string
  message: string
  createdAt: string
  status: string
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('leads')
    if (stored) setLeads(JSON.parse(stored))
  }, [])

  const collectionNames: Record<string, string> = {
    gamer: 'Gamer Energy', anime: 'Anime Pop', home: 'Casa & Utilidades', gifts: 'Presentes', auto: 'Auto Vintage',
  }

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-bold">Leads</h1>
      {leads.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <MessageSquare className="mb-4 h-16 w-16 text-muted-foreground/20" />
          <p className="text-lg font-medium">Nenhum lead ainda</p>
          <p className="text-sm text-muted-foreground">Os leads aparecerão quando visitantes preencherem o formulário "Quero Algo Personalizado" na home page.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3" data-testid="leads-table">
          {leads.map((l) => (
            <div key={l.id} className="rounded-xl border bg-card transition-all hover:shadow-md">
              <div
                className="flex cursor-pointer items-center justify-between p-5"
                onClick={() => setExpanded(expanded === l.id ? null : l.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {expanded === l.id ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    <span className="font-semibold">{l.name}</span>
                    <span className="text-sm text-muted-foreground">{l.phone || l.email}</span>
                  </div>
                  <div className="ml-6 mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(l.createdAt).toLocaleDateString('pt-BR')}</span>
                    {l.interestCollection && <span>{collectionNames[l.interestCollection] || l.interestCollection}</span>}
                  </div>
                </div>
                <a
                  href={`https://wa.me/${l.phone?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600 transition-colors hover:bg-green-200"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
              {expanded === l.id && (
                <div className="border-t px-5 pb-5 pt-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Mensagem</p>
                  <p className="mt-2 text-sm leading-relaxed">{l.message}</p>
                  <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                    <span>Status: <span className="font-medium text-foreground">{l.status}</span></span>
                    <span>Origem: <span className="font-medium text-foreground">{l.source}</span></span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
