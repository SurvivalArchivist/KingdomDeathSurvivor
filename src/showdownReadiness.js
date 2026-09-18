const { randomUUID } = require('crypto')

// One host-owned barrier per showdown. Disconnects never count as a vote.
function createShowdownReadiness({ onChange = () => {} } = {}) {
  const sessionId = randomUUID()
  const connected = new Map([['host', 1]])
  let round = randomUUID()
  let phase = 'preparing'
  let settlementType = null
  let members = new Set(['host'])
  let departed = new Set()
  let departureRosters = new Map()
  let ended = new Set()
  let completed = new Set()
  let revision = 0

  function state() {
    return {
      sessionId, round, revision, phase, settlementType,
      players: [...members].map(id => ({ id, connected: connected.has(id) })),
      departed: [...departed], ended: [...ended], completed: [...completed],
      departedSurvivors: [...departureRosters.entries()].flatMap(([playerId, survivors]) =>
        survivors.map(survivor => ({ ...survivor, playerId })))
    }
  }
  function publish() { revision += 1; onChange(state()) }
  function unanimous(votes) {
    return [...members].every(id => connected.has(id) && votes.has(id))
  }
  function advance() {
    if (phase === 'preparing' && unanimous(departed)) phase = 'departed'
    if (phase === 'departed' && unanimous(ended)) phase = 'finishing'
  }
  function connect(id) {
    connected.set(id, (connected.get(id) || 0) + 1)
    if (phase === 'preparing') members.add(id)
    advance()
    publish()
  }
  function disconnect(id) {
    const count = (connected.get(id) || 0) - 1
    if (count > 0) connected.set(id, count)
    else connected.delete(id)
    if (phase === 'preparing' && departed.size === 0) members.delete(id)
    publish()
  }
  function vote(id, input, type) {
    if (!connected.has(id) || !members.has(id)) throw new Error('You are not a connected player in this showdown.')
    if (input?.round !== round) throw new Error('Showdown changed. Refresh readiness and try again.')
    if (input.action === 'depart') {
      if (phase !== 'preparing') {
        if (departed.has(id)) return state()
        throw new Error('Showdown has already departed.')
      }
      if (settlementType && settlementType !== type) throw new Error('Settlement type changed during departure.')
      settlementType = type
      if (!departed.has(id)) departureRosters.set(id, sanitizeDepartureRoster(input?.survivors))
      departed.add(id)
    } else if (input.action === 'sync') {
      if (phase !== 'departed' || !departed.has(id)) throw new Error('Survivors can only sync during a departed showdown.')
      departureRosters.set(id, sanitizeDepartureRoster(input?.survivors))
    } else if (input.action === 'end') {
      if (phase !== 'departed' && phase !== 'finishing') throw new Error('All players must depart first.')
      ended.add(id)
    } else if (input.action === 'complete') {
      if (phase !== 'finishing') throw new Error('All players must end showdown first.')
      completed.add(id)
      if (completed.size === members.size) {
        if (settlementType === 'vignette') {
          phase = 'departed'
          ended = new Set()
          completed = new Set()
          // A new round makes repeated reset deliveries harmless.
          round = randomUUID()
        } else {
          round = randomUUID()
          phase = 'preparing'
          settlementType = null
          members = new Set(connected.keys())
          departed = new Set()
          departureRosters = new Map()
          ended = new Set()
          completed = new Set()
        }
      }
    } else throw new Error('Invalid showdown action.')
    advance()
    publish()
    return state()
  }
  return { state, connect, disconnect, vote }
}

const ARMOR_LOCATIONS = ['head', 'arms', 'body', 'waist', 'legs']
function safeCount(value) {
  const number = Math.trunc(Number(value))
  return Number.isFinite(number) ? Math.max(0, Math.min(number, 999)) : 0
}
function sanitizeDepartureRoster(survivors) {
  if (!Array.isArray(survivors)) return []
  const slots = ['A', 'B', 'C', 'D', 'E', 'F']
  return survivors.slice(0, 6).map((entry, index) => {
    const armor = {}
    for (const location of ARMOR_LOCATIONS) {
      armor[location] = safeCount(entry?.armor?.[location])
      armor[`${location}Light`] = Boolean(entry?.armor?.[`${location}Light`])
      armor[`${location}Heavy`] = Boolean(entry?.armor?.[`${location}Heavy`])
    }
    return {
      slot: slots.includes(entry?.slot) ? entry.slot : slots[index],
      name: String(entry?.name || `Survivor ${index + 1}`).trim().slice(0, 120) || `Survivor ${index + 1}`,
      survival: safeCount(entry?.survival),
      insanity: safeCount(entry?.insanity),
      armor
    }
  })
}
module.exports = { createShowdownReadiness }
