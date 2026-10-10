/** A timed-out IPC request may still complete; retry against the idempotent main handler. */
export async function setupRequest<T>(operation: () => Promise<T>, timeoutMs = 10_000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      Promise.resolve().then(operation),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Setup request timed out')), timeoutMs)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}
