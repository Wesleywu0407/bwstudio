import { redirect } from "next/navigation";

// /admin 沒有自己的畫面:一律轉到作品列表。
// (未登入者已由 middleware 導去 /admin/login)
export default function AdminIndex() {
  redirect("/admin/works");
}
