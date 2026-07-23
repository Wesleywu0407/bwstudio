# 給 Bob —— 現在該做什麼

嗨 Bob,這是你的作品集網站專案。網站本身**已經做好、也已經上線**了:
👉 https://bwstudio-kohl.vercel.app

現在只剩**一件事需要你本人做**:開一個免費的 Supabase 帳號,
這樣你之後就能**直接在網頁後台拖放上傳作品、按發布就即時更新**,完全不用找工程師。

技術的部分你都不用碰 —— 你只要照下面拿到「三個值」,
其他交給 Claude Code(這個視窗)幫你跑就好。

---

## 你要做的:開 Supabase,拿三個值(約 5 分鐘)

Supabase 是免費的雲端資料庫 + 影片倉庫。你的作品會存在**你自己的帳號**裡。

### 步驟

1. 到 <https://supabase.com> → 點 **Start your project** → 用你的 Google 登入
2. 建立專案 **New project**
   - Name:隨便打,例如 `bwstudio`
   - Database Password:設一組密碼,**記下來**
   - Region:選 **Northeast Asia (Tokyo)**
   - 按 Create,等它跑 1～2 分鐘
3. 左邊選單 **Storage**(桶子圖示)→ **New bucket**
   - 名字打 `media`
   - **把 "Public bucket" 打開**（很重要）
   - Create
4. 左下角齒輪 **Project Settings**,抄三個東西:

   | 要找的 | 在哪裡 | 這是 |
   |--------|--------|------|
   | 一長串 `postgresql://...` | Database → Connection string → 點 **Session pooler** 那個分頁 | `DATABASE_URL` |
   | `https://xxxx.supabase.co` | Data API → Project URL | `SUPABASE_URL` |
   | 一長串 key（點 Reveal 才看得到）| API Keys → **`service_role`** | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ 那個 `service_role` key 等於你資料庫的鑰匙。只貼在下面說的地方,別公開貼到網路上。

---

## 拿到三個值之後

**最簡單的做法**:把三個值貼給 Claude Code(這個視窗),直接說:

> 「三個值好了:
> DATABASE_URL = ...
> SUPABASE_URL = ...
> SUPABASE_SERVICE_ROLE_KEY = ...
> 幫我接上去」

它會自動幫你:
1. 寫進設定檔(`.env`)
2. 在你的 Supabase 建好資料表
3. 把現在的作品和首頁影片搬上你的雲端
4. 更新線上網站

跑完之後,你就能自己管網站了 👇

---

## 之後怎麼更新作品(日常操作)

1. 打開 <https://bwstudio-kohl.vercel.app/admin>
2. 密碼:`bwstudio2026`
3. 拖影片進去 → 選封面 → 填標題 → 按 **Save**,前台立刻更新

詳細圖解看 **BWSTUDIO-操作手冊.pdf**(在這個資料夾裡),
或文字版 **ADMIN.md**。

---

## 常見疑問

**Q：我需要懂寫程式嗎?**
不用。你只要做上面的 Supabase 那一步,其他跟 Claude Code 說就好。

**Q：這會花錢嗎?**
Supabase 免費方案就夠用(作品集這種流量遠遠用不完)。

**Q：GitHub 是什麼,我要用嗎?**
那是放程式碼的地方,你已經有權限了但平常用不到。更新作品只需要上面的後台。

**Q：卡住了怎麼辦?**
把畫面截圖,直接問 Claude Code 或 Wesley。
