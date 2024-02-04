import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { kv } from '@vercel/kv'
import { Button } from '@/components/ui/button'
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

  const getAllChats = async () => {
    const chats: string[] = await kv.zrange(
      `user:chat:${session.user.id}`,
      0,
      -1
    )
    return chats
  }

  const getAllGoals = async () => {
    const chats: string[] = await kv.zrange(`goal`, 0, -1)
    return chats
  }
  console.log('hi')
  const chats = await getAllChats()
  console.log(
    'chats: ',
    chats.map((ch: any) => ch.id)
  )

  const goal = await kv.hgetall(`goal:${params.id}`)
  console.log('goal: ', goal)

  // const goals = await getAllGoals()
  // console.log('dashboard goals: ', goals)

  const chatId = 'AidgokA'

  const chat = await getChat(params.id, session.user.id)
  console.log('chat: ', chat)

  return (
    <div className="my-6 w-[1200px] mx-auto">
      <div className="flex flex-col w-full">
        <h1 className="text-2xl mb-16"> {session?.user.name} Dashboard</h1>
        <div>
          <Button>Open Telegram</Button>
        </div>
        <div className="flex flex-row my-2">
          <div className="flex flex-col w-[400px]">
            <h3 className="text-xl my-2">Goals:</h3>
            {/* {(goal || []).map((goalObj: any) => { */}
            {/* return ( */}
            <div className="flex flex-col w-full">
              <p className="text-md my-2">goal number:{goal.goal_number}</p>
              <p className="text-md my-2">{goal.goal_description}</p>
            </div>
            {/* ) */}
            {/* })} */}
          </div>
          <div className="flex w-full h-full mb-[220px] overflow-y-scroll">
            <Chat id={chat.id} initialMessages={chat.messages} />
          </div>
        </div>
      </div>
    </div>
  )
}
