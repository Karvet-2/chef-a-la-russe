# Образ с AWS Public ECR — без лимита Docker Hub (429) при анонимном pull
FROM public.ecr.aws/docker/library/node:20-alpine AS builder

WORKDIR /repo

COPY package.json package-lock.json* ./
COPY backend ./backend/
COPY scripts ./scripts/
COPY app ./app/
COPY frontend ./frontend/

# npm ci требует полного совпадения lock с package.json; при рассинхроне используйте npm install локально и закоммитьте lock
RUN npm install
RUN npx prisma generate
RUN npm run build

FROM public.ecr.aws/docker/library/node:20-alpine AS runner

WORKDIR /repo

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
COPY backend ./backend/
RUN npm install --omit=dev && npm cache clean --force

# next build ./frontend кладёт standalone как .next/standalone/frontend/server.js — не в корень
COPY --from=builder /repo/frontend/.next/standalone ./
COPY --from=builder /repo/frontend/public ./frontend/public
COPY --from=builder /repo/frontend/.next/static ./frontend/.next/static
# При cwd=/repo процесс ищет статику в /repo/.next/static — без этого CSS/чанки 404
COPY --from=builder /repo/frontend/.next/static ./.next/static
COPY --from=builder /repo/frontend/public ./public

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
CMD ["node", "frontend/server.js"]
