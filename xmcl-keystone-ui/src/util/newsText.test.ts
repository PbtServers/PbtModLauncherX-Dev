import { expect, test } from 'vitest'
import { uniqueNews } from './newsText'

test('keeps the newest duplicate and chronological order without mutating the feed', () => {
  const input = [{ id: 'a', date: '2026-01-01' }, { id: 'b', date: '2026-03-01' }, { id: 'a', date: '2026-02-01' }, { id: 'bad', date: 'invalid' }]
  expect(uniqueNews(input, item => item.id)).toEqual([input[1], input[2]])
  expect(input[0].date).toBe('2026-01-01')
})

test('deduplicates the same official article with different tracking parameters', () => {
  const input = [{ date: '2026-01-01', link: 'https://www.minecraft.net/article/news?OCID=Launcher' }, { date: '2026-01-02', link: 'https://www.minecraft.net/article/news?OCID=Other' }]
  expect(uniqueNews(input, item => { const url = new URL(item.link); return url.origin + url.pathname })).toEqual([input[1]])
})
