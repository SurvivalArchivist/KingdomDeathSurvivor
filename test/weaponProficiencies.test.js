const test = require('node:test')
const assert = require('node:assert/strict')

const {
  WEAPON_PROFICIENCIES,
  getWeaponProficiency,
  isWeaponSpecialist
} = require('../src/weaponProficiencies')

test('ships the complete built-in weapon proficiency catalog', () => {
  assert.equal(WEAPON_PROFICIENCIES.length, 17)
  assert.deepEqual(WEAPON_PROFICIENCIES.map(item => item.name), [
    'Axe', 'Bow', 'Cleaver', 'Club', 'Dagger', 'Fan', 'Fist & Tooth', 'Grand Weapon', 'Katana',
    'Katar', 'Scythe', 'Shield', 'Spear', 'Sword', 'Twilight Sword', 'Whip', 'Willow'
  ])
  for (const item of WEAPON_PROFICIENCIES) {
    assert.ok(item.specialization.trim(), `${item.name} is missing specialization text`)
    assert.ok(item.mastery.trim(), `${item.name} is missing mastery text`)
  }
})

test('looks up built-in proficiency rules without relying on reference files', () => {
  assert.equal(getWeaponProficiency(' sword ')?.name, 'Sword')
  assert.match(getWeaponProficiency('SWORD').specialization, /wound attempt/)
  assert.equal(getWeaponProficiency('Unknown'), null)
})

test('Twilight Sword uses staged rank 2, 4, and 6 progression', () => {
  assert.deepEqual(getWeaponProficiency('Twilight Sword').progression, [
    { level: 2, text: 'Ignore Cumbersome on Twilight Sword.' },
    { level: 4, text: 'When attacking with the Twilight Sword, ignore slow and gain +2 speed.' },
    { level: 6, text: 'Twilight Sword gains deadly.' }
  ])
  assert.equal(isWeaponSpecialist('Twilight Sword', 1), false)
  assert.equal(isWeaponSpecialist('Twilight Sword', 2), true)
  assert.equal(isWeaponSpecialist('Sword', 2), false)
  assert.equal(isWeaponSpecialist('Sword', 3), true)
})
