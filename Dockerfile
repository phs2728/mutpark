# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
# Set temporary DATABASE_URL for build process only
ENV DATABASE_URL="mysql://build:build@localhost:3306/build_temp"
ENV JWT_SECRET="temp_jwt_secret_for_build_only_not_production"
ENV ADMIN_SETUP_TOKEN="temp_setup_token"
ENV ADMIN_DEFAULT_PASSWORD="temp_password"
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/prisma ./prisma
RUN npm ci --omit=dev
RUN npx prisma generate
EXPOSE 8080
CMD ["npm", "run", "start"]
