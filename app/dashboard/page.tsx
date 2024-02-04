import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { kv } from '@vercel/kv'

import { auth } from '@/auth'
import { getChat } from '@/app/actions'
import { Chat } from '@/components/chat'

export interface DashboardProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: DashboardProps): Promise<Metadata> {
  const session = await auth()

  if (!session?.user) {
    return {}
  }

  const chat = await getChat(params.id, session.user.id)
  return {
    title: chat?.title.toString().slice(0, 50) ?? 'Chat'
  }
}

export default async function Dashboard({ params }: DashboardProps) {
  const session = await auth()

  if (!session?.user) {
    redirect(`/sign-in?next=/dashboard`)
  }
  console.log('hi')

  return (
    <div className="my-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col w-full">
        <h1 className="text-2xl"> {session?.user.name} Dashboard</h1>

      </div>
    </div>
  )
}
