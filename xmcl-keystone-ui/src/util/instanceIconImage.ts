/** Decode before changing the draft icon; extensions and MIME headers are not sufficient. */
export function validateInstanceIconImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const timer = setTimeout(() => finish(false), 10000)
    function finish(valid: boolean) {
      clearTimeout(timer)
      image.onload = null
      image.onerror = null
      if (valid) resolve()
      else reject(new Error('Invalid or unreadable instance icon'))
    }
    image.onload = () => finish(image.naturalWidth > 0 && image.naturalHeight > 0 && image.naturalWidth * image.naturalHeight <= 16777216)
    image.onerror = () => finish(false)
    image.src = url
  })
}
