FROM node:24-alpine AS base

# Stage 1: instala todas as dependências (Debian para suporte a módulos nativos)
FROM node:24 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: build (Debian para suporte a @poppinss/ts-exec / SWC)
FROM node:24 AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
RUN mkdir -p tmp
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3333 \
    LOG_LEVEL=info \
    APP_KEY=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa \
    APP_URL=http://localhost:3333 \
    SESSION_DRIVER=cookie \
    DB_CONNECTION=mysql \
    MYSQL_HOST=localhost \
    MYSQL_PORT=3306 \
    MYSQL_USER=root \
    MYSQL_PASSWORD=root \
    MYSQL_DB_NAME=payment_db \
    GATEWAY1_URL=http://localhost:3001 \
    GATEWAY1_EMAIL=placeholder@example.com \
    GATEWAY1_TOKEN=placeholder \
    GATEWAY2_URL=http://localhost:3002 \
    GATEWAY2_AUTH_TOKEN=placeholder \
    GATEWAY2_AUTH_SECRET=placeholder
RUN node ace build

# Stage 3: produção (Alpine para imagem menor — só roda JS compilado)
FROM base AS production
WORKDIR /app
COPY --from=build /app/build .
COPY package*.json ./
RUN npm ci --omit=dev
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333
EXPOSE 3333
CMD ["node", "bin/server.js"]
