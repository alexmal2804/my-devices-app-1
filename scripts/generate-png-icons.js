const sharp = require('sharp')
const sizes = [16, 32, 180, 192, 512]
const names = [
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
]

;(async () => {
  for (let i = 0; i < sizes.length; i++) {
    await sharp('public/icon.png')
      .resize(sizes[i], sizes[i])
      .toFile(`public/${names[i]}`)
    console.log(`✔️  public/${names[i]} создан (${sizes[i]}x${sizes[i]})`)
  }
})()
