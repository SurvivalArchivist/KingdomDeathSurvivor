const test = require('node:test')
const assert = require('node:assert/strict')

const {
  applySevereInjuryAction,
  evaluateSevereInjuryResult,
  getSevereInjuryActionAvailability,
  getSevereInjuryRecordLimit,
  getSevereInjuryTable,
  renderRecordedSevereInjuries,
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
    kind: 'bleeding',
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
      bleeding: ['Ruptured Muscle'],
      none: ['Hit the Dirt']
    },
    body: {
      apply: ['Instant Death', 'Bleeding', 'Gaping Chest Wound', 'Destroyed Back', 'Disemboweled', 'Ruptured Spleen', 'Broken Rib', 'Collapsed Lung'],
      bleeding: [],
      none: ['Bowled Over']
    },
    waist: {
      apply: ['Bleeding Kidneys', 'Intestinal Prolapse', 'Warped Pelvis', 'Broken Hip', 'Slashed Back'],
      bleeding: ['Destroyed Genitals', 'Bruised Tailbone'],
      none: ['Final Breath', 'Belly-up']
    },
    legs: {
      apply: ['Bloody Geyser', 'Bleeding', 'Dismembered Leg', 'Torn Achilles Tendon', 'Torn Muscle', 'Bloody Thighs'],
      bleeding: ['Hamstrung', 'Broken Leg'],
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

test('applies repeatable permanent effects without listing them as injuries', () => {
  const person = { accuracy: 0, impairments: [], severeInjuries: [], notes: [] }
  const armor = { bleedingTokens: 0 }

  applySevereInjuryAction({ location: 'arms', title: 'Contracture', person, armor, modifiers: {} })
  applySevereInjuryAction({ location: 'arms', title: 'Contracture', person, armor, modifiers: {} })

  assert.equal(person.accuracy, -2)
  assert.equal(armor.bleedingTokens, 2)
  assert.deepEqual(person.severeInjuries, [])
  assert.deepEqual(person.impairments, [])
})

test('applies safe temporary tokens and persistent reminders', () => {
  const person = { impairments: [], notes: [] }
  const armor = { bleedingTokens: 0 }
  const modifiers = {}
  const result = applySevereInjuryAction({ location: 'arms', title: 'Spiral Fracture', person, armor, modifiers })

  assert.equal(result.ok, true)
  assert.equal(modifiers.strength.tokensNegative, 2)
  assert.equal(armor.bleedingTokens, 1)
  assert.deepEqual(person.notes, ['Skip the next hunt — Spiral Fracture'])
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
  applySevereInjuryAction({ location: 'head', title: 'Blind', person, armor, modifiers: {} })
  assert.equal(person.accuracy, -5)
  assert.deepEqual(person.severeInjuries, [{ location: 'head', name: 'Blind', count: 2 }])
  assert.ok(person.notes.some(note => note.startsWith('Retire at the end of the next showdown')))
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
    modifiers
  })
  assert.equal(disemboweled.ok, true)
  assert.equal(person.movement + modifiers.movement.temporary + modifiers.movement.tokensPositive, 1)
  assert.ok(person.notes.includes('Skip the next hunt — Disemboweled'))

  const dismembered = applySevereInjuryAction({
    location: 'legs',
    title: 'Dismembered Leg',
    person,
    armor,
    modifiers
  })
  assert.equal(dismembered.ok, true)
  assert.equal(person.movement, 3)
  assert.ok(person.notes.includes('Cannot dash — Dismembered Leg'))
  assert.ok(person.notes.some(note => note.startsWith('Retire at the end of the next showdown')))
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

test('renders filled and empty pips for capped injuries only', () => {
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
    person: { severeInjuries: [] }
  })
  const warpedPelvisCell = unlimitedMarkup.match(/Warped Pelvis[\s\S]*?<\/td>/)?.[0] || ''
  assert.doesNotMatch(warpedPelvisCell, /severe-injury-pip/)
})

test('renders suffered capped injuries outside the table without repeatable injuries', () => {
  const markup = renderRecordedSevereInjuries({
    severeInjuries: [
      { location: 'head', name: 'Blind', count: 1 },
      { location: 'waist', name: 'Warped Pelvis', count: 4 }
    ]
  })

  assert.match(markup, /<strong>Blind<\/strong>/)
  assert.match(markup, /aria-label="Blind: 1 of 2 recorded"/)
  assert.doesNotMatch(markup, /Warped Pelvis/)
  assert.match(renderRecordedSevereInjuries({ severeInjuries: [] }), /No severe injuries\./)
})

test('returns no table or markup for an unknown location', () => {
  assert.equal(getSevereInjuryTable('unknown'), null)
  assert.equal(renderSevereInjuryTable('unknown'), '')
})
