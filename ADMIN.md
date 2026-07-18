# BWSTUDIO 後台操作指南

給站主的完整步驟。照順序做就能登入後台、上傳作品、管理網站。

---

## 0. 啟動網站(本機)

```bash
cd ~/Desktop/bobweb
npm run dev
```

等終端機出現 `✓ Ready`,網站就在 <http://localhost:3000>。

> 第一次拿到專案才需要:`npm install && npm run setup`(安裝依賴 + 建資料庫)。

---

## 1. 登入後台

1. 打開 <http://localhost:3000/admin/login>
2. 輸入密碼:`bwstudio2026`(設定在專案根目錄 `.env` 的 `ADMIN_PASSWORD`)
3. 成功後會進到 **作品列表** `/admin/works`

注意:
- 密碼連錯 **5 次**會被鎖 **15 分鐘**(防暴力破解),等一下再試就好。
- 沒登入直接開任何 `/admin` 頁面,會自動被踢回登入頁。

---

## 2. 新增一件作品

1. 在 `/admin/works` 點 **New project**
2. 填基本欄位:
   | 欄位 | 說明 |
   |------|------|
   | Title | 作品名稱(前台大標題) |
   | Slug | 網址用的英文短名,如 `neon-garden` → `/works/neon-garden` |
   | Description | 作品介紹(可留空之後補) |
   | Client / Role / Software / Year | 職員表資訊,顯示在作品內頁 |
   | Category | Music Video / Commercial / CG Film / Experiment |
   | Aspect | 影片長寬比(16:9、9:16、4:3、1:1、4:5)——決定它在作品牆上的形狀 |
3. 右側虛線框 **拖放或點選上傳影片**(mp4 建議 < 200MB):
   - 系統會自動生成:4 秒 hover 預覽片、封面圖、模糊佔位圖
   - 想換封面:再上傳一張 jpg/png 即可覆蓋
4. 勾選開關:
   - **Published** = 前台看得到(沒勾就是草稿)
   - **Featured** = 出現在首頁精選區
5. 按 **Save project**

## 3. 編輯 / 刪除 / 排序

- 列表點任一作品進入編輯,改完按 Save
- 編輯頁最下方有 **Delete**(會連檔案一起刪,不可復原)
- 列表頁可拖曳調整前台顯示順序

## 4. 網站設定(/admin/settings)

- **Site name**:首頁大字與全站名稱(現在是 BWSTUDIO)
- **Tagline / Location**:首頁左下的職稱與座標
- **Showreel**:首頁背景 loop 影片(建議 < 10 秒、壓好的 mp4)
- **About text**:About 頁的自介
- **Email / Instagram / Vimeo / Behance**:頁腳與 About 的聯絡資訊

改完存檔,前台**立即生效**,不用重啟。

## 5. 登出

後台右上角 **Logout**。

---

## 常見問題

**忘記密碼?** 打開 `.env` 改 `ADMIN_PASSWORD` 後重啟 `npm run dev`。

**上傳後前台沒更新?** 確認有勾 Published 並按過 Save;瀏覽器強制重新整理(Cmd+Shift+R)。

**影片上傳失敗?** 只收 mp4 / webm / mov,影片上限 200MB、圖片 15MB。太大就先用 HandBrake 之類壓一版 h264。

**正式上線前必做**(詳見 DEPLOY.md):
1. `.env` 換掉 `SESSION_SECRET`(隨機 32+ 字元)
2. 產生正式密碼 hash:`npx tsx scripts/hash-password.ts "新密碼"`,把輸出貼進 `.env` 的 `ADMIN_PASSWORD_HASH`(正式環境只認 hash,不認明文)
