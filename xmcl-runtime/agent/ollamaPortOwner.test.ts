import { expect, test } from 'vitest'
import { netstatOwns, ownsOllamaPort } from './ollamaPortOwner'
test('ownership is independent of Windows language and rejects foreign or exposed listeners', () => {
  expect(netstatOwns(' TCP 127.0.0.1:32456 0.0.0.0:0 LISTENING 1234', 1234, 32456)).toBe(true)
  expect(netstatOwns(' TCP 127.0.0.1:32456 0.0.0.0:0 ESCUCHANDO 1234', 1234, 32456)).toBe(true)
  expect(netstatOwns(' TCP 127.0.0.1:32456 0.0.0.0:0 LISTENING 4321', 1234, 32456)).toBe(false)
  expect(netstatOwns(' TCP 0.0.0.0:32456 0.0.0.0:0 LISTENING 1234', 1234, 32456)).toBe(false)
})
test('rejects malformed ownership identifiers without executing OS utilities', async () => {
  expect(await ownsOllamaPort(-1, 32456)).toBe(false)
  expect(await ownsOllamaPort(1234, 70000)).toBe(false)
})
