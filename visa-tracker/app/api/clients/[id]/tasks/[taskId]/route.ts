import { prisma } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { taskId } = await params
  const body = await request.json()
  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(body.completed !== undefined ? { completed: body.completed } : {}),
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.dueDate !== undefined ? { dueDate: body.dueDate ? new Date(body.dueDate) : null } : {}),
    },
  })
  return Response.json(task)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { taskId } = await params
  await prisma.task.delete({ where: { id: taskId } })
  return new Response(null, { status: 204 })
}
