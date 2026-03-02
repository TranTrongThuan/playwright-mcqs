// tests/auth.setup.ts
import { test as setup, expect } from "@playwright/test";
import path from "path";

// Đường dẫn file lưu trữ trạng thái đăng nhập
const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("Authenticate (Đăng nhập 1 lần)", async ({ page }) => {
  // Thay thế bằng user dùng chung cho toàn bộ quá trình test
  const TEST_USER = {
    username: "Test100",
    password: "testtest",
  };

  await page.goto("/login");

  // Thực hiện các thao tác đăng nhập
  await page.fill("#username", TEST_USER.username);
  await page.fill("#password", TEST_USER.password);
  await page.click('button[type="submit"]');

  // Đợi cho đến khi trang chuyển hướng thành công về dashboard
  await page.waitForURL(/\/dashboard/);

  // Quan trọng nhất: Lưu lại trạng thái (LocalStorage, Cookies...) vào file
  await page.context().storageState({ path: authFile });
});
