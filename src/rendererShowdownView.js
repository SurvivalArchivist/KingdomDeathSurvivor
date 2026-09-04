(function attachShowdownView(globalScope) {
  function buildShowdownCardMarkup(options) {
    const { person, slotLabel, armor, activePage, pageConfig, proficiency, callbacks } = options
    const {
      buildShowdownGroupOptions,
      clamp,
      coerceInt,
      coerceNumber,
      escapeHtml,
      getSelectedMatchmakerGroup,
      getSelectedTinkerGroup,
      getShowdownMarkdownContent,
      getShowdownModifier,
      iconLabel,
      renderShowdownTextEntry,
      showdownListItems
    } = callbacks
    const p = person || {}
    const slot = slotLabel === 'A' ? 'A' : 'B'
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

    const pageDots = pageConfig.map(page => {
      const isActive = page.key === activePage
      return `<button type="button" class="showdown-page-dot${isActive ? ' is-active' : ''}" data-showdown-page-slot="${slot}" data-showdown-page="${page.key}" aria-label="${page.label}" title="${page.label}" aria-pressed="${isActive ? 'true' : 'false'}"><span>${page.symbol}</span></button>`
    }).join('')
    const proficiencyLevel = clamp(coerceInt(proficiency.level, 0), 0, 8)

    const renderBaseStepper = ([field, label, min, max, icon]) => {
      const base = coerceNumber(p[field], 0)
      const extraClass =
        field === 'understanding'
          ? ' showdown-stepper-understanding'
          : field === 'insanityPts'
            ? ' showdown-stepper-insanity'
            : ''
      const insanityCheck =
        field === 'insanityPts'
          ? `<label class="showdown-insanity-check" title="Heavy"><input type="checkbox" data-showdown-slot="${slot}" data-showdown-armor-check="insanityHeavy" aria-label="Heavy insanity" ${
              armor.insanityHeavy ? 'checked' : ''
            } /></label>`
          : ''
      const controlsClass =
        field === 'insanityPts'
          ? 'showdown-stepper-controls showdown-stepper-controls-insanity'
          : 'showdown-stepper-controls'

      return `
      <div class="showdown-stepper showdown-stepper-simple${extraClass}">
        <span class="showdown-stepper-label">${iconLabel(icon, label)}</span>
        <div class="${controlsClass}">
          <button type="button" data-showdown-slot="${slot}" data-showdown-field="${field}" data-showdown-kind="base" data-showdown-delta="-1" data-showdown-min="${
            min ?? ''
          }" data-showdown-max="${max ?? ''}">-</button>
          <strong class="showdown-static-value">${base}</strong>
          <button type="button" data-showdown-slot="${slot}" data-showdown-field="${field}" data-showdown-kind="base" data-showdown-delta="1" data-showdown-min="${
            min ?? ''
          }" data-showdown-max="${max ?? ''}">+</button>
          ${insanityCheck}
        </div>
      </div>`
    }

    const renderCombatStepper = ([field, label, min, max, icon]) => {
      const base = coerceNumber(p[field], 0)
      const modifier = getShowdownModifier(slot, field)
      const temporary = coerceNumber(modifier.temporary, 0)
      const tokensPositive = coerceNumber(modifier.tokensPositive, 0)
      const tokensNegative = coerceNumber(modifier.tokensNegative, 0)
      const total = base + temporary + tokensPositive - tokensNegative

      return `
      <div class="showdown-stat-card">
        <div class="showdown-stat-header">
          <div class="showdown-stat-name">${iconLabel(icon, label)}</div>
          <strong class="showdown-stat-total-value">${total}</strong>
        </div>
        <div class="showdown-stat-line showdown-stat-line-pairs">
          <div class="showdown-stat-pair">
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
          <div class="showdown-stat-pair">
            <span class="showdown-bucket-label">Tokens (+)</span>
            <div class="showdown-stepper-controls">
              <button type="button" data-showdown-slot="${slot}" data-showdown-field="${field}" data-showdown-kind="tokensPositive" data-showdown-delta="-1">-</button>
              <strong class="showdown-static-value">${tokensPositive}</strong>
              <button type="button" data-showdown-slot="${slot}" data-showdown-field="${field}" data-showdown-kind="tokensPositive" data-showdown-delta="1">+</button>
            </div>
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
            <span class="showdown-bucket-label">Tokens (-)</span>
            <div class="showdown-stepper-controls">
              <button type="button" data-showdown-slot="${slot}" data-showdown-field="${field}" data-showdown-kind="tokensNegative" data-showdown-delta="-1">-</button>
              <strong class="showdown-static-value">${tokensNegative}</strong>
              <button type="button" data-showdown-slot="${slot}" data-showdown-field="${field}" data-showdown-kind="tokensNegative" data-showdown-delta="1">+</button>
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

    const renderProficiencyStepper = () => `
      <div class="showdown-stepper showdown-stepper-simple showdown-stepper-proficiency-combined">
        <div class="showdown-proficiency-header">
          <span class="showdown-stepper-label showdown-stepper-label-proficiency">${iconLabel('icon-stats', 'Weapon Prof')}</span>
          <div class="showdown-stepper-controls showdown-stepper-controls-proficiency-rank">
            <button type="button" data-showdown-proficiency-slot="${slot}" data-showdown-proficiency-field="level" data-showdown-proficiency-delta="-1" aria-label="Decrease proficiency rank">-</button>
            <strong class="showdown-static-value">${proficiencyLevel}</strong>
            <button type="button" data-showdown-proficiency-slot="${slot}" data-showdown-proficiency-field="level" data-showdown-proficiency-delta="1" aria-label="Increase proficiency rank">+</button>
          </div>
        </div>
        <div class="showdown-proficiency-inline">
          <input
            type="text"
            class="showdown-proficiency-type-input"
            data-showdown-proficiency-slot="${slot}"
            data-showdown-proficiency-field="type"
            value="${String(proficiency.type || '')}"
            placeholder="Type"
            aria-label="Weapon proficiency type"
          />
          <label class="showdown-proficiency-reminder" title="Temporary weapon proficiency reminder">
            <input
              type="checkbox"
              data-showdown-slot="${slot}"
              data-showdown-armor-check="proficiencyReminder"
              aria-label="Weapon proficiency reminder"
              ${armor.proficiencyReminder ? 'checked' : ''}
            />
          </label>
        </div>
      </div>`

    const renderShowdownKnowledgeCopy = (item, level, req, nextDisplay, headerControls) => `
      <div class="showdown-array-copy showdown-array-copy-knowledge">
        <div class="showdown-knowledge-header">
          <span class="showdown-copy-title">
            <strong>${escapeHtml(item?.name || 'Unnamed')}</strong>
            <span class="showdown-copy-level">L${level}</span>
          </span>
          <div class="showdown-knowledge-controls">
            ${headerControls}
          </div>
        </div>
        <div class="showdown-copy-section showdown-copy-section-observation">
          <span class="showdown-copy-label showdown-copy-section-label showdown-copy-section-label-observation">${iconLabel('icon-observation', 'Observation')}</span>
          <span class="showdown-copy-section-value">${escapeHtml(item?.observation || '-')}</span>
        </div>
        <div class="showdown-copy-section showdown-copy-section-rules">
          <span class="showdown-copy-label showdown-copy-section-label showdown-copy-section-label-rules">${iconLabel('icon-rules', 'Rules')}</span>
          <span class="showdown-copy-section-value">${escapeHtml(item?.rules || '-')}</span>
        </div>
        <div class="showdown-copy-meta">
          <span class="showdown-copy-meta-item">
            <span class="showdown-copy-label">Observations Required:</span>
            <span class="showdown-copy-value">${req}</span>
          </span>
          <span class="showdown-copy-meta-item">
            <span class="showdown-copy-label">Next:</span>
            <span class="showdown-copy-value">${escapeHtml(nextDisplay)}</span>
          </span>
        </div>
      </div>`

    const renderShowdownKnowledgeRow = (item, slot, arrayName, index) => {
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
      const headerControls = `
        <div class="showdown-inline-stepper showdown-inline-stepper-knowledge">
          <span>Current</span>
          <button type="button" data-showdown-obs-slot="${slot}" data-showdown-obs-array="${arrayName}" data-showdown-obs-index="${index}" data-showdown-obs-delta="-1">-</button>
          <strong class="showdown-static-value">${current}</strong>
          <button type="button" data-showdown-obs-slot="${slot}" data-showdown-obs-array="${arrayName}" data-showdown-obs-index="${index}" data-showdown-obs-delta="1">+</button>
        </div>
        <div class="showdown-knowledge-actions">
          ${
            canUpgrade
              ? `<button type="button" class="btn btn-primary" data-showdown-upgrade-slot="${slot}" data-showdown-upgrade-array="${arrayName}" data-showdown-upgrade-index="${index}">Upgrade</button>`
              : ''
          }
          <button type="button" class="btn btn-danger" data-showdown-remove-slot="${slot}" data-showdown-remove-array="${arrayName}" data-showdown-remove-index="${index}">Remove</button>
        </div>`

      return `
        <li class="showdown-array-row showdown-array-row-knowledge">
          ${renderShowdownKnowledgeCopy(item, level, req, nextDisplay, headerControls)}
        </li>`
    }

    const renderShowdownMarkdownRulesRow = (item, slot, arrayName, index) => {
      const content = getShowdownMarkdownContent(arrayName, item?.file || '')
      const displayPreview = content || 'No text available.'
      return `
        <li class="showdown-array-row showdown-array-row-knowledge showdown-array-row-markdown">
          <div class="showdown-array-copy showdown-array-copy-knowledge showdown-array-copy-markdown">
            <div class="showdown-knowledge-header">
              <span class="showdown-copy-title">
                <button
                  type="button"
                  class="showdown-copy-title-button"
                  data-showdown-md-array="${arrayName}"
                  data-showdown-md-file="${escapeHtml(item?.file || '')}"
                >${escapeHtml(item?.name || 'Unknown')}</button>
              </span>
              <div class="showdown-knowledge-controls">
                <div class="showdown-knowledge-actions">
                  <button type="button" class="btn btn-danger" data-showdown-remove-slot="${slot}" data-showdown-remove-array="${arrayName}" data-showdown-remove-index="${index}">Remove</button>
                </div>
              </div>
            </div>
            <div class="showdown-copy-section showdown-copy-section-rules">
              <span class="showdown-copy-label showdown-copy-section-label showdown-copy-section-label-rules">${iconLabel('icon-rules', 'Rules')}</span>
              <span class="showdown-copy-section-value">${escapeHtml(displayPreview)}</span>
            </div>
            <div class="showdown-copy-meta">
              <span class="showdown-copy-meta-item">
                <span class="showdown-copy-label">Reference:</span>
                <span class="showdown-copy-value">${escapeHtml(item?.file || '-')}</span>
              </span>
            </div>
          </div>
        </li>`
    }

    return `
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
          <label class="showdown-bool-toggle showdown-bool-toggle-compact">
            <input type="checkbox" data-showdown-bool-slot="${slot}" data-showdown-bool-field="lifetimeReroll" ${
              p.lifetimeReroll ? 'checked' : ''
            } />
            <span>Lifetime Reroll</span>
          </label>
        </div>
        <section class="showdown-group showdown-group-vitals">
          <h4>${iconLabel('icon-vitals', 'Age / Survival / Insanity')}</h4>
          <div class="showdown-stats showdown-stats-vitals">
            ${vitalStats.map(renderBaseStepper).join('')}
            ${renderProficiencyStepper()}
          </div>
          <div class="showdown-stats showdown-stats-vitals showdown-stats-vitals-bleeding">
            ${renderBaseStepper(['lumi', 'Lumi', 0, null, 'icon-vitals'])}
            <div class="showdown-stepper showdown-stepper-simple showdown-stepper-bleeding">
              <span class="showdown-stepper-label">${iconLabel('icon-bleeding', 'Bleeding Tokens')}</span>
              <div class="showdown-stepper-controls">
                <button type="button" data-showdown-slot="${slot}" data-showdown-part="bleedingTokens" data-showdown-delta="-1">-</button>
                <strong class="showdown-static-value">${Math.max(0, coerceNumber(armor.bleedingTokens, 0))}</strong>
                <button type="button" data-showdown-slot="${slot}" data-showdown-part="bleedingTokens" data-showdown-delta="1">+</button>
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
          <div class="showdown-armor-header">
            <h4>${iconLabel('icon-shield', 'Armor')}</h4>
            <div class="showdown-armor-bulk-stepper" aria-label="Adjust all armor">
              <button type="button" data-showdown-slot="${slot}" data-showdown-bulk-armor-delta="-1" aria-label="Decrease all armor">-</button>
              <strong class="showdown-static-value">All</strong>
              <button type="button" data-showdown-slot="${slot}" data-showdown-bulk-armor-delta="1" aria-label="Increase all armor">+</button>
            </div>
          </div>
          <div class="showdown-armor-grid">
            ${[
              ['head', 'Head', 'icon-head'],
              ['arms', 'Arms', 'icon-arms'],
              ['body', 'Body', 'icon-body'],
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
          (item, index) => renderShowdownMarkdownRulesRow(item, slot, 'fightingArts', index)
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
          (item, index) => renderShowdownMarkdownRulesRow(item, slot, 'secretFightingArts', index)
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
        <details class="showdown-toggle" data-showdown-section="notes" open>
        <summary>Notes (${(p.notes || []).length})</summary>
        <div class="showdown-array-actions">
          <button type="button" class="btn btn-secondary" data-showdown-add-slot="${slot}" data-showdown-add-array="notes">+ Add New</button>
        </div>
        ${showdownListItems(
          p.notes,
          'None',
          (_item, index) => `
          <li class="showdown-array-row">
            ${renderShowdownTextEntry(slot, 'notes', index)}
            <button type="button" class="btn btn-danger" data-showdown-remove-slot="${slot}" data-showdown-remove-array="notes" data-showdown-remove-index="${index}">Remove</button>
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
          (item, index) => renderShowdownMarkdownRulesRow(item, slot, 'disorders', index)
        )}
        </details>
      </section>

      <section class="showdown-page-panel" data-showdown-page-panel="knowledge"${activePage === 'knowledge' ? '' : ' hidden'}>
        <details class="showdown-toggle" data-showdown-section="tenetKnowledge" open>
        <summary>Tenet Knowledge and Neurosis (${(p.tenetKnowledge || []).length})</summary>
        <div class="showdown-array-neurosis showdown-array-row showdown-array-row-knowledge showdown-array-row-neurosis">
          <div class="showdown-array-copy showdown-array-copy-knowledge">
            <div class="showdown-neurosis-title">${iconLabel('icon-neurosis', escapeHtml(p.philosophyNeurosisName || 'Unnamed Neurosis'))}</div>
            <div class="showdown-copy-section showdown-copy-section-rules showdown-copy-section-neurosis">
              <span class="showdown-copy-label showdown-copy-section-label showdown-copy-section-label-rules">${iconLabel('icon-rules', 'Neurosis')}</span>
              <span class="showdown-copy-section-value">${escapeHtml(p.philosophyNeurosis || '-')}</span>
            </div>
          </div>
        </div>
        ${showdownListItems(
          p.tenetKnowledge,
          'None',
          (item, index) => renderShowdownKnowledgeRow(item, slot, 'tenetKnowledge', index)
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
          (item, index) => renderShowdownKnowledgeRow(item, slot, 'knowledge', index)
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
      if (!key || !Object.prototype.hasOwnProperty.call(state, key)) continue
      details.open = Boolean(state[key])
    }
  }

  function renderShowdownCard(container, options) {
    if (!container) return false
    const accordionState = snapshotShowdownAccordionState(container)
    container.innerHTML = buildShowdownCardMarkup(options)
    restoreShowdownAccordionState(container, accordionState)
    return true
  }

  globalScope.KDMShowdownView = {
    renderShowdownCard
  }
})(window)
