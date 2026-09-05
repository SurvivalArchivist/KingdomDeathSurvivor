document.addEventListener('DOMContentLoaded', () => {
  if (!window.api) {
    console.error('API bridge not available')
    return
  }
  const knowledgeTemplateHelpers = window.KDMKnowledgeTemplateHelpers
  const settlementHelpers = window.KDMSettlementHelpers
  const showdownState = window.KDMShowdownState
  const showdownViewModule = window.KDMShowdownView
  const showdownSessionModule = window.KDMShowdownSession
  const showdownControllerModule = window.KDMShowdownController
  if (!knowledgeTemplateHelpers) {
    console.error('Knowledge template helpers not available')
    return
  }
  if (!settlementHelpers) {
    console.error('Settlement helpers not available')
    return
  }
  if (!showdownState) {
    console.error('Showdown state module not available')
    return
  }
  if (!showdownViewModule) {
    console.error('Showdown view module not available')
    return
  }
  if (!showdownSessionModule) {
    console.error('Showdown session module not available')
    return
  }
  if (!showdownControllerModule) {
    console.error('Showdown controller module not available')
    return
  }
  const {
    buildBlankKnowledgeEntry,
    buildUpgradedScratchKnowledge,
    canUpgradeKnowledgeEntry,
    settlementKnowledgeOptions,
    getKnowledgeEntryTypeFromRowType,
    getKnowledgeTemplateLabel,
    getKnowledgeTypeFromArrayName,
    normalizeKnowledgeTemplateForEntry
  } = knowledgeTemplateHelpers
  const {
    createSettlementViewController,
    getSettlementStatsTotal,
    getSettlementTimestampSortValue
  } = settlementHelpers
  const {
    SHOWDOWN_DEFAULT_PAGE,
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
  } = showdownState
  const { renderShowdownCard } = showdownViewModule
  const { createShowdownSession } = showdownSessionModule
  const { createShowdownController } = showdownControllerModule
  const TENET_KNOWLEDGE_LIMIT = 1
  const KNOWLEDGE_LIMIT = 5

  const dataSourcesView = document.getElementById('dataSourcesView')
  const navDataSourcesButton = document.getElementById('navDataSources')
  const selectSourceSurvivors = document.getElementById('selectSourceSurvivors')
  const selectSourceDefaultSurvivorTemplates = document.getElementById('selectSourceDefaultSurvivorTemplates')
  const selectSourceFightingArts = document.getElementById('selectSourceFightingArts')
  const selectSourceSecretFightingArts = document.getElementById('selectSourceSecretFightingArts')
  const selectSourceKnowledges = document.getElementById('selectSourceKnowledges')
  const selectSourceNeuroses = document.getElementById('selectSourceNeuroses')
  const selectSourceDisorders = document.getElementById('selectSourceDisorders')
  const sourcePathSurvivors = document.getElementById('sourcePathSurvivors')
  const sourcePathDefaultSurvivorTemplates = document.getElementById('sourcePathDefaultSurvivorTemplates')
  const sourcePathFightingArts = document.getElementById('sourcePathFightingArts')
  const sourcePathSecretFightingArts = document.getElementById('sourcePathSecretFightingArts')
  const sourcePathKnowledges = document.getElementById('sourcePathKnowledges')
  const sourcePathNeuroses = document.getElementById('sourcePathNeuroses')
  const sourcePathDisorders = document.getElementById('sourcePathDisorders')
  const settingsUserName = document.getElementById('settingsUserName')
  const settingsDateFormat = document.getElementById('settingsDateFormat')
  const settingsFastMode = document.getElementById('settingsFastMode')
  const settingsSurvivorDataMode = document.getElementById('settingsSurvivorDataMode')
  const settingsLanDisplayName = document.getElementById('settingsLanDisplayName')
  const settingsLanHostAddress = document.getElementById('settingsLanHostAddress')
  const settingsLanPort = document.getElementById('settingsLanPort')
  const settingsLanAutoReconnect = document.getElementById('settingsLanAutoReconnect')
  const settingsLanHostEnabled = document.getElementById('settingsLanHostEnabled')
  const settingsLanHostStart = document.getElementById('settingsLanHostStart')
  const settingsLanHostStop = document.getElementById('settingsLanHostStop')
  const settingsLanClientConnect = document.getElementById('settingsLanClientConnect')
  const settingsLanClientDisconnect = document.getElementById('settingsLanClientDisconnect')
  const settingsLanDiscoveredHosts = document.getElementById('settingsLanDiscoveredHosts')
  const settingsLanRefreshDiscovery = document.getElementById('settingsLanRefreshDiscovery')
  const settingsLanUseDiscoveredHost = document.getElementById('settingsLanUseDiscoveredHost')
  const settingsLanHostAddresses = document.getElementById('settingsLanHostAddresses')
  const settingsExportBackup = document.getElementById('settingsExportBackup')
  const settingsLanStatus = document.getElementById('settingsLanStatus')
  const settingsLanHint = document.getElementById('settingsLanHint')
  const survivorSourceRow = document.getElementById('survivorSourceRow')
  const lanClientSettings = [...document.querySelectorAll('[data-lan-client-setting]')]
  const lanHostSettings = [...document.querySelectorAll('[data-lan-host-setting]')]
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
  const navLanStatus = document.getElementById('navLanStatus')
  const navFullscreenButton = document.getElementById('navFullscreen')
  const themeSelect = document.getElementById('themeSelect')
  const settlementNameSearch = document.getElementById('settlementNameSearch')
  const settlementTraitSearch = document.getElementById('settlementTraitSearch')
  const settlementToggleExtraFiltersButton = document.getElementById('settlementToggleExtraFilters')
  const settlementExtraFilters = document.getElementById('settlementExtraFilters')
  const settlementToggleMovement = document.getElementById('settlementToggleMovement')
  const settlementToggleWeaponProficiency = document.getElementById('settlementToggleWeaponProficiency')
  const settlementToggleLastUpdated = document.getElementById('settlementToggleLastUpdated')
  const settlementToggleLastReturned = document.getElementById('settlementToggleLastReturned')
  const settlementToggleStatsTotal = document.getElementById('settlementToggleStatsTotal')
  const settlementClearFiltersButton = document.getElementById('settlementClearFilters')
  const settlementAutoRefreshEnabled = document.getElementById('settlementAutoRefreshEnabled')
  const settlementAutoRefreshInterval = document.getElementById('settlementAutoRefreshInterval')
  const settlementRefreshNow = document.getElementById('settlementRefreshNow')
  const settlementLastRefreshed = document.getElementById('settlementLastRefreshed')
  const settlementAliveCount = document.getElementById('settlementAliveCount')
  const settlementBulkRows = document.getElementById('settlementBulkRows')
  const settlementAddBulkChangeButton = document.getElementById('settlementAddBulkChange')
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
  const createUnsavedIndicator = document.getElementById('createUnsavedIndicator')
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
  const createAddNoteButton = document.getElementById('createAddNote')
  const createAbilities = document.getElementById('createAbilities')
  const createImpairments = document.getElementById('createImpairments')
  const createNotes = document.getElementById('createNotes')
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
  const knowledgeTemplateLibrary = document.getElementById('knowledgeTemplateLibrary')
  const knowledgeTemplateSearch = document.getElementById('knowledgeTemplateSearch')
  const knowledgeTemplateSelect = document.getElementById('knowledgeTemplateSelect')
  const knowledgeEntryEditor = document.getElementById('knowledgeEntryEditor')
  const knowledgeEntryName = document.getElementById('knowledgeEntryName')
  const knowledgeEntryObservation = document.getElementById('knowledgeEntryObservation')
  const knowledgeEntryRules = document.getElementById('knowledgeEntryRules')
  const knowledgeEntryRequirement = document.getElementById('knowledgeEntryRequirement')
  const knowledgeEntryLevel = document.getElementById('knowledgeEntryLevel')
  const knowledgeEntryNextMode = document.getElementById('knowledgeEntryNextMode')
  const knowledgeEntryNextTemplate = document.getElementById('knowledgeEntryNextTemplate')
  const knowledgeEntrySaveTemplate = document.getElementById('knowledgeEntrySaveTemplate')
  const knowledgeEntrySaveTemplateToggle = document.getElementById('knowledgeEntrySaveTemplateToggle')
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
    selectSourceNeuroses,
    selectSourceDisorders,
    sourcePathSurvivors,
    sourcePathDefaultSurvivorTemplates,
    sourcePathFightingArts,
    sourcePathSecretFightingArts,
    sourcePathKnowledges,
    sourcePathNeuroses,
    sourcePathDisorders,
    settingsUserName,
    settingsDateFormat,
    settingsFastMode,
    settingsSurvivorDataMode,
    settingsLanDisplayName,
    settingsLanHostAddress,
    settingsLanPort,
    settingsLanAutoReconnect,
    settingsLanHostEnabled,
    settingsLanHostStart,
    settingsLanHostStop,
    settingsLanClientConnect,
    settingsLanClientDisconnect,
    settingsLanDiscoveredHosts,
    settingsLanRefreshDiscovery,
    settingsLanUseDiscoveredHost,
    settingsLanHostAddresses,
    settingsExportBackup,
    settingsLanStatus,
    settingsLanHint,
    survivorSourceRow,
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
    navFullscreenButton,
    themeSelect,
    settlementNameSearch,
    settlementTraitSearch,
    settlementToggleExtraFiltersButton,
    settlementExtraFilters,
    settlementToggleMovement,
    settlementToggleWeaponProficiency,
    settlementToggleLastUpdated,
    settlementToggleLastReturned,
    settlementToggleStatsTotal,
    settlementClearFiltersButton,
    settlementAutoRefreshEnabled,
    settlementAutoRefreshInterval,
    settlementRefreshNow,
    settlementLastRefreshed,
    settlementAliveCount,
    settlementBulkRows,
    settlementAddBulkChangeButton,
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
    createUnsavedIndicator,
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
    createAddNoteButton,
    createAbilities,
    createImpairments,
    createNotes,
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
    knowledgeTemplateLibrary,
    knowledgeTemplateSearch,
    knowledgeTemplateSelect,
    knowledgeEntryEditor,
    knowledgeEntryName,
    knowledgeEntryObservation,
    knowledgeEntryRules,
    knowledgeEntryRequirement,
    knowledgeEntryLevel,
    knowledgeEntryNextMode,
    knowledgeEntryNextTemplate,
    knowledgeEntrySaveTemplate,
    knowledgeEntrySaveTemplateToggle,
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
  const buttonFeedbackTimers = new WeakMap()
  const THEME_STORAGE_KEY = 'kdm-theme'
  const THEME_OPTIONS = Object.freeze({
    dark: {
      bodyClass: 'theme-dark',
      colorScheme: 'dark'
    },
    light: {
      bodyClass: 'theme-light',
      colorScheme: 'light'
    },
    'zen-day': {
      bodyClass: 'theme-zen-day',
      colorScheme: 'light'
    },
    'zen-night': {
      bodyClass: 'theme-zen-night',
      colorScheme: 'dark'
    }
  })
  let currentTheme = 'dark'
  let windowIsFullScreen = false
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
  let settlementExtraFiltersOpen = false
  let settlementViewController = null
  let pendingSettlementEntryRefresh = false
  let pendingLanSettlementRefresh = false
  let lanStatusRefreshTimer = null
  let lanConnectionState = 'local'
  let discoveredLanHosts = []
  let appSettings = {
    userName: '',
    dateFormat: 'en-GB',
    survivorDataMode: 'local',
    lanDisplayName: '',
    lanHostAddress: '',
    lanPort: 3765,
    lanAutoReconnect: true,
    lanClientConnected: true,
    lanHostEnabled: false
  }
  let createTemplateDefaults = null
  let createViewBase = null
  let createEditingFileName = null
  let createDirty = false
  let createDirtyBaseline = ''
  let createArrayState = {
    abilities: [],
    impairments: [],
    notes: [],
    fightingArts: [],
    secretFightingArts: [],
    disorders: [],
    tenetKnowledge: [],
    knowledge: []
  }
  let createTextDraftState = {
    abilities: [],
    impairments: [],
    notes: []
  }
  const TEXT_ENTRY_ARRAYS = ['abilities', 'impairments', 'notes']
  let showdownArmor = createShowdownArmorState()
  let showdownModifiers = createShowdownModifierState()
  const BULK_EDIT_FIELD_CONFIG = {
    lumi: { label: 'Lumi', min: 0 },
    movement: { label: 'Movement', min: 1 },
    speed: { label: 'Speed' },
    accuracy: { label: 'Accuracy' },
    strength: { label: 'Strength' },
    luck: { label: 'Luck' },
    evasion: { label: 'Evasion' },
    courage: { label: 'Courage', min: 0, max: 9 },
    understanding: { label: 'Understanding', min: 0, max: 9 }
  }
  const BULK_EDIT_DEFAULT_FIELD = 'strength'
  const BULK_EDIT_DEFAULT_DELTA = 1
  let settlementBulkChanges = [createBulkEditChange()]
  const SETTLEMENT_STATS_TOTAL_FIELDS = ['movement', 'speed', 'accuracy', 'strength', 'luck', 'evasion']
  let showdownPeople = {
    A: null,
    B: null
  }
  let showdownPageBySlot = createShowdownPageState()
  const showdownMarkdownContentCache = new Map()
  const showdownMarkdownContentPending = new Set()
  let showdownTextDraftState = createShowdownTextDraftState()
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
    forceScratchOnly: false,
    scratchEditorActive: false
  }
  const knowledgeTemplateCache = {
    tenetKnowledge: [],
    knowledge: []
  }

  function isTextEntryArrayName(arrayName) {
    return TEXT_ENTRY_ARRAYS.includes(arrayName)
  }

  function normalizeAppSettings(input) {
    const dateFormat = input && typeof input.dateFormat === 'string' ? input.dateFormat.trim() : ''
    const survivorDataMode = String(input?.survivorDataMode || '').trim()
    const lanPort = Number(input?.lanPort)
    return {
      userName: input && typeof input.userName === 'string' ? input.userName.trim() : '',
      dateFormat: dateFormat === 'en-US' ? 'en-US' : 'en-GB',
      survivorDataMode:
        survivorDataMode === 'lan-host' || survivorDataMode === 'lan-client' ? survivorDataMode : 'local',
      lanDisplayName: typeof input?.lanDisplayName === 'string' ? input.lanDisplayName.trim() : '',
      lanHostAddress: typeof input?.lanHostAddress === 'string' ? input.lanHostAddress.trim() : '',
      lanPort: Number.isInteger(lanPort) && lanPort >= 1024 && lanPort <= 65535 ? lanPort : 3765,
      lanAutoReconnect: typeof input?.lanAutoReconnect === 'boolean' ? input.lanAutoReconnect : true,
      lanClientConnected: typeof input?.lanClientConnected === 'boolean' ? input.lanClientConnected : true,
      lanHostEnabled: typeof input?.lanHostEnabled === 'boolean' ? input.lanHostEnabled : false
    }
  }

  function getTextEntryPlaceholder(arrayName) {
    if (arrayName === 'abilities') return 'Ability text'
    if (arrayName === 'impairments') return 'Impairment text'
    if (arrayName === 'notes') return 'Note text'
    return 'Free text'
  }

  function getTextEntrySingularLabel(arrayName) {
    if (arrayName === 'abilities') return 'ability'
    if (arrayName === 'impairments') return 'impairment'
    if (arrayName === 'notes') return 'note'
    return 'entry'
  }

  function getCreateTextContainer(arrayName) {
    if (arrayName === 'abilities') return createAbilities
    if (arrayName === 'impairments') return createImpairments
    if (arrayName === 'notes') return createNotes
    return null
  }

  function syncCreateTextDraftInputsFromDom() {
    for (const arrayName of TEXT_ENTRY_ARRAYS) {
      const container = getCreateTextContainer(arrayName)
      if (!container) continue
      for (const row of container.querySelectorAll('.ve-row')) {
        updateCreateTextDraftFromRow(row)
      }
    }
  }

  function getCreateTextArraySnapshot(arrayName) {
    const entries = Array.isArray(createTextDraftState[arrayName]) ? createTextDraftState[arrayName] : []
    return entries
      .map(entry => String(entry?.isEditing ? entry.draft ?? '' : entry?.text ?? '').trim())
      .filter(Boolean)
  }

  function buildCreateDirtySnapshot() {
    syncCreateTextDraftInputsFromDom()
    const snapshot = {
      name: createSurvivorName.value.trim(),
      gender: createSurvivorGender.value === 'F' ? 'F' : 'M',
      philosophy: createSurvivorPhilosophy.value.trim(),
      philosophyNeurosis: createPhilosophyNeurosis.value.trim(),
      philosophyNeurosisName: createNeurosisTemplateName.value.trim(),
      isAlive: Boolean(createSurvivorAlive.checked),
      lifetimeReroll: Boolean(createSurvivorLifetimeReroll.checked),
      matchmaker: String(createSurvivorMatchmaker.value || 'none'),
      tinker: String(createSurvivorTinker.value || 'none'),
      abilities: getCreateTextArraySnapshot('abilities'),
      impairments: getCreateTextArraySnapshot('impairments'),
      notes: getCreateTextArraySnapshot('notes'),
      fightingArts: collectVisualRows(createFightingArts, 'fightingArts'),
      secretFightingArts: collectVisualRows(createSecretFightingArts, 'secretFightingArts'),
      disorders: collectVisualRows(createDisorders, 'disorders'),
      tenetKnowledge: collectVisualRows(createTenetKnowledge, 'tenet'),
      knowledge: collectVisualRows(createKnowledge, 'knowledge')
    }
    setValueByPath(snapshot, 'weaponProficiency.type', createWeaponProficiencyType.value.trim())
    for (const [inputId, config] of Object.entries(createNumericConfig)) {
      const input = document.getElementById(inputId)
      if (!input) continue
      const current = coerceNumber(input.value, 0)
      const value =
        config.field === 'weaponProficiency.level'
          ? normalizeProficiencyLevel(current, config.min ?? 0)
          : clamp(current, config.min, config.max)
      setValueByPath(snapshot, config.field, value)
    }
    return JSON.stringify(snapshot)
  }

  function syncCreateDirtyIndicator() {
    if (!createUnsavedIndicator) return
    createUnsavedIndicator.textContent = 'Unsaved changes'
    createUnsavedIndicator.classList.toggle('hidden', !createDirty)
  }

  function snapshotCreateFormAsClean() {
    createDirtyBaseline = buildCreateDirtySnapshot()
    createDirty = false
    syncCreateDirtyIndicator()
  }

  function syncCreateDirtyState() {
    if (!createDirtyBaseline) {
      createDirty = false
      syncCreateDirtyIndicator()
      return false
    }
    createDirty = buildCreateDirtySnapshot() !== createDirtyBaseline
    syncCreateDirtyIndicator()
    return createDirty
  }

  function hasUnsavedCreateChanges() {
    return (currentPage === 'create' || currentPage === 'defaultTemplate') && Boolean(createDirty)
  }

  function confirmDiscardCreateChanges(actionLabel = 'continue') {
    if (!hasUnsavedCreateChanges()) return true
    const subject =
      createViewMode === 'defaultTemplate'
        ? 'the default new survivor template'
        : createViewMode === 'edit'
          ? 'this survivor'
          : 'this new survivor'
    return window.confirm(`You have unsaved changes in ${subject}. Discard them and ${actionLabel}?`)
  }
  const DATA_SOURCE_KEYS = [
    'survivors',
    'defaultSurvivorTemplates',
    'fightingArts',
    'secretFightingArts',
    'knowledges',
    'neuroses',
    'disorders'
  ]
  const dataSourceButtons = {
    survivors: selectSourceSurvivors,
    defaultSurvivorTemplates: selectSourceDefaultSurvivorTemplates,
    fightingArts: selectSourceFightingArts,
    secretFightingArts: selectSourceSecretFightingArts,
    knowledges: selectSourceKnowledges,
    neuroses: selectSourceNeuroses,
    disorders: selectSourceDisorders
  }
  const dataSourcePathDisplays = {
    survivors: sourcePathSurvivors,
    defaultSurvivorTemplates: sourcePathDefaultSurvivorTemplates,
    fightingArts: sourcePathFightingArts,
    secretFightingArts: sourcePathSecretFightingArts,
    knowledges: sourcePathKnowledges,
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

  function createBulkEditChange(field = BULK_EDIT_DEFAULT_FIELD, delta = BULK_EDIT_DEFAULT_DELTA) {
    return { field, delta }
  }

  function renderSettlementBulkRows() {
    settlementBulkRows.innerHTML = ''
    settlementBulkChanges.forEach((change, index) => {
      const row = document.createElement('div')
      row.className = 'settlement-bulk-actions settlement-bulk-row'
      row.dataset.bulkIndex = String(index)
      row.innerHTML = `
        <span class="settlement-bulk-row-index">#${index + 1}</span>
        <label>
          Bulk field
          <select data-bulk-field>
            ${Object.entries(BULK_EDIT_FIELD_CONFIG)
              .map(
                ([key, config]) =>
                  `<option value="${key}"${key === change.field ? ' selected' : ''}>${config.label}</option>`
              )
              .join('')}
          </select>
        </label>
        <label>
          Delta
          <input data-bulk-delta type="number" step="1" value="${coerceInt(change.delta, BULK_EDIT_DEFAULT_DELTA)}" />
        </label>
        <button type="button" class="btn btn-danger" data-remove-bulk-change="${index}"${
          settlementBulkChanges.length === 1 ? ' disabled' : ''
        }>Remove</button>
      `
      settlementBulkRows.appendChild(row)
    })
  }

  function resetSettlementBulkChanges() {
    settlementBulkChanges = [createBulkEditChange()]
    renderSettlementBulkRows()
    syncControlState()
  }

  function collectSettlementBulkChangesFromDom() {
    const rows = [...settlementBulkRows.querySelectorAll('.settlement-bulk-row')]
    const nextChanges = rows.map(row => {
      const fieldSelect = row.querySelector('[data-bulk-field]')
      const deltaInput = row.querySelector('[data-bulk-delta]')
      return createBulkEditChange(
        fieldSelect instanceof HTMLSelectElement ? fieldSelect.value : BULK_EDIT_DEFAULT_FIELD,
        deltaInput instanceof HTMLInputElement ? coerceInt(deltaInput.value, BULK_EDIT_DEFAULT_DELTA) : BULK_EDIT_DEFAULT_DELTA
      )
    })
    settlementBulkChanges = nextChanges.length > 0 ? nextChanges : [createBulkEditChange()]
    return settlementBulkChanges
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


  function stepShowdownPage(slot, direction) {
    if (slot !== 'A' && slot !== 'B') return false
    const current = normalizeShowdownPageKey(showdownPageBySlot[slot])
    const next = getSteppedShowdownPageKey(current, direction)
    if (next === current) return false
    showdownPageBySlot[slot] = next
    renderShowdownSlot(slot)
    return true
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

  function applyLanConnectionStatus(statusPayload) {
    const state = String(statusPayload?.state || '').trim() || 'error'
    const label = String(statusPayload?.label || '').trim() || 'Error'
    const message = String(statusPayload?.message || '').trim() || 'Open Settings'
    lanConnectionState = state
    navLanStatus.textContent = label
    navLanStatus.dataset.lanState = state
    navLanStatus.title = message
    navLanStatus.setAttribute('aria-label', `Survivor data status: ${label}. Open Settings.`)
  }

  function getLanStatusRefreshDelay() {
    if (isLanClientMode() && appSettings.lanAutoReconnect && appSettings.lanClientConnected !== false) {
      return lanConnectionState === 'offline' || lanConnectionState === 'error' || lanConnectionState === 'reconnecting'
        ? 5000
        : 15000
    }
    return 15000
  }

  async function refreshLanConnectionStatus() {
    if (typeof window.api.getLanConnectionStatus !== 'function') {
      applyLanConnectionStatus({ state: appSettings.survivorDataMode === 'lan-client' ? 'offline' : 'local', label: appSettings.survivorDataMode === 'lan-client' ? 'Offline' : 'Local' })
      return
    }
    if (
      isLanClientMode() &&
      appSettings.lanAutoReconnect &&
      appSettings.lanClientConnected !== false &&
      (lanConnectionState === 'offline' || lanConnectionState === 'error')
    ) {
      applyLanConnectionStatus({ state: 'reconnecting', label: 'Reconnecting', message: 'Checking LAN host availability' })
    }
    try {
      applyLanConnectionStatus(await window.api.getLanConnectionStatus())
    } catch {
      applyLanConnectionStatus({ state: 'error', label: 'Error', message: 'LAN status unavailable' })
    }
  }

  function scheduleLanConnectionStatusRefresh(delayMs = 15000) {
    if (lanStatusRefreshTimer) {
      window.clearTimeout(lanStatusRefreshTimer)
      lanStatusRefreshTimer = null
    }
    lanStatusRefreshTimer = window.setTimeout(() => {
      refreshLanConnectionStatus().finally(() => {
        if (currentPage) scheduleLanConnectionStatusRefresh(getLanStatusRefreshDelay())
      })
    }, delayMs)
  }

  function isLanClientWriteBlocked() {
    return isLanClientMode() && (lanConnectionState === 'offline' || lanConnectionState === 'error')
  }

  function getLanClientBlockedMessage(action) {
    const stateLabel = lanConnectionState === 'error' ? 'in an error state' : 'offline'
    return `LAN host is ${stateLabel}. Open Settings or reconnect before ${action}.`
  }

  async function ensureCanWriteSurvivorData(action) {
    if (isLanClientMode()) await refreshLanConnectionStatus()
    syncControlState()
    if (!isLanClientWriteBlocked()) return true
    setStatus(getLanClientBlockedMessage(action), 'error')
    return false
  }

  async function refreshLanStatusAfterSurvivorOperation(task) {
    try {
      const result = await task()
      if (result?.settlementWarning) window.alert(result.settlementWarning)
      return result
    } finally {
      if (isLanClientMode()) await refreshLanConnectionStatus()
    }
  }

  function formatSurvivorSaveFailure(result, fallbackMessage) {
    const errorType = String(result?.errorType || '').trim()
    const message = String(result?.message || fallbackMessage || 'Survivor save failed').trim()
    if (errorType === 'validation') {
      const errors = Array.isArray(result?.errors) ? result.errors : []
      const path = errors[0]?.path || '/'
      return { tone: 'error', message: `Validation failure at ${path}: ${message}`, errors }
    }
    if (errorType === 'conflict') {
      return { tone: 'error', message: `Stale revision conflict: ${message}. Refresh the survivor before saving again.`, errors: [] }
    }
    if (errorType === 'host-unavailable' || errorType === 'disconnected') {
      return { tone: 'error', message: `Cannot reach LAN host: ${message}. Open Settings or reconnect.`, errors: [] }
    }
    if (errorType === 'server-error') {
      return { tone: 'error', message: `LAN host server error: ${message}`, errors: [] }
    }
    return { tone: 'error', message, errors: [] }
  }

  function showSurvivorSaveFailure(result, fallbackMessage, options = {}) {
    const failure = formatSurvivorSaveFailure(result, fallbackMessage)
    if (failure.errors.length > 0 && options.renderValidationErrors) {
      renderValidationErrors(failure.errors)
      highlightPath(failure.errors[0].path || '/')
    }
    setStatus(failure.message, failure.tone)
  }

  function isLanSurvivorReadUnavailable(err) {
    if (!isLanClientMode()) return false
    const errorType = String(err?.errorType || '').trim()
    if (errorType === 'host-unavailable' || errorType === 'disconnected') return true
    if (lanConnectionState === 'offline' || lanConnectionState === 'error') {
      return true
    }
    const message = String(err?.message || '').toLowerCase()
    return (
      message.includes('cannot reach lan host') ||
      message.includes('lan host is unavailable') ||
      message.includes('failed to fetch') ||
      message.includes('econnrefused') ||
      message.includes('network error')
    )
  }

  function showSurvivorReadFailure(err, action, fallbackMessage, preservedStateMessage = '') {
    if (isLanSurvivorReadUnavailable(err)) {
      const preserved = String(preservedStateMessage || '').trim()
      setStatus(
        `Cannot reach the LAN host while ${action}. ${preserved ? `${preserved} ` : ''}Open Settings to reconnect, or retry when the host is available.`,
        'error'
      )
      return
    }
    setStatus(err?.message || fallbackMessage || `Failed while ${action}`, 'error')
  }

  function normalizeTheme(theme) {
    return Object.prototype.hasOwnProperty.call(THEME_OPTIONS, theme) ? theme : 'dark'
  }

  function applyTheme(theme) {
    const nextTheme = normalizeTheme(theme)
    currentTheme = nextTheme
    document.body.dataset.theme = nextTheme
    for (const [themeKey, config] of Object.entries(THEME_OPTIONS)) {
      document.body.classList.toggle(config.bodyClass, themeKey === nextTheme)
    }
    if (document.documentElement?.style) {
      document.documentElement.style.colorScheme = THEME_OPTIONS[nextTheme].colorScheme
    }
    if (themeSelect instanceof HTMLSelectElement) {
      themeSelect.value = nextTheme
    }
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    } catch {
      // Ignore storage failures in restricted environments.
    }
  }

  function applyWindowFullScreenState(isFullScreen) {
    windowIsFullScreen = Boolean(isFullScreen)
    navFullscreenButton.textContent = windowIsFullScreen ? 'Exit Full Screen' : 'Full Screen'
    navFullscreenButton.setAttribute('aria-pressed', windowIsFullScreen ? 'true' : 'false')
  }

  async function syncWindowFullScreenState() {
    if (typeof window.api.getFullScreenState !== 'function') {
      applyWindowFullScreenState(false)
      return
    }
    try {
      const state = await window.api.getFullScreenState()
      applyWindowFullScreenState(Boolean(state?.isFullScreen))
    } catch {
      applyWindowFullScreenState(false)
    }
  }

  function loadThemePreference() {
    let storedTheme = null
    try {
      storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    } catch {
      storedTheme = null
    }
    applyTheme(normalizeTheme(storedTheme))
  }

  function isLanClientMode() {
    return appSettings.survivorDataMode === 'lan-client'
  }

  function hasConfiguredSurvivorDataAccess() {
    if (isLanClientMode()) return Boolean(String(appSettings.lanHostAddress || '').trim()) && appSettings.lanClientConnected !== false
    return Boolean(String(dataSources.survivors || '').trim())
  }

  function getSurvivorDataSetupPrompt() {
    if (isLanClientMode()) return 'Enter a LAN host address to begin'
    return 'Select a survivors folder to begin'
  }

  function renderDataSources() {
    for (const key of DATA_SOURCE_KEYS) {
      const el = dataSourcePathDisplays[key]
      if (!el) continue
      const value = String(dataSources[key] || '').trim()
      el.textContent = value || 'Not set'
    }
    hasDataFolder = hasConfiguredSurvivorDataAccess()
    hasDefaultTemplateFolder = Boolean(String(dataSources.defaultSurvivorTemplates || '').trim())
  }

  function syncLanSettingsUi() {
    const mode = appSettings.survivorDataMode || 'local'
    const isHost = mode === 'lan-host'
    const isClient = mode === 'lan-client'

    settingsSurvivorDataMode.value = mode
    settingsLanDisplayName.value = appSettings.lanDisplayName || ''
    settingsLanHostAddress.value = appSettings.lanHostAddress || ''
    settingsLanPort.value = String(appSettings.lanPort || 3765)
    settingsLanAutoReconnect.checked = Boolean(appSettings.lanAutoReconnect)
    settingsLanHostEnabled.checked = Boolean(appSettings.lanHostEnabled)

    for (const row of lanHostSettings) row.hidden = !isHost
    for (const row of lanClientSettings) row.hidden = !isClient
    survivorSourceRow.hidden = isClient

    if (isHost) {
      settingsLanStatus.textContent = appSettings.lanHostEnabled ? 'Host mode ready' : 'Host mode configured'
      settingsLanHint.textContent = 'LAN Host will use the selected Survivors folder as authoritative storage.'
    } else if (isClient) {
      settingsLanStatus.textContent =
        appSettings.lanClientConnected === false
          ? 'Client disconnected'
          : appSettings.lanHostAddress
            ? 'Client mode configured'
            : 'Client host not set'
      settingsLanHint.textContent = 'LAN Client reads and writes survivor records through the configured host address.'
    } else {
      settingsLanStatus.textContent = 'Local files mode'
      settingsLanHint.textContent = 'Local Files reads and writes survivor JSON in the selected Survivors folder.'
    }
  }

  function renderDiscoveredLanHosts(hosts = discoveredLanHosts) {
    discoveredLanHosts = Array.isArray(hosts) ? hosts : []
    const previousValue = settingsLanDiscoveredHosts.value
    settingsLanDiscoveredHosts.innerHTML = ''
    if (discoveredLanHosts.length === 0) {
      const option = document.createElement('option')
      option.value = ''
      option.textContent = 'No hosts discovered'
      settingsLanDiscoveredHosts.appendChild(option)
      syncControlState()
      return
    }
    for (const host of discoveredLanHosts) {
      const option = document.createElement('option')
      option.value = String(host.id || host.url || '')
      const label = String(host.displayName || '').trim()
      option.textContent = label ? `${label} (${host.url})` : String(host.url || host.address || 'LAN Host')
      settingsLanDiscoveredHosts.appendChild(option)
    }
    if (previousValue && discoveredLanHosts.some(host => String(host.id || host.url || '') === previousValue)) {
      settingsLanDiscoveredHosts.value = previousValue
    } else {
      settingsLanDiscoveredHosts.value = String(discoveredLanHosts[0]?.id || discoveredLanHosts[0]?.url || '')
    }
    syncControlState()
  }

  async function refreshDiscoveredLanHosts(options = {}) {
    if (typeof window.api.getLanDiscoveredHosts !== 'function') {
      renderDiscoveredLanHosts([])
      return []
    }
    const hosts = await window.api.getLanDiscoveredHosts()
    renderDiscoveredLanHosts(hosts)
    if (options.showStatus) {
      setStatus(hosts.length > 0 ? `Found ${hosts.length} LAN host${hosts.length === 1 ? '' : 's'}` : 'No LAN hosts discovered yet', 'neutral')
    }
    return hosts
  }

  async function useSelectedDiscoveredHost() {
    const selectedId = settingsLanDiscoveredHosts.value
    const host = discoveredLanHosts.find(entry => String(entry.id || entry.url || '') === selectedId)
    if (!host) {
      setStatus('No discovered LAN host selected', 'error')
      return
    }
    settingsLanHostAddress.value = host.address || ''
    settingsLanPort.value = String(host.port || 3765)
    await applyLanAction({ survivorDataMode: 'lan-client', lanHostAddress: host.address || '', lanPort: host.port || 3765, lanClientConnected: true }, `Selected ${host.displayName || host.url || 'LAN host'}`)
  }

  function renderLanHostInfo(info) {
    if (!settingsLanHostAddresses) return
    const urls = Array.isArray(info?.urls) ? info.urls.filter(Boolean) : []
    if (urls.length === 0) {
      settingsLanHostAddresses.textContent = 'Not available'
      return
    }
    settingsLanHostAddresses.textContent = urls.join(', ')
  }

  async function refreshLanHostInfo() {
    if (typeof window.api.getLanHostInfo !== 'function') {
      renderLanHostInfo(null)
      return
    }
    try {
      renderLanHostInfo(await window.api.getLanHostInfo())
    } catch {
      renderLanHostInfo(null)
    }
  }

  async function exportSurvivorDataBackup() {
    if (typeof window.api.exportSurvivorDataBackup !== 'function') {
      setStatus('Backup export is unavailable', 'error')
      return
    }
    if (!hasDataFolder) {
      setStatus(getSurvivorDataSetupPrompt(), 'error')
      return
    }
    const result = await window.api.exportSurvivorDataBackup()
    if (!result) {
      setStatus('Backup export canceled', 'neutral')
      return
    }
    setStatus(`Backup exported to ${result.backupPath}`, 'success')
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
        showSurvivorReadFailure(
          err,
          'refreshing Settlement',
          'Failed to refresh settlement on open',
          'The current settlement list was kept unchanged.'
        )
      })
    }, 0)
  }

  function requestLanSettlementRefresh() {
    if (pendingLanSettlementRefresh) return
    if (!isLanClientMode() || currentPage !== 'settlement' || !hasDataFolder) return
    pendingLanSettlementRefresh = true
    window.setTimeout(() => {
      pendingLanSettlementRefresh = false
      if (!isLanClientMode() || currentPage !== 'settlement' || !hasDataFolder) return
      if (busy) {
        requestLanSettlementRefresh()
        return
      }
      runBusy(async () => {
        await refreshPeople({ silentStatus: true, updateRefreshTimestamp: true })
        setStatus('Settlement refreshed from LAN host change', 'neutral')
      }).catch(err => {
        showSurvivorReadFailure(
          err,
          'refreshing Settlement',
          'Failed to refresh settlement from LAN host',
          'The current settlement list was kept unchanged.'
        )
      })
    }, 0)
  }

  function handleLanSurvivorDataChanged() {
    if (!isLanClientMode()) return
    refreshLanConnectionStatus()
      .catch(() => {})
      .finally(() => {
        requestLanSettlementRefresh()
      })
  }

  function setBusy(nextBusy) {
    busy = nextBusy
    syncControlState()
    syncSettlementAutoRefresh()
  }

  function syncSettlementExtraFilters() {
    settlementExtraFilters.hidden = !settlementExtraFiltersOpen
    settlementToggleExtraFiltersButton.textContent = settlementExtraFiltersOpen ? 'Hide Extra Filters' : 'Show Extra Filters'
    settlementToggleExtraFiltersButton.setAttribute('aria-expanded', settlementExtraFiltersOpen ? 'true' : 'false')
  }

  function syncControlState() {
    const hasSelection = Boolean(peopleList.value)
    const hasMarkdownCollections = markdownCollection.options.length > 0 && markdownCollection.value !== ''
    const hasTwoShowdownOptions = showdownSelectA.options.length >= 2
    const hasShowdownPairLoaded = Boolean(showdownPeople.A && showdownPeople.B)
    const survivorWriteBlocked = isLanClientWriteBlocked()
    const isHostMode = appSettings.survivorDataMode === 'lan-host'
    const isClientMode = appSettings.survivorDataMode === 'lan-client'
    const hasDiscoveredHost = discoveredLanHosts.length > 0 && Boolean(settingsLanDiscoveredHosts.value)
    const canOpenShowdown =
      hasTwoShowdownOptions &&
      showdownSelectA.value &&
      showdownSelectB.value &&
      showdownSelectA.value !== showdownSelectB.value

    for (const button of Object.values(dataSourceButtons)) {
      if (button) button.disabled = busy
    }
    refreshPeopleButton.disabled = !hasDataFolder || busy
    settingsLanHostStart.disabled = busy || !isHostMode || !hasDataFolder || appSettings.lanHostEnabled
    settingsLanHostStop.disabled = busy || !isHostMode || !appSettings.lanHostEnabled
    settingsLanClientConnect.disabled = busy || !isClientMode || appSettings.lanClientConnected !== false
    settingsLanClientDisconnect.disabled = busy || !isClientMode || appSettings.lanClientConnected === false
    settingsLanRefreshDiscovery.disabled = busy || !isClientMode
    settingsLanUseDiscoveredHost.disabled = busy || !isClientMode || !hasDiscoveredHost
    settingsExportBackup.disabled = busy || !hasDataFolder
    peopleList.disabled = !hasDataFolder || busy
    loadPersonButton.disabled = !hasDataFolder || !hasSelection || busy
    deletePersonButton.disabled = !hasDataFolder || !hasSelection || busy || survivorWriteBlocked
    showdownSelectA.disabled = !hasDataFolder || busy || showdownDeparted
    showdownSelectB.disabled = !hasDataFolder || busy || showdownDeparted
    openShowdownButton.disabled = !hasDataFolder || !canOpenShowdown || busy || showdownDeparted
    departShowdownButton.disabled = busy || !hasShowdownPairLoaded || showdownDeparted
    refreshShowdownSurvivorsButton.disabled = busy || showdownDeparted || !canOpenShowdown
    showdownOverButton.disabled = busy || !hasShowdownPairLoaded || !showdownDeparted || survivorWriteBlocked
    departShowdownButton.classList.toggle('hidden', showdownDeparted)
    showdownOverButton.classList.toggle('hidden', !showdownDeparted)
    document.body.classList.toggle('departed-active', showdownDeparted)
    if (showdownDeparted) {
      showdownHint.textContent = `Showdown departed. Slots locked: ${showdownLockedSlots.A || '-'} vs ${
        showdownLockedSlots.B || '-'
      }.`
      showdownSessionState.textContent = 'Session departed'
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
    knowledgeTemplateSelect.disabled = busy || knowledgeTemplatePickerState.scratchEditorActive
    knowledgeTemplateSearch.disabled = busy || knowledgeTemplatePickerState.scratchEditorActive
    knowledgeTemplateUse.disabled =
      busy ||
      knowledgeTemplatePickerState.scratchEditorActive ||
      knowledgeTemplatePickerState.forceScratchOnly ||
      knowledgeTemplateSelect.options.length === 0 ||
      knowledgeTemplateSelect.value === ''
    knowledgeTemplateScratch.disabled =
      busy ||
      (!knowledgeTemplatePickerState.scratchEditorActive && knowledgeTemplatePickerState.forceTemplateOnly)
    knowledgeEntryName.disabled = busy || !knowledgeTemplatePickerState.scratchEditorActive
    knowledgeEntryObservation.disabled = busy || !knowledgeTemplatePickerState.scratchEditorActive
    knowledgeEntryRules.disabled = busy || !knowledgeTemplatePickerState.scratchEditorActive
    knowledgeEntryRequirement.disabled = busy || !knowledgeTemplatePickerState.scratchEditorActive
    knowledgeEntryLevel.disabled = true
    knowledgeEntryNextMode.disabled = busy || !knowledgeTemplatePickerState.scratchEditorActive
    knowledgeEntryNextTemplate.disabled =
      busy ||
      !knowledgeTemplatePickerState.scratchEditorActive ||
      knowledgeEntryNextMode.value !== 'existingTemplate'
    knowledgeEntrySaveTemplate.disabled = busy || !knowledgeTemplatePickerState.scratchEditorActive
    syncKnowledgeSaveTemplateToggle()
    newPersonTemplateButton.disabled = !hasDataFolder || busy || survivorWriteBlocked
    savePersonButton.disabled = !hasDataFolder || busy || survivorWriteBlocked
    loadJsonToVisualButton.disabled = busy
    veWeaponProficiencyType.disabled = busy
    addFightingArtButton.disabled = busy
    addSecretFightingArtButton.disabled = busy
    addDisorderButton.disabled = busy
    addTenetKnowledgeButton.disabled = busy
    addKnowledgeButton.disabled = busy
    settlementNameSearch.disabled = !hasDataFolder || busy
    settlementTraitSearch.disabled = !hasDataFolder || busy
    settlementToggleExtraFiltersButton.disabled = !hasDataFolder || busy
    settlementToggleMovement.disabled = !hasDataFolder || busy
    settlementToggleWeaponProficiency.disabled = !hasDataFolder || busy
    settlementToggleLastUpdated.disabled = !hasDataFolder || busy
    settlementToggleLastReturned.disabled = !hasDataFolder || busy
    settlementToggleStatsTotal.disabled = !hasDataFolder || busy
    settlementClearFiltersButton.disabled = !hasDataFolder || busy
    settingsUserName.disabled = busy
    settingsDateFormat.disabled = busy
    settingsFastMode.disabled = busy
    settingsSurvivorDataMode.disabled = busy
    settingsLanDisplayName.disabled = busy
    settingsLanHostAddress.disabled = busy
    settingsLanPort.disabled = busy
    settingsLanAutoReconnect.disabled = busy
    settingsLanHostEnabled.disabled = busy
    settingsLanHostStart.disabled = busy || appSettings.survivorDataMode !== 'lan-host' || appSettings.lanHostEnabled
    settingsLanHostStop.disabled = busy || appSettings.survivorDataMode !== 'lan-host' || !appSettings.lanHostEnabled
    settingsLanClientConnect.disabled =
      busy ||
      appSettings.survivorDataMode !== 'lan-client' ||
      !String(appSettings.lanHostAddress || '').trim() ||
      appSettings.lanClientConnected !== false
    settingsLanClientDisconnect.disabled =
      busy || appSettings.survivorDataMode !== 'lan-client' || appSettings.lanClientConnected === false
    settlementAutoRefreshEnabled.disabled = !hasDataFolder || busy
    settlementAutoRefreshInterval.disabled = !hasDataFolder || busy || !settlementAutoRefreshOn
    settlementRefreshNow.disabled = !hasDataFolder || busy
    settlementAddBulkChangeButton.disabled = !hasDataFolder || busy
    for (const control of settlementBulkRows.querySelectorAll('input, select, button')) {
      control.disabled =
        !hasDataFolder || busy || (control instanceof HTMLButtonElement && control.dataset.removeBulkChange !== undefined && settlementBulkChanges.length === 1)
    }
    settlementApplyBulkButton.disabled = !hasDataFolder || busy || settlementRecords.length === 0 || survivorWriteBlocked
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
      busy || (createViewMode === 'defaultTemplate' ? !hasDefaultTemplateFolder : !hasDataFolder || survivorWriteBlocked)
    resetCreateSurvivorButton.disabled = busy
    createAddFightingArtButton.disabled = busy
    createAddSecretFightingArtButton.disabled = busy
    createAddDisorderButton.disabled = busy
    createAddTenetKnowledgeButton.disabled = busy
    createAddKnowledgeButton.disabled = busy
    createAddAbilityButton.disabled = busy
    createAddImpairmentButton.disabled = busy
    createAddNoteButton.disabled = busy
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

  function clearButtonFeedbackTimer(button) {
    if (!(button instanceof HTMLButtonElement)) return
    const timerId = buttonFeedbackTimers.get(button)
    if (timerId) {
      window.clearTimeout(timerId)
      buttonFeedbackTimers.delete(button)
    }
  }

  function resetButtonFeedback(button) {
    if (!(button instanceof HTMLButtonElement)) return
    clearButtonFeedbackTimer(button)
    button.classList.remove('btn-feedback-pending', 'btn-feedback-success', 'btn-feedback-error')
    button.removeAttribute('aria-busy')
    if (button.dataset.feedbackDefaultLabel) {
      button.textContent = button.dataset.feedbackDefaultLabel
    }
    delete button.dataset.feedbackState
  }

  function setButtonFeedbackState(button, state, label) {
    if (!(button instanceof HTMLButtonElement)) return
    clearButtonFeedbackTimer(button)
    if (!button.dataset.feedbackDefaultLabel) {
      button.dataset.feedbackDefaultLabel = button.textContent || ''
    }
    button.textContent = label
    button.dataset.feedbackState = state
    button.classList.remove('btn-feedback-pending', 'btn-feedback-success', 'btn-feedback-error')
    button.classList.add(`btn-feedback-${state}`)
    if (state === 'pending') button.setAttribute('aria-busy', 'true')
    else button.removeAttribute('aria-busy')
  }

  function scheduleButtonFeedbackReset(button, delayMs = 1100) {
    if (!(button instanceof HTMLButtonElement) || !button.isConnected) return
    clearButtonFeedbackTimer(button)
    const timerId = window.setTimeout(() => {
      if (!button.isConnected) return
      resetButtonFeedback(button)
    }, delayMs)
    buttonFeedbackTimers.set(button, timerId)
  }

  async function runWithButtonFeedback(button, task, options = {}) {
    if (!(button instanceof HTMLButtonElement)) return task()
    if (button.dataset.feedbackState === 'pending') return null

    const pendingLabel = options.pendingLabel || 'Saving...'
    const successLabel = options.successLabel || 'Saved'
    const invalidLabel = options.invalidLabel || 'Check fields'
    const errorLabel = options.errorLabel || 'Retry save'

    setButtonFeedbackState(button, 'pending', pendingLabel)

    try {
      const result = await task()
      if (result === false) {
        if (button.isConnected) {
          setButtonFeedbackState(button, 'error', invalidLabel)
          scheduleButtonFeedbackReset(button, options.invalidDelayMs || 1400)
        }
        return result
      }
      if (button.isConnected) {
        setButtonFeedbackState(button, 'success', successLabel)
        scheduleButtonFeedbackReset(button, options.successDelayMs || 1000)
      }
      return result
    } catch (err) {
      if (button.isConnected) {
        setButtonFeedbackState(button, 'error', errorLabel)
        scheduleButtonFeedbackReset(button, options.errorDelayMs || 1500)
      }
      throw err
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
    knowledgeTemplatePickerState.scratchEditorActive = false
    knowledgeTemplateModal.classList.add('hidden')
    knowledgeTemplateModal.setAttribute('aria-hidden', 'true')
    syncKnowledgeTemplateModalMode()
  }

  function openKnowledgeTemplatePickerModal() {
    knowledgeTemplateModal.classList.remove('hidden')
    knowledgeTemplateModal.setAttribute('aria-hidden', 'false')
  }

  function getNextKnowledgeModeLabel(mode) {
    if (mode === 'existingTemplate') return 'Existing Template'
    if (mode === 'maxLevel') return 'MAX LEVEL'
    return 'No Template'
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

  function getShowdownModifier(slot, field) {
    return ensureShowdownModifier(showdownModifiers, slot, field) || createShowdownModifier()
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
    snapshotCreateFormAsClean()
  }

  function renderCreateArrayRows(source) {
    createArrayState = {
      abilities: deepClone(source.abilities || []),
      impairments: deepClone(source.impairments || []),
      notes: deepClone(source.notes || []),
      fightingArts: deepClone(source.fightingArts || []),
      secretFightingArts: deepClone(source.secretFightingArts || []),
      disorders: deepClone(source.disorders || []),
      tenetKnowledge: deepClone(source.tenetKnowledge || []),
      knowledge: deepClone(source.knowledge || [])
    }
    for (const arrayName of TEXT_ENTRY_ARRAYS) syncCreateTextDraftState(arrayName)
    renderCreateTextRows(createAbilities, createArrayState.abilities, 'abilities')
    renderCreateTextRows(createImpairments, createArrayState.impairments, 'impairments')
    renderCreateTextRows(createNotes, createArrayState.notes, 'notes')
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
        textInput.placeholder = getTextEntryPlaceholder(type)
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
    if (!isTextEntryArrayName(type)) return
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
    if (!isTextEntryArrayName(type) || Number.isNaN(index) || index < 0) return null
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
    for (const arrayName of TEXT_ENTRY_ARRAYS) syncCreateTextDraftState(arrayName)
    createArrayState = {
      abilities: (createArrayState.abilities || []).map(item => String(item || '').trim()).filter(Boolean),
      impairments: (createArrayState.impairments || []).map(item => String(item || '').trim()).filter(Boolean),
      notes: (createArrayState.notes || []).map(item => String(item || '').trim()).filter(Boolean),
      fightingArts: collectVisualRows(createFightingArts, 'fightingArts'),
      secretFightingArts: collectVisualRows(createSecretFightingArts, 'secretFightingArts'),
      disorders: collectVisualRows(createDisorders, 'disorders'),
      tenetKnowledge: collectVisualRows(createTenetKnowledge, 'tenet'),
      knowledge: collectVisualRows(createKnowledge, 'knowledge')
    }
    for (const arrayName of TEXT_ENTRY_ARRAYS) syncCreateTextDraftState(arrayName)
  }

  function addCreateArrayEntry(type) {
    syncCreateArraysFromDom()
    if (isTextEntryArrayName(type)) {
      const container = getCreateTextContainer(type)
      if (!container) return
      createArrayState[type].push('')
      syncCreateTextDraftState(type)
      const draft = createTextDraftState[type][createArrayState[type].length - 1]
      if (draft) {
        draft.isEditing = true
        draft.draft = ''
      }
      renderCreateTextRows(container, createArrayState[type], type)
      syncCreateDirtyState()
      return
    }
    if (type === 'fightingArts') {
      if (createArrayState.fightingArts.length >= 3) {
        setStatus('fightingArts can only contain 3 entries', 'error')
        return
      }
      createArrayState.fightingArts.push({ name: '', file: '' })
      renderArrayRows(createFightingArts, createArrayState.fightingArts, 'fightingArts')
      syncCreateDirtyState()
      return
    }
    if (type === 'secretFightingArts') {
      if (createArrayState.secretFightingArts.length >= 3) {
        setStatus('secretFightingArts can only contain 3 entries', 'error')
        return
      }
      createArrayState.secretFightingArts.push({ name: '', file: '' })
      renderArrayRows(createSecretFightingArts, createArrayState.secretFightingArts, 'secretFightingArts')
      syncCreateDirtyState()
      return
    }
    if (type === 'disorders') {
      if (createArrayState.disorders.length >= 3) {
        setStatus('disorders can only contain 3 entries', 'error')
        return
      }
      createArrayState.disorders.push({ name: '', file: '' })
      renderArrayRows(createDisorders, createArrayState.disorders, 'disorders')
      syncCreateDirtyState()
      return
    }
    if (type === 'tenetKnowledge') {
      if (createArrayState.tenetKnowledge.length >= TENET_KNOWLEDGE_LIMIT) {
        setStatus(`tenetKnowledge can only contain ${TENET_KNOWLEDGE_LIMIT} entry`, 'error')
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
      syncCreateDirtyState()
      return
    }
    if (type === 'knowledge') {
      if (createArrayState.knowledge.length >= KNOWLEDGE_LIMIT) {
        setStatus(`knowledge can only contain ${KNOWLEDGE_LIMIT} entries`, 'error')
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
      syncCreateDirtyState()
    }
  }

  function removeCreateArrayRow(row) {
    const type = row.dataset.arrayType
    const index = Number(row.dataset.index)
    syncCreateArraysFromDom()
    if (isTextEntryArrayName(type)) createArrayState[type].splice(index, 1)
    if (type === 'fightingArts') createArrayState.fightingArts.splice(index, 1)
    if (type === 'secretFightingArts') createArrayState.secretFightingArts.splice(index, 1)
    if (type === 'disorders') createArrayState.disorders.splice(index, 1)
    if (type === 'tenet') createArrayState.tenetKnowledge.splice(index, 1)
    if (type === 'knowledge') createArrayState.knowledge.splice(index, 1)
    renderCreateTextRows(createAbilities, createArrayState.abilities, 'abilities')
    renderCreateTextRows(createImpairments, createArrayState.impairments, 'impairments')
    renderCreateTextRows(createNotes, createArrayState.notes, 'notes')
    renderArrayRows(createFightingArts, createArrayState.fightingArts, 'fightingArts')
    renderArrayRows(createSecretFightingArts, createArrayState.secretFightingArts, 'secretFightingArts')
    renderArrayRows(createDisorders, createArrayState.disorders, 'disorders')
    renderArrayRows(createTenetKnowledge, createArrayState.tenetKnowledge, 'tenet')
    renderArrayRows(createKnowledge, createArrayState.knowledge, 'knowledge')
    syncCreateDirtyState()
  }

  function editCreateTextRow(row) {
    const type = row?.dataset?.arrayType
    const index = Number(row?.dataset?.index)
    if (!isTextEntryArrayName(type) || Number.isNaN(index) || index < 0) return
    syncCreateTextDraftState(type)
    const entry = createTextDraftState[type][index]
    if (!entry) return
    entry.isEditing = true
    entry.draft = entry.text
    const container = getCreateTextContainer(type)
    if (!container) return
    renderCreateTextRows(container, createArrayState[type], type)
    syncCreateDirtyState()
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
    const container = getCreateTextContainer(update.type)
    if (!container) return
    renderCreateTextRows(container, createArrayState[update.type], update.type)
    syncCreateDirtyState()
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
      return false
    }
    await window.api.saveKnowledgeTemplate(entryType, template)
    await refreshKnowledgeTemplateCache(entryType)
    setStatus(`Saved ${template.name} as reusable template`, 'success')
    return true
  }

  async function applyCreateNeurosisTemplate() {
    await openNeurosisTemplatePicker({ mode: 'create' })
  }

  async function saveCreateNeurosisTemplate() {
    const neurosis = createPhilosophyNeurosis.value.trim()
    if (!neurosis) {
      setStatus('Enter neurosis text before saving a template', 'error')
      return false
    }
    const name = createNeurosisTemplateName.value.trim()
    if (!name) {
      setStatus('Template name is required', 'error')
      return false
    }
    await window.api.saveNeurosisTemplate({ name, neurosis })
    createNeurosisTemplateName.value = name
    syncCreateDirtyState()
    setStatus(`Saved neurosis template: ${name}`, 'success')
    return true
  }

  function insertKnowledgeEntryIntoEditor(arrayName, entry) {
    const parsed = parseEditorJson()
    if (!parsed) return false
    if (!Array.isArray(parsed[arrayName])) parsed[arrayName] = []
    const max = arrayName === 'tenetKnowledge' ? TENET_KNOWLEDGE_LIMIT : KNOWLEDGE_LIMIT
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
    const max = arrayName === 'tenetKnowledge' ? TENET_KNOWLEDGE_LIMIT : KNOWLEDGE_LIMIT
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
    syncCreateDirtyState()
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
    syncCreateDirtyState()
    return true
  }

  function insertKnowledgeEntryIntoShowdown(slot, arrayName, entry) {
    if (!slot || !showdownPeople[slot]) return false
    const person = showdownPeople[slot].person
    if (!Array.isArray(person[arrayName])) person[arrayName] = []
    const max = arrayName === 'tenetKnowledge' ? TENET_KNOWLEDGE_LIMIT : KNOWLEDGE_LIMIT
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

  function renderKnowledgeEntryNextTemplateOptions() {
    const entryType = getKnowledgeTypeFromArrayName(knowledgeTemplatePickerState.type)
    const templates = Array.isArray(knowledgeTemplatePickerState.templates) ? knowledgeTemplatePickerState.templates : []
    const currentValue = String(knowledgeEntryNextTemplate.value || '').trim()
    knowledgeEntryNextTemplate.innerHTML = ''

    const noneOption = document.createElement('option')
    noneOption.value = ''
    noneOption.textContent = 'Select next template...'
    knowledgeEntryNextTemplate.appendChild(noneOption)

    for (const template of templates) {
      const option = document.createElement('option')
      option.value = template.fileName
      option.textContent = entryType ? getKnowledgeTemplateLabel(entryType, template) : String(template.name || 'Unnamed Template')
      if (template.fileName === currentValue) option.selected = true
      knowledgeEntryNextTemplate.appendChild(option)
    }
  }

  function syncKnowledgeScratchEditorState() {
    const mode = String(knowledgeEntryNextMode.value || 'noTemplate')
    knowledgeEntryNextTemplate.disabled = mode !== 'existingTemplate'
    if (mode !== 'existingTemplate') knowledgeEntryNextTemplate.value = ''
  }

  function syncKnowledgeSaveTemplateToggle() {
    const enabled = !knowledgeEntrySaveTemplate.disabled
    const checked = Boolean(knowledgeEntrySaveTemplate.checked)
    knowledgeEntrySaveTemplateToggle.disabled = !enabled
    knowledgeEntrySaveTemplateToggle.setAttribute('aria-pressed', checked ? 'true' : 'false')
    knowledgeEntrySaveTemplateToggle.classList.toggle('is-active', checked)
    knowledgeEntrySaveTemplateToggle.classList.toggle('is-off', !checked)
    knowledgeEntrySaveTemplateToggle.innerHTML = checked
      ? 'Save Upgraded Knowledge as Reusable Template <span class="knowledge-entry-toggle-state">ON</span>'
      : 'Save Upgraded Knowledge as Reusable Template <span class="knowledge-entry-toggle-state">OFF</span>'
  }

  function populateKnowledgeScratchEditor(entry) {
    const nextEntry = entry && typeof entry === 'object' ? entry : buildBlankKnowledgeEntry('knowledge')
    knowledgeEntryName.value = String(nextEntry.name || '')
    knowledgeEntryObservation.value = String(nextEntry.observation || '')
    knowledgeEntryRules.value = String(nextEntry.rules || '')
    knowledgeEntryRequirement.value = String(Math.max(0, coerceNumber(nextEntry.observationRequirement, 0)))
    knowledgeEntryLevel.value = String(Math.max(1, coerceNumber(nextEntry.knowledgeLevel, 1)))
    const nextMode = String(nextEntry.nextKnowledgeMode || 'noTemplate')
    knowledgeEntryNextMode.value =
      nextMode === 'existingTemplate' || nextMode === 'maxLevel' || nextMode === 'noTemplate' ? nextMode : 'noTemplate'
    renderKnowledgeEntryNextTemplateOptions()
    knowledgeEntryNextTemplate.value =
      knowledgeEntryNextMode.value === 'existingTemplate' ? String(nextEntry.nextKnowledgeTemplate || '').trim() : ''
    syncKnowledgeScratchEditorState()
  }

  function collectKnowledgeScratchEditorEntry(entryType) {
    const entry = buildBlankKnowledgeEntry(entryType)
    entry.name = String(knowledgeEntryName.value || '').trim()
    entry.observation = String(knowledgeEntryObservation.value || '').trim()
    entry.rules = String(knowledgeEntryRules.value || '').trim()
    entry.observationRequirement = Math.max(0, coerceNumber(knowledgeEntryRequirement.value, 0))
    entry.knowledgeLevel = Math.max(1, coerceNumber(knowledgeEntryLevel.value, 1))
    const nextMode = String(knowledgeEntryNextMode.value || 'noTemplate')
    entry.nextKnowledgeMode =
      nextMode === 'existingTemplate' || nextMode === 'maxLevel' || nextMode === 'noTemplate' ? nextMode : 'noTemplate'
    entry.nextKnowledgeTemplate =
      entry.nextKnowledgeMode === 'existingTemplate' ? String(knowledgeEntryNextTemplate.value || '').trim() : ''
    entry.currentObservations = 0
    return entry
  }

  async function saveKnowledgeTemplateFromEntry(entryType, entry) {
    const template = normalizeKnowledgeTemplateForEntry(entryType, entry)
    if (!template.name) {
      setStatus('Template name is required', 'error')
      return false
    }
    await window.api.saveKnowledgeTemplate(entryType, template)
    await refreshKnowledgeTemplateCache(entryType)
    setStatus(`Saved ${template.name} as reusable template`, 'success')
    return true
  }

  function syncKnowledgeTemplateModalMode() {
    const scratchEditorActive = Boolean(knowledgeTemplatePickerState.scratchEditorActive)
    knowledgeTemplateLibrary.classList.toggle('hidden', scratchEditorActive)
    knowledgeEntryEditor.classList.toggle('hidden', !scratchEditorActive)
    knowledgeTemplateUse.classList.toggle('hidden', scratchEditorActive)
    knowledgeTemplateSearch.disabled = busy || scratchEditorActive
    knowledgeTemplateSelect.disabled = busy || scratchEditorActive
    knowledgeEntryName.disabled = busy || !scratchEditorActive
    knowledgeEntryObservation.disabled = busy || !scratchEditorActive
    knowledgeEntryRules.disabled = busy || !scratchEditorActive
    knowledgeEntryRequirement.disabled = busy || !scratchEditorActive
    knowledgeEntryLevel.disabled = true
    knowledgeEntryNextMode.disabled = busy || !scratchEditorActive
    knowledgeEntryNextTemplate.disabled = busy || !scratchEditorActive || knowledgeEntryNextMode.value !== 'existingTemplate'
    knowledgeEntrySaveTemplate.disabled = busy || !scratchEditorActive
    syncKnowledgeSaveTemplateToggle()
  }

  function openKnowledgeScratchEditorForShowdownUpgrade() {
    const entryType = getKnowledgeTypeFromArrayName(knowledgeTemplatePickerState.type)
    if (!entryType) return
    knowledgeTemplatePickerState.scratchEditorActive = true
    knowledgeTemplateTitle.textContent = `Write ${knowledgeTemplatePickerState.type === 'tenetKnowledge' ? 'Tenet Knowledge' : 'Knowledge'}`
    knowledgeTemplateHint.textContent = 'Write the upgraded knowledge now, then save it straight into the showdown entry.'
    knowledgeTemplateScratch.textContent = 'Save Knowledge'
    populateKnowledgeScratchEditor(buildUpgradedScratchKnowledge(entryType, knowledgeTemplatePickerState.sourceItem))
    knowledgeEntrySaveTemplate.checked = false
    syncKnowledgeTemplateModalMode()
    openKnowledgeTemplatePickerModal()
    window.requestAnimationFrame(() => {
      knowledgeEntryName.focus()
      knowledgeEntryName.select()
    })
  }

  async function applyKnowledgeTemplateSelection(useTemplate) {
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
        syncCreateDirtyState()
      }
      closeKnowledgeTemplatePickerModal()
      setStatus(`Loaded neurosis template: ${selected.name || 'Unnamed'}`, 'success')
      return
    }

    const entryType = getKnowledgeTypeFromArrayName(arrayName)
    if (!entryType) return
    const isUpgrade = knowledgeTemplatePickerState.action === 'upgrade'
    if (!useTemplate && isUpgrade && knowledgeTemplatePickerState.mode === 'showdown') {
      if (!knowledgeTemplatePickerState.scratchEditorActive) {
        openKnowledgeScratchEditorForShowdownUpgrade()
        return
      }
      const entry = collectKnowledgeScratchEditorEntry(entryType)
      const sourceItem = knowledgeTemplatePickerState.sourceItem || {}
      const minLevel = Math.max(1, coerceNumber(sourceItem.knowledgeLevel, 1)) + 1
      entry.knowledgeLevel = Math.max(minLevel, coerceNumber(entry.knowledgeLevel, minLevel))
      if (knowledgeEntrySaveTemplate.checked) {
        const saved = await saveKnowledgeTemplateFromEntry(entryType, entry)
        if (!saved) return
      }
      if (!replaceKnowledgeEntryInShowdown(knowledgeTemplatePickerState.slot, arrayName, knowledgeTemplatePickerState.index, entry)) {
        return
      }
      closeKnowledgeTemplatePickerModal()
      setStatus(
        `${arrayName === 'tenetKnowledge' ? 'Tenet Knowledge' : 'Knowledge'} upgraded and filled in${
          knowledgeEntrySaveTemplate.checked ? ', and saved as a template' : ''
        }`,
        'success'
      )
      return
    }

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
    let previousUnlocked = false
    for (const template of templates) {
      if (previousUnlocked && !template.unlocked) {
        const separator = document.createElement('option')
        separator.value = ''
        separator.textContent = '-----'
        separator.disabled = true
        knowledgeTemplateSelect.appendChild(separator)
      }
      previousUnlocked = Boolean(template.unlocked)
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
      const selectedIndex = preferredIndex >= 0 ? preferredIndex : 0
      const unlockedCount = templates.filter(template => template.unlocked).length
      const hasSeparator = unlockedCount > 0 && unlockedCount < templates.length
      knowledgeTemplateSelect.selectedIndex = selectedIndex + (hasSeparator && selectedIndex >= unlockedCount ? 1 : 0)
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
    await refreshKnowledgeTemplateCache()
    let settlement = null
    try {
      settlement = await window.api.getSettlementRecord()
      if (settlement.pendingOperations) setStatus(`${settlement.pendingOperations} settlement registration(s) still pending recovery.`, 'error')
    } catch (err) {
      setStatus(`Settlement knowledge unavailable: ${err.message}. Showing local templates only.`, 'error')
    }
    // Slot limits remain distinct, but both template folders share one discovery pool.
    const otherType = type === 'knowledge' ? 'tenetKnowledge' : 'knowledge'
    const templates = settlementKnowledgeOptions([...knowledgeTemplateCache[type], ...knowledgeTemplateCache[otherType]], settlement)
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
    knowledgeTemplatePickerState.scratchEditorActive = false

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
    syncKnowledgeTemplateModalMode()
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
    next.notes = deepClone(createArrayState.notes)
    next.fightingArts = deepClone(createArrayState.fightingArts)
    next.secretFightingArts = deepClone(createArrayState.secretFightingArts)
    next.disorders = deepClone(createArrayState.disorders)
    next.tenetKnowledge = deepClone(createArrayState.tenetKnowledge)
    next.knowledge = deepClone(createArrayState.knowledge)
    return next
  }

  async function openSurvivorInCreateView(fileName) {
    if (!confirmDiscardCreateChanges(`open ${fileName}`)) return
    const person = await refreshLanStatusAfterSurvivorOperation(() => window.api.loadPerson(fileName))
    createViewMode = 'edit'
    createEditingFileName = fileName
    createSurvivorTitle.textContent = 'View Survivor'
    createSurvivorHint.textContent = `Editing ${fileName}. Save to persist updates to settlement.`
    createSurvivorSubmit.textContent = 'Save Survivor'
    renderCreateSurvivorForm(person)
    setPage('create')
  }

  function formatSettlementTimestamp(value) {
    const timestamp = getSettlementTimestampSortValue(value)
    if (!Number.isFinite(timestamp)) return '-'
    return new Date(timestamp).toLocaleString(appSettings.dateFormat)
  }

  function scheduleSettlementSearchRender() {
    if (settlementViewController) settlementViewController.scheduleSettlementSearchRender()
  }

  function renderSettlementTable() {
    if (settlementViewController) settlementViewController.renderSettlementTable()
  }

  async function applySettlementBulkChange() {
    if (!(await ensureCanWriteSurvivorData('applying bulk survivor updates'))) return
    const changes = collectSettlementBulkChangesFromDom()
    const validChanges = []
    for (const change of changes) {
      const fieldConfig = BULK_EDIT_FIELD_CONFIG[change.field]
      if (!fieldConfig) {
        setStatus('Choose a valid field to update', 'error')
        return
      }
      const delta = coerceInt(change.delta, 0)
      if (delta === 0) {
        setStatus('Each bulk change needs a non-zero delta', 'error')
        return
      }
      validChanges.push({ field: change.field, delta, config: fieldConfig })
    }

    const livingRecords = settlementRecords.filter(record => Boolean(record?.person?.isAlive))
    if (livingRecords.length === 0) {
      setStatus('No living survivors available for bulk update', 'error')
      return
    }

    const summary = validChanges
      .map(change => `${change.delta > 0 ? `+${change.delta}` : String(change.delta)} ${change.config.label}`)
      .join(', ')
    const proceed = window.confirm(`Apply ${summary} to all ${livingRecords.length} living survivors?`)
    if (!proceed) return

    let updated = 0
    let unchanged = 0
    let failed = 0

    for (const record of livingRecords) {
      try {
        const latest = await refreshLanStatusAfterSurvivorOperation(() => window.api.loadPerson(record.fileName))
        if (!latest?.isAlive) {
          unchanged += 1
          continue
        }
        let recordChanged = false
        for (const change of validChanges) {
          const current = coerceNumber(latest?.[change.field], 0)
          const nextValue = clamp(current + change.delta, change.config.min, change.config.max)
          if (nextValue === current) continue
          latest[change.field] = nextValue
          recordChanged = true
        }
        if (!recordChanged) {
          unchanged += 1
          continue
        }
        const result = await refreshLanStatusAfterSurvivorOperation(() =>
          window.api.savePerson(latest, { expectedFileName: record.fileName })
        )
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
    resetSettlementBulkChanges()
    setStatus(
      `Bulk update complete: ${updated} updated, ${unchanged} unchanged, ${failed} failed (${summary})`,
      failed > 0 ? 'error' : 'success'
    )
  }

  async function refreshSettlementData(summaryPayload) {
    const records = Array.isArray(summaryPayload?.records) ? summaryPayload.records : []
    if (!hasDataFolder || records.length === 0) {
      settlementRecords = []
      showdownSession.populateShowdownSelectors([])
      showdownSession.applyShowdownLockSelections()
      renderSettlementTable()
      return
    }

    settlementRecords = records.filter(Boolean)
    showdownSession.populateShowdownSelectors(getAliveShowdownFiles())
    showdownSession.applyShowdownLockSelections()
    renderSettlementTable()
  }


  function iconLabel(iconId, label) {
    if (!iconId) return label
    return `<span class="icon-label"><svg aria-hidden="true"><use href="#${iconId}"></use></svg>${label}</span>`
  }

  function resetShowdownMarkdownContentCache() {
    showdownMarkdownContentCache.clear()
    showdownMarkdownContentPending.clear()
  }

  function formatShowdownMarkdownContent(markdown) {
    return String(markdown || '')
      .replace(/\r\n?/g, '\n')
      .replace(/^\s*---\n[\s\S]*?\n---\s*/u, '')
      .replace(/^#{1,6}\s*/gmu, '')
      .replace(/^\s*[-*+]\s+/gmu, '• ')
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '$1')
      .replace(/(?<!_)_([^_\n]+)_(?!_)/g, '$1')
      .replace(/~~([^~]+)~~/g, '$1')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  function queueShowdownMarkdownContent(arrayName, fileName) {
    const normalizedFile = normalizeMarkdownFileKey(fileName)
    if (!normalizedFile) return
    const cacheKey = `${arrayName}|${normalizedFile}`
    if (showdownMarkdownContentCache.has(cacheKey) || showdownMarkdownContentPending.has(cacheKey)) return

    showdownMarkdownContentPending.add(cacheKey)
    ;(async () => {
      let content = ''
      const matchingCollections = markdownCollections.filter(collection => collectionMatchesArray(collection, arrayName))
      for (const collection of matchingCollections) {
        try {
          const doc = await window.api.loadMarkdownFile(collection.id, normalizedFile)
          content = formatShowdownMarkdownContent(doc?.markdown)
          break
        } catch {
          // Ignore lookup errors and continue to other matching collections.
        }
      }
      showdownMarkdownContentCache.set(cacheKey, content)
    })()
      .finally(() => {
        showdownMarkdownContentPending.delete(cacheKey)
        if (showdownPeople.A || showdownPeople.B) renderShowdown()
      })
  }

  function getShowdownMarkdownContent(arrayName, fileName) {
    const normalizedFile = normalizeMarkdownFileKey(fileName)
    if (!normalizedFile) return ''
    const cacheKey = `${arrayName}|${normalizedFile}`
    if (showdownMarkdownContentCache.has(cacheKey)) {
      return String(showdownMarkdownContentCache.get(cacheKey) || '')
    }
    queueShowdownMarkdownContent(arrayName, normalizedFile)
    return showdownMarkdownContentPending.has(cacheKey) ? 'Loading text...' : ''
  }


  function renderShowdown() {
    renderShowdownSlot('A')
    renderShowdownSlot('B')
  }

  function renderShowdownSlot(slot) {
    const normalizedSlot = slot === 'A' ? 'A' : slot === 'B' ? 'B' : null
    if (!normalizedSlot) return
    const container = normalizedSlot === 'A' ? showdownCardA : showdownCardB
    const person = showdownPeople[normalizedSlot]?.person || {}
    const proficiency = ensureWeaponProficiency(person)
    syncShowdownTextDraftState(normalizedSlot, person)
    const activePage = normalizeShowdownPageKey(showdownPageBySlot[normalizedSlot])
    showdownPageBySlot[normalizedSlot] = activePage
    renderShowdownCard(container, {
      person,
      textDraftState: showdownTextDraftState[normalizedSlot],
      slotLabel: normalizedSlot,
      armor: showdownArmor[normalizedSlot],
      activePage,
      pageConfig: SHOWDOWN_PAGE_CONFIG,
      proficiency,
      callbacks: {
        clamp,
        coerceInt,
        coerceNumber,
        escapeHtml,
        getSelectedMatchmakerGroup,
        getSelectedTinkerGroup,
        getShowdownMarkdownContent,
        getShowdownModifier,
        iconLabel,
        getTextEntryPlaceholder
      }
    })
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
    syncShowdownTextDraftSlotState(showdownTextDraftState, slot, person, TEXT_ENTRY_ARRAYS)
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
    showdownSession.populateShowdownSelectors(files)
    showdownSession.applyShowdownLockSelections()
    syncControlState()
  }

  function getAliveShowdownFiles() {
    return settlementRecords
      .filter(record => Boolean(record?.person?.isAlive))
      .map(record => record.fileName)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
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
      if (parsed.tenetKnowledge.length >= TENET_KNOWLEDGE_LIMIT) {
        setStatus(`tenetKnowledge can only contain ${TENET_KNOWLEDGE_LIMIT} entry`, 'error')
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
      if (parsed.knowledge.length >= KNOWLEDGE_LIMIT) {
        setStatus(`knowledge can only contain ${KNOWLEDGE_LIMIT} entries`, 'error')
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
        max: TENET_KNOWLEDGE_LIMIT,
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
        max: KNOWLEDGE_LIMIT,
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
    if (category === 'knowledges') {
      return {
        field: 'knowledge',
        max: KNOWLEDGE_LIMIT,
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
          syncCreateDirtyState()
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
    const [files, summaryPayload] = await refreshLanStatusAfterSurvivorOperation(() =>
      Promise.all([
        window.api.listPeople(),
        window.api.listPeopleSummaries()
      ])
    )
    populatePeople(files)
    await refreshSettlementData(summaryPayload)
    if (updateRefreshTimestamp) updateSettlementLastRefreshed(new Date())
    const unreadableCount = coerceInt(summaryPayload?.unreadableCount, 0)
    if (!silentStatus) {
      if (unreadableCount > 0) {
        const fileLabel = unreadableCount === 1 ? 'file' : 'files'
        setStatus(
          `Skipped ${unreadableCount} incompatible or invalid survivor ${fileLabel}. Version 3.0.1 requires new-campaign schema 6; select a new Survivors folder in Settings.`,
          'error'
        )
      } else {
        setStatus(`Loaded ${files.length} people`, 'success')
      }
    }
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
    resetShowdownMarkdownContentCache()

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

  async function init() {
    await runBusy(async () => {
      let initialSurvivorReadError = null
      if (typeof window.api.getAppSettings === 'function') {
        appSettings = normalizeAppSettings(await window.api.getAppSettings())
      }
      settingsUserName.value = appSettings.userName
      settingsDateFormat.value = appSettings.dateFormat
      syncLanSettingsUi()
      settingsFastMode.checked = settlementFastMode
      settlementAutoRefreshEnabled.checked = settlementAutoRefreshOn
      settlementAutoRefreshInterval.value = String(settlementAutoRefreshIntervalSeconds)
      updateSettlementLastRefreshed(null)
      dataSources = { ...dataSources, ...(await window.api.getSavedDataSources()) }
      renderDataSources()
      await refreshLanHostInfo()
      await refreshDiscoveredLanHosts()
      await refreshLanConnectionStatus()

      if (hasDataFolder) {
        try {
          await refreshPeople({ updateRefreshTimestamp: true })
        } catch (err) {
          initialSurvivorReadError = err
          peopleCount.textContent = '0 people loaded'
          settlementRecords = []
          renderSettlementTable()
          updateSettlementLastRefreshed(null)
        }
      } else {
        peopleCount.textContent = '0 people loaded'
        settlementRecords = []
        renderSettlementTable()
        updateSettlementLastRefreshed(null)
        setStatus(getSurvivorDataSetupPrompt(), 'neutral')
      }

      const template = await loadDefaultCreateTemplateWithFallback()
      createTemplateDefaults = deepClone(template)
      personJson.value = JSON.stringify(template, null, 2)
      renderVisualEditor(template)
      renderCreateSurvivorForm(template)
      await refreshMarkdownCollections()
      await refreshKnowledgeTemplateCache()
      syncSettlementAutoRefresh()
      scheduleLanConnectionStatusRefresh()
      if (initialSurvivorReadError) {
        showSurvivorReadFailure(
          initialSurvivorReadError,
          'loading survivor data',
          'Failed to load survivor data',
          'The app is ready, but no remote survivors were loaded.'
        )
      }
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

  async function persistAppSettingsFromUi(overrides = {}) {
    const nextSettings = normalizeAppSettings({
      ...appSettings,
      userName: settingsUserName.value,
      dateFormat: settingsDateFormat.value,
      survivorDataMode: settingsSurvivorDataMode.value,
      lanDisplayName: settingsLanDisplayName.value,
      lanHostAddress: settingsLanHostAddress.value,
      lanPort: settingsLanPort.value,
      lanAutoReconnect: settingsLanAutoReconnect.checked,
      lanClientConnected: appSettings.lanClientConnected,
      lanHostEnabled: settingsLanHostEnabled.checked,
      ...(overrides && typeof overrides === 'object' ? overrides : {})
    })
    if (
      nextSettings.userName === appSettings.userName &&
      nextSettings.dateFormat === appSettings.dateFormat &&
      nextSettings.survivorDataMode === appSettings.survivorDataMode &&
      nextSettings.lanDisplayName === appSettings.lanDisplayName &&
      nextSettings.lanHostAddress === appSettings.lanHostAddress &&
      nextSettings.lanPort === appSettings.lanPort &&
      nextSettings.lanAutoReconnect === appSettings.lanAutoReconnect &&
      nextSettings.lanClientConnected === appSettings.lanClientConnected &&
      nextSettings.lanHostEnabled === appSettings.lanHostEnabled
    ) {
      settingsUserName.value = appSettings.userName
      settingsDateFormat.value = appSettings.dateFormat
      syncLanSettingsUi()
      return
    }
    if (typeof window.api.saveAppSettings === 'function') {
      appSettings = normalizeAppSettings(await window.api.saveAppSettings(nextSettings))
    } else {
      appSettings = nextSettings
    }
    settingsUserName.value = appSettings.userName
    settingsDateFormat.value = appSettings.dateFormat
    syncLanSettingsUi()
    renderDataSources()
    await refreshLanHostInfo()
    await refreshDiscoveredLanHosts()
    await refreshLanConnectionStatus()
    scheduleLanConnectionStatusRefresh()
    if (!hasDataFolder) {
      peopleCount.textContent = '0 people loaded'
      settlementRecords = []
      renderSettlementTable()
      updateSettlementLastRefreshed(null)
    }
    renderSettlementTable()
    setStatus(appSettings.userName ? `Settings saved for ${appSettings.userName}` : 'Settings saved', 'success')
  }

  async function applyLanAction(overrides, successMessage) {
    await persistAppSettingsFromUi(overrides)
    syncControlState()
    if (successMessage) setStatus(successMessage, 'success')
  }

  function handleSettingsPersistError(err, fallbackMessage) {
    syncLanSettingsUi()
    syncControlState()
    setStatus(err.message || fallbackMessage, 'error')
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
      showSurvivorReadFailure(
        err,
        'refreshing survivor data',
        'Failed to load people',
        'The current survivor lists were kept unchanged.'
      )
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
  settlementViewController = createSettlementViewController({
    documentRef: document,
    windowRef: window,
    elements: {
      settlementNameSearch,
      settlementTraitSearch,
      settlementToggleMovement,
      settlementToggleWeaponProficiency,
      settlementToggleLastUpdated,
      settlementToggleLastReturned,
      settlementToggleStatsTotal,
      settlementTableBody,
      settlementAliveCount,
      settlementCount,
      settlementBoolFilters,
      settlementTriadFilters,
      settlementSortButtons,
      settlementToggleExtraFiltersButton,
      settlementClearFiltersButton,
      settlementAddBulkChangeButton,
      settlementBulkRows,
      settlementApplyBulkButton
    },
    getState: () => ({
      settlementRecords,
      settlementSort,
      showdownDeparted,
      showdownSelectAValue: showdownSelectA.value,
      showdownSelectBValue: showdownSelectB.value,
      statsFields: SETTLEMENT_STATS_TOTAL_FIELDS
    }),
    callbacks: {
      openSurvivor(fileName) {
        runBusy(() => openSurvivorInCreateView(fileName)).catch(err => {
          showSurvivorReadFailure(
            err,
            'opening the survivor',
            'Failed to open survivor view',
            'The current view was kept unchanged.'
          )
        })
      },
      assignShowdownSlot: (slot, fileName) => showdownSession.assignShowdownSlot(slot, fileName),
      toggleExtraFilters() {
        settlementExtraFiltersOpen = !settlementExtraFiltersOpen
        syncSettlementExtraFilters()
      },
      addBulkChange() {
        collectSettlementBulkChangesFromDom()
        settlementBulkChanges.push(createBulkEditChange())
        renderSettlementBulkRows()
        syncControlState()
      },
      removeBulkChange(index) {
        collectSettlementBulkChangesFromDom()
        if (settlementBulkChanges.length <= 1) return
        settlementBulkChanges.splice(index, 1)
        renderSettlementBulkRows()
        syncControlState()
      },
      bulkRowsChanged() {
        collectSettlementBulkChangesFromDom()
        syncControlState()
      },
      applyBulkChange() {
        runBusy(applySettlementBulkChange).catch(err => {
          setStatus(err.message || 'Failed to apply bulk update', 'error')
        })
      },
      setSort(nextSort) {
        settlementSort = nextSort
      }
    },
    helpers: {
      coerceNumber,
      formatSettlementTimestamp,
      getMatchmakerGroup: getSelectedMatchmakerGroup,
      getTinkerGroup: getSelectedTinkerGroup,
      normalizeProficiencyLevel
    }
  })
  settlementViewController.bindEvents()
  settingsUserName.addEventListener('change', () => {
    runBusy(persistAppSettingsFromUi).catch(err => {
      handleSettingsPersistError(err, 'Failed to save app settings')
    })
  })
  settingsDateFormat.addEventListener('change', () => {
    runBusy(persistAppSettingsFromUi).catch(err => {
      handleSettingsPersistError(err, 'Failed to save app settings')
    })
  })
  for (const control of [
    settingsSurvivorDataMode,
    settingsLanDisplayName,
    settingsLanHostAddress,
    settingsLanPort,
    settingsLanAutoReconnect,
    settingsLanHostEnabled
  ]) {
    control.addEventListener('change', () => {
      runBusy(persistAppSettingsFromUi).catch(err => {
        handleSettingsPersistError(err, 'Failed to save app settings')
      })
    })
  }
  settingsLanHostStart.addEventListener('click', () => {
    runBusy(() => applyLanAction({ survivorDataMode: 'lan-host', lanHostEnabled: true }, 'LAN host started')).catch(err => {
      handleSettingsPersistError(err, 'Failed to start LAN host')
    })
  })
  settingsLanHostStop.addEventListener('click', () => {
    runBusy(() => applyLanAction({ survivorDataMode: 'lan-host', lanHostEnabled: false }, 'LAN host stopped')).catch(err => {
      handleSettingsPersistError(err, 'Failed to stop LAN host')
    })
  })
  settingsLanClientConnect.addEventListener('click', () => {
    runBusy(() => applyLanAction({ survivorDataMode: 'lan-client', lanClientConnected: true }, 'LAN client connected')).catch(err => {
      handleSettingsPersistError(err, 'Failed to connect LAN client')
    })
  })
  settingsLanClientDisconnect.addEventListener('click', () => {
    runBusy(() => applyLanAction({ survivorDataMode: 'lan-client', lanClientConnected: false }, 'LAN client disconnected')).catch(err => {
      handleSettingsPersistError(err, 'Failed to disconnect LAN client')
    })
  })
  settingsLanRefreshDiscovery.addEventListener('click', () => {
    runBusy(() => refreshDiscoveredLanHosts({ showStatus: true })).catch(err => {
      setStatus(err.message || 'Failed to scan LAN hosts', 'error')
    })
  })
  settingsLanUseDiscoveredHost.addEventListener('click', () => {
    runBusy(useSelectedDiscoveredHost).catch(err => {
      handleSettingsPersistError(err, 'Failed to use discovered LAN host')
    })
  })
  settingsExportBackup.addEventListener('click', () => {
    runBusy(exportSurvivorDataBackup).catch(err => {
      setStatus(err.message || 'Failed to export survivor backup', 'error')
    })
  })
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
      showSurvivorReadFailure(
        err,
        'refreshing Settlement',
        'Failed to refresh settlement data',
        'The current settlement list was kept unchanged.'
      )
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

  syncSettlementExtraFilters()

  navShowdownButton.addEventListener('click', () => {
    if (currentPage === 'showdown') return
    if (!confirmDiscardCreateChanges('open showdown')) return
    runBusy(async () => {
      if (showdownPeople.A && showdownPeople.B && !showdownSession.hasShowdownSelectionMismatch()) {
        setPage('showdown')
        renderShowdown()
        syncControlState()
        setStatus(
          showdownDeparted ? 'Resumed departed showdown session' : 'Resumed in-memory showdown session',
          'neutral'
        )
        return
      }
      showdownSession.reconcileShowdownMemoryForSelectionChange()
      await showdownSession.openShowdownView()
    }).catch(err => {
      showSurvivorReadFailure(
        err,
        'opening Showdown',
        'Failed to open showdown view',
        'The current view was kept unchanged.'
      )
    })
  })
  navDataSourcesButton.addEventListener('click', () => {
    if (currentPage === 'dataSources') return
    if (!confirmDiscardCreateChanges('open settings')) return
    setPage('dataSources')
  })
  navLanStatus.addEventListener('click', () => {
    if (currentPage === 'dataSources') return
    if (!confirmDiscardCreateChanges('open settings')) return
    setPage('dataSources')
  })
  navCreateButton.addEventListener('click', () => {
    if (currentPage === 'create') return
    if (!confirmDiscardCreateChanges('open Create Survivor')) return
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
    if (!confirmDiscardCreateChanges('open the default template')) return Promise.resolve()
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
    if (!confirmDiscardCreateChanges('open settlement')) return
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
    if (!confirmDiscardCreateChanges('open Bulk Updates')) return
    runBusy(async () => {
      if (inShowdownMode) {
        setStatus('Showdown session kept active while in Bulk Updates view.', 'neutral')
      }
      setPage('bulkUpdates')
    }).catch(err => {
      setStatus(err.message || 'Failed to open bulk updates view', 'error')
    })
  })
  navFullscreenButton.addEventListener('click', () => {
    if (typeof window.api.toggleFullScreen !== 'function') {
      setStatus('Full screen is unavailable in this build', 'error')
      return
    }
    window.api.toggleFullScreen().then(result => {
      const isFullScreen = Boolean(result?.isFullScreen)
      applyWindowFullScreenState(isFullScreen)
      setStatus(isFullScreen ? 'Entered full screen' : 'Exited full screen', 'neutral')
    }).catch(err => {
      setStatus(err.message || 'Failed to toggle full screen', 'error')
    })
  })
  themeSelect.addEventListener('change', () => {
    applyTheme(themeSelect.value)
  })
  // Shared composition dependencies; each module consumes only its own responsibilities.
  // Accessors keep session resets visible without creating a second state owner.
  const showdownConfig = {
    element: showdownView,
    documentRef: document,
    elements: { showdownSelectA, showdownSelectB, openShowdownButton, refreshShowdownSurvivorsButton, departShowdownButton, showdownOverButton },
    session: {
      get showdownPeople() { return showdownPeople },
      set showdownPeople(value) { showdownPeople = value },
      get showdownDeparted() { return showdownDeparted },
      set showdownDeparted(value) { showdownDeparted = value },
      get showdownLockedSlots() { return showdownLockedSlots },
      set showdownLockedSlots(value) { showdownLockedSlots = value },
      get showdownPageBySlot() { return showdownPageBySlot },
      set showdownPageBySlot(value) { showdownPageBySlot = value },
      get showdownArmor() { return showdownArmor },
      set showdownArmor(value) { showdownArmor = value },
      get showdownModifiers() { return showdownModifiers },
      set showdownModifiers(value) { showdownModifiers = value },
      get showdownTextDraftState() { return showdownTextDraftState },
      set showdownTextDraftState(value) { showdownTextDraftState = value },
      get forceShowdownReselection() { return forceShowdownReselection },
      set forceShowdownReselection(value) { forceShowdownReselection = value },
    },
    getState: () => ({
      currentPage,
      settlementRecords,
      knowledgeTemplateCache,
      showdownArmor,
      showdownModifiers,
      showdownPageBySlot,
      showdownPeople,
      showdownTextDraftState
    }),
    actions: {
      ensureCanWriteSurvivorData,
      getLanClientBlockedMessage,
      refreshLanStatusAfterSurvivorOperation,
      renderShowdown,
      syncControlState,
      renderSettlementTable,
      setPage,
      refreshPeople,
      showSurvivorReadFailure,
      openAddPicker,
      openKnowledgeScratchEditorForShowdownUpgrade,
      openKnowledgeTemplatePicker,
      openMarkdownFromReference,
      refreshKnowledgeTemplateCache,
      renderShowdownSlot,
      replaceKnowledgeEntryInShowdown,
      runBusy,
      runWithButtonFeedback,
      setStatus,
      syncShowdownTextDraftState
    },
    helpers: {
      deepClone,
      SHOWDOWN_DEFAULT_PAGE,
      createShowdownArmorSlotState,
      createShowdownModifierSlotState,
      createEmptyShowdownTextDraftState,
      createShowdownPageState,
      createShowdownArmorState,
      createShowdownTextDraftState,
      createShowdownModifierState,
      applyMatchmakerGroup,
      applyTinkerGroup,
      beginShowdownTextDraft,
      clamp,
      coerceInt,
      commitShowdownTextDraft,
      ensureWeaponProficiency,
      getTextEntrySingularLabel,
      setShowdownModifierValue,
      adjustShowdownArmorAll,
      adjustShowdownArmorPart,
      coerceNumber,
      getKnowledgeTypeFromArrayName,
      getShowdownModifier,
      isTextEntryArrayName,
      normalizeKnowledgeTemplateForEntry,
      normalizeShowdownPageKey,
      setShowdownArmorCheck,
      setShowdownArmorPartValue,
      updateShowdownTextDraft
    },
    services: {
      loadPerson: fileName => window.api.loadPerson(fileName),
      savePerson: (person, options) => window.api.savePerson(person, options),
      confirm: message => window.confirm(message),
      alert: message => window.alert(message),
      saveKnowledgeTemplate: (type, template) => window.api.saveKnowledgeTemplate(type, template)
    }
  }
  const showdownSession = createShowdownSession(showdownConfig)
  const showdownController = createShowdownController(showdownConfig)
  showdownSession.bindEvents()
  showdownController.bindEvents()

  addMarkdownCollection.addEventListener('change', () => {
    runBusy(loadAddPickerFiles).catch(err => {
      setStatus(err.message || 'Failed to load add options', 'error')
    })
  })
  addMarkdownSearch.addEventListener('input', renderAddPickerOptions)
  knowledgeTemplateSearch.addEventListener('input', renderKnowledgeTemplateOptions)
  knowledgeEntryNextMode.addEventListener('change', syncKnowledgeScratchEditorState)
  peopleList.addEventListener('change', syncControlState)

  loadPersonButton.addEventListener('click', () => {
    runBusy(async () => {
      const fileName = peopleList.value
      if (!fileName) {
        setStatus('No person selected', 'error')
        return
      }
      const person = await refreshLanStatusAfterSurvivorOperation(() => window.api.loadPerson(fileName))
      personJson.value = JSON.stringify(person, null, 2)
      renderVisualEditor(person)
      clearValidationErrors()
      setStatus(`Loaded ${fileName}`, 'success')
    }).catch(err => {
      showSurvivorReadFailure(
        err,
        'loading the survivor',
        'Failed to load person',
        'The current editor content was kept unchanged.'
      )
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
      if (!(await ensureCanWriteSurvivorData('deleting survivors'))) return
      const result = await refreshLanStatusAfterSurvivorOperation(() => window.api.deletePerson(fileName))
      if (result && result.ok === false) {
        showSurvivorSaveFailure(result, 'Failed to delete survivor')
        return
      }
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
      if (!(await ensureCanWriteSurvivorData('creating survivors'))) return
      const result = await refreshLanStatusAfterSurvivorOperation(() => window.api.savePerson(person))
      if (!result || result.ok === false) {
        showSurvivorSaveFailure(result, 'Failed to create survivor', { renderValidationErrors: true })
        return
      }

      const savedPerson = await refreshLanStatusAfterSurvivorOperation(() => window.api.loadPerson(result.fileName))
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

      if (!(await ensureCanWriteSurvivorData('saving survivors'))) return
      const result = await refreshLanStatusAfterSurvivorOperation(() => window.api.savePerson(person))
      if (!result || result.ok === false) {
        showSurvivorSaveFailure(result, 'Failed to save person', { renderValidationErrors: true })
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
      syncCreateDirtyState()
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
    const createSaveTemplateButton = target.closest('button[data-action="saveTemplate"]')
    if (createSaveTemplateButton instanceof HTMLButtonElement) {
      const row = createSaveTemplateButton.closest('.ve-row')
      if (!row) return
      const type = row.dataset.arrayType
      if (type !== 'tenet' && type !== 'knowledge') return
      runWithButtonFeedback(createSaveTemplateButton, () => runBusy(() => saveKnowledgeTemplateFromRow(type, row))).catch(
        err => {
          setStatus(err.message || 'Failed to save knowledge template', 'error')
        }
      )
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
    syncCreateDirtyState()
  })

  createSurvivorView.addEventListener('input', event => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    if (target.id === 'createSurvivorAge' || target.id === 'createNextPhilosophyAgeThreshold') {
      const draft = buildCreateSurvivorPayload()
      if (draft) renderPonderIndicator(createPonderIndicator, draft)
    }
    syncCreateDirtyState()
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
  createAddNoteButton.addEventListener('click', () => addCreateArrayEntry('notes'))
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
    runWithButtonFeedback(createNeurosisSaveTemplate, () => runBusy(saveCreateNeurosisTemplate)).catch(err => {
      setStatus(err.message || 'Failed to save neurosis template', 'error')
    })
  })

  resetCreateSurvivorButton.addEventListener('click', () => {
    if (!confirmDiscardCreateChanges('reset the form')) return
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
    if (!confirmDiscardCreateChanges(createViewMode === 'defaultTemplate' ? 'return to settings' : 'return to settlement')) return
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
        createViewBase = deepClone(person)
        snapshotCreateFormAsClean()
        setStatus('Saved default template for new survivors', 'success')
        return
      }

      if (!hasDataFolder) {
        setStatus(isLanClientMode() ? 'Enter a LAN host address before creating a survivor' : 'Select a data folder before creating a survivor', 'error')
        return
      }

      const previousEditingFile = createEditingFileName
      const wasEditingExisting = Boolean(previousEditingFile)

      if (!(await ensureCanWriteSurvivorData(wasEditingExisting ? 'saving survivors' : 'creating survivors'))) return
      const result = await refreshLanStatusAfterSurvivorOperation(() =>
        window.api.savePerson(person, {
          expectedFileName: wasEditingExisting ? previousEditingFile : undefined
        })
      )
      if (!result || result.ok === false) {
        showSurvivorSaveFailure(result, wasEditingExisting ? 'Failed to save survivor' : 'Failed to create survivor')
        return
      }

      await refreshPeople()
      peopleList.value = result.fileName
      const savedPerson = await refreshLanStatusAfterSurvivorOperation(() => window.api.loadPerson(result.fileName))
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

    const editorSaveTemplateButton = target.closest('button[data-action="saveTemplate"]')
    if (editorSaveTemplateButton instanceof HTMLButtonElement) {
      const row = editorSaveTemplateButton.closest('.ve-row')
      if (!row) return
      const type = row.dataset.arrayType
      if (type !== 'tenet' && type !== 'knowledge') return
      runWithButtonFeedback(editorSaveTemplateButton, () => runBusy(() => saveKnowledgeTemplateFromRow(type, row))).catch(
        err => {
          setStatus(err.message || 'Failed to save knowledge template', 'error')
        }
      )
      return
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
  knowledgeTemplateUse.addEventListener('click', () => {
    runBusy(() => applyKnowledgeTemplateSelection(true)).catch(err => {
      setStatus(err.message || 'Failed to apply knowledge template', 'error')
    })
  })
  knowledgeEntrySaveTemplateToggle.addEventListener('click', () => {
    if (knowledgeEntrySaveTemplate.disabled) return
    knowledgeEntrySaveTemplate.checked = !knowledgeEntrySaveTemplate.checked
    syncKnowledgeSaveTemplateToggle()
  })
  knowledgeTemplateScratch.addEventListener('click', () => {
    runBusy(() => applyKnowledgeTemplateSelection(false)).catch(err => {
      setStatus(err.message || 'Failed to save knowledge', 'error')
    })
  })
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
      if (editable instanceof HTMLInputElement && (editable.type === 'checkbox' || editable.type === 'radio')) return
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
  renderSettlementBulkRows()
  if (typeof window.api.onFullScreenChanged === 'function') {
    window.api.onFullScreenChanged(isFullScreen => {
      applyWindowFullScreenState(isFullScreen)
    })
  }
  if (typeof window.api.onLanConnectionStatusChanged === 'function') {
    window.api.onLanConnectionStatusChanged(statusPayload => {
      applyLanConnectionStatus(statusPayload)
      syncControlState()
    })
  }
  if (typeof window.api.onLanSurvivorDataChanged === 'function') {
    window.api.onLanSurvivorDataChanged(() => {
      handleLanSurvivorDataChanged()
    })
  }
  if (typeof window.api.onLanDiscoveredHostsChanged === 'function') {
    window.api.onLanDiscoveredHostsChanged(hosts => {
      renderDiscoveredLanHosts(hosts)
    })
  }
  syncWindowFullScreenState()
  syncControlState()
  setPage('settlement')
  init()
})
