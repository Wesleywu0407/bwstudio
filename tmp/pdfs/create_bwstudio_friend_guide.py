from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    HRFlowable,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "pdf" / "BWSTUDIO_朋友設定Supabase操作手冊.pdf"

PAGE_W, PAGE_H = A4
MARGIN_X = 18 * mm
TOP = 18 * mm
BOTTOM = 16 * mm

INK = colors.HexColor("#172033")
MUTED = colors.HexColor("#5E6879")
ACCENT = colors.HexColor("#5B5FEF")
ACCENT_DARK = colors.HexColor("#4145CA")
ACCENT_SOFT = colors.HexColor("#EEF0FF")
MINT = colors.HexColor("#2AA982")
MINT_SOFT = colors.HexColor("#E9F8F3")
AMBER = colors.HexColor("#D99116")
AMBER_SOFT = colors.HexColor("#FFF5DE")
RED = colors.HexColor("#D84A5A")
RED_SOFT = colors.HexColor("#FDECEF")
LINE = colors.HexColor("#DCE1EA")
PAPER = colors.HexColor("#F7F8FC")
WHITE = colors.white
NAVY = colors.HexColor("#10162A")


pdfmetrics.registerFont(TTFont("HeitiLight", "/System/Library/Fonts/STHeiti Light.ttc"))
pdfmetrics.registerFont(TTFont("HeitiMedium", "/System/Library/Fonts/STHeiti Medium.ttc"))
pdfmetrics.registerFontFamily(
    "Heiti",
    normal="HeitiLight",
    bold="HeitiMedium",
    italic="HeitiLight",
    boldItalic="HeitiMedium",
)


styles = getSampleStyleSheet()


def ps(name, **kwargs):
    base = dict(
        fontName="HeitiLight",
        fontSize=9.5,
        leading=15,
        textColor=INK,
        spaceAfter=5,
        wordWrap="CJK",
    )
    base.update(kwargs)
    return ParagraphStyle(name, **base)


S = {
    "cover_chip": ps(
        "cover_chip",
        fontName="HeitiMedium",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#AEB7FF"),
        tracking=1.2,
    ),
    "cover_title": ps(
        "cover_title",
        fontName="HeitiMedium",
        fontSize=28,
        leading=36,
        textColor=WHITE,
        spaceAfter=8,
    ),
    "cover_sub": ps(
        "cover_sub",
        fontSize=12,
        leading=19,
        textColor=colors.HexColor("#C9D0DF"),
    ),
    "cover_box_title": ps(
        "cover_box_title",
        fontName="HeitiMedium",
        fontSize=10,
        leading=15,
        textColor=WHITE,
    ),
    "cover_box": ps(
        "cover_box",
        fontSize=9.5,
        leading=15,
        textColor=colors.HexColor("#E3E7F1"),
    ),
    "eyebrow": ps(
        "eyebrow",
        fontName="HeitiMedium",
        fontSize=8,
        leading=11,
        textColor=ACCENT,
        tracking=1.2,
        spaceAfter=4,
    ),
    "h1": ps(
        "h1",
        fontName="HeitiMedium",
        fontSize=21,
        leading=27,
        textColor=INK,
        spaceAfter=8,
    ),
    "h2": ps(
        "h2",
        fontName="HeitiMedium",
        fontSize=13.5,
        leading=19,
        textColor=INK,
        spaceBefore=4,
        spaceAfter=5,
    ),
    "body": ps("body"),
    "small": ps("small", fontSize=8.2, leading=12.5, textColor=MUTED),
    "bullet": ps("bullet", leftIndent=12, firstLineIndent=-10, bulletIndent=0),
    "note": ps("note", fontSize=9, leading=14),
    "table_head": ps(
        "table_head",
        fontName="HeitiMedium",
        fontSize=8.2,
        leading=11,
        textColor=WHITE,
        alignment=TA_LEFT,
        spaceAfter=0,
    ),
    "table_body": ps(
        "table_body",
        fontSize=8.1,
        leading=12.2,
        spaceAfter=0,
    ),
    "code": ps(
        "code",
        fontName="Courier",
        fontSize=8,
        leading=12,
        textColor=colors.HexColor("#DDE4F4"),
        spaceAfter=0,
    ),
    "check": ps("check", fontSize=9, leading=12.5, leftIndent=0, spaceAfter=0),
    "check_text": ps("check_text", fontSize=9, leading=12.5, spaceAfter=0),
    "link": ps("link", fontSize=8.2, leading=13, textColor=ACCENT_DARK),
}


def P(text, style="body"):
    return Paragraph(text, S[style])


def box(content, bg, border=None, padding=10, radius=8, widths=None):
    if not isinstance(content, (list, tuple)):
        content = [content]
    data = [[content]]
    t = Table(data, colWidths=widths)
    ts = [
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 0.7, border or bg),
        ("LEFTPADDING", (0, 0), (-1, -1), padding),
        ("RIGHTPADDING", (0, 0), (-1, -1), padding),
        ("TOPPADDING", (0, 0), (-1, -1), padding),
        ("BOTTOMPADDING", (0, 0), (-1, -1), padding),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROUNDEDCORNERS", [radius]),
    ]
    t.setStyle(TableStyle(ts))
    return t


def step_header(number, title, subtitle=""):
    badge = Table([[P(str(number), "cover_box_title")]], colWidths=[9 * mm], rowHeights=[9 * mm])
    badge.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), ACCENT),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ROUNDEDCORNERS", [5]),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    text = [P(title, "h2")]
    if subtitle:
        text.append(P(subtitle, "small"))
    row = Table([[badge, text]], colWidths=[12 * mm, 154 * mm])
    row.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    return row


def checklist(items, color=MINT):
    rows = []
    for item in items:
        rows.append([P(f'<font color="{color.hexval()}"><b>✓</b></font>', "check"), P(item, "check_text")])
    t = Table(rows, colWidths=[7 * mm, 155 * mm])
    t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2),
                ("TOPPADDING", (0, 0), (-1, -1), 0.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
            ]
        )
    )
    return t


def nav_header(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    canvas.setFillColor(ACCENT)
    canvas.rect(0, PAGE_H - 4 * mm, PAGE_W, 4 * mm, stroke=0, fill=1)
    canvas.setFont("HeitiMedium", 8)
    canvas.setFillColor(INK)
    canvas.drawString(MARGIN_X, PAGE_H - 12 * mm, "BWSTUDIO 雲端後台啟用手冊")
    canvas.setFont("HeitiLight", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(PAGE_W - MARGIN_X, PAGE_H - 12 * mm, "給協助設定 Supabase 的朋友")
    canvas.setStrokeColor(LINE)
    canvas.line(MARGIN_X, 13 * mm, PAGE_W - MARGIN_X, 13 * mm)
    canvas.setFont("HeitiLight", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN_X, 8 * mm, "版本 2026-07-18 · 介面名稱若微調，以功能名稱與本手冊檢查條件為準")
    canvas.drawRightString(PAGE_W - MARGIN_X, 8 * mm, str(doc.page))
    canvas.restoreState()


def cover_bg(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    canvas.setFillColor(colors.HexColor("#1A2250"))
    canvas.circle(PAGE_W - 12 * mm, PAGE_H - 12 * mm, 62 * mm, stroke=0, fill=1)
    canvas.setFillColor(colors.HexColor("#373B9B"))
    canvas.circle(PAGE_W - 25 * mm, PAGE_H - 30 * mm, 31 * mm, stroke=0, fill=1)
    canvas.setFillColor(colors.HexColor("#242A48"))
    canvas.circle(10 * mm, 16 * mm, 38 * mm, stroke=0, fill=1)
    canvas.restoreState()


doc = BaseDocTemplate(
    str(OUT),
    pagesize=A4,
    leftMargin=MARGIN_X,
    rightMargin=MARGIN_X,
    topMargin=TOP,
    bottomMargin=BOTTOM,
    title="BWSTUDIO 朋友設定 Supabase 操作手冊",
    author="BWSTUDIO",
    subject="Supabase 與 Vercel 雲端後台設定",
)
cover_frame = Frame(MARGIN_X, 20 * mm, PAGE_W - 2 * MARGIN_X, PAGE_H - 38 * mm, id="cover")
body_frame = Frame(MARGIN_X, 17 * mm, PAGE_W - 2 * MARGIN_X, PAGE_H - 35 * mm, id="body")
doc.addPageTemplates(
    [
        PageTemplate(id="Cover", frames=[cover_frame], onPage=cover_bg),
        PageTemplate(id="Body", frames=[body_frame], onPage=nav_header),
    ]
)


story = []

# Cover
story += [
    Spacer(1, 18 * mm),
    P("BWSTUDIO / CLOUD SETUP", "cover_chip"),
    Spacer(1, 4 * mm),
    P("朋友設定 Supabase<br/>操作手冊", "cover_title"),
    P("把作品網站切換成可在線上後台直接上傳、發布的雲端模式。<br/>朋友照第 1–4 步完成即可，無須執行任何程式指令。", "cover_sub"),
    Spacer(1, 12 * mm),
]

cover_summary = [
    P("完成後應有 4 項成果", "cover_box_title"),
    Spacer(1, 2 * mm),
    P("01　Supabase 專案已建立", "cover_box"),
    P("02　Storage 中有公開 bucket：<b>media</b>", "cover_box"),
    P("03　三個必要值已取得並安全保存", "cover_box"),
    P("04　三個值已加入 Vercel 的 Production 環境變數", "cover_box"),
]
story += [box(cover_summary, colors.HexColor("#1C2540"), colors.HexColor("#394363"), padding=12), Spacer(1, 9 * mm)]

flow = Table(
    [[P("SUPABASE<br/>PROJECT", "cover_box_title"), P("→", "cover_box_title"), P("PUBLIC<br/>MEDIA BUCKET", "cover_box_title"), P("→", "cover_box_title"), P("3 VALUES<br/>TO VERCEL", "cover_box_title"), P("→", "cover_box_title"), P("OWNER<br/>MIGRATES", "cover_box_title")]],
    colWidths=[32 * mm, 7 * mm, 39 * mm, 7 * mm, 37 * mm, 7 * mm, 35 * mm],
)
flow.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#151D35")),
            ("TEXTCOLOR", (0, 0), (-1, -1), WHITE),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#323B58")),
            ("INNERGRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#323B58")),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
            ("ROUNDEDCORNERS", [6]),
        ]
    )
)
story += [flow, Spacer(1, 11 * mm)]
story += [
    box(
        [
            P("安全提醒", "cover_box_title"),
            P("<b>service_role</b> 金鑰等同後台管理權限。不要貼到 LINE 群組、Email、截圖、公開文件或 GitHub；最安全的交接方式是邀請網站擁有者進入 Supabase / Vercel，由對方自行查看。", "cover_box"),
        ],
        colors.HexColor("#382333"),
        colors.HexColor("#7A3E54"),
        padding=11,
    ),
    Spacer(1, 9 * mm),
    P("預估時間：10–15 分鐘　｜　需要：Supabase 帳號、Vercel 專案權限", "cover_sub"),
]
story.append(PageBreak())
doc.handle_nextPageTemplate("Body")

# Page 2
story += [
    P("PART 01 / SUPABASE", "eyebrow"),
    P("建立專案、儲存空間與必要金鑰", "h1"),
    P("請依序完成。每一步右側路徑可能因新版介面稍有移動，但名稱不變。", "small"),
    Spacer(1, 4 * mm),
]

story += [
    step_header(1, "建立 Supabase project", "登入後使用自己的帳號建立；不要使用臨時或共用帳號。"),
    Spacer(1, 2 * mm),
    P("• 開啟 <link href='https://supabase.com/dashboard' color='#4145CA'>supabase.com/dashboard</link>，按 <b>New project</b>。", "bullet"),
    P("• 專案名稱可填 <b>bwstudio</b>；區域選離台灣較近的 <b>Tokyo</b> 或 <b>Singapore</b>。", "bullet"),
    P("• 建立一組強度足夠的 Database password，存進密碼管理器。稍後若連線字串出現 <font name='Courier'>[YOUR-PASSWORD]</font>，要用這組密碼取代。", "bullet"),
    P("• 等待專案狀態變成可使用，再進下一步。", "bullet"),
    Spacer(1, 4 * mm),
    step_header(2, "建立公開的 media bucket", "這裡存作品影片、封面、預覽片與 showreel。"),
    Spacer(1, 2 * mm),
    P("左側 <b>Storage</b> → <b>New bucket / Create bucket</b>：", "body"),
]

bucket_table = Table(
    [
        [P("欄位", "table_head"), P("請填", "table_head"), P("完成檢查", "table_head")],
        [P("Bucket name", "table_body"), P("<font name='Courier'><b>media</b></font>（全小寫、不可多空格）", "table_body"), P("Storage 列表中顯示 media", "table_body")],
        [P("Bucket type", "table_body"), P("一般 Storage bucket", "table_body"), P("不要選 Analytics bucket", "table_body")],
        [P("Public bucket", "table_body"), P("<b>開啟 / 勾選</b>", "table_body"), P("顯示為 Public", "table_body")],
    ],
    colWidths=[31 * mm, 70 * mm, 65 * mm],
    repeatRows=1,
)
bucket_table.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), INK),
            ("BACKGROUND", (0, 1), (-1, -1), WHITE),
            ("GRID", (0, 0), (-1, -1), 0.45, LINE),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]
    )
)
story += [bucket_table, Spacer(1, 5 * mm)]

story += [
    step_header(3, "取得 3 個必要值", "名稱必須完全一致；複製時不要帶到前後空白。"),
    Spacer(1, 2 * mm),
]

credential_table = Table(
    [
        [P("環境變數", "table_head"), P("從哪裡取得", "table_head"), P("怎樣才正確", "table_head")],
        [
            P("<font name='Courier'><b>DATABASE_URL</b></font>", "table_body"),
            P("頁面頂端 <b>Connect</b> → Shared Pooler → <b>Session mode</b>", "table_body"),
            P("連線字串以 <font name='Courier'>postgres://</font> 或 <font name='Courier'>postgresql://</font> 開頭，port 是 <b>5432</b>；若含 <font name='Courier'>[YOUR-PASSWORD]</font> 必須替換。", "table_body"),
        ],
        [
            P("<font name='Courier'><b>SUPABASE_URL</b></font>", "table_body"),
            P("Project Settings → API（或 Connect）→ <b>Project URL</b>", "table_body"),
            P("格式類似 <font name='Courier'>https://xxxx.supabase.co</font>", "table_body"),
        ],
        [
            P("<font name='Courier'><b>SUPABASE_<br/>SERVICE_ROLE_KEY</b></font>", "table_body"),
            P("Project Settings → API Keys → <b>Legacy API Keys</b> → <b>service_role</b>", "table_body"),
            P("必須是 <b>service_role</b>，不可誤拿 anon / publishable key。Reveal 後只放入安全位置。", "table_body"),
        ],
    ],
    colWidths=[42 * mm, 57 * mm, 67 * mm],
    repeatRows=1,
)
credential_table.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), INK),
            ("BACKGROUND", (0, 1), (-1, -1), WHITE),
            ("GRID", (0, 0), (-1, -1), 0.45, LINE),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]
    )
)
story += [credential_table, Spacer(1, 3 * mm)]
story += [
    box(
        P("<b>此專案已驗證的資料庫設定是 Session pooler，port 5432。</b>請勿自行改成 Transaction pooler（6543）或 Direct connection。Supabase 的 Legacy API Keys 預計在 2026 年底停用；若你的介面已拿不到 service_role，不要改拿 anon，先通知網站維護者更新專案設定。", "note"),
        AMBER_SOFT,
        colors.HexColor("#F1D28A"),
        padding=8,
    )
]
story.append(PageBreak())

# Page 3
story += [
    P("PART 02 / VERCEL & HANDOFF", "eyebrow"),
    P("加入 Production 環境變數並安全交接", "h1"),
    P("如果朋友已有 Vercel 專案權限，直接填入最安全；若沒有，優先邀請擁有者加入 Supabase，而不是把密鑰傳來傳去。", "small"),
    Spacer(1, 4 * mm),
    step_header(4, "在 Vercel 專案加入環境變數", "Vercel → 專案 → Settings → Environment Variables"),
    Spacer(1, 3 * mm),
]

vercel_table = Table(
    [
        [P("Name", "table_head"), P("Value", "table_head"), P("Environment", "table_head")],
        [P("<font name='Courier'><b>DATABASE_URL</b></font>", "table_body"), P("剛才取得的 Session pooler 連線字串", "table_body"), P("Production", "table_body")],
        [P("<font name='Courier'><b>SUPABASE_URL</b></font>", "table_body"), P("Project URL", "table_body"), P("Production", "table_body")],
        [P("<font name='Courier'><b>SUPABASE_SERVICE_ROLE_KEY</b></font>", "table_body"), P("service_role key（Sensitive）", "table_body"), P("Production", "table_body")],
        [P("<font name='Courier'><b>SUPABASE_BUCKET</b></font>", "table_body"), P("<font name='Courier'>media</font>", "table_body"), P("Production（建議一起加）", "table_body")],
    ],
    colWidths=[63 * mm, 67 * mm, 36 * mm],
    repeatRows=1,
)
vercel_table.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), INK),
            ("BACKGROUND", (0, 1), (-1, -1), WHITE),
            ("GRID", (0, 0), (-1, -1), 0.45, LINE),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]
    )
)
story += [vercel_table, Spacer(1, 4 * mm)]

story += [
    box(
        [
            P("不要覆蓋既有設定", "h2"),
            P("若 Vercel 內已經有 <font name='Courier'>SESSION_SECRET</font>、<font name='Courier'>ADMIN_PASSWORD_HASH</font>、<font name='Courier'>NEXT_PUBLIC_SITE_URL</font>，請保留。除非網站擁有者明確要求，朋友不需要更改這三項。", "note"),
        ],
        ACCENT_SOFT,
        colors.HexColor("#C8CCFF"),
        padding=9,
    ),
    Spacer(1, 3 * mm),
    P("加入後的自我檢查", "h2"),
    checklist(
        [
            "四個 Name 拼字完全一致，沒有多餘空格。",
            "DATABASE_URL 的 port 是 5432，而且連線字串內沒有 [YOUR-PASSWORD] 佔位文字。",
            "SUPABASE_SERVICE_ROLE_KEY 使用 service_role，不是 anon / publishable key。",
            "Environment 至少勾選 Production；儲存後 Vercel 畫面可看到四個變數名稱。",
            "Storage 裡的 media bucket 顯示為 Public。",
        ]
    ),
    Spacer(1, 4 * mm),
    P("安全交接（推薦順序）", "h2"),
]

handoff_rows = [
    [P("1", "table_head"), P("最好", "table_head"), P("邀請網站擁有者加入 Supabase 與 Vercel，讓對方自行查看；不傳送任何密鑰。", "table_body")],
    [P("2", "table_head"), P("可接受", "table_head"), P("使用具到期時間的一次性秘密連結或密碼管理器安全分享。", "table_body")],
    [P("3", "table_head"), P("不要", "table_head"), P("LINE / Messenger 群組、Email 明文、截圖、公開 Notion、GitHub、PDF 內寫入真實金鑰。", "table_body")],
]
handoff = Table(handoff_rows, colWidths=[12 * mm, 27 * mm, 127 * mm])
handoff.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (1, -1), INK),
            ("BACKGROUND", (2, 0), (2, -1), WHITE),
            ("GRID", (0, 0), (-1, -1), 0.45, LINE),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (0, 0), (1, -1), "CENTER"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]
    )
)
story += [handoff, Spacer(1, 5 * mm)]

story += [
    box(
        [
            P("可直接傳給網站擁有者的完成訊息", "h2"),
            P("「Supabase project 已建立；區域：＿＿＿＿；Storage 的 media bucket 已設為 Public；Vercel Production 四個環境變數已加入；我沒有在聊天中傳送任何 service_role 金鑰。接下來可以進行一次性遷移與重新部署。」", "note"),
        ],
        MINT_SOFT,
        colors.HexColor("#A5DECD"),
        padding=9,
    ),
    Spacer(1, 2 * mm),
    box(P("<b>朋友的工作到這裡結束。</b>不要執行資料庫遷移、不要刪除 bucket、不要按 Rotate / Revoke key，也不要自行重新部署。", "note"), RED_SOFT, colors.HexColor("#F1B4BD"), padding=9),
]
story.append(PageBreak())

# Page 4
story += [
    P("PART 03 / WEBSITE OWNER", "eyebrow"),
    P("網站維護者接手：遷移、部署與驗收", "h1"),
    P("以下不是朋友要做的事；這一頁讓雙方知道交接後會發生什麼。內容依專案 DEPLOY.md 與 ADMIN.md 整理。", "small"),
    Spacer(1, 4 * mm),
    P("A. 一次性遷移與重新部署", "h2"),
    P("網站維護者先把同三個值放進本機 <font name='Courier'>.env</font>，確認連線後，在專案根目錄依序執行：", "body"),
]

code = [
    P("npm run db:push", "code"),
    P("npm run db:seed", "code"),
    P("npx tsx scripts/import-assets.ts", "code"),
    P("npx vercel --prod", "code"),
]
story += [box(code, NAVY, colors.HexColor("#303951"), padding=10), Spacer(1, 4 * mm)]
story += [
    P("這四步會在 Supabase 建表、建立基本設定、把現有作品與 showreel 上傳到 media，最後重新部署正式站。遷移只需做一次。", "small"),
    Spacer(1, 4 * mm),
    P("B. 上線後驗收", "h2"),
    checklist(
        [
            "開啟 https://你的網址/admin/login，能用正式管理員密碼登入。",
            "到 Works 新增一個測試作品，上傳小型 MP4，封面與 4 秒 preview 能產生。",
            "在編輯器拉到想要的畫面，按 Use current frame as cover + preview。",
            "勾選 Published 並儲存；前台重新整理後能立即看到作品。",
            "到 Settings 上傳 showreel；首頁播放、封面與公開 URL 都正常。",
        ]
    ),
    Spacer(1, 4 * mm),
    P("C. 常見問題快速排查", "h2"),
]

trouble = Table(
    [
        [P("現象", "table_head"), P("先檢查", "table_head")],
        [P("資料庫連不上", "table_body"), P("DATABASE_URL 是否為 Session pooler、port 5432；是否仍有 [YOUR-PASSWORD]；資料庫密碼特殊字元是否已 URL encode。", "table_body")],
        [P("上傳出現 401 / 403", "table_body"), P("SUPABASE_SERVICE_ROLE_KEY 是否誤放 anon / publishable key；Vercel 是否勾 Production；儲存後是否已重新部署。", "table_body")],
        [P("影片 URL 404", "table_body"), P("bucket 名稱是否精確為 media，並且已設為 Public。", "table_body")],
        [P("後台有資料但前台看不到", "table_body"), P("作品是否勾 Published 並按 Save；瀏覽器可用 Cmd+Shift+R 強制重新整理。", "table_body")],
    ],
    colWidths=[43 * mm, 123 * mm],
    repeatRows=1,
)
trouble.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), INK),
            ("BACKGROUND", (0, 1), (-1, -1), WHITE),
            ("GRID", (0, 0), (-1, -1), 0.45, LINE),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]
    )
)
story += [trouble, Spacer(1, 5 * mm)]

story += [
    P("官方參考資料", "h2"),
    P("• Supabase｜Connect to your database：<link href='https://supabase.com/docs/guides/database/connecting-to-postgres' color='#4145CA'>supabase.com/docs/guides/database/connecting-to-postgres</link>", "link"),
    P("• Supabase｜Understanding API keys：<link href='https://supabase.com/docs/guides/getting-started/api-keys' color='#4145CA'>supabase.com/docs/guides/getting-started/api-keys</link>", "link"),
    P("• Supabase｜Storage Quickstart：<link href='https://supabase.com/docs/guides/storage/quickstart' color='#4145CA'>supabase.com/docs/guides/storage/quickstart</link>", "link"),
    Spacer(1, 3 * mm),
    HRFlowable(width="100%", thickness=0.5, color=LINE),
    Spacer(1, 3 * mm),
    P("最後提醒：若 service_role 曾被貼到公開畫面、公開 repo 或多人聊天室，請立刻視為已外洩，通知網站維護者更換金鑰並重新部署。", "small"),
]

OUT.parent.mkdir(parents=True, exist_ok=True)
doc.build(story)
print(OUT)
