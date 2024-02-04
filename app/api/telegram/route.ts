const DEMOCHATID = 'DEMOCHATID'

import OpenAI from 'openai'
import voice_json from 'public/voice.json'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const POST = async (request: Request, res: any) => {
  try {
    const requestJson: any = await request.json()
    console.log('telegram route', requestJson)

    const NEXT_TELEGRAM_TOKEN = '6549200389:AAEwzEV7oEdME0bBokbopN0tlBevN-iMXyk'

    // Check if the incoming message is text or voice
    if (requestJson.message?.text) {
      // Handle text message
      const messages = [
        {
          role: 'system',
          content: 'Welcome to the NextJS News Channel'
        },
        {
          role: 'user',
          content: requestJson.message.text
        }
      ]

      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        stream: false
      })

      console.log('openai response', res)
      const chatResponse = res.choices[0].message.content

      const ret = await fetch(
        `https://api.telegram.org/bot${NEXT_TELEGRAM_TOKEN}/sendMessage?chat_id=${requestJson.message.chat.id}&text=${chatResponse}&parse_mode=HTML`
      )
      console.log('telegram response', ret)
    } else if (requestJson.message?.voice) {
      // Handle voice message
      const voiceResponse = `Hi ${requestJson.message.from.first_name}, I received your voice message, but I'm not able to process voice messages yet.`


      const messages = [
        {
          role: 'system',
          content:
            'Your task to analyze the voice message emotionally. You will be provided the emotial analysis of the voice message. Your job is to give helpful response to the user.'
        },
        {
          role: 'user',
          content: `The voice message is: Based on the emotion analysis, the speaker seems to be feeling quite angry, annoyed, disgusted, and distressed. There are high levels of disapproval, contempt, and some embarrassment as well.

          It seems like the speaker is very upset about chemicals being put into water that is impacting frogs. I would gently encourage taking a step back to reflect - getting very emotionally charged about an issue rarely leads to productive change. I'd suggest focusing energy into positive channels instead - perhaps researching the root causes more deeply, or brainstorming constructive solutions.
          When very upset, it's important we don't act solely out of anger, but lead with wisdom and compassion. I cannot know the full context here, but I encourage you to harness these strong emotions into positive agents of change rather than negative reactions. There may be reasonable perspectives on multiple sides of this issue worth considering more deeply.`
        }
      ]

      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        stream: false
      })

      console.log('openai response', res)
      const chatResponse = res.choices[0].message.content


      const ret = await fetch(
        `https://api.telegram.org/bot${NEXT_TELEGRAM_TOKEN}/sendMessage?chat_id=${requestJson.message.chat.id}&text=${chatResponse}&parse_mode=HTML`
      )
    }

    return new Response(JSON.stringify({ body: 'Message processed' }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error sending message')
    console.log(error.toString())

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
