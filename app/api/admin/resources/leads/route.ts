import { NextResponse } from 'next/server'
import { getAllResourceLeads } from '@/lib/resources/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const leads = await getAllResourceLeads()
    return NextResponse.json({
      success: true,
      leads,
      total: leads.length,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

