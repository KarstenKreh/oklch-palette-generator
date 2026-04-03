FROM node:20-alpine AS build-color
WORKDIR /app
COPY color-react/package.json color-react/package-lock.json ./
RUN npm ci
COPY color-react/ ./
RUN npm run build

FROM node:20-alpine AS build-type
WORKDIR /app
COPY type-react/package.json type-react/package-lock.json ./
RUN npm ci
COPY type-react/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install sharp --no-save
COPY index.html /app/public/index.html
COPY --from=build-color /app/dist /app/public/color/
COPY --from=build-type /app/dist /app/public/type/
COPY og-server.js /app/og-server.js
EXPOSE 80
CMD ["node", "og-server.js"]
