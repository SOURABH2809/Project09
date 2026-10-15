#!/bin/sh
set -e

echo "Running migrations..."

# Auth
npx prisma migrate deploy --config=$AUTH_MODULE_PATH/prisma.config.ts --schema=$AUTH_MODULE_PATH/prisma/schema.prisma

# Customer
npx prisma migrate deploy --config=$CUSTOMER_MODULE_PATH/prisma.config.ts --schema=$CUSTOMER_MODULE_PATH/prisma/schema.prisma

# Master
npx prisma migrate deploy --config=$MASTER_DATA_MODULE_PATH/prisma.config.ts --schema=$MASTER_DATA_MODULE_PATH/prisma/schema.prisma

# Notification
npx prisma migrate deploy --config=$NOTIFICATION_MODULE_PATH/prisma.config.ts --schema=$NOTIFICATION_MODULE_PATH/prisma/schema.prisma

echo "Starting app..."
npm run start
