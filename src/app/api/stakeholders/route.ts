import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() { return NextResponse.json(await prisma.stakeholder.findMany({ include: { interviews: true }, orderBy: { organization: 'asc' } })) }
export async function POST(req: NextRequest) {
  return NextResponse.json(await prisma.stakeholder.create({ data: await req.json() }), { status: 201 })
}
