/**
 * Comprehensive tests for template validation functions
 * Tests through the public exported functions
 */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const os = require('os')
const path = require('path')

const dataService = require('../src/dataService')

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'kdm-template-test-'))
}

test('saveKnowledgeTemplate persists to file system', () => {
  const root = makeTempDir()
  const knowledgePath = path.join(root, 'knowledges')

  const fileName = dataService.saveKnowledgeTemplate(knowledgePath, 'knowledge', {
    name: 'Test Knowledge',
    observation: 'Test observation',
    rules: 'Test rules',
    observationRequirement: 2,
    knowledgeLevel: 1
  })

  assert.equal(fileName, 'test-knowledge-1.json')

  // File should exist
  const filePath = path.join(knowledgePath, fileName)
  assert.equal(fs.existsSync(filePath), true)

  // File should contain valid JSON
  const saved = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  assert.equal(saved.name, 'Test Knowledge')
  assert.equal(saved.knowledgeLevel, 1)
})

test('saveKnowledgeTemplate requires valid base path', () => {
  // Empty path throws
  assert.throws(
    () => dataService.saveKnowledgeTemplate('', 'knowledge', { name: 'Test' }),
    /Knowledge template folder is not configured/
  )

  // Whitespace path throws
  assert.throws(
    () => dataService.saveKnowledgeTemplate('   ', 'knowledge', { name: 'Test' }),
    /Knowledge template folder is not configured/
  )

  // Null path throws
  assert.throws(
    () => dataService.saveKnowledgeTemplate(null, 'knowledge', { name: 'Test' }),
    /Knowledge template folder is not configured/
  )
})

test('saveKnowledgeTemplate requires valid type', () => {
  const root = makeTempDir()

  // Invalid type throws
  assert.throws(
    () => dataService.saveKnowledgeTemplate(root, 'invalid', { name: 'Test' }),
    /Invalid knowledge template type/
  )
})

test('listKnowledgeTemplates returns sorted templates', () => {
  const root = makeTempDir()
  const knowledgePath = path.join(root, 'knowledges')

  // Save multiple templates
  dataService.saveKnowledgeTemplate(knowledgePath, 'knowledge', { name: 'Zebra', observation: '', rules: '' })
  dataService.saveKnowledgeTemplate(knowledgePath, 'knowledge', { name: 'Alpha', observation: '', rules: '' })
  dataService.saveKnowledgeTemplate(knowledgePath, 'knowledge', { name: 'Middle', observation: '', rules: '' })

  const templates = dataService.listKnowledgeTemplates(knowledgePath, 'knowledge')

  assert.equal(templates.length, 3)
  assert.equal(templates[0].name, 'Alpha')
  assert.equal(templates[1].name, 'Middle')
  assert.equal(templates[2].name, 'Zebra')
})

test('listKnowledgeTemplates handles empty directory', () => {
  const root = makeTempDir()
  const emptyPath = path.join(root, 'empty')

  const templates = dataService.listKnowledgeTemplates(emptyPath, 'knowledge')
  assert.deepEqual(templates, [])
})

test('listKnowledgeTemplates ignores malformed files', () => {
  const root = makeTempDir()
  const knowledgePath = path.join(root, 'knowledges')

  // Save valid template
  dataService.saveKnowledgeTemplate(knowledgePath, 'knowledge', {
    name: 'Valid',
    observation: '',
    rules: ''
  })

  // Create malformed files
  fs.writeFileSync(path.join(knowledgePath, 'malformed.json'), '{ broken json }')
  fs.writeFileSync(path.join(knowledgePath, 'empty.json'), '{}')
  fs.writeFileSync(path.join(knowledgePath, 'nonsense.json'), 'totally not json')

  const templates = dataService.listKnowledgeTemplates(knowledgePath, 'knowledge')

  // Only valid template should be returned
  assert.equal(templates.length, 1)
  assert.equal(templates[0].name, 'Valid')
})

test('listKnowledgeTemplates requires valid type', () => {
  const root = makeTempDir()

  // Invalid type throws
  assert.throws(
    () => dataService.listKnowledgeTemplates(root, 'invalid'),
    /Invalid knowledge template type/
  )
})

test('saveNeurosisTemplate persists to file system', () => {
  const root = makeTempDir()
  const neurosesPath = path.join(root, 'neuroses')

  const fileName = dataService.saveNeurosisTemplate(neurosesPath, {
    name: 'Star Dread',
    neurosis: 'Fear of the dark between stars.'
  })

  assert.equal(fileName, 'star-dread.json')

  // File should exist
  const filePath = path.join(neurosesPath, fileName)
  assert.equal(fs.existsSync(filePath), true)

  // File should contain valid JSON
  const saved = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  assert.equal(saved.name, 'Star Dread')
  assert.equal(saved.neurosis, 'Fear of the dark between stars.')
})

test('saveNeurosisTemplate requires valid base path', () => {
  // Empty path throws
  assert.throws(
    () => dataService.saveNeurosisTemplate('', { name: 'Test', neurosis: 'Test' }),
    /Neuroses template folder is not configured/
  )

  // Whitespace path throws
  assert.throws(
    () => dataService.saveNeurosisTemplate('   ', { name: 'Test', neurosis: 'Test' }),
    /Neuroses template folder is not configured/
  )

  // Null path throws
  assert.throws(
    () => dataService.saveNeurosisTemplate(null, { name: 'Test', neurosis: 'Test' }),
    /Neuroses template folder is not configured/
  )
})

test('listNeurosisTemplates returns sorted templates', () => {
  const root = makeTempDir()
  const neurosesPath = path.join(root, 'neuroses')

  // Save multiple templates
  dataService.saveNeurosisTemplate(neurosesPath, { name: 'Zebra Fear', neurosis: 'About zebras' })
  dataService.saveNeurosisTemplate(neurosesPath, { name: 'Alpha Fear', neurosis: 'About alphas' })
  dataService.saveNeurosisTemplate(neurosesPath, { name: 'Middle Fear', neurosis: 'About middle' })

  const templates = dataService.listNeurosisTemplates(neurosesPath)

  assert.equal(templates.length, 3)
  assert.equal(templates[0].name, 'Alpha Fear')
  assert.equal(templates[1].name, 'Middle Fear')
  assert.equal(templates[2].name, 'Zebra Fear')
})

test('listNeurosisTemplates handles empty directory', () => {
  const root = makeTempDir()
  const emptyPath = path.join(root, 'empty')

  const templates = dataService.listNeurosisTemplates(emptyPath)
  assert.deepEqual(templates, [])
})

test('listNeurosisTemplates ignores malformed files', () => {
  const root = makeTempDir()
  const neurosesPath = path.join(root, 'neuroses')

  // Save valid template
  dataService.saveNeurosisTemplate(neurosesPath, { name: 'Valid Fear', neurosis: 'Valid' })

  // Create malformed files
  fs.writeFileSync(path.join(neurosesPath, 'malformed.json'), '{ broken json }')
  fs.writeFileSync(path.join(neurosesPath, 'invalid.json'), 'not json at all')

  const templates = dataService.listNeurosisTemplates(neurosesPath)

  // Only valid template should be returned
  assert.equal(templates.length, 1)
  assert.equal(templates[0].name, 'Valid Fear')
})

test('listNeurosisTemplates handles edge cases', () => {
  // Empty path returns empty
  assert.deepEqual(dataService.listNeurosisTemplates(''), [])

  // Whitespace path returns empty
  assert.deepEqual(dataService.listNeurosisTemplates('   '), [])

  // Null path returns empty
  assert.deepEqual(dataService.listNeurosisTemplates(null), [])
})

test('knowledge template saves with different levels', () => {
  const root = makeTempDir()
  const knowledgePath = path.join(root, 'knowledges')

  const fileName1 = dataService.saveKnowledgeTemplate(knowledgePath, 'knowledge', {
    name: 'Test',
    observation: '',
    rules: '',
    observationRequirement: 1,
    knowledgeLevel: 1
  })

  const fileName2 = dataService.saveKnowledgeTemplate(knowledgePath, 'knowledge', {
    name: 'Test',
    observation: '',
    rules: '',
    observationRequirement: 2,
    knowledgeLevel: 2
  })

  assert.equal(fileName1, 'test-1.json')
  assert.equal(fileName2, 'test-2.json')
  assert.notEqual(fileName1, fileName2)
})

test('tenetKnowledge template saves correctly', () => {
  const root = makeTempDir()
  const tenetPath = path.join(root, 'tenets')

  const fileName = dataService.saveKnowledgeTemplate(tenetPath, 'tenetKnowledge', {
    name: 'Abyssal Oath',
    observation: 'Hold the line',
    rules: 'Gain +1 strength',
    observationRequirement: 3,
    knowledgeLevel: 2,
    nextKnowledgeMode: 'existingTemplate',
    nextKnowledgeTemplate: 'next-level.json'
  })

  assert.equal(fileName, 'abyssal-oath-2.json')

  // Load and verify
  const templates = dataService.listKnowledgeTemplates(tenetPath, 'tenetKnowledge')
  assert.equal(templates.length, 1)
  assert.equal(templates[0].template.name, 'Abyssal Oath')
  assert.equal(templates[0].template.observationRequirement, 3)
  assert.equal(templates[0].template.nextKnowledgeMode, 'existingTemplate')
})

test('neurosis template preserves name and text', () => {
  const root = makeTempDir()
  const neurosesPath = path.join(root, 'neuroses')

  dataService.saveNeurosisTemplate(neurosesPath, {
    name: 'Night Terrors',
    neurosis: 'Wake screaming at 3am.'
  })

  const templates = dataService.listNeurosisTemplates(neurosesPath)
  assert.equal(templates.length, 1)
  assert.equal(templates[0].name, 'Night Terrors')
  assert.equal(templates[0].neurosis, 'Wake screaming at 3am.')
})

test('saveKnowledgeTemplate normalizes template data', () => {
  const root = makeTempDir()
  const knowledgePath = path.join(root, 'knowledges')

  const fileName = dataService.saveKnowledgeTemplate(knowledgePath, 'knowledge', {
    name: '  Trimmed Name  ',
    observation: '  Obs  ',
    rules: '  Rules  ',
    observationRequirement: '5',
    knowledgeLevel: '3',
    nextKnowledgeMode: 'invalid-mode'
  })

  const templates = dataService.listKnowledgeTemplates(knowledgePath, 'knowledge')
  const saved = templates.find(t => t.fileName === fileName)

  assert.equal(saved.template.name, 'Trimmed Name')
  assert.equal(saved.template.observation, 'Obs')
  assert.equal(saved.template.rules, 'Rules')
  assert.equal(saved.template.observationRequirement, 5)
  assert.equal(saved.template.knowledgeLevel, 3)
  assert.equal(saved.template.nextKnowledgeMode, 'noTemplate') // Invalid mode defaults to noTemplate
})

test('saveNeurosisTemplate normalizes data', () => {
  const root = makeTempDir()
  const neurosesPath = path.join(root, 'neuroses')

  dataService.saveNeurosisTemplate(neurosesPath, {
    name: '  Trimmed Fear  ',
    neurosis: '  Fear text  '
  })

  const templates = dataService.listNeurosisTemplates(neurosesPath)
  assert.equal(templates[0].name, 'Trimmed Fear')
  assert.equal(templates[0].neurosis, 'Fear text')
})

test('knowledge template handles min observation requirement', () => {
  const root = makeTempDir()
  const knowledgePath = path.join(root, 'knowledges')

  const fileName = dataService.saveKnowledgeTemplate(knowledgePath, 'knowledge', {
    name: 'Zero Req',
    observation: '',
    rules: '',
    observationRequirement: 0,
    knowledgeLevel: 1
  })

  const templates = dataService.listKnowledgeTemplates(knowledgePath, 'knowledge')
  const saved = templates.find(t => t.fileName === fileName)
  assert.equal(saved.template.observationRequirement, 0)
})

test('multiple knowledge templates at same level', () => {
  const root = makeTempDir()
  const knowledgePath = path.join(root, 'knowledges')

  dataService.saveKnowledgeTemplate(knowledgePath, 'knowledge', {
    name: 'Alpha',
    observation: '',
    rules: '',
    knowledgeLevel: 1
  })

  dataService.saveKnowledgeTemplate(knowledgePath, 'knowledge', {
    name: 'Beta',
    observation: '',
    rules: '',
    knowledgeLevel: 1
  })

  const templates = dataService.listKnowledgeTemplates(knowledgePath, 'knowledge')
  assert.equal(templates.length, 2)
})

test('knowledge template list excludes non-json files', () => {
  const root = makeTempDir()
  const knowledgePath = path.join(root, 'knowledges')

  // Save valid template
  dataService.saveKnowledgeTemplate(knowledgePath, 'knowledge', {
    name: 'Valid',
    observation: '',
    rules: ''
  })

  // Create non-json files
  fs.writeFileSync(path.join(knowledgePath, 'readme.txt'), 'README')
  fs.writeFileSync(path.join(knowledgePath, 'backup.json.bak'), '{}')

  const templates = dataService.listKnowledgeTemplates(knowledgePath, 'knowledge')
  assert.equal(templates.length, 1)
  assert.equal(templates[0].name, 'Valid')
})

test('neurosis template list excludes non-json files', () => {
  const root = makeTempDir()
  const neurosesPath = path.join(root, 'neuroses')

  // Save valid template
  dataService.saveNeurosisTemplate(neurosesPath, {
    name: 'Valid Fear',
    neurosis: 'Valid'
  })

  // Create non-json files
  fs.writeFileSync(path.join(neurosesPath, 'readme.txt'), 'README')

  const templates = dataService.listNeurosisTemplates(neurosesPath)
  assert.equal(templates.length, 1)
})
