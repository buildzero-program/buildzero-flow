import fs from 'fs'
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'

const svgContent = fs.readFileSync('public/favicon.svg', 'utf-8')

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' }
]

console.log('🎨 Generating square favicons from SVG...\n')

for (const { size, name } of sizes) {
  // Render SVG to PNG
  const resvg = new Resvg(svgContent, {
    fitTo: {
      mode: 'width',
      value: size
    }
  })

  const pngData = resvg.render()
  const pngBuffer = pngData.asPng()

  // Make it square by adding padding with sharp
  const squaredImage = await sharp(pngBuffer)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
    })
    .png()
    .toBuffer()

  fs.writeFileSync(`public/${name}`, squaredImage)
  console.log(`✅ Created ${name} (${size}x${size} square)`)
}

console.log('\n🎉 Favicons generated successfully!')
console.log('\nNext, generating favicon.ico...')

// Generate favicon.ico
import { execSync } from 'child_process'
try {
  execSync('npx png-to-ico public/favicon-16x16.png public/favicon-32x32.png > public/favicon.ico')
  console.log('✅ favicon.ico created')
} catch (e) {
  console.log('⚠️  Could not create favicon.ico automatically')
  console.log('   Use https://favicon.io/favicon-converter/ to create it')
}

console.log('\n📝 Files generated:')
console.log('  - favicon.svg (source)')
console.log('  - favicon.ico (16x16, 32x32)')
console.log('  - apple-touch-icon.png (iOS)')
console.log('  - android-chrome-*.png (Android PWA)')
