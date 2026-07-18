# 部署指南

兩種模式,由環境變數自動切換,程式碼不用改。

## 模式一:Vercel 展示模式(目前預設)

Vercel 上**沒設** `DATABASE_URL`(postgres)時:
- 建置時從 `assets/` 原始影片生成所有內容(ffmpeg 在建置容器可用),烘進 SQLite 一起部署
- 線上後台唯讀;更新內容 = 改 `assets/` + `scripts/import-assets.ts` → push → 重新部署

```bash
npx vercel --prod
```

## 模式二:Vercel 雲端後台(線上直接上傳、即時發布)

需要一個 Supabase 專案(免費方案即可),5 分鐘設定:

1. <https://supabase.com> 建立專案(區域選 Singapore / Tokyo 皆可)
2. **Storage → New bucket**:名稱 `media`,勾 **Public bucket**
3. 抄三個值:
   - `DATABASE_URL`:Project Settings → Database → Connection string → **Session pooler**(port 5432)
   - `SUPABASE_URL`:Project Settings → API → Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`:Project Settings → API → `service_role` key(這把 key 絕不能外流或進前端)
4. 貼到兩個地方:
   - 本機 `.env`(讓一次性遷移腳本能跑)
   - Vercel:Project → Settings → Environment Variables(Production)
     - 另需 `SESSION_SECRET`、`ADMIN_PASSWORD_HASH`(已設定)
5. 一次性遷移(把現有作品 + showreel 搬上雲端):
   ```bash
   npm run db:push                    # 在 Supabase 建表
   npm run db:seed                    # 基本設定
   npx tsx scripts/import-assets.ts   # 影片處理 + 上傳 bucket + 寫入 DB
   ```
6. 重新部署:`npx vercel --prod`

之後站主在 `https://網址/admin` 上傳、發布,立即生效,不需要重新部署。

### 雲端模式的技術細節
- 影片從瀏覽器**直傳** Supabase(`/api/upload-url` 簽名票券,繞過 serverless 4.5MB body 限制)
- 封面 / 4 秒 hover 預覽 / blur 都在管理員瀏覽器生成(canvas + MediaRecorder),伺服器不需要 ffmpeg
- 封面可在編輯器裡拉進度條選畫面(Use current frame as cover + preview)
- 正式環境登入只認 `ADMIN_PASSWORD_HASH`(bcrypt);換密碼:
  `npx tsx scripts/hash-password.ts "新密碼"` → 更新 Vercel env → redeploy

## 模式三:VPS / 自架(本地模式原樣上線)

SQLite + `public/uploads` + 伺服器端 ffmpeg 全部可用,適合想完全自主的情況。

1. Node.js 20+,clone 專案,`npm ci`
2. `.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   SESSION_SECRET="至少 32 字元的隨機字串"
   ADMIN_PASSWORD_HASH="bcrypt hash"
   NEXT_PUBLIC_SITE_URL="https://your-domain.com"
   ```
3. `npm run setup && npm run build`,用 systemd / PM2 跑 `npm start`
4. Nginx 反代 3000 + HTTPS,`client_max_body_size 250M;`
5. 備份 `prisma/dev.db` 與 `public/uploads/`(兩者必須一起還原)
