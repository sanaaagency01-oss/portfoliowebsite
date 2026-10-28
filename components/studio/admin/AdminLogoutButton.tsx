'use client'

import React, { useState } from 'react'
import { LogOut } from 'lucide-react'

export default function AdminLogoutButton({ className = '' }: { className?: string }) {
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      window.location.href = '/admin/login'
    } catch (e) {
      console.error('Failed to logout', e)
      window.location.href = '/admin/login'
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      title="Админ системээс гарах"
      className={
        className ||
        'flex items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs font-semibold text-[#666666] hover:bg-[#fafafa] hover:text-black transition'
      }
    >
      <LogOut className="size-3.5" />
      <span>{loggingOut ? 'Гарч байна...' : 'Гарах'}</span>
    </button>
  )
}
