import { test, expect } from "@playwright/test";
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Kiểm tra chức năng Đăng ký", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("Báo lỗi khi nhập dữ liệu không hợp lệ", async ({ page }) => {
    // Test Confirm pass bị sai
    await page.fill("#username", "UserTestVal");
    await page.fill("#email", "valid@test.com");
    await page.fill("#password", "123456");
    await page.fill("#confirmPassword", "654321");

    await page.click('button[type="submit"]');
    await expect(page.locator(".field-error")).toContainText(
      "Mật khẩu xác nhận không khớp",
    );

    // Test Gõ email tào lao
    await page.fill("#confirmPassword", "123456"); // Chữa lại pass cho đúng
    await page.fill("#email", "email_sai_ne");
    await page.click('button[type="submit"]');

    await expect(page.locator(".field-error")).toContainText(
      "Email không đúng định dạng",
    );

    // Test Tên có ký tự lạ
    await page.fill("#email", "dung@test.com"); // Chữa lại email
    await page.fill("#username", "User@!!!");
    await page.click('button[type="submit"]');

    await expect(page.locator(".field-error")).toContainText(
      "Username không được chứa ký tự đặc biệt",
    );
  });

  test("Đăng ký thành công với dữ liệu hợp lệ", async ({ page }) => {
    // Random user để reg không bị trùng
    const shortId = Math.floor(Math.random() * 90000) + 1000;
    const randomUser = `UserSuccess${shortId}`;
    const randomEmail = `success${shortId}@test.com`;

    await page.fill("#username", randomUser);
    await page.fill("#email", randomEmail);
    await page.fill("#password", "123456");
    await page.fill("#confirmPassword", "123456");

    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Đăng ký thành công");
      await dialog.accept();
    });

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/login/);
  });

  test("Báo lỗi khi tài khoản đã tồn tại", async ({ page }) => {
    const shortId = Math.floor(Math.random() * 90000) + 1000;
    const fixedUser = `DupUser${shortId}`;
    const fixedEmail = `dup${shortId}@test.com`;

    await page.fill("#username", fixedUser);
    await page.fill("#email", fixedEmail);
    await page.fill("#password", "123456");
    await page.fill("#confirmPassword", "123456");
    page.once("dialog", (dialog) => dialog.accept());
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/register");
    await page.fill("#username", fixedUser);
    await page.fill("#email", fixedEmail);
    await page.fill("#password", "123456");
    await page.fill("#confirmPassword", "123456");

    await page.click('button[type="submit"]');

    await expect(page.locator(".error-message")).toContainText(
      "Username hoặc email đã tồn tại",
    );
  });

  test("Báo lỗi khi độ dài thông tin không đạt yêu cầu", async ({ page }) => {
    await page.fill("#username", "A");
    await page.fill("#email", "test@gmail.com");
    await page.fill("#password", "123");
    await page.fill("#confirmPassword", "123");

    await page.click('button[type="submit"]');

    await expect(page.locator(".field-error").first()).toContainText(
      "Username phải có ít nhất 2 ký tự",
    );
    await expect(page.locator(".field-error").nth(1)).toContainText(
      "Mật khẩu phải có ít nhất 6 ký tự",
    );
  });
});
