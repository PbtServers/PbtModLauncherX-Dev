// The production chat bridge emits strings; native streams may emit UTF-8 bytes.
export async function readValidationStream(body) {
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let buffer = ''; let answer = ''; let chunks = 0
  function consume(final = false) {
    const lines = buffer.split('\n')
    buffer = final ? '' : lines.pop() || ''
    for (const raw of lines) {
      const line = raw.replace(/\r$/, '')
      if (!line.startsWith('data: ') || line === 'data: [DONE]') continue
      const text = JSON.parse(line.slice(6)).choices?.[0]?.delta?.content
      if (typeof text === 'string' && text) { answer += text; chunks++ }
    }
  }
  for await (const chunk of body) {
    buffer += typeof chunk === 'string' ? decoder.decode() + chunk : decoder.decode(chunk, { stream: true })
    consume()
  }
  buffer += decoder.decode()
  consume(true)
  if (!answer.trim()) throw new Error('No authentic model answer received')
  return { answer, chunks }
}
