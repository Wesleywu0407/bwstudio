# Vercel 設定 —— Wesley 專用

> Vercel 帳號在 Wesley 這邊(team `wesley0407bonjour`,project `bwstudio`)。
> Bob 負責開 Supabase 給三個值(見 `START-HERE.md`);**把值接上 Vercel + 重部署是這裡的事。**
> 正式網址:<https://bwstudio-kohl.vercel.app>

---

## 現況(已設定)

| 環境變數 | 狀態 |
|----------|------|
| `SESSION_SECRET` | ✅ 已設(cookie 加密) |
| `ADMIN_PASSWORD_HASH` | ✅ 已設(後台密碼 `bwstudio2026` 的 bcrypt) |
| `DATABASE_URL` | ⬜ 等 Bob 的 Supabase 值 |
| `SUPABASE_URL` | ⬜ 等 Bob 的 Supabase 值 |
| `SUPABASE_SERVICE_ROLE_KEY` | ⬜ 等 Bob 的 Supabase 值 |

沒設後三個值時,網站維持「展示模式」(SQLite 烘進部署,線上後台唯讀)。
三個值到齊 → 自動切換成「雲端後台」(線上直接上傳、即時發布)。

---

## Bob 給值之後要做的事

### 最簡單:交給 Claude Code

把 Bob 給的三個值貼給 Claude Code(這個視窗),說「幫我接上 Vercel 並重部署」。
它會用已登入的 Vercel CLI(`wesleywu0407`)自動做完下面全部。

### 或手動做

#### 1. 三個值加進 Vercel(Production)

Dashboard:Project `bwstudio` → Settings → Environment Variables → 各加一條(Environment 勾 Production):

```
DATABASE_URL                = postgresql://...（Bob 的 Session pooler，port 5432）
SUPABASE_URL                = https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY   = （Bob 的 service_role key）
```

或用 CLI:

```bash
printf "%s" "貼上值" | npx vercel env add DATABASE_URL production
printf "%s" "貼上值" | npx vercel env add SUPABASE_URL production
printf "%s" "貼上值" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

#### 2. 一次性遷移(在 Bob 的 Supabase 建表 + 把現有作品搬上去)

先把同樣三個值(加上原本的 `SESSION_SECRET`、`ADMIN_PASSWORD_HASH`)寫進本機 `.env`,然後:

```bash
npm run db:push                    # 在 Supabase 建資料表
npm run db:seed                    # 基本設定
npx tsx scripts/import-assets.ts   # 影片處理 → 上傳 Bob 的 bucket → 寫入 DB
```

> 只需跑一次。之後 Bob 從後台上傳,不必再跑。

#### 3. 重部署

```bash
npx vercel --prod
```

#### 4. 驗證

- 開 <https://bwstudio-kohl.vercel.app> → 作品照常顯示(封面來自 Bob 的 Supabase)
- <https://bwstudio-kohl.vercel.app/admin> 登入 → 上傳一支測試影片 → 前台即時出現

---

## 注意

- `service_role` key 是機密,只放在 Vercel env 與本機 `.env`(已被 `.gitignore` 排除),**不要 commit / 公開**。
- 換後台密碼:`npx tsx scripts/hash-password.ts "新密碼"` → 更新 Vercel 的 `ADMIN_PASSWORD_HASH` → 重部署。
- 部署一律用 `wesleywu0407` 這個 Vercel 帳號;Bob 那邊只碰 Supabase 與網頁後台,不碰部署。
- 完整雙模式說明見 `DEPLOY.md`。
