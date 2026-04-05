FROM node:20-alpine AS builder

WORKDIR /repo

COPY package.json package-lock.json* ./
COPY backend ./backend/
COPY scripts ./scripts/
COPY frontend ./frontend/

RUN npm ci
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /repo

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
COPY backend ./backend/
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /repo/frontend/public ./public
COPY --from=builder /repo/frontend/.next/standalone ./
COPY --from=builder /repo/frontend/.next/static ./.next/static

RUN npx prisma generate

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

RUN mkdir -p uploads/documents uploads/violations uploads/files && \
    chown -R nextjs:nodejs /repo

COPY docker/entrypoint.sh /repo/entrypoint.sh
RUN chmod +x /repo/entrypoint.sh && chown nextjs:nodejs /repo/entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/repo/entrypoint.sh"]
CMD ["node", "server.js"]
