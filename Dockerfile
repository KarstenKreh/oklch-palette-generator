FROM node:20-alpine AS build
WORKDIR /app
COPY color-react/package.json color-react/package-lock.json ./
RUN npm ci
COPY color-react/ ./
RUN npm run build

FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY --from=build /app/dist /usr/share/nginx/html/color/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
