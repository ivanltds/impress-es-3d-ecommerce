// ─── M04: Admin Leads ───
'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Calendar } from 'lucide-react'

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

  useEffect(() => {
    const stored = localStorage.getItem('leads')
    if (stored) setLeads(JSON.parse(stored))
  }, [])

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-bold">Leads</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border" data-testid="leads-table">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Nome</th>
              <th className="px-4 py-3 text-left font-medium">Contato</th>
              <th className="px-4 py-3 text-left font-medium">Coleção</th>
              <th className="px-4 py-3 text-left font-medium">Data</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">Nenhum lead capturado ainda.</td></tr>
            ) : leads.map((l) => (
              <tr key={l.id} className="border-b hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{l.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.phone || l.email}</td>
                <td className="px-4 py-3">{l.interestCollection || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(l.createdAt).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-3 text-right">
                  <a href={`https://wa.me/${l.phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-green-600 hover:bg-green-50">
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
