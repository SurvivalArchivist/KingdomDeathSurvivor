function createLanReconnectBackoff({
  baseDelayMs = 1000,
  maxDelayMs = 30000,
  jitterRatio = 0.2,
  random = Math.random
} = {}) {
  let failureCount = 0

  function nextDelay() {
    const exponent = Math.min(failureCount, 30)
    const exponentialDelay = Math.min(maxDelayMs, baseDelayMs * (2 ** exponent))
    const randomValue = Math.max(0, Math.min(1, Number(random()) || 0))
    const jitterMultiplier = 1 - jitterRatio + (randomValue * jitterRatio * 2)
    failureCount += 1
    return Math.max(0, Math.min(maxDelayMs, Math.round(exponentialDelay * jitterMultiplier)))
  }

  return {
    nextDelay,
    reset() {
      failureCount = 0
    },
    failureCount() {
      return failureCount
    }
  }
}

module.exports = {
  createLanReconnectBackoff
}
