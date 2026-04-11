FROM node:20-alpine AS build-color
WORKDIR /app/color-react
COPY color-react/package.json color-react/package-lock.json ./
RUN npm ci
COPY color-react/ ./
COPY packages/core/ /app/packages/core/
COPY shared.css /shared.css
RUN npm run build

FROM node:20-alpine AS build-type
WORKDIR /app/type-react
COPY type-react/package.json type-react/package-lock.json ./
RUN npm ci
COPY type-react/ ./
COPY packages/core/ /app/packages/core/
COPY shared.css /shared.css
RUN npm run build

FROM node:20-alpine AS build-system
WORKDIR /app/system-react
COPY system-react/package.json system-react/package-lock.json ./
RUN npm ci
COPY system-react/ ./
COPY packages/core/ /app/packages/core/
COPY shared.css /shared.css
RUN npm run build

FROM node:20-alpine AS build-shape
WORKDIR /app/shape-react
COPY shape-react/package.json shape-react/package-lock.json ./
RUN npm ci
COPY shape-react/ ./
COPY packages/core/ /app/packages/core/
COPY shared.css /shared.css
RUN npm run build

FROM node:20-alpine AS build-symbol
WORKDIR /app/symbol-react
COPY symbol-react/package.json symbol-react/package-lock.json ./
RUN npm ci
COPY symbol-react/ ./
COPY packages/core/ /app/packages/core/
COPY shared.css /shared.css
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install sharp --no-save
COPY index.html /app/public/index.html
COPY public/robots.txt /app/public/robots.txt
COPY public/sitemap.xml /app/public/sitemap.xml
COPY public/llms.txt /app/public/llms.txt
COPY --from=build-color /app/color-react/dist /app/public/color/
COPY --from=build-type /app/type-react/dist /app/public/type/
COPY --from=build-system /app/system-react/dist /app/public/system/
COPY --from=build-shape /app/shape-react/dist /app/public/shape/
COPY --from=build-symbol /app/symbol-react/dist /app/public/symbol/
COPY og-server.js /app/og-server.js
EXPOSE 80
CMD ["node", "og-server.js"]
