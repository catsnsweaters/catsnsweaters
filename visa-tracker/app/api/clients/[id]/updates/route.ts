import { prisma } from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const updates = await prisma.update.findMany({
    where: { clientId: id },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json(updates)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const update = await prisma.update.create({
    data: { clientId: id, content: body.content },
  })
  return Response.json(update, { status: 201 })
}
