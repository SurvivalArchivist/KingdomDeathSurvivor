(function attachShowdownSession(globalScope) {
  function createShowdownSession(config) {
    const { getState, actions, helpers, services, session, elements, documentRef } = config
    const {
      showdownSelectA,
      showdownSelectB,
      showdownSelects = { A: showdownSelectA, B: showdownSelectB },
      showdownSurvivorCount,
      openShowdownButton,
      refreshShowdownSurvivorsButton,
      departShowdownButton,
      showdownOverButton
    } = elements
    const {
      ensureCanWriteSurvivorData,
      getLanClientBlockedMessage,
      refreshLanStatusAfterSurvivorOperation,
      renderShowdown,
      syncControlState,
      renderSettlementTable,
      setPage,
      refreshPeople,
      showSurvivorReadFailure,
      renderShowdownSlot,
      runBusy,
      setStatus,
      syncShowdownTextDraftState
    } = actions
    const {
      deepClone,
      SHOWDOWN_SLOTS = ['A', 'B'],
      SHOWDOWN_DEFAULT_PAGE,
      createShowdownArmorSlotState,
      createShowdownModifierSlotState,
      createEmptyShowdownTextDraftState,
      createShowdownPageState,
      createShowdownArmorState,
      createShowdownTextDraftState,
      createShowdownModifierState,
      coerceInt
    } = helpers
    const { loadPerson, savePerson, confirm, alert } = services

    let voteInFlight = false
    let finishingRound = null
    let appliedEndRound = null
    let departureRound = null
    let readinessRefresh = Promise.resolve()
    let rosterSyncTimer = null
    let rosterSyncPending = Promise.resolve()
    let lastRosterSignature = ''

    function getActiveSlots() {
      const count = Math.max(1, Math.min(SHOWDOWN_SLOTS.length, Number(showdownSurvivorCount?.value) || 2))
      return SHOWDOWN_SLOTS.slice(0, count)
    }

    function buildSharedSurvivors() {
      return getActiveSlots().flatMap(slot => {
        const selected = session.showdownPeople[slot]
        if (!selected) return []
        return [{
          slot,
          name: selected.person?.name || selected.fileName || `Survivor ${slot}`,
          survival: selected.person?.survivalPts,
          insanity: selected.person?.insanityPts,
          armor: session.showdownArmor[slot]
        }]
      })
    }

    function scheduleLiveRosterSync() {
      const readiness = session.showdownReadiness
      if (!session.showdownDeparted || !readiness || readiness.phase !== 'departed' ||
          !readiness.departed.includes(readiness.playerId) || readiness.ended.includes(readiness.playerId)) return
      clearTimeout(rosterSyncTimer)
      rosterSyncTimer = setTimeout(() => {
        const survivors = buildSharedSurvivors()
        const signature = JSON.stringify(survivors)
        if (signature === lastRosterSignature) return
        lastRosterSignature = signature
        rosterSyncPending = rosterSyncPending.catch(() => {}).then(async () => {
          const current = session.showdownReadiness
          if (!current || current.phase !== 'departed') return
          await applyReadiness(await services.voteShowdownReadiness({
            round: current.round,
            action: 'sync',
            survivors
          }))
        }).catch(() => {
          lastRosterSignature = ''
        })
      }, 120)
    }

    async function applyReadiness(state) {
      const previous = session.showdownReadiness
      if (state && previous && state.sessionId === previous.sessionId && state.revision < previous.revision) return
      session.showdownReadiness = state || null
      if (!state) { session.showdownReadinessLocked = false; syncControlState(); return }
      const mine = state.playerId
      // A lost completion response must not cause a second save or strand a completed session.
      if (appliedEndRound === departureRound && appliedEndRound && session.showdownDepartureSnapshot?.settlementType === 'campaign' &&
          (state.round !== departureRound || state.completed.includes(mine))) {
        resetShowdownSessionState(true, true)
        setPage('settlement')
        try { await refreshPeople({ silentStatus: true, updateRefreshTimestamp: true }) } catch {}
        setStatus('Showdown over. Survivor records saved.', 'success')
      }
      const hasVote = state.departed.includes(mine)
      const hasEndVote = state.ended.includes(mine)
      session.showdownReadinessLocked = voteInFlight || (hasVote && state.phase === 'preparing') || hasEndVote
      if (session.showdownDepartureSnapshot && hasVote && state.phase !== 'preparing') {
        // Vignette resets keep the departure snapshot for the next attempt.
        if (!departureRound || departureRound === state.round || session.showdownDepartureSnapshot.settlementType === 'vignette') {
          departureRound = state.round
          session.showdownDeparted = true
          applyShowdownLockSelections()
        }
      }
      syncControlState()
      if (getState().currentPage === 'settlement') renderSettlementTable()
      const disconnected = state.players.filter(player => !player.connected).length
      if (disconnected) setStatus(`Waiting for ${disconnected} disconnected player(s) to reconnect.`, 'neutral')
      if (state.phase !== 'finishing' || !hasEndVote || state.completed.includes(mine) || finishingRound === state.round) return
      if (departureRound !== state.round) return
      finishingRound = state.round
      try {
        if (appliedEndRound !== state.round) {
          await finalizeShowdownSession(true)
          appliedEndRound = state.round
        }
        const next = await services.voteShowdownReadiness({ round: state.round, action: 'complete' })
        await applyReadiness(next)
      } finally {
        finishingRound = null
      }
    }

    function refreshReadiness() {
      readinessRefresh = readinessRefresh.catch(() => {}).then(async () => {
        const state = await services.getShowdownReadiness?.()
        await applyReadiness(state)
        return state
      })
      return readinessRefresh
    }

    async function submitReadinessVote(input) {
      voteInFlight = true
      session.showdownReadinessLocked = true
      syncControlState()
      try { return await services.voteShowdownReadiness(input) }
      finally { voteInFlight = false }
    }

    async function requestEndShowdown() {
      const state = await refreshReadiness()
      if (!state) return finalizeShowdownSession()
      if (!session.showdownDeparted || state.phase === 'preparing') return
      if (state.phase === 'finishing') return // refreshReadiness handles a failed save retry.
      const vignette = session.showdownDepartureSnapshot?.settlementType === 'vignette'
      if (!confirm(vignette
        ? 'Ready to reset showdown? It will reset to departure once every player confirms.'
        : 'Ready to end showdown? Survivor stats will be saved once every player confirms.')) return
      session.showdownReadinessLocked = true
      syncControlState()
      try {
        await applyReadiness(await submitReadinessVote({ round: state.round, action: 'end' }))
      } catch (err) {
        // Re-read after uncertain network outcomes instead of assuming a vote failed.
        refreshReadiness().catch(() => {})
        throw err
      }
    }

    function getShowdownSurvivorLabel(slot) {
      if (!slot || !session.showdownPeople[slot]) return `Survivor ${slot || '?'}`
      return String(session.showdownPeople[slot].person?.name || session.showdownPeople[slot].fileName || `Survivor ${slot}`).trim()
    }

    async function syncSuccessfulShowdownSave(slot, saveResult, options = {}) {
      if (!slot || !session.showdownPeople[slot]) return
      const nextFileName = String(saveResult?.fileName || session.showdownPeople[slot].fileName || '').trim()
      if (!nextFileName) return
      try {
        const latest = await refreshLanStatusAfterSurvivorOperation(() => loadPerson(nextFileName))
        session.showdownPeople[slot] = {
          fileName: nextFileName,
          person: deepClone(latest)
        }
        syncShowdownTextDraftState(slot, session.showdownPeople[slot].person)
        if (getState().currentPage === 'showdown') renderShowdownSlot(slot)
        return
      } catch {
        const stamp = new Date().toISOString()
        session.showdownPeople[slot].fileName = nextFileName
        session.showdownPeople[slot].person.revision = coerceInt(session.showdownPeople[slot].person?.revision, 0) + 1
        session.showdownPeople[slot].person.updatedAt = stamp
        session.showdownPeople[slot].person.lastUpdated = stamp
        if (options.markReturned) session.showdownPeople[slot].person.lastReturned = stamp
      }
    }

    function formatShowdownSaveFailureMessage(results) {
      const successes = results.filter(result => result.ok)
      const failures = results.filter(result => !result.ok)
      const successMessage =
        successes.length > 0 ? `Saved ${successes.map(result => result.label).join(' and ')}. ` : ''
      const failureMessage = failures
        .map(result => {
          if (result.errorType === 'conflict') return `${result.label} failed with a stale revision conflict: ${result.message}`
          if (result.errorType === 'validation') return `${result.label} failed validation: ${result.message}`
          if (result.errorType === 'host-unavailable' || result.errorType === 'disconnected') {
            return `${result.label} could not reach the LAN host: ${result.message}`
          }
          if (result.errorType === 'server-error') return `${result.label} failed with a LAN host server error: ${result.message}`
          return `${result.label} failed: ${result.message}`
        })
        .join(' ')
      return `Could not end showdown. ${successMessage}${failureMessage} Showdown remains departed so you can retry safely.`
    }

    async function saveShowdownSurvivors(options = {}) {
      const slots = getActiveSlots()
      if (!slots.every(slot => session.showdownPeople[slot])) return
      if (!(await ensureCanWriteSurvivorData('saving showdown survivors'))) {
        throw new Error(getLanClientBlockedMessage('saving showdown survivors'))
      }
      const settledResults = await Promise.allSettled(
        slots.map(slot =>
          refreshLanStatusAfterSurvivorOperation(() =>
            savePerson(session.showdownPeople[slot].person, {
              expectedFileName: session.showdownPeople[slot].fileName,
              markReturned: Boolean(options.markReturned)
            })
          )
        )
      )
      const results = []
      for (let index = 0; index < slots.length; index += 1) {
        const slot = slots[index]
        const settled = settledResults[index]
        const label = getShowdownSurvivorLabel(slot)
        if (settled.status === 'fulfilled' && settled.value && settled.value.ok !== false) {
          await syncSuccessfulShowdownSave(slot, settled.value, options)
          results.push({
            slot,
            label,
            ok: true,
            fileName: String(settled.value.fileName || session.showdownPeople[slot].fileName || '')
          })
          continue
        }
        const message =
          settled.status === 'rejected'
            ? settled.reason?.message || 'Failed to save survivor while leaving showdown'
            : settled.value?.message || 'Failed to save survivor while leaving showdown'
        const errorType = settled.status === 'fulfilled' ? settled.value?.errorType || '' : ''
        results.push({
          slot,
          label,
          ok: false,
          errorType,
          message
        })
      }
      if (results.some(result => !result.ok)) {
        const error = new Error(formatShowdownSaveFailureMessage(results))
        error.showdownSaveResults = results
        throw error
      }
      return results
    }

    function applyShowdownLockSelections() {
      if (!session.showdownDeparted && !session.showdownReadinessLocked) return
      for (const slot of getActiveSlots()) {
        if (session.showdownLockedSlots[slot]) showdownSelects[slot].value = session.showdownLockedSlots[slot]
      }
    }

    function hasShowdownSelectionMismatch() {
      return getActiveSlots().some(slot => session.showdownPeople[slot] &&
        session.showdownPeople[slot].fileName !== String(showdownSelects[slot].value || ''))
    }

    function resetShowdownSlotState(slot) {
      if (!SHOWDOWN_SLOTS.includes(slot)) return
      session.showdownPageBySlot[slot] = SHOWDOWN_DEFAULT_PAGE
      session.showdownArmor[slot] = createShowdownArmorSlotState()
      session.showdownModifiers[slot] = createShowdownModifierSlotState()
      session.showdownTextDraftState[slot] = createEmptyShowdownTextDraftState()
    }

    function reconcileShowdownMemoryForSelectionChange() {
      if (session.showdownDeparted || session.showdownReadinessLocked) return false
      let changed = false
      for (const slot of SHOWDOWN_SLOTS) {
        const active = getActiveSlots().includes(slot)
        const selected = active ? String(showdownSelects[slot].value || '') : ''
        if (session.showdownPeople[slot] && (!active || session.showdownPeople[slot].fileName !== selected)) {
          session.showdownPeople[slot] = null
          resetShowdownSlotState(slot)
          changed = true
        }
      }
      if (changed) renderShowdown()
      return changed
    }

    function resetShowdownSessionState(clearPeople = false, clearSelections = false) {
      session.showdownDepartureSnapshot = null
      session.showdownDeparted = false
      session.showdownLockedSlots = Object.fromEntries(SHOWDOWN_SLOTS.map(slot => [slot, '']))
      session.showdownPageBySlot = createShowdownPageState()
      resetShowdownModifiers()
      session.showdownArmor = createShowdownArmorState()
      if (clearPeople) {
        session.showdownPeople = Object.fromEntries(SHOWDOWN_SLOTS.map(slot => [slot, null]))
        session.showdownTextDraftState = createShowdownTextDraftState()
        renderShowdown()
      }
      if (clearSelections) {
        session.forceShowdownReselection = true
        for (const selector of Object.values(showdownSelects)) selector.value = ''
      }
      syncControlState()
      if (getState().currentPage === 'settlement') renderSettlementTable()
    }

    async function departShowdownSession() {
      const activeSlots = getActiveSlots()
      if (!activeSlots.every(slot => session.showdownPeople[slot])) {
        setStatus('Open showdown with all selected survivors first', 'error')
        return
      }
      if (session.showdownDeparted) {
        setStatus('Showdown is already departed', 'neutral')
        return
      }
      const readiness = await refreshReadiness()
      if (readiness && (readiness.phase !== 'preparing' || !readiness.players.some(player => player.id === readiness.playerId))) {
        throw new Error('Wait for the current showdown to finish before departing.')
      }
      const settlementType = await services.getSettlementType()
      session.showdownDepartureSnapshot = deepClone({
        settlementType,
        showdownPeople: session.showdownPeople,
        showdownPageBySlot: session.showdownPageBySlot,
        showdownArmor: session.showdownArmor,
        showdownModifiers: session.showdownModifiers,
        showdownTextDraftState: session.showdownTextDraftState
      })
      session.showdownLockedSlots = Object.fromEntries(SHOWDOWN_SLOTS.map(slot => [
        slot, activeSlots.includes(slot) ? session.showdownPeople[slot]?.fileName || '' : ''
      ]))
      if (readiness) {
        departureRound = readiness.round
        session.showdownReadinessLocked = true
        syncControlState()
        try {
          const survivors = buildSharedSurvivors()
          lastRosterSignature = JSON.stringify(survivors)
          await applyReadiness(await submitReadinessVote({ round: readiness.round, action: 'depart', survivors }))
        } catch (err) {
          refreshReadiness().catch(() => {})
          throw err
        }
        return
      }
      session.showdownDeparted = true
      applyShowdownLockSelections()
      syncControlState()
      if (getState().currentPage === 'settlement') renderSettlementTable()
      setStatus(
        `Showdown departed. Locked ${activeSlots.map(slot => session.showdownPeople[slot].person?.name || session.showdownLockedSlots[slot]).join(', ')}.`,
        'success'
      )
    }

    async function finalizeShowdownSession(coordinated = false) {
      if (!session.showdownDeparted) {
        setStatus('Departed must be active before ending showdown', 'error')
        return
      }
      if (session.showdownDepartureSnapshot?.settlementType === 'vignette') {
        if (!coordinated && !confirm('Reset showdown to when the survivors departed? Current showdown changes will be discarded.')) return
        const snapshot = deepClone(session.showdownDepartureSnapshot)
        for (const key of ['showdownPeople', 'showdownPageBySlot', 'showdownArmor', 'showdownModifiers', 'showdownTextDraftState']) {
          session[key] = snapshot[key]
        }
        applyShowdownLockSelections()
        renderShowdown()
        syncControlState()
        setStatus('Showdown reset to departure state.', 'success')
        return
      }
      const confirmed = coordinated || confirm(
        'Are you sure you want to return? This will save current showdown survivor stats to settlement.'
      )
      if (!confirmed) return
      setStatus('Saving showdown survivors...', 'neutral')
      await saveShowdownSurvivors({ markReturned: true })
      if (coordinated) return
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
      if (session.showdownDeparted || session.showdownReadinessLocked) {
        setStatus('Cannot refresh while departed. End showdown first.', 'error')
        return
      }

      const slots = getActiveSlots()
      const files = slots.map(slot => String(showdownSelects[slot].value || ''))
      if (files.some(file => !file)) {
        setStatus('Select every survivor for showdown', 'error')
        return
      }
      if (new Set(files).size !== files.length) {
        setStatus('Choose different survivors for every showdown slot', 'error')
        return
      }

      const people = await Promise.all(files.map(file => refreshLanStatusAfterSurvivorOperation(() => loadPerson(file))))
      if (people.some(person => !person?.isAlive)) {
        throw new Error('Only alive survivors can enter showdown')
      }

      slots.forEach((slot, index) => {
        session.showdownPeople[slot] = { fileName: files[index], person: deepClone(people[index]) }
        resetShowdownSlotState(slot)
      })
      renderShowdown()
      setStatus('Showdown survivors refreshed from settlement data', 'success')
    }

    async function openShowdownView() {
      await refreshReadiness()
      const slots = getActiveSlots()
      if (session.showdownDeparted && slots.every(slot => session.showdownPeople[slot])) {
        applyShowdownLockSelections()
        renderShowdown()
        setPage('showdown')
        setStatus('Resumed departed showdown session', 'neutral')
        return
      }

      const files = slots.map(slot => String(showdownSelects[slot].value || ''))
      if (files.some(file => !file)) {
        setStatus('Select every survivor for showdown', 'error')
        return
      }
      if (new Set(files).size !== files.length) {
        setStatus('Choose different survivors for every showdown slot', 'error')
        return
      }

      reconcileShowdownMemoryForSelectionChange()
      const loadTasks = []
      slots.forEach((slot, index) => {
        const file = files[index]
        if (!session.showdownPeople[slot] || session.showdownPeople[slot].fileName !== file) {
          loadTasks.push(refreshLanStatusAfterSurvivorOperation(() => loadPerson(file)).then(person => {
            if (!person?.isAlive) throw new Error('Only alive survivors can enter showdown')
            session.showdownPeople[slot] = { fileName: file, person: deepClone(person) }
            resetShowdownSlotState(slot)
          }))
        }
      })
      if (loadTasks.length > 0) await Promise.all(loadTasks)
      if (!slots.every(slot => session.showdownPeople[slot])) {
        throw new Error('Failed to load selected survivors for showdown')
      }
      renderShowdown()
      setPage('showdown')
      setStatus(
        `Showdown ready: ${slots.map((slot, index) => session.showdownPeople[slot].person?.name || files[index]).join(', ')}`,
        'success'
      )
    }

    function populateShowdownSelectors(files) {
      const previous = Object.fromEntries(SHOWDOWN_SLOTS.map(slot => [slot, showdownSelects[slot].value]))
      for (const slot of SHOWDOWN_SLOTS) {
        const selector = showdownSelects[slot]
        selector.innerHTML = ''
        if (slot !== 'A') {
          const emptyOption = documentRef.createElement('option')
          emptyOption.value = ''
          emptyOption.textContent = 'Not selected'
          selector.appendChild(emptyOption)
        }
        for (const file of files) {
          const option = documentRef.createElement('option')
          option.value = file
          option.textContent = file
          selector.appendChild(option)
        }
      }

      if (files.length === 0) {
        for (const selector of Object.values(showdownSelects)) selector.value = ''
        return
      }

      if (session.forceShowdownReselection) {
        for (const selector of Object.values(showdownSelects)) selector.value = ''
        return
      }

      const activeCount = getActiveSlots().length
      SHOWDOWN_SLOTS.forEach((slot, index) => {
        showdownSelects[slot].value = files.includes(previous[slot])
          ? previous[slot]
          : index < activeCount ? files[Math.min(index, files.length - 1)] : ''
      })
      ensureDistinctShowdownSelection()
    }

    function ensureDistinctShowdownSelection(changed = '') {
      const options = [...showdownSelectA.options].map(option => option.value)
      const used = new Set()
      const ordered = changed ? [changed, ...getActiveSlots().filter(slot => slot !== changed)] : getActiveSlots()
      for (const slot of ordered) {
        const selector = showdownSelects[slot]
        if (!selector.value) continue
        if (!used.has(selector.value)) { used.add(selector.value); continue }
        const alternative = options.find(value => !used.has(value))
        if (alternative) selector.value = alternative
        used.add(selector.value)
      }
    }

    function resetShowdownModifiers() {
      session.showdownModifiers = createShowdownModifierState()
    }

    function assignShowdownSlot(slot, fileName) {
      if (session.showdownDeparted || session.showdownReadinessLocked) {
        setStatus('Cannot change showdown slots while departed. End showdown first.', 'error')
        return
      }
      const selectedRecord = getState().settlementRecords.find(record => record.fileName === fileName)
      if (selectedRecord && !selectedRecord.person?.isAlive) {
        setStatus('Dead survivors cannot enter showdown', 'error')
        return
      }

      if (!SHOWDOWN_SLOTS.includes(slot)) return
      const slotIndex = SHOWDOWN_SLOTS.indexOf(slot)
      if (showdownSelects[slot].value === fileName && slot !== 'A') {
        for (const laterSlot of SHOWDOWN_SLOTS.slice(slotIndex)) showdownSelects[laterSlot].value = ''
        showdownSurvivorCount.value = String(slotIndex)
        reconcileShowdownMemoryForSelectionChange()
        syncControlState()
        renderSettlementTable()
        setStatus(`Cleared Showdown Position ${slotIndex + 1}`, 'neutral')
        return
      }

      const targetFileName = showdownSelects[slot].value
      const sourceSlot = SHOWDOWN_SLOTS.find(candidate => showdownSelects[candidate].value === fileName)
      if (sourceSlot && sourceSlot !== slot && targetFileName) {
        showdownSelects[slot].value = fileName
        showdownSelects[sourceSlot].value = targetFileName
      } else if (sourceSlot && sourceSlot !== slot) {
        setStatus(`Position ${slotIndex + 1} is empty. Select another survivor there before swapping.`, 'neutral')
        return
      } else {
        showdownSelects[slot].value = fileName
      }
      showdownSurvivorCount.value = String(Math.max(Number(showdownSurvivorCount.value) || 1, slotIndex + 1))
      if (session.forceShowdownReselection) session.forceShowdownReselection = false
      reconcileShowdownMemoryForSelectionChange()
      syncControlState()
      renderSettlementTable()
      setStatus(
        sourceSlot && sourceSlot !== slot
          ? `Swapped Positions ${SHOWDOWN_SLOTS.indexOf(sourceSlot) + 1} and ${slotIndex + 1}`
          : `Assigned ${fileName} to Position ${slotIndex + 1}`,
        'success'
      )
    }

    function bindEvents() {
      services.onShowdownReadinessChanged?.(() => {
        refreshReadiness().catch(err => setStatus(err.message || 'Unable to refresh showdown readiness', 'error'))
      })
      for (const slot of SHOWDOWN_SLOTS) showdownSelects[slot].addEventListener('change', () => {
          if (session.showdownDeparted || session.showdownReadinessLocked) {
            applyShowdownLockSelections()
            setStatus('Showdown slots are locked while departed', 'neutral')
          }
          if (session.forceShowdownReselection) session.forceShowdownReselection = false
          const slotIndex = SHOWDOWN_SLOTS.indexOf(slot)
          if (!showdownSelects[slot].value && slot !== 'A') {
            for (const laterSlot of SHOWDOWN_SLOTS.slice(slotIndex + 1)) showdownSelects[laterSlot].value = ''
            showdownSurvivorCount.value = String(slotIndex)
          } else if (showdownSelects[slot].value) {
            showdownSurvivorCount.value = String(Math.max(Number(showdownSurvivorCount.value) || 1, slotIndex + 1))
          }
          ensureDistinctShowdownSelection(slot)
          reconcileShowdownMemoryForSelectionChange()
          syncControlState()
          if (getState().currentPage === 'settlement') renderSettlementTable()
        })
      openShowdownButton.addEventListener('click', () => {
        runBusy(openShowdownView).catch(err => {
          showSurvivorReadFailure(
            err,
            'opening Showdown',
            'Failed to open showdown view',
            'The current view was kept unchanged.'
          )
        })
      })

      refreshShowdownSurvivorsButton.addEventListener('click', () => {
        runBusy(refreshSelectedShowdownSurvivors).catch(err => {
          showSurvivorReadFailure(
            err,
            'refreshing Showdown survivors',
            'Failed to refresh showdown survivors',
            'The in-memory Showdown survivors were kept unchanged.'
          )
        })
      })
      departShowdownButton.addEventListener('click', () => {
        runBusy(departShowdownSession).catch(err => setStatus(err.message || 'Unable to depart showdown', 'error'))
      })
      showdownOverButton.addEventListener('click', () => {
        runBusy(requestEndShowdown).catch(err => {
          const message = err.message || 'Failed to close showdown session'
          setStatus(message, 'error')
          if (getState().currentPage === 'showdown') {
            alert(`Could not return from showdown:\n\n${message}`)
          }
        })
      })
    }

    return {
      bindEvents,
      refreshReadiness,
      assignShowdownSlot,
      applyShowdownLockSelections,
      hasShowdownSelectionMismatch,
      reconcileShowdownMemoryForSelectionChange,
      openShowdownView,
      populateShowdownSelectors,
      scheduleLiveRosterSync
    }
  }

  globalScope.KDMShowdownSession = { createShowdownSession }
})(window)
