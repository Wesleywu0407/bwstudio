# 部署

## VPS（建議主路徑）

SQLite、本地檔案與 ffmpeg 都需要可持久化磁碟，因此 VPS / Railway volume / Fly volume 是最符合目前架構的部署方式。

1. 安裝 Node.js 20+，clone 專案並執行 `npm ci`。
2. 建立 `.env`：

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="至少 32 字元的隨機字串"
ADMIN_PASSWORD_HASH="bcrypt hash"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
```

3. 執行 `npx prisma generate && npx prisma db push && npm run build`。
4. 用 systemd 或 PM2 執行 `npm start`。
5. Nginx 反向代理到 3000，並設定 HTTPS。
6. 備份 `prisma/dev.db` 與 `public/uploads/`；兩者必須一起還原。

建議 Nginx 將 request body 上限設為至少 250MB：

```nginx
client_max_body_size 250M;
```

## Vercel（備案）

Vercel function 檔案系統不持久，SQLite 與 `public/uploads` 也不能作為正式儲存。若要用 Vercel，需要：

- DB 改 PostgreSQL，`DATABASE_URL` 指向代管資料庫。
- 實作現有 `StorageAdapter` 的 Supabase Storage / S3 adapter。
- 大影片改為瀏覽器直傳 storage；影片轉檔移到背景 worker 或 Mux/Cloudflare Stream。
- API 只接收檔案 metadata，不在 Vercel function 內跑長時間 ffmpeg。

這些變更不影響前台元件與 Work 資料模型，但不能只靠環境變數直接切換。
