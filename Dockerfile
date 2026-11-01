# ─── Build Angular ──────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration production

# ─── Service : nginx sans root (port 8080, uid 101) ─────────
# Compatible avec le Pod Security "restricted" du namespace demo.
FROM nginxinc/nginx-unprivileged:stable-alpine

# Les fichiers *.template sont passés à envsubst au démarrage du conteneur.
# NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1 fournit ${NGINX_LOCAL_RESOLVERS} (DNS du cluster).
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1 \
    API_UPSTREAM=http://api-demo.demo.svc.cluster.local

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/front-demo/browser /usr/share/nginx/html

EXPOSE 8080
