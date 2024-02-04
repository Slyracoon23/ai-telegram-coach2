import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken } = json
  const userId = (await auth())?.user.id
  console.log('messages: chat ', messages)
  // const systemMessage = {
  //   content:
  //     'You are a helpful Ai Coach. Ask the user about what three goals they have for this week. Ask them to' +
  //     ' set goals that fall into the SMART criteria. This means Specific, Measurable, Achievable, Relevant and Time-Bound.' +
  //     ' If the goals are not fitting into this criteria then respond with feedback guiding the user to make them follow SMART criteria. ' +
  //     ' If the Goals is not specific enough, then ask the user questions to get them to be more specific. ' +
  //     ' Be helpful and encouraging. Dont be too insistent on following the categories. Dont ask more than 2 questions. '
  //     + `Accept the user goal and when it is set, include the text: Goal number {goal number here} has been set.`,
  //   role: 'system'
  // }
  const systemMessage = {
    content: `Help the user set three goals for this week. Ask them for the three goals and encourage them to be
      specific. When they set a goal, ask for the next one until you set all three.
      `,
    role: 'system'
  }

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }
  const messagesWithPrompt = [systemMessage, ...messages]

  if (previewToken) {
    openai.apiKey = previewToken
  }

  const res = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: messagesWithPrompt,
    temperature: 0.7,
    stream: true
  })

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...messages,
          {
            content: completion,
            role: 'assistant'
          }
        ]
      }
      await kv.hmset(`chat:${id}`, payload)
      await kv.zadd(`user:chat:${userId}`, {
        score: createdAt,
        member: `chat:${id}`
      })
      const msgArray = [
        ...messages,
        {
          content: completion,
          role: 'assistant'
        }
      ]
      const formatMessage = (message: VercelChatMessage) => {
        return `${message.role}: ${message.content}`
      }
      const allMessages = formatMessage(msgArray)
      const agentHelperPrompt = `You are a helpful assistant. Your job is to look at the current 
        conversation between a client and a coach. If the message from the coach Assistant
        says that one of 3 goals has been set, then you need to return a JSON object that says:
        goal_set: if the goal was set or not; true or false
        goal_description: the whole content description of what the goal is, a string.
        goal_number: Which goal this is of 1 to three; a number.
        If the goal is not set, then you can return goal_set: false.

        Coach Message:
        <coach message>
        ${completion}
        <coach message/>

        JSON_FORMAT:
        { goal_set: <boolean>, goal_description: <string description of the goal>', goal_number: <number one to three> }
      `
      console.log('agentHelperPrompt: ', agentHelperPrompt)
      console.log('completion: ', completion)

      const goalAgentResponse = await openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: agentHelperPrompt
          },
          { role: 'user', content: 'Who won the world series in 2020?' }
        ],
        model: 'gpt-3.5-turbo-0125',
        response_format: { type: 'json_object' }
      })
      console.log('goalAgentResponse: ', goalAgentResponse)

      // if (goalAgentResponse.finish_reason !== 'stop') {
      //   console.log('unable to get the json response')
      //   return
      // }
      const chatId = 'AidgokA'
      // NkgXMlr
      const categoryResponse = JSON.parse(
        goalAgentResponse.choices[0].message.content
      )
      console.log('categoryResponse: ', categoryResponse)

      if (categoryResponse.goal_set) {
        const goalPayload = {
          goal_description: categoryResponse.goal_description,
          goal_number: categoryResponse.goal_number
        }
        console.log('setting goalPayload: ', goalPayload)

        const setResp = await kv.hmset(`goal:${id}`, goalPayload)
        console.log('kv setResp', setResp)
      } else {
        console.log('goal not set')
      }
    }
  })

  return new StreamingTextResponse(stream)
}
