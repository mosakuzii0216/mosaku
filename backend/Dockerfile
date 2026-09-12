# ---------- build ----------
FROM node:22-slim AS build
WORKDIR /app

# npm workspaces は root の package-lock.json 1本で全部を解決する。
# npm ci は全 workspaces の package.json が揃っていないと失敗するので、
# frontend の package.json もコピーする(中身は使わない)
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm ci

COPY backend ./backend
WORKDIR /app/backend

# generate は DB に接続しないが、prisma7.config.ts が URL を読むのでダミーを置く
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate
RUN npm run build

# ---------- runtime ----------
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm ci --omit=dev

COPY --from=build /app/backend/dist ./backend/dist

CMD ["node", "backend/dist/src/main"]
