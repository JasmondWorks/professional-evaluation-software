export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import prisma from '../../prisma.dev'
import { authorize, tokenFromRequest } from '../../_lib/authGuard'

// The org comes from the URL, and nothing checked it against the caller: the
// evaluation state and the open/close times of any organization's stress cycle
// were readable by name.
export async function GET(
  req: Request,
  { params }: { params: { orgId: string } }
) {
  const auth = authorize(tokenFromRequest(req), {})
  if (!auth.ok) return auth.response

  const orgId = Number(params.orgId)
  if (!Number.isFinite(orgId)) {
    return NextResponse.json(
      { status: 400, message: 'Invalid org id' },
      { status: 400 }
    )
  }

  if (auth.user.role !== 'super-admin' && auth.user.orgId !== orgId) {
    return NextResponse.json(
      { status: 404, message: 'Org not found' },
      { status: 404 }
    )
  }

  try {
    const org = await prisma.org.findUnique({
      where: { id: orgId },
      select: { id: true, name: true, evaluation: true, ongoing: true },
    })
    console.log("Org fetched:", org)

    if (!org) {
      return NextResponse.json(
        { status: 404, message: 'Org not found' },
        { status: 404 }
      )
    }

    const latestStressCycle = await prisma.stressCycle.findFirst({
      where: { org_id: orgId, phase: { not: 'evaluated' } },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      select: {
        settings_closes_at: true,
        feeling_closes_at: true,
        phase: true
      }
    })

    return NextResponse.json({
      status: 200,
      data: {
        ...org,
        stressCycle: latestStressCycle
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { status: 500, message: 'Failed to fetch org' },
      { status: 500 }
    )
  }
}

