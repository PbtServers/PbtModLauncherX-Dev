import { i18n } from '@/i18n'

export const getExpectedSize = (size: number, unitText = 'B', fix = 2) => {
  size = size / 1024
  let unit = 'K' + unitText
  if (size > 1024) {
    size /= 1024
    unit = 'M' + unitText
  }
  if (size > 1024) {
    size /= 1024
    unit = 'G' + unitText
  }
  return `${new Intl.NumberFormat(i18n.global.locale.value, { minimumFractionDigits: fix, maximumFractionDigits: fix }).format(Math.abs(size))}${unit}`
}
