import { prisma } from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { createdAt: 'desc' } },
      updates: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!client) return new Response('Not found', { status: 404 })
  return Response.json(client)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const client = await prisma.client.update({
    where: { id },
    data: {
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      nationality: body.nationality || null,
      passportNumber: body.passportNumber || null,
      visaType: body.visaType || null,
      status: body.status,
      notes: body.notes || null,
    },
  })
  return Response.json(client)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.client.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
