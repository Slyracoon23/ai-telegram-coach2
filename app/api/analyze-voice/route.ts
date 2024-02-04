
// Set the runtime to edge for best performance

export async function POST(req: Request) {
  // const { messages } = await req.json()

  const url = 'https://api.hume.ai/v0/batch/jobs'
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json; charset=utf-8',
      'content-type': 'application/json; charset=utf-8',
      'X-Hume-Api-Key': process.env.HUME_API_KEY!
    },
    body: '{"models":{"face":{"fps_pred":3,"prob_threshold":0.99,"identify_faces":false,"min_face_size":60,"save_faces":false},"prosody":{"granularity":"utterance","window":{"length":4,"step":1}},"language":{"granularity":"word"}},"transcription":{"language":null,"identify_speakers":false,"confidence_threshold":0.5},"urls":["https://www.101soundboards.com/storage/board_sounds_rendered/3982757.mp3"],"notify":false}'
  }

  const response = await fetch(url, options)

  console.log('response', response)

  return new Response(JSON.stringify({ body: response }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
