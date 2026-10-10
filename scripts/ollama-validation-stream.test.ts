import { Readable } from 'node:stream'
import { describe, expect, it } from 'vitest'
import { readValidationStream } from './ollama-validation-stream.mjs'

const event = (text: string) => `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`
describe('native validation stream', () => {
  it('reads the production bridge string chunks', async () => {
    expect(await readValidationStream(Readable.from([event('Mi creadora es PbtinaDev. '), event('Ella creó PbtAdmin.'), 'data: [DONE]\n\n'])))
      .toEqual({ answer: 'Mi creadora es PbtinaDev. Ella creó PbtAdmin.', chunks: 2 })
  })
  it('preserves Unicode across every byte boundary', async () => {
    const text = 'áéíóúüñçàèï l·l — PbtinaDev'
    const bytes = Buffer.from(event(text))
    expect(await readValidationStream(Readable.from(Array.from(bytes, byte => Buffer.from([byte])))))
      .toEqual({ answer: text, chunks: 1 })
  })
  it('handles split JSON and an unterminated final line', async () => {
    const data = event('Hola').trimEnd()
    expect(await readValidationStream(Readable.from([data.slice(0, 12), data.slice(12)])))
      .toEqual({ answer: 'Hola', chunks: 1 })
  })
  it('rejects empty responses instead of inventing an answer', async () => {
    await expect(readValidationStream(Readable.from(['data: [DONE]\n\n']))).rejects.toThrow('No authentic')
  })
  it('rejects malformed UTF-8', async () => {
    await expect(readValidationStream(Readable.from([Buffer.from([0xc3])]))).rejects.toThrow()
  })
})
