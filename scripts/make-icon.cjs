// Genera resources/icon.png (512x512) a partir de un SVG con la paleta.
// Uso: npx electron scripts/make-icon.cjs
const { app, BrowserWindow } = require('electron')
const fs = require('fs')
const path = require('path')

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0D0221"/><stop offset="1" stop-color="#7700FF"/>
    </linearGradient>
    <linearGradient id="star" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#D1F7FF"/><stop offset=".45" stop-color="#05D9E8"/><stop offset="1" stop-color="#FF2A6D"/>
    </linearGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="r"><rect width="512" height="512" rx="112"/></clipPath>
  </defs>
  <g clip-path="url(#r)">
    <rect width="512" height="512" fill="url(#bg)"/>
    <g stroke="#05D9E8" stroke-opacity=".45" stroke-width="4">
      <line x1="0" y1="400" x2="512" y2="400"/><line x1="0" y1="440" x2="512" y2="440"/><line x1="0" y1="490" x2="512" y2="490"/>
      <line x1="256" y1="370" x2="256" y2="512"/><line x1="170" y1="370" x2="60" y2="512"/><line x1="342" y1="370" x2="452" y2="512"/>
    </g>
  </g>
  <path filter="url(#glow)" fill="url(#star)" stroke="#D1F7FF" stroke-width="8" stroke-linejoin="round"
    d="M256 70l52 106 117 17-85 82 20 116-104-55-104 55 20-116-85-82 117-17z"/>
</svg>`

app.disableHardwareAcceleration()
app.whenReady().then(async () => {
  const render = (size) =>
    new Promise((resolve) => {
      const w = new BrowserWindow({ width: size, height: size, show: false, transparent: true, frame: false, webPreferences: { offscreen: true } })
      w.webContents.once('did-finish-load', () =>
        setTimeout(async () => {
          const image = await w.webContents.capturePage()
          resolve(image.resize({ width: size, height: size }).toPNG())
          w.destroy()
        }, 600)
      )
      const html = `<html><body style="margin:0;background:transparent;overflow:hidden">${svg.replace('width="512" height="512" viewBox', `width="${size}" height="${size}" viewBox`)}</body></html>`
      w.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
    })
  const dir = path.join(__dirname, '..', 'resources')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'icon.png'), await render(512))
  app.quit()
})
