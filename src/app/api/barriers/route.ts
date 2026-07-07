import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() { return NextResponse.json(await prisma.barrier.findMany({ orderBy: [{ severity: 'desc' }, { frequency: 'desc' }] })) }
export async function POST(req: NextRequest) {
  return NextResponse.json(await prisma.barrier.create({ data: await req.json() }), { status: 201 })
}
