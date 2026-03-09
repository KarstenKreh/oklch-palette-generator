FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html
COPY color/ /usr/share/nginx/html/color/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
