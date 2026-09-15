(function attachSevereInjuryTables(globalScope) {
  const TABLES = Object.freeze({
    brain: {
      title: 'Brain Trauma',
      rows: [
        ['1 - 2', 'Mortal Terror', 'No ifs, ands, or buts, the survivor is dead.'],
        ['3', 'Memory Loss', 'Lose 2 levels of weapon proficiency.'],
        ['4', 'Flee', 'You are knocked down & suffer knockback equal to your movement towards the closest board edge. Gain 1d5 insanity.'],
        ['5 - 6', 'Danger Seizure', 'You thrash about wildly, dealing 1 damage to yourself & every adjacent survivor. Gain a random disorder & 1d5 Insanity.'],
        ['7 - 8', 'Lunacy', 'Gain a random disorder & 1d5 insanity.'],
        ['9', 'New Perspective', 'You are knocked down & gain 1d10 insanity.'],
        ['10', 'Frenzy', 'Gain 1d5 insanity, +1 speed token & +1 strength token. Ignore slow on melee weapons. You may not spend survival. You may not use fighting arts. You may not use weapon specialization or weapon mastery. Can be gained multiple times. Lasts until end of showdown.'],
        ['11', 'Maniacal Laughter', 'You are knocked down. Gain -1 speed token, the priority target token & 1d5 insanity.'],
        ['12', 'Clarity', 'You are knocked down. Add your current survival to insanity & reduce survival to 0. Gain random disorder. If you already have 3 disorders, you die.'],
        ['13', 'Impossible!', 'How could this happen! Gain +1d10 survival, +1d10 insanity & +2 luck tokens!']
      ]
    },
    head: {
      title: 'Head Severe Injury',
      rows: [
        ['1 - 2', 'Head Explosion!', 'Your head erupts in a shower of gore, killing you instantly. All other survivors are so disturbed that they lose 1 survival.'],
        ['3 - 4', 'Decapitation', 'You are dead.'],
        ['5', 'Intracranial Hemorrhage', 'You can no longer use or gain any survival. This injury is permanent & can be recorded once. Gain 1 bleeding token.'],
        ['6', 'Deaf', "You won't hear it coming. Suffer -1 permanent evasion. This injury is permanent & can be recorded once. Gain 1 bleeding token."],
        ['7', 'Blind', 'Lose an eye. Suffer -1 permanent accuracy. This injury is permanent & can be recorded twice. A survivor with two blind severe injuries suffers -4 permanent accuracy & retires at the end of the next showdown or settlement phase, having lost all sight. Gain 1 bleeding token.'],
        ['8', 'Concussion', 'Your brain is scrambled like an egg. Gain a random disorder. Gain 1 bleeding token.'],
        ['9', 'Shattered Jaw', 'You drink your meat through a straw. You can no longer consume or be affected by events requiring you to consume. You can no longer encourage. This injury is permanent & can be recorded once. Gain 1 bleeding token.'],
        ['10', 'Destroyed tooth', 'If you have 3+ courage, you boldly spit the tooth out & gain +2 insanity! Otherwise, the blow sends you sprawling & you are knocked down.']
      ]
    },
    arms: {
      title: 'Arms Severe Injury',
      rows: [
        ['1 - 2', 'Die of Shock', 'Your vision fades, along with the sight of your mangled, armless torso.'],
        ['3', 'Bleeding', 'Blood spews from your arm. Gain 2 bleeding tokens.'],
        ['4', 'Dismembered Arm', 'Lose an arm. You can no longer activate two-handed weapons. This injury is permanent & can be recorded twice. A survivor with two dismembered arms cannot activate any weapons. Gain 1 bleeding token.'],
        ['5', 'Ruptured Muscle', 'A painful rip. The arm hangs limp. You can no longer activate fighting arts. This injury is permanent & can be recorded once. Gain 1 bleeding token.'],
        ['6', 'Contracture', 'The arm will never be the same. Suffer -1 permanent accuracy. This injury is permanent & can be recorded multiple times. Gain 1 bleeding token.'],
        ['7', 'Broken Arm', 'An ear-shattering crunch. Suffer -1 permanent accuracy & -1 permanent strength. This injury is permanent & can be recorded twice. Gain 1 bleeding token.'],
        ['8', 'Spiral Fracture', 'Your arm twists unnaturally. Gain -2 strength tokens. Skip the next hunt. Gain 1 bleeding token.'],
        ['9', 'Dislocated Shoulder', 'Pop! You cannot activate two-handed or paired weapons or use block until showdown ends. Gain 1 bleeding token.'],
        ['10 +', 'Hit the Dirt', 'The blow sends you sprawling & you are knocked down.']
      ]
    },
    body: {
      title: 'Body Severe Injury',
      rows: [
        ['1 - 2', 'Instant Death', 'The blow sends a bone fragment directly into your heart, killing you instantly.'],
        ['3', 'Bleeding', 'Blood spews from your torso. Gain 2 bleeding tokens.'],
        ['4', 'Gaping Chest Wound', 'Suffer -1 permanent strength. This injury is permanent & can be recorded multiple times. Gain 1 bleeding Token.'],
        ['5', 'Destroyed Back', 'A sharp cracking noise. Suffer -2 permanent movement. You can no longer activate any gear that has 2+ strength. This injury is permanent & can be recorded once. Gain 1 bleeding token.'],
        ['6', 'Disemboweled', 'Your movement is reduced to 1 until the end of the showdown. Gain 1 bleeding token. Skip the next hunt. If you suffer this during the showdown, at least one survivor must live survive the showdown to carry you back to the settlement. Otherwise, you are lost & die.'],
        ['7', 'Ruptured Spleen', 'A vicious body blow. Skip the next hunt. Gain 2 bleeding tokens.'],
        ['8', 'Broken Rib', 'It even hurts to breathe. Suffer -1 permanent speed. This injury is permanent & can be recorded multiple times. Gain 1 bleeding token.'],
        ['9', 'Collapsed Lung', "You can't catch a breath. Gain -1 movement token. Gain 1 bleeding token."],
        ['10 +', 'Bowled Over', 'The blow sends you sprawling & you are knocked down.']
      ]
    },
    waist: {
      title: 'Waist Severe Injury',
      rows: [
        ['1 - 2', 'Final Breath', 'With your last gasp, you utter final words of bravery. Adjacent survivors gain +1 survival. You are dead.'],
        ['3', 'Bleeding Kidneys', 'You have intense abdominal pain. Gain 2 bleeding tokens.'],
        ['4', 'Intestinal Prolapse', 'Your gut is gravely injured. You can no longer equip gear on your waist, as it is too painful to wear. This injury is permanent & can be recorded once. Gain 1 bleeding token.'],
        ['5', 'Warped Pelvis', 'Your pelvis is disfigured. Suffer -1 permanent luck. This injury is permanent & can be recorded multiple times. Gain 1 bleeding token.'],
        ['6', 'Destroyed Genitals', 'You cannot be nominated for the Intimacy story event. This injury is permanent & can be recorded once. Gain a random disorder. You are knocked down. Gazing upwards, you wonder at the futility of your struggle. Gain +3 insanity. Gain 1 bleeding token.'],
        ['7', 'Broken Hip', 'Your hip is dislocated. You can no longer dodge. Suffer -1 permanent movement. This injury is permanent can be recored once. Gain 1 bleeding token.'],
        ['8', 'Slashed Back', 'Making sudden movement is excruciatingly painful. You cannot surge until showdown ends. Gain 1 bleeding token.'],
        ['9', 'Bruised Tailbone', 'The base of your spine is in agony. You cannot dash until showdown ends. You are knocked down. Gain 1 bleeding Token.'],
        ['10 +', 'Belly-up', 'The blow sends you sprawling & you are knocked down.']
      ]
    },
    legs: {
      title: 'Legs Severe Injury',
      rows: [
        ['1 - 2', 'Bloody Geyser', 'Blood shoots from your femoral artery at an alarming rate, killing you in seconds.'],
        ['3', 'Bleeding', 'Blood spews down your legs. Gain 2 bleeding tokens.'],
        ['4', 'Dismembered Leg', 'Lose a leg. You suffer -2 permanent movement & can no longer dash. This injury is permanent & can be recorded twice. A survivor with two dismembered legs has lost both of their legs & must retire at the end of the next showdown or settlement phase. Gain 1 bleeding token.'],
        ['5', 'Hamstrung', 'A painful rip. The leg is unusable. You can no longer use any fighting arts or abilities. This injury is permanent & can be recorded once. Gain 1 bleeding token.'],
        ['6', 'Torn Achilles Tendon', 'Your leg cannot bear your weight. Until the end of the showdown, whenever you suffer light, heavy or severe injury, you are also knocked down. Skip the next hunt. Gain 1 bleeding token.'],
        ['7', 'Torn Muscle', 'Your quadriceps is ripped to shreds. You cannot dash until the showdown ends. Skip the next hunt. Gain 1 bleeding token.'],
        ['8', 'Broken Leg', 'An ear-shattering crunch! Adjacent survivors suffer 1 brain damage. Suffer -1 permanent movement. This injury is permanent & can be recorded twice. Gain 1 bleeding token.'],
        ['9', 'Bloody Thighs', 'Gain 2 bleeding tokens.'],
        ['10 +', 'Lost Balance', 'The blow sends you sprawling & you are knocked down.']
      ]
    }
  })

  const RECORDING_LIMITS = Object.freeze({
    head: Object.freeze({
      'Intracranial Hemorrhage': 1,
      Deaf: 1,
      Blind: 2,
      'Shattered Jaw': 1
    }),
    arms: Object.freeze({
      'Dismembered Arm': 2,
      'Ruptured Muscle': 1,
      Contracture: null,
      'Broken Arm': 2
    }),
    body: Object.freeze({
      'Gaping Chest Wound': null,
      'Destroyed Back': 1,
      'Broken Rib': null
    }),
    waist: Object.freeze({
      'Intestinal Prolapse': 1,
      'Warped Pelvis': null,
      'Destroyed Genitals': 1,
      'Broken Hip': 1
    }),
    legs: Object.freeze({
      'Dismembered Leg': 2,
      Hamstrung: 1,
      'Broken Leg': 2
    })
  })

  const ACTION_DEFINITIONS = Object.freeze({
    brain: Object.freeze({
      'Mortal Terror': { safe: true, actions: [{ type: 'die' }] },
      'Memory Loss': { safe: true, actions: [{ type: 'adjustProficiency', amount: -2 }] }
    }),
    head: Object.freeze({
      Decapitation: { safe: true, actions: [{ type: 'die' }] },
      'Intracranial Hemorrhage': {
        safe: true,
        actions: [
          { type: 'recordImpairment' },
          { type: 'addNote', text: 'Cannot use or gain survival — Intracranial Hemorrhage' },
          { type: 'addBleeding', amount: 1 }
        ]
      },
      Deaf: {
        safe: true,
        actions: [
          { type: 'recordImpairment' },
          { type: 'adjustField', field: 'evasion', amount: -1 },
          { type: 'addBleeding', amount: 1 }
        ]
      },
      Blind: {
        safe: true,
        actions: [
          { type: 'recordImpairment' },
          { type: 'adjustField', field: 'accuracy', amount: -1 },
          { type: 'adjustField', field: 'accuracy', amount: -4, minimumRecordCount: 2 },
          { type: 'addNote', text: 'Retire at the end of the next showdown or settlement phase — Two Blind severe injuries', minimumRecordCount: 2 },
          { type: 'addBleeding', amount: 1 }
        ]
      },
      Concussion: { safe: false, bleedingOnly: 1 },
      'Shattered Jaw': {
        safe: true,
        actions: [
          { type: 'recordImpairment' },
          { type: 'addNote', text: 'Cannot consume, be affected by consume events, or encourage — Shattered Jaw' },
          { type: 'addBleeding', amount: 1 }
        ]
      },
      'Destroyed tooth': {
        safe: true,
        requires: 'courageAtLeast3',
        actions: [{ type: 'adjustField', field: 'insanityPts', amount: 2 }]
      }
    }),
    arms: Object.freeze({
      'Die of Shock': { safe: true, actions: [{ type: 'die' }] },
      Bleeding: { safe: true, actions: [{ type: 'addBleeding', amount: 2 }] },
      'Dismembered Arm': {
        safe: true,
        actions: [
          { type: 'recordImpairment' },
          { type: 'addNote', text: 'Cannot activate two-handed weapons — Dismembered Arm' },
          { type: 'addNote', text: 'Cannot activate any weapons — Two Dismembered Arms', minimumRecordCount: 2 },
          { type: 'addBleeding', amount: 1 }
        ]
      },
      'Ruptured Muscle': {
        safe: false,
        bleedingOnly: 1
      },
      Contracture: {
        safe: true,
        actions: [
          { type: 'recordImpairment' },
          { type: 'adjustField', field: 'accuracy', amount: -1 },
          { type: 'addBleeding', amount: 1 }
        ]
      },
      'Broken Arm': {
        safe: true,
        actions: [
          { type: 'recordImpairment' },
          { type: 'adjustField', field: 'accuracy', amount: -1 },
          { type: 'adjustField', field: 'strength', amount: -1 },
          { type: 'addBleeding', amount: 1 }
        ]
      },
      'Spiral Fracture': {
        safe: true,
        actions: [
          { type: 'addToken', field: 'strength', kind: 'tokensNegative', amount: 2 },
          { type: 'addNote', text: 'Skip the next hunt — Spiral Fracture' },
          { type: 'addBleeding', amount: 1 }
        ]
      },
      'Dislocated Shoulder': {
        safe: true,
        actions: [
          { type: 'addNote', text: 'Until showdown ends: cannot activate two-handed or paired weapons or use block — Dislocated Shoulder' },
          { type: 'addBleeding', amount: 1 }
        ]
      }
    }),
    body: Object.freeze({
      'Instant Death': { safe: true, actions: [{ type: 'die' }] },
      Bleeding: { safe: true, actions: [{ type: 'addBleeding', amount: 2 }] },
      'Gaping Chest Wound': {
        safe: true,
        actions: [
          { type: 'recordImpairment' },
          { type: 'adjustField', field: 'strength', amount: -1 },
          { type: 'addBleeding', amount: 1 }
        ]
      },
      'Destroyed Back': {
        safe: true,
        actions: [
          { type: 'recordImpairment' },
          { type: 'adjustField', field: 'movement', amount: -2 },
          { type: 'addNote', text: 'Cannot activate gear with 2+ strength — Destroyed Back' },
          { type: 'addBleeding', amount: 1 }
        ]
      },
      Disemboweled: {
        safe: true,
        actions: [
          { type: 'setTemporaryTotal', field: 'movement', value: 1 },
          { type: 'addNote', text: 'Skip the next hunt — Disemboweled' },
          { type: 'addNote', text: 'Must be carried back by a survivor who lives through the showdown or be lost and die — Disemboweled' },
          { type: 'addBleeding', amount: 1 }
        ]
      },
      'Ruptured Spleen': {
        safe: true,
        actions: [
          { type: 'addNote', text: 'Skip the next hunt — Ruptured Spleen' },
          { type: 'addBleeding', amount: 2 }
        ]
      },
      'Broken Rib': {
        safe: true,
        actions: [
          { type: 'recordImpairment' },
          { type: 'adjustField', field: 'speed', amount: -1 },
          { type: 'addBleeding', amount: 1 }
        ]
      },
      'Collapsed Lung': {
        safe: true,
        actions: [
          { type: 'addToken', field: 'movement', kind: 'tokensNegative', amount: 1 },
          { type: 'addBleeding', amount: 1 }
        ]
      }
    }),
    waist: Object.freeze({
      'Bleeding Kidneys': { safe: true, actions: [{ type: 'addBleeding', amount: 2 }] },
      'Intestinal Prolapse': {
        safe: true,
        actions: [
          { type: 'recordImpairment' },
          { type: 'addNote', text: 'Cannot equip waist gear — Intestinal Prolapse' },
          { type: 'addBleeding', amount: 1 }
        ]
      },
      'Warped Pelvis': {
        safe: true,
        actions: [
          { type: 'recordImpairment' },
          { type: 'adjustField', field: 'luck', amount: -1 },
          { type: 'addBleeding', amount: 1 }
        ]
      },
      'Destroyed Genitals': { safe: false, bleedingOnly: 1 },
      'Broken Hip': {
        safe: true,
        actions: [
          { type: 'recordImpairment' },
          { type: 'adjustField', field: 'movement', amount: -1 },
          { type: 'addNote', text: 'Cannot dodge — Broken Hip' },
          { type: 'addBleeding', amount: 1 }
        ]
      },
      'Slashed Back': {
        safe: true,
        actions: [
          { type: 'addNote', text: 'Until showdown ends: cannot surge — Slashed Back' },
          { type: 'addBleeding', amount: 1 }
        ]
      },
      'Bruised Tailbone': { safe: false, bleedingOnly: 1 }
    }),
    legs: Object.freeze({
      'Bloody Geyser': { safe: true, actions: [{ type: 'die' }] },
      Bleeding: { safe: true, actions: [{ type: 'addBleeding', amount: 2 }] },
      'Dismembered Leg': {
        safe: true,
        actions: [
          { type: 'recordImpairment' },
          { type: 'adjustField', field: 'movement', amount: -2 },
          { type: 'addNote', text: 'Cannot dash — Dismembered Leg' },
          { type: 'addNote', text: 'Retire at the end of the next showdown or settlement phase — Two Dismembered Legs', minimumRecordCount: 2 },
          { type: 'addBleeding', amount: 1 }
        ]
      },
      Hamstrung: {
        safe: false,
        bleedingOnly: 1
      },
      'Torn Achilles Tendon': {
        safe: true,
        actions: [
          { type: 'addNote', text: 'Until showdown ends: light, heavy, or severe injuries also knock you down — Torn Achilles Tendon' },
          { type: 'addNote', text: 'Skip the next hunt — Torn Achilles Tendon' },
          { type: 'addBleeding', amount: 1 }
        ]
      },
      'Torn Muscle': {
        safe: true,
        actions: [
          { type: 'addNote', text: 'Until showdown ends: cannot dash — Torn Muscle' },
          { type: 'addNote', text: 'Skip the next hunt — Torn Muscle' },
          { type: 'addBleeding', amount: 1 }
        ]
      },
      'Broken Leg': { safe: false, bleedingOnly: 1 },
      'Bloody Thighs': { safe: true, actions: [{ type: 'addBleeding', amount: 2 }] }
    })
  })

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
  }

  function getSevereInjuryTable(location) {
    return TABLES[String(location || '').trim().toLowerCase()] || null
  }

  function getSevereInjuryRecordLimit(location, title) {
    const limits = RECORDING_LIMITS[String(location || '').trim().toLowerCase()]
    const injuryTitle = String(title || '').trim()
    if (!limits || !injuryTitle) return null
    const normalizedTitle = injuryTitle.toLowerCase()
    const matchingTitle = Object.keys(limits).find(candidate => candidate.toLowerCase() === normalizedTitle)
    if (!matchingTitle) return null
    return { permanent: true, maxRecords: limits[matchingTitle] }
  }

  function getRecordedSevereInjuryCount(location, title, personOrLegacyInjuries = {}) {
    const normalizedLocation = String(location || '').trim().toLowerCase()
    const normalizedTitle = String(title || '').trim().toLowerCase()
    if (!normalizedLocation || !normalizedTitle) return 0

    if (!Array.isArray(personOrLegacyInjuries)) {
      const records = Array.isArray(personOrLegacyInjuries?.severeInjuries)
        ? personOrLegacyInjuries.severeInjuries
        : []
      const record = records.find(
        injury =>
          String(injury?.location || '').trim().toLowerCase() === normalizedLocation &&
          String(injury?.name || '').trim().toLowerCase() === normalizedTitle
      )
      if (record) return Math.max(0, Math.trunc(Number(record.count) || 0))
    }

    const legacyInjuries = Array.isArray(personOrLegacyInjuries)
      ? personOrLegacyInjuries
      : personOrLegacyInjuries?.impairments
    return Array.isArray(legacyInjuries)
      ? legacyInjuries.filter(injury => String(injury || '').trim().toLowerCase() === normalizedTitle).length
      : 0
  }

  function evaluateSevereInjuryResult(location, title, personOrLegacyInjuries = {}) {
    const limit = getSevereInjuryRecordLimit(location, title)
    if (!limit) return { outcome: 'apply', permanent: false, maxRecords: null, recordedCount: 0, bleedingTokens: 0 }
    const recordedCount = getRecordedSevereInjuryCount(location, title, personOrLegacyInjuries)
    const atMaximum = Number.isInteger(limit.maxRecords) && recordedCount >= limit.maxRecords
    return {
      outcome: atMaximum ? 'bleeding' : 'record',
      permanent: true,
      maxRecords: limit.maxRecords,
      recordedCount,
      bleedingTokens: atMaximum ? 1 : 0
    }
  }

  function getSevereInjuryActionDefinition(location, title) {
    const definitions = ACTION_DEFINITIONS[String(location || '').trim().toLowerCase()]
    const normalizedTitle = String(title || '').trim().toLowerCase()
    if (!definitions || !normalizedTitle) return null
    const matchingTitle = Object.keys(definitions).find(candidate => candidate.toLowerCase() === normalizedTitle)
    return matchingTitle ? definitions[matchingTitle] : null
  }

  function getSevereInjuryActionAvailability(location, title, person) {
    const definition = getSevereInjuryActionDefinition(location, title)
    if (!definition) return { kind: 'none' }
    const recordEvaluation = evaluateSevereInjuryResult(location, title, person)
    if (recordEvaluation.outcome === 'bleeding') {
      return { kind: 'bleeding', bleedingTokens: 1, reason: 'maximum' }
    }
    if (definition.safe) {
      if (definition.requires === 'courageAtLeast3' && Number(person?.courage || 0) < 3) return { kind: 'none' }
      return { kind: 'apply' }
    }
    if (Number(definition.bleedingOnly || 0) > 0) {
      return { kind: 'bleeding', bleedingTokens: Number(definition.bleedingOnly) }
    }
    return { kind: 'none' }
  }

  function ensureArray(owner, key) {
    if (!Array.isArray(owner[key])) owner[key] = []
    return owner[key]
  }

  function addUniqueReminder(person, text) {
    const notes = ensureArray(person, 'notes')
    if (!notes.some(note => String(note || '').trim().toLowerCase() === text.toLowerCase())) notes.push(text)
  }

  function recordCappedSevereInjury(person, location, title) {
    const normalizedLocation = String(location || '').trim().toLowerCase()
    const injuryTitle = String(title || '').trim()
    const legacyCount = getRecordedSevereInjuryCount(normalizedLocation, injuryTitle, person.impairments || [])
    const injuries = ensureArray(person, 'severeInjuries')
    let record = injuries.find(
      injury =>
        String(injury?.location || '').trim().toLowerCase() === normalizedLocation &&
        String(injury?.name || '').trim().toLowerCase() === injuryTitle.toLowerCase()
    )
    if (!record) {
      record = { location: normalizedLocation, name: injuryTitle, count: legacyCount }
      injuries.push(record)
    }
    record.count = Math.max(0, Math.trunc(Number(record.count) || 0)) + 1
    if (legacyCount > 0 && Array.isArray(person.impairments)) {
      person.impairments = person.impairments.filter(
        impairment => String(impairment || '').trim().toLowerCase() !== injuryTitle.toLowerCase()
      )
    }
    return record.count
  }

  function applySevereInjuryAction({ location, title, person, armor, modifiers, mode = 'apply' } = {}) {
    if (!person || !armor) return { ok: false, outcome: 'none', changes: [] }
    const availability = getSevereInjuryActionAvailability(location, title, person)
    if (mode === 'bleeding') {
      if (availability.kind !== 'bleeding') return { ok: false, outcome: 'none', changes: [] }
      const amount = Math.max(0, Number(availability.bleedingTokens || 0))
      armor.bleedingTokens = Math.max(0, Number(armor.bleedingTokens || 0) + amount)
      return { ok: true, outcome: 'bleeding-only', changes: [`+${amount} bleeding token${amount === 1 ? '' : 's'}`] }
    }
    if (mode === 'apply' && availability.kind === 'bleeding' && availability.reason === 'maximum') {
      armor.bleedingTokens = Math.max(0, Number(armor.bleedingTokens || 0) + 1)
      return { ok: true, outcome: 'maximum-bleeding', changes: ['+1 bleeding token (permanent injury already at maximum)'] }
    }
    if (availability.kind !== 'apply') return { ok: false, outcome: 'none', changes: [] }

    const definition = getSevereInjuryActionDefinition(location, title)
    const recordEvaluation = evaluateSevereInjuryResult(location, title, person)
    const willRecord =
      Number.isInteger(recordEvaluation.maxRecords) &&
      definition.actions.some(action => action.type === 'recordImpairment')
    const recordCountAfter = recordEvaluation.recordedCount + (willRecord ? 1 : 0)
    const changes = []
    for (const action of definition.actions) {
      if (Number(action.minimumRecordCount || 0) > recordCountAfter) continue
      if (action.type === 'die') {
        person.isAlive = false
        changes.push('marked dead')
      } else if (action.type === 'adjustProficiency') {
        if (!person.weaponProficiency || typeof person.weaponProficiency !== 'object') {
          person.weaponProficiency = { type: '', level: 0, isSpecialist: false, isMaster: false }
        }
        const before = Number(person.weaponProficiency.level || 0)
        person.weaponProficiency.level = Math.max(0, Math.min(8, before + Number(action.amount || 0)))
        changes.push(`weapon proficiency ${Number(action.amount || 0) >= 0 ? '+' : ''}${Number(action.amount || 0)}`)
      } else if (action.type === 'recordImpairment') {
        if (Number.isInteger(recordEvaluation.maxRecords)) {
          const count = recordCappedSevereInjury(person, location, title)
          changes.push(`recorded ${String(title || '').trim()} (${count}/${recordEvaluation.maxRecords})`)
        }
      } else if (action.type === 'adjustField') {
        const amount = Number(action.amount || 0)
        const minimum = action.field === 'movement' ? 1 : action.field === 'survivalPts' || action.field === 'insanityPts' ? 0 : null
        const nextValue = Number(person[action.field] || 0) + amount
        person[action.field] = minimum === null ? nextValue : Math.max(minimum, nextValue)
        changes.push(`${action.field} ${amount >= 0 ? '+' : ''}${amount}`)
      } else if (action.type === 'addBleeding') {
        const amount = Math.max(0, Number(action.amount || 0))
        armor.bleedingTokens = Math.max(0, Number(armor.bleedingTokens || 0) + amount)
        changes.push(`+${amount} bleeding token${amount === 1 ? '' : 's'}`)
      } else if (action.type === 'addToken') {
        if (!modifiers || !action.field || !action.kind) continue
        if (!modifiers[action.field] || typeof modifiers[action.field] !== 'object') {
          modifiers[action.field] = { temporary: 0, tokensPositive: 0, tokensNegative: 0 }
        }
        const amount = Math.max(0, Number(action.amount || 0))
        modifiers[action.field][action.kind] = Math.max(0, Number(modifiers[action.field][action.kind] || 0) + amount)
        changes.push(`+${amount} ${action.field} negative token${amount === 1 ? '' : 's'}`)
      } else if (action.type === 'setTemporaryTotal') {
        if (!modifiers || !action.field) continue
        if (!modifiers[action.field] || typeof modifiers[action.field] !== 'object') {
          modifiers[action.field] = { temporary: 0, tokensPositive: 0, tokensNegative: 0 }
        }
        const modifier = modifiers[action.field]
        modifier.temporary =
          Number(action.value || 0) -
          Number(person[action.field] || 0) -
          Number(modifier.tokensPositive || 0) +
          Number(modifier.tokensNegative || 0)
        changes.push(`${action.field} total set to ${Number(action.value || 0)} until showdown ends`)
      } else if (action.type === 'addNote') {
        addUniqueReminder(person, action.text)
        changes.push(`reminder: ${action.text}`)
      }
    }
    return { ok: true, outcome: 'applied', changes }
  }

  function renderSevereInjuryPips(location, title, person) {
    const limit = getSevereInjuryRecordLimit(location, title)
    if (!limit || !Number.isInteger(limit.maxRecords)) return ''
    const count = Math.min(limit.maxRecords, getRecordedSevereInjuryCount(location, title, person))
    const pips = Array.from({ length: limit.maxRecords }, (_unused, index) =>
      `<span class="severe-injury-pip${index < count ? ' is-filled' : ''}" aria-hidden="true"></span>`
    ).join('')
    return `<span class="severe-injury-pips" aria-label="${escapeHtml(title)}: ${count} of ${limit.maxRecords} recorded">${pips}</span>`
  }

  function renderRecordedSevereInjuries(person) {
    const rows = Object.entries(RECORDING_LIMITS).flatMap(([location, limits]) =>
      Object.entries(limits)
        .filter(([, maxRecords]) => Number.isInteger(maxRecords))
        .filter(([title]) => getRecordedSevereInjuryCount(location, title, person) > 0)
        .map(([title]) =>
          `<li class="recorded-severe-injury"><span><strong>${escapeHtml(title)}</strong><span class="recorded-severe-injury-location">${escapeHtml(location)}</span></span>${renderSevereInjuryPips(location, title, person)}</li>`
        )
    )
    return rows.length
      ? `<ul class="recorded-severe-injuries">${rows.join('')}</ul>`
      : '<p class="ve-empty">No severe injuries.</p>'
  }

  function renderSevereInjuryTable(location, options = {}) {
    const table = getSevereInjuryTable(location)
    if (!table) return ''
    const slot = options.slot === 'A' || options.slot === 'B' ? options.slot : ''
    const person = options.person && typeof options.person === 'object' ? options.person : null
    const rows = table.rows
      .map(([roll, title, description]) => {
        const availability = slot && person ? getSevereInjuryActionAvailability(location, title, person) : { kind: 'none' }
        const actionMarkup =
          availability.kind === 'apply'
            ? `<button type="button" class="btn btn-secondary severe-injury-apply" data-severe-action="apply" data-severe-location="${escapeHtml(location)}" data-severe-title="${escapeHtml(title)}" data-severe-slot="${slot}">Apply</button>`
            : availability.kind === 'bleeding'
              ? `<button type="button" class="severe-injury-bleeding-only" data-severe-action="bleeding" data-severe-location="${escapeHtml(location)}" data-severe-title="${escapeHtml(title)}" data-severe-slot="${slot}" aria-label="Add ${availability.bleedingTokens} bleeding token for ${escapeHtml(title)}; resolve other effects manually" title="Add bleeding token only; resolve other effects manually"><svg aria-hidden="true"><use href="#icon-bleeding"></use></svg><span>+${availability.bleedingTokens}</span></button>`
              : ''
        const pips = person ? renderSevereInjuryPips(location, title, person) : ''
        return `<tr><th scope="row">${escapeHtml(roll)}</th><td><span class="severe-injury-title"><strong>${escapeHtml(title)}</strong>${pips}</span></td><td>${escapeHtml(description)}</td><td class="severe-injury-action-cell">${actionMarkup}</td></tr>`
      })
      .join('')
    return `<div class="severe-injury-reference"><table class="severe-injury-table"><thead><tr><th scope="col">Roll</th><th scope="col">Title</th><th scope="col">Description</th><th scope="col">Action</th></tr></thead><tbody>${rows}</tbody></table></div>`
  }

  const api = {
    applySevereInjuryAction,
    evaluateSevereInjuryResult,
    getSevereInjuryActionAvailability,
    getRecordedSevereInjuryCount,
    getSevereInjuryRecordLimit,
    getSevereInjuryTable,
    renderRecordedSevereInjuries,
    renderSevereInjuryTable
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = api
  globalScope.KDMSevereInjuryTables = api
})(typeof window !== 'undefined' ? window : globalThis)
