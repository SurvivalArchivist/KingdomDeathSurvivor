const test = require('node:test')
const assert = require('node:assert/strict')

const { WEAPON_PROFICIENCIES, getWeaponProficiency } = require('../src/weaponProficiencies')

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
