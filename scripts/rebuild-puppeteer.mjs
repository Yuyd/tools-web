import { spawnSync } from 'node:child_process'

if (process.env.CF_PAGES) {
  console.log('Skip Puppeteer rebuild on Cloudflare Pages')
  process.exit(0)
}

const result = spawnSync('pnpm', ['rebuild', 'puppeteer'], {
  stdio: 'inherit',
  shell: true,
})

process.exit(result.status ?? 1)
