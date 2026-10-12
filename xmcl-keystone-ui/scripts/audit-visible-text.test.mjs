import { test } from 'vitest'
import assert from 'node:assert/strict'
import { scanVisibleText, auditVisibleText } from './audit-visible-text.mjs'

test('finds visible literals and accessibility labels inside nested templates', () => {
  const result = scanVisibleText('<template><div><template #default><button aria-label="Open settings">Install model</button></template></div></template>')
  assert.deepEqual(result.map(item => item.text).sort(), ['Install model', 'Open settings'])
})
test('preserves brands, identifiers, icons and translated expressions', () => {
  assert.deepEqual(scanVisibleText('<template><div>Minecraft<v-icon>download</v-icon><button>{{ t("install") }}</button><code>npm install</code></div></template>'), [])
})
test('launcher templates have no unreviewed visible fixed text', () => {
  assert.deepEqual(auditVisibleText(), [])
})
