import { expect, test } from 'vitest'
import { backgroundFrameTime } from './backgroundFrame'

test.each([60, 120, 144, 240])('bounds background drawing without adding timers on a %s Hz display', refreshRate => {
  let previous: number | undefined
  let rendered = 0
  for (let frame = 0; frame < refreshRate; frame++) {
    const time = backgroundFrameTime(previous, frame * 1000 / refreshRate)
    if (time !== undefined) { previous = time; rendered++ }
  }
  expect(rendered).toBeGreaterThanOrEqual(55)
  expect(rendered).toBeLessThanOrEqual(60)
})
