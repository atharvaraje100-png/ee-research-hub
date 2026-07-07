import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() { return NextResponse.json(await prisma.risk.findMany({ include: { owner: true }, orderBy: { createdAt: 'asc' } })) }
export async function POST(req: NextRequest) {
  return NextResponse.json(await prisma.risk.create({ data: await req.json(), include: { owner: true } }), { status: 201 })
}
