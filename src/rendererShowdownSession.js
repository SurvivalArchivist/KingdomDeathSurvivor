(function attachShowdownSession(globalScope) {
  function createShowdownSession(config) {
    const { getState, actions, helpers, services, session, elements, documentRef } = config
    const {
      showdownSelectA,
      showdownSelectB,
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
      if (!session.showdownPeople.A || !session.showdownPeople.B) return
      if (!(await ensureCanWriteSurvivorData('saving showdown survivors'))) {
        throw new Error(getLanClientBlockedMessage('saving showdown survivors'))
      }
      const slots = ['A', 'B']
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
      if (session.showdownLockedSlots.A) showdownSelectA.value = session.showdownLockedSlots.A
      if (session.showdownLockedSlots.B) showdownSelectB.value = session.showdownLockedSlots.B
    }

    function hasShowdownSelectionMismatch() {
      const selectedA = String(showdownSelectA.value || '')
      const selectedB = String(showdownSelectB.value || '')
      return (
        Boolean(session.showdownPeople.A && session.showdownPeople.A.fileName !== selectedA) ||
        Boolean(session.showdownPeople.B && session.showdownPeople.B.fileName !== selectedB)
      )
    }

    function resetShowdownSlotState(slot) {
      if (slot !== 'A' && slot !== 'B') return
      session.showdownPageBySlot[slot] = SHOWDOWN_DEFAULT_PAGE
      session.showdownArmor[slot] = createShowdownArmorSlotState()
      session.showdownModifiers[slot] = createShowdownModifierSlotState()
      session.showdownTextDraftState[slot] = createEmptyShowdownTextDraftState()
    }

    function reconcileShowdownMemoryForSelectionChange() {
      if (session.showdownDeparted || session.showdownReadinessLocked) return false
      let changed = false
      const selectedA = String(showdownSelectA.value || '')
      const selectedB = String(showdownSelectB.value || '')
      if (session.showdownPeople.A && session.showdownPeople.A.fileName !== selectedA) {
        session.showdownPeople.A = null
        resetShowdownSlotState('A')
        changed = true
      }
      if (session.showdownPeople.B && session.showdownPeople.B.fileName !== selectedB) {
        session.showdownPeople.B = null
        resetShowdownSlotState('B')
        changed = true
      }
      if (changed) renderShowdown()
      return changed
    }

    function resetShowdownSessionState(clearPeople = false, clearSelections = false) {
      session.showdownDepartureSnapshot = null
      session.showdownDeparted = false
      session.showdownLockedSlots = { A: '', B: '' }
      session.showdownPageBySlot = createShowdownPageState()
      resetShowdownModifiers()
      session.showdownArmor = createShowdownArmorState()
      if (clearPeople) {
        session.showdownPeople = { A: null, B: null }
        session.showdownTextDraftState = createShowdownTextDraftState()
        renderShowdown()
      }
      if (clearSelections) {
        session.forceShowdownReselection = true
        showdownSelectA.value = ''
        showdownSelectB.value = ''
      }
      syncControlState()
      if (getState().currentPage === 'settlement') renderSettlementTable()
    }

    async function departShowdownSession() {
      if (!session.showdownPeople.A || !session.showdownPeople.B) {
        setStatus('Open showdown with two survivors first', 'error')
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
      session.showdownLockedSlots = {
        A: session.showdownPeople.A.fileName || '',
        B: session.showdownPeople.B.fileName || ''
      }
      if (readiness) {
        departureRound = readiness.round
        session.showdownReadinessLocked = true
        syncControlState()
        try {
          await applyReadiness(await submitReadinessVote({ round: readiness.round, action: 'depart' }))
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
        `Showdown departed. Locked ${session.showdownPeople.A.person?.name || session.showdownLockedSlots.A} and ${
          session.showdownPeople.B.person?.name || session.showdownLockedSlots.B
        }.`,
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

      const [personA, personB] = await Promise.all([
        refreshLanStatusAfterSurvivorOperation(() => loadPerson(fileA)),
        refreshLanStatusAfterSurvivorOperation(() => loadPerson(fileB))
      ])
      if (!personA?.isAlive || !personB?.isAlive) {
        throw new Error('Only alive survivors can enter showdown')
      }

      session.showdownPeople.A = { fileName: fileA, person: deepClone(personA) }
      session.showdownPeople.B = { fileName: fileB, person: deepClone(personB) }
      resetShowdownSlotState('A')
      resetShowdownSlotState('B')
      renderShowdown()
      setStatus('Showdown survivors refreshed from settlement data', 'success')
    }

    async function openShowdownView() {
      await refreshReadiness()
      if (session.showdownDeparted && session.showdownPeople.A && session.showdownPeople.B) {
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
      if (!session.showdownPeople.A || session.showdownPeople.A.fileName !== fileA) {
        loadTasks.push(
          refreshLanStatusAfterSurvivorOperation(() => loadPerson(fileA)).then(person => {
            if (!person?.isAlive) throw new Error('Only alive survivors can enter showdown')
            session.showdownPeople.A = { fileName: fileA, person: deepClone(person) }
            resetShowdownSlotState('A')
          })
        )
      }
      if (!session.showdownPeople.B || session.showdownPeople.B.fileName !== fileB) {
        loadTasks.push(
          refreshLanStatusAfterSurvivorOperation(() => loadPerson(fileB)).then(person => {
            if (!person?.isAlive) throw new Error('Only alive survivors can enter showdown')
            session.showdownPeople.B = { fileName: fileB, person: deepClone(person) }
            resetShowdownSlotState('B')
          })
        )
      }
      if (loadTasks.length > 0) await Promise.all(loadTasks)
      if (!session.showdownPeople.A || !session.showdownPeople.B) {
        throw new Error('Failed to load selected survivors for showdown')
      }
      renderShowdown()
      setPage('showdown')
      setStatus(
        `Showdown ready: ${session.showdownPeople.A.person?.name || fileA} vs ${session.showdownPeople.B.person?.name || fileB}`,
        'success'
      )
    }

    function populateShowdownSelectors(files) {
      const previousA = showdownSelectA.value
      const previousB = showdownSelectB.value
      showdownSelectA.innerHTML = ''
      showdownSelectB.innerHTML = ''

      for (const file of files) {
        const optionA = documentRef.createElement('option')
        optionA.value = file
        optionA.textContent = file
        showdownSelectA.appendChild(optionA)

        const optionB = documentRef.createElement('option')
        optionB.value = file
        optionB.textContent = file
        showdownSelectB.appendChild(optionB)
      }

      if (files.length === 0) {
        showdownSelectA.value = ''
        showdownSelectB.value = ''
        return
      }

      if (session.forceShowdownReselection) {
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
      if (session.forceShowdownReselection) session.forceShowdownReselection = false
      reconcileShowdownMemoryForSelectionChange()
      syncControlState()
      renderSettlementTable()
      setStatus(`Assigned ${fileName} to Survivor ${slot}`, 'success')
    }

    function bindEvents() {
      services.onShowdownReadinessChanged?.(() => {
        refreshReadiness().catch(err => setStatus(err.message || 'Unable to refresh showdown readiness', 'error'))
      })
      showdownSelectA.addEventListener('change', () => {
        if (session.showdownDeparted || session.showdownReadinessLocked) {
          applyShowdownLockSelections()
          setStatus('Showdown slots are locked while departed', 'neutral')
        }
        if (session.forceShowdownReselection) session.forceShowdownReselection = false
        ensureDistinctShowdownSelection('A')
        reconcileShowdownMemoryForSelectionChange()
        syncControlState()
        if (getState().currentPage === 'settlement') renderSettlementTable()
      })

      showdownSelectB.addEventListener('change', () => {
        if (session.showdownDeparted || session.showdownReadinessLocked) {
          applyShowdownLockSelections()
          setStatus('Showdown slots are locked while departed', 'neutral')
        }
        if (session.forceShowdownReselection) session.forceShowdownReselection = false
        ensureDistinctShowdownSelection('B')
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
      populateShowdownSelectors
    }
  }

  globalScope.KDMShowdownSession = { createShowdownSession }
})(window)
