FROM node:20-alpine AS build
WORKDIR /app
COPY color-react/package.json color-react/package-lock.json ./
RUN npm ci
COPY color-react/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY index.html /app/public/index.html
COPY --from=build /app/dist /app/public/color/
COPY og-server.js /app/og-server.js
EXPOSE 80
CMD ["node", "og-server.js"]
