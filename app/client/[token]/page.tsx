'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  Layers,
  Receipt,
  Clock,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import VisualPinpointCanvas from '@/components/studio/visual-pinpoint-canvas'
import ClientContractTab from '@/components/studio/client/ClientContractTab'
import ClientOverviewTab from '@/components/studio/client/ClientOverviewTab'
import ClientReceiptTab from '@/components/studio/client/ClientReceiptTab'
import { Project, DesignAsset, VatInfo } from '@/lib/types/studio'
import { formatCurrency } from '@/lib/studio-utils'

export default function ClientProjectPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const [token, setToken] = useState('')
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0)

  // Tabs: 'contract' is the default very first tab
  const [activeTab, setActiveTab] = useState<'contract' | 'review' | 'overview' | 'deliverables' | 'receipt'>('contract')

  // VAT Info State
  const [vat, setVat] = useState<VatInfo>({
    enabled: false,
    type: 'company',
  })

  useEffect(() => {
    params.then(({ token: paramToken }) => {
      setToken(paramToken)
      fetch(`/api/projects/${paramToken}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.project) {
            setProject(data.project)
            if (data.project.vat) {
              setVat(data.project.vat)
            }
          }
        })
        .finally(() => setLoading(false))
    })
  }, [params])

  const handleSaveVat = async (updatedVat: VatInfo) => {
    setVat(updatedVat)
    try {
      await fetch(`/api/projects/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vat: updatedVat }),
      })
    } catch (e) {
      console.error('Failed saving VAT', e)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-sm text-[#888888]">
        Төслийн ажлын талбарыг ачаалж байна...
      </main>
    )
  }

  if (!project) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white p-5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-black">Төсөл олдсонгүй</h1>
        <p className="mt-2 text-sm text-[#888888]">Таны оруулсан токен хүчингүй байна.</p>
        <Link href="/" className="mt-4 rounded-full bg-black px-6 py-2.5 text-xs font-semibold text-white">
          Нүүр хуудас руу буцах
        </Link>
      </main>
    )
  }

  const selectedAsset: DesignAsset | undefined = project.assets[selectedAssetIndex] || project.assets[0]
  const isContractSigned = project.contract?.status === 'signed'
  const isContractPublished = Boolean(
    isContractSigned ||
      (project.contract &&
        project.contract.isPublishedToClient &&
        project.contract.total > 0 &&
        project.contract.status !== 'draft')
  )

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Studio Header */}
      <header className="border-b border-[#e0e0e0] bg-white px-6 md:px-10 h-[68px] flex items-center print:hidden">
        <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[18px] font-bold tracking-tight text-black">
              baysaass<span className="text-[#888888]">.</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#888888] pl-2 border-l border-[#e0e0e0]">
              Client Portal
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('contract')}
              className="flex items-center gap-1.5 rounded-full border border-[#cccccc] bg-white px-3.5 py-1.5 text-xs font-medium text-black hover:border-black transition-colors"
            >
              <FileText className="size-3.5 text-[#888888]" />
              Үнийн санал & Гэрээ
              {isContractSigned ? (
                <span className="ml-1 rounded-full bg-[#f0fdf4] px-2 py-0.5 text-[10px] font-semibold text-[#166534] border border-[#bbf7d0]">
                  Баталгаажсан
                </span>
              ) : project.status === 'contract_pending' ? (
                <span className="ml-1 rounded-full bg-[#fff7ed] px-2 py-0.5 text-[10px] font-semibold text-[#c2410c] border border-[#fed7aa]">
                  Гарын үсэг хүлээж буй
                </span>
              ) : project.status === 'proposal_sent' ? (
                <span className="ml-1 rounded-full bg-[#fefce8] px-2 py-0.5 text-[10px] font-semibold text-[#854d0e] border border-[#fef08a]">
                  Үнийн санал бэлэн
                </span>
              ) : (
                <span className="ml-1 rounded-full bg-[#fffaf5] px-2 py-0.5 text-[10px] font-semibold text-[#9a3412] border border-[#fed7aa]">
                  Үнийн санал тооцоолж буй
                </span>
              )}
            </button>
            <div className="flex size-8 items-center justify-center rounded-full bg-[#f5f5f5] text-[11px] font-bold text-black border border-[#e0e0e0]">
              {project.contactName.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* FULL-WIDTH TOP TABS BAR (Уртаар байрлуулсан үндсэн цэс) */}
      <nav className="border-b border-[#e5e5e5] bg-[#fafafa] sticky top-0 z-30 print:hidden">
        <div className="mx-auto flex max-w-[1320px] items-center gap-2 overflow-x-auto px-6 md:px-10 py-2.5 scrollbar-none">
          {/* TAB 1: ҮНИЙН САНАЛ & ГЭРЭЭ */}
          <button
            onClick={() => setActiveTab('contract')}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'contract'
                ? 'bg-black text-white shadow-sm'
                : 'text-[#666666] hover:bg-[#eaeaea] hover:text-black'
            }`}
          >
            <FileText className="size-3.5" />
            <span>1. Үнийн санал & Гэрээ</span>
            {isContractSigned ? (
              <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                activeTab === 'contract' ? 'bg-[#226738] text-white' : 'bg-[#d2ebd6] text-[#226738]'
              }`}>
                Батлагдсан
              </span>
            ) : project.status === 'contract_pending' ? (
              <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                activeTab === 'contract' ? 'bg-[#ea580c] text-white' : 'bg-[#ffedd5] text-[#9a3412]'
              }`}>
                Гарын үсэг хүлээж буй
              </span>
            ) : project.status === 'proposal_sent' ? (
              <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                activeTab === 'contract' ? 'bg-[#ca8a04] text-white' : 'bg-[#fefce8] text-[#854d0e]'
              }`}>
                Үнийн санал бэлэн
              </span>
            ) : (
              <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                activeTab === 'contract' ? 'bg-[#9a3412] text-white' : 'bg-[#fffaf5] text-[#9a3412] border border-[#fed7aa]'
              }`}>
                Үнийн санал тооцоолж буй
              </span>
            )}
          </button>

          {/* TAB 2: ДИЗАЙН ХЯНАХ */}
          <button
            onClick={() => setActiveTab('review')}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'review'
                ? 'bg-black text-white shadow-sm'
                : 'text-[#666666] hover:bg-[#eaeaea] hover:text-black'
            }`}
          >
            <Layers className="size-3.5" />
            <span>2. Дизайн хянах (Pinpoint)</span>
          </button>

          {/* TAB 3: ТӨСЛИЙН ЯВЦ & ХАРИЛЦАН ЯРИА */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-black text-white shadow-sm'
                : 'text-[#666666] hover:bg-[#eaeaea] hover:text-black'
            }`}
          >
            <Clock className="size-3.5" />
            <span>3. Төслийн явц & Харилцаа</span>
          </button>

          {/* TAB 4: МАТЕРИАЛУУД */}
          <button
            onClick={() => setActiveTab('deliverables')}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'deliverables'
                ? 'bg-black text-white shadow-sm'
                : 'text-[#666666] hover:bg-[#eaeaea] hover:text-black'
            }`}
          >
            <CheckCircle2 className="size-3.5" />
            <span>4. Хүлээлгэн өгөх материалууд</span>
          </button>

          {/* TAB 5: БАРИМТ АВАХ */}
          <button
            onClick={() => setActiveTab('receipt')}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'receipt'
                ? 'bg-black text-white shadow-sm'
                : 'text-[#666666] hover:bg-[#eaeaea] hover:text-black'
            }`}
          >
            <Receipt className="size-3.5" />
            <span>5. Баримт авах (Нэхэмжлэх)</span>
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-[1320px] px-6 md:px-10 py-8 md:py-10">
        {/* Project Header Info */}
        <div className="border-b border-[#e0e0e0] pb-6 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#888888] mb-1.5">
                {project.company} · {project.type}
              </p>
              <h1 className="text-2xl md:text-4xl font-black tracking-[-0.04em] text-black">
                {project.name}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-[#e0e0e0] bg-[#fafafa] px-4 py-2 text-right">
                <span className="block text-[10px] text-[#888888] font-bold uppercase tracking-wider">Нийт төсөв</span>
                <span className="font-extrabold text-sm text-black">{formatCurrency(project.contract.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 1: ГЭРЭЭ ҮЗЭХ & ХЭВЛЭХ / БАТАЛГААЖУУЛАХ */}
        {activeTab === 'contract' && (
          <ClientContractTab
            project={project}
            token={token}
            onProjectUpdated={setProject}
          />
        )}

        {/* TAB 2: Visual Pinpoint Review Canvas */}
        {activeTab === 'review' && (
          <div className="mt-8 flex flex-col gap-6">
            {project.assets.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {project.assets.map((asset, idx) => (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAssetIndex(idx)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                      selectedAssetIndex === idx
                        ? 'border-black bg-black text-white font-semibold'
                        : 'border-[#cccccc] bg-white text-[#888888] hover:border-black hover:text-black'
                    }`}
                  >
                    <Layers className="size-3.5" />
                    {asset.title} ({asset.version})
                  </button>
                ))}
              </div>
            )}

            {selectedAsset ? (
              <VisualPinpointCanvas
                asset={selectedAsset}
                projectToken={token}
                currentUserRole="CLIENT"
                currentUserName={project.contactName}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-[#cccccc] bg-[#f9f9f9] p-16 text-center text-sm text-[#888888]">
                Одоогоор хянах хувилбар хуулагдаагүй байна. Дизайнер тун удахгүй шинэ хувилбарыг оруулна.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ТӨСЛИЙН ЯВЦ & ХАРИЛЦАН ЯРИА */}
        {activeTab === 'overview' && (
          <ClientOverviewTab
            project={project}
            token={token}
            vat={vat}
            onOpenReceiptTab={() => setActiveTab('receipt')}
            onToggleVat={(enabled) => {
              const updated = { ...vat, enabled }
              handleSaveVat(updated)
              if (enabled) setActiveTab('receipt')
            }}
          />
        )}

        {/* TAB 4: МАТЕРИАЛУУД */}
        {activeTab === 'deliverables' && (
          <div className="mt-8 rounded-2xl border border-[#e0e0e0] bg-white p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-bold tracking-tight text-black">Хүлээлгэн өгөх материалууд</h3>
            <p className="mt-1 text-xs text-[#888888]">
              Гэрээнд баталгаажсан ажлуудын биелэлтийн жагсаалт:
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {project.contract.deliverables?.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-white border border-[#e0e0e0] text-xs font-bold text-black">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-black">{item.name}</h4>
                      <p className="text-xs text-[#666666]">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#888888]">Хугацаа: {item.due}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                        item.status === 'approved' || item.completed
                          ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]'
                          : 'bg-[#f5f5f5] text-[#888888] border border-[#e0e0e0]'
                      }`}
                    >
                      {item.status === 'approved' || item.completed ? 'Батлагдсан' : 'Хийгдэж буй'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: БАРИМТ АВАХ (НЭХЭМЖЛЭХ) */}
        {activeTab === 'receipt' && (
          <ClientReceiptTab
            project={project}
            token={token}
            onProjectUpdated={setProject}
          />
        )}
      </div>
    </main>
  )
}
