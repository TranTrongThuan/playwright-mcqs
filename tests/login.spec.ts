import { test, expect } from "@playwright/test";
// Xóa session cũ để test login từ đầu
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Test Đăng nhập", () => {
  // Acc test
  const FIXED_USER = {
    username: "Test100",
    password: "testtest",
  };

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("Báo lỗi khi bỏ trống thông tin", async ({ page }) => {
    // Để trống
    await page.click('button[type="submit"]');

    // Lỗi username
    await expect(page.locator(".field-error").first()).toContainText(
      "Vui lòng nhập tên đăng nhập",
    );

    // Lỗi password
    await expect(page.locator(".field-error").nth(1)).toContainText(
      "Vui lòng nhập mật khẩu",
    );
  });

  test("Nhập sai mật khẩu", async ({ page }) => {
    await page.fill("#username", FIXED_USER.username);
    await page.fill("#password", "mat_khau_tum_lum");

    await page.click('button[type="submit"]');

    await expect(page.locator(".error-message")).toContainText(
      "Sai tên đăng nhập hoặc mật khẩu",
    );
  });

  test("Tài khoản không tồn tại", async ({ page }) => {
    await page.fill("#username", "User_Ao_Ma_Canada");
    await page.fill("#password", "123456");

    await page.click('button[type="submit"]');

    await expect(page.locator(".error-message")).toContainText(
      "Sai tên đăng nhập hoặc mật khẩu",
    );
  });

  test("Đăng nhập thành công", async ({ page }) => {
    await page.fill("#username", FIXED_USER.username);
    await page.fill("#password", FIXED_USER.password);

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard\/agent/);
  });
});
