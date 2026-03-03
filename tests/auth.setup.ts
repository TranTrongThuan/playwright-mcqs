import { test as setup, expect } from "@playwright/test";
import path from "path";

// Lưu session login
const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("Authenticate (Đăng nhập 1 lần)", async ({ page }) => {
  // Acc test
  const TEST_USER = {
    username: "Test100",
    password: "testtest",
  };

  await page.goto("/login");

  // Login
  await page.fill("#username", TEST_USER.username);
  await page.fill("#password", TEST_USER.password);
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/dashboard/);

  // Lưu ra file
  await page.context().storageState({ path: authFile });
});
