#!/bin/sh
set -e
cd /repo
npx prisma migrate deploy --schema=backend/prisma/schema.prisma
exec "$@"
