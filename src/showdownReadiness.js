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
  let ended = new Set()
  let completed = new Set()
  let revision = 0

  function state() {
    return {
      sessionId, round, revision, phase, settlementType,
      players: [...members].map(id => ({ id, connected: connected.has(id) })),
      departed: [...departed], ended: [...ended], completed: [...completed]
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
      departed.add(id)
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
module.exports = { createShowdownReadiness }
