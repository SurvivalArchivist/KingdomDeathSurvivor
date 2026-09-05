(function attachShowdownController(globalScope) {
  function createShowdownController(config) {
    const { element, getState, actions, helpers, services } = config
    const {
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
    } = actions
    const {
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
    } = helpers
    const { saveKnowledgeTemplate } = services

    function addShowdownTextEntry(slot, arrayName) {
      const { showdownPeople, showdownTextDraftState } = getState()
      if (!slot || !showdownPeople[slot]) return
      const person = showdownPeople[slot].person
      if (!Array.isArray(person[arrayName])) person[arrayName] = []
      person[arrayName].push('')
      syncShowdownTextDraftState(slot, person)
      if (!beginShowdownTextDraft(showdownTextDraftState, slot, arrayName, person[arrayName].length - 1)) return
      renderShowdownSlot(slot)
      const label = getTextEntrySingularLabel(arrayName)
      setStatus('Added ' + label, 'success')
    }

    function editShowdownTextEntry(slot, arrayName, index) {
      const { showdownPeople, showdownTextDraftState } = getState()
      if (!slot || !showdownPeople[slot]) return
      syncShowdownTextDraftState(slot, showdownPeople[slot].person)
      if (!beginShowdownTextDraft(showdownTextDraftState, slot, arrayName, index)) return
      renderShowdownSlot(slot)
    }

    function commitShowdownTextEntry(slot, arrayName, index) {
      const { showdownPeople, showdownTextDraftState } = getState()
      if (!slot || !showdownPeople[slot]) return
      const person = showdownPeople[slot].person
      if (!Array.isArray(person[arrayName]) || index < 0 || index >= person[arrayName].length) return
      syncShowdownTextDraftState(slot, person)
      const result = commitShowdownTextDraft(showdownTextDraftState, slot, arrayName, index)
      if (result.status === 'empty') {
        setStatus('Text cannot be empty. Use Remove to delete the entry.', 'error')
        return
      }
      if (result.status !== 'committed') return
      person[arrayName][index] = result.value
      renderShowdownSlot(slot)
    }

    function mutateShowdownStat(slot, field, nextValue, min = null, max = null) {
      const { showdownPeople } = getState()
      if (!showdownPeople[slot]) return
      const person = showdownPeople[slot].person
      person[field] = clamp(coerceNumber(nextValue, 0), min, max)
      renderShowdownSlot(slot)
    }

    function mutateShowdownModifier(slot, field, kind, nextValue) {
      const { showdownPeople, showdownModifiers } = getState()
      if (!showdownPeople[slot]) return
      if (!setShowdownModifierValue(showdownModifiers, slot, field, kind, nextValue)) return
      renderShowdownSlot(slot)
    }

    function mutateShowdownWeaponProficiency(slot, field, nextValue) {
      const { showdownPeople } = getState()
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

    function updateShowdownWeaponProficiencyDraft(slot, field, nextValue) {
      const { showdownPeople } = getState()
      if (!showdownPeople[slot]) return
      const person = showdownPeople[slot].person
      const proficiency = ensureWeaponProficiency(person)
      if (field === 'type') {
        proficiency.type = String(nextValue || '')
      }
    }

    function removeShowdownArrayItem(slot, arrayName, index) {
      const { showdownPeople } = getState()
      if (!showdownPeople[slot]) return
      const person = showdownPeople[slot].person
      if (!Array.isArray(person[arrayName])) return
      person[arrayName].splice(index, 1)
      if (isTextEntryArrayName(arrayName)) {
        syncShowdownTextDraftState(slot, person)
      }
      renderShowdownSlot(slot)
    }

    function mutateShowdownAbilityGroup(slot, group, value) {
      const { showdownPeople } = getState()
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
      const { showdownPeople } = getState()
      if (!showdownPeople[slot]) return
      const person = showdownPeople[slot].person
      if (!Array.isArray(person[arrayName])) return
      if (index < 0 || index >= person[arrayName].length) return
      person[arrayName][index].currentObservations = Math.max(0, coerceNumber(nextValue, 0))
      renderShowdownSlot(slot)
    }

    function bindEvents() {
      element.addEventListener('click', event => {
        const { showdownArmor, showdownPageBySlot, showdownPeople, knowledgeTemplateCache } = getState()
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

          if (isTextEntryArrayName(arrayName)) {
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
          if (!slot || !isTextEntryArrayName(arrayName) || Number.isNaN(index)) return
          editShowdownTextEntry(slot, arrayName, index)
          return
        }

        if (target.dataset.showdownCommitSlot && target.dataset.showdownCommitArray) {
          const slot = target.dataset.showdownCommitSlot
          const arrayName = target.dataset.showdownCommitArray
          const index = Number(target.dataset.showdownCommitIndex)
          if (!slot || !isTextEntryArrayName(arrayName) || Number.isNaN(index)) return
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

        const showdownSaveTemplateButton = target.closest(
          'button[data-showdown-save-template-slot][data-showdown-save-template-array][data-showdown-save-template-index]'
        )
        if (showdownSaveTemplateButton instanceof HTMLButtonElement) {
          const slot = showdownSaveTemplateButton.dataset.showdownSaveTemplateSlot
          const arrayName = showdownSaveTemplateButton.dataset.showdownSaveTemplateArray
          const index = Number(showdownSaveTemplateButton.dataset.showdownSaveTemplateIndex)
          const type = getKnowledgeTypeFromArrayName(arrayName)
          if (!slot || !type || Number.isNaN(index) || !showdownPeople[slot]) return
          const entries = showdownPeople[slot].person?.[arrayName]
          if (!Array.isArray(entries) || !entries[index]) return
          const template = normalizeKnowledgeTemplateForEntry(type, entries[index])
          runWithButtonFeedback(showdownSaveTemplateButton, () =>
            runBusy(async () => {
              await saveKnowledgeTemplate(type, template)
              await refreshKnowledgeTemplateCache(type)
              setStatus(`Saved ${template.name || 'entry'} as reusable template`, 'success')
              return true
            })
          ).catch(err => {
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

            if (nextMode === 'noTemplate') {
              await openKnowledgeTemplatePicker({
                arrayName,
                mode: 'showdown',
                slot,
                action: 'upgrade',
                index,
                sourceItem,
                forceScratchOnly: true
              })
              openKnowledgeScratchEditorForShowdownUpgrade()
              return
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

        if (target.dataset.showdownSlot && target.dataset.showdownBulkArmorDelta) {
          const slot = target.dataset.showdownSlot
          const delta = coerceNumber(target.dataset.showdownBulkArmorDelta, 0)
          if (!adjustShowdownArmorAll(showdownArmor, slot, delta)) return
          renderShowdownSlot(slot)
          return
        }

        if (!target.dataset.showdownSlot || !target.dataset.showdownPart || !target.dataset.showdownDelta) return

        const slot = target.dataset.showdownSlot
        const part = target.dataset.showdownPart
        const delta = coerceNumber(target.dataset.showdownDelta, 0)
        if (adjustShowdownArmorPart(showdownArmor, slot, part, delta) === null) return
        renderShowdownSlot(slot)
        return
      })

      element.addEventListener('input', event => {
        const { showdownArmor, showdownPeople, showdownTextDraftState } = getState()
        const target = event.target
        if (!(target instanceof HTMLElement)) return
        if (target.dataset.showdownDraftSlot && target.dataset.showdownDraftArray) {
          if (!(target instanceof HTMLTextAreaElement)) return
          const slot = target.dataset.showdownDraftSlot
          const arrayName = target.dataset.showdownDraftArray
          const index = Number(target.dataset.showdownDraftIndex)
          if (!slot || !isTextEntryArrayName(arrayName) || Number.isNaN(index)) return
          if (!showdownPeople[slot]) return
          syncShowdownTextDraftState(slot, showdownPeople[slot].person)
          if (!updateShowdownTextDraft(showdownTextDraftState, slot, arrayName, index, target.value)) return
          return
        }
        if (target.tagName !== 'INPUT') return
        if (target.dataset.showdownProficiencySlot && target.dataset.showdownProficiencyField) {
          const slot = target.dataset.showdownProficiencySlot
          const field = target.dataset.showdownProficiencyField
          if (!slot || !field) return
          if (field === 'type') {
            updateShowdownWeaponProficiencyDraft(slot, field, target.value)
            return
          }
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
        if (!slot || !part) return
        const value = setShowdownArmorPartValue(showdownArmor, slot, part, target.value)
        if (value === null) return
        target.value = String(value)
      })

      element.addEventListener('change', event => {
        const { showdownArmor, showdownPeople } = getState()
        const target = event.target
        if (!(target instanceof HTMLElement)) return
        if (target instanceof HTMLInputElement && target.dataset.showdownBoolSlot && target.dataset.showdownBoolField) {
          const slot = target.dataset.showdownBoolSlot
          const field = target.dataset.showdownBoolField
          if (
            !slot ||
            (field !== 'isAlive' && field !== 'lifetimeReroll') ||
            !showdownPeople[slot] ||
            !showdownPeople[slot].person
          ) {
            return
          }
          showdownPeople[slot].person[field] = Boolean(target.checked)
          return
        }
        if (target instanceof HTMLInputElement && target.dataset.showdownSlot && target.dataset.showdownArmorCheck) {
          const slot = target.dataset.showdownSlot
          const key = target.dataset.showdownArmorCheck
          const result = setShowdownArmorCheck(showdownArmor, slot, key, target.checked)
          if (!result.changed) return
          if (result.lightKey) {
            const lightInput = element.querySelector(
              `input[data-showdown-slot="${slot}"][data-showdown-armor-check="${result.lightKey}"]`
            )
            if (lightInput instanceof HTMLInputElement) lightInput.checked = true
          }
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
    }

    return { bindEvents }
  }

  globalScope.KDMShowdownController = {
    createShowdownController
  }
})(window)
