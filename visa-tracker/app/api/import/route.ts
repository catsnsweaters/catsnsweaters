import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const body = await request.json()
  const clients: Array<{
    name: string
    email?: string
    phone?: string
    nationality?: string
    passportNumber?: string
    visaType?: string
    status?: string
    notes?: string
  }> = body.clients

  if (!Array.isArray(clients) || clients.length === 0) {
    return new Response('Invalid data', { status: 400 })
  }

  const created = await prisma.client.createMany({
    data: clients.map((c) => ({
      name: c.name,
      email: c.email || null,
      phone: c.phone || null,
      nationality: c.nationality || null,
      passportNumber: c.passportNumber || null,
      visaType: c.visaType || null,
      status: c.status || 'In Progress',
      notes: c.notes || null,
    })),
    skipDuplicates: true,
  })

  return Response.json({ imported: created.count }, { status: 201 })
}
