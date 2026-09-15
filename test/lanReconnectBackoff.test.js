const test = require('node:test')
const assert = require('node:assert/strict')

const { createLanReconnectBackoff } = require('../src/lanReconnectBackoff')

test('LAN reconnect delay grows exponentially and remains capped', () => {
  const backoff = createLanReconnectBackoff({ random: () => 0.5 })

  assert.deepEqual(
    Array.from({ length: 7 }, () => backoff.nextDelay()),
    [1000, 2000, 4000, 8000, 16000, 30000, 30000]
  )
  assert.equal(backoff.failureCount(), 7)
})

test('LAN reconnect delay applies bounded jitter and resets after registration', () => {
  const low = createLanReconnectBackoff({ random: () => 0 })
  const high = createLanReconnectBackoff({ random: () => 1 })

  assert.equal(low.nextDelay(), 800)
  assert.equal(high.nextDelay(), 1200)
  for (let index = 0; index < 8; index += 1) high.nextDelay()
  assert.equal(high.nextDelay(), 30000)

  high.reset()
  assert.equal(high.failureCount(), 0)
  assert.equal(high.nextDelay(), 1200)
})
