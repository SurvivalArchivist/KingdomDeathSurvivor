(function attachKnowledgeTemplateHelpers(globalScope) {
  function coerceNumber(value, fallback = 0) {
    const num = Number(value)
    return Number.isFinite(num) ? num : fallback
  }

  function normalizeNextKnowledgeMode(mode) {
    const value = String(mode || 'noTemplate')
    return value === 'existingTemplate' || value === 'maxLevel' || value === 'noTemplate' ? value : 'noTemplate'
  }

  function getKnowledgeTypeFromArrayName(arrayName) {
    if (arrayName === 'tenetKnowledge') return 'tenetKnowledge'
    if (arrayName === 'knowledge') return 'knowledge'
    return null
  }

  function getKnowledgeEntryTypeFromRowType(type) {
    return type === 'tenet' ? 'tenetKnowledge' : 'knowledge'
  }

  function buildBlankKnowledgeEntry() {
    return {
      name: '',
      observation: '',
      rules: '',
      observationRequirement: 0,
      currentObservations: 0,
      knowledgeLevel: 1,
      nextKnowledgeMode: 'noTemplate',
      nextKnowledgeTemplate: ''
    }
  }

  function normalizeKnowledgeTemplateForEntry(type, template) {
    const base = buildBlankKnowledgeEntry(type)
    base.name = String(template?.name || '').trim()
    base.observation = String(template?.observation || '').trim()
    base.rules = String(template?.rules || '').trim()
    base.observationRequirement = Math.max(0, coerceNumber(template?.observationRequirement, 0))
    base.knowledgeLevel = Math.max(1, coerceNumber(template?.knowledgeLevel, 1))
    base.nextKnowledgeMode = normalizeNextKnowledgeMode(template?.nextKnowledgeMode)
    base.nextKnowledgeTemplate =
      base.nextKnowledgeMode === 'existingTemplate' ? String(template?.nextKnowledgeTemplate || '').trim() : ''
    base.currentObservations = 0
    return base
  }

  function getTemplateLevel(template) {
    return Math.max(1, coerceNumber(template?.template?.knowledgeLevel, template?.knowledgeLevel, 1))
  }

  function getKnowledgeTemplateLabel(entryType, template) {
    const name = String(template?.name || '').trim() || 'Unnamed Template'
    return `${name} (L${getTemplateLevel(template)})`
  }

  function buildUpgradedScratchKnowledge(type, sourceItem) {
    const next = buildBlankKnowledgeEntry(type)
    const currentLevel = Math.max(1, coerceNumber(sourceItem?.knowledgeLevel, 1))
    next.knowledgeLevel = currentLevel + 1
    next.name = String(sourceItem?.name || '').trim() || `Knowledge L${next.knowledgeLevel}`
    return next
  }

  function canUpgradeKnowledgeEntry(sourceItem) {
    const req = Math.max(0, coerceNumber(sourceItem?.observationRequirement, 0))
    const current = Math.max(
      0,
      coerceNumber(sourceItem?.currentObservations, coerceNumber(sourceItem?.observations, 0))
    )
    const nextMode = normalizeNextKnowledgeMode(sourceItem?.nextKnowledgeMode)
    return current >= req && nextMode !== 'maxLevel'
  }

  globalScope.KDMKnowledgeTemplateHelpers = {
    buildBlankKnowledgeEntry,
    buildUpgradedScratchKnowledge,
    canUpgradeKnowledgeEntry,
    getKnowledgeEntryTypeFromRowType,
    getKnowledgeTemplateLabel,
    getKnowledgeTypeFromArrayName,
    normalizeKnowledgeTemplateForEntry
  }
})(window)
