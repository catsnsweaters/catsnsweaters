import { prisma } from '@/lib/db'

export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: { select: { tasks: { where: { completed: false } } } },
    },
  })
  return Response.json(clients)
}

export async function POST(request: Request) {
  const body = await request.json()
  const client = await prisma.client.create({
    data: {
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      nationality: body.nationality || null,
      passportNumber: body.passportNumber || null,
      visaType: body.visaType || null,
      status: body.status || 'In Progress',
      notes: body.notes || null,
    },
  })
  return Response.json(client, { status: 201 })
}
