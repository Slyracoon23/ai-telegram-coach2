const DEMOCHATID = 'DEMOCHATID'

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const POST = async (request: Request, res: any) => {
  try {
    const requestJson: any = await request.json() // res now contains body

    console.log('telegram route', requestJson)

    // const NEXT_TELEGRAM_TOKEN = process.env.NEXT_TELEGRAM_TOKEN;
    const NEXT_TELEGRAM_TOKEN = '6549200389:AAEwzEV7oEdME0bBokbopN0tlBevN-iMXyk'

    const messages = [
      {
        role: 'system',
        content: 'Welcome to the NextJS News Channel'
      },
      {
        role: 'user',
        content: requestJson.message.text
      }
    ] as any;

    const res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      stream: false
    })

    console.log('openai response', res)
    const chatResponse = res.choices[0].message.content

    // const chatResponse = `Welcome to <i>NextJS News Channel</i> <b>${requestJson.message.from.first_name}</b>.%0AThis is AssistBot`

    // // const response =
    // //   'Welcome to <i>NextJS News Channel</i> <b>' +
    // //   message.from.first_name +
    // //   '</b>.%0AThis is AssistBot';

    const ret = await fetch(
      `https://api.telegram.org/bot${NEXT_TELEGRAM_TOKEN}/sendMessage?chat_id=${requestJson.message.chat.id}&text=${chatResponse}&parse_mode=HTML`
    )

    return new Response(JSON.stringify({ body: 'hello world' }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    // If there was an error sending our message then we
    // can log it into the Vercel console
    console.error('Error sending message')

    console.log(error.toString())

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
