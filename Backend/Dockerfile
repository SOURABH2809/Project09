
# Base image
FROM node:20-alpine AS base

WORKDIR /app

# Copy only package files for caching
COPY package*.json ./

# Install dependencies (all)
RUN npm install

# Development Stage (Hot Reload)
FROM base AS dev

# Variables for module paths to avoid hardcoding in multiple places
ENV AUTH_MODULE_PATH=src/modules/auth
ENV NOTIFICATION_MODULE_PATH=src/modules/notification

COPY . .

# Generate Prisma clients for the modules included in this project.
RUN npx prisma generate --schema=${AUTH_MODULE_PATH}/prisma/schema.prisma
RUN npx prisma generate --schema=${NOTIFICATION_MODULE_PATH}/prisma/schema.prisma


EXPOSE 5001

# Run migrations at container startup in dev mode
CMD ["sh", "-c", "\
    npx prisma migrate deploy --config=${AUTH_MODULE_PATH}/prisma.config.ts --schema=${AUTH_MODULE_PATH}/prisma/schema.prisma && \
    npx prisma migrate deploy --config=${NOTIFICATION_MODULE_PATH}/prisma.config.ts --schema=${NOTIFICATION_MODULE_PATH}/prisma/schema.prisma && \
    npm run seed:admin && \
    exec npm run dev \
"]

# ----------------------------------------
# Build Stage (Prod Build)
# ----------------------------------------
FROM base AS build

ENV AUTH_MODULE_PATH=src/modules/auth
ENV NOTIFICATION_MODULE_PATH=src/modules/notification

COPY . .

# Generate Prisma clients for the modules included in this project.
RUN npx prisma generate --schema=${AUTH_MODULE_PATH}/prisma/schema.prisma
RUN npx prisma generate --schema=${NOTIFICATION_MODULE_PATH}/prisma/schema.prisma

# Build application
RUN npm run build

# Production Stage
FROM node:20-alpine AS prod

ENV AUTH_MODULE_PATH=src/modules/auth
ENV NOTIFICATION_MODULE_PATH=src/modules/notification


WORKDIR /app

# Copy only prod deps
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy built app + Prisma clients + migrations
# Source Code
COPY --from=build /app/dist ./dist

COPY --from=build /app/${AUTH_MODULE_PATH}/prisma.config.ts ./${AUTH_MODULE_PATH}/prisma.config.ts
COPY --from=build /app/${AUTH_MODULE_PATH}/prisma/schema.prisma ./${AUTH_MODULE_PATH}/prisma/schema.prisma
COPY --from=build /app/${AUTH_MODULE_PATH}/prisma/migrations ./${AUTH_MODULE_PATH}//prisma/migrations
COPY --from=build /app/${NOTIFICATION_MODULE_PATH}/prisma.config.ts ./${NOTIFICATION_MODULE_PATH}/prisma.config.ts
COPY --from=build /app/${NOTIFICATION_MODULE_PATH}/prisma/schema.prisma ./${NOTIFICATION_MODULE_PATH}/prisma/schema.prisma
COPY --from=build /app/${NOTIFICATION_MODULE_PATH}/prisma/migrations ./${NOTIFICATION_MODULE_PATH}/prisma/migrations
COPY --from=build /app/public/assets ./public/assets

# Others
COPY --from=build /app/geo/ ./geo/

EXPOSE 5001

# At startup: deploy migrations for all modules, then start app
CMD ["sh", "-c", "\
    npx prisma migrate deploy --config=${AUTH_MODULE_PATH}/prisma.config.ts --schema=${AUTH_MODULE_PATH}/prisma/schema.prisma && \
    npx prisma migrate deploy --config=${NOTIFICATION_MODULE_PATH}/prisma.config.ts --schema=${NOTIFICATION_MODULE_PATH}/prisma/schema.prisma && \
    npm run seed:admin && \
    exec npm run start \
"]
