(function attachShowdownState(globalScope) {
  const SHOWDOWN_SLOTS = Object.freeze(['A', 'B'])
  const SHOWDOWN_FIELDS = Object.freeze([
    'age',
    'lumi',
    'survivalPts',
    'insanityPts',
    'courage',
    'understanding',
    'movement',
    'speed',
    'accuracy',
    'strength',
    'luck',
    'evasion'
  ])
  const SHOWDOWN_PAGE_CONFIG = Object.freeze([
    Object.freeze({ key: 'armor', symbol: 'A', label: 'Armor' }),
    Object.freeze({ key: 'knowledge', symbol: 'K', label: 'Tenet Knowledge / Neurosis / Knowledge' }),
    Object.freeze({ key: 'arts', symbol: 'F', label: 'Fighting Arts / Secret Fighting Arts' }),
    Object.freeze({ key: 'disorders', symbol: 'D', label: 'Disorders' }),
    Object.freeze({ key: 'traits', symbol: 'AI', label: 'Abilities / Impairments / Notes' })
  ])
  const SHOWDOWN_DEFAULT_PAGE = SHOWDOWN_PAGE_CONFIG[0].key
  const SHOWDOWN_ARMOR_PARTS = Object.freeze(['head', 'arms', 'body', 'waist', 'legs'])

  function coerceNumber(value, fallback = 0) {
    const number = Number(value)
    return Number.isFinite(number) ? number : fallback
  }

  function isShowdownSlot(slot) {
    return SHOWDOWN_SLOTS.includes(slot)
  }

  function createShowdownArmorSlotState() {
    return {
      head: 0,
      body: 0,
      arms: 0,
      waist: 0,
      legs: 0,
      bleedingTokens: 0,
      proficiencyReminder: false,
      insanityHeavy: false,
      headHeavy: false,
      bodyLight: false,
      bodyHeavy: false,
      armsLight: false,
      armsHeavy: false,
      waistLight: false,
      waistHeavy: false,
      legsLight: false,
      legsHeavy: false
    }
  }

  function createShowdownArmorState() {
    return {
      A: createShowdownArmorSlotState(),
      B: createShowdownArmorSlotState()
    }
  }

  function createShowdownModifier() {
    return { temporary: 0, tokensPositive: 0, tokensNegative: 0 }
  }

  function createShowdownModifierSlotState() {
    const state = {}
    for (const field of SHOWDOWN_FIELDS) state[field] = createShowdownModifier()
    return state
  }

  function createShowdownModifierState() {
    return {
      A: createShowdownModifierSlotState(),
      B: createShowdownModifierSlotState()
    }
  }

  function createShowdownPageState() {
    return { A: SHOWDOWN_DEFAULT_PAGE, B: SHOWDOWN_DEFAULT_PAGE }
  }

  function createEmptyShowdownTextDraftState() {
    return {
      abilities: [],
      impairments: [],
      notes: []
    }
  }

  function createShowdownTextDraftState() {
    return {
      A: createEmptyShowdownTextDraftState(),
      B: createEmptyShowdownTextDraftState()
    }
  }

  function normalizeShowdownPageKey(pageKey) {
    const value = String(pageKey || '').trim()
    if (value === 'stats') return 'armor'
    return SHOWDOWN_PAGE_CONFIG.some(page => page.key === value) ? value : SHOWDOWN_DEFAULT_PAGE
  }

  function getSteppedShowdownPageKey(pageKey, direction) {
    const current = normalizeShowdownPageKey(pageKey)
    const normalizedDirection = direction > 0 ? 1 : direction < 0 ? -1 : 0
    if (!normalizedDirection) return current
    const currentIndex = SHOWDOWN_PAGE_CONFIG.findIndex(page => page.key === current)
    const nextIndex = Math.max(0, Math.min(SHOWDOWN_PAGE_CONFIG.length - 1, currentIndex + normalizedDirection))
    return SHOWDOWN_PAGE_CONFIG[nextIndex].key
  }

  function ensureShowdownModifier(state, slot, field) {
    if (!state || typeof state !== 'object' || !isShowdownSlot(slot) || !field) return null
    if (!state[slot] || typeof state[slot] !== 'object') state[slot] = {}
    if (!state[slot][field] || typeof state[slot][field] !== 'object') {
      state[slot][field] = createShowdownModifier()
    }
    return state[slot][field]
  }

  function setShowdownModifierValue(state, slot, field, kind, nextValue) {
    if (kind !== 'temporary' && kind !== 'tokensPositive' && kind !== 'tokensNegative') return false
    const modifier = ensureShowdownModifier(state, slot, field)
    if (!modifier) return false
    const normalizedValue = coerceNumber(nextValue, 0)
    modifier[kind] = kind === 'temporary' ? normalizedValue : Math.max(0, normalizedValue)
    return true
  }

  function adjustShowdownArmorPart(state, slot, part, delta) {
    const armor = state?.[slot]
    if (!armor || !Object.prototype.hasOwnProperty.call(armor, part)) return null
    armor[part] = Math.max(0, coerceNumber(armor[part], 0) + coerceNumber(delta, 0))
    return armor[part]
  }

  function adjustShowdownArmorAll(state, slot, delta) {
    const armor = state?.[slot]
    const normalizedDelta = coerceNumber(delta, 0)
    if (!armor || !normalizedDelta) return false
    for (const part of SHOWDOWN_ARMOR_PARTS) adjustShowdownArmorPart(state, slot, part, normalizedDelta)
    return true
  }

  function setShowdownArmorPartValue(state, slot, part, nextValue) {
    const armor = state?.[slot]
    if (!armor || !Object.prototype.hasOwnProperty.call(armor, part)) return null
    armor[part] = Math.max(0, coerceNumber(nextValue, 0))
    return armor[part]
  }

  function setShowdownArmorCheck(state, slot, key, checked) {
    const armor = state?.[slot]
    if (!armor || !Object.prototype.hasOwnProperty.call(armor, key)) return { changed: false, lightKey: '' }
    armor[key] = Boolean(checked)
    let lightKey = ''
    if (checked && key.endsWith('Heavy')) {
      const candidate = `${key.slice(0, -'Heavy'.length)}Light`
      if (Object.prototype.hasOwnProperty.call(armor, candidate)) {
        armor[candidate] = true
        lightKey = candidate
      }
    }
    return { changed: true, lightKey }
  }

  function syncShowdownTextDraftSlotState(state, slot, person, arrayNames) {
    if (!state || typeof state !== 'object' || !isShowdownSlot(slot) || !person) return false
    if (!state[slot] || typeof state[slot] !== 'object') state[slot] = createEmptyShowdownTextDraftState()
    for (const arrayName of arrayNames) {
      if (!Array.isArray(person[arrayName])) person[arrayName] = []
      const current = Array.isArray(state[slot][arrayName]) ? state[slot][arrayName] : []
      state[slot][arrayName] = person[arrayName].map((entry, index) => {
        const text = String(entry || '')
        const previous = current[index]
        if (previous && previous.isEditing) {
          return { text, draft: String(previous.draft ?? text), isEditing: true }
        }
        return { text, draft: text, isEditing: false }
      })
    }
    return true
  }

  function beginShowdownTextDraft(state, slot, arrayName, index) {
    const draft = state?.[slot]?.[arrayName]?.[index]
    if (!draft) return false
    draft.isEditing = true
    draft.draft = draft.text
    return true
  }

  function updateShowdownTextDraft(state, slot, arrayName, index, value) {
    const draft = state?.[slot]?.[arrayName]?.[index]
    if (!draft) return false
    draft.draft = value
    return true
  }

  function commitShowdownTextDraft(state, slot, arrayName, index) {
    const draft = state?.[slot]?.[arrayName]?.[index]
    if (!draft) return { status: 'invalid', value: '' }
    const value = String(draft.draft || '').trim()
    if (!value) return { status: 'empty', value: '' }
    draft.text = value
    draft.draft = value
    draft.isEditing = false
    return { status: 'committed', value }
  }

  globalScope.KDMShowdownState = {
    SHOWDOWN_DEFAULT_PAGE,
    SHOWDOWN_FIELDS,
    SHOWDOWN_PAGE_CONFIG,
    adjustShowdownArmorAll,
    adjustShowdownArmorPart,
    beginShowdownTextDraft,
    commitShowdownTextDraft,
    createEmptyShowdownTextDraftState,
    createShowdownArmorSlotState,
    createShowdownArmorState,
    createShowdownModifier,
    createShowdownModifierSlotState,
    createShowdownModifierState,
    createShowdownPageState,
    createShowdownTextDraftState,
    ensureShowdownModifier,
    getSteppedShowdownPageKey,
    normalizeShowdownPageKey,
    setShowdownArmorCheck,
    setShowdownArmorPartValue,
    setShowdownModifierValue,
    syncShowdownTextDraftSlotState,
    updateShowdownTextDraft
  }
})(window)
