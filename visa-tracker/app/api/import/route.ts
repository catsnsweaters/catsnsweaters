import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const body = await request.json()
  const clients: Array<{
    name: string
    visaType?: string | null
    status?: string
    notes?: string | null
    task?: string | null
  }> = body.clients

  if (!Array.isArray(clients) || clients.length === 0) {
    return new Response('Invalid data', { status: 400 })
  }

  let imported = 0
  for (const c of clients) {
    const client = await prisma.client.create({
      data: {
        name: c.name,
        visaType: c.visaType || null,
        status: c.status || 'In Progress',
        notes: c.notes || null,
        ...(c.task ? {
          tasks: { create: { title: c.task } }
        } : {}),
      },
    })
    if (client) imported++
  }

  return Response.json({ imported }, { status: 201 })
}
