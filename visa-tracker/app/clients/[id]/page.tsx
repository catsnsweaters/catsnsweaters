import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import ClientDetail from './ClientDetail'

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { createdAt: 'desc' } },
      updates: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!client) notFound()
  return <ClientDetail client={client} />
}
