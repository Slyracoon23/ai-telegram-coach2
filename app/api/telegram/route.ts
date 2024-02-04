const DEMOCHATID = 'DEMOCHATID'

export const POST = async (request: Request, res: any) => {
  try {
    const requestJson: any = await request.json() // res now contains body

    console.log('telegram route', requestJson)

    // const NEXT_TELEGRAM_TOKEN = process.env.NEXT_TELEGRAM_TOKEN;

    // const response =
    //   'Welcome to <i>NextJS News Channel</i> <b>' +
    //   message.from.first_name +
    //   '</b>.%0AThis is AssistBot';

    // const ret = await fetch(
    //   `https://api.telegram.org/bot${NEXT_TELEGRAM_TOKEN}/sendMessage?chat_id=${requestJson.message.chat.id}&text=${chatResponse}&parse_mode=HTML`
    // );

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
