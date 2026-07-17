// 用法:npx tsx scripts/hash-password.ts "你的密碼"
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error('用法:npx tsx scripts/hash-password.ts "你的密碼"');
  process.exit(1);
}
console.log("把下面這行放進 .env:");
console.log(`ADMIN_PASSWORD_HASH="${bcrypt.hashSync(password, 12)}"`);
