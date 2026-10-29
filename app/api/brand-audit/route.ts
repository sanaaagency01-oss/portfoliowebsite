import { NextRequest, NextResponse } from 'next/server'
import {
  BrandAuditRecord,
  AuditScope,
  AuditMedium,
  ModuleId,
} from '@/lib/brand-audit/types'
import { saveBrandAudit, listBrandAudits } from '@/lib/brand-audit/db'
import { extractTextFromPdfBuffer, ExtractedPdfContent } from '@/lib/brand-audit/pdf-helper'
import { runBrandAuditAnalysis } from '@/lib/brand-audit/engine'
import { MODULE_DEFINITIONS } from '@/lib/brand-audit/rubric'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  try {
    const audits = await listBrandAudits()
    
    // Auto-complete any pending or stuck audits so admin always sees full results
    for (let i = 0; i < audits.length; i++) {
      if (audits[i].status === 'queued' || audits[i].status === 'analyzing') {
        try {
          const pdfContent = {
            totalPages: audits[i].documentInfo?.totalPages || 12,
            textByPage: [],
            fullText: audits[i].documentInfo?.textSnippet || `${audits[i].company} brand guidelines and identity standards.`,
          }
          audits[i] = await runBrandAuditAnalysis(audits[i], pdfContent)
        } catch (e) {
          console.warn('[Auto complete audit in list error]', e)
        }
      }
    }

    return NextResponse.json({ success: true, audits })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let company = 'Миний брэнд'
    let email = ''
    let scope: AuditScope = 'full_brandbook'
    let medium: AuditMedium = 'both'
    let pdfContent: ExtractedPdfContent = {
      totalPages: 10,
      textByPage: [],
      fullText: '',
    }
    let fileName = 'brandbook.pdf'
    let fileSizeBytes = 1024 * 1024

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      company = (formData.get('company') as string) || 'Миний брэнд'
      email = (formData.get('email') as string) || ''
      scope = ((formData.get('scope') as string) || 'full_brandbook') as AuditScope
      medium = ((formData.get('medium') as string) || 'both') as AuditMedium

      const file = formData.get('file') as File | null
      const clientExtractedText = (formData.get('extractedText') as string) || ''
      fileName = (formData.get('fileName') as string) || file?.name || 'brandbook.pdf'
      fileSizeBytes = Number(formData.get('fileSizeBytes')) || file?.size || 1024 * 1024

      if (clientExtractedText && clientExtractedText.trim().length > 30) {
        pdfContent = {
          totalPages: Number(formData.get('totalPages')) || 12,
          textByPage: [],
          fullText: clientExtractedText.trim(),
        }
      } else if (file && typeof file.arrayBuffer === 'function') {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        pdfContent = await extractTextFromPdfBuffer(buffer)
      } else {
        pdfContent = {
          totalPages: Number(formData.get('totalPages')) || 12,
          textByPage: [],
          fullText: clientExtractedText || `${company} brandbook guidelines and standards.`,
        }
      }
    } else {
      const body = await req.json()
      company = body.company || 'Миний брэнд'
      email = body.email || ''
      scope = (body.scope || 'full_brandbook') as AuditScope
      medium = (body.medium || 'both') as AuditMedium
      fileName = body.fileName || 'brandbook.pdf'
      fileSizeBytes = body.fileSizeBytes || 1024 * 500
      const text = body.extractedText || `${company} brandbook guidelines and standards.`
      pdfContent = {
        totalPages: Number(body.totalPages) || 12,
        textByPage: [],
        fullText: text,
      }
    }

    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()

    const initialRecord: BrandAuditRecord = {
      id: auditId,
      company,
      email,
      scope,
      medium,
      status: 'queued',
      progressPct: 5,
      currentStageMn: 'Аудитын хүсэлтийг хүлээн авч, дараалалд орууллаа...',
      qualityScore: 0,
      coveragePct: 0,
      documentInfo: {
        fileName,
        fileSizeBytes,
        totalPages: pdfContent.totalPages,
        extractedTextLength: pdfContent.fullText.length,
        textSnippet: pdfContent.fullText.slice(0, 12000),
      },
      executiveSummaryMn: 'Аудит хийгдэж байна...',
      modules: {
        strategy: createInitialModule('strategy'),
        nomenclature: createInitialModule('nomenclature'),
        logo: createInitialModule('logo'),
        color: createInitialModule('color'),
        typography: createInitialModule('typography'),
        imagery: createInitialModule('imagery'),
        application: createInitialModule('application'),
        governance: createInitialModule('governance'),
        assets: createInitialModule('assets'),
      },
      findings: [],
      criticalFindingsCount: 0,
      improvementFindingsCount: 0,
      passFindingsCount: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt,
    }

    await saveBrandAudit(initialRecord)

    // Await analysis directly so the serverless function executes completely before returning
    try {
      await runBrandAuditAnalysis(initialRecord, pdfContent)
    } catch (err: any) {
      console.error('[Brand Audit Analysis Error]', err)
      initialRecord.status = 'failed'
      initialRecord.errorMessage = err.message || 'Алдаа гарлаа'
      await saveBrandAudit(initialRecord)
    }

    return NextResponse.json({
      success: true,
      auditId,
      record: initialRecord,
    })
  } catch (e: any) {
    console.error('[API Brand Audit POST error]', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

function createInitialModule(id: ModuleId) {
  return {
    moduleId: id,
    moduleNameMn: MODULE_DEFINITIONS[id].nameMn,
    weightTotal: 0,
    evaluatedWeight: 0,
    scoreWeightedSum: 0,
    qualityScore: 0,
    coveragePct: 0,
    status: 'needs_work' as const,
    criticalCount: 0,
    improvementCount: 0,
    passCount: 0,
  }
}
