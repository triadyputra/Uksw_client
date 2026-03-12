import { createMongoAbility } from '@casl/ability'
import { abilitiesPlugin } from '@casl/vue'
import { decompressFromUTF16 } from 'lz-string'
import type { App } from 'vue'
import type { Rule } from './ability'

export default function (app: App) {
  let rules: Rule[] = []

  const compressed = localStorage.getItem('userAbilityRules')

  if (compressed) {
    try {
      const json = decompressFromUTF16(compressed)

      rules = JSON.parse(json || '[]')
    }
    catch (e) {
      console.error('Failed to decode abilities:', e)
      rules = []
    }
  }

  // const userAbilityRules = useCookie<Rule[]>('userAbilityRules')
  const initialAbility = createMongoAbility(rules)

  console.log(rules)
  app.use(abilitiesPlugin, initialAbility, {
    useGlobalProperties: true,
  })
}
