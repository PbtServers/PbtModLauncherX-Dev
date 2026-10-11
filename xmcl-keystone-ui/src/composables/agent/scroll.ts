/** Geometry only: preserving this flag before an update avoids stealing scroll. */
export function isTranscriptNearEnd(element: Pick<HTMLElement, 'scrollHeight' | 'scrollTop' | 'clientHeight'>) {
  return element.scrollHeight - element.scrollTop - element.clientHeight <= 32
}
