/**
 * Generates a static OG image (1200x630 PNG) from the SVG.
 * Runs during Docker build where sharp is available.
 */
const fs = require('fs');
const path = require('path');

async function generate() {
  const sharp = require('sharp');
  const svgPath = path.join(__dirname, 'color-react', 'public', 'og-image.svg');
  const outPath = path.join(__dirname, 'color-react', 'public', 'og-image.png');

  const svg = fs.readFileSync(svgPath);
  await sharp(svg).resize(1200, 630).png().toFile(outPath);
  console.log('Generated og-image.png');
}

generate().catch(e => {
  console.error('Failed to generate OG image:', e.message);
  process.exit(1);
});
