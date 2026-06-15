import { prisma } from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const tasks = await prisma.task.findMany({
    where: { clientId: id },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json(tasks)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const task = await prisma.task.create({
    data: {
      clientId: id,
      title: body.title,
      description: body.description || null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    },
  })
  return Response.json(task, { status: 201 })
}
