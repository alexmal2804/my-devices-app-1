#!/usr/bin/env node

// Скрипт для создания PNG иконок из SVG
// Использует встроенные возможности браузера для рендеринга SVG в PNG

const fs = require('fs')
const path = require('path')

// Создаем Material Design иконки в base64 формате
const createMaterialDesignPNG = (size, content) => {
  const canvas = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4CAF50"/>
        <stop offset="100%" stop-color="#43A047"/>
      </linearGradient>
      <linearGradient id="laptopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#F8F9FA"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${
    size / 8
  }" fill="url(#bgGrad)"/>
    <g transform="translate(${size / 2}, ${size / 2}) scale(${size / 512})">
      <rect x="-140" y="30" width="280" height="80" rx="8" ry="8" fill="url(#laptopGrad)" stroke="#E0E0E0" stroke-width="2"/>
      <rect x="-130" y="-100" width="260" height="130" rx="8" ry="8" fill="url(#laptopGrad)" stroke="#E0E0E0" stroke-width="2"/>
      <rect x="-115" y="-85" width="230" height="100" rx="4" ry="4" fill="#37474F"/>
      <circle cx="0" cy="-35" r="12" fill="#4CAF50"/>
      <circle cx="0" cy="-35" r="6" fill="#FFFFFF"/>
    </g>
  </svg>`

  return canvas
}

// Создаем SVG иконки для разных размеров
const sizes = [16, 32, 180, 192, 512]
const publicDir = path.join(__dirname, '..', 'public')

sizes.forEach((size) => {
  const svgContent = createMaterialDesignPNG(size)
  let filename

  switch (size) {
    case 16:
      filename = 'favicon-16x16.svg'
      break
    case 32:
      filename = 'favicon-32x32.svg'
      break
    case 180:
      filename = 'apple-touch-icon.svg'
      break
    case 192:
      filename = 'android-chrome-192x192.svg'
      break
    case 512:
      filename = 'android-chrome-512x512.svg'
      break
    default:
      filename = `icon-${size}x${size}.svg`
      break
  }

  if (filename) {
    fs.writeFileSync(path.join(publicDir, filename), svgContent)
    console.log(`✅ Создана иконка: ${filename}`)
  }
})

console.log('🎉 Все иконки созданы успешно!')
console.log(
  '📝 Для конвертации в PNG используйте онлайн конвертер или библиотеку sharp'
)
