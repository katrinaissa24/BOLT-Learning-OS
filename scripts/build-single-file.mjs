// Builds one self-contained HTML file (inline CSS + JS, in-memory routing) for previews and sharing.
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs'
const out = process.argv[2] || 'dist-single/bolt.html'
rmSync('dist-single', { recursive: true, force: true })
execSync('npx vite build --outDir dist-single --emptyOutDir', { stdio: 'inherit', env: { ...process.env, VITE_ROUTER: 'memory' } })
const assets = readdirSync('dist-single/assets')
const css = readFileSync('dist-single/assets/' + assets.find((f) => f.endsWith('.css')), 'utf8')
const js = readFileSync('dist-single/assets/' + assets.find((f) => f.endsWith('.js')), 'utf8').replace(/<\/script/gi, '<\\/script')
const html = `<title>BOLT Learning OS</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,700&family=Caveat:wght@500;600;700&display=swap" rel="stylesheet">
<style>${css}
:root{padding:0 !important}</style>
<div id="root"></div>
<script type="module">${js}</script>
`
writeFileSync(out, html)
console.log('wrote', out, (html.length / 1e6).toFixed(2) + ' MB')
