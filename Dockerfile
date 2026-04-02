FROM node:20-alpine AS build
WORKDIR /app
COPY color-react/package.json color-react/package-lock.json ./
RUN npm ci
COPY color-react/ ./
RUN npm run build

# Generate OG image from SVG
RUN npm install sharp --no-save
COPY generate-og-image.js /tmp/generate-og-image.js
RUN node -e " \
  const sharp = require('sharp'); \
  const fs = require('fs'); \
  const svg = fs.readFileSync('/app/public/og-image.svg'); \
  sharp(svg).resize(1200, 630).png().toFile('/app/dist/og-image.png').then(() => console.log('OG image generated')); \
"

FROM node:20-alpine
WORKDIR /app
COPY index.html /app/public/index.html
COPY --from=build /app/dist /app/public/color/
COPY og-server.js /app/og-server.js
EXPOSE 80
CMD ["node", "og-server.js"]
