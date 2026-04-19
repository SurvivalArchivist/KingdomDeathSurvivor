(function attachSettlementHelpers(globalScope) {
  function coerceNumber(value, fallback = 0) {
    const num = Number(value)
    return Number.isFinite(num) ? num : fallback
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

  function getSettlementTimestampSortValue(value) {
    if (typeof value !== 'string' || value.trim() === '') return Number.NEGATIVE_INFINITY
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed
  }

  function getSettlementStatsTotal(person, statsFields) {
    return statsFields.reduce((sum, field) => sum + coerceNumber(person?.[field], 0), 0)
  }

  function getSearchableArrayEntryName(item) {
    if (typeof item === 'string') return item
    if (!item || typeof item !== 'object') return ''
    return String(item.name || '').trim()
  }

  function getSettlementTraitSearchText(record) {
    if (record && typeof record.traitSearchText === 'string') return record.traitSearchText
    const person = record?.person
    if (!person || typeof person !== 'object') return ''
    const traitArrays = [
      person.abilities,
      person.impairments,
      person.notes,
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

  function getSettlementSortValue(record, key, options) {
    const person = record?.person || {}
    if (key === 'canPonder') return record?.canPonder ? 1 : 0
    if (key === 'statsTotal') {
      return coerceNumber(record?.statsTotal, getSettlementStatsTotal(person, options.statsFields))
    }
    if (key === 'lastUpdated' || key === 'lastReturned') return getSettlementTimestampSortValue(person[key])
    const value = getNestedValue(person, key)
    if (key === 'name' || key === 'philosophy' || key === 'weaponProficiency.type') {
      return String(value || '')
    }
    return coerceNumber(value, 0)
  }

  function getFilteredAndSortedSettlementRows(options) {
    const {
      records,
      nameQuery,
      traitQuery,
      boolFilters,
      triadFilters,
      sort,
      statsFields,
      getMatchmakerGroup,
      getTinkerGroup
    } = options
    const filtered = records.filter(record => {
      const person = record.person || {}
      if (nameQuery && !String(person.name || '').toLowerCase().includes(nameQuery)) return false
      if (traitQuery && !getSettlementTraitSearchText(record).includes(traitQuery)) return false

      for (const filter of boolFilters) {
        const expected = filter.value
        if (expected === 'all') continue
        const value =
          filter.key === 'canPonder' ? Boolean(record.canPonder) : Boolean(getNestedValue(person, filter.key))
        if (expected === 'yes' && value !== true) return false
        if (expected === 'no' && value !== false) return false
      }

      for (const filter of triadFilters) {
        const expected = String(filter.value || 'any')
        if (expected === 'any') continue
        if (filter.key === 'courageGroup') {
          if (expected !== getMatchmakerGroup(person)) return false
          continue
        }
        if (filter.key === 'understandingGroup' && expected !== getTinkerGroup(person)) return false
      }

      return true
    })

    const { key, direction } = sort
    filtered.sort((a, b) => {
      const left = getSettlementSortValue(a, key, { statsFields })
      const right = getSettlementSortValue(b, key, { statsFields })
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

  function createSettlementViewController(config) {
    const { documentRef, windowRef, elements, getState, callbacks, helpers } = config
    let searchRenderTimer = null

    function renderSettlementSortHeaders(sort) {
      for (const button of elements.settlementSortButtons) {
        const key = button.dataset.sortKey
        const base = button.dataset.baseLabel || button.textContent.replace(/\s*[↑↓]$/, '')
        button.dataset.baseLabel = base
        if (key === sort.key) {
          button.textContent = `${base} ${sort.direction === 'asc' ? '↑' : '↓'}`
        } else {
          button.textContent = base
        }
      }
    }

    function getHiddenSettlementColumns() {
      const hidden = new Set()
      if (!elements.settlementToggleMovement.checked) hidden.add('movement')
      if (!elements.settlementToggleWeaponProficiency.checked) {
        hidden.add('weaponProficiency')
        hidden.add('profRank')
      }
      if (!elements.settlementToggleLastUpdated.checked) hidden.add('lastUpdated')
      if (!elements.settlementToggleLastReturned.checked) hidden.add('lastReturned')
      if (!elements.settlementToggleStatsTotal.checked) hidden.add('statsTotal')
      return hidden
    }

    function applySettlementColumnVisibility(hiddenColumns) {
      for (const headerCell of documentRef.querySelectorAll('.settlement-table thead th[data-settlement-col]')) {
        const column = headerCell.dataset.settlementCol
        headerCell.classList.toggle('settlement-col-hidden', Boolean(column && hiddenColumns.has(column)))
      }
    }

    function clearSearchRenderTimer() {
      if (!searchRenderTimer) return
      windowRef.clearTimeout(searchRenderTimer)
      searchRenderTimer = null
    }

    function scheduleSettlementSearchRender() {
      clearSearchRenderTimer()
      searchRenderTimer = windowRef.setTimeout(() => {
        searchRenderTimer = null
        renderSettlementTable()
      }, 150)
    }

    function renderSettlementTable() {
      clearSearchRenderTimer()
      const state = getState()
      renderSettlementSortHeaders(state.settlementSort)
      const hiddenColumns = getHiddenSettlementColumns()
      applySettlementColumnVisibility(hiddenColumns)
      elements.settlementTableBody.innerHTML = ''
      const aliveCount = state.settlementRecords.filter(record => Boolean(record?.person?.isAlive)).length
      elements.settlementAliveCount.textContent = `(Alive: ${aliveCount})`

      const rows = getFilteredAndSortedSettlementRows({
        records: state.settlementRecords,
        nameQuery: elements.settlementNameSearch.value.trim().toLowerCase(),
        traitQuery: elements.settlementTraitSearch.value.trim().toLowerCase(),
        boolFilters: elements.settlementBoolFilters.map(filter => ({
          key: filter.dataset.boolFilter,
          value: filter.value
        })),
        triadFilters: elements.settlementTriadFilters.map(filter => ({
          key: filter.dataset.triadFilter,
          value: filter.value
        })),
        sort: state.settlementSort,
        statsFields: state.statsFields,
        getMatchmakerGroup: helpers.getMatchmakerGroup,
        getTinkerGroup: helpers.getTinkerGroup
      })
      elements.settlementCount.textContent = `${rows.length} of ${state.settlementRecords.length} survivors shown`

      if (rows.length === 0) {
        const row = documentRef.createElement('tr')
        const cell = documentRef.createElement('td')
        const visibleHeaderCount = documentRef.querySelectorAll('.settlement-table thead th:not(.settlement-col-hidden)').length
        cell.colSpan = Math.max(1, visibleHeaderCount)
        cell.textContent = 'No survivors match the current filters.'
        row.appendChild(cell)
        elements.settlementTableBody.appendChild(row)
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
          { value: String(helpers.coerceNumber(person.age, 0)), column: '' },
          { value: String(helpers.coerceNumber(person.lumi, 0)), column: '' },
          { value: String(helpers.coerceNumber(person.survivalPts, 0)), column: '' },
          { value: String(helpers.coerceNumber(person.insanityPts, 0)), column: '' },
          { value: person.philosophy || '-', column: '' },
          { value: String(helpers.coerceNumber(person.philosophyRank, 0)), column: '' },
          { value: record.canPonder ? 'Ready' : '-', column: '' },
          { value: String(helpers.coerceNumber(person.movement, 0)), column: 'movement' },
          { value: String(helpers.coerceNumber(person.speed, 0)), column: '' },
          { value: String(helpers.coerceNumber(person.accuracy, 0)), column: '' },
          { value: String(helpers.coerceNumber(person.strength, 0)), column: '' },
          { value: String(helpers.coerceNumber(person.luck, 0)), column: '' },
          { value: String(helpers.coerceNumber(person.evasion, 0)), column: '' },
          { value: String(helpers.coerceNumber(person.courage, 0)), column: '' },
          { value: String(helpers.coerceNumber(person.understanding, 0)), column: '' },
          { value: String(proficiency.type || '-'), column: 'weaponProficiency' },
          { value: String(helpers.normalizeProficiencyLevel(proficiency.level, 0)), column: 'profRank' },
          { value: helpers.formatSettlementTimestamp(person.lastUpdated), column: 'lastUpdated' },
          { value: helpers.formatSettlementTimestamp(person.lastReturned), column: 'lastReturned' },
          {
            value: String(helpers.coerceNumber(record.statsTotal, getSettlementStatsTotal(person, state.statsFields))),
            column: 'statsTotal'
          }
        ]

        const row = documentRef.createElement('tr')
        row.dataset.fileName = record.fileName
        for (const entry of values) {
          const cell = documentRef.createElement('td')
          if (entry.column) {
            cell.dataset.settlementCol = entry.column
            cell.classList.toggle('settlement-col-hidden', hiddenColumns.has(entry.column))
          }
          cell.textContent = entry.value
          row.appendChild(cell)
        }

        const actionsCell = documentRef.createElement('td')
        const slotOneButton = documentRef.createElement('button')
        slotOneButton.type = 'button'
        slotOneButton.className = 'btn btn-secondary settlement-slot-btn'
        slotOneButton.textContent = '1'
        slotOneButton.dataset.setShowdownSlot = 'A'
        slotOneButton.dataset.fileName = record.fileName
        const personAlive = Boolean(person.isAlive)
        slotOneButton.disabled = state.showdownDeparted || !personAlive
        if (state.showdownDeparted) slotOneButton.title = 'Locked while showdown is departed'
        else if (!personAlive) slotOneButton.title = 'Dead survivors cannot enter showdown'
        if (state.showdownSelectAValue === record.fileName) {
          slotOneButton.classList.add('is-active')
        }

        const slotTwoButton = documentRef.createElement('button')
        slotTwoButton.type = 'button'
        slotTwoButton.className = 'btn btn-secondary settlement-slot-btn'
        slotTwoButton.textContent = '2'
        slotTwoButton.dataset.setShowdownSlot = 'B'
        slotTwoButton.dataset.fileName = record.fileName
        slotTwoButton.disabled = state.showdownDeparted || !personAlive
        if (state.showdownDeparted) slotTwoButton.title = 'Locked while showdown is departed'
        else if (!personAlive) slotTwoButton.title = 'Dead survivors cannot enter showdown'
        if (state.showdownSelectBValue === record.fileName) {
          slotTwoButton.classList.add('is-active')
        }

        actionsCell.append(slotOneButton, slotTwoButton)
        row.appendChild(actionsCell)
        elements.settlementTableBody.appendChild(row)
      }
    }

    function bindEvents() {
      elements.settlementNameSearch.addEventListener('input', scheduleSettlementSearchRender)
      elements.settlementTraitSearch.addEventListener('input', scheduleSettlementSearchRender)
      elements.settlementToggleMovement.addEventListener('change', renderSettlementTable)
      elements.settlementToggleWeaponProficiency.addEventListener('change', renderSettlementTable)
      elements.settlementToggleLastUpdated.addEventListener('change', renderSettlementTable)
      elements.settlementToggleLastReturned.addEventListener('change', renderSettlementTable)
      elements.settlementToggleStatsTotal.addEventListener('change', renderSettlementTable)

      elements.settlementTableBody.addEventListener('click', event => {
        const rawTarget = event.target
        if (!(rawTarget instanceof HTMLElement)) return
        const target = rawTarget.closest('button[data-set-showdown-slot]')
        if (!(target instanceof HTMLElement)) {
          const row = rawTarget.closest('tr[data-file-name]')
          if (!(row instanceof HTMLElement)) return
          const fileName = row.dataset.fileName
          if (!fileName) return
          callbacks.openSurvivor(fileName)
          return
        }

        const slot = target.dataset.setShowdownSlot
        const fileName = target.dataset.fileName
        if (!slot || !fileName) return
        callbacks.assignShowdownSlot(slot, fileName)
      })

      elements.settlementClearFiltersButton.addEventListener('click', () => {
        elements.settlementNameSearch.value = ''
        elements.settlementTraitSearch.value = ''
        for (const filter of elements.settlementBoolFilters) {
          filter.value = filter.dataset.boolFilter === 'isAlive' ? 'yes' : 'all'
        }
        for (const filter of elements.settlementTriadFilters) {
          filter.value = 'any'
        }
        renderSettlementTable()
      })

      elements.settlementToggleExtraFiltersButton.addEventListener('click', () => {
        callbacks.toggleExtraFilters()
      })

      elements.settlementAddBulkChangeButton.addEventListener('click', () => {
        callbacks.addBulkChange()
      })

      elements.settlementBulkRows.addEventListener('click', event => {
        const target = event.target
        if (!(target instanceof HTMLElement)) return
        const removeButton = target.closest('button[data-remove-bulk-change]')
        if (!(removeButton instanceof HTMLButtonElement)) return
        const index = Number(removeButton.dataset.removeBulkChange)
        if (Number.isNaN(index)) return
        callbacks.removeBulkChange(index)
      })

      elements.settlementBulkRows.addEventListener('change', () => {
        callbacks.bulkRowsChanged()
      })

      elements.settlementApplyBulkButton.addEventListener('click', () => {
        callbacks.applyBulkChange()
      })

      for (const filter of elements.settlementBoolFilters) {
        filter.addEventListener('change', renderSettlementTable)
      }
      for (const filter of elements.settlementTriadFilters) {
        filter.addEventListener('change', renderSettlementTable)
      }
      for (const button of elements.settlementSortButtons) {
        button.addEventListener('click', () => {
          const key = button.dataset.sortKey
          if (!key) return
          const state = getState()
          if (state.settlementSort.key === key) {
            callbacks.setSort({
              key,
              direction: state.settlementSort.direction === 'asc' ? 'desc' : 'asc'
            })
          } else {
            callbacks.setSort({ key, direction: 'desc' })
          }
          renderSettlementTable()
        })
      }
    }

    return {
      bindEvents,
      renderSettlementTable,
      scheduleSettlementSearchRender
    }
  }

  globalScope.KDMSettlementHelpers = {
    createSettlementViewController,
    getFilteredAndSortedSettlementRows,
    getSettlementStatsTotal,
    getSettlementTimestampSortValue,
    getSettlementTraitSearchText
  }
})(window)
