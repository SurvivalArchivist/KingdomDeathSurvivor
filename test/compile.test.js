const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('path')
const { execFileSync } = require('node:child_process')

const compileTargets = [
  path.join('src', 'main.js'),
  path.join('src', 'preload.js'),
  path.join('src', 'renderer.js'),
  path.join('src', 'rendererKnowledgeTemplateHelpers.js'),
  path.join('src', 'rendererSettlementHelpers.js'),
  path.join('src', 'rendererShowdownState.js'),
  path.join('src', 'rendererShowdownView.js'),
  path.join('src', 'rendererShowdownController.js'),
  path.join('src', 'rendererShowdownSession.js'),
  path.join('src', 'dataService.js'),
  path.join('src', 'settlementService.js'),
  path.join('src', 'lanSurvivorHost.js'),
  path.join('src', 'survivorProvider.js')
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
