import { NextResponse } from 'next/server'
import { getAllProjects, updateProject, getProjectByToken, deleteProject } from '@/lib/db'
import { analyzeBriefWithTypeSafe } from '@/lib/typesafe-brief-analyzer'
import { Project, ProjectStatus } from '@/lib/types/studio'

export async function GET() {
  try {
    const rawProjects = await getAllProjects()

    // Ensure all projects with answers or active leads have brief analysis
    const projectsWithAnalysis: Project[] = []

    for (const project of rawProjects) {
      let p = project
      if (!p.brief.analysis) {
        try {
          const analysis = await analyzeBriefWithTypeSafe({
            answers: p.brief.answers || {},
            messages: p.brief.messages || [],
            companyName: p.company || p.name,
            projectName: p.name,
          })
          p = {
            ...p,
            brief: {
              ...p.brief,
              analysis,
            },
          }
          // Persist the generated analysis to avoid recalculating every time
          await updateProject(p.token, { brief: p.brief })
        } catch (e) {
          console.warn(`Failed computing brief analysis for ${p.token}`, e)
        }
      }
      projectsWithAnalysis.push(p)
    }

    // -------------------------------------------------------------
    // AGGREGATE RESEARCH ANALYTICS
    // -------------------------------------------------------------
    const totalCount = projectsWithAnalysis.length
    const completedBriefs = projectsWithAnalysis.filter((p) => p.brief.complete).length
    const inProgressBriefs = projectsWithAnalysis.filter(
      (p) => !p.brief.complete && Object.keys(p.brief.answers || {}).length > 0
    ).length
    const pendingBriefs = totalCount - completedBriefs - inProgressBriefs

    const analyses = projectsWithAnalysis
      .map((p) => p.brief.analysis)
      .filter((a): a is NonNullable<typeof a> => Boolean(a))

    const avgReadiness = analyses.length
      ? Math.round(analyses.reduce((acc, a) => acc + a.readinessScore, 0) / analyses.length)
      : 0

    const avgVision = analyses.length
      ? Math.round(analyses.reduce((acc, a) => acc + a.brandIdeals.visionClarity, 0) / analyses.length)
      : 0
    const avgAudience = analyses.length
      ? Math.round(analyses.reduce((acc, a) => acc + a.brandIdeals.audienceResonance, 0) / analyses.length)
      : 0
    const avgDiff = analyses.length
      ? Math.round(analyses.reduce((acc, a) => acc + a.brandIdeals.differentiation, 0) / analyses.length)
      : 0
    const avgCoherence = analyses.length
      ? Math.round(analyses.reduce((acc, a) => acc + a.brandIdeals.coherence, 0) / analyses.length)
      : 0

    // Distributions
    const archetypeDistribution: Record<string, number> = {}
    const disciplineDistribution: Record<string, number> = {}
    const tierDistribution: Record<string, number> = { VIP: 0, GROWTH: 0, STANDARD: 0 }
    const stageDistribution: Record<string, number> = {
      lead: 0,
      brief_pending: 0,
      brief_submitted: 0,
      proposal_sent: 0,
      contract_pending: 0,
      active: 0,
      review_needed: 0,
      completed: 0,
    }

    for (const p of projectsWithAnalysis) {
      if (stageDistribution[p.status] !== undefined) {
        stageDistribution[p.status]++
      }
      const a = p.brief.analysis
      if (a) {
        archetypeDistribution[a.brandArchetype] = (archetypeDistribution[a.brandArchetype] || 0) + 1
        disciplineDistribution[a.primaryDiscipline] = (disciplineDistribution[a.primaryDiscipline] || 0) + 1
        if (tierDistribution[a.leadQualityTier] !== undefined) {
          tierDistribution[a.leadQualityTier]++
        }
      }
    }

    // Top extracted audience keywords & style patterns
    const styleKeywords: Record<string, number> = {}
    const audienceKeywords: Record<string, number> = {}

    for (const p of projectsWithAnalysis) {
      const st = p.brief.answers?.style || ''
      const aud = p.brief.answers?.audience || ''

      st.split(/[,&/·\s]+/).forEach((w) => {
        const clean = w.trim().toLowerCase()
        if (clean.length > 3) {
          styleKeywords[clean] = (styleKeywords[clean] || 0) + 1
        }
      })

      aud.split(/[,&/·\s]+/).forEach((w) => {
        const clean = w.trim().toLowerCase()
        if (clean.length > 3) {
          audienceKeywords[clean] = (audienceKeywords[clean] || 0) + 1
        }
      })
    }

    return NextResponse.json({
      projects: projectsWithAnalysis,
      metrics: {
        totalProjects: totalCount,
        completedBriefs,
        inProgressBriefs,
        pendingBriefs,
        avgReadiness,
        brandIdealsAvg: {
          visionClarity: avgVision,
          audienceResonance: avgAudience,
          differentiation: avgDiff,
          coherence: avgCoherence,
        },
        archetypeDistribution,
        disciplineDistribution,
        tierDistribution,
        stageDistribution,
        topStyles: Object.entries(styleKeywords)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8),
        topAudiences: Object.entries(audienceKeywords)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8),
      },
    })
  } catch (error) {
    console.error('Failed in CRM API GET', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      token: string
      status?: ProjectStatus
      leadQualityTier?: 'VIP' | 'GROWTH' | 'STANDARD'
      reanalyze?: boolean
    }

    if (!body.token) {
      return NextResponse.json({ error: 'Token шаардлагатай' }, { status: 400 })
    }

    const project = await getProjectByToken(body.token)
    if (!project) {
      return NextResponse.json({ error: 'Төсөл олдсонгүй' }, { status: 404 })
    }

    const updates: Partial<Project> = {}
    if (body.status) {
      updates.status = body.status
    }

    if (body.reanalyze || body.leadQualityTier) {
      const freshAnalysis = await analyzeBriefWithTypeSafe({
        answers: project.brief.answers || {},
        messages: project.brief.messages || [],
        companyName: project.company || project.name,
        projectName: project.name,
      })
      if (body.leadQualityTier) {
        freshAnalysis.leadQualityTier = body.leadQualityTier
      }
      updates.brief = {
        ...project.brief,
        analysis: freshAnalysis,
      }
    }

    const updated = await updateProject(body.token, updates)
    return NextResponse.json({ project: updated })
  } catch (error) {
    console.error('Failed in CRM API PATCH', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    await deleteProject(token)
    return NextResponse.json({ success: true, token })
  } catch (error) {
    console.error('Failed deleting project in CRM API', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
