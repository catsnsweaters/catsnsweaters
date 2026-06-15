import { prisma } from '@/lib/db'
import { sendTelegramMessage } from '@/lib/telegram'

export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const now = new Date()

  const tasks = await prisma.task.findMany({
    where: { completed: false },
    include: { client: true },
    orderBy: [{ client: { name: 'asc' } }, { dueDate: 'asc' }],
  })

  if (tasks.length === 0) {
    await sendTelegramMessage('✅ No open tasks today.')
    return Response.json({ sent: 0 })
  }

  // Group by client
  const byClient = new Map<string, typeof tasks>()
  for (const task of tasks) {
    const key = task.client.name
    if (!byClient.has(key)) byClient.set(key, [])
    byClient.get(key)!.push(task)
  }

  const today = now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  let message = `📋 <b>Задачи на ${today}</b>\n\n`

  for (const [clientName, clientTasks] of byClient) {
    message += `👤 <b>${clientName}</b>\n`
    for (const task of clientTasks) {
      const due = task.dueDate ? new Date(task.dueDate) : null
      const overdue = due && due < now
      const duePart = due
        ? ` — ${overdue ? '🔴 просрочено' : '📅 ' + due.toLocaleDateString('ru-RU')}`
        : ''
      message += `  • ${task.title}${duePart}\n`
    }
    message += '\n'
  }

  message += `Всего открытых задач: ${tasks.length}`

  await sendTelegramMessage(message)

  return Response.json({ sent: tasks.length })
}
