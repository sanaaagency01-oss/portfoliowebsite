'use client'

import React, { useEffect, useState } from 'react'
import { Cloud, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'

interface SystemStatus {
  status: string
  services: {
    cloudflareD1?: { status: string; latencyMs: number; syncedProjects: number }
    cloudflareR2?: { status: string; bucket: string }
    openai?: { status: string; model: string }
    typesafeAI?: { status: string; model: string }
  }
}

export function CloudflareStatusBadge() {
  const [data, setData] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/system/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json) setData(json)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const isD1Active = data?.services?.cloudflareD1?.status === 'connected'
  const projectCount = data?.services?.cloudflareD1?.syncedProjects ?? 0

  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-white p-2.5 text-[11px]">
      <div className="flex items-center justify-between text-[#444]">
        <div className="flex items-center gap-1.5 font-medium">
          <Cloud className="size-3.5 text-black" />
          <span>Cloudflare D1</span>
        </div>
        {loading ? (
          <RefreshCw className="size-3 animate-spin text-[#888]" />
        ) : isD1Active ? (
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600">
            <AlertCircle className="size-3 text-amber-500" />
            Local
          </span>
        )}
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#888]">
        <span>Байршил: Amsterdam</span>
        <span className="font-mono">{projectCount} төсөл синк</span>
      </div>
    </div>
  )
}
