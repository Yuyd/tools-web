import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const routerFile = path.join(root, 'src/router/router.ts')
const adImport = "import { loadNativeAd, unloadNativeAd } from '@/utils/nativeAd'"
const adHtml = `    <!-- 底部广告 -->
    <div class="home-ad mt-8">
      <div id="container-fbcb838137ee667edfeeabc0229c433c"></div>
    </div>
`

const getRouteToolFiles = () => {
  const lines = fs.readFileSync(routerFile, 'utf8').split(/\r?\n/)
  const files = []
  for (const line of lines) {
    if (line.trim().startsWith('//')) continue
    const match = line.match(/import\('@\/components\/Tools\/([^']+\.vue)'\)/)
    if (match) files.push(path.join(root, 'src/components/Tools', match[1]))
  }
  return files
}

const addVueExports = (content, extras) => {
  const vueImport = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]vue['"][ \t]*;?/)
  if (!vueImport) {
    const setup = content.match(/<script setup lang="ts">\r?\n/)
    if (!setup) throw new Error('missing script setup')
    const names = ['onMounted', 'onUnmounted', ...extras].filter((v, i, arr) => arr.indexOf(v) === i)
    return content.replace(setup[0], `${setup[0]}import { ${names.join(', ')} } from 'vue'\n`)
  }

  const names = vueImport[1].split(',').map((item) => item.trim()).filter(Boolean)
  for (const extra of extras) {
    if (!names.includes(extra)) names.push(extra)
  }
  return content.replace(vueImport[0], () => `import { ${names.join(', ')} } from 'vue'`)
}

const insertAfterImports = (content, snippet) => {
  const scriptMatch = content.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)
  if (!scriptMatch) throw new Error('missing script setup block')
  const script = scriptMatch[1]
  const importMatches = [...script.matchAll(/^import[\s\S]*? from ['"][^'"]+['"]\s*;?\s*$/gm)]
  if (!importMatches.length) {
    return content.replace('<script setup lang="ts">', `<script setup lang="ts">\n${snippet}`)
  }
  const last = importMatches[importMatches.length - 1]
  const updatedScript = script.replace(last[0], () => `${last[0]}\n${snippet}`)
  return content.replace(scriptMatch[0], () => `<script setup lang="ts">${updatedScript}</script>`)
}

const ensureLifecycle = (content, hook, bodyLine) => {
  const hookRe = new RegExp(`${hook}\\s*\\(\\s*(?:async\\s*)?\\(\\s*\\)\\s*=>\\s*\\{`)
  if (hookRe.test(content)) {
    if (content.includes(bodyLine)) return content
    return content.replace(hookRe, (match) => `${match}\n  ${bodyLine}`)
  }
  return content.replace('</script>', `\n${hook}(() => {\n  ${bodyLine}\n})\n</script>`)
}

const insertAdHtml = (content) => {
  if (content.includes('container-fbcb838137ee667edfeeabc0229c433c')) return content
  const templateMatch = content.match(/<template>([\s\S]*)<\/template>/)
  if (!templateMatch) throw new Error('missing template')
  const inner = templateMatch[1]
  const lastDiv = inner.lastIndexOf('</div>')
  if (lastDiv < 0) throw new Error('missing root div')
  const updatedInner = `${inner.slice(0, lastDiv)}${adHtml}${inner.slice(lastDiv)}`
  return content.replace(templateMatch[0], () => `<template>${updatedInner}</template>`)
}

const patchFile = (file) => {
  let content = fs.readFileSync(file, 'utf8')
  const base = path.basename(file, '.vue')
  const scriptId = `profitablerate-${base}-ad-script`

  if (content.includes("from '@/utils/nativeAd'") && content.includes(scriptId) && content.includes('container-fbcb838137ee667edfeeabc0229c433c')) {
    return 'skip'
  }

  content = addVueExports(content, ['onMounted', 'onUnmounted'])
  if (!content.includes("from '@/utils/nativeAd'")) {
    content = insertAfterImports(content, adImport)
  }
  if (!content.includes(`const adScriptId = '${scriptId}'`)) {
    content = insertAfterImports(content, `const adScriptId = '${scriptId}'`)
  }
  content = ensureLifecycle(content, 'onMounted', 'loadNativeAd(adScriptId)')
  content = ensureLifecycle(content, 'onUnmounted', 'unloadNativeAd(adScriptId)')
  content = insertAdHtml(content)
  fs.writeFileSync(file, content)
  return 'ok'
}

const files = getRouteToolFiles()
const result = { ok: 0, skip: 0, fail: [] }
for (const file of files) {
  try {
    const status = patchFile(file)
    result[status] += 1
    console.log(`${status === 'ok' ? 'updated' : 'skipped'}: ${path.relative(root, file)}`)
  } catch (error) {
    result.fail.push(`${path.relative(root, file)}: ${error.message}`)
    console.error(`failed: ${path.relative(root, file)}`, error.message)
  }
}

console.log(`\ndone. updated=${result.ok} skipped=${result.skip} failed=${result.fail.length}`)
if (result.fail.length) {
  console.error(result.fail.join('\n'))
  process.exit(1)
}
