const test = require('node:test')
const assert = require('node:assert/strict')

const {
  applySevereInjuryAction,
  evaluateSevereInjuryResult,
  getSevereInjuryActionAvailability,
  getSevereInjuryRecordLimit,
  getSevereInjuryTable,
  healSevereInjury,
  renderRecordedSevereInjuries,
  renderSevereInjuryPicker,
  renderSevereInjuryTable
} = require('../src/rendererSevereInjuryTables')

test('provides all five hit-location tables and Brain Trauma', () => {
  for (const location of ['brain', 'head', 'arms', 'body', 'waist', 'legs']) {
    const table = getSevereInjuryTable(location)
    assert.ok(table, `${location} table should exist`)
    assert.ok(table.rows.length >= 8)
  }
})

test('preserves severe table text in rendered markup', () => {
  assert.match(renderSevereInjuryTable('brain'), /No ifs, ands, or buts, the survivor is dead\./)
  assert.match(renderSevereInjuryTable('head'), /Intracranial Hemorrhage/)
  assert.match(renderSevereInjuryTable('arms'), /Dismembered Arm/)
  assert.match(renderSevereInjuryTable('body'), /live survive the showdown/)
  assert.match(renderSevereInjuryTable('waist'), /permanent can be recored once/)
  assert.match(renderSevereInjuryTable('legs'), /Torn Achilles Tendon/)
})

test('exposes permanent severe injury recording limits', () => {
  assert.deepEqual(getSevereInjuryRecordLimit('head', 'Deaf'), { permanent: true, maxRecords: 1 })
  assert.deepEqual(getSevereInjuryRecordLimit('head', 'Blind'), { permanent: true, maxRecords: 2 })
  assert.deepEqual(getSevereInjuryRecordLimit('HEAD', 'blind'), { permanent: true, maxRecords: 2 })
  assert.deepEqual(getSevereInjuryRecordLimit('arms', 'Contracture'), { permanent: true, maxRecords: null })
  assert.equal(getSevereInjuryRecordLimit('brain', 'Frenzy'), null)
  assert.equal(getSevereInjuryRecordLimit('head', 'Concussion'), null)
})

test('classifies every table result described as permanent for recording', () => {
  for (const location of ['head', 'arms', 'body', 'waist', 'legs']) {
    for (const [, title, description] of getSevereInjuryTable(location).rows) {
      assert.equal(
        Boolean(getSevereInjuryRecordLimit(location, title)),
        /\bpermanent\b/i.test(description),
        `${location}/${title} permanence metadata must match its table text`
      )
    }
  }
})

test('converts capped duplicate permanent injuries into one bleeding token', () => {
  assert.deepEqual(evaluateSevereInjuryResult('head', 'Deaf', []), {
    outcome: 'record',
    permanent: true,
    maxRecords: 1,
    recordedCount: 0,
    bleedingTokens: 0
  })
  assert.deepEqual(evaluateSevereInjuryResult('head', 'Deaf', ['Deaf']), {
    outcome: 'bleeding',
    permanent: true,
    maxRecords: 1,
    recordedCount: 1,
    bleedingTokens: 1
  })
  assert.equal(evaluateSevereInjuryResult('head', 'Blind', ['Blind']).outcome, 'record')
  assert.equal(evaluateSevereInjuryResult('head', 'Blind', ['Blind', 'blind']).outcome, 'bleeding')
  assert.equal(evaluateSevereInjuryResult('arms', 'Contracture', ['Contracture', 'Contracture']).outcome, 'record')
})

test('keeps recording limits and the duplicate injury rule out of player-facing markup', () => {
  const markup = renderSevereInjuryTable('head')
  assert.doesNotMatch(markup, /Permanent injury limit:/)
  assert.doesNotMatch(markup, /gain 1 bleeding token instead/)
  assert.doesNotMatch(markup, /<th scope="col">Record<\/th>/)
  assert.match(markup, /Blind<\/strong><\/span><\/td><td>Lose an eye\./)
})

test('offers full, bleeding-only, or no action according to result safety', () => {
  const person = { courage: 2, impairments: [] }
  assert.deepEqual(getSevereInjuryActionAvailability('arms', 'Broken Arm', person), { kind: 'apply' })
  assert.deepEqual(getSevereInjuryActionAvailability('head', 'Concussion', person), {
    kind: 'bleeding',
    bleedingTokens: 1
  })
  assert.deepEqual(getSevereInjuryActionAvailability('head', 'Head Explosion!', person), { kind: 'none' })
  assert.deepEqual(getSevereInjuryActionAvailability('brain', 'Frenzy', person), { kind: 'none' })
  assert.deepEqual(getSevereInjuryActionAvailability('head', 'Destroyed tooth', person), { kind: 'none' })
  person.courage = 3
  assert.deepEqual(getSevereInjuryActionAvailability('head', 'Destroyed tooth', person), { kind: 'apply' })
  assert.deepEqual(getSevereInjuryActionAvailability('arms', 'Ruptured Muscle', person), {
    kind: 'record',
    bleedingTokens: 1
  })
})

test('uses persisted severe injury counts to replace capped Apply actions with bleeding', () => {
  assert.deepEqual(getSevereInjuryActionAvailability('head', 'Deaf', { severeInjuries: [] }), { kind: 'apply' })
  assert.deepEqual(getSevereInjuryActionAvailability('head', 'Deaf', {
    severeInjuries: [{ location: 'head', name: 'Deaf', count: 1 }]
  }), {
    kind: 'bleeding',
    bleedingTokens: 1,
    reason: 'maximum'
  })
  assert.equal(getSevereInjuryActionAvailability('head', 'Blind', {
    severeInjuries: [{ location: 'head', name: 'Blind', count: 1 }]
  }).kind, 'apply')
  assert.equal(
    getSevereInjuryActionAvailability('head', 'Blind', {
      severeInjuries: [{ location: 'head', name: 'Blind', count: 2 }]
    }).kind,
    'bleeding'
  )

  // Duplicate names written by the earlier implementation remain compatible.
  const reloadedPerson = JSON.parse(JSON.stringify({ impairments: ['Shattered Jaw'] }))
  assert.equal(getSevereInjuryActionAvailability('head', 'Shattered Jaw', reloadedPerson).kind, 'bleeding')
})

test('classifies every severe result against the safe automation boundary', () => {
  const person = { courage: 3, impairments: [] }
  const expected = {
    brain: {
      apply: ['Mortal Terror', 'Memory Loss'],
      bleeding: [],
      none: ['Flee', 'Danger Seizure', 'Lunacy', 'New Perspective', 'Frenzy', 'Maniacal Laughter', 'Clarity', 'Impossible!']
    },
    head: {
      apply: ['Decapitation', 'Intracranial Hemorrhage', 'Deaf', 'Blind', 'Shattered Jaw', 'Destroyed tooth'],
      bleeding: ['Concussion'],
      none: ['Head Explosion!']
    },
    arms: {
      apply: ['Die of Shock', 'Bleeding', 'Dismembered Arm', 'Contracture', 'Broken Arm', 'Spiral Fracture', 'Dislocated Shoulder'],
      record: ['Ruptured Muscle'],
      bleeding: [],
      none: ['Hit the Dirt']
    },
    body: {
      apply: ['Instant Death', 'Bleeding', 'Gaping Chest Wound', 'Destroyed Back', 'Disemboweled', 'Ruptured Spleen', 'Broken Rib', 'Collapsed Lung'],
      bleeding: [],
      none: ['Bowled Over']
    },
    waist: {
      apply: ['Bleeding Kidneys', 'Intestinal Prolapse', 'Warped Pelvis', 'Broken Hip', 'Slashed Back'],
      record: ['Destroyed Genitals'],
      bleeding: ['Bruised Tailbone'],
      none: ['Final Breath', 'Belly-up']
    },
    legs: {
      apply: ['Bloody Geyser', 'Bleeding', 'Dismembered Leg', 'Torn Achilles Tendon', 'Torn Muscle', 'Bloody Thighs'],
      record: ['Hamstrung', 'Broken Leg'],
      bleeding: [],
      none: ['Lost Balance']
    }
  }

  for (const [location, groups] of Object.entries(expected)) {
    const table = getSevereInjuryTable(location)
    for (const [, title] of table.rows) {
      const expectedKind = Object.entries(groups).find(([, titles]) => titles.includes(title))?.[0]
      assert.ok(expectedKind, `${location}/${title} must have an explicit safety classification`)
      assert.equal(getSevereInjuryActionAvailability(location, title, person).kind, expectedKind)
    }
  }
})

test('applies deterministic permanent changes and capped-injury bleeding fallback', () => {
  const person = {
    isAlive: true,
    accuracy: 0,
    strength: 0,
    impairments: [],
    severeInjuries: [],
    notes: [],
    weaponProficiency: { type: 'Sword', level: 3, isSpecialist: false, isMaster: false }
  }
  const armor = { bleedingTokens: 0 }
  const modifiers = {}

  assert.equal(applySevereInjuryAction({ location: 'arms', title: 'Broken Arm', person, armor, modifiers }).ok, true)
  assert.deepEqual(person.impairments, [])
  assert.deepEqual(person.severeInjuries, [{ location: 'arms', name: 'Broken Arm', count: 1 }])
  assert.equal(person.accuracy, -1)
  assert.equal(person.strength, -1)
  assert.equal(armor.bleedingTokens, 1)

  applySevereInjuryAction({ location: 'arms', title: 'Broken Arm', person, armor, modifiers })
  assert.deepEqual(person.severeInjuries, [{ location: 'arms', name: 'Broken Arm', count: 2 }])
  assert.equal(person.accuracy, -2)
  assert.equal(person.strength, -2)
  assert.equal(armor.bleedingTokens, 2)

  const overflow = applySevereInjuryAction({ location: 'arms', title: 'Broken Arm', person, armor, modifiers })
  assert.equal(overflow.outcome, 'maximum-bleeding')
  assert.equal(person.accuracy, -2)
  assert.equal(person.strength, -2)
  assert.equal(armor.bleedingTokens, 3)
})

test('records every occurrence of repeatable permanent injuries', () => {
  const person = { accuracy: 0, impairments: [], severeInjuries: [], notes: [] }
  const armor = { bleedingTokens: 0 }

  applySevereInjuryAction({ location: 'arms', title: 'Contracture', person, armor, modifiers: {} })
  applySevereInjuryAction({ location: 'arms', title: 'Contracture', person, armor, modifiers: {} })

  assert.equal(person.accuracy, -2)
  assert.equal(armor.bleedingTokens, 2)
  assert.deepEqual(person.severeInjuries, [{ location: 'arms', name: 'Contracture', count: 2 }])
  assert.deepEqual(person.impairments, [])
})

test('records safe permanent portions of results that still require manual resolution', () => {
  const person = { movement: 5, impairments: [], severeInjuries: [], notes: [] }
  const armor = { bleedingTokens: 0 }

  const recorded = applySevereInjuryAction({
    location: 'legs',
    title: 'Broken Leg',
    person,
    armor,
    modifiers: {},
    mode: 'record'
  })

  assert.equal(recorded.ok, true)
  assert.deepEqual(person.severeInjuries, [{ location: 'legs', name: 'Broken Leg', count: 1 }])
  assert.equal(person.movement, 4)
  assert.equal(armor.bleedingTokens, 0)
})

test('records a permanent injury without showdown armor state', () => {
  const person = { accuracy: 0, impairments: [], severeInjuries: [], notes: [] }

  const recorded = applySevereInjuryAction({
    location: 'arms',
    title: 'Contracture',
    person,
    mode: 'record'
  })

  assert.equal(recorded.ok, true)
  assert.equal(person.accuracy, -1)
  assert.deepEqual(person.severeInjuries, [{ location: 'arms', name: 'Contracture', count: 1 }])
  assert.doesNotMatch(recorded.changes.join(' '), /bleeding/i)
})

test('every permanent result can be recorded through its available action', () => {
  for (const location of ['head', 'arms', 'body', 'waist', 'legs']) {
    for (const [, title, description] of getSevereInjuryTable(location).rows) {
      if (!/\bpermanent\b/i.test(description)) continue
      const person = {
        courage: 3,
        movement: 5,
        speed: 0,
        accuracy: 0,
        strength: 0,
        luck: 0,
        evasion: 0,
        impairments: [],
        severeInjuries: [],
        notes: []
      }
      const availability = getSevereInjuryActionAvailability(location, title, person)
      assert.ok(availability.kind === 'apply' || availability.kind === 'record', `${location}/${title} needs a record action`)
      const result = applySevereInjuryAction({
        location,
        title,
        person,
        armor: { bleedingTokens: 0 },
        modifiers: {},
        mode: availability.kind
      })
      assert.equal(result.ok, true, `${location}/${title} record action should succeed`)
      assert.equal(person.severeInjuries[0]?.count, 1, `${location}/${title} should record one occurrence`)
    }
  }
})

test('heals one injury occurrence and reverses only its permanent effects', () => {
  const person = {
    movement: 1,
    accuracy: -2,
    impairments: [],
    severeInjuries: [
      { location: 'arms', name: 'Contracture', count: 2 },
      { location: 'legs', name: 'Dismembered Leg', count: 2 }
    ],
    notes: [
      'Cannot dash — Dismembered Leg',
      'Retire at the end of the next showdown or settlement phase (Lantern Year 10) — Two Dismembered Legs'
    ]
  }
  const armor = { bleedingTokens: 7 }

  const repeatable = healSevereInjury({ location: 'arms', title: 'Contracture', person })
  assert.equal(repeatable.ok, true)
  assert.equal(person.accuracy, -1)
  assert.deepEqual(person.severeInjuries[0], { location: 'arms', name: 'Contracture', count: 1 })

  const capped = healSevereInjury({ location: 'legs', title: 'Dismembered Leg', person })
  assert.equal(capped.ok, true)
  assert.equal(person.movement, 3)
  assert.equal(person.severeInjuries[1].count, 1)
  assert.ok(person.notes.includes('Cannot dash — Dismembered Leg'))
  assert.ok(!person.notes.some(note => note.startsWith('Retire at the end of the next showdown')))
  assert.equal(armor.bleedingTokens, 7)

  healSevereInjury({ location: 'legs', title: 'Dismembered Leg', person })
  assert.equal(person.movement, 5)
  assert.equal(person.severeInjuries.some(injury => injury.name === 'Dismembered Leg'), false)
  assert.ok(!person.notes.includes('Cannot dash — Dismembered Leg'))
})

test('healing migrates and decrements legacy impairment records', () => {
  const person = {
    accuracy: -2,
    impairments: ['Broken Arm', 'Broken Arm'],
    severeInjuries: [],
    notes: []
  }

  const result = healSevereInjury({ location: 'arms', title: 'Broken Arm', person })

  assert.equal(result.ok, true)
  assert.equal(person.accuracy, -1)
  assert.equal(person.strength, 1)
  assert.deepEqual(person.impairments, [])
  assert.deepEqual(person.severeInjuries, [{ location: 'arms', name: 'Broken Arm', count: 1 }])
})

test('applies safe temporary tokens and persistent reminders', () => {
  const person = { impairments: [], notes: [] }
  const armor = { bleedingTokens: 0 }
  const modifiers = {}
  const result = applySevereInjuryAction({
    location: 'arms',
    title: 'Spiral Fracture',
    person,
    armor,
    modifiers,
    lanternYear: 5
  })

  assert.equal(result.ok, true)
  assert.equal(modifiers.strength.tokensNegative, 2)
  assert.equal(armor.bleedingTokens, 1)
  assert.deepEqual(person.notes, ['Skip the next hunt (Lantern Year 6) — Spiral Fracture'])
})

test('applies death, proficiency, courage, and second-injury effects', () => {
  const person = {
    isAlive: true,
    courage: 3,
    insanityPts: 0,
    accuracy: 0,
    impairments: [],
    severeInjuries: [{ location: 'head', name: 'Blind', count: 1 }],
    notes: [],
    weaponProficiency: { type: 'Sword', level: 1, isSpecialist: false, isMaster: false }
  }
  const armor = { bleedingTokens: 0 }

  applySevereInjuryAction({ location: 'brain', title: 'Memory Loss', person, armor, modifiers: {} })
  assert.equal(person.weaponProficiency.level, 0)
  applySevereInjuryAction({ location: 'head', title: 'Destroyed tooth', person, armor, modifiers: {} })
  assert.equal(person.insanityPts, 2)
  applySevereInjuryAction({ location: 'head', title: 'Blind', person, armor, modifiers: {}, lanternYear: 10 })
  assert.equal(person.accuracy, -5)
  assert.deepEqual(person.severeInjuries, [{ location: 'head', name: 'Blind', count: 2 }])
  assert.ok(person.notes.includes(
    'Retire at the end of the next showdown or settlement phase (Lantern Year 10) — Two Blind severe injuries'
  ))
  applySevereInjuryAction({ location: 'brain', title: 'Mortal Terror', person, armor, modifiers: {} })
  assert.equal(person.isAlive, false)
})

test('sets temporary totals and adds retirement reminders when required', () => {
  const person = {
    movement: 5,
    impairments: [],
    severeInjuries: [{ location: 'legs', name: 'Dismembered Leg', count: 1 }],
    notes: []
  }
  const armor = { bleedingTokens: 0 }
  const modifiers = { movement: { temporary: 0, tokensPositive: 1, tokensNegative: 0 } }

  const disemboweled = applySevereInjuryAction({
    location: 'body',
    title: 'Disemboweled',
    person,
    armor,
    modifiers,
    lanternYear: 5
  })
  assert.equal(disemboweled.ok, true)
  assert.equal(person.movement + modifiers.movement.temporary + modifiers.movement.tokensPositive, 1)
  assert.ok(person.notes.includes('Skip the next hunt (Lantern Year 6) — Disemboweled'))

  const dismembered = applySevereInjuryAction({
    location: 'legs',
    title: 'Dismembered Leg',
    person,
    armor,
    modifiers,
    lanternYear: 10
  })
  assert.equal(dismembered.ok, true)
  assert.equal(person.movement, 3)
  assert.ok(person.notes.includes('Cannot dash — Dismembered Leg'))
  assert.ok(person.notes.includes(
    'Retire at the end of the next showdown or settlement phase (Lantern Year 10) — Two Dismembered Legs'
  ))
})

test('bleeding-only actions do not apply unsafe effects', () => {
  const person = { disorders: [], impairments: [], notes: [] }
  const armor = { bleedingTokens: 0 }
  const result = applySevereInjuryAction({
    location: 'head',
    title: 'Concussion',
    person,
    armor,
    modifiers: {},
    mode: 'bleeding'
  })

  assert.equal(result.outcome, 'bleeding-only')
  assert.equal(armor.bleedingTokens, 1)
  assert.deepEqual(person.disorders, [])
  assert.equal(
    applySevereInjuryAction({ location: 'head', title: 'Concussion', person, armor, modifiers: {} }).ok,
    false
  )
})

test('renders only actions safe for the selected survivor', () => {
  const markup = renderSevereInjuryTable('head', {
    slot: 'A',
    person: { name: 'Lantern', courage: 2, impairments: [] }
  })
  assert.match(markup, /data-severe-title="Decapitation"[^>]*>Apply<\/button>/)
  assert.match(markup, /data-severe-title="Concussion"[^>]*data-severe-slot="A"/)
  assert.doesNotMatch(markup, /data-severe-title="Head Explosion!"/)
  assert.doesNotMatch(markup, /data-severe-title="Destroyed tooth"/)
})

test('renders Record plus bleeding for permanent results with manual effects', () => {
  const markup = renderSevereInjuryTable('legs', {
    slot: 'A',
    person: { movement: 5, impairments: [], severeInjuries: [], notes: [] }
  })
  const brokenLegRow = markup.match(/<tr><th scope="row">8<\/th>[\s\S]*?<\/tr>/)?.[0] || ''
  assert.match(brokenLegRow, /data-severe-action="record"/)
  assert.match(brokenLegRow, />Record<\/button>/)
  assert.match(brokenLegRow, /data-severe-action="bleeding"/)
  assert.doesNotMatch(brokenLegRow, /data-severe-action="apply"/)
})

test('renders a bleeding symbol instead of Apply when a permanent injury is capped', () => {
  const markup = renderSevereInjuryTable('head', {
    slot: 'A',
    person: {
      name: 'Lantern',
      courage: 3,
      impairments: [],
      severeInjuries: [
        { location: 'head', name: 'Deaf', count: 1 },
        { location: 'head', name: 'Blind', count: 2 }
      ]
    }
  })
  assert.match(markup, /data-severe-action="bleeding"[^>]*data-severe-title="Deaf"/)
  assert.match(markup, /data-severe-action="bleeding"[^>]*data-severe-title="Blind"/)
  assert.doesNotMatch(markup, /data-severe-action="apply"[^>]*data-severe-title="Deaf"/)
  assert.doesNotMatch(markup, /data-severe-action="apply"[^>]*data-severe-title="Blind"/)
  assert.doesNotMatch(markup, /Permanent injury limit:/)
})

test('renders pips for capped injuries and counts for unlimited injuries', () => {
  const markup = renderSevereInjuryTable('head', {
    slot: 'A',
    person: {
      severeInjuries: [
        { location: 'head', name: 'Deaf', count: 1 },
        { location: 'head', name: 'Blind', count: 1 }
      ]
    }
  })
  const deafCell = markup.match(/<strong>Deaf<\/strong>[\s\S]*?<\/td>/)?.[0] || ''
  const blindCell = markup.match(/<strong>Blind<\/strong>[\s\S]*?<\/td>/)?.[0] || ''
  assert.match(deafCell, /aria-label="Deaf: 1 of 1 recorded"/)
  assert.equal((deafCell.match(/severe-injury-pip is-filled/g) || []).length, 1)
  assert.match(blindCell, /aria-label="Blind: 1 of 2 recorded"/)
  assert.equal((blindCell.match(/severe-injury-pip is-filled/g) || []).length, 1)
  assert.equal((blindCell.match(/class="severe-injury-pip"/g) || []).length, 1)

  const unlimitedMarkup = renderSevereInjuryTable('waist', {
    slot: 'A',
    person: { severeInjuries: [{ location: 'waist', name: 'Warped Pelvis', count: 4 }] }
  })
  const warpedPelvisCell = unlimitedMarkup.match(/Warped Pelvis[\s\S]*?<\/td>/)?.[0] || ''
  assert.doesNotMatch(warpedPelvisCell, /severe-injury-pip/)
  assert.match(warpedPelvisCell, /aria-label="Warped Pelvis: 4 recorded">×4/)
})

test('renders all permanent injuries with healing controls outside the table', () => {
  const markup = renderRecordedSevereInjuries({
    severeInjuries: [
      { location: 'head', name: 'Blind', count: 1 },
      { location: 'waist', name: 'Warped Pelvis', count: 4 }
    ]
  })

  assert.match(markup, /<strong>Blind<\/strong>/)
  assert.match(markup, /aria-label="Blind: 1 of 2 recorded"/)
  assert.match(markup, /<strong>Warped Pelvis<\/strong>/)
  assert.match(markup, /aria-label="Warped Pelvis: 4 recorded">×4/)
  assert.equal((markup.match(/data-action="healSevereInjury"/g) || []).length, 2)
  assert.match(renderRecordedSevereInjuries({ severeInjuries: [] }), /No severe injuries\./)
})

test('renders a permanent-injury picker with caps and repeatable injuries', () => {
  const markup = renderSevereInjuryPicker({
    severeInjuries: [
      { location: 'head', name: 'Blind', count: 2 },
      { location: 'waist', name: 'Warped Pelvis', count: 4 }
    ]
  })

  assert.match(markup, /Adding an injury records its persistent effects/)
  assert.equal((markup.match(/data-action="addCreateSevereInjury"/g) || []).length, 18)
  assert.match(markup, /data-severe-title="Blind" disabled>Maximum<\/button>/)
  assert.match(markup, /aria-label="Blind: 2 of 2 recorded"/)
  assert.match(markup, /aria-label="Warped Pelvis: 4 recorded">×4/)
  assert.match(markup, /data-severe-title="Warped Pelvis">Add<\/button>/)
})

test('returns no table or markup for an unknown location', () => {
  assert.equal(getSevereInjuryTable('unknown'), null)
  assert.equal(renderSevereInjuryTable('unknown'), '')
})
