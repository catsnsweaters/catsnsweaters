import { prisma } from '@/lib/db'
import { sendTelegramMessage } from '@/lib/telegram'

export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const now = new Date()
  const in2days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)

  const dueTasks = await prisma.task.findMany({
    where: {
      completed: false,
      reminderSent: false,
      dueDate: { lte: in2days },
    },
    include: { client: true },
  })

  for (const task of dueTasks) {
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB') : 'no date'
    const isOverdue = task.dueDate && new Date(task.dueDate) < now
    const emoji = isOverdue ? '🔴' : '🟡'
    await sendTelegramMessage(
      `${emoji} <b>${isOverdue ? 'OVERDUE' : 'Due soon'}</b>: ${task.title}\n` +
      `👤 Client: ${task.client.name}\n` +
      `📅 Due: ${dueDate}`
    )
    await prisma.task.update({ where: { id: task.id }, data: { reminderSent: true } })
  }

  return Response.json({ sent: dueTasks.length })
}
