
FROM node:22-alpine AS test
WORKDIR /app
COPY package.json ./
COPY public ./public
COPY test ./test
RUN npm run test:ci

FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime
LABEL org.opencontainers.image.source="https://github.com/OmarAbdo74-B1/ironclad-frontend" \
      org.opencontainers.image.title="ironclad-frontend"

USER root
RUN apk upgrade --no-cache

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html/

USER 101
EXPOSE 8080