FROM node:20-alpine AS build-color
WORKDIR /app
COPY color-react/package.json color-react/package-lock.json ./
RUN npm ci
COPY color-react/ ./
COPY shared.css /shared.css
RUN npm run build

FROM node:20-alpine AS build-type
WORKDIR /app
COPY type-react/package.json type-react/package-lock.json ./
RUN npm ci
COPY type-react/ ./
COPY shared.css /shared.css
RUN npm run build

FROM node:20-alpine AS build-system
WORKDIR /app
COPY system-react/package.json system-react/package-lock.json ./
RUN npm ci
COPY system-react/ ./
COPY shared.css /shared.css
RUN npm run build

FROM node:20-alpine AS build-shape
WORKDIR /app
COPY shape-react/package.json shape-react/package-lock.json ./
RUN npm ci
COPY shape-react/ ./
COPY shared.css /shared.css
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install sharp --no-save
COPY index.html /app/public/index.html
COPY public/robots.txt /app/public/robots.txt
COPY public/sitemap.xml /app/public/sitemap.xml
COPY public/llms.txt /app/public/llms.txt
COPY --from=build-color /app/dist /app/public/color/
COPY --from=build-type /app/dist /app/public/type/
COPY --from=build-system /app/dist /app/public/system/
COPY --from=build-shape /app/dist /app/public/shape/
COPY og-server.js /app/og-server.js
EXPOSE 80
CMD ["node", "og-server.js"]
