import { registerRuntimeHelpers } from '@vue/compiler-core'

export const V_ON = Symbol(`vOn`)
export const V_FOR = Symbol(`vFor`)
export const EXTEND = Symbol(`extend`)
export const CAMELIZE = Symbol(`camelize`)
export const HYPHENATE = Symbol(`hyphenate`)
export const RENDER_SLOT = Symbol(`renderSlot`)
export const WITH_SCOPED_SLOT = Symbol(`withScopedSlot`)
export const STRINGIFY_STYLE = Symbol(`stringifyStyle`)
export const NORMALIZE_CLASS = Symbol(`normalizeClass`)
export const TO_DISPLAY_STRING = Symbol(`toDisplayString`)
registerRuntimeHelpers({
  [V_ON]: 'o',
  [V_FOR]: 'f',
  [EXTEND]: 'e',
  [CAMELIZE]: 'c',
  [HYPHENATE]: 'h',
  [RENDER_SLOT]: 'r',
  [WITH_SCOPED_SLOT]: 'w',
  [STRINGIFY_STYLE]: 's',
  [NORMALIZE_CLASS]: 'n',
  [TO_DISPLAY_STRING]: `t`,
})
