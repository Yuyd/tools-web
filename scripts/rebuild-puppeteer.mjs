import { spawnSync } from 'node:child_process'

const cwd = process.cwd().replace(/\\/g, '/')
const isCloudflarePages = Boolean(
  process.env.CF_PAGES ||
  process.env.CF_PAGES_BRANCH ||
  process.env.CF_PAGES_COMMIT_SHA ||
  process.env.CLOUDFLARE_PAGES ||
  cwd.startsWith('/opt/buildhome/')
)

if (isCloudflarePages) {
  console.log('Skip Puppeteer rebuild on Cloudflare Pages')
  process.exit(0)
}

const result = spawnSync('pnpm', ['rebuild', 'puppeteer'], {
  stdio: 'inherit',
  shell: true,
})

process.exit(result.status ?? 1)
