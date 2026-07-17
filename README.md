# BOB — CG Artist Portfolio

暗場、無彩度、以作品為唯一光源的 CG Director / Motion Designer 個人作品集。支援 9:16、16:9、4:5、1:1 混合比例，並內建單管理員後台與伺服器端影片處理。

## 本機啟動

需要 Node.js 20+。第一次執行：

```bash
npm install
cp .env.example .env
npm run setup
npm run dev
```

開啟 `http://localhost:3000`。後台位於 `http://localhost:3000/admin/login`。

若要設定後台密碼，先產生 bcrypt hash：

```bash
npx tsx scripts/hash-password.ts "你的密碼"
```

將輸出貼到 `.env` 的 `ADMIN_PASSWORD_HASH`；`SESSION_SECRET` 必須換成至少 32 字元的隨機值。本機 development 也可暫用現有的 `ADMIN_PASSWORD`，production 只接受 hash。改完需重啟 dev server。

## 本人後台操作

1. 登入 `/admin/login`。
2. 在 Works 按「NEW WORK +」。
3. 填 Title、Slug、分類、年份與比例。
4. 選擇完整影片。伺服器會自動產生 4 秒靜音 preview、封面、blur placeholder，並依影片判斷比例。
5. 勾選 Published 才會出現在前台；Featured 會進首頁。
6. Works 列表用上下箭頭排序，Live / Featured 可快速切換。
7. Settings 可改名字、簡介、email、社群連結與 showreel。

開發 seed 的八件作品只是假資料；正式上線前可從後台刪除或改寫。

## 常用指令

```bash
npm run dev          # 開發伺服器
npm run lint         # ESLint
npm run build        # production build
npm run db:push      # schema 同步到 SQLite
npm run db:seed      # 補入假資料（upsert，不重複）
```

## 架構

- Next.js 16 App Router、React 19、TypeScript、Tailwind CSS v4、Framer Motion
- Prisma 6 + SQLite
- `StorageAdapter` 預設存到 `public/uploads`
- `ffmpeg-static` + `sharp` 處理 preview / poster / blur
- `iron-session` + bcrypt 單管理員認證；登入有 in-memory rate limit

部署請見 [DEPLOY.md](./DEPLOY.md)。
