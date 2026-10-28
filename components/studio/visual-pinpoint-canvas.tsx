'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  X,
  Plus,
  Check,
} from 'lucide-react'
import { VisualComment, DesignAsset } from '@/lib/types/studio'

interface VisualPinpointCanvasProps {
  asset: DesignAsset
  projectToken: string
  currentUserRole: 'CLIENT' | 'DESIGNER'
  currentUserName: string
}

export default function VisualPinpointCanvas({
  asset,
  projectToken,
  currentUserRole,
  currentUserName,
}: VisualPinpointCanvasProps) {
  const [comments, setComments] = useState<VisualComment[]>([])
  const [loading, setLoading] = useState(true)
  const [activePinId, setActivePinId] = useState<string | null>(null)
  const [draftPin, setDraftPin] = useState<{ xPercent: number; yPercent: number } | null>(null)
  const [newCommentText, setNewCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all')

  const imageContainerRef = useRef<HTMLDivElement>(null)

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?assetId=${asset.id}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments || [])
      }
    } catch (e) {
      console.error('Failed to load comments', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [asset.id])

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return

    if ((e.target as HTMLElement).closest('.pin-element') || (e.target as HTMLElement).closest('.popover-element')) {
      return
    }

    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setDraftPin({
      xPercent: Math.max(2, Math.min(98, x)),
      yPercent: Math.max(2, Math.min(98, y)),
    })
    setActivePinId(null)
    setNewCommentText('')
  }

  const handleSubmitPinComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draftPin || !newCommentText.trim() || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectToken,
          assetId: asset.id,
          xPercent: draftPin.xPercent,
          yPercent: draftPin.yPercent,
          authorRole: currentUserRole,
          authorName: currentUserName,
          content: newCommentText.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setComments((prev) => [...prev, data.comment])
        setDraftPin(null)
        setNewCommentText('')
        setActivePinId(data.comment.id)
      }
    } catch (e) {
      console.error('Failed submitting comment', e)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleResolve = async (commentId: string) => {
    try {
      const res = await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_resolve',
          assetId: asset.id,
          commentId,
        }),
      })

      if (res.ok) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, status: c.status === 'resolved' ? 'open' : 'resolved' } : c
          )
        )
      }
    } catch (e) {
      console.error('Failed resolving comment', e)
    }
  }

  const handleSendReply = async (commentId: string) => {
    if (!replyText.trim()) return

    try {
      const res = await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply',
          assetId: asset.id,
          commentId,
          reply: {
            authorRole: currentUserRole,
            authorName: currentUserName,
            content: replyText.trim(),
          },
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setComments((prev) => prev.map((c) => (c.id === commentId ? data.comment : c)))
        setReplyText('')
      }
    } catch (e) {
      console.error('Failed sending reply', e)
    }
  }

  const filteredComments = comments.filter((c) => {
    if (filter === 'open') return c.status === 'open'
    if (filter === 'resolved') return c.status === 'resolved'
    return true
  })

  const openCount = comments.filter((c) => c.status === 'open').length
  const resolvedCount = comments.filter((c) => c.status === 'resolved').length

  return (
    <div className="flex flex-col gap-5">
      {/* Top action toolbar - Aligned with Portfolio Black & White Design */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e0e0e0] bg-white pb-4">
        <div className="flex items-center gap-3">
          <span className="flex size-7 items-center justify-center rounded-md bg-black text-[11px] font-bold text-white">
            {asset.version}
          </span>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-black">{asset.title}</h3>
            {asset.description && <p className="text-[12px] text-[#888888]">{asset.description}</p>}
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 rounded-full border border-[#e0e0e0] bg-[#f5f5f5] p-1 text-[11px] font-medium">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-full px-3 py-1 transition-colors ${
              filter === 'all' ? 'bg-black text-white font-semibold' : 'text-[#888888] hover:text-black'
            }`}
          >
            Бүгд ({comments.length})
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`flex items-center gap-1 rounded-full px-3 py-1 transition-colors ${
              filter === 'open' ? 'bg-black text-white font-semibold' : 'text-[#888888] hover:text-black'
            }`}
          >
            Нээлттэй ({openCount})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`flex items-center gap-1 rounded-full px-3 py-1 transition-colors ${
              filter === 'resolved' ? 'bg-black text-white font-semibold' : 'text-[#888888] hover:text-black'
            }`}
          >
            Шийдсэн ({resolvedCount})
          </button>
        </div>
      </div>

      {/* Main interactive canvas area */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-[#888888]">
            <span className="font-medium tracking-wide">
              Зураг дээр хүссэн цэгтээ дарж санал, коммент үлдээнэ үү.
            </span>
            <span>{draftPin ? '📍 Цэг байрлуулж байна...' : ''}</span>
          </div>

          <div
            ref={imageContainerRef}
            onClick={handleImageClick}
            className="group relative cursor-crosshair overflow-hidden rounded-xl border border-[#e0e0e0] bg-[#fafafa] shadow-sm select-none"
          >
            <div className="relative aspect-auto min-h-[460px] w-full">
              <Image
                src={asset.imageUrl}
                alt={asset.title}
                width={1200}
                height={800}
                className="h-auto w-full object-contain"
                priority
              />
            </div>

            {/* Existing Pins */}
            {filteredComments.map((comment, index) => {
              const isActive = activePinId === comment.id
              const isResolved = comment.status === 'resolved'

              return (
                <div
                  key={comment.id}
                  style={{ left: `${comment.xPercent}%`, top: `${comment.yPercent}%` }}
                  className="pin-element absolute -translate-x-1/2 -translate-y-1/2"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActivePinId(isActive ? null : comment.id)
                      setDraftPin(null)
                    }}
                    className={`flex size-7 items-center justify-center rounded-full text-[11px] font-bold shadow-md transition-transform hover:scale-110 ${
                      isResolved
                        ? 'bg-[#ffffff] text-[#166534] border border-[#166534]'
                        : isActive
                        ? 'bg-black text-white ring-4 ring-black/20'
                        : 'bg-black text-white border-2 border-white'
                    }`}
                  >
                    {isResolved ? <Check className="size-3.5" /> : index + 1}
                  </button>
                </div>
              )
            })}

            {/* Draft Pin when user clicks */}
            {draftPin && (
              <div
                style={{ left: `${draftPin.xPercent}%`, top: `${draftPin.yPercent}%` }}
                className="pin-element absolute -translate-x-1/2 -translate-y-1/2"
              >
                <div className="flex size-8 animate-bounce items-center justify-center rounded-full bg-black text-xs font-bold text-white shadow-xl ring-4 ring-black/20">
                  <Plus className="size-4" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar for comment details and creation */}
        <div className="flex flex-col gap-4">
          {/* Draft Pin Comment Form */}
          {draftPin && (
            <div className="popover-element rounded-xl border border-black bg-white p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-black">
                  Шинэ санал оруулах
                </span>
                <button
                  onClick={() => setDraftPin(null)}
                  className="text-[#888888] hover:text-black"
                >
                  <X className="size-4" />
                </button>
              </div>

              <p className="mt-1 text-[11px] text-[#888888]">
                Байршил: X {Math.round(draftPin.xPercent)}%, Y {Math.round(draftPin.yPercent)}%
              </p>

              <form onSubmit={handleSubmitPinComment} className="mt-3">
                <textarea
                  autoFocus
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Та ямар өөрчлөлт, сайжруулалт хийхийг хүсэж байна вэ?"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[#cccccc] bg-[#f5f5f5] p-3 text-sm text-black outline-none focus:border-black transition-colors"
                />

                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDraftPin(null)}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-[#888888] hover:text-black"
                  >
                    Болих
                  </button>
                  <button
                    type="submit"
                    disabled={!newCommentText.trim() || submitting}
                    className="flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white transition hover:bg-[#222222] disabled:opacity-40"
                  >
                    <Send className="size-3.5" />
                    {submitting ? 'Илгээж байна...' : 'Илгээх'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Active Selected Pin Details */}
          {activePinId && (() => {
            const activeComment = comments.find((c) => c.id === activePinId)
            if (!activeComment) return null

            return (
              <div className="popover-element flex flex-col rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3 border-b border-[#f0f0f0] pb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex size-7 items-center justify-center rounded-md text-xs font-bold ${
                        activeComment.authorRole === 'DESIGNER'
                          ? 'bg-black text-white'
                          : 'bg-[#f5f5f5] text-black border border-[#e0e0e0]'
                      }`}
                    >
                      {activeComment.authorRole === 'DESIGNER' ? 'BA' : 'CL'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-black">{activeComment.authorName}</p>
                      <p className="text-[10px] text-[#888888]">
                        {new Date(activeComment.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleResolve(activeComment.id)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                      activeComment.status === 'resolved'
                        ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]'
                        : 'bg-[#f5f5f5] text-[#666666] hover:bg-black hover:text-white'
                    }`}
                  >
                    {activeComment.status === 'resolved' ? (
                      <>
                        <CheckCircle2 className="size-3" /> Шийдсэн
                      </>
                    ) : (
                      <>○ Шийдэхээр тэмдэглэх</>
                    )}
                  </button>
                </div>

                <div className="py-3 text-sm leading-6 text-black">
                  {activeComment.content}
                </div>

                {/* Reply thread */}
                {activeComment.replies && activeComment.replies.length > 0 && (
                  <div className="mt-2 space-y-2 border-t border-[#f0f0f0] pt-3">
                    {activeComment.replies.map((reply) => (
                      <div key={reply.id} className="rounded-lg bg-[#f5f5f5] p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-black">
                            {reply.authorName} ({reply.authorRole === 'DESIGNER' ? 'Дизайнер' : 'Захиалагч'})
                          </span>
                          <span className="text-[10px] text-[#888888]">
                            {new Date(reply.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="mt-1 text-[#444444] leading-relaxed">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply input */}
                <div className="mt-4 flex items-center gap-2 border-t border-[#f0f0f0] pt-3">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendReply(activeComment.id)
                    }}
                    placeholder="Хариу тайлбар бичих..."
                    className="flex-1 rounded-lg border border-[#cccccc] bg-[#f5f5f5] px-3 py-2 text-xs text-black outline-none focus:border-black transition-colors"
                  />
                  <button
                    onClick={() => handleSendReply(activeComment.id)}
                    disabled={!replyText.trim()}
                    className="flex size-8 items-center justify-center rounded-lg bg-black text-white hover:bg-[#222222] disabled:opacity-30"
                  >
                    <Send className="size-3.5" />
                  </button>
                </div>
              </div>
            )
          })()}

          {/* List of comments overview */}
          <div className="rounded-xl border border-[#e0e0e0] bg-white p-5">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
              Бүх саналууд ({filteredComments.length})
            </h4>

            {filteredComments.length === 0 ? (
              <p className="mt-4 text-center text-xs text-[#888888]">
                {loading ? 'Ачаалж байна...' : 'Одоогоор санал үлдээгээгүй байна.'}
              </p>
            ) : (
              <div className="mt-3 flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredComments.map((comment, i) => (
                  <button
                    key={comment.id}
                    onClick={() => {
                      setActivePinId(comment.id)
                      setDraftPin(null)
                    }}
                    className={`flex items-start gap-2.5 rounded-lg border p-3 text-left transition ${
                      activePinId === comment.id
                        ? 'border-black bg-[#f5f5f5]'
                        : 'border-[#f0f0f0] hover:border-[#cccccc] hover:bg-[#fafafa]'
                    }`}
                  >
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        comment.status === 'resolved'
                          ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]'
                          : 'bg-black text-white'
                      }`}
                    >
                      {comment.status === 'resolved' ? <Check className="size-3" /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-xs font-semibold text-black">
                          {comment.authorName}
                        </span>
                        <span className="text-[10px] text-[#888888]">
                          {comment.status === 'resolved' ? 'Шийдсэн' : 'Нээлттэй'}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[#444444]">
                        {comment.content}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
