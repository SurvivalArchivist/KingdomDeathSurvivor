const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('path')
const { execFileSync } = require('node:child_process')

const compileTargets = [
  path.join('src', 'main.js'),
  path.join('src', 'preload.js'),
  path.join('src', 'renderer.js'),
  path.join('src', 'dataService.js')
]

test('core source files pass node syntax check', () => {
  for (const file of compileTargets) {
    assert.doesNotThrow(() => {
      execFileSync(process.execPath, ['--check', file], {
        stdio: 'pipe'
      })
    }, `Syntax check failed for ${file}`)
  }
})
