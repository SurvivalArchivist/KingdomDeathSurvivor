document.addEventListener('DOMContentLoaded', () => {
  if (!window.api) {
    console.error('API bridge not available')
    return
  }

  const dataSourcesView = document.getElementById('dataSourcesView')
  const navDataSourcesButton = document.getElementById('navDataSources')
  const selectSourceSurvivors = document.getElementById('selectSourceSurvivors')
  const selectSourceDefaultSurvivorTemplates = document.getElementById('selectSourceDefaultSurvivorTemplates')
  const selectSourceFightingArts = document.getElementById('selectSourceFightingArts')
  const selectSourceSecretFightingArts = document.getElementById('selectSourceSecretFightingArts')
  const selectSourceKnowledges = document.getElementById('selectSourceKnowledges')
  const selectSourceTenetKnowledges = document.getElementById('selectSourceTenetKnowledges')
  const selectSourceNeuroses = document.getElementById('selectSourceNeuroses')
  const selectSourceDisorders = document.getElementById('selectSourceDisorders')
  const sourcePathSurvivors = document.getElementById('sourcePathSurvivors')
  const sourcePathDefaultSurvivorTemplates = document.getElementById('sourcePathDefaultSurvivorTemplates')
  const sourcePathFightingArts = document.getElementById('sourcePathFightingArts')
  const sourcePathSecretFightingArts = document.getElementById('sourcePathSecretFightingArts')
  const sourcePathKnowledges = document.getElementById('sourcePathKnowledges')
  const sourcePathTenetKnowledges = document.getElementById('sourcePathTenetKnowledges')
  const sourcePathNeuroses = document.getElementById('sourcePathNeuroses')
  const sourcePathDisorders = document.getElementById('sourcePathDisorders')
  const settingsFastMode = document.getElementById('settingsFastMode')
  const status = document.getElementById('status')

  const refreshPeopleButton = document.getElementById('refreshPeople')
  const peopleList = document.getElementById('peopleList')
  const peopleCount = document.getElementById('peopleCount')
  const loadPersonButton = document.getElementById('loadPerson')
  const deletePersonButton = document.getElementById('deletePerson')
  const showdownSelectA = document.getElementById('showdownSelectA')
  const showdownSelectB = document.getElementById('showdownSelectB')
  const openShowdownButton = document.getElementById('openShowdown')
  const showdownHint = document.getElementById('showdownHint')
  const showdownView = document.getElementById('showdownView')
  const showdownSessionState = document.getElementById('showdownSessionState')
  const departShowdownButton = document.getElementById('departShowdown')
  const refreshShowdownSurvivorsButton = document.getElementById('refreshShowdownSurvivors')
  const showdownOverButton = document.getElementById('showdownOver')
  const globalDepartedIndicator = document.getElementById('globalDepartedIndicator')
  const showdownCardA = document.getElementById('showdownCardA')
  const showdownCardB = document.getElementById('showdownCardB')
  const workspace = document.querySelector('.workspace')
  const settlementView = document.getElementById('settlementView')
  const bulkUpdatesView = document.getElementById('bulkUpdatesView')
  const createSurvivorView = document.getElementById('createSurvivorView')
  const navCreateButton = document.getElementById('navCreate')
  const navShowdownButton = document.getElementById('navShowdown')
  const navSettlementButton = document.getElementById('navSettlement')
  const navBulkUpdatesButton = document.getElementById('navBulkUpdates')
  const navTechnicalButton = document.getElementById('navTechnical')
  const themeToggleButton = document.getElementById('themeToggle')
  const settlementNameSearch = document.getElementById('settlementNameSearch')
  const settlementTraitSearch = document.getElementById('settlementTraitSearch')
  const settlementToggleMovement = document.getElementById('settlementToggleMovement')
  const settlementToggleWeaponProficiency = document.getElementById('settlementToggleWeaponProficiency')
  const settlementClearFiltersButton = document.getElementById('settlementClearFilters')
  const settlementAutoRefreshEnabled = document.getElementById('settlementAutoRefreshEnabled')
  const settlementAutoRefreshInterval = document.getElementById('settlementAutoRefreshInterval')
  const settlementRefreshNow = document.getElementById('settlementRefreshNow')
  const settlementLastRefreshed = document.getElementById('settlementLastRefreshed')
  const settlementAliveCount = document.getElementById('settlementAliveCount')
  const settlementBulkField = document.getElementById('settlementBulkField')
  const settlementBulkDelta = document.getElementById('settlementBulkDelta')
  const settlementApplyBulkButton = document.getElementById('settlementApplyBulk')
  const settlementTableBody = document.getElementById('settlementTableBody')
  const settlementCount = document.getElementById('settlementCount')
  const settlementBoolFilters = [...document.querySelectorAll('[data-bool-filter]')]
  const settlementTriadFilters = [...document.querySelectorAll('[data-triad-filter]')]
  const settlementSortButtons = [...document.querySelectorAll('.settlement-sort')]
  const createSurvivorName = document.getElementById('createSurvivorName')
  const createSurvivorGender = document.getElementById('createSurvivorGender')
  const createSurvivorPhilosophy = document.getElementById('createSurvivorPhilosophy')
  const createPhilosophyNeurosis = document.getElementById('createPhilosophyNeurosis')
  const createNeurosisTemplateName = document.getElementById('createNeurosisTemplateName')
  const createNeurosisLoadTemplate = document.getElementById('createNeurosisLoadTemplate')
  const createNeurosisSaveTemplate = document.getElementById('createNeurosisSaveTemplate')
  const createSurvivorAlive = document.getElementById('createSurvivorAlive')
  const createSurvivorLifetimeReroll = document.getElementById('createSurvivorLifetimeReroll')
  const createSurvivorMatchmaker = document.getElementById('createSurvivorMatchmaker')
  const createSurvivorTinker = document.getElementById('createSurvivorTinker')
  const createPonderIndicator = document.getElementById('createPonderIndicator')
  const createSurvivorTitle = document.getElementById('createSurvivorTitle')
  const createSurvivorHint = document.getElementById('createSurvivorHint')
  const createSurvivorBack = document.getElementById('createSurvivorBack')
  const createSurvivorSubmit = document.getElementById('createSurvivorSubmit')
  const createOpenDefaultTemplate = document.getElementById('createOpenDefaultTemplate')
  const resetCreateSurvivorButton = document.getElementById('resetCreateSurvivor')
  const createAddFightingArtButton = document.getElementById('createAddFightingArt')
  const createAddSecretFightingArtButton = document.getElementById('createAddSecretFightingArt')
  const createAddDisorderButton = document.getElementById('createAddDisorder')
  const createAddTenetKnowledgeButton = document.getElementById('createAddTenetKnowledge')
  const createAddKnowledgeButton = document.getElementById('createAddKnowledge')
  const createAddAbilityButton = document.getElementById('createAddAbility')
  const createAddImpairmentButton = document.getElementById('createAddImpairment')
  const createAbilities = document.getElementById('createAbilities')
  const createImpairments = document.getElementById('createImpairments')
  const createFightingArts = document.getElementById('createFightingArts')
  const createSecretFightingArts = document.getElementById('createSecretFightingArts')
  const createDisorders = document.getElementById('createDisorders')
  const createTenetKnowledge = document.getElementById('createTenetKnowledge')
  const createKnowledge = document.getElementById('createKnowledge')

  const refreshMarkdownButton = document.getElementById('refreshMarkdown')
  const markdownCollection = document.getElementById('markdownCollection')
  const markdownSearch = document.getElementById('markdownSearch')
  const markdownList = document.getElementById('markdownList')
  const markdownHover = document.getElementById('markdownHover')
  const hoverTitle = document.getElementById('hoverTitle')
  const hoverPreview = document.getElementById('hoverPreview')

  const markdownModal = document.getElementById('markdownModal')
  const closeMarkdownModal = document.getElementById('closeMarkdownModal')
  const markdownModalTitle = document.getElementById('markdownModalTitle')
  const markdownModalBody = document.getElementById('markdownModalBody')
  const insertMarkdownButton = document.getElementById('insertMarkdown')
  const addMarkdownModal = document.getElementById('addMarkdownModal')
  const closeAddMarkdownModal = document.getElementById('closeAddMarkdownModal')
  const addMarkdownTitle = document.getElementById('addMarkdownTitle')
  const addMarkdownCollection = document.getElementById('addMarkdownCollection')
  const addMarkdownSearch = document.getElementById('addMarkdownSearch')
  const addMarkdownOptions = document.getElementById('addMarkdownOptions')
  const knowledgeTemplateModal = document.getElementById('knowledgeTemplateModal')
  const closeKnowledgeTemplateModal = document.getElementById('closeKnowledgeTemplateModal')
  const knowledgeTemplateTitle = document.getElementById('knowledgeTemplateTitle')
  const knowledgeTemplateHint = document.getElementById('knowledgeTemplateHint')
  const knowledgeTemplateSearch = document.getElementById('knowledgeTemplateSearch')
  const knowledgeTemplateSelect = document.getElementById('knowledgeTemplateSelect')
  const knowledgeTemplateUse = document.getElementById('knowledgeTemplateUse')
  const knowledgeTemplateScratch = document.getElementById('knowledgeTemplateScratch')
  const savePersonButton = document.getElementById('savePerson')
  const newPersonName = document.getElementById('newPersonName')
  const newPersonTemplateButton = document.getElementById('newPersonTemplate')
  const personJson = document.getElementById('personJson')
  const validationErrors = document.getElementById('validationErrors')

  const visualEditor = document.getElementById('visualEditor')
  const loadJsonToVisualButton = document.getElementById('loadJsonToVisual')
  const veName = document.getElementById('veName')
  const veGender = document.getElementById('veGender')
  const vePhilosophy = document.getElementById('vePhilosophy')
  const vePhilosophyNeurosis = document.getElementById('vePhilosophyNeurosis')
  const veIsAlive = document.getElementById('veIsAlive')
  const veLifetimeReroll = document.getElementById('veLifetimeReroll')
  const veMatchmaker = document.getElementById('veMatchmaker')
  const veTinker = document.getElementById('veTinker')
  const vePonderIndicator = document.getElementById('vePonderIndicator')
  const veAgeMinus = document.getElementById('veAgeMinus')
  const veAgePlus = document.getElementById('veAgePlus')
  const veAgeBoxes = document.getElementById('veAgeBoxes')
  const veAgeValue = document.getElementById('veAgeValue')
  const veWeaponProficiencyType = document.getElementById('veWeaponProficiencyType')
  const veWeaponProficiencyLevel = document.getElementById('veWeaponProficiencyLevel')

  const addFightingArtButton = document.getElementById('addFightingArt')
  const addSecretFightingArtButton = document.getElementById('addSecretFightingArt')
  const addDisorderButton = document.getElementById('addDisorder')
  const addTenetKnowledgeButton = document.getElementById('addTenetKnowledge')
  const addKnowledgeButton = document.getElementById('addKnowledge')
  const veFightingArts = document.getElementById('veFightingArts')
  const veSecretFightingArts = document.getElementById('veSecretFightingArts')
  const veDisorders = document.getElementById('veDisorders')
  const veTenetKnowledge = document.getElementById('veTenetKnowledge')
  const veKnowledge = document.getElementById('veKnowledge')
  const armorHead = document.getElementById('armorHead')
  const armorBody = document.getElementById('armorBody')
  const armorArms = document.getElementById('armorArms')
  const armorWaist = document.getElementById('armorWaist')
  const armorLegs = document.getElementById('armorLegs')
  const createWeaponProficiencyType = document.getElementById('createWeaponProficiencyType')
  const createWeaponProficiencyLevel = document.getElementById('createWeaponProficiencyLevel')

  const required = [
    dataSourcesView,
    navDataSourcesButton,
    selectSourceSurvivors,
    selectSourceDefaultSurvivorTemplates,
    selectSourceFightingArts,
    selectSourceSecretFightingArts,
    selectSourceKnowledges,
    selectSourceTenetKnowledges,
    selectSourceNeuroses,
    selectSourceDisorders,
    sourcePathSurvivors,
    sourcePathDefaultSurvivorTemplates,
    sourcePathFightingArts,
    sourcePathSecretFightingArts,
    sourcePathKnowledges,
    sourcePathTenetKnowledges,
    sourcePathNeuroses,
    sourcePathDisorders,
    settingsFastMode,
    status,
    refreshPeopleButton,
    peopleList,
    peopleCount,
    loadPersonButton,
    deletePersonButton,
    showdownSelectA,
    showdownSelectB,
    openShowdownButton,
    showdownHint,
    showdownView,
    showdownSessionState,
    departShowdownButton,
    refreshShowdownSurvivorsButton,
    showdownOverButton,
    globalDepartedIndicator,
    showdownCardA,
    showdownCardB,
    workspace,
    settlementView,
    bulkUpdatesView,
    createSurvivorView,
    navCreateButton,
    navShowdownButton,
    navSettlementButton,
    navBulkUpdatesButton,
    navTechnicalButton,
    themeToggleButton,
    settlementNameSearch,
    settlementTraitSearch,
    settlementToggleMovement,
    settlementToggleWeaponProficiency,
    settlementClearFiltersButton,
    settlementAutoRefreshEnabled,
    settlementAutoRefreshInterval,
    settlementRefreshNow,
    settlementLastRefreshed,
    settlementAliveCount,
    settlementBulkField,
    settlementBulkDelta,
    settlementApplyBulkButton,
    settlementTableBody,
    settlementCount,
    createSurvivorName,
    createSurvivorGender,
    createSurvivorPhilosophy,
    createPhilosophyNeurosis,
    createNeurosisTemplateName,
    createNeurosisLoadTemplate,
    createNeurosisSaveTemplate,
    createSurvivorAlive,
    createSurvivorLifetimeReroll,
    createSurvivorMatchmaker,
    createSurvivorTinker,
    createPonderIndicator,
    createSurvivorTitle,
    createSurvivorHint,
    createSurvivorBack,
    createSurvivorSubmit,
    createOpenDefaultTemplate,
    resetCreateSurvivorButton,
    createAddFightingArtButton,
    createAddSecretFightingArtButton,
    createAddDisorderButton,
    createAddTenetKnowledgeButton,
    createAddKnowledgeButton,
    createAddAbilityButton,
    createAddImpairmentButton,
    createAbilities,
    createImpairments,
    createFightingArts,
    createSecretFightingArts,
    createDisorders,
    createTenetKnowledge,
    createKnowledge,
    refreshMarkdownButton,
    markdownCollection,
    markdownSearch,
    markdownList,
    markdownHover,
    hoverTitle,
    hoverPreview,
    markdownModal,
    closeMarkdownModal,
    markdownModalTitle,
    markdownModalBody,
    insertMarkdownButton,
    addMarkdownModal,
    closeAddMarkdownModal,
    addMarkdownTitle,
    addMarkdownCollection,
    addMarkdownSearch,
    addMarkdownOptions,
    knowledgeTemplateModal,
    closeKnowledgeTemplateModal,
    knowledgeTemplateTitle,
    knowledgeTemplateHint,
    knowledgeTemplateSearch,
    knowledgeTemplateSelect,
    knowledgeTemplateUse,
    knowledgeTemplateScratch,
    savePersonButton,
    newPersonName,
    newPersonTemplateButton,
    personJson,
    validationErrors,
    visualEditor,
    loadJsonToVisualButton,
    veName,
    veGender,
    vePhilosophy,
    vePhilosophyNeurosis,
    veIsAlive,
    veLifetimeReroll,
    veMatchmaker,
    veTinker,
    vePonderIndicator,
    veAgeMinus,
    veAgePlus,
    veAgeBoxes,
    veAgeValue,
    veWeaponProficiencyType,
    veWeaponProficiencyLevel,
    addFightingArtButton,
    addSecretFightingArtButton,
    addDisorderButton,
    addTenetKnowledgeButton,
    addKnowledgeButton,
    veFightingArts,
    veSecretFightingArts,
    veDisorders,
    veTenetKnowledge,
    veKnowledge,
    armorHead,
    armorBody,
    armorArms,
    armorWaist,
    armorLegs,
    createWeaponProficiencyType,
    createWeaponProficiencyLevel
  ]
  if (required.some(element => !element)) {
    console.error('Required DOM elements not found')
    return
  }

  const numericConfig = {
    veAge: { field: 'age', min: 0, max: 16 },
    veLumi: { field: 'lumi', min: 0 },
    veSurvivalPts: { field: 'survivalPts', min: 0 },
    veInsanityPts: { field: 'insanityPts', min: 0 },
    veSystemicPressurePts: { field: 'systemicPressurePts', min: 0 },
    veTormentPts: { field: 'tormentPts', min: 0 },
    veMovement: { field: 'movement', min: 1 },
    veSpeed: { field: 'speed' },
    veAccuracy: { field: 'accuracy' },
    veStrength: { field: 'strength' },
    veLuck: { field: 'luck' },
    veEvasion: { field: 'evasion' },
    veCourage: { field: 'courage', min: 0, max: 9 },
    veUnderstanding: { field: 'understanding', min: 0, max: 9 },
    vePhilosophyRank: { field: 'philosophyRank', min: 0, max: 4 },
    veNextPhilosophyAgeThreshold: { field: 'nextPhilosophyAgeThreshold', min: 0, max: 16 },
    veWeaponProficiencyLevel: { field: 'weaponProficiency.level', min: 0, max: 8 }
  }

  const createNumericConfig = {
    createSurvivorAge: { field: 'age', min: 0, max: 16 },
    createSurvivorLumi: { field: 'lumi', min: 0 },
    createSurvivorSurvivalPts: { field: 'survivalPts', min: 0 },
    createSurvivorInsanityPts: { field: 'insanityPts', min: 0 },
    createSurvivorSystemicPressurePts: { field: 'systemicPressurePts', min: 0 },
    createSurvivorTormentPts: { field: 'tormentPts', min: 0 },
    createSurvivorMovement: { field: 'movement', min: 1 },
    createSurvivorSpeed: { field: 'speed' },
    createSurvivorAccuracy: { field: 'accuracy' },
    createSurvivorStrength: { field: 'strength' },
    createSurvivorLuck: { field: 'luck' },
    createSurvivorEvasion: { field: 'evasion' },
    createSurvivorCourage: { field: 'courage', min: 0, max: 9 },
    createSurvivorUnderstanding: { field: 'understanding', min: 0, max: 9 },
    createPhilosophyRank: { field: 'philosophyRank', min: 0, max: 4 },
    createNextPhilosophyAgeThreshold: { field: 'nextPhilosophyAgeThreshold', min: 0, max: 16 },
    createWeaponProficiencyLevel: { field: 'weaponProficiency.level', min: 0, max: 8 }
  }

  let hasDataFolder = false
  let busy = false
  const THEME_STORAGE_KEY = 'kdm-theme'
  let currentTheme = 'dark'
  let currentMarkdownDoc = null
  let markdownCollections = []
  let markdownFiles = []
  let visualPerson = null
  let skipVisualSync = false
  let inShowdownMode = false
  let currentPage = 'technical'
  let createViewMode = 'create'
  let settlementRecords = []
  let settlementSort = { key: 'name', direction: 'desc' }
  let settlementAutoRefreshTimer = null
  let settlementAutoRefreshBusy = false
  let settlementAutoRefreshOn = true
  let settlementAutoRefreshIntervalSeconds = 20
  let settlementFastMode = false
  let settlementLastRefreshedAt = null
  let pendingSettlementEntryRefresh = false
  let createTemplateDefaults = null
  let createViewBase = null
  let createEditingFileName = null
  let createArrayState = {
    abilities: [],
    impairments: [],
    fightingArts: [],
    secretFightingArts: [],
    disorders: [],
    tenetKnowledge: [],
    knowledge: []
  }
  let createTextDraftState = {
    abilities: [],
    impairments: []
  }
  const SHOWDOWN_FIELDS = [
    'age',
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
  ]
  const SHOWDOWN_PAGE_CONFIG = [
    { key: 'armor', symbol: 'A', label: 'Armor' },
    { key: 'stats', symbol: 'S', label: 'Stats' },
    { key: 'knowledge', symbol: 'K', label: 'Tenet Knowledge / Neurosis / Knowledge' },
    { key: 'arts', symbol: 'F', label: 'Fighting Arts / Secret Fighting Arts' },
    { key: 'disorders', symbol: 'D', label: 'Disorders' },
    { key: 'traits', symbol: 'AI', label: 'Abilities / Impairments' }
  ]
  const SHOWDOWN_DEFAULT_PAGE = SHOWDOWN_PAGE_CONFIG[0].key
  let showdownArmor = {
    A: {
      head: 0,
      body: 0,
      arms: 0,
      waist: 0,
      legs: 0,
      bleedingTokens: 0,
      headHeavy: false,
      bodyLight: false,
      bodyHeavy: false,
      armsLight: false,
      armsHeavy: false,
      waistLight: false,
      waistHeavy: false,
      legsLight: false,
      legsHeavy: false
    },
    B: {
      head: 0,
      body: 0,
      arms: 0,
      waist: 0,
      legs: 0,
      bleedingTokens: 0,
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
  let showdownModifiers = {
    A: {},
    B: {}
  }
  const WEAPON_PROFICIENCY_TYPES = [
    '',
    'Axe',
    'Bow',
    'Club',
    'Fist & Tooth',
    'Grand Weapon',
    'Katar',
    'Lantern Glaive',
    'Spear',
    'Sword',
    'Whip'
  ]
  const BULK_EDIT_FIELD_CONFIG = {
    movement: { label: 'Movement', min: 1 },
    speed: { label: 'Speed' },
    accuracy: { label: 'Accuracy' },
    strength: { label: 'Strength' },
    luck: { label: 'Luck' },
    evasion: { label: 'Evasion' },
    courage: { label: 'Courage', min: 0, max: 9 },
    understanding: { label: 'Understanding', min: 0, max: 9 }
  }
  let showdownPeople = {
    A: null,
    B: null
  }
  let showdownPageBySlot = {
    A: SHOWDOWN_DEFAULT_PAGE,
    B: SHOWDOWN_DEFAULT_PAGE
  }
  const showdownMarkdownPreviewCache = new Map()
  const showdownMarkdownIndexCache = new Map()
  const showdownMarkdownPreviewPending = new Set()
  let showdownTextDraftState = {
    A: { abilities: [], impairments: [] },
    B: { abilities: [], impairments: [] }
  }
  let showdownDeparted = false
  let showdownLockedSlots = { A: '', B: '' }
  let forceShowdownReselection = false
  let armorState = {
    armorHead: 0,
    armorBody: 0,
    armorArms: 0,
    armorWaist: 0,
    armorLegs: 0
  }
  const addPickerState = {
    arrayName: null,
    mode: 'editor',
    slot: null,
    collections: [],
    files: []
  }
  const knowledgeTemplatePickerState = {
    action: 'add',
    mode: 'editor',
    type: 'knowledge',
    slot: null,
    index: -1,
    sourceItem: null,
    templates: [],
    preferredTemplateFile: '',
    forceTemplateOnly: false,
    forceScratchOnly: false
  }
  const knowledgeTemplateCache = {
    tenetKnowledge: [],
    knowledge: []
  }
  const DATA_SOURCE_KEYS = [
    'survivors',
    'defaultSurvivorTemplates',
    'fightingArts',
    'secretFightingArts',
    'knowledges',
    'tenetKnowledges',
    'neuroses',
    'disorders'
  ]
  const dataSourceButtons = {
    survivors: selectSourceSurvivors,
    defaultSurvivorTemplates: selectSourceDefaultSurvivorTemplates,
    fightingArts: selectSourceFightingArts,
    secretFightingArts: selectSourceSecretFightingArts,
    knowledges: selectSourceKnowledges,
    tenetKnowledges: selectSourceTenetKnowledges,
    neuroses: selectSourceNeuroses,
    disorders: selectSourceDisorders
  }
  const dataSourcePathDisplays = {
    survivors: sourcePathSurvivors,
    defaultSurvivorTemplates: sourcePathDefaultSurvivorTemplates,
    fightingArts: sourcePathFightingArts,
    secretFightingArts: sourcePathSecretFightingArts,
    knowledges: sourcePathKnowledges,
    tenetKnowledges: sourcePathTenetKnowledges,
    neuroses: sourcePathNeuroses,
    disorders: sourcePathDisorders
  }
  let dataSources = Object.fromEntries(DATA_SOURCE_KEYS.map(key => [key, '']))
  let hasDefaultTemplateFolder = false

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value))
  }

  function clamp(value, min, max) {
    let next = value
    if (typeof min === 'number') next = Math.max(min, next)
    if (typeof max === 'number') next = Math.min(max, next)
    return next
  }

  function coerceNumber(value, fallback = 0) {
    const num = Number(value)
    return Number.isFinite(num) ? num : fallback
  }

  function coerceInt(value, fallback = 0) {
    return Math.trunc(coerceNumber(value, fallback))
  }

  function normalizeProficiencyLevel(value, fallback = 0) {
    if (typeof value === 'string') {
      const trimmed = value.trim()
      const legacyMatch = trimmed.match(/^\d+\.(\d+)$/)
      if (legacyMatch) {
        return clamp(coerceInt(legacyMatch[1], fallback), 0, 8)
      }
    }
    return clamp(coerceInt(value, fallback), 0, 8)
  }

  function normalizeMarkdownFileKey(fileName) {
    return String(fileName || '').replace(/\\/g, '/').trim()
  }

  function getSelectedMatchmakerGroup(person) {
    if (Boolean(person?.stalwart)) return 'stalwart'
    if (Boolean(person?.prepared)) return 'prepared'
    if (Boolean(person?.matchmaker)) return 'matchmaker'
    return 'none'
  }

  function getSelectedTinkerGroup(person) {
    if (Boolean(person?.analyze)) return 'analyze'
    if (Boolean(person?.explore)) return 'explore'
    if (Boolean(person?.tinker)) return 'tinker'
    return 'none'
  }

  function applyMatchmakerGroup(person, selected) {
    const value = String(selected || 'none')
    person.stalwart = value === 'stalwart'
    person.prepared = value === 'prepared'
    person.matchmaker = value === 'matchmaker'
  }

  function applyTinkerGroup(person, selected) {
    const value = String(selected || 'none')
    person.analyze = value === 'analyze'
    person.explore = value === 'explore'
    person.tinker = value === 'tinker'
  }

  function buildShowdownGroupOptions(currentValue, options) {
    return options
      .map(([value, label]) => `<option value="${value}"${currentValue === value ? ' selected' : ''}>${label}</option>`)
      .join('')
  }

  function normalizeShowdownPageKey(pageKey) {
    const value = String(pageKey || '').trim()
    return SHOWDOWN_PAGE_CONFIG.some(page => page.key === value) ? value : SHOWDOWN_DEFAULT_PAGE
  }

  function getValueByPath(target, path) {
    const keys = String(path || '').split('.').filter(Boolean)
    let current = target
    for (const key of keys) {
      if (!current || typeof current !== 'object') return undefined
      current = current[key]
    }
    return current
  }

  function setValueByPath(target, path, value) {
    const keys = String(path || '').split('.').filter(Boolean)
    if (keys.length === 0) return
    let current = target
    for (let index = 0; index < keys.length - 1; index += 1) {
      const key = keys[index]
      if (!current[key] || typeof current[key] !== 'object') current[key] = {}
      current = current[key]
    }
    current[keys[keys.length - 1]] = value
  }

  function ensureWeaponProficiency(person) {
    if (!person || typeof person !== 'object') return { type: '', level: 0, isSpecialist: false, isMaster: false }
    if (!person.weaponProficiency || typeof person.weaponProficiency !== 'object') {
      person.weaponProficiency = { type: '', level: 0, isSpecialist: false, isMaster: false }
    }
    const proficiency = person.weaponProficiency
    proficiency.type = String(proficiency.type || '')
    proficiency.level = normalizeProficiencyLevel(proficiency.level, 0)
    proficiency.isSpecialist = Boolean(proficiency.isSpecialist)
    proficiency.isMaster = Boolean(proficiency.isMaster)
    return proficiency
  }

  function getNextPhilosophyAgeThreshold(person) {
    return clamp(coerceInt(person?.nextPhilosophyAgeThreshold, 0), 0, 16)
  }

  function canSurvivorPonder(person) {
    const age = clamp(coerceInt(person?.age, 0), 0, 16)
    const threshold = getNextPhilosophyAgeThreshold(person)
    return threshold > 0 && age >= threshold
  }

  function renderPonderIndicator(element, person) {
    if (!element) return
    const threshold = getNextPhilosophyAgeThreshold(person)
    const ready = canSurvivorPonder(person)
    element.classList.remove('status-pill-neutral', 'status-pill-success')
    if (threshold <= 0) {
      element.textContent = 'No Threshold'
      element.classList.add('status-pill-neutral')
      return
    }
    if (ready) {
      element.textContent = 'Ready to Ponder'
      element.classList.add('status-pill-success')
      return
    }
    element.textContent = `Ponder at Age ${threshold}`
    element.classList.add('status-pill-neutral')
  }

  function resetArmorState() {
    armorState = {
      armorHead: 0,
      armorBody: 0,
      armorArms: 0,
      armorWaist: 0,
      armorLegs: 0
    }
    renderArmorState()
  }

  function renderArmorState() {
    armorHead.value = String(armorState.armorHead)
    armorBody.value = String(armorState.armorBody)
    armorArms.value = String(armorState.armorArms)
    armorWaist.value = String(armorState.armorWaist)
    armorLegs.value = String(armorState.armorLegs)
  }

  function renderAgeBoxes(age) {
    const normalizedAge = clamp(coerceNumber(age, 0), 0, 16)
    veAgeBoxes.innerHTML = ''
    for (let i = 0; i < 16; i += 1) {
      const box = document.createElement('span')
      box.className = i < normalizedAge ? 'age-box filled' : 'age-box'
      veAgeBoxes.appendChild(box)
    }
    veAgeValue.textContent = String(normalizedAge)
  }

  function setStatus(message, tone = 'neutral') {
    status.innerText = message
    status.classList.remove('is-error', 'is-success', 'is-neutral')
    if (tone === 'error') status.classList.add('is-error')
    else if (tone === 'success') status.classList.add('is-success')
    else status.classList.add('is-neutral')
  }

  function applyTheme(theme) {
    const nextTheme = theme === 'light' ? 'light' : 'dark'
    currentTheme = nextTheme
    document.body.classList.toggle('theme-light', nextTheme === 'light')
    document.body.classList.toggle('theme-dark', nextTheme === 'dark')
    themeToggleButton.textContent = nextTheme === 'light' ? 'Dark Mode' : 'Light Mode'
    themeToggleButton.setAttribute('aria-pressed', nextTheme === 'light' ? 'true' : 'false')
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    } catch {
      // Ignore storage failures in restricted environments.
    }
  }

  function loadThemePreference() {
    let storedTheme = null
    try {
      storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    } catch {
      storedTheme = null
    }
    applyTheme(storedTheme === 'light' ? 'light' : 'dark')
  }

  function renderDataSources() {
    for (const key of DATA_SOURCE_KEYS) {
      const el = dataSourcePathDisplays[key]
      if (!el) continue
      const value = String(dataSources[key] || '').trim()
      el.textContent = value || 'Not set'
    }
    hasDataFolder = Boolean(String(dataSources.survivors || '').trim())
    hasDefaultTemplateFolder = Boolean(String(dataSources.defaultSurvivorTemplates || '').trim())
  }

  function getEffectiveSettlementRefreshMs() {
    const baseSeconds = clamp(coerceNumber(settlementAutoRefreshIntervalSeconds, 20), 3, 120)
    const fastModeSeconds = settlementFastMode ? Math.min(baseSeconds, 5) : baseSeconds
    return Math.max(1000, Math.round(fastModeSeconds * 1000))
  }

  function updateSettlementLastRefreshed(timestamp = null) {
    settlementLastRefreshedAt = timestamp instanceof Date ? timestamp : timestamp ? new Date(timestamp) : null
    if (!settlementLastRefreshedAt || Number.isNaN(settlementLastRefreshedAt.getTime())) {
      settlementLastRefreshed.textContent = 'Last refreshed: --'
      return
    }
    settlementLastRefreshed.textContent = `Last refreshed: ${settlementLastRefreshedAt.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })}`
  }

  function shouldRunSettlementAutoRefresh() {
    return (
      settlementAutoRefreshOn &&
      hasDataFolder &&
      currentPage === 'settlement' &&
      !busy &&
      !settlementAutoRefreshBusy &&
      !document.hidden &&
      document.hasFocus()
    )
  }

  function stopSettlementAutoRefresh() {
    if (!settlementAutoRefreshTimer) return
    window.clearTimeout(settlementAutoRefreshTimer)
    settlementAutoRefreshTimer = null
  }

  function scheduleSettlementAutoRefresh() {
    stopSettlementAutoRefresh()
    if (!shouldRunSettlementAutoRefresh()) return
    settlementAutoRefreshTimer = window.setTimeout(() => {
      runSettlementAutoRefresh().catch(err => {
        setStatus(err.message || 'Settlement auto refresh failed', 'error')
      })
    }, getEffectiveSettlementRefreshMs())
  }

  async function runSettlementAutoRefresh() {
    if (!shouldRunSettlementAutoRefresh()) {
      scheduleSettlementAutoRefresh()
      return
    }
    settlementAutoRefreshBusy = true
    try {
      await refreshPeople({ silentStatus: true, updateRefreshTimestamp: true })
    } finally {
      settlementAutoRefreshBusy = false
      scheduleSettlementAutoRefresh()
      syncControlState()
    }
  }

  function applySettlementRefreshSettingsFromUi() {
    settlementAutoRefreshOn = Boolean(settlementAutoRefreshEnabled.checked)
    settlementFastMode = Boolean(settingsFastMode.checked)
    settlementAutoRefreshIntervalSeconds = clamp(coerceNumber(settlementAutoRefreshInterval.value, 20), 3, 120)
  }

  function syncSettlementAutoRefresh() {
    applySettlementRefreshSettingsFromUi()
    scheduleSettlementAutoRefresh()
  }

  function requestSettlementEntryRefresh() {
    if (pendingSettlementEntryRefresh) return
    if (currentPage !== 'settlement' || !hasDataFolder) return
    pendingSettlementEntryRefresh = true
    window.setTimeout(() => {
      pendingSettlementEntryRefresh = false
      if (currentPage !== 'settlement' || !hasDataFolder) return
      if (busy) {
        requestSettlementEntryRefresh()
        return
      }
      runBusy(async () => {
        await refreshPeople({ updateRefreshTimestamp: true })
      }).catch(err => {
        setStatus(err.message || 'Failed to refresh settlement on open', 'error')
      })
    }, 0)
  }

  function setBusy(nextBusy) {
    busy = nextBusy
    syncControlState()
    syncSettlementAutoRefresh()
  }

  function syncControlState() {
    const hasSelection = Boolean(peopleList.value)
    const hasMarkdownCollections = markdownCollection.options.length > 0 && markdownCollection.value !== ''
    const hasTwoShowdownOptions = showdownSelectA.options.length >= 2
    const hasShowdownPairLoaded = Boolean(showdownPeople.A && showdownPeople.B)
    const canOpenShowdown =
      hasTwoShowdownOptions &&
      showdownSelectA.value &&
      showdownSelectB.value &&
      showdownSelectA.value !== showdownSelectB.value

    for (const button of Object.values(dataSourceButtons)) {
      if (button) button.disabled = busy
    }
    refreshPeopleButton.disabled = !hasDataFolder || busy
    peopleList.disabled = !hasDataFolder || busy
    loadPersonButton.disabled = !hasDataFolder || !hasSelection || busy
    deletePersonButton.disabled = !hasDataFolder || !hasSelection || busy
    showdownSelectA.disabled = !hasDataFolder || busy || showdownDeparted
    showdownSelectB.disabled = !hasDataFolder || busy || showdownDeparted
    openShowdownButton.disabled = !hasDataFolder || !canOpenShowdown || busy || showdownDeparted
    departShowdownButton.disabled = busy || !hasShowdownPairLoaded
    refreshShowdownSurvivorsButton.disabled = busy || showdownDeparted || !canOpenShowdown
    showdownOverButton.disabled = busy || !hasShowdownPairLoaded || !showdownDeparted
    departShowdownButton.textContent = showdownDeparted ? 'Departed' : 'Depart'
    departShowdownButton.classList.toggle('btn-primary', !showdownDeparted)
    departShowdownButton.classList.toggle('btn-danger', showdownDeparted)
    globalDepartedIndicator.classList.toggle('hidden', !showdownDeparted)
    document.body.classList.toggle('departed-active', showdownDeparted)
    if (showdownDeparted) {
      showdownHint.textContent = `Showdown departed. Slots locked: ${showdownLockedSlots.A || '-'} vs ${
        showdownLockedSlots.B || '-'
      }.`
      showdownSessionState.textContent = `Departed: ${showdownLockedSlots.A || '-'} vs ${showdownLockedSlots.B || '-'}`
      globalDepartedIndicator.textContent = `Showdown In Progress: DEPARTED (${showdownLockedSlots.A || '-'} vs ${
        showdownLockedSlots.B || '-'
      })`
    } else if (!hasTwoShowdownOptions) {
      showdownHint.textContent = 'Save at least 2 alive survivors to use showdown.'
      showdownSessionState.textContent = 'Session not departed'
    } else if (canOpenShowdown) {
      showdownHint.textContent = 'Ready to open showdown.'
      showdownSessionState.textContent = 'Session not departed'
    } else {
      showdownHint.textContent = 'Pick two different saved survivors.'
      showdownSessionState.textContent = 'Session not departed'
    }

    refreshMarkdownButton.disabled = busy
    markdownCollection.disabled = !hasMarkdownCollections || busy
    markdownSearch.disabled = !hasMarkdownCollections || busy
    insertMarkdownButton.disabled = busy || !currentMarkdownDoc
    knowledgeTemplateSelect.disabled = busy
    knowledgeTemplateSearch.disabled = busy
    knowledgeTemplateUse.disabled =
      busy ||
      knowledgeTemplatePickerState.forceScratchOnly ||
      knowledgeTemplateSelect.options.length === 0 ||
      knowledgeTemplateSelect.value === ''
    knowledgeTemplateScratch.disabled = busy || knowledgeTemplatePickerState.forceTemplateOnly
    newPersonTemplateButton.disabled = !hasDataFolder || busy
    savePersonButton.disabled = !hasDataFolder || busy
    loadJsonToVisualButton.disabled = busy
    veWeaponProficiencyType.disabled = busy
    addFightingArtButton.disabled = busy
    addSecretFightingArtButton.disabled = busy
    addDisorderButton.disabled = busy
    addTenetKnowledgeButton.disabled = busy
    addKnowledgeButton.disabled = busy
    settlementNameSearch.disabled = !hasDataFolder || busy
    settlementTraitSearch.disabled = !hasDataFolder || busy
    settlementToggleMovement.disabled = !hasDataFolder || busy
    settlementToggleWeaponProficiency.disabled = !hasDataFolder || busy
    settlementClearFiltersButton.disabled = !hasDataFolder || busy
    settingsFastMode.disabled = busy
    settlementAutoRefreshEnabled.disabled = !hasDataFolder || busy
    settlementAutoRefreshInterval.disabled = !hasDataFolder || busy || !settlementAutoRefreshOn
    settlementRefreshNow.disabled = !hasDataFolder || busy
    settlementBulkField.disabled = !hasDataFolder || busy
    settlementBulkDelta.disabled = !hasDataFolder || busy
    settlementApplyBulkButton.disabled = !hasDataFolder || busy || settlementRecords.length === 0
    for (const filter of settlementBoolFilters) {
      filter.disabled = !hasDataFolder || busy
    }
    for (const filter of settlementTriadFilters) {
      filter.disabled = !hasDataFolder || busy
    }
    for (const button of settlementSortButtons) {
      button.disabled = !hasDataFolder || busy
    }
    createSurvivorName.disabled = busy
    createSurvivorGender.disabled = busy
    createSurvivorPhilosophy.disabled = busy
    createPhilosophyNeurosis.disabled = busy
    createNeurosisTemplateName.disabled = busy
    createNeurosisLoadTemplate.disabled = busy
    createNeurosisSaveTemplate.disabled = busy
    createSurvivorAlive.disabled = busy
    createSurvivorLifetimeReroll.disabled = busy
    createSurvivorMatchmaker.disabled = busy
    createSurvivorTinker.disabled = busy
    createWeaponProficiencyType.disabled = busy
    createSurvivorBack.disabled = busy
    createOpenDefaultTemplate.disabled = busy || createViewMode === 'defaultTemplate'
    createSurvivorSubmit.disabled =
      busy || (createViewMode === 'defaultTemplate' ? !hasDefaultTemplateFolder : !hasDataFolder)
    resetCreateSurvivorButton.disabled = busy
    createAddFightingArtButton.disabled = busy
    createAddSecretFightingArtButton.disabled = busy
    createAddDisorderButton.disabled = busy
    createAddTenetKnowledgeButton.disabled = busy
    createAddKnowledgeButton.disabled = busy
    createAddAbilityButton.disabled = busy
    createAddImpairmentButton.disabled = busy
    for (const inputId of Object.keys(createNumericConfig)) {
      const input = document.getElementById(inputId)
      if (input) input.disabled = busy
    }
    for (const button of createSurvivorView.querySelectorAll('[data-create-step-target]')) {
      button.disabled = busy
    }
    if (settingsFastMode.checked !== settlementFastMode) settingsFastMode.checked = settlementFastMode
    if (settlementAutoRefreshEnabled.checked !== settlementAutoRefreshOn) {
      settlementAutoRefreshEnabled.checked = settlementAutoRefreshOn
    }
    const intervalString = String(settlementAutoRefreshIntervalSeconds)
    if (settlementAutoRefreshInterval.value !== intervalString) settlementAutoRefreshInterval.value = intervalString
  }

  async function runBusy(task) {
    setBusy(true)
    try {
      return await task()
    } finally {
      setBusy(false)
    }
  }

  function clearValidationErrors() {
    validationErrors.innerHTML = ''
  }

  function renderValidationErrors(errors) {
    clearValidationErrors()
    for (const err of errors) {
      const item = document.createElement('li')
      item.textContent = `${err.path}: ${err.message}`
      validationErrors.appendChild(item)
    }
  }

  function highlightPath(path) {
    const tokens = path.split('/').map(token => token.trim()).filter(Boolean)
    if (tokens.length === 0) return
    const target = `"${tokens[tokens.length - 1]}"`
    const index = personJson.value.indexOf(target)
    if (index === -1) return
    personJson.focus()
    personJson.setSelectionRange(index, index + target.length)
  }

  function parseEditorJson() {
    try {
      return JSON.parse(personJson.value)
    } catch (parseErr) {
      renderValidationErrors([{ path: '/', message: parseErr.message || 'Invalid JSON' }])
      setStatus('JSON parsing failed', 'error')
      return null
    }
  }

  function closeModal() {
    markdownModal.classList.add('hidden')
    markdownModal.setAttribute('aria-hidden', 'true')
    insertMarkdownButton.classList.remove('hidden')
  }

  function closeAddPickerModal() {
    addMarkdownModal.classList.add('hidden')
    addMarkdownModal.setAttribute('aria-hidden', 'true')
  }

  function openAddPickerModal() {
    addMarkdownModal.classList.remove('hidden')
    addMarkdownModal.setAttribute('aria-hidden', 'false')
  }

  function closeKnowledgeTemplatePickerModal() {
    knowledgeTemplateModal.classList.add('hidden')
    knowledgeTemplateModal.setAttribute('aria-hidden', 'true')
  }

  function openKnowledgeTemplatePickerModal() {
    knowledgeTemplateModal.classList.remove('hidden')
    knowledgeTemplateModal.setAttribute('aria-hidden', 'false')
  }

  function getKnowledgeTypeFromArrayName(arrayName) {
    if (arrayName === 'tenetKnowledge') return 'tenetKnowledge'
    if (arrayName === 'knowledge') return 'knowledge'
    return null
  }

  function buildBlankKnowledgeEntry(type) {
    if (type === 'tenetKnowledge') {
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
    const mode = String(template?.nextKnowledgeMode || 'noTemplate')
    base.nextKnowledgeMode =
      mode === 'existingTemplate' || mode === 'maxLevel' || mode === 'noTemplate' ? mode : 'noTemplate'
    base.nextKnowledgeTemplate =
      base.nextKnowledgeMode === 'existingTemplate' ? String(template?.nextKnowledgeTemplate || '').trim() : ''
    base.currentObservations = 0
    return base
  }

  function getNextKnowledgeModeLabel(mode) {
    if (mode === 'existingTemplate') return 'Existing Template'
    if (mode === 'maxLevel') return 'MAX LEVEL'
    return 'No Template'
  }

  function getTemplateLevel(template) {
    return Math.max(1, coerceNumber(template?.template?.knowledgeLevel, template?.knowledgeLevel, 1))
  }

  function getKnowledgeTemplateLabel(entryType, template) {
    const name = String(template?.name || '').trim() || 'Unnamed Template'
    return `${name} (L${getTemplateLevel(template)})`
  }

  function resolveKnowledgeTemplateSelection(templates, fileName, sourceItem = null) {
    if (!Array.isArray(templates) || templates.length === 0) return null
    const reference = String(fileName || '').trim()
    if (reference) {
      const exact = templates.find(template => template.fileName === reference)
      if (exact) return exact
    }
    const sourceName = String(sourceItem?.name || '').trim().toLowerCase()
    const nextLevel = Math.max(1, coerceNumber(sourceItem?.knowledgeLevel, 1) + 1)
    if (sourceName) {
      const byNameAndLevel = templates.find(template => {
        const templateName = String(template?.name || '').trim().toLowerCase()
        return templateName === sourceName && getTemplateLevel(template) === nextLevel
      })
      if (byNameAndLevel) return byNameAndLevel
      const byName = templates.find(template => String(template?.name || '').trim().toLowerCase() === sourceName)
      if (byName) return byName
    }
    return null
  }

  async function refreshKnowledgeTemplateCache(type = null) {
    const types = type ? [type] : ['tenetKnowledge', 'knowledge']
    for (const entryType of types) {
      try {
        knowledgeTemplateCache[entryType] = await window.api.listKnowledgeTemplates(entryType)
      } catch {
        knowledgeTemplateCache[entryType] = []
      }
    }
  }

  function getKnowledgeEntryTypeFromRowType(type) {
    return type === 'tenet' ? 'tenetKnowledge' : 'knowledge'
  }

  function resetShowdownModifiers() {
    showdownModifiers = { A: {}, B: {} }
    for (const slot of ['A', 'B']) {
      for (const field of SHOWDOWN_FIELDS) {
        showdownModifiers[slot][field] = { temporary: 0, tokens: 0 }
      }
    }
  }

  function getShowdownModifier(slot, field) {
    if (!showdownModifiers[slot]) showdownModifiers[slot] = {}
    if (!showdownModifiers[slot][field]) {
      showdownModifiers[slot][field] = { temporary: 0, tokens: 0 }
    }
    return showdownModifiers[slot][field]
  }

  function setPage(page) {
    const nextPage =
      page === 'showdown' ||
      page === 'settlement' ||
      page === 'bulkUpdates' ||
      page === 'defaultTemplate' ||
      page === 'create' ||
      page === 'dataSources'
        ? page
        : 'technical'
    currentPage = nextPage
    inShowdownMode = nextPage === 'showdown'

    document.body.classList.toggle('showdown-mode', inShowdownMode)
    dataSourcesView.classList.toggle('hidden', nextPage !== 'dataSources')
    workspace.classList.toggle('hidden', nextPage !== 'technical')
    showdownView.classList.toggle('hidden', nextPage !== 'showdown')
    settlementView.classList.toggle('hidden', nextPage !== 'settlement')
    bulkUpdatesView.classList.toggle('hidden', nextPage !== 'bulkUpdates')
    createSurvivorView.classList.toggle('hidden', nextPage !== 'create' && nextPage !== 'defaultTemplate')

    navDataSourcesButton.classList.toggle('is-active', nextPage === 'dataSources')
    navCreateButton.classList.toggle('is-active', nextPage === 'create')
    navTechnicalButton.classList.toggle('is-active', nextPage === 'technical')
    navSettlementButton.classList.toggle('is-active', nextPage === 'settlement')
    navBulkUpdatesButton.classList.toggle('is-active', nextPage === 'bulkUpdates')
    navShowdownButton.classList.toggle('is-active', nextPage === 'showdown')
    if (nextPage === 'settlement') {
      renderSettlementTable()
      requestSettlementEntryRefresh()
    }
    syncSettlementAutoRefresh()
    syncControlState()
  }

  function renderCreateSurvivorForm(template) {
    const source = template || createTemplateDefaults
    if (!source) return
    createViewBase = deepClone(source)
    const proficiency = ensureWeaponProficiency(createViewBase)
    createSurvivorName.value = source.name || ''
    createSurvivorGender.value = source.gender === 'F' ? 'F' : 'M'
    createSurvivorPhilosophy.value = source.philosophy || ''
    createPhilosophyNeurosis.value = source.philosophyNeurosis || ''
    createNeurosisTemplateName.value = source.philosophyNeurosisName || ''
    createSurvivorAlive.checked = Boolean(source.isAlive)
    createSurvivorLifetimeReroll.checked = Boolean(source.lifetimeReroll)
    createSurvivorMatchmaker.value = getSelectedMatchmakerGroup(source)
    createSurvivorTinker.value = getSelectedTinkerGroup(source)
    createWeaponProficiencyType.value = proficiency.type
    for (const [inputId, config] of Object.entries(createNumericConfig)) {
      const input = document.getElementById(inputId)
      if (!input) continue
      const current = getValueByPath(createViewBase, config.field)
      const value =
        config.field === 'weaponProficiency.level'
          ? normalizeProficiencyLevel(current, config.min ?? 0)
          : clamp(coerceNumber(current, config.min ?? 0), config.min, config.max)
      input.value = String(value)
    }
    renderPonderIndicator(createPonderIndicator, createViewBase)
    renderCreateArrayRows(source)
  }

  function renderCreateArrayRows(source) {
    createArrayState = {
      abilities: deepClone(source.abilities || []),
      impairments: deepClone(source.impairments || []),
      fightingArts: deepClone(source.fightingArts || []),
      secretFightingArts: deepClone(source.secretFightingArts || []),
      disorders: deepClone(source.disorders || []),
      tenetKnowledge: deepClone(source.tenetKnowledge || []),
      knowledge: deepClone(source.knowledge || [])
    }
    syncCreateTextDraftState('abilities')
    syncCreateTextDraftState('impairments')
    renderCreateTextRows(createAbilities, createArrayState.abilities, 'abilities')
    renderCreateTextRows(createImpairments, createArrayState.impairments, 'impairments')
    renderArrayRows(createFightingArts, createArrayState.fightingArts, 'fightingArts')
    renderArrayRows(createSecretFightingArts, createArrayState.secretFightingArts, 'secretFightingArts')
    renderArrayRows(createDisorders, createArrayState.disorders, 'disorders')
    renderArrayRows(createTenetKnowledge, createArrayState.tenetKnowledge, 'tenet')
    renderArrayRows(createKnowledge, createArrayState.knowledge, 'knowledge')
  }

  function renderCreateTextRows(container, items, type) {
    container.innerHTML = ''
    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = '<p class="ve-empty">No entries.</p>'
      return
    }
    syncCreateTextDraftState(type)
    items.forEach((item, index) => {
      const draftEntry = createTextDraftState[type][index] || {
        text: String(item || ''),
        draft: String(item || ''),
        isEditing: false
      }

      const row = document.createElement('div')
      row.className = 've-row ve-row-text-entry'
      row.dataset.arrayType = type
      row.dataset.index = String(index)

      if (draftEntry.isEditing) {
        const textInput = document.createElement('textarea')
        textInput.placeholder = 'Free text'
        textInput.value = draftEntry.draft
        textInput.dataset.field = 'draftText'
        textInput.rows = 4
        row.appendChild(textInput)

        const commitButton = document.createElement('button')
        commitButton.type = 'button'
        commitButton.className = 'btn btn-secondary'
        commitButton.textContent = 'Save/Commit'
        commitButton.dataset.action = 'commitTextRow'
        row.appendChild(commitButton)
      } else {
        const paragraph = document.createElement('p')
        paragraph.className = 've-text-paragraph'
        paragraph.textContent = draftEntry.text || ''
        row.appendChild(paragraph)

        const editButton = document.createElement('button')
        editButton.type = 'button'
        editButton.className = 'btn btn-secondary'
        editButton.textContent = 'Edit'
        editButton.dataset.action = 'editTextRow'
        row.appendChild(editButton)
      }

      const removeButton = document.createElement('button')
      removeButton.type = 'button'
      removeButton.className = 'btn btn-danger'
      removeButton.textContent = 'Remove'
      removeButton.dataset.action = 'removeRow'
      row.appendChild(removeButton)

      container.appendChild(row)
    })
  }

  function syncCreateTextDraftState(type) {
    if (type !== 'abilities' && type !== 'impairments') return
    if (!Array.isArray(createArrayState[type])) createArrayState[type] = []
    const existing = Array.isArray(createTextDraftState[type]) ? createTextDraftState[type] : []
    createTextDraftState[type] = createArrayState[type].map((value, index) => {
      const text = String(value || '')
      const previous = existing[index]
      if (previous && previous.isEditing) {
        return {
          text,
          draft: String(previous.draft ?? text),
          isEditing: true
        }
      }
      return {
        text,
        draft: text,
        isEditing: false
      }
    })
  }

  function updateCreateTextDraftFromRow(row) {
    const type = row?.dataset?.arrayType
    const index = Number(row?.dataset?.index)
    if ((type !== 'abilities' && type !== 'impairments') || Number.isNaN(index) || index < 0) return null
    syncCreateTextDraftState(type)
    const entry = createTextDraftState[type][index]
    if (!entry) return null
    const textarea = row.querySelector('[data-field="draftText"]')
    if (textarea instanceof HTMLTextAreaElement) {
      entry.draft = textarea.value
    }
    return { type, index, entry }
  }

  function syncCreateArraysFromDom() {
    syncCreateTextDraftState('abilities')
    syncCreateTextDraftState('impairments')
    createArrayState = {
      abilities: (createArrayState.abilities || []).map(item => String(item || '').trim()).filter(Boolean),
      impairments: (createArrayState.impairments || []).map(item => String(item || '').trim()).filter(Boolean),
      fightingArts: collectVisualRows(createFightingArts, 'fightingArts'),
      secretFightingArts: collectVisualRows(createSecretFightingArts, 'secretFightingArts'),
      disorders: collectVisualRows(createDisorders, 'disorders'),
      tenetKnowledge: collectVisualRows(createTenetKnowledge, 'tenet'),
      knowledge: collectVisualRows(createKnowledge, 'knowledge')
    }
    syncCreateTextDraftState('abilities')
    syncCreateTextDraftState('impairments')
  }

  function addCreateArrayEntry(type) {
    syncCreateArraysFromDom()
    if (type === 'abilities') {
      createArrayState.abilities.push('')
      syncCreateTextDraftState('abilities')
      const draft = createTextDraftState.abilities[createArrayState.abilities.length - 1]
      if (draft) {
        draft.isEditing = true
        draft.draft = ''
      }
      renderCreateTextRows(createAbilities, createArrayState.abilities, 'abilities')
      return
    }
    if (type === 'impairments') {
      createArrayState.impairments.push('')
      syncCreateTextDraftState('impairments')
      const draft = createTextDraftState.impairments[createArrayState.impairments.length - 1]
      if (draft) {
        draft.isEditing = true
        draft.draft = ''
      }
      renderCreateTextRows(createImpairments, createArrayState.impairments, 'impairments')
      return
    }
    if (type === 'fightingArts') {
      if (createArrayState.fightingArts.length >= 3) {
        setStatus('fightingArts can only contain 3 entries', 'error')
        return
      }
      createArrayState.fightingArts.push({ name: '', file: '' })
      renderArrayRows(createFightingArts, createArrayState.fightingArts, 'fightingArts')
      return
    }
    if (type === 'secretFightingArts') {
      if (createArrayState.secretFightingArts.length >= 3) {
        setStatus('secretFightingArts can only contain 3 entries', 'error')
        return
      }
      createArrayState.secretFightingArts.push({ name: '', file: '' })
      renderArrayRows(createSecretFightingArts, createArrayState.secretFightingArts, 'secretFightingArts')
      return
    }
    if (type === 'disorders') {
      if (createArrayState.disorders.length >= 3) {
        setStatus('disorders can only contain 3 entries', 'error')
        return
      }
      createArrayState.disorders.push({ name: '', file: '' })
      renderArrayRows(createDisorders, createArrayState.disorders, 'disorders')
      return
    }
    if (type === 'tenetKnowledge') {
      if (createArrayState.tenetKnowledge.length >= 1) {
        setStatus('tenetKnowledge can only contain 1 entry', 'error')
        return
      }
      createArrayState.tenetKnowledge.push({
        name: '',
        observation: '',
        rules: '',
        observationRequirement: 0,
        currentObservations: 0,
        knowledgeLevel: 1,
        nextKnowledgeMode: 'noTemplate',
        nextKnowledgeTemplate: ''
      })
      renderArrayRows(createTenetKnowledge, createArrayState.tenetKnowledge, 'tenet')
      return
    }
    if (type === 'knowledge') {
      if (createArrayState.knowledge.length >= 2) {
        setStatus('knowledge can only contain 2 entries', 'error')
        return
      }
      createArrayState.knowledge.push({
        name: '',
        observation: '',
        rules: '',
        observationRequirement: 0,
        currentObservations: 0,
        knowledgeLevel: 1,
        nextKnowledgeMode: 'noTemplate',
        nextKnowledgeTemplate: ''
      })
      renderArrayRows(createKnowledge, createArrayState.knowledge, 'knowledge')
    }
  }

  function removeCreateArrayRow(row) {
    const type = row.dataset.arrayType
    const index = Number(row.dataset.index)
    syncCreateArraysFromDom()
    if (type === 'abilities') createArrayState.abilities.splice(index, 1)
    if (type === 'impairments') createArrayState.impairments.splice(index, 1)
    if (type === 'fightingArts') createArrayState.fightingArts.splice(index, 1)
    if (type === 'secretFightingArts') createArrayState.secretFightingArts.splice(index, 1)
    if (type === 'disorders') createArrayState.disorders.splice(index, 1)
    if (type === 'tenet') createArrayState.tenetKnowledge.splice(index, 1)
    if (type === 'knowledge') createArrayState.knowledge.splice(index, 1)
    renderCreateTextRows(createAbilities, createArrayState.abilities, 'abilities')
    renderCreateTextRows(createImpairments, createArrayState.impairments, 'impairments')
    renderArrayRows(createFightingArts, createArrayState.fightingArts, 'fightingArts')
    renderArrayRows(createSecretFightingArts, createArrayState.secretFightingArts, 'secretFightingArts')
    renderArrayRows(createDisorders, createArrayState.disorders, 'disorders')
    renderArrayRows(createTenetKnowledge, createArrayState.tenetKnowledge, 'tenet')
    renderArrayRows(createKnowledge, createArrayState.knowledge, 'knowledge')
  }

  function editCreateTextRow(row) {
    const type = row?.dataset?.arrayType
    const index = Number(row?.dataset?.index)
    if ((type !== 'abilities' && type !== 'impairments') || Number.isNaN(index) || index < 0) return
    syncCreateTextDraftState(type)
    const entry = createTextDraftState[type][index]
    if (!entry) return
    entry.isEditing = true
    entry.draft = entry.text
    if (type === 'abilities') {
      renderCreateTextRows(createAbilities, createArrayState.abilities, type)
    } else {
      renderCreateTextRows(createImpairments, createArrayState.impairments, type)
    }
  }

  function commitCreateTextRow(row) {
    const update = updateCreateTextDraftFromRow(row)
    if (!update) return
    const value = String(update.entry.draft || '').trim()
    if (!value) {
      setStatus('Text cannot be empty. Use Remove to delete the entry.', 'error')
      return
    }
    createArrayState[update.type][update.index] = value
    update.entry.text = value
    update.entry.draft = value
    update.entry.isEditing = false
    if (update.type === 'abilities') {
      renderCreateTextRows(createAbilities, createArrayState.abilities, update.type)
    } else {
      renderCreateTextRows(createImpairments, createArrayState.impairments, update.type)
    }
  }

  async function saveKnowledgeTemplateFromRow(type, row) {
    const entryType = getKnowledgeEntryTypeFromRowType(type)
    const nextKnowledgeMode = row.querySelector('[data-field="nextKnowledgeMode"]')?.value || 'noTemplate'
    const nextKnowledgeTemplate =
      nextKnowledgeMode === 'existingTemplate'
        ? row.querySelector('[data-field="nextKnowledgeTemplate"]')?.value.trim() || ''
        : ''
    const template =
      type === 'tenet'
        ? {
            name: row.querySelector('[data-field="name"]')?.value.trim() || '',
            observation: row.querySelector('[data-field="observation"]')?.value.trim() || '',
            rules: row.querySelector('[data-field="rules"]')?.value.trim() || '',
            observationRequirement: coerceNumber(
              row.querySelector('[data-field="observationRequirement"]')?.value,
              0
            ),
            knowledgeLevel: Math.max(1, coerceNumber(row.querySelector('[data-field="knowledgeLevel"]')?.value, 1)),
            nextKnowledgeMode,
            nextKnowledgeTemplate
          }
        : {
            name: row.querySelector('[data-field="name"]')?.value.trim() || '',
            observation: row.querySelector('[data-field="observation"]')?.value.trim() || '',
            rules: row.querySelector('[data-field="rules"]')?.value.trim() || '',
            observationRequirement: coerceNumber(
              row.querySelector('[data-field="observationRequirement"]')?.value,
              0
            ),
            knowledgeLevel: Math.max(1, coerceNumber(row.querySelector('[data-field="knowledgeLevel"]')?.value, 1)),
            nextKnowledgeMode,
            nextKnowledgeTemplate
          }
    if (!template.name) {
      setStatus('Template name is required', 'error')
      return
    }
    await window.api.saveKnowledgeTemplate(entryType, template)
    await refreshKnowledgeTemplateCache(entryType)
    setStatus(`Saved ${template.name} as reusable template`, 'success')
  }

  async function applyShowdownNeurosisTemplate(slot) {
    await openNeurosisTemplatePicker({ mode: 'showdown', slot })
  }

  async function applyCreateNeurosisTemplate() {
    await openNeurosisTemplatePicker({ mode: 'create' })
  }

  async function saveCreateNeurosisTemplate() {
    const neurosis = createPhilosophyNeurosis.value.trim()
    if (!neurosis) {
      setStatus('Enter neurosis text before saving a template', 'error')
      return
    }
    const name = createNeurosisTemplateName.value.trim()
    if (!name) {
      setStatus('Template name is required', 'error')
      return
    }
    await window.api.saveNeurosisTemplate({ name, neurosis })
    createNeurosisTemplateName.value = name
    setStatus(`Saved neurosis template: ${name}`, 'success')
  }

  async function saveShowdownNeurosisTemplate(slot) {
    if (!slot || !showdownPeople[slot]) return
    const person = showdownPeople[slot].person
    const neurosis = String(person?.philosophyNeurosis || '').trim()
    if (!neurosis) {
      setStatus('Enter neurosis text before saving a template', 'error')
      return
    }
    const name = String(person?.philosophyNeurosisName || '').trim()
    if (!name) {
      setStatus('Template name is required', 'error')
      return
    }
    await window.api.saveNeurosisTemplate({ name, neurosis })
    showdownPeople[slot].person.philosophyNeurosisName = name
    renderShowdownSlot(slot)
    setStatus(`Saved neurosis template: ${name}`, 'success')
  }

  function insertKnowledgeEntryIntoEditor(arrayName, entry) {
    const parsed = parseEditorJson()
    if (!parsed) return false
    if (!Array.isArray(parsed[arrayName])) parsed[arrayName] = []
    const max = arrayName === 'tenetKnowledge' ? 1 : 2
    if (parsed[arrayName].length >= max) {
      setStatus(`${arrayName} can only contain ${max} entr${max === 1 ? 'y' : 'ies'}`, 'error')
      return false
    }
    parsed[arrayName].push(entry)
    personJson.value = JSON.stringify(parsed, null, 2)
    renderVisualEditor(parsed)
    clearValidationErrors()
    return true
  }

  function insertKnowledgeEntryIntoCreate(arrayName, entry) {
    syncCreateArraysFromDom()
    const max = arrayName === 'tenetKnowledge' ? 1 : 2
    if (!Array.isArray(createArrayState[arrayName])) createArrayState[arrayName] = []
    if (createArrayState[arrayName].length >= max) {
      setStatus(`${arrayName} can only contain ${max} entr${max === 1 ? 'y' : 'ies'}`, 'error')
      return false
    }
    createArrayState[arrayName].push(entry)
    renderArrayRows(createFightingArts, createArrayState.fightingArts, 'fightingArts')
    renderArrayRows(createDisorders, createArrayState.disorders, 'disorders')
    renderArrayRows(createTenetKnowledge, createArrayState.tenetKnowledge, 'tenet')
    renderArrayRows(createKnowledge, createArrayState.knowledge, 'knowledge')
    return true
  }

  function replaceKnowledgeEntryInCreate(arrayName, index, entry) {
    syncCreateArraysFromDom()
    if (!Array.isArray(createArrayState[arrayName])) return false
    if (index < 0 || index >= createArrayState[arrayName].length) return false
    createArrayState[arrayName][index] = entry
    renderArrayRows(createFightingArts, createArrayState.fightingArts, 'fightingArts')
    renderArrayRows(createSecretFightingArts, createArrayState.secretFightingArts, 'secretFightingArts')
    renderArrayRows(createDisorders, createArrayState.disorders, 'disorders')
    renderArrayRows(createTenetKnowledge, createArrayState.tenetKnowledge, 'tenet')
    renderArrayRows(createKnowledge, createArrayState.knowledge, 'knowledge')
    return true
  }

  function insertKnowledgeEntryIntoShowdown(slot, arrayName, entry) {
    if (!slot || !showdownPeople[slot]) return false
    const person = showdownPeople[slot].person
    if (!Array.isArray(person[arrayName])) person[arrayName] = []
    const max = arrayName === 'tenetKnowledge' ? 1 : 2
    if (person[arrayName].length >= max) {
      setStatus(`${arrayName} can only contain ${max} entr${max === 1 ? 'y' : 'ies'}`, 'error')
      return false
    }
    person[arrayName].push(entry)
    renderShowdownSlot(slot)
    return true
  }

  function replaceKnowledgeEntryInShowdown(slot, arrayName, index, entry) {
    if (!slot || !showdownPeople[slot]) return false
    const person = showdownPeople[slot].person
    if (!Array.isArray(person[arrayName])) return false
    if (index < 0 || index >= person[arrayName].length) return false
    person[arrayName][index] = entry
    renderShowdownSlot(slot)
    return true
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
    const current = Math.max(0, coerceNumber(sourceItem?.currentObservations, coerceNumber(sourceItem?.observations, 0)))
    const nextMode = String(sourceItem?.nextKnowledgeMode || 'noTemplate')
    return current >= req && nextMode !== 'maxLevel'
  }

  function applyKnowledgeTemplateSelection(useTemplate) {
    const arrayName = knowledgeTemplatePickerState.type
    if (arrayName === 'neurosis') {
      const selected = knowledgeTemplatePickerState.templates.find(
        template => template.fileName === knowledgeTemplateSelect.value
      )
      if (!selected) {
        setStatus('Select a template first', 'error')
        return
      }
      const neurosis = String(selected.neurosis || '')
      if (knowledgeTemplatePickerState.mode === 'showdown') {
        const slot = knowledgeTemplatePickerState.slot
        if (!slot || !showdownPeople[slot]) return
        showdownPeople[slot].person.philosophyNeurosisName = String(selected.name || '').trim()
        showdownPeople[slot].person.philosophyNeurosis = neurosis
        renderShowdownSlot(slot)
      } else {
        createPhilosophyNeurosis.value = neurosis
        createNeurosisTemplateName.value = String(selected.name || '').trim()
      }
      closeKnowledgeTemplatePickerModal()
      setStatus(`Loaded neurosis template: ${selected.name || 'Unnamed'}`, 'success')
      return
    }

    const entryType = getKnowledgeTypeFromArrayName(arrayName)
    if (!entryType) return
    const isUpgrade = knowledgeTemplatePickerState.action === 'upgrade'
    let entry = buildBlankKnowledgeEntry(entryType)
    if (useTemplate) {
      const selected = knowledgeTemplatePickerState.templates.find(
        template => template.fileName === knowledgeTemplateSelect.value
      )
      if (!selected) {
        setStatus('Select a template first', 'error')
        return
      }
      entry = normalizeKnowledgeTemplateForEntry(entryType, selected.template)
    } else if (isUpgrade) {
      entry = buildUpgradedScratchKnowledge(entryType, knowledgeTemplatePickerState.sourceItem)
    }

    let success = false
    if (isUpgrade) {
      const sourceItem = knowledgeTemplatePickerState.sourceItem || {}
      const minLevel = Math.max(1, coerceNumber(sourceItem.knowledgeLevel, 1)) + 1
      entry.knowledgeLevel = Math.max(minLevel, coerceNumber(entry.knowledgeLevel, minLevel))
      entry.currentObservations = 0
      if (knowledgeTemplatePickerState.mode === 'showdown') {
        success = replaceKnowledgeEntryInShowdown(
          knowledgeTemplatePickerState.slot,
          arrayName,
          knowledgeTemplatePickerState.index,
          entry
        )
      } else if (knowledgeTemplatePickerState.mode === 'create') {
        success = replaceKnowledgeEntryInCreate(arrayName, knowledgeTemplatePickerState.index, entry)
      } else {
        return
      }
    } else if (knowledgeTemplatePickerState.mode === 'showdown') {
      success = insertKnowledgeEntryIntoShowdown(knowledgeTemplatePickerState.slot, arrayName, entry)
    } else if (knowledgeTemplatePickerState.mode === 'create') {
      success = insertKnowledgeEntryIntoCreate(arrayName, entry)
    } else {
      success = insertKnowledgeEntryIntoEditor(arrayName, entry)
    }

    if (!success) return
    closeKnowledgeTemplatePickerModal()
    const label = arrayName === 'tenetKnowledge' ? 'Tenet Knowledge' : 'Knowledge'
    if (isUpgrade) {
      setStatus(useTemplate ? `${label} upgraded from template` : `${label} upgraded to blank next level`, 'success')
    } else {
      setStatus(useTemplate ? `Added ${label} from template` : `Added blank ${label}`, 'success')
    }
  }

  function renderKnowledgeTemplateOptions() {
    const entryType = getKnowledgeTypeFromArrayName(knowledgeTemplatePickerState.type)
    const query = knowledgeTemplateSearch.value.trim().toLowerCase()
    const templates = knowledgeTemplatePickerState.templates.filter(template => {
      if (!query) return true
      return (
        String(template.name || '')
          .toLowerCase()
          .includes(query) || String(template.fileName || '').toLowerCase().includes(query)
      )
    })

    knowledgeTemplateSelect.innerHTML = ''
    for (const template of templates) {
      const option = document.createElement('option')
      option.value = template.fileName
      option.textContent =
        knowledgeTemplatePickerState.type === 'neurosis'
          ? String(template?.name || '').trim() || 'Unnamed Template'
          : getKnowledgeTemplateLabel(entryType, template)
      knowledgeTemplateSelect.appendChild(option)
    }
    const hasTemplates = templates.length > 0
    if (!hasTemplates) {
      const option = document.createElement('option')
      option.value = ''
      option.textContent = query ? 'No templates match your search' : 'No templates available'
      knowledgeTemplateSelect.appendChild(option)
    }
    if (hasTemplates) {
      const preferred = String(knowledgeTemplatePickerState.preferredTemplateFile || '').trim()
      const preferredIndex = preferred ? templates.findIndex(template => template.fileName === preferred) : -1
      knowledgeTemplateSelect.selectedIndex = preferredIndex >= 0 ? preferredIndex : 0
    }
    syncControlState()
  }

  async function openKnowledgeTemplatePicker({
    arrayName,
    mode = 'editor',
    slot = null,
    action = 'add',
    index = -1,
    sourceItem = null,
    forceTemplateOnly = false,
    forceScratchOnly = false
  }) {
    const type = getKnowledgeTypeFromArrayName(arrayName)
    if (!type) return
    await refreshKnowledgeTemplateCache(type)
    const templates = knowledgeTemplateCache[type]
    knowledgeTemplatePickerState.mode = mode
    knowledgeTemplatePickerState.action = action
    knowledgeTemplatePickerState.type = arrayName
    knowledgeTemplatePickerState.slot = slot
    knowledgeTemplatePickerState.index = index
    knowledgeTemplatePickerState.sourceItem = sourceItem ? deepClone(sourceItem) : null
    knowledgeTemplatePickerState.templates = templates
    knowledgeTemplatePickerState.preferredTemplateFile =
      action === 'upgrade' ? String(sourceItem?.nextKnowledgeTemplate || '').trim() : ''
    knowledgeTemplatePickerState.forceTemplateOnly = forceTemplateOnly
    knowledgeTemplatePickerState.forceScratchOnly = forceScratchOnly

    const label = arrayName === 'tenetKnowledge' ? 'Tenet Knowledge' : 'Knowledge'
    const isUpgrade = action === 'upgrade'
    knowledgeTemplateTitle.textContent = `${isUpgrade ? 'Upgrade' : 'Add'} ${label}`
    if (isUpgrade) {
      if (forceTemplateOnly) {
        knowledgeTemplateHint.textContent = 'Choose the next template for this upgrade.'
      } else if (forceScratchOnly) {
        knowledgeTemplateHint.textContent = 'This upgrade has no template. Create a new blank next-level entry.'
      } else {
        knowledgeTemplateHint.textContent = 'Choose an existing template, or create a new blank next-level entry.'
      }
    } else {
      knowledgeTemplateHint.textContent =
        templates.length > 0
          ? 'Choose a saved template or create from scratch.'
          : 'No saved templates found yet. Create one from scratch, then use "Save Template" on a filled entry.'
    }
    knowledgeTemplateSearch.value = ''
    renderKnowledgeTemplateOptions()
    knowledgeTemplateScratch.textContent = isUpgrade ? 'Upgrade with Blank Next Level' : 'Create From Scratch'
    knowledgeTemplateUse.textContent = isUpgrade ? 'Upgrade using Selected Template' : 'Use Selected Template'
    knowledgeTemplateScratch.classList.remove('hidden')
    openKnowledgeTemplatePickerModal()
  }

  async function openNeurosisTemplatePicker({ mode = 'create', slot = null } = {}) {
    if (mode === 'showdown' && (!slot || !showdownPeople[slot])) return
    const templates = await window.api.listNeurosisTemplates()
    if (!Array.isArray(templates) || templates.length === 0) {
      setStatus('No neurosis templates available. Configure Neuroses folder and save one first.', 'error')
      return
    }

    knowledgeTemplatePickerState.mode = mode
    knowledgeTemplatePickerState.action = 'add'
    knowledgeTemplatePickerState.type = 'neurosis'
    knowledgeTemplatePickerState.slot = slot
    knowledgeTemplatePickerState.index = -1
    knowledgeTemplatePickerState.sourceItem = null
    knowledgeTemplatePickerState.templates = templates
    knowledgeTemplatePickerState.preferredTemplateFile = ''
    knowledgeTemplatePickerState.forceTemplateOnly = true
    knowledgeTemplatePickerState.forceScratchOnly = false

    knowledgeTemplateTitle.textContent = 'Load Neurosis Template'
    knowledgeTemplateHint.textContent =
      mode === 'showdown'
        ? `Choose a saved template for Showdown ${slot}.`
        : 'Choose a saved template for this survivor.'
    knowledgeTemplateSearch.value = ''
    renderKnowledgeTemplateOptions()
    knowledgeTemplateUse.textContent = 'Use Selected Template'
    knowledgeTemplateScratch.classList.add('hidden')
    openKnowledgeTemplatePickerModal()
  }

  async function resetCreateSurvivorForm() {
    const template = await loadDefaultCreateTemplateWithFallback()
    createTemplateDefaults = template
    createEditingFileName = null
    applyCreateViewModeUi()
    renderCreateSurvivorForm(template)
  }

  function applyCreateViewModeUi() {
    if (createViewMode === 'defaultTemplate') {
      createSurvivorTitle.textContent = 'Default New Survivor'
      createSurvivorHint.textContent =
        'Edit the default template used for new survivors, then save it for future sessions.'
      createSurvivorSubmit.textContent = 'Save Default Template'
      createOpenDefaultTemplate.textContent = 'Editing Default Template'
      return
    }
    createSurvivorTitle.textContent = 'Create Survivor'
    createSurvivorHint.textContent = 'Start from a default template, set starting values, and save to settlement.'
    createSurvivorSubmit.textContent = 'Create Survivor'
    createOpenDefaultTemplate.textContent = 'Edit Default Template'
  }

  async function loadDefaultCreateTemplateWithFallback() {
    const savedTemplate = await window.api.loadDefaultCreateTemplate()
    if (savedTemplate) return savedTemplate
    return window.api.createPersonTemplate('New Survivor')
  }

  function buildCreateSurvivorPayload() {
    const base = createViewBase || createTemplateDefaults
    if (!base) return null
    const next = deepClone(base)
    next.name = createSurvivorName.value.trim()
    next.gender = createSurvivorGender.value === 'F' ? 'F' : 'M'
    next.philosophy = createSurvivorPhilosophy.value.trim()
    next.philosophyNeurosis = createPhilosophyNeurosis.value.trim()
    next.philosophyNeurosisName = createNeurosisTemplateName.value.trim()
    next.isAlive = createSurvivorAlive.checked
    next.lifetimeReroll = createSurvivorLifetimeReroll.checked
    applyMatchmakerGroup(next, createSurvivorMatchmaker.value)
    applyTinkerGroup(next, createSurvivorTinker.value)
    if (!next.name) return null
    const proficiency = ensureWeaponProficiency(next)
    proficiency.type = createWeaponProficiencyType.value.trim()

    for (const [inputId, config] of Object.entries(createNumericConfig)) {
      const input = document.getElementById(inputId)
      if (!input) continue
      const current = coerceNumber(input.value, coerceNumber(getValueByPath(next, config.field), 0))
      const value =
        config.field === 'weaponProficiency.level'
          ? normalizeProficiencyLevel(current, config.min ?? 0)
          : clamp(current, config.min, config.max)
      setValueByPath(next, config.field, value)
      input.value = String(value)
    }
    syncCreateArraysFromDom()
    next.abilities = deepClone(createArrayState.abilities)
    next.impairments = deepClone(createArrayState.impairments)
    next.fightingArts = deepClone(createArrayState.fightingArts)
    next.secretFightingArts = deepClone(createArrayState.secretFightingArts)
    next.disorders = deepClone(createArrayState.disorders)
    next.tenetKnowledge = deepClone(createArrayState.tenetKnowledge)
    next.knowledge = deepClone(createArrayState.knowledge)
    return next
  }

  async function openSurvivorInCreateView(fileName) {
    const person = await window.api.loadPerson(fileName)
    createViewMode = 'edit'
    createEditingFileName = fileName
    createSurvivorTitle.textContent = 'View Survivor'
    createSurvivorHint.textContent = `Editing ${fileName}. Save to persist updates to settlement.`
    createSurvivorSubmit.textContent = 'Save Survivor'
    renderCreateSurvivorForm(person)
    setPage('create')
  }

  function getNestedValue(target, path) {
    const keys = String(path || '').split('.').filter(Boolean)
    let current = target
    for (const key of keys) {
      if (!current || typeof current !== 'object') return undefined
      current = current[key]
    }
    return current
  }

  function getSettlementSortValue(person, key) {
    if (key === 'canPonder') return canSurvivorPonder(person) ? 1 : 0
    const value = getNestedValue(person, key)
    if (key === 'name' || key === 'philosophy' || key === 'weaponProficiency.type') {
      return String(value || '')
    }
    return coerceNumber(value, 0)
  }

  function renderSettlementSortHeaders() {
    for (const button of settlementSortButtons) {
      const key = button.dataset.sortKey
      const base = button.dataset.baseLabel || button.textContent.replace(/\s*[↑↓]$/, '')
      button.dataset.baseLabel = base
      if (key === settlementSort.key) {
        button.textContent = `${base} ${settlementSort.direction === 'asc' ? '↑' : '↓'}`
      } else {
        button.textContent = base
      }
    }
  }

  function getHiddenSettlementColumns() {
    const hidden = new Set()
    if (!settlementToggleMovement.checked) hidden.add('movement')
    if (!settlementToggleWeaponProficiency.checked) {
      hidden.add('weaponProficiency')
      hidden.add('profRank')
    }
    return hidden
  }

  function applySettlementColumnVisibility(hiddenColumns) {
    for (const headerCell of document.querySelectorAll('.settlement-table thead th[data-settlement-col]')) {
      const column = headerCell.dataset.settlementCol
      headerCell.classList.toggle('settlement-col-hidden', Boolean(column && hiddenColumns.has(column)))
    }
  }

  function getSearchableArrayEntryName(item) {
    if (typeof item === 'string') return item
    if (!item || typeof item !== 'object') return ''
    return String(item.name || '').trim()
  }

  function getSettlementTraitSearchText(person) {
    if (!person || typeof person !== 'object') return ''
    const traitArrays = [
      person.abilities,
      person.impairments,
      person.fightingArts,
      person.secretFightingArts,
      person.disorders,
      person.tenetKnowledge,
      person.knowledge
    ]
    return traitArrays
      .flatMap(entry => (Array.isArray(entry) ? entry : []))
      .map(getSearchableArrayEntryName)
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
  }

  function getFilteredAndSortedSettlementRows() {
    const nameQuery = settlementNameSearch.value.trim().toLowerCase()
    const traitQuery = settlementTraitSearch.value.trim().toLowerCase()
    const filtered = settlementRecords.filter(record => {
      const person = record.person || {}
      if (nameQuery && !String(person.name || '').toLowerCase().includes(nameQuery)) return false
      if (traitQuery && !getSettlementTraitSearchText(person).includes(traitQuery)) return false

      for (const filter of settlementBoolFilters) {
        const expected = filter.value
        if (expected === 'all') continue
        const value =
          filter.dataset.boolFilter === 'canPonder'
            ? canSurvivorPonder(person)
            : Boolean(getNestedValue(person, filter.dataset.boolFilter))
        if (expected === 'yes' && value !== true) return false
        if (expected === 'no' && value !== false) return false
      }

      for (const filter of settlementTriadFilters) {
        const expected = String(filter.value || 'any')
        if (expected === 'any') continue
        const group = filter.dataset.triadFilter
        if (group === 'courageGroup') {
          const current = getSelectedMatchmakerGroup(person)
          if (expected !== current) return false
          continue
        }
        if (group === 'understandingGroup') {
          const current = getSelectedTinkerGroup(person)
          if (expected !== current) return false
        }
      }

      return true
    })

    const { key, direction } = settlementSort
    filtered.sort((a, b) => {
      const left = getSettlementSortValue(a.person || {}, key)
      const right = getSettlementSortValue(b.person || {}, key)
      let result = 0

      if (typeof left === 'string' || typeof right === 'string') {
        result = String(left).localeCompare(String(right))
      } else {
        result = left - right
      }

      return direction === 'asc' ? result : -result
    })

    return filtered
  }

  function renderSettlementTable() {
    renderSettlementSortHeaders()
    const hiddenColumns = getHiddenSettlementColumns()
    applySettlementColumnVisibility(hiddenColumns)
    settlementTableBody.innerHTML = ''
    const aliveCount = settlementRecords.filter(record => Boolean(record?.person?.isAlive)).length
    settlementAliveCount.textContent = `(Alive: ${aliveCount})`

    const rows = getFilteredAndSortedSettlementRows()
    settlementCount.textContent = `${rows.length} of ${settlementRecords.length} survivors shown`

    if (rows.length === 0) {
      const row = document.createElement('tr')
      const cell = document.createElement('td')
      const visibleHeaderCount = document.querySelectorAll('.settlement-table thead th:not(.settlement-col-hidden)').length
      cell.colSpan = Math.max(1, visibleHeaderCount)
      cell.textContent = 'No survivors match the current filters.'
      row.appendChild(cell)
      settlementTableBody.appendChild(row)
      return
    }

    for (const record of rows) {
      const person = record.person || {}
      const proficiency =
        person.weaponProficiency && typeof person.weaponProficiency === 'object'
          ? person.weaponProficiency
          : { type: '', level: 0 }
      const values = [
        { value: person.name || '-', column: '' },
        { value: String(coerceNumber(person.age, 0)), column: '' },
        { value: String(coerceNumber(person.lumi, 0)), column: '' },
        { value: String(coerceNumber(person.survivalPts, 0)), column: '' },
        { value: String(coerceNumber(person.insanityPts, 0)), column: '' },
        { value: person.philosophy || '-', column: '' },
        { value: String(coerceNumber(person.philosophyRank, 0)), column: '' },
        { value: canSurvivorPonder(person) ? 'Ready' : '-', column: '' },
        { value: String(coerceNumber(person.movement, 0)), column: 'movement' },
        { value: String(coerceNumber(person.speed, 0)), column: '' },
        { value: String(coerceNumber(person.accuracy, 0)), column: '' },
        { value: String(coerceNumber(person.strength, 0)), column: '' },
        { value: String(coerceNumber(person.luck, 0)), column: '' },
        { value: String(coerceNumber(person.evasion, 0)), column: '' },
        { value: String(coerceNumber(person.courage, 0)), column: '' },
        { value: String(coerceNumber(person.understanding, 0)), column: '' },
        { value: String(proficiency.type || '-'), column: 'weaponProficiency' },
        { value: String(normalizeProficiencyLevel(proficiency.level, 0)), column: 'profRank' }
      ]

      const row = document.createElement('tr')
      row.dataset.fileName = record.fileName
      for (const entry of values) {
        const cell = document.createElement('td')
        if (entry.column) {
          cell.dataset.settlementCol = entry.column
          cell.classList.toggle('settlement-col-hidden', hiddenColumns.has(entry.column))
        }
        cell.textContent = entry.value
        row.appendChild(cell)
      }

      const actionsCell = document.createElement('td')
      const slotOneButton = document.createElement('button')
      slotOneButton.type = 'button'
      slotOneButton.className = 'btn btn-secondary settlement-slot-btn'
      slotOneButton.textContent = '1'
      slotOneButton.dataset.setShowdownSlot = 'A'
      slotOneButton.dataset.fileName = record.fileName
      const personAlive = Boolean(person.isAlive)
      slotOneButton.disabled = showdownDeparted || !personAlive
      if (showdownDeparted) slotOneButton.title = 'Locked while showdown is departed'
      else if (!personAlive) slotOneButton.title = 'Dead survivors cannot enter showdown'
      if (showdownSelectA.value === record.fileName) {
        slotOneButton.classList.add('is-active')
      }

      const slotTwoButton = document.createElement('button')
      slotTwoButton.type = 'button'
      slotTwoButton.className = 'btn btn-secondary settlement-slot-btn'
      slotTwoButton.textContent = '2'
      slotTwoButton.dataset.setShowdownSlot = 'B'
      slotTwoButton.dataset.fileName = record.fileName
      slotTwoButton.disabled = showdownDeparted || !personAlive
      if (showdownDeparted) slotTwoButton.title = 'Locked while showdown is departed'
      else if (!personAlive) slotTwoButton.title = 'Dead survivors cannot enter showdown'
      if (showdownSelectB.value === record.fileName) {
        slotTwoButton.classList.add('is-active')
      }

      actionsCell.append(slotOneButton, slotTwoButton)
      row.appendChild(actionsCell)
      settlementTableBody.appendChild(row)
    }
  }

  async function applySettlementBulkChange() {
    const field = settlementBulkField.value
    const fieldConfig = BULK_EDIT_FIELD_CONFIG[field]
    if (!fieldConfig) {
      setStatus('Choose a valid field to update', 'error')
      return
    }

    if (settlementRecords.length === 0) {
      setStatus('No survivors available for bulk update', 'error')
      return
    }

    const delta = coerceInt(settlementBulkDelta.value, 0)
    if (delta === 0) {
      setStatus('Delta must be a non-zero integer', 'error')
      return
    }

    const sign = delta > 0 ? `+${delta}` : String(delta)
    const proceed = window.confirm(
      `Apply ${sign} ${fieldConfig.label} to all ${settlementRecords.length} survivors?`
    )
    if (!proceed) return

    let updated = 0
    let unchanged = 0
    let failed = 0

    for (const record of settlementRecords) {
      try {
        const latest = await window.api.loadPerson(record.fileName)
        const current = coerceNumber(latest?.[field], 0)
        const nextValue = clamp(current + delta, fieldConfig.min, fieldConfig.max)
        if (nextValue === current) {
          unchanged += 1
          continue
        }
        latest[field] = nextValue
        const result = await window.api.savePerson(latest, { expectedFileName: record.fileName })
        if (!result || result.ok === false) {
          failed += 1
          continue
        }
        updated += 1
      } catch {
        failed += 1
      }
    }

    await refreshPeople()
    setStatus(
      `Bulk update complete: ${updated} updated, ${unchanged} unchanged, ${failed} failed (${fieldConfig.label} ${sign})`,
      failed > 0 ? 'error' : 'success'
    )
  }

  async function refreshSettlementData(files) {
    if (!hasDataFolder || files.length === 0) {
      settlementRecords = []
      renderSettlementTable()
      return
    }

    const records = await Promise.all(
      files.map(async fileName => {
        try {
          const person = await window.api.loadPerson(fileName)
          return { fileName, person }
        } catch {
          return null
        }
      })
    )

    settlementRecords = records.filter(Boolean)
    populateShowdownSelectors(getAliveShowdownFiles())
    applyShowdownLockSelections()
    renderSettlementTable()
  }

  function showdownListItems(items, emptyText, renderItem) {
    if (!Array.isArray(items) || items.length === 0) {
      return `<ul><li>${emptyText}</li></ul>`
    }
    return `<ul>${items.map((item, index) => renderItem(item, index)).join('')}</ul>`
  }

  function iconLabel(iconId, label) {
    if (!iconId) return label
    return `<span class="icon-label"><svg aria-hidden="true"><use href="#${iconId}"></use></svg>${label}</span>`
  }

  function resetShowdownMarkdownPreviewCache() {
    showdownMarkdownPreviewCache.clear()
    showdownMarkdownIndexCache.clear()
    showdownMarkdownPreviewPending.clear()
  }

  async function ensureShowdownMarkdownIndex(collectionId) {
    if (showdownMarkdownIndexCache.has(collectionId)) {
      return showdownMarkdownIndexCache.get(collectionId)
    }
    const files = await window.api.listMarkdownFiles(collectionId)
    const index = new Map()
    for (const file of files) {
      const key = normalizeMarkdownFileKey(file?.fileName)
      if (!key) continue
      index.set(key, String(file?.preview || '').trim())
    }
    showdownMarkdownIndexCache.set(collectionId, index)
    return index
  }

  function queueShowdownMarkdownPreview(arrayName, fileName) {
    const normalizedFile = normalizeMarkdownFileKey(fileName)
    if (!normalizedFile) return
    const cacheKey = `${arrayName}|${normalizedFile}`
    if (showdownMarkdownPreviewCache.has(cacheKey) || showdownMarkdownPreviewPending.has(cacheKey)) return

    showdownMarkdownPreviewPending.add(cacheKey)
    ;(async () => {
      let preview = ''
      const matchingCollections = markdownCollections.filter(collection => collectionMatchesArray(collection, arrayName))
      for (const collection of matchingCollections) {
        try {
          const index = await ensureShowdownMarkdownIndex(collection.id)
          if (index.has(normalizedFile)) {
            preview = String(index.get(normalizedFile) || '').trim()
            break
          }
        } catch {
          // Ignore lookup errors and continue to other matching collections.
        }
      }
      showdownMarkdownPreviewCache.set(cacheKey, preview)
    })()
      .finally(() => {
        showdownMarkdownPreviewPending.delete(cacheKey)
        if (showdownPeople.A || showdownPeople.B) renderShowdown()
      })
  }

  function getShowdownMarkdownPreview(arrayName, fileName) {
    const normalizedFile = normalizeMarkdownFileKey(fileName)
    if (!normalizedFile) return ''
    const cacheKey = `${arrayName}|${normalizedFile}`
    if (showdownMarkdownPreviewCache.has(cacheKey)) {
      return String(showdownMarkdownPreviewCache.get(cacheKey) || '')
    }
    queueShowdownMarkdownPreview(arrayName, normalizedFile)
    return showdownMarkdownPreviewPending.has(cacheKey) ? 'Loading preview...' : ''
  }

  function buildShowdownProficiencyTypeOptions(currentType) {
    const normalizedCurrent = String(currentType || '').trim()
    const options = [...WEAPON_PROFICIENCY_TYPES]
    if (normalizedCurrent && !options.includes(normalizedCurrent)) options.push(normalizedCurrent)
    return options
      .map(type => {
        const selected = type === normalizedCurrent ? ' selected' : ''
        const label = type || 'None'
        return `<option value="${type}"${selected}>${label}</option>`
      })
      .join('')
  }

  function renderShowdownCard(container, person, slotLabel, fileName) {
    const p = person || {}
    const proficiency = ensureWeaponProficiency(p)
    const slot = slotLabel === 'A' ? 'A' : 'B'
    const armor = showdownArmor[slot]
    const vitalStats = [
      ['age', 'Age', 0, 16, 'icon-vitals'],
      ['survivalPts', 'Survival', 0, null, 'icon-vitals'],
      ['insanityPts', 'Insanity', 0, null, 'icon-vitals'],
      ['systemicPressurePts', 'S. Pressure', 0, null, 'icon-vitals'],
      ['tormentPts', 'Torment', 0, null, 'icon-vitals']
    ]
    const mindHeaderStats = [
      {
        field: 'courage',
        label: 'Courage',
        min: 0,
        max: 9,
        icon: 'icon-mind',
        group: 'courageGroup',
        options: [
          ['none', 'None'],
          ['stalwart', 'Stalwart'],
          ['prepared', 'Prepared'],
          ['matchmaker', 'Matchmaker']
        ],
        selected: getSelectedMatchmakerGroup(p)
      },
      {
        field: 'understanding',
        label: 'Understanding',
        min: 0,
        max: 9,
        icon: 'icon-mind',
        group: 'understandingGroup',
        options: [
          ['none', 'None'],
          ['analyze', 'Analyze'],
          ['explore', 'Explorer'],
          ['tinker', 'Tinker']
        ],
        selected: getSelectedTinkerGroup(p)
      }
    ]
    const combatStats = [
      ['movement', 'Movement', 1, null, 'icon-stats'],
      ['speed', 'Speed', null, null, 'icon-stats'],
      ['accuracy', 'Accuracy', null, null, 'icon-stats'],
      ['strength', 'Strength', null, null, 'icon-stats'],
      ['luck', 'Luck', null, null, 'icon-stats'],
      ['evasion', 'Evasion', null, null, 'icon-stats']
    ]

    syncShowdownTextDraftState(slot, p)
    const activePage = normalizeShowdownPageKey(showdownPageBySlot[slot])
    showdownPageBySlot[slot] = activePage
    const pageDots = SHOWDOWN_PAGE_CONFIG.map(page => {
      const isActive = page.key === activePage
      return `<button type="button" class="showdown-page-dot${isActive ? ' is-active' : ''}" data-showdown-page-slot="${slot}" data-showdown-page="${page.key}" aria-label="${page.label}" title="${page.label}" aria-pressed="${isActive ? 'true' : 'false'}"><span>${page.symbol}</span></button>`
    }).join('')
    const proficiencyLevel = clamp(coerceInt(proficiency.level, 0), 0, 8)

    const renderBaseStepper = ([field, label, min, max, icon]) => {
      const base = coerceNumber(p[field], 0)
      const extraClass = field === 'understanding' ? ' showdown-stepper-understanding' : ''

      return `
      <div class="showdown-stepper showdown-stepper-simple${extraClass}">
        <span class="showdown-stepper-label">${iconLabel(icon, label)}</span>
        <div class="showdown-stepper-controls">
          <button type="button" data-showdown-slot="${slot}" data-showdown-field="${field}" data-showdown-kind="base" data-showdown-delta="-1" data-showdown-min="${
            min ?? ''
          }" data-showdown-max="${max ?? ''}">-</button>
          <strong class="showdown-static-value">${base}</strong>
          <button type="button" data-showdown-slot="${slot}" data-showdown-field="${field}" data-showdown-kind="base" data-showdown-delta="1" data-showdown-min="${
            min ?? ''
          }" data-showdown-max="${max ?? ''}">+</button>
        </div>
      </div>`
    }

    const renderCombatStepper = ([field, label, min, max, icon]) => {
      const base = coerceNumber(p[field], 0)
      const modifier = getShowdownModifier(slot, field)
      const temporary = coerceNumber(modifier.temporary, 0)
      const tokens = coerceNumber(modifier.tokens, 0)
      const total = base + temporary + tokens

      return `
      <div class="showdown-stat-card">
        <div class="showdown-stat-header">
          <div class="showdown-stat-name">${iconLabel(icon, label)}</div>
          <strong class="showdown-stat-total-value">${total}</strong>
        </div>
        <div class="showdown-stat-line">
          <span class="showdown-bucket-label">Base</span>
          <div class="showdown-stepper-controls">
            <button type="button" data-showdown-slot="${slot}" data-showdown-field="${field}" data-showdown-kind="base" data-showdown-delta="-1" data-showdown-min="${
              min ?? ''
            }" data-showdown-max="${max ?? ''}">-</button>
            <strong class="showdown-static-value">${base}</strong>
            <button type="button" data-showdown-slot="${slot}" data-showdown-field="${field}" data-showdown-kind="base" data-showdown-delta="1" data-showdown-min="${
              min ?? ''
            }" data-showdown-max="${max ?? ''}">+</button>
          </div>
        </div>
        <div class="showdown-stat-line showdown-stat-line-pairs">
          <div class="showdown-stat-pair">
            <span class="showdown-bucket-label">Temp</span>
            <div class="showdown-stepper-controls">
              <button type="button" data-showdown-slot="${slot}" data-showdown-field="${field}" data-showdown-kind="temporary" data-showdown-delta="-1">-</button>
              <strong class="showdown-static-value">${temporary}</strong>
              <button type="button" data-showdown-slot="${slot}" data-showdown-field="${field}" data-showdown-kind="temporary" data-showdown-delta="1">+</button>
            </div>
          </div>
          <div class="showdown-stat-pair">
            <span class="showdown-bucket-label">Tokens</span>
            <div class="showdown-stepper-controls">
              <button type="button" data-showdown-slot="${slot}" data-showdown-field="${field}" data-showdown-kind="tokens" data-showdown-delta="-1">-</button>
              <strong class="showdown-static-value">${tokens}</strong>
              <button type="button" data-showdown-slot="${slot}" data-showdown-field="${field}" data-showdown-kind="tokens" data-showdown-delta="1">+</button>
            </div>
          </div>
        </div>
      </div>`
    }

    const renderMindHeaderStepper = ({ field, label, min, max, icon, group, options, selected }) => {
      const base = coerceNumber(p[field], 0)
      return `
      <div class="showdown-stepper showdown-stepper-simple showdown-stepper-header-mind-card">
        <span class="showdown-stepper-label">${iconLabel(icon, label)}</span>
        <div class="showdown-stepper-controls">
          <button type="button" data-showdown-slot="${slot}" data-showdown-field="${field}" data-showdown-kind="base" data-showdown-delta="-1" data-showdown-min="${
            min ?? ''
          }" data-showdown-max="${max ?? ''}">-</button>
          <strong class="showdown-static-value">${base}</strong>
          <button type="button" data-showdown-slot="${slot}" data-showdown-field="${field}" data-showdown-kind="base" data-showdown-delta="1" data-showdown-min="${
            min ?? ''
          }" data-showdown-max="${max ?? ''}">+</button>
        </div>
        <select class="showdown-header-inline-select" data-showdown-group-slot="${slot}" data-showdown-group="${group}" aria-label="${label} ability">
          ${buildShowdownGroupOptions(selected, options)}
        </select>
      </div>`
    }

    container.innerHTML = `
      <div class="showdown-frozen-header">
        <div class="showdown-identity-bar">
          <span class="showdown-identity-name">${p.name || 'Unknown Survivor'}</span>
          <span class="showdown-identity-item">Sex: ${p.gender || 'Unknown'}</span>
          <span class="showdown-identity-item showdown-identity-philosophy">Philosophy: ${p.philosophy || 'No philosophy'}</span>
          <label class="showdown-bool-toggle showdown-bool-toggle-compact">
            <input type="checkbox" data-showdown-bool-slot="${slot}" data-showdown-bool-field="isAlive" ${
              p.isAlive ? 'checked' : ''
            } />
            <span>Alive</span>
          </label>
        </div>
        <section class="showdown-group showdown-group-vitals">
          <h4>${iconLabel('icon-vitals', 'Age / Survival / Insanity')}</h4>
          <div class="showdown-stats showdown-stats-vitals">
            ${vitalStats.map(renderBaseStepper).join('')}
            <div class="showdown-stepper showdown-stepper-simple showdown-stepper-proficiency-type-card">
              <span class="showdown-stepper-label">${iconLabel('icon-stats', 'Weapon Prof')}</span>
              <input type="text" data-showdown-proficiency-slot="${slot}" data-showdown-proficiency-field="type" value="${String(
                proficiency.type || ''
              )}" placeholder="e.g. Sword" />
            </div>
          </div>
          <div class="showdown-stats showdown-stats-vitals showdown-stats-vitals-bleeding">
            <div class="showdown-stepper showdown-stepper-simple showdown-stepper-bleeding">
              <span class="showdown-stepper-label">${iconLabel('icon-bleeding', 'Bleeding Tokens')}</span>
              <div class="showdown-stepper-controls">
                <button type="button" data-showdown-slot="${slot}" data-showdown-part="bleedingTokens" data-showdown-delta="-1">-</button>
                <strong class="showdown-static-value">${Math.max(0, coerceNumber(armor.bleedingTokens, 0))}</strong>
                <button type="button" data-showdown-slot="${slot}" data-showdown-part="bleedingTokens" data-showdown-delta="1">+</button>
              </div>
            </div>
            <div class="showdown-stepper showdown-stepper-simple showdown-stepper-proficiency-level">
              <span class="showdown-stepper-label">${iconLabel('icon-stats', 'Prof Rank')}</span>
              <div class="showdown-stepper-controls">
                <button type="button" data-showdown-proficiency-slot="${slot}" data-showdown-proficiency-field="level" data-showdown-proficiency-delta="-1">-</button>
                <strong class="showdown-static-value">${proficiencyLevel}</strong>
                <button type="button" data-showdown-proficiency-slot="${slot}" data-showdown-proficiency-field="level" data-showdown-proficiency-delta="1">+</button>
              </div>
            </div>
          </div>
          <div class="showdown-stats showdown-stats-mind showdown-stats-header-mind">${mindHeaderStats
            .map(renderMindHeaderStepper)
            .join('')}</div>
        </section>
      </div>
      <div class="showdown-page-nav" role="tablist" aria-label="Showdown survivor pages">${pageDots}</div>

      <section class="showdown-page-panel" data-showdown-page-panel="armor"${activePage === 'armor' ? '' : ' hidden'}>
        <section class="showdown-group">
          <h4>${iconLabel('icon-shield', 'Armor')}</h4>
          <div class="showdown-armor-grid">
            ${[
              ['head', 'Head', 'icon-head'],
              ['body', 'Body', 'icon-body'],
              ['arms', 'Arms', 'icon-arms'],
              ['waist', 'Waist', 'icon-waist'],
              ['legs', 'Legs', 'icon-legs']
            ]
              .map(([part, label, icon]) => {
                const lightKey = `${part}Light`
                const heavyKey = `${part}Heavy`
                const checks =
                  part === 'head'
                    ? `<label class="showdown-armor-check"><input type="checkbox" data-showdown-slot="${slot}" data-showdown-armor-check="${heavyKey}" ${
                        armor[heavyKey] ? 'checked' : ''
                      } />Heavy</label>`
                    : `<label class="showdown-armor-check"><input type="checkbox" data-showdown-slot="${slot}" data-showdown-armor-check="${lightKey}" ${
                        armor[lightKey] ? 'checked' : ''
                      } />Light</label><label class="showdown-armor-check"><input type="checkbox" data-showdown-slot="${slot}" data-showdown-armor-check="${heavyKey}" ${
                        armor[heavyKey] ? 'checked' : ''
                      } />Heavy</label>`
                return `
              <div class="showdown-armor-stepper">
                <span>${iconLabel(icon, label)}</span>
                <button type="button" data-showdown-slot="${slot}" data-showdown-part="${part}" data-showdown-delta="-1">-</button>
                <strong class="showdown-static-value showdown-armor-value">${armor[part]}</strong>
                <button type="button" data-showdown-slot="${slot}" data-showdown-part="${part}" data-showdown-delta="1">+</button>
                <div class="showdown-armor-checks">${checks}</div>
              </div>`
              })
              .join('')}
          </div>
        </section>
      </section>

      <section class="showdown-page-panel" data-showdown-page-panel="stats"${activePage === 'stats' ? '' : ' hidden'}>
        <section class="showdown-group">
          <h4>${iconLabel('icon-stats', 'Stats')}</h4>
          <div class="showdown-stats showdown-stats-combat">${combatStats.map(renderCombatStepper).join('')}</div>
        </section>
      </section>

      <section class="showdown-page-panel" data-showdown-page-panel="arts"${activePage === 'arts' ? '' : ' hidden'}>
        <details class="showdown-toggle" data-showdown-section="fightingArts" open>
        <summary>Fighting Arts (${(p.fightingArts || []).length})</summary>
        <div class="showdown-array-actions">
          <button type="button" class="btn btn-secondary" data-showdown-add-slot="${slot}" data-showdown-add-array="fightingArts">+ Add</button>
        </div>
        ${showdownListItems(
          p.fightingArts,
          'None',
          (item, index) => {
            const preview = getShowdownMarkdownPreview('fightingArts', item?.file || '')
            return `
          <li class="showdown-array-row">
            <div class="showdown-array-copy">
              <button type="button" class="showdown-md-link" data-showdown-md-array="fightingArts" data-showdown-md-file="${item?.file || ''}">${item?.name || 'Unknown'}</button>
              <span>(${item?.file || '-'})</span>
              ${preview ? `<span class="showdown-md-preview">${escapeHtml(preview)}</span>` : ''}
            </div>
            <button type="button" class="btn btn-danger" data-showdown-remove-slot="${slot}" data-showdown-remove-array="fightingArts" data-showdown-remove-index="${index}">Remove</button>
          </li>`
          }
        )}
        </details>
        <details class="showdown-toggle" data-showdown-section="secretFightingArts" open>
        <summary>Secret Fighting Arts (${(p.secretFightingArts || []).length})</summary>
        <div class="showdown-array-actions">
          <button type="button" class="btn btn-secondary" data-showdown-add-slot="${slot}" data-showdown-add-array="secretFightingArts">+ Add</button>
        </div>
        ${showdownListItems(
          p.secretFightingArts,
          'None',
          (item, index) => {
            const preview = getShowdownMarkdownPreview('secretFightingArts', item?.file || '')
            return `
          <li class="showdown-array-row">
            <div class="showdown-array-copy">
              <button type="button" class="showdown-md-link" data-showdown-md-array="secretFightingArts" data-showdown-md-file="${item?.file || ''}">${item?.name || 'Unknown'}</button>
              <span>(${item?.file || '-'})</span>
              ${preview ? `<span class="showdown-md-preview">${escapeHtml(preview)}</span>` : ''}
            </div>
            <button type="button" class="btn btn-danger" data-showdown-remove-slot="${slot}" data-showdown-remove-array="secretFightingArts" data-showdown-remove-index="${index}">Remove</button>
          </li>`
          }
        )}
        </details>
      </section>

      <section class="showdown-page-panel" data-showdown-page-panel="traits"${activePage === 'traits' ? '' : ' hidden'}>
        <details class="showdown-toggle" data-showdown-section="abilities" open>
        <summary>Abilities (${(p.abilities || []).length})</summary>
        <div class="showdown-array-actions">
          <button type="button" class="btn btn-secondary" data-showdown-add-slot="${slot}" data-showdown-add-array="abilities">+ Add New</button>
        </div>
        ${showdownListItems(
          p.abilities,
          'None',
          (_item, index) => `
          <li class="showdown-array-row">
            ${renderShowdownTextEntry(slot, 'abilities', index)}
            <button type="button" class="btn btn-danger" data-showdown-remove-slot="${slot}" data-showdown-remove-array="abilities" data-showdown-remove-index="${index}">Remove</button>
          </li>`
        )}
        </details>
        <details class="showdown-toggle" data-showdown-section="impairments" open>
        <summary>Impairments (${(p.impairments || []).length})</summary>
        <div class="showdown-array-actions">
          <button type="button" class="btn btn-secondary" data-showdown-add-slot="${slot}" data-showdown-add-array="impairments">+ Add New</button>
        </div>
        ${showdownListItems(
          p.impairments,
          'None',
          (_item, index) => `
          <li class="showdown-array-row">
            ${renderShowdownTextEntry(slot, 'impairments', index)}
            <button type="button" class="btn btn-danger" data-showdown-remove-slot="${slot}" data-showdown-remove-array="impairments" data-showdown-remove-index="${index}">Remove</button>
          </li>`
        )}
        </details>
      </section>

      <section class="showdown-page-panel" data-showdown-page-panel="disorders"${activePage === 'disorders' ? '' : ' hidden'}>
        <details class="showdown-toggle" data-showdown-section="disorders" open>
        <summary>Disorders (${(p.disorders || []).length})</summary>
        <div class="showdown-array-actions">
          <button type="button" class="btn btn-secondary" data-showdown-add-slot="${slot}" data-showdown-add-array="disorders">+ Add</button>
        </div>
        ${showdownListItems(
          p.disorders,
          'None',
          (item, index) => {
            const preview = getShowdownMarkdownPreview('disorders', item?.file || '')
            return `
          <li class="showdown-array-row">
            <div class="showdown-array-copy">
              <button type="button" class="showdown-md-link" data-showdown-md-array="disorders" data-showdown-md-file="${item?.file || ''}">${item?.name || 'Unknown'}</button>
              <span>(${item?.file || '-'})</span>
              ${preview ? `<span class="showdown-md-preview">${escapeHtml(preview)}</span>` : ''}
            </div>
            <button type="button" class="btn btn-danger" data-showdown-remove-slot="${slot}" data-showdown-remove-array="disorders" data-showdown-remove-index="${index}">Remove</button>
          </li>`
          }
        )}
        </details>
      </section>

      <section class="showdown-page-panel" data-showdown-page-panel="knowledge"${activePage === 'knowledge' ? '' : ' hidden'}>
        <details class="showdown-toggle" data-showdown-section="tenetKnowledge" open>
        <summary>Tenet Knowledge and Neurosis (${(p.tenetKnowledge || []).length})</summary>
        <div class="showdown-array-actions">
          <button type="button" class="btn btn-secondary" data-showdown-add-slot="${slot}" data-showdown-add-array="tenetKnowledge">+ Add</button>
        </div>
        <div class="showdown-array-neurosis">
          <div class="showdown-proficiency-type">
            <span>Neurosis Name</span>
            <p class="showdown-text-paragraph">${escapeHtml(p.philosophyNeurosisName || '-')}</p>
            <span>Neurosis</span>
            <p class="showdown-text-paragraph">${escapeHtml(p.philosophyNeurosis || '-')}</p>
          </div>
          <div class="showdown-array-actions">
            <button type="button" class="btn btn-secondary" data-showdown-neurosis-load-slot="${slot}">Load Template</button>
            <button type="button" class="btn btn-secondary" data-showdown-neurosis-save-slot="${slot}">Save as Template</button>
          </div>
        </div>
        ${showdownListItems(
          p.tenetKnowledge,
          'None',
          (item, index) => {
            const req = coerceNumber(item?.observationRequirement, 0)
            const current = coerceNumber(item?.currentObservations, coerceNumber(item?.observations, 0))
            const level = Math.max(1, coerceNumber(item?.knowledgeLevel, 1))
            const nextMode = String(item?.nextKnowledgeMode || 'noTemplate')
            const nextTemplate = String(item?.nextKnowledgeTemplate || '').trim()
            const nextDisplay =
              nextMode === 'maxLevel'
                ? 'N/A'
                : nextMode === 'existingTemplate'
                  ? nextTemplate || 'Not selected'
                  : 'Not selected'
            const canUpgrade = current >= req && nextMode !== 'maxLevel'
            return `
          <li class="showdown-array-row">
            <div class="showdown-array-copy">
              <span><strong>${item?.name || 'Unnamed'}</strong> • L${level}</span>
              <span>Observations Required: ${req}</span>
              <span>Next: ${nextDisplay}</span>
              <span>Observation: ${item?.observation || '-'}</span>
              <span>Rules: ${item?.rules || '-'}</span>
            </div>
            <div class="showdown-inline-stepper">
              <span>Current</span>
              <button type="button" data-showdown-obs-slot="${slot}" data-showdown-obs-array="tenetKnowledge" data-showdown-obs-index="${index}" data-showdown-obs-delta="-1">-</button>
              <strong class="showdown-static-value">${coerceNumber(
                item?.currentObservations,
                coerceNumber(item?.observations, 0)
              )}</strong>
              <button type="button" data-showdown-obs-slot="${slot}" data-showdown-obs-array="tenetKnowledge" data-showdown-obs-index="${index}" data-showdown-obs-delta="1">+</button>
            </div>
            ${
              canUpgrade
                ? `<button type="button" class="btn btn-primary" data-showdown-upgrade-slot="${slot}" data-showdown-upgrade-array="tenetKnowledge" data-showdown-upgrade-index="${index}">Upgrade</button>`
                : ''
            }
            <button type="button" class="btn btn-danger" data-showdown-remove-slot="${slot}" data-showdown-remove-array="tenetKnowledge" data-showdown-remove-index="${index}">Remove</button>
          </li>`
          }
        )}
        </details>
        <details class="showdown-toggle" data-showdown-section="knowledge" open>
        <summary>Knowledge (${(p.knowledge || []).length})</summary>
        <div class="showdown-array-actions">
          <button type="button" class="btn btn-secondary" data-showdown-add-slot="${slot}" data-showdown-add-array="knowledge">+ Add</button>
        </div>
        ${showdownListItems(
          p.knowledge,
          'None',
          (item, index) => {
            const req = coerceNumber(item?.observationRequirement, 0)
            const current = coerceNumber(item?.currentObservations, coerceNumber(item?.observations, 0))
            const level = Math.max(1, coerceNumber(item?.knowledgeLevel, 1))
            const nextMode = String(item?.nextKnowledgeMode || 'noTemplate')
            const nextTemplate = String(item?.nextKnowledgeTemplate || '').trim()
            const nextDisplay =
              nextMode === 'maxLevel'
                ? 'N/A'
                : nextMode === 'existingTemplate'
                  ? nextTemplate || 'Not selected'
                  : 'Not selected'
            const canUpgrade = current >= req && nextMode !== 'maxLevel'
            return `
          <li class="showdown-array-row">
            <div class="showdown-array-copy">
              <span><strong>${item?.name || 'Unnamed'}</strong> • L${level}</span>
              <span>Observations Required: ${req}</span>
              <span>Next: ${nextDisplay}</span>
              <span>Observation: ${item?.observation || '-'}</span>
              <span>Rules: ${item?.rules || '-'}</span>
            </div>
            <div class="showdown-inline-stepper">
              <span>Current</span>
              <button type="button" data-showdown-obs-slot="${slot}" data-showdown-obs-array="knowledge" data-showdown-obs-index="${index}" data-showdown-obs-delta="-1">-</button>
              <strong class="showdown-static-value">${coerceNumber(
                item?.currentObservations,
                coerceNumber(item?.observations, 0)
              )}</strong>
              <button type="button" data-showdown-obs-slot="${slot}" data-showdown-obs-array="knowledge" data-showdown-obs-index="${index}" data-showdown-obs-delta="1">+</button>
            </div>
            ${
              canUpgrade
                ? `<button type="button" class="btn btn-primary" data-showdown-upgrade-slot="${slot}" data-showdown-upgrade-array="knowledge" data-showdown-upgrade-index="${index}">Upgrade</button>`
                : ''
            }
            <button type="button" class="btn btn-danger" data-showdown-remove-slot="${slot}" data-showdown-remove-array="knowledge" data-showdown-remove-index="${index}">Remove</button>
          </li>`
          }
        )}
        </details>
      </section>
    `
  }

  function snapshotShowdownAccordionState(container) {
    const state = {}
    for (const details of container.querySelectorAll('details[data-showdown-section]')) {
      const key = details.dataset.showdownSection
      if (!key) continue
      state[key] = details.open
    }
    return state
  }

  function restoreShowdownAccordionState(container, state) {
    if (!state) return
    for (const details of container.querySelectorAll('details[data-showdown-section]')) {
      const key = details.dataset.showdownSection
      if (!key) continue
      if (!Object.prototype.hasOwnProperty.call(state, key)) continue
      details.open = Boolean(state[key])
    }
  }

  function renderShowdown() {
    renderShowdownSlot('A')
    renderShowdownSlot('B')
  }

  function renderShowdownSlot(slot) {
    const normalizedSlot = slot === 'A' ? 'A' : slot === 'B' ? 'B' : null
    if (!normalizedSlot) return
    const container = normalizedSlot === 'A' ? showdownCardA : showdownCardB
    const state = snapshotShowdownAccordionState(container)
    renderShowdownCard(
      container,
      showdownPeople[normalizedSlot]?.person,
      normalizedSlot,
      showdownPeople[normalizedSlot]?.fileName || ''
    )
    restoreShowdownAccordionState(container, state)
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  function syncShowdownTextDraftState(slot, person) {
    if ((slot !== 'A' && slot !== 'B') || !person) return
    if (!showdownTextDraftState[slot]) {
      showdownTextDraftState[slot] = { abilities: [], impairments: [] }
    }
    for (const arrayName of ['abilities', 'impairments']) {
      if (!Array.isArray(person[arrayName])) person[arrayName] = []
      const current = Array.isArray(showdownTextDraftState[slot][arrayName]) ? showdownTextDraftState[slot][arrayName] : []
      showdownTextDraftState[slot][arrayName] = person[arrayName].map((entry, index) => {
        const text = String(entry || '')
        const previous = current[index]
        if (previous && previous.isEditing) {
          return { text, draft: String(previous.draft ?? text), isEditing: true }
        }
        return { text, draft: text, isEditing: false }
      })
    }
  }

  function renderShowdownTextEntry(slot, arrayName, index) {
    const entry = showdownTextDraftState[slot]?.[arrayName]?.[index]
    if (entry?.isEditing) {
      const placeholder = arrayName === 'abilities' ? 'Ability text' : 'Impairment text'
      return '<textarea class="showdown-inline-text" data-showdown-draft-slot="' + slot + '" data-showdown-draft-array="' + arrayName + '" data-showdown-draft-index="' + index + '" placeholder="' + placeholder + '" rows="3">' + escapeHtml(entry.draft) + '</textarea>' +
        '<button type="button" class="btn btn-secondary" data-showdown-commit-slot="' + slot + '" data-showdown-commit-array="' + arrayName + '" data-showdown-commit-index="' + index + '">Save/Commit</button>'
    }
    return '<p class="showdown-text-paragraph">' + escapeHtml(entry?.text || '') + '</p>' +
      '<button type="button" class="btn btn-secondary" data-showdown-edit-slot="' + slot + '" data-showdown-edit-array="' + arrayName + '" data-showdown-edit-index="' + index + '">Edit</button>'
  }

  function addShowdownTextEntry(slot, arrayName) {
    if (!slot || !showdownPeople[slot]) return
    const person = showdownPeople[slot].person
    if (!Array.isArray(person[arrayName])) person[arrayName] = []
    person[arrayName].push('')
    syncShowdownTextDraftState(slot, person)
    const draft = showdownTextDraftState[slot]?.[arrayName]?.[person[arrayName].length - 1]
    if (draft) {
      draft.isEditing = true
      draft.draft = ''
      draft.text = ''
    }
    renderShowdownSlot(slot)
    const label = arrayName === 'abilities' ? 'ability' : 'impairment'
    setStatus('Added ' + label, 'success')
  }

  function editShowdownTextEntry(slot, arrayName, index) {
    if (!slot || !showdownPeople[slot]) return
    syncShowdownTextDraftState(slot, showdownPeople[slot].person)
    const draft = showdownTextDraftState[slot]?.[arrayName]?.[index]
    if (!draft) return
    draft.isEditing = true
    draft.draft = draft.text
    renderShowdownSlot(slot)
  }

  function commitShowdownTextEntry(slot, arrayName, index) {
    if (!slot || !showdownPeople[slot]) return
    const person = showdownPeople[slot].person
    if (!Array.isArray(person[arrayName]) || index < 0 || index >= person[arrayName].length) return
    syncShowdownTextDraftState(slot, person)
    const draft = showdownTextDraftState[slot]?.[arrayName]?.[index]
    if (!draft) return
    const value = String(draft.draft || '').trim()
    if (!value) {
      setStatus('Text cannot be empty. Use Remove to delete the entry.', 'error')
      return
    }
    person[arrayName][index] = value
    draft.text = value
    draft.draft = value
    draft.isEditing = false
    renderShowdownSlot(slot)
  }

  async function saveShowdownSurvivors() {
    if (!showdownPeople.A || !showdownPeople.B) return
    const results = await Promise.all([
      window.api.savePerson(showdownPeople.A.person, { expectedFileName: showdownPeople.A.fileName }),
      window.api.savePerson(showdownPeople.B.person, { expectedFileName: showdownPeople.B.fileName })
    ])
    for (const result of results) {
      if (!result || result.ok === false) {
        throw new Error(result?.message || 'Failed to save survivor while leaving showdown')
      }
    }
  }

  function applyShowdownLockSelections() {
    if (!showdownDeparted) return
    if (showdownLockedSlots.A) showdownSelectA.value = showdownLockedSlots.A
    if (showdownLockedSlots.B) showdownSelectB.value = showdownLockedSlots.B
  }

  function hasShowdownSelectionMismatch() {
    const selectedA = String(showdownSelectA.value || '')
    const selectedB = String(showdownSelectB.value || '')
    return (
      Boolean(showdownPeople.A && showdownPeople.A.fileName !== selectedA) ||
      Boolean(showdownPeople.B && showdownPeople.B.fileName !== selectedB)
    )
  }

  function resetShowdownSlotState(slot) {
    if (slot !== 'A' && slot !== 'B') return
    showdownPageBySlot[slot] = SHOWDOWN_DEFAULT_PAGE
    showdownArmor[slot] = {
      head: 0,
      body: 0,
      arms: 0,
      waist: 0,
      legs: 0,
      bleedingTokens: 0,
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
    showdownModifiers[slot] = {}
    for (const field of SHOWDOWN_FIELDS) {
      showdownModifiers[slot][field] = { temporary: 0, tokens: 0 }
    }
    showdownTextDraftState[slot] = { abilities: [], impairments: [] }
  }

  function reconcileShowdownMemoryForSelectionChange() {
    if (showdownDeparted) return false
    let changed = false
    const selectedA = String(showdownSelectA.value || '')
    const selectedB = String(showdownSelectB.value || '')
    if (showdownPeople.A && showdownPeople.A.fileName !== selectedA) {
      showdownPeople.A = null
      resetShowdownSlotState('A')
      changed = true
    }
    if (showdownPeople.B && showdownPeople.B.fileName !== selectedB) {
      showdownPeople.B = null
      resetShowdownSlotState('B')
      changed = true
    }
    if (changed) renderShowdown()
    return changed
  }

  function resetShowdownSessionState(clearPeople = false, clearSelections = false) {
    showdownDeparted = false
    showdownLockedSlots = { A: '', B: '' }
    showdownPageBySlot = { A: SHOWDOWN_DEFAULT_PAGE, B: SHOWDOWN_DEFAULT_PAGE }
    resetShowdownModifiers()
    showdownArmor = {
      A: {
        head: 0,
        body: 0,
        arms: 0,
        waist: 0,
        legs: 0,
        bleedingTokens: 0,
        headHeavy: false,
        bodyLight: false,
        bodyHeavy: false,
        armsLight: false,
        armsHeavy: false,
        waistLight: false,
        waistHeavy: false,
        legsLight: false,
        legsHeavy: false
      },
      B: {
        head: 0,
        body: 0,
        arms: 0,
        waist: 0,
        legs: 0,
        bleedingTokens: 0,
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
    if (clearPeople) {
      showdownPeople = { A: null, B: null }
      showdownTextDraftState = {
        A: { abilities: [], impairments: [] },
        B: { abilities: [], impairments: [] }
      }
      renderShowdown()
    }
    if (clearSelections) {
      forceShowdownReselection = true
      showdownSelectA.value = ''
      showdownSelectB.value = ''
    }
    syncControlState()
    if (currentPage === 'settlement') renderSettlementTable()
  }

  function departShowdownSession() {
    if (!showdownPeople.A || !showdownPeople.B) {
      setStatus('Open showdown with two survivors first', 'error')
      return
    }
    if (showdownDeparted) {
      setStatus('Showdown is already departed', 'neutral')
      return
    }
    showdownDeparted = true
    showdownLockedSlots = {
      A: showdownPeople.A.fileName || '',
      B: showdownPeople.B.fileName || ''
    }
    applyShowdownLockSelections()
    syncControlState()
    if (currentPage === 'settlement') renderSettlementTable()
    setStatus(
      `Showdown departed. Locked ${showdownPeople.A.person?.name || showdownLockedSlots.A} and ${
        showdownPeople.B.person?.name || showdownLockedSlots.B
      }.`,
      'success'
    )
  }

  async function finalizeShowdownSession() {
    if (!showdownDeparted) {
      setStatus('Departed must be active before ending showdown', 'error')
      return
    }
    const confirmed = window.confirm(
      'Are you sure you want to return? This will save current showdown survivor stats to settlement.'
    )
    if (!confirmed) return
    setStatus('Saving showdown survivors...', 'neutral')
    await saveShowdownSurvivors()
    resetShowdownSessionState(true, true)
    setPage('settlement')
    try {
      await refreshPeople({ silentStatus: true, updateRefreshTimestamp: true })
    } catch {
      // Showdown has already ended and saves completed; settlement auto-refresh will recover.
    }
    setStatus('Showdown over. Survivor records saved.', 'success')
  }

  async function refreshSelectedShowdownSurvivors() {
    if (showdownDeparted) {
      setStatus('Cannot refresh while departed. End showdown first.', 'error')
      return
    }

    const fileA = String(showdownSelectA.value || '')
    const fileB = String(showdownSelectB.value || '')
    if (!fileA || !fileB) {
      setStatus('Select two survivors for showdown', 'error')
      return
    }
    if (fileA === fileB) {
      setStatus('Choose two different survivors for showdown', 'error')
      return
    }

    const [personA, personB] = await Promise.all([window.api.loadPerson(fileA), window.api.loadPerson(fileB)])
    if (!personA?.isAlive || !personB?.isAlive) {
      throw new Error('Only alive survivors can enter showdown')
    }

    showdownPeople.A = { fileName: fileA, person: deepClone(personA) }
    showdownPeople.B = { fileName: fileB, person: deepClone(personB) }
    resetShowdownSlotState('A')
    resetShowdownSlotState('B')
    renderShowdown()
    setStatus('Showdown survivors refreshed from settlement data', 'success')
  }

  async function openShowdownView() {
    if (showdownDeparted && showdownPeople.A && showdownPeople.B) {
      applyShowdownLockSelections()
      renderShowdown()
      setPage('showdown')
      setStatus('Resumed departed showdown session', 'neutral')
      return
    }

    const fileA = showdownSelectA.value
    const fileB = showdownSelectB.value
    if (!fileA || !fileB) {
      setStatus('Select two survivors for showdown', 'error')
      return
    }
    if (fileA === fileB) {
      setStatus('Choose two different survivors for showdown', 'error')
      return
    }

    reconcileShowdownMemoryForSelectionChange()
    const loadTasks = []
    if (!showdownPeople.A || showdownPeople.A.fileName !== fileA) {
      loadTasks.push(
        window.api.loadPerson(fileA).then(person => {
          if (!person?.isAlive) throw new Error('Only alive survivors can enter showdown')
          showdownPeople.A = { fileName: fileA, person: deepClone(person) }
          resetShowdownSlotState('A')
        })
      )
    }
    if (!showdownPeople.B || showdownPeople.B.fileName !== fileB) {
      loadTasks.push(
        window.api.loadPerson(fileB).then(person => {
          if (!person?.isAlive) throw new Error('Only alive survivors can enter showdown')
          showdownPeople.B = { fileName: fileB, person: deepClone(person) }
          resetShowdownSlotState('B')
        })
      )
    }
    if (loadTasks.length > 0) await Promise.all(loadTasks)
    if (!showdownPeople.A || !showdownPeople.B) {
      throw new Error('Failed to load selected survivors for showdown')
    }
    renderShowdown()
    setPage('showdown')
    setStatus(
      `Showdown ready: ${showdownPeople.A.person?.name || fileA} vs ${showdownPeople.B.person?.name || fileB}`,
      'success'
    )
  }

  function showHover(title, preview, x, y) {
    hoverTitle.textContent = title
    hoverPreview.textContent = preview || 'No preview available'
    markdownHover.classList.remove('hidden')
    markdownHover.setAttribute('aria-hidden', 'false')
    markdownHover.style.left = `${x + 14}px`
    markdownHover.style.top = `${y + 14}px`
  }

  function hideHover() {
    markdownHover.classList.add('hidden')
    markdownHover.setAttribute('aria-hidden', 'true')
  }

  function populatePeople(files) {
    peopleList.innerHTML = ''
    peopleCount.textContent = `${files.length} people loaded`
    for (const file of files) {
      const option = document.createElement('option')
      option.value = file
      option.textContent = file
      peopleList.appendChild(option)
    }
    populateShowdownSelectors(files)
    applyShowdownLockSelections()
    syncControlState()
  }

  function getAliveShowdownFiles() {
    return settlementRecords
      .filter(record => Boolean(record?.person?.isAlive))
      .map(record => record.fileName)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
  }

  function populateShowdownSelectors(files) {
    const previousA = showdownSelectA.value
    const previousB = showdownSelectB.value
    showdownSelectA.innerHTML = ''
    showdownSelectB.innerHTML = ''

    for (const file of files) {
      const optionA = document.createElement('option')
      optionA.value = file
      optionA.textContent = file
      showdownSelectA.appendChild(optionA)

      const optionB = document.createElement('option')
      optionB.value = file
      optionB.textContent = file
      showdownSelectB.appendChild(optionB)
    }

    if (files.length === 0) {
      showdownSelectA.value = ''
      showdownSelectB.value = ''
      return
    }

    if (forceShowdownReselection) {
      showdownSelectA.value = ''
      showdownSelectB.value = ''
      return
    }

    showdownSelectA.value = files.includes(previousA) ? previousA : files[0]
    showdownSelectB.value = files.includes(previousB) ? previousB : files[Math.min(1, files.length - 1)]
    ensureDistinctShowdownSelection('A')
  }

  function ensureDistinctShowdownSelection(changed) {
    const options = [...showdownSelectA.options].map(option => option.value)
    if (options.length < 2) return

    if (showdownSelectA.value === showdownSelectB.value) {
      if (changed === 'A') {
        const alternative = options.find(value => value !== showdownSelectA.value)
        if (alternative) showdownSelectB.value = alternative
      } else {
        const alternative = options.find(value => value !== showdownSelectB.value)
        if (alternative) showdownSelectA.value = alternative
      }
    }
  }

  function renderArrayRows(container, items, type) {
    container.innerHTML = ''
    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = '<p class="ve-empty">No entries.</p>'
      return
    }

    items.forEach((item, index) => {
      const row = document.createElement('div')
      const isKnowledgeType = type === 'tenet' || type === 'knowledge'
      const isCreateKnowledgeContainer =
        isKnowledgeType && (container === createTenetKnowledge || container === createKnowledge)
      row.className = isKnowledgeType ? 've-row ve-row-rich' : 've-row'
      if (isCreateKnowledgeContainer) row.classList.add('create-knowledge-row')
      row.dataset.arrayType = type
      row.dataset.index = String(index)

      const nameInput = document.createElement('input')
      nameInput.type = 'text'
      nameInput.placeholder = 'Name'
      nameInput.value = item.name || ''
      nameInput.dataset.field = 'name'
      row.appendChild(nameInput)

      if (isKnowledgeType) {
        const entryType = getKnowledgeEntryTypeFromRowType(type)
        const arrayName = type === 'tenet' ? 'tenetKnowledge' : 'knowledge'
        let upgradeButton = null
        const observationInput = document.createElement('textarea')
        observationInput.placeholder = 'Observation'
        observationInput.value = item.observation || ''
        observationInput.dataset.field = 'observation'
        observationInput.rows = 3
        row.appendChild(observationInput)

        const rulesInput = document.createElement('textarea')
        rulesInput.placeholder = 'Rules'
        rulesInput.value = item.rules || ''
        rulesInput.dataset.field = 'rules'
        rulesInput.rows = 3
        row.appendChild(rulesInput)

        const requirementWrap = document.createElement('label')
        requirementWrap.className = 've-inline-field'
        const requirementLabel = document.createElement('span')
        requirementLabel.className = 've-inline-field-label'
        requirementLabel.textContent = 'Observations Required'
        requirementWrap.appendChild(requirementLabel)
        const requirementInput = document.createElement('input')
        requirementInput.type = 'number'
        requirementInput.value = String(coerceNumber(item.observationRequirement, 0))
        requirementInput.dataset.field = 'observationRequirement'
        requirementWrap.appendChild(requirementInput)
        row.appendChild(requirementWrap)

        const currentWrap = document.createElement('label')
        currentWrap.className = 've-inline-field'
        const currentLabel = document.createElement('span')
        currentLabel.className = 've-inline-field-label'
        currentLabel.textContent = 'Current Observations'
        currentWrap.appendChild(currentLabel)
        const currentInput = document.createElement('input')
        currentInput.type = 'number'
        currentInput.value = String(coerceNumber(item.currentObservations, coerceNumber(item.observations, 0)))
        currentInput.dataset.field = 'currentObservations'
        currentWrap.appendChild(currentInput)
        row.appendChild(currentWrap)

        const levelWrap = document.createElement('label')
        levelWrap.className = 've-inline-field'
        const levelLabel = document.createElement('span')
        levelLabel.className = 've-inline-field-label'
        levelLabel.textContent = 'Knowledge Level'
        levelWrap.appendChild(levelLabel)
        const levelInput = document.createElement('input')
        levelInput.type = 'number'
        levelInput.min = '1'
        levelInput.value = String(Math.max(1, coerceNumber(item.knowledgeLevel, 1)))
        levelInput.dataset.field = 'knowledgeLevel'
        levelWrap.appendChild(levelInput)
        row.appendChild(levelWrap)

        const nextModeSelect = document.createElement('select')
        nextModeSelect.dataset.field = 'nextKnowledgeMode'
        const nextMode = String(item.nextKnowledgeMode || 'noTemplate')
        const nextModeValue =
          nextMode === 'existingTemplate' || nextMode === 'maxLevel' || nextMode === 'noTemplate'
            ? nextMode
            : 'noTemplate'
        ;[
          ['existingTemplate', 'Existing Template'],
          ['noTemplate', 'No Template'],
          ['maxLevel', 'MAX LEVEL']
        ].forEach(([value, label]) => {
          const option = document.createElement('option')
          option.value = value
          option.textContent = label
          if (nextModeValue === value) option.selected = true
          nextModeSelect.appendChild(option)
        })
        row.appendChild(nextModeSelect)

        const nextTemplateSelect = document.createElement('select')
        nextTemplateSelect.dataset.field = 'nextKnowledgeTemplate'
        const currentTemplate = String(item.nextKnowledgeTemplate || '').trim()
        const noneOption = document.createElement('option')
        noneOption.value = ''
        noneOption.textContent = 'Select next template...'
        nextTemplateSelect.appendChild(noneOption)
        for (const template of knowledgeTemplateCache[entryType]) {
          const option = document.createElement('option')
          option.value = template.fileName
          option.textContent = template.name
          if (template.fileName === currentTemplate) option.selected = true
          nextTemplateSelect.appendChild(option)
        }
        if (
          currentTemplate &&
          !knowledgeTemplateCache[entryType].some(template => template.fileName === currentTemplate)
        ) {
          const fallback = document.createElement('option')
          fallback.value = currentTemplate
          fallback.textContent = currentTemplate
          fallback.selected = true
          nextTemplateSelect.appendChild(fallback)
        }
        nextTemplateSelect.disabled = nextModeValue !== 'existingTemplate'
        row.appendChild(nextTemplateSelect)

        if (isCreateKnowledgeContainer) {
          upgradeButton = document.createElement('button')
          upgradeButton.type = 'button'
          upgradeButton.className = 'btn btn-primary'
          upgradeButton.textContent = 'Upgrade'
          upgradeButton.dataset.action = 'upgradeKnowledgeRow'
          upgradeButton.dataset.arrayName = arrayName
          row.appendChild(upgradeButton)
        }

        const syncUpgradeButtonVisibility = () => {
          if (!(upgradeButton instanceof HTMLButtonElement)) return
          const sourceItem = {
            observationRequirement: coerceNumber(requirementInput.value, 0),
            currentObservations: coerceNumber(currentInput.value, 0),
            nextKnowledgeMode: String(nextModeSelect.value || 'noTemplate')
          }
          upgradeButton.classList.toggle('hidden', !canUpgradeKnowledgeEntry(sourceItem))
        }
        syncUpgradeButtonVisibility()
        requirementInput.addEventListener('input', syncUpgradeButtonVisibility)
        currentInput.addEventListener('input', syncUpgradeButtonVisibility)
        nextModeSelect.addEventListener('change', syncUpgradeButtonVisibility)
      } else {
        const fileInput = document.createElement('input')
        fileInput.type = 'text'
        fileInput.placeholder = 'File'
        fileInput.value = item.file || ''
        fileInput.dataset.field = 'file'
        row.appendChild(fileInput)
      }

      const removeButton = document.createElement('button')
      removeButton.type = 'button'
      removeButton.className = 'btn btn-danger'
      removeButton.textContent = 'Remove'
      removeButton.dataset.action = 'removeRow'

      if (isKnowledgeType) {
        const saveTemplateButton = document.createElement('button')
        saveTemplateButton.type = 'button'
        saveTemplateButton.className = 'btn btn-secondary'
        saveTemplateButton.textContent = 'Save Template'
        saveTemplateButton.dataset.action = 'saveTemplate'
        if (isCreateKnowledgeContainer) {
          const actionGroup = document.createElement('div')
          actionGroup.className = 've-row-actions ve-row-actions-knowledge'
          actionGroup.append(saveTemplateButton, removeButton)
          row.appendChild(actionGroup)
        } else {
          row.appendChild(removeButton)
          row.appendChild(saveTemplateButton)
        }
      } else {
        row.appendChild(removeButton)
      }

      container.appendChild(row)
    })
  }

  function renderVisualEditor(person) {
    visualPerson = deepClone(person)
    const proficiency = ensureWeaponProficiency(visualPerson)
    skipVisualSync = true
    resetArmorState()

    veName.value = person.name || ''
    veGender.value = person.gender === 'F' ? 'F' : 'M'
    vePhilosophy.value = person.philosophy || ''
    vePhilosophyNeurosis.value = person.philosophyNeurosis || ''
    veIsAlive.checked = Boolean(person.isAlive)
    veLifetimeReroll.checked = Boolean(person.lifetimeReroll)
    veMatchmaker.value = getSelectedMatchmakerGroup(person)
    veTinker.value = getSelectedTinkerGroup(person)
    veWeaponProficiencyType.value = proficiency.type

    for (const [inputId, config] of Object.entries(numericConfig)) {
      const input = document.getElementById(inputId)
      const current = getValueByPath(visualPerson, config.field)
      const value =
        config.field === 'weaponProficiency.level'
          ? normalizeProficiencyLevel(current, config.min ?? 0)
          : clamp(coerceNumber(current, config.min ?? 0), config.min, config.max)
      input.value = String(value)
    }
    renderAgeBoxes(veAge.value)
    renderPonderIndicator(vePonderIndicator, visualPerson)

    renderArrayRows(veFightingArts, person.fightingArts || [], 'fightingArts')
    renderArrayRows(veSecretFightingArts, person.secretFightingArts || [], 'secretFightingArts')
    renderArrayRows(veDisorders, person.disorders || [], 'disorders')
    renderArrayRows(veTenetKnowledge, person.tenetKnowledge || [], 'tenet')
    renderArrayRows(veKnowledge, person.knowledge || [], 'knowledge')

    skipVisualSync = false
  }

  function syncJsonFromVisual() {
    if (skipVisualSync || !visualPerson) return

    const next = deepClone(visualPerson)
    next.name = veName.value.trim()
    next.gender = veGender.value === 'F' ? 'F' : 'M'
    next.philosophy = vePhilosophy.value.trim()
    next.philosophyNeurosis = vePhilosophyNeurosis.value.trim()
    next.isAlive = veIsAlive.checked
    next.lifetimeReroll = veLifetimeReroll.checked
    applyMatchmakerGroup(next, veMatchmaker.value)
    applyTinkerGroup(next, veTinker.value)
    const proficiency = ensureWeaponProficiency(next)
    proficiency.type = veWeaponProficiencyType.value.trim()

    for (const [inputId, config] of Object.entries(numericConfig)) {
      const input = document.getElementById(inputId)
      const current = coerceNumber(input.value, coerceNumber(getValueByPath(next, config.field), 0))
      const value =
        config.field === 'weaponProficiency.level'
          ? normalizeProficiencyLevel(current, config.min ?? 0)
          : clamp(current, config.min, config.max)
      setValueByPath(next, config.field, value)
      input.value = String(value)
    }
    renderAgeBoxes(veAge.value)

    next.fightingArts = collectVisualRows(veFightingArts, 'fightingArts')
    next.secretFightingArts = collectVisualRows(veSecretFightingArts, 'secretFightingArts')
    next.disorders = collectVisualRows(veDisorders, 'disorders')
    next.tenetKnowledge = collectVisualRows(veTenetKnowledge, 'tenet')
    next.knowledge = collectVisualRows(veKnowledge, 'knowledge')

    visualPerson = next
    renderPonderIndicator(vePonderIndicator, visualPerson)
    personJson.value = JSON.stringify(next, null, 2)
    clearValidationErrors()
  }

  function collectVisualRows(container, type) {
    const rows = [...container.querySelectorAll('.ve-row')]
    return rows
      .map(row => {
        const name = row.querySelector('[data-field="name"]')?.value.trim() || ''
        const file = row.querySelector('[data-field="file"]')?.value.trim() || ''
        const observation = row.querySelector('[data-field="observation"]')?.value.trim() || ''
        const rules = row.querySelector('[data-field="rules"]')?.value.trim() || ''
        const observationRequirement = coerceNumber(
          row.querySelector('[data-field="observationRequirement"]')?.value,
          0
        )
        const currentObservations = coerceNumber(
          row.querySelector('[data-field="currentObservations"]')?.value,
          0
        )
        const knowledgeLevel = Math.max(1, coerceNumber(row.querySelector('[data-field="knowledgeLevel"]')?.value, 1))
        const nextModeRaw = row.querySelector('[data-field="nextKnowledgeMode"]')?.value || 'noTemplate'
        const nextKnowledgeMode =
          nextModeRaw === 'existingTemplate' || nextModeRaw === 'maxLevel' || nextModeRaw === 'noTemplate'
            ? nextModeRaw
            : 'noTemplate'
        const nextKnowledgeTemplate =
          nextKnowledgeMode === 'existingTemplate'
            ? row.querySelector('[data-field="nextKnowledgeTemplate"]')?.value.trim() || ''
            : ''
        if (!name && !file && !observation && !rules) return null
        if (type === 'tenet') {
          return {
            name,
            observation,
            rules,
            observationRequirement: Math.max(0, observationRequirement),
            currentObservations: Math.max(0, currentObservations),
            knowledgeLevel,
            nextKnowledgeMode,
            nextKnowledgeTemplate
          }
        }
        if (type === 'knowledge') {
          return {
            name,
            observation,
            rules,
            observationRequirement: Math.max(0, observationRequirement),
            currentObservations: Math.max(0, currentObservations),
            knowledgeLevel,
            nextKnowledgeMode,
            nextKnowledgeTemplate
          }
        }
        return { name, file }
      })
      .filter(Boolean)
  }

  function removeVisualRow(container, row) {
    if (!visualPerson) return
    const index = Number(row.dataset.index)
    const type = row.dataset.arrayType
    const next = deepClone(visualPerson)

    if (type === 'fightingArts' && Array.isArray(next.fightingArts)) next.fightingArts.splice(index, 1)
    if (type === 'secretFightingArts' && Array.isArray(next.secretFightingArts)) next.secretFightingArts.splice(index, 1)
    if (type === 'disorders' && Array.isArray(next.disorders)) next.disorders.splice(index, 1)
    if (type === 'tenet' && Array.isArray(next.tenetKnowledge)) next.tenetKnowledge.splice(index, 1)
    if (type === 'knowledge' && Array.isArray(next.knowledge)) next.knowledge.splice(index, 1)

    renderVisualEditor(next)
    syncJsonFromVisual()
  }

  function addBlankVisualEntry(type) {
    const parsed = parseEditorJson()
    if (!parsed) return

    if (type === 'tenet') {
      if (!Array.isArray(parsed.tenetKnowledge)) parsed.tenetKnowledge = []
      if (parsed.tenetKnowledge.length >= 1) {
        setStatus('tenetKnowledge can only contain 1 entry', 'error')
        return
      }
      parsed.tenetKnowledge.push({
        name: '',
        observation: '',
        rules: '',
        observationRequirement: 0,
        currentObservations: 0,
        knowledgeLevel: 1,
        nextKnowledgeMode: 'noTemplate',
        nextKnowledgeTemplate: ''
      })
    } else if (type === 'knowledge') {
      if (!Array.isArray(parsed.knowledge)) parsed.knowledge = []
      if (parsed.knowledge.length >= 2) {
        setStatus('knowledge can only contain 2 entries', 'error')
        return
      }
      parsed.knowledge.push({
        name: '',
        observation: '',
        rules: '',
        observationRequirement: 0,
        currentObservations: 0,
        knowledgeLevel: 1,
        nextKnowledgeMode: 'noTemplate',
        nextKnowledgeTemplate: ''
      })
    } else {
      if (type === 'fightingArts' || type === 'secretFightingArts' || type === 'disorders') {
        const fieldName =
          type === 'fightingArts' ? 'fightingArts' : type === 'secretFightingArts' ? 'secretFightingArts' : 'disorders'
        if (!Array.isArray(parsed[fieldName])) parsed[fieldName] = []
        if (parsed[fieldName].length >= 3) {
          setStatus(`${fieldName} can only contain 3 entries`, 'error')
          return
        }
        parsed[fieldName].push({ name: '', file: '' })
      } else {
        return
      }
    }

    personJson.value = JSON.stringify(parsed, null, 2)
    renderVisualEditor(parsed)
    clearValidationErrors()
  }

  function folderInsertMapping(folder) {
    const normalized = String(folder || '').toLowerCase().replace(/\\/g, '/')
    if (normalized.includes('secret_fighting_arts')) {
      return { field: 'secretFightingArts', max: 3, build: doc => ({ name: doc.title, file: doc.fileName }) }
    }
    if (normalized.includes('fighting_arts')) {
      return { field: 'fightingArts', max: 3, build: doc => ({ name: doc.title, file: doc.fileName }) }
    }
    if (normalized.includes('disorders')) {
      return { field: 'disorders', max: 3, build: doc => ({ name: doc.title, file: doc.fileName }) }
    }
    if (normalized.includes('tenets')) {
      return {
        field: 'tenetKnowledge',
        max: 1,
        build: doc => ({
          name: doc.title,
          observation: '',
          rules: '',
          observationRequirement: 0,
          currentObservations: 0,
          knowledgeLevel: 1,
          nextKnowledgeMode: 'noTemplate',
          nextKnowledgeTemplate: '',
          file: doc.fileName
        })
      }
    }
    if (normalized.includes('knowledges')) {
      return {
        field: 'knowledge',
        max: 2,
        build: doc => ({
          name: doc.title,
          observation: '',
          rules: '',
          observationRequirement: 0,
          currentObservations: 0,
          knowledgeLevel: 1,
          nextKnowledgeMode: 'noTemplate',
          nextKnowledgeTemplate: '',
          file: doc.fileName
        })
      }
    }
    return null
  }

  function collectionInsertMapping(collectionId) {
    const category = String(collectionId || '').trim()
    if (category === 'secretFightingArts') {
      return { field: 'secretFightingArts', max: 3, build: doc => ({ name: doc.title, file: doc.fileName }) }
    }
    if (category === 'fightingArts') {
      return { field: 'fightingArts', max: 3, build: doc => ({ name: doc.title, file: doc.fileName }) }
    }
    if (category === 'disorders') {
      return { field: 'disorders', max: 3, build: doc => ({ name: doc.title, file: doc.fileName }) }
    }
    if (category === 'tenetKnowledges') {
      return {
        field: 'tenetKnowledge',
        max: 1,
        build: doc => ({
          name: doc.title,
          observation: '',
          rules: '',
          observationRequirement: 0,
          currentObservations: 0,
          knowledgeLevel: 1,
          nextKnowledgeMode: 'noTemplate',
          nextKnowledgeTemplate: '',
          file: doc.fileName
        })
      }
    }
    if (category === 'knowledges') {
      return {
        field: 'knowledge',
        max: 2,
        build: doc => ({
          name: doc.title,
          observation: '',
          rules: '',
          observationRequirement: 0,
          currentObservations: 0,
          knowledgeLevel: 1,
          nextKnowledgeMode: 'noTemplate',
          nextKnowledgeTemplate: '',
          file: doc.fileName
        })
      }
    }
    return null
  }

  function collectionMatchesArray(collection, arrayName) {
    const category = String(collection?.category || '')
    const folder = String(collection?.folder || '').toLowerCase().replace(/\\/g, '/')
    if (arrayName === 'fightingArts') {
      return category ? category === 'fightingArts' : folder.includes('fighting_arts')
    }
    if (arrayName === 'secretFightingArts') {
      return category ? category === 'secretFightingArts' : folder.includes('secret_fighting_arts')
    }
    if (arrayName === 'disorders') {
      return category ? category === 'disorders' : folder.includes('disorders')
    }
    if (arrayName === 'tenetKnowledge') {
      return category ? category === 'tenetKnowledges' : folder.includes('tenets')
    }
    if (arrayName === 'knowledge') {
      return category ? category === 'knowledges' : folder.includes('knowledges')
    }
    return false
  }

  function buildArrayItemFromMarkdown(file, arrayName) {
    if (arrayName === 'tenetKnowledge') {
      return {
        name: file.title,
        observation: '',
        rules: '',
        observationRequirement: 0,
        currentObservations: 0,
        knowledgeLevel: 1,
        nextKnowledgeMode: 'noTemplate',
        nextKnowledgeTemplate: '',
        file: file.fileName
      }
    }
    if (arrayName === 'knowledge') {
      return {
        name: file.title,
        observation: '',
        rules: '',
        observationRequirement: 0,
        currentObservations: 0,
        knowledgeLevel: 1,
        nextKnowledgeMode: 'noTemplate',
        nextKnowledgeTemplate: '',
        file: file.fileName
      }
    }
    return { name: file.title, file: file.fileName }
  }

  function getArrayLabel(arrayName) {
    if (arrayName === 'fightingArts') return 'Fighting Arts'
    if (arrayName === 'secretFightingArts') return 'Secret Fighting Arts'
    if (arrayName === 'disorders') return 'Disorders'
    if (arrayName === 'tenetKnowledge') return 'Tenet Knowledge'
    if (arrayName === 'knowledge') return 'Knowledge'
    return arrayName
  }

  function renderAddPickerOptions() {
    const query = addMarkdownSearch.value.trim().toLowerCase()
    const files = addPickerState.files.filter(file => {
      if (!query) return true
      return file.title.toLowerCase().includes(query) || (file.preview || '').toLowerCase().includes(query)
    })

    addMarkdownOptions.innerHTML = ''
    if (files.length === 0) {
      addMarkdownOptions.innerHTML = '<p class="md-empty">No options match your filter.</p>'
      return
    }

    for (const file of files) {
      const row = document.createElement('article')
      row.className = 'md-row'

      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'md-open'

      const title = document.createElement('strong')
      title.textContent = file.title
      const preview = document.createElement('span')
      preview.textContent = file.preview || 'No preview available'
      button.append(title, preview)

      button.addEventListener('click', () => {
        if (!addPickerState.arrayName) return
        const arrayName = addPickerState.arrayName
        if (addPickerState.mode === 'showdown') {
          const slot = addPickerState.slot
          if (!slot || !showdownPeople[slot]) return
          const person = showdownPeople[slot].person
          if (!Array.isArray(person[arrayName])) person[arrayName] = []
          if (person[arrayName].length >= 3) {
            setStatus(`${arrayName} can only contain 3 entries`, 'error')
            return
          }
          if (
            person[arrayName].some(
              item => item && normalizeMarkdownFileKey(item.file) === normalizeMarkdownFileKey(file.fileName)
            )
          ) {
            setStatus(`${file.title} is already linked`, 'neutral')
            return
          }

          person[arrayName].push(buildArrayItemFromMarkdown(file, arrayName))
          renderShowdownSlot(slot)
          closeAddPickerModal()
          setStatus(`Added ${file.title} to ${getArrayLabel(arrayName)}`, 'success')
          return
        }

        if (addPickerState.mode === 'create') {
          syncCreateArraysFromDom()
          if (!Array.isArray(createArrayState[arrayName])) createArrayState[arrayName] = []
          if (createArrayState[arrayName].length >= 3) {
            setStatus(`${arrayName} can only contain 3 entries`, 'error')
            return
          }
          if (
            createArrayState[arrayName].some(
              item => item && normalizeMarkdownFileKey(item.file) === normalizeMarkdownFileKey(file.fileName)
            )
          ) {
            setStatus(`${file.title} is already linked`, 'neutral')
            return
          }
          createArrayState[arrayName].push(buildArrayItemFromMarkdown(file, arrayName))
          renderArrayRows(createFightingArts, createArrayState.fightingArts, 'fightingArts')
          renderArrayRows(createSecretFightingArts, createArrayState.secretFightingArts, 'secretFightingArts')
          renderArrayRows(createDisorders, createArrayState.disorders, 'disorders')
          closeAddPickerModal()
          setStatus(`Added ${file.title} to ${getArrayLabel(arrayName)}`, 'success')
          return
        }

        const parsed = parseEditorJson()
        if (!parsed) return
        if (!Array.isArray(parsed[arrayName])) parsed[arrayName] = []
        if (parsed[arrayName].length >= 3) {
          setStatus(`${arrayName} can only contain 3 entries`, 'error')
          return
        }
        if (
          parsed[arrayName].some(
            item => item && normalizeMarkdownFileKey(item.file) === normalizeMarkdownFileKey(file.fileName)
          )
        ) {
          setStatus(`${file.title} is already linked`, 'neutral')
          return
        }

        parsed[arrayName].push(buildArrayItemFromMarkdown(file, arrayName))
        personJson.value = JSON.stringify(parsed, null, 2)
        renderVisualEditor(parsed)
        clearValidationErrors()
        closeAddPickerModal()
        setStatus(`Added ${file.title} to ${getArrayLabel(arrayName)}`, 'success')
      })

      row.appendChild(button)
      addMarkdownOptions.appendChild(row)
    }
  }

  async function loadAddPickerFiles() {
    const collectionId = addMarkdownCollection.value
    addPickerState.files = []
    if (!collectionId) {
      addMarkdownOptions.innerHTML = '<p class="md-empty">No collection selected.</p>'
      return
    }

    addPickerState.files = await window.api.listMarkdownFiles(collectionId)
    renderAddPickerOptions()
  }

  async function openAddPicker(arrayName, mode = 'editor', slot = null) {
    if (mode === 'showdown') {
      if (!slot || !showdownPeople[slot]) return
      const person = showdownPeople[slot].person
      if (!Array.isArray(person[arrayName])) person[arrayName] = []
      if (person[arrayName].length >= 3) {
        setStatus(`${arrayName} can only contain 3 entries`, 'error')
        return
      }
    } else {
      const parsed = parseEditorJson()
      if (!parsed) return
      if (!Array.isArray(parsed[arrayName])) parsed[arrayName] = []
      if (parsed[arrayName].length >= 3) {
        setStatus(`${arrayName} can only contain 3 entries`, 'error')
        return
      }
    }

    addPickerState.arrayName = arrayName
    addPickerState.mode = mode
    addPickerState.slot = slot
    addPickerState.collections = markdownCollections.filter(collection =>
      collectionMatchesArray(collection, arrayName)
    )

    addMarkdownTitle.textContent = `Add ${getArrayLabel(arrayName)} from Library`
    addMarkdownCollection.innerHTML = ''
    addMarkdownSearch.value = ''

    if (addPickerState.collections.length === 0) {
      addMarkdownOptions.innerHTML = '<p class="md-empty">No matching markdown collections available.</p>'
      openAddPickerModal()
      return
    }

    for (const collection of addPickerState.collections) {
      const option = document.createElement('option')
      option.value = collection.id
      option.textContent = `${collection.label} (${collection.count})`
      addMarkdownCollection.appendChild(option)
    }

    await loadAddPickerFiles()
    openAddPickerModal()
  }

  function renderMarkdownList() {
    markdownList.innerHTML = ''
    hideHover()

    const query = markdownSearch.value.trim().toLowerCase()
    const files = markdownFiles.filter(file => {
      if (!query) return true
      return file.title.toLowerCase().includes(query) || (file.preview || '').toLowerCase().includes(query)
    })

    if (files.length === 0) {
      markdownList.innerHTML = '<p class="md-empty">No markdown files match your filter.</p>'
      return
    }

    for (const file of files) {
      const row = document.createElement('article')
      row.className = 'md-row'

      const openButton = document.createElement('button')
      openButton.type = 'button'
      openButton.className = 'md-open'

      const title = document.createElement('strong')
      title.textContent = file.title
      const preview = document.createElement('span')
      preview.textContent = file.preview || 'No preview available'
      openButton.append(title, preview)

      openButton.addEventListener('mouseenter', event => showHover(file.title, file.preview, event.clientX, event.clientY))
      openButton.addEventListener('mousemove', event => showHover(file.title, file.preview, event.clientX, event.clientY))
      openButton.addEventListener('mouseleave', hideHover)
      openButton.addEventListener('click', () => {
        runBusy(async () => {
          const doc = await window.api.loadMarkdownFile(markdownCollection.value, file.fileName)
          currentMarkdownDoc = doc
          markdownModalTitle.textContent = `${doc.title} (${doc.folder})`
          markdownModalBody.innerHTML = doc.html
          insertMarkdownButton.classList.remove('hidden')
          markdownModal.classList.remove('hidden')
          markdownModal.setAttribute('aria-hidden', 'false')
          syncControlState()
          setStatus(`Opened ${doc.title}`, 'neutral')
        }).catch(err => {
          setStatus(err.message || 'Failed to load markdown file', 'error')
        })
      })

      row.appendChild(openButton)
      markdownList.appendChild(row)
    }
  }

  async function refreshPeople(options = {}) {
    const silentStatus = Boolean(options.silentStatus)
    const updateRefreshTimestamp = options.updateRefreshTimestamp !== false
    const files = await window.api.listPeople()
    populatePeople(files)
    await refreshSettlementData(files)
    if (updateRefreshTimestamp) updateSettlementLastRefreshed(new Date())
    if (!silentStatus) setStatus(`Loaded ${files.length} people`, 'success')
  }

  async function refreshMarkdownFiles() {
    const collectionId = markdownCollection.value
    currentMarkdownDoc = null
    markdownFiles = []
    if (!collectionId) {
      markdownList.innerHTML = '<p class="md-empty">No collection selected.</p>'
      syncControlState()
      return
    }

    markdownFiles = await window.api.listMarkdownFiles(collectionId)
    renderMarkdownList()
    syncControlState()
  }

  async function refreshMarkdownCollections() {
    currentMarkdownDoc = null
    markdownFiles = []
    markdownCollection.innerHTML = ''
    markdownCollections = []
    resetShowdownMarkdownPreviewCache()

    const collections = await window.api.listMarkdownCollections()
    markdownCollections = collections
    if (collections.length === 0) {
      const option = document.createElement('option')
      option.value = ''
      option.textContent = 'No markdown collections found'
      markdownCollection.appendChild(option)
      markdownList.innerHTML = '<p class="md-empty">No markdown collections found.</p>'
      syncControlState()
      return
    }

    for (const collection of collections) {
      const option = document.createElement('option')
      option.value = collection.id
      option.textContent = `${collection.label} (${collection.count})`
      markdownCollection.appendChild(option)
    }

    await refreshMarkdownFiles()
    if (showdownPeople.A || showdownPeople.B) renderShowdown()
  }

  function insertCurrentMarkdownReference() {
    if (!currentMarkdownDoc) {
      setStatus('No markdown document selected', 'error')
      return
    }

    const person = parseEditorJson()
    if (!person) return

    const mapping =
      collectionInsertMapping(currentMarkdownDoc.collectionId) || folderInsertMapping(currentMarkdownDoc.folder)
    if (!mapping) {
      setStatus(
        `No insert mapping for collection "${currentMarkdownDoc.collectionId || currentMarkdownDoc.folder}"`,
        'error'
      )
      return
    }

    if (!Array.isArray(person[mapping.field])) person[mapping.field] = []
    if (
      person[mapping.field].some(
        item => item && normalizeMarkdownFileKey(item.file) === normalizeMarkdownFileKey(currentMarkdownDoc.fileName)
      )
    ) {
      setStatus(`${currentMarkdownDoc.title} is already linked`, 'neutral')
      return
    }
    if (person[mapping.field].length >= mapping.max) {
      setStatus(`${mapping.field} already has the maximum of ${mapping.max}`, 'error')
      return
    }

    person[mapping.field].push(mapping.build(currentMarkdownDoc))
    personJson.value = JSON.stringify(person, null, 2)
    renderVisualEditor(person)
    clearValidationErrors()
    setStatus(`Inserted ${currentMarkdownDoc.title} into ${mapping.field}`, 'success')
  }

  async function openMarkdownFromReference(arrayName, fileName) {
    if (!fileName) {
      setStatus('No markdown file linked for this entry', 'error')
      return
    }

    const requestedFile = normalizeMarkdownFileKey(fileName)
    const matchingCollections = markdownCollections.filter(collection =>
      collectionMatchesArray(collection, arrayName)
    )
    for (const collection of matchingCollections) {
      try {
        const doc = await window.api.loadMarkdownFile(collection.id, requestedFile)
        currentMarkdownDoc = doc
        markdownModalTitle.textContent = `${doc.title} (${doc.folder})`
        markdownModalBody.innerHTML = doc.html
        insertMarkdownButton.classList.add('hidden')
        markdownModal.classList.remove('hidden')
        markdownModal.setAttribute('aria-hidden', 'false')
        return
      } catch {
        // Try the next configured category folder for this array type.
      }
    }

    setStatus(`Unable to locate markdown file ${fileName}`, 'error')
  }

  function mutateShowdownStat(slot, field, nextValue, min = null, max = null) {
    if (!showdownPeople[slot]) return
    const person = showdownPeople[slot].person
    person[field] = clamp(coerceNumber(nextValue, 0), min, max)
    renderShowdownSlot(slot)
  }

  function mutateShowdownModifier(slot, field, kind, nextValue) {
    if (!showdownPeople[slot]) return
    if (kind !== 'temporary' && kind !== 'tokens') return
    const modifier = getShowdownModifier(slot, field)
    modifier[kind] = coerceNumber(nextValue, 0)
    renderShowdownSlot(slot)
  }

  function mutateShowdownWeaponProficiency(slot, field, nextValue) {
    if (!showdownPeople[slot]) return
    const person = showdownPeople[slot].person
    const proficiency = ensureWeaponProficiency(person)
    if (field === 'type') {
      proficiency.type = String(nextValue || '').trim()
      renderShowdownSlot(slot)
      return
    }
    if (field === 'level') {
      proficiency.level = clamp(coerceInt(nextValue, 0), 0, 8)
      renderShowdownSlot(slot)
    }
  }

  function removeShowdownArrayItem(slot, arrayName, index) {
    if (!showdownPeople[slot]) return
    const person = showdownPeople[slot].person
    if (!Array.isArray(person[arrayName])) return
    person[arrayName].splice(index, 1)
    if (arrayName === 'abilities' || arrayName === 'impairments') {
      syncShowdownTextDraftState(slot, person)
    }
    renderShowdownSlot(slot)
  }

  function mutateShowdownAbilityGroup(slot, group, value) {
    if (!showdownPeople[slot] || !showdownPeople[slot].person) return
    if (group === 'courageGroup') {
      applyMatchmakerGroup(showdownPeople[slot].person, value)
      renderShowdownSlot(slot)
      return
    }
    if (group === 'understandingGroup') {
      applyTinkerGroup(showdownPeople[slot].person, value)
      renderShowdownSlot(slot)
    }
  }

  function mutateShowdownCurrentObservations(slot, arrayName, index, nextValue) {
    if (!showdownPeople[slot]) return
    const person = showdownPeople[slot].person
    if (!Array.isArray(person[arrayName])) return
    if (index < 0 || index >= person[arrayName].length) return
    person[arrayName][index].currentObservations = Math.max(0, coerceNumber(nextValue, 0))
    renderShowdownSlot(slot)
  }

  async function init() {
    await runBusy(async () => {
      settingsFastMode.checked = settlementFastMode
      settlementAutoRefreshEnabled.checked = settlementAutoRefreshOn
      settlementAutoRefreshInterval.value = String(settlementAutoRefreshIntervalSeconds)
      updateSettlementLastRefreshed(null)
      dataSources = { ...dataSources, ...(await window.api.getSavedDataSources()) }
      renderDataSources()

      if (hasDataFolder) {
        hasDataFolder = true
        await refreshPeople({ updateRefreshTimestamp: true })
      } else {
        hasDataFolder = false
        peopleCount.textContent = '0 people loaded'
        settlementRecords = []
        renderSettlementTable()
        updateSettlementLastRefreshed(null)
        setStatus('Select a survivors folder to begin', 'neutral')
      }

      const template = await loadDefaultCreateTemplateWithFallback()
      createTemplateDefaults = deepClone(template)
      personJson.value = JSON.stringify(template, null, 2)
      renderVisualEditor(template)
      renderCreateSurvivorForm(template)
      await refreshMarkdownCollections()
      await refreshKnowledgeTemplateCache()
      syncSettlementAutoRefresh()
    }).catch(err => {
      console.error('Failed to initialize app state:', err)
      setStatus('Failed to initialize app state', 'error')
    })
  }

  async function pickDataSourceFolder(sourceKey) {
    const result = await window.api.selectDataSourceFolder(sourceKey)
    if (!result || !result.dataSources) return
    dataSources = { ...dataSources, ...result.dataSources }
    renderDataSources()
    if (sourceKey === 'survivors') {
      if (hasDataFolder) {
        await refreshPeople({ updateRefreshTimestamp: true })
        await refreshKnowledgeTemplateCache()
      } else {
        peopleCount.textContent = '0 people loaded'
        settlementRecords = []
        renderSettlementTable()
        updateSettlementLastRefreshed(null)
      }
    }
    await refreshMarkdownCollections()
    syncSettlementAutoRefresh()
    setStatus(`${sourceKey} folder updated`, 'success')
  }

  for (const sourceKey of DATA_SOURCE_KEYS) {
    const button = dataSourceButtons[sourceKey]
    if (!button) continue
    button.addEventListener('click', () => {
      runBusy(() => pickDataSourceFolder(sourceKey)).catch(err => {
        setStatus(err.message || 'Folder selection failed', 'error')
      })
    })
  }

  refreshPeopleButton.addEventListener('click', () => {
    runBusy(refreshPeople).catch(err => {
      setStatus(err.message || 'Failed to load people', 'error')
    })
  })

  refreshMarkdownButton.addEventListener('click', () => {
    runBusy(refreshMarkdownCollections).catch(err => {
      setStatus(err.message || 'Failed to refresh markdown library', 'error')
    })
  })

  markdownCollection.addEventListener('change', () => {
    runBusy(refreshMarkdownFiles).catch(err => {
      setStatus(err.message || 'Failed to load markdown files', 'error')
    })
  })

  markdownSearch.addEventListener('input', renderMarkdownList)
  settlementNameSearch.addEventListener('input', renderSettlementTable)
  settlementTraitSearch.addEventListener('input', renderSettlementTable)
  settlementToggleMovement.addEventListener('change', renderSettlementTable)
  settlementToggleWeaponProficiency.addEventListener('change', renderSettlementTable)
  settingsFastMode.addEventListener('change', () => {
    settlementFastMode = Boolean(settingsFastMode.checked)
    syncSettlementAutoRefresh()
    syncControlState()
  })
  settlementAutoRefreshEnabled.addEventListener('change', () => {
    settlementAutoRefreshOn = Boolean(settlementAutoRefreshEnabled.checked)
    syncSettlementAutoRefresh()
    syncControlState()
  })
  settlementAutoRefreshInterval.addEventListener('change', () => {
    settlementAutoRefreshIntervalSeconds = clamp(coerceNumber(settlementAutoRefreshInterval.value, 10), 3, 120)
    syncSettlementAutoRefresh()
    syncControlState()
  })
  settlementRefreshNow.addEventListener('click', () => {
    runBusy(async () => {
      await refreshPeople({ updateRefreshTimestamp: true })
      setStatus('Settlement refreshed', 'success')
    }).catch(err => {
      setStatus(err.message || 'Failed to refresh settlement data', 'error')
    })
  })
  document.addEventListener('visibilitychange', () => {
    syncSettlementAutoRefresh()
  })
  window.addEventListener('focus', () => {
    syncSettlementAutoRefresh()
  })
  window.addEventListener('blur', () => {
    syncSettlementAutoRefresh()
  })
  settlementTableBody.addEventListener('click', event => {
    const rawTarget = event.target
    if (!(rawTarget instanceof HTMLElement)) return
    const target = rawTarget.closest('button[data-set-showdown-slot]')
    if (!(target instanceof HTMLElement)) {
      const row = rawTarget.closest('tr[data-file-name]')
      if (!(row instanceof HTMLElement)) return
      const fileName = row.dataset.fileName
      if (!fileName) return
      runBusy(() => openSurvivorInCreateView(fileName)).catch(err => {
        setStatus(err.message || 'Failed to open survivor view', 'error')
      })
      return
    }

    const slot = target.dataset.setShowdownSlot
    const fileName = target.dataset.fileName
    if (!slot || !fileName) return
    if (showdownDeparted) {
      setStatus('Cannot change showdown slots while departed. End showdown first.', 'error')
      return
    }
    const selectedRecord = settlementRecords.find(record => record.fileName === fileName)
    if (selectedRecord && !selectedRecord.person?.isAlive) {
      setStatus('Dead survivors cannot enter showdown', 'error')
      return
    }

    const currentA = showdownSelectA.value
    const currentB = showdownSelectB.value

    if (slot === 'A') {
      const shouldSwap = fileName === currentB && currentA && currentA !== fileName
      showdownSelectA.value = fileName
      if (shouldSwap) {
        showdownSelectB.value = currentA
      } else {
        ensureDistinctShowdownSelection('A')
      }
    } else {
      const shouldSwap = fileName === currentA && currentB && currentB !== fileName
      showdownSelectB.value = fileName
      if (shouldSwap) {
        showdownSelectA.value = currentB
      } else {
        ensureDistinctShowdownSelection('B')
      }
    }
    if (forceShowdownReselection) forceShowdownReselection = false
    reconcileShowdownMemoryForSelectionChange()
    syncControlState()
    renderSettlementTable()
    setStatus(`Assigned ${fileName} to Survivor ${slot}`, 'success')
  })
  settlementClearFiltersButton.addEventListener('click', () => {
    settlementNameSearch.value = ''
    settlementTraitSearch.value = ''
    for (const filter of settlementBoolFilters) {
      filter.value = filter.dataset.boolFilter === 'isAlive' ? 'yes' : 'all'
    }
    for (const filter of settlementTriadFilters) {
      filter.value = 'any'
    }
    renderSettlementTable()
  })
  settlementApplyBulkButton.addEventListener('click', () => {
    runBusy(applySettlementBulkChange).catch(err => {
      setStatus(err.message || 'Failed to apply bulk update', 'error')
    })
  })
  for (const filter of settlementBoolFilters) {
    filter.addEventListener('change', renderSettlementTable)
  }
  for (const filter of settlementTriadFilters) {
    filter.addEventListener('change', renderSettlementTable)
  }
  for (const button of settlementSortButtons) {
    button.addEventListener('click', () => {
      const key = button.dataset.sortKey
      if (!key) return
      if (settlementSort.key === key) {
        settlementSort.direction = settlementSort.direction === 'asc' ? 'desc' : 'asc'
      } else {
        settlementSort = { key, direction: 'desc' }
      }
      renderSettlementTable()
    })
  }
  showdownSelectA.addEventListener('change', () => {
    if (showdownDeparted) {
      applyShowdownLockSelections()
      setStatus('Showdown slots are locked while departed', 'neutral')
    }
    if (forceShowdownReselection) forceShowdownReselection = false
    ensureDistinctShowdownSelection('A')
    reconcileShowdownMemoryForSelectionChange()
    syncControlState()
    if (currentPage === 'settlement') renderSettlementTable()
  })
  showdownSelectB.addEventListener('change', () => {
    if (showdownDeparted) {
      applyShowdownLockSelections()
      setStatus('Showdown slots are locked while departed', 'neutral')
    }
    if (forceShowdownReselection) forceShowdownReselection = false
    ensureDistinctShowdownSelection('B')
    reconcileShowdownMemoryForSelectionChange()
    syncControlState()
    if (currentPage === 'settlement') renderSettlementTable()
  })
  openShowdownButton.addEventListener('click', () => {
    runBusy(openShowdownView).catch(err => {
      setStatus(err.message || 'Failed to open showdown view', 'error')
    })
  })
  navShowdownButton.addEventListener('click', () => {
    if (currentPage === 'showdown') return
    runBusy(async () => {
      if (showdownPeople.A && showdownPeople.B && !hasShowdownSelectionMismatch()) {
        setPage('showdown')
        renderShowdown()
        syncControlState()
        setStatus(
          showdownDeparted ? 'Resumed departed showdown session' : 'Resumed in-memory showdown session',
          'neutral'
        )
        return
      }
      reconcileShowdownMemoryForSelectionChange()
      await openShowdownView()
    }).catch(err => {
      setStatus(err.message || 'Failed to open showdown view', 'error')
    })
  })
  navDataSourcesButton.addEventListener('click', () => {
    if (currentPage === 'dataSources') return
    setPage('dataSources')
  })
  navCreateButton.addEventListener('click', () => {
    if (currentPage === 'create') return
    runBusy(async () => {
      createViewMode = 'create'
      if (inShowdownMode) {
        setStatus('Showdown session kept active while in Create Survivor view.', 'neutral')
      }
      if (!createTemplateDefaults) await resetCreateSurvivorForm()
      else {
        createEditingFileName = null
        applyCreateViewModeUi()
        renderCreateSurvivorForm(createTemplateDefaults)
      }
      setPage('create')
    }).catch(err => {
      setStatus(err.message || 'Failed to open create survivor view', 'error')
    })
  })
  const openDefaultTemplateEditor = () => {
    if (currentPage === 'defaultTemplate') return Promise.resolve()
    runBusy(async () => {
      createViewMode = 'defaultTemplate'
      createEditingFileName = null
      const template = await loadDefaultCreateTemplateWithFallback()
      createTemplateDefaults = deepClone(template)
      applyCreateViewModeUi()
      renderCreateSurvivorForm(template)
      setPage('defaultTemplate')
      setStatus('Editing default new survivor template', 'neutral')
    }).catch(err => {
      setStatus(err.message || 'Failed to open default template view', 'error')
    })
  }
  createOpenDefaultTemplate.addEventListener('click', () => {
    openDefaultTemplateEditor()
  })
  navSettlementButton.addEventListener('click', () => {
    if (currentPage === 'settlement') return
    runBusy(async () => {
      if (inShowdownMode) {
        setStatus('Showdown session kept active while in Settlement view.', 'neutral')
      }
      setPage('settlement')
    }).catch(err => {
      setStatus(err.message || 'Failed to open settlement view', 'error')
    })
  })
  navBulkUpdatesButton.addEventListener('click', () => {
    if (currentPage === 'bulkUpdates') return
    runBusy(async () => {
      if (inShowdownMode) {
        setStatus('Showdown session kept active while in Bulk Updates view.', 'neutral')
      }
      setPage('bulkUpdates')
    }).catch(err => {
      setStatus(err.message || 'Failed to open bulk updates view', 'error')
    })
  })
  navTechnicalButton.addEventListener('click', () => {
    if (currentPage === 'technical') return
    runBusy(async () => {
      if (inShowdownMode) {
        setStatus('Showdown session kept active while in Technical view.', 'neutral')
      }
      setPage('technical')
    }).catch(err => {
      setStatus(err.message || 'Failed to open technical view', 'error')
    })
  })
  themeToggleButton.addEventListener('click', () => {
    applyTheme(currentTheme === 'light' ? 'dark' : 'light')
  })
  showdownView.addEventListener('click', event => {
    const rawTarget = event.target
    const target =
      rawTarget instanceof HTMLElement
        ? rawTarget
        : rawTarget && rawTarget.parentElement instanceof HTMLElement
          ? rawTarget.parentElement
          : null
    if (!(target instanceof HTMLElement)) return

    const pageButton = target.closest('button[data-showdown-page-slot][data-showdown-page]')
    if (pageButton instanceof HTMLButtonElement) {
      const slot = pageButton.dataset.showdownPageSlot
      const page = pageButton.dataset.showdownPage
      if ((slot === 'A' || slot === 'B') && page) {
        showdownPageBySlot[slot] = normalizeShowdownPageKey(page)
        renderShowdownSlot(slot)
      }
      return
    }

    if (target.dataset.showdownAddSlot && target.dataset.showdownAddArray) {
      const slot = target.dataset.showdownAddSlot
      const arrayName = target.dataset.showdownAddArray
      if (!slot || !arrayName || !showdownPeople[slot]) return

      if (arrayName === 'abilities' || arrayName === 'impairments') {
        addShowdownTextEntry(slot, arrayName)
        return
      }

      if (arrayName === 'tenetKnowledge') {
        runBusy(() => openKnowledgeTemplatePicker({ arrayName, mode: 'showdown', slot })).catch(err => {
          setStatus(err.message || 'Failed to open tenet knowledge options', 'error')
        })
        return
      }

      if (arrayName === 'knowledge') {
        runBusy(() => openKnowledgeTemplatePicker({ arrayName, mode: 'showdown', slot })).catch(err => {
          setStatus(err.message || 'Failed to open knowledge options', 'error')
        })
        return
      }

      runBusy(() => openAddPicker(arrayName, 'showdown', slot)).catch(err => {
        setStatus(err.message || 'Failed to open showdown add picker', 'error')
      })
      return
    }

    if (target.dataset.showdownNeurosisLoadSlot) {
      const slot = target.dataset.showdownNeurosisLoadSlot
      if (!slot || !showdownPeople[slot]) return
      runBusy(() => applyShowdownNeurosisTemplate(slot)).catch(err => {
        setStatus(err.message || 'Failed to load neurosis template', 'error')
      })
      return
    }

    if (target.dataset.showdownNeurosisSaveSlot) {
      const slot = target.dataset.showdownNeurosisSaveSlot
      if (!slot || !showdownPeople[slot]) return
      runBusy(() => saveShowdownNeurosisTemplate(slot)).catch(err => {
        setStatus(err.message || 'Failed to save neurosis template', 'error')
      })
      return
    }

    if (target.dataset.showdownRemoveSlot && target.dataset.showdownRemoveArray) {
      const slot = target.dataset.showdownRemoveSlot
      const arrayName = target.dataset.showdownRemoveArray
      const index = Number(target.dataset.showdownRemoveIndex)
      removeShowdownArrayItem(slot, arrayName, index)
      return
    }

    if (target.dataset.showdownEditSlot && target.dataset.showdownEditArray) {
      const slot = target.dataset.showdownEditSlot
      const arrayName = target.dataset.showdownEditArray
      const index = Number(target.dataset.showdownEditIndex)
      if (!slot || (arrayName !== 'abilities' && arrayName !== 'impairments') || Number.isNaN(index)) return
      editShowdownTextEntry(slot, arrayName, index)
      return
    }

    if (target.dataset.showdownCommitSlot && target.dataset.showdownCommitArray) {
      const slot = target.dataset.showdownCommitSlot
      const arrayName = target.dataset.showdownCommitArray
      const index = Number(target.dataset.showdownCommitIndex)
      if (!slot || (arrayName !== 'abilities' && arrayName !== 'impairments') || Number.isNaN(index)) return
      commitShowdownTextEntry(slot, arrayName, index)
      return
    }

    if (target.dataset.showdownMdArray) {
      runBusy(() => openMarkdownFromReference(target.dataset.showdownMdArray, target.dataset.showdownMdFile)).catch(
        err => {
          setStatus(err.message || 'Failed to load markdown reference', 'error')
        }
      )
      return
    }

    if (
      target.dataset.showdownSaveTemplateSlot &&
      target.dataset.showdownSaveTemplateArray &&
      target.dataset.showdownSaveTemplateIndex
    ) {
      const slot = target.dataset.showdownSaveTemplateSlot
      const arrayName = target.dataset.showdownSaveTemplateArray
      const index = Number(target.dataset.showdownSaveTemplateIndex)
      const type = getKnowledgeTypeFromArrayName(arrayName)
      if (!slot || !type || Number.isNaN(index) || !showdownPeople[slot]) return
      const entries = showdownPeople[slot].person?.[arrayName]
      if (!Array.isArray(entries) || !entries[index]) return
      const template = normalizeKnowledgeTemplateForEntry(type, entries[index])
      runBusy(async () => {
        await window.api.saveKnowledgeTemplate(type, template)
        await refreshKnowledgeTemplateCache(type)
        setStatus(`Saved ${template.name || 'entry'} as reusable template`, 'success')
      }).catch(err => {
        setStatus(err.message || 'Failed to save knowledge template', 'error')
      })
      return
    }

    if (target.dataset.showdownUpgradeSlot && target.dataset.showdownUpgradeArray) {
      const slot = target.dataset.showdownUpgradeSlot
      const arrayName = target.dataset.showdownUpgradeArray
      const index = Number(target.dataset.showdownUpgradeIndex)
      const type = getKnowledgeTypeFromArrayName(arrayName)
      if (!slot || !type || Number.isNaN(index) || !showdownPeople[slot]) return
      const entries = showdownPeople[slot].person?.[arrayName]
      if (!Array.isArray(entries) || !entries[index]) return
      const sourceItem = entries[index]
      const nextMode = String(sourceItem.nextKnowledgeMode || 'noTemplate')

      runBusy(async () => {
        if (nextMode === 'maxLevel') {
          setStatus('This entry is already set to MAX LEVEL', 'neutral')
          return
        }
        if (nextMode === 'existingTemplate' && sourceItem.nextKnowledgeTemplate) {
          await refreshKnowledgeTemplateCache(type)
          const selected = knowledgeTemplateCache[type].find(
            template => template.fileName === sourceItem.nextKnowledgeTemplate
          )
          if (selected) {
            const upgraded = normalizeKnowledgeTemplateForEntry(type, selected.template)
            upgraded.knowledgeLevel = Math.max(
              Math.max(1, coerceNumber(sourceItem.knowledgeLevel, 1)) + 1,
              coerceNumber(upgraded.knowledgeLevel, 1)
            )
            replaceKnowledgeEntryInShowdown(slot, arrayName, index, upgraded)
            setStatus(`Upgraded ${sourceItem.name || 'knowledge'} from next template`, 'success')
            return
          }
        }

        await openKnowledgeTemplatePicker({
          arrayName,
          mode: 'showdown',
          slot,
          action: 'upgrade',
          index,
          sourceItem,
          forceTemplateOnly: nextMode === 'existingTemplate',
          forceScratchOnly: nextMode === 'noTemplate'
        })
      }).catch(err => {
        setStatus(err.message || 'Failed to upgrade knowledge', 'error')
      })
      return
    }

    if (target.dataset.showdownObsSlot && target.dataset.showdownObsArray && target.dataset.showdownObsDelta) {
      const slot = target.dataset.showdownObsSlot
      const arrayName = target.dataset.showdownObsArray
      const index = Number(target.dataset.showdownObsIndex)
      if (!slot || !arrayName || Number.isNaN(index)) return
      const entries = showdownPeople[slot]?.person?.[arrayName]
      if (!Array.isArray(entries) || !entries[index]) return
      const current = coerceNumber(entries[index].currentObservations, coerceNumber(entries[index].observations, 0))
      const delta = coerceNumber(target.dataset.showdownObsDelta, 0)
      mutateShowdownCurrentObservations(slot, arrayName, index, current + delta)
      return
    }

    if (target.dataset.showdownProficiencySlot && target.dataset.showdownProficiencyDelta) {
      const slot = target.dataset.showdownProficiencySlot
      const field = target.dataset.showdownProficiencyField
      if (!slot || field !== 'level') return
      if (!showdownPeople[slot]) return
      const current = coerceNumber(showdownPeople[slot].person?.weaponProficiency?.level, 0)
      const delta = coerceNumber(target.dataset.showdownProficiencyDelta, 0)
      mutateShowdownWeaponProficiency(slot, field, current + delta)
      return
    }

    if (target.dataset.showdownField) {
      const slot = target.dataset.showdownSlot
      const field = target.dataset.showdownField
      const kind = target.dataset.showdownKind || 'base'
      const delta = coerceNumber(target.dataset.showdownDelta, 0)
      if (kind === 'base') {
        if (!showdownPeople[slot]) return
        const current = coerceNumber(showdownPeople[slot].person[field], 0)
        const min = target.dataset.showdownMin === '' ? null : coerceNumber(target.dataset.showdownMin, null)
        const max = target.dataset.showdownMax === '' ? null : coerceNumber(target.dataset.showdownMax, null)
        mutateShowdownStat(slot, field, current + delta, min, max)
      } else {
        const current = coerceNumber(getShowdownModifier(slot, field)[kind], 0)
        mutateShowdownModifier(slot, field, kind, current + delta)
      }
      return
    }

    if (!target.dataset.showdownSlot || !target.dataset.showdownPart || !target.dataset.showdownDelta) return

    const slot = target.dataset.showdownSlot
    const part = target.dataset.showdownPart
    const delta = coerceNumber(target.dataset.showdownDelta, 0)
    if (!showdownArmor[slot] || !Object.prototype.hasOwnProperty.call(showdownArmor[slot], part)) return

    showdownArmor[slot][part] = Math.max(0, coerceNumber(showdownArmor[slot][part], 0) + delta)
    renderShowdownSlot(slot)
    return
  })

  showdownView.addEventListener('input', event => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    if (target.dataset.showdownDraftSlot && target.dataset.showdownDraftArray) {
      if (!(target instanceof HTMLTextAreaElement)) return
      const slot = target.dataset.showdownDraftSlot
      const arrayName = target.dataset.showdownDraftArray
      const index = Number(target.dataset.showdownDraftIndex)
      if (!slot || (arrayName !== 'abilities' && arrayName !== 'impairments') || Number.isNaN(index)) return
      if (!showdownPeople[slot]) return
      syncShowdownTextDraftState(slot, showdownPeople[slot].person)
      const draft = showdownTextDraftState[slot]?.[arrayName]?.[index]
      if (!draft) return
      draft.draft = target.value
      return
    }
    if (target.tagName !== 'INPUT') return
    if (target.dataset.showdownProficiencySlot && target.dataset.showdownProficiencyField) {
      const slot = target.dataset.showdownProficiencySlot
      const field = target.dataset.showdownProficiencyField
      if (!slot || !field) return
      mutateShowdownWeaponProficiency(slot, field, target.value)
      return
    }
    if (target.dataset.showdownField) {
      const slot = target.dataset.showdownSlot
      const field = target.dataset.showdownField
      const kind = target.dataset.showdownKind || 'base'
      if (kind === 'base') {
        const min = target.dataset.showdownMin === '' ? null : coerceNumber(target.dataset.showdownMin, null)
        const max = target.dataset.showdownMax === '' ? null : coerceNumber(target.dataset.showdownMax, null)
        mutateShowdownStat(slot, field, target.value, min, max)
      } else {
        mutateShowdownModifier(slot, field, kind, target.value)
      }
      return
    }
    if (target.dataset.showdownObsSlot && target.dataset.showdownObsArray && target.dataset.showdownObsInput) {
      const slot = target.dataset.showdownObsSlot
      const arrayName = target.dataset.showdownObsArray
      const index = Number(target.dataset.showdownObsIndex)
      if (!slot || !arrayName || Number.isNaN(index)) return
      mutateShowdownCurrentObservations(slot, arrayName, index, target.value)
      return
    }
    const slot = target.dataset.showdownSlot
    const part = target.dataset.showdownPart
    if (!slot || !part || !showdownArmor[slot] || !Object.prototype.hasOwnProperty.call(showdownArmor[slot], part)) {
      return
    }
    showdownArmor[slot][part] = Math.max(0, coerceNumber(target.value, 0))
    target.value = String(showdownArmor[slot][part])
  })

  showdownView.addEventListener('change', event => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    if (target instanceof HTMLInputElement && target.dataset.showdownBoolSlot && target.dataset.showdownBoolField) {
      const slot = target.dataset.showdownBoolSlot
      const field = target.dataset.showdownBoolField
      if (!slot || field !== 'isAlive' || !showdownPeople[slot]) return
      showdownPeople[slot].person.isAlive = Boolean(target.checked)
      return
    }
    if (target instanceof HTMLInputElement && target.dataset.showdownSlot && target.dataset.showdownArmorCheck) {
      const slot = target.dataset.showdownSlot
      const key = target.dataset.showdownArmorCheck
      if (!showdownArmor[slot] || !Object.prototype.hasOwnProperty.call(showdownArmor[slot], key)) return
      showdownArmor[slot][key] = Boolean(target.checked)
      return
    }
    if (target.tagName !== 'SELECT') return
    if (target.dataset.showdownGroupSlot && target.dataset.showdownGroup) {
      mutateShowdownAbilityGroup(target.dataset.showdownGroupSlot, target.dataset.showdownGroup, target.value)
      return
    }
    if (target.dataset.showdownProficiencySlot && target.dataset.showdownProficiencyField === 'type') {
      mutateShowdownWeaponProficiency(
        target.dataset.showdownProficiencySlot,
        'type',
        target.value
      )
    }
  })

  addMarkdownCollection.addEventListener('change', () => {
    runBusy(loadAddPickerFiles).catch(err => {
      setStatus(err.message || 'Failed to load add options', 'error')
    })
  })
  addMarkdownSearch.addEventListener('input', renderAddPickerOptions)
  knowledgeTemplateSearch.addEventListener('input', renderKnowledgeTemplateOptions)
  peopleList.addEventListener('change', syncControlState)
  refreshShowdownSurvivorsButton.addEventListener('click', () => {
    runBusy(refreshSelectedShowdownSurvivors).catch(err => {
      setStatus(err.message || 'Failed to refresh showdown survivors', 'error')
    })
  })
  departShowdownButton.addEventListener('click', departShowdownSession)
  showdownOverButton.addEventListener('click', () => {
    runBusy(finalizeShowdownSession).catch(err => {
      const message = err.message || 'Failed to close showdown session'
      setStatus(message, 'error')
      if (currentPage === 'showdown') {
        window.alert(`Could not return from showdown:\n\n${message}`)
      }
    })
  })

  loadPersonButton.addEventListener('click', () => {
    runBusy(async () => {
      const fileName = peopleList.value
      if (!fileName) {
        setStatus('No person selected', 'error')
        return
      }
      const person = await window.api.loadPerson(fileName)
      personJson.value = JSON.stringify(person, null, 2)
      renderVisualEditor(person)
      clearValidationErrors()
      setStatus(`Loaded ${fileName}`, 'success')
    }).catch(err => {
      setStatus(err.message || 'Failed to load person', 'error')
    })
  })

  deletePersonButton.addEventListener('click', () => {
    runBusy(async () => {
      const fileName = peopleList.value
      if (!fileName) {
        setStatus('No person selected', 'error')
        return
      }
      if (!window.confirm(`Delete ${fileName}? This cannot be undone.`)) return
      await window.api.deletePerson(fileName)
      await refreshPeople()
      personJson.value = ''
      clearValidationErrors()
      setStatus(`Deleted ${fileName}`, 'success')
    }).catch(err => {
      setStatus(err.message || 'Failed to delete person', 'error')
    })
  })

  newPersonTemplateButton.addEventListener('click', () => {
    runBusy(async () => {
      const survivorName = newPersonName.value.trim()
      if (!survivorName) {
        setStatus('Enter a survivor name first', 'error')
        return
      }

      const person = await window.api.createPersonTemplate(survivorName)
      const result = await window.api.savePerson(person, {
        expectedFileName: wasEditingExisting ? previousEditingFile : undefined
      })
      if (!result || result.ok === false) {
        const errors = Array.isArray(result?.errors) ? result.errors : []
        if (errors.length > 0) {
          renderValidationErrors(errors)
          highlightPath(errors[0].path || '/')
          setStatus(`Validation failed at ${errors[0].path || '/'}`, 'error')
        } else {
          setStatus(result?.message || 'Failed to create survivor', 'error')
        }
        return
      }

      const savedPerson = await window.api.loadPerson(result.fileName)
      personJson.value = JSON.stringify(savedPerson, null, 2)
      renderVisualEditor(savedPerson)
      clearValidationErrors()
      await refreshPeople()
      peopleList.value = result.fileName
      setStatus(`Created and saved ${savedPerson.name} (${result.fileName})`, 'success')
    }).catch(err => {
      setStatus(err.message || 'Failed to create survivor', 'error')
    })
  })

  savePersonButton.addEventListener('click', () => {
    runBusy(async () => {
      const person = parseEditorJson()
      if (!person) return

      const result = await window.api.savePerson(person)
      if (!result || result.ok === false) {
        const errors = Array.isArray(result?.errors) ? result.errors : []
        if (errors.length > 0) {
          renderValidationErrors(errors)
          highlightPath(errors[0].path || '/')
          setStatus(`Validation failed at ${errors[0].path || '/'}`, 'error')
        } else {
          setStatus(result?.message || 'Failed to save person', 'error')
        }
        return
      }

      clearValidationErrors()
      await refreshPeople()
      peopleList.value = result.fileName
      setStatus(`Saved ${result.fileName}`, 'success')
    }).catch(err => {
      setStatus(err.message || 'Failed to save person', 'error')
    })
  })

  loadJsonToVisualButton.addEventListener('click', () => {
    const person = parseEditorJson()
    if (!person) return
    renderVisualEditor(person)
    setStatus('Visual editor synced from JSON', 'neutral')
  })

  createSurvivorView.addEventListener('click', event => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    if (target.dataset.createStepTarget) {
      const input = document.getElementById(target.dataset.createStepTarget)
      const config = createNumericConfig[target.dataset.createStepTarget]
      if (!(input instanceof HTMLInputElement) || !config) return
      const delta = coerceNumber(target.dataset.createStepDelta, 0)
      const next = clamp(coerceNumber(input.value, 0) + delta, config.min, config.max)
      input.value = String(next)
      if (target.dataset.createStepTarget === 'createSurvivorAge' || target.dataset.createStepTarget === 'createNextPhilosophyAgeThreshold') {
        const draft = buildCreateSurvivorPayload()
        if (draft) renderPonderIndicator(createPonderIndicator, draft)
      }
      return
    }
    if (target.dataset.action === 'removeRow') {
      const row = target.closest('.ve-row')
      if (row) removeCreateArrayRow(row)
      return
    }
    if (target.dataset.action === 'editTextRow') {
      const row = target.closest('.ve-row')
      if (row) editCreateTextRow(row)
      return
    }
    if (target.dataset.action === 'commitTextRow') {
      const row = target.closest('.ve-row')
      if (row) commitCreateTextRow(row)
      return
    }
    if (target.dataset.action === 'saveTemplate') {
      const row = target.closest('.ve-row')
      if (!row) return
      const type = row.dataset.arrayType
      if (type !== 'tenet' && type !== 'knowledge') return
      runBusy(() => saveKnowledgeTemplateFromRow(type, row)).catch(err => {
        setStatus(err.message || 'Failed to save knowledge template', 'error')
      })
      return
    }
    if (target.dataset.action === 'upgradeKnowledgeRow') {
      const row = target.closest('.ve-row')
      if (!row) return
      const type = row.dataset.arrayType
      const arrayName = target.dataset.arrayName
      const index = Number(row.dataset.index)
      const knowledgeType = getKnowledgeTypeFromArrayName(arrayName)
      if ((type !== 'tenet' && type !== 'knowledge') || !arrayName || Number.isNaN(index) || !knowledgeType) return
      syncCreateArraysFromDom()
      const entries = createArrayState[arrayName]
      if (!Array.isArray(entries) || !entries[index]) return
      const sourceItem = entries[index]
      if (!canUpgradeKnowledgeEntry(sourceItem)) {
        setStatus('Current observations must meet the requirement before upgrading', 'neutral')
        return
      }
      const nextMode = String(sourceItem.nextKnowledgeMode || 'noTemplate')
      runBusy(async () => {
        if (nextMode === 'maxLevel') {
          setStatus('This entry is already set to MAX LEVEL', 'neutral')
          return
        }
        if (nextMode === 'existingTemplate' && sourceItem.nextKnowledgeTemplate) {
          await refreshKnowledgeTemplateCache(knowledgeType)
          const selected = knowledgeTemplateCache[knowledgeType].find(
            template => template.fileName === sourceItem.nextKnowledgeTemplate
          )
          if (selected) {
            const upgraded = normalizeKnowledgeTemplateForEntry(knowledgeType, selected.template)
            upgraded.knowledgeLevel = Math.max(
              Math.max(1, coerceNumber(sourceItem.knowledgeLevel, 1)) + 1,
              coerceNumber(upgraded.knowledgeLevel, 1)
            )
            upgraded.currentObservations = 0
            replaceKnowledgeEntryInCreate(arrayName, index, upgraded)
            setStatus(`Upgraded ${sourceItem.name || 'knowledge'} from next template`, 'success')
            return
          }
        }

        await openKnowledgeTemplatePicker({
          arrayName,
          mode: 'create',
          action: 'upgrade',
          index,
          sourceItem,
          forceTemplateOnly: nextMode === 'existingTemplate',
          forceScratchOnly: nextMode === 'noTemplate'
        })
      }).catch(err => {
        setStatus(err.message || 'Failed to upgrade knowledge', 'error')
      })
    }
  })

  createSurvivorView.addEventListener('change', event => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    if (target.dataset.field === 'nextKnowledgeMode') {
      const row = target.closest('.ve-row')
      const nextTemplateSelect = row?.querySelector('[data-field="nextKnowledgeTemplate"]')
      if (nextTemplateSelect instanceof HTMLSelectElement) {
        nextTemplateSelect.disabled = target.value !== 'existingTemplate'
        if (target.value !== 'existingTemplate') nextTemplateSelect.value = ''
      }
    }
    if (
      target.id === 'createSurvivorAge' ||
      target.id === 'createNextPhilosophyAgeThreshold' ||
      target.id === 'createSurvivorPhilosophy'
    ) {
      const draft = buildCreateSurvivorPayload()
      if (draft) renderPonderIndicator(createPonderIndicator, draft)
    }
  })

  createSurvivorView.addEventListener('input', event => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    if (target.id !== 'createSurvivorAge' && target.id !== 'createNextPhilosophyAgeThreshold') return
    const draft = buildCreateSurvivorPayload()
    if (draft) renderPonderIndicator(createPonderIndicator, draft)
  })

  createAddFightingArtButton.addEventListener('click', () => {
    runBusy(() => openAddPicker('fightingArts', 'create')).catch(err => {
      setStatus(err.message || 'Failed to load fighting arts options', 'error')
    })
  })
  createAddSecretFightingArtButton.addEventListener('click', () => {
    runBusy(() => openAddPicker('secretFightingArts', 'create')).catch(err => {
      setStatus(err.message || 'Failed to load secret fighting arts options', 'error')
    })
  })
  createAddDisorderButton.addEventListener('click', () => {
    runBusy(() => openAddPicker('disorders', 'create')).catch(err => {
      setStatus(err.message || 'Failed to load disorder options', 'error')
    })
  })
  createAddAbilityButton.addEventListener('click', () => addCreateArrayEntry('abilities'))
  createAddImpairmentButton.addEventListener('click', () => addCreateArrayEntry('impairments'))
  createAddTenetKnowledgeButton.addEventListener('click', () => {
    runBusy(() => openKnowledgeTemplatePicker({ arrayName: 'tenetKnowledge', mode: 'create' })).catch(err => {
      setStatus(err.message || 'Failed to open tenet knowledge options', 'error')
    })
  })
  createAddKnowledgeButton.addEventListener('click', () => {
    runBusy(() => openKnowledgeTemplatePicker({ arrayName: 'knowledge', mode: 'create' })).catch(err => {
      setStatus(err.message || 'Failed to open knowledge options', 'error')
    })
  })
  createNeurosisLoadTemplate.addEventListener('click', () => {
    runBusy(applyCreateNeurosisTemplate).catch(err => {
      setStatus(err.message || 'Failed to load neurosis template', 'error')
    })
  })
  createNeurosisSaveTemplate.addEventListener('click', () => {
    runBusy(saveCreateNeurosisTemplate).catch(err => {
      setStatus(err.message || 'Failed to save neurosis template', 'error')
    })
  })

  resetCreateSurvivorButton.addEventListener('click', () => {
    runBusy(async () => {
      await resetCreateSurvivorForm()
      if (createViewMode === 'defaultTemplate') {
        setStatus('Default new survivor template reset', 'neutral')
      } else {
        setStatus('Create Survivor form reset to template defaults', 'neutral')
      }
    }).catch(err => {
      setStatus(err.message || 'Failed to reset create survivor form', 'error')
    })
  })

  createSurvivorBack.addEventListener('click', () => {
    if (createViewMode === 'defaultTemplate') {
      setPage('dataSources')
      setStatus('Returned to settings view', 'neutral')
      return
    }
    setPage('settlement')
    setStatus('Returned to settlement view', 'neutral')
  })

  createSurvivorSubmit.addEventListener('click', () => {
    runBusy(async () => {
      const person = buildCreateSurvivorPayload()
      if (!person) {
        setStatus('Survivor name is required', 'error')
        return
      }

      if (createViewMode === 'defaultTemplate') {
        if (!hasDefaultTemplateFolder) {
          setStatus('Select a Default Survivor Templates folder before saving', 'error')
          return
        }
        await window.api.saveDefaultCreateTemplate(person)
        createTemplateDefaults = deepClone(person)
        setStatus('Saved default template for new survivors', 'success')
        return
      }

      if (!hasDataFolder) {
        setStatus('Select a data folder before creating a survivor', 'error')
        return
      }

      const previousEditingFile = createEditingFileName
      const wasEditingExisting = Boolean(previousEditingFile)

      const result = await window.api.savePerson(person)
      if (!result || result.ok === false) {
        const errors = Array.isArray(result?.errors) ? result.errors : []
        if (errors.length > 0) {
          setStatus(`Validation failed at ${errors[0].path || '/'}`, 'error')
        } else {
          setStatus(result?.message || 'Failed to create survivor', 'error')
        }
        return
      }

      if (wasEditingExisting && previousEditingFile && previousEditingFile !== result.fileName) {
        await window.api.deletePerson(previousEditingFile)
      }

      await refreshPeople()
      peopleList.value = result.fileName
      const savedPerson = await window.api.loadPerson(result.fileName)
      personJson.value = JSON.stringify(savedPerson, null, 2)
      renderVisualEditor(savedPerson)
      await resetCreateSurvivorForm()
      setPage('settlement')
      if (wasEditingExisting) {
        setStatus(`Saved ${savedPerson.name} and updated settlement`, 'success')
      } else {
        setStatus(`Created ${savedPerson.name} and added to settlement`, 'success')
      }
    }).catch(err => {
      setStatus(err.message || 'Failed to create survivor', 'error')
    })
  })

  veAgeMinus.addEventListener('click', () => {
    const current = coerceNumber(veAge.value, 0)
    veAge.value = String(clamp(current - 1, 0, 16))
    syncJsonFromVisual()
  })

  veAgePlus.addEventListener('click', () => {
    const current = coerceNumber(veAge.value, 0)
    veAge.value = String(clamp(current + 1, 0, 16))
    syncJsonFromVisual()
  })

  visualEditor.addEventListener('input', event => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    if (target.id && Object.prototype.hasOwnProperty.call(armorState, target.id)) {
      armorState[target.id] = Math.max(0, coerceNumber(target.value, 0))
      renderArmorState()
      return
    }
    if (target.matches('input, textarea, select')) syncJsonFromVisual()
  })

  visualEditor.addEventListener('change', event => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    if (target.dataset.field === 'nextKnowledgeMode') {
      const row = target.closest('.ve-row')
      const nextTemplateSelect = row?.querySelector('[data-field="nextKnowledgeTemplate"]')
      if (nextTemplateSelect instanceof HTMLSelectElement) {
        nextTemplateSelect.disabled = target.value !== 'existingTemplate'
        if (target.value !== 'existingTemplate') nextTemplateSelect.value = ''
      }
      syncJsonFromVisual()
    }
  })

  visualEditor.addEventListener('click', event => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return

    if (target.dataset.stepTarget) {
      const input = document.getElementById(target.dataset.stepTarget)
      const config = numericConfig[target.dataset.stepTarget]
      if (input && config) {
        const delta = coerceNumber(target.dataset.stepDelta, 0)
        const next = clamp(coerceNumber(input.value, 0) + delta, config.min, config.max)
        input.value = String(next)
        syncJsonFromVisual()
      }
      return
    }

    if (target.dataset.armorTarget) {
      const key = target.dataset.armorTarget
      if (Object.prototype.hasOwnProperty.call(armorState, key)) {
        const delta = coerceNumber(target.dataset.armorDelta, 0)
        armorState[key] = Math.max(0, armorState[key] + delta)
        renderArmorState()
      }
      return
    }

    if (target.dataset.action === 'removeRow') {
      const row = target.closest('.ve-row')
      if (row) removeVisualRow(row.parentElement, row)
      return
    }

    if (target.dataset.action === 'saveTemplate') {
      const row = target.closest('.ve-row')
      if (!row) return
      const type = row.dataset.arrayType
      if (type !== 'tenet' && type !== 'knowledge') return
      runBusy(() => saveKnowledgeTemplateFromRow(type, row)).catch(err => {
        setStatus(err.message || 'Failed to save knowledge template', 'error')
      })
    }
  })

  addFightingArtButton.addEventListener('click', () => {
    runBusy(() => openAddPicker('fightingArts')).catch(err => {
      setStatus(err.message || 'Failed to load fighting arts options', 'error')
    })
  })

  addSecretFightingArtButton.addEventListener('click', () => {
    runBusy(() => openAddPicker('secretFightingArts')).catch(err => {
      setStatus(err.message || 'Failed to load secret fighting arts options', 'error')
    })
  })

  addDisorderButton.addEventListener('click', () => {
    runBusy(() => openAddPicker('disorders')).catch(err => {
      setStatus(err.message || 'Failed to load disorder options', 'error')
    })
  })

  addTenetKnowledgeButton.addEventListener('click', () => {
    runBusy(() => openKnowledgeTemplatePicker({ arrayName: 'tenetKnowledge', mode: 'editor' })).catch(err => {
      setStatus(err.message || 'Failed to open tenet knowledge options', 'error')
    })
  })

  addKnowledgeButton.addEventListener('click', () => {
    runBusy(() => openKnowledgeTemplatePicker({ arrayName: 'knowledge', mode: 'editor' })).catch(err => {
      setStatus(err.message || 'Failed to open knowledge options', 'error')
    })
  })

  insertMarkdownButton.addEventListener('click', insertCurrentMarkdownReference)
  closeMarkdownModal.addEventListener('click', closeModal)
  closeAddMarkdownModal.addEventListener('click', closeAddPickerModal)
  closeKnowledgeTemplateModal.addEventListener('click', closeKnowledgeTemplatePickerModal)
  knowledgeTemplateUse.addEventListener('click', () => applyKnowledgeTemplateSelection(true))
  knowledgeTemplateScratch.addEventListener('click', () => applyKnowledgeTemplateSelection(false))
  markdownModal.addEventListener('click', event => {
    if (event.target === markdownModal) closeModal()
  })
  addMarkdownModal.addEventListener('click', event => {
    if (event.target === addMarkdownModal) closeAddPickerModal()
  })
  knowledgeTemplateModal.addEventListener('click', event => {
    if (event.target === knowledgeTemplateModal) closeKnowledgeTemplatePickerModal()
  })
  document.addEventListener(
    'pointerdown',
    event => {
      const rawTarget = event.target
      if (!(rawTarget instanceof Element)) return
      const editable = rawTarget.closest('input, textarea, select, [contenteditable="true"]')
      if (!(editable instanceof HTMLElement)) return
      if ('disabled' in editable && editable.disabled) return
      window.requestAnimationFrame(() => {
        editable.focus()
      })
    },
    true
  )
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return
    if (inShowdownMode) {
      runBusy(async () => {
        setPage('settlement')
        setStatus('Showdown session kept active in memory. Returned to settlement view.', 'neutral')
      }).catch(err => {
        setStatus(err.message || 'Failed to leave showdown view', 'error')
      })
      return
    }
    if (!addMarkdownModal.classList.contains('hidden')) {
      closeAddPickerModal()
      return
    }
    if (!knowledgeTemplateModal.classList.contains('hidden')) {
      closeKnowledgeTemplatePickerModal()
      return
    }
    if (!markdownModal.classList.contains('hidden')) closeModal()
  })

  loadThemePreference()
  syncControlState()
  setPage('settlement')
  init()
})
