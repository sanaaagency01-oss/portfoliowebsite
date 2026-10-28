import { NextResponse } from 'next/server'
import { checkCloudflareHealth, executeD1Query } from '@/lib/cloudflare'

export async function GET() {
  try {
    const cf = await checkCloudflareHealth()
    let d1ProjectCount = 0

    if (cf.d1.ok) {
      const countRes = await executeD1Query<{ total: number }>(
        'SELECT count(*) as total FROM studio_projects;'
      )
      if (countRes.success && countRes.results.length > 0) {
        d1ProjectCount = countRes.results[0].total || 0
      }
    }

    return NextResponse.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      services: {
        cloudflareD1: {
          status: cf.d1.ok ? 'connected' : 'disconnected',
          latencyMs: cf.d1.latencyMs,
          syncedProjects: d1ProjectCount,
          error: cf.d1.error,
        },
        cloudflareR2: {
          status: cf.r2.ok ? 'configured' : 'pending',
          bucket: cf.r2.bucket,
        },
        openai: {
          status: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        },
        typesafeAI: {
          status: process.env.TYPESAFE_API_KEY ? 'configured' : 'missing',
          model: 'jev-latest',
        },
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed checking system status' },
      { status: 500 }
    )
  }
}
