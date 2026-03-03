import { test, expect } from "@playwright/test";

test.describe("Kiểm tra chức năng tài khoản", () => {
  const currentPassword = "testtest";

  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/profile");
  });

  test("Cập nhật thông tin cá nhân thành công", async ({ page }) => {
    await page.click('button:has-text("Chỉnh sửa")');

    const nameInput = page.locator('input[name="full_name"]');
    await expect(nameInput).toBeEnabled();

    // Random tên với sđt
    const newName = `Test Name ${Math.floor(Math.random() * 1000)}`;
    const newPhone = `09${Math.floor(Math.random() * 100000000)}`;

    await nameInput.fill(newName);
    await page.fill('input[name="phone_number"]', newPhone);

    await page.click('button:has-text("Lưu thay đổi")');

    await expect(page.locator(".message.success")).toContainText(
      "Cập nhật thông tin thành công",
    );

    await page.waitForTimeout(1500);
    const reloadedNameInput = page.locator('input[name="full_name"]');
    await expect(reloadedNameInput).toHaveValue(newName);
  });

  test("Báo lỗi khi nhập sai dữ liệu", async ({ page }) => {
    await page.click('button:has-text("Chỉnh sửa")');

    // Bỏ trống tên
    await page.fill('input[name="full_name"]', "");
    await page.click('button:has-text("Lưu thay đổi")');

    await expect(page.locator(".message.error")).toContainText(
      "Họ tên phải có ít nhất 2 ký tự",
    );

    // Test sđt sai
    await page.fill('input[name="full_name"]', "Cho Do");
    await page.fill('input[name="phone_number"]', "docaobang");
    await page.click('button:has-text("Lưu thay đổi")');

    await expect(page.locator(".message.error")).toContainText(
      "Số điện thoại phải có 10 chữ số",
    );
  });

  test("Nút Hủy sẽ reset dữ liệu về ban đầu", async ({ page }) => {
    const nameInput = page.locator('input[name="full_name"]');
    await page.waitForTimeout(1000);
    const originalName = await nameInput.inputValue();

    await page.click('button:has-text("Chỉnh sửa")');

    await nameInput.fill("Cho Do");
    await page.click('button:has-text("Hủy")');

    await expect(nameInput).toBeDisabled();
    await expect(nameInput).toHaveValue(originalName);
  });

  test("Báo lỗi khi mật khẩu mới quá ngắn", async ({ page }) => {
    await page.fill('input[name="old_password"]', currentPassword);
    await page.fill('input[name="new_password"]', "12345");
    await page.fill('input[name="confirm_password"]', "12345");

    await page.click('button:has-text("Đổi mật khẩu")');

    await expect(page.locator(".message.error")).toContainText(
      "Mật khẩu mới phải có ít nhất 6 ký tự",
    );
  });

  test("Báo lỗi khi mật khẩu xác nhận không khớp", async ({ page }) => {
    await page.fill('input[name="old_password"]', currentPassword);
    await page.fill('input[name="new_password"]', "newpass123");
    await page.fill('input[name="confirm_password"]', "wrongpass");

    await page.click('button:has-text("Đổi mật khẩu")');

    await expect(page.locator(".message.error")).toContainText(
      "Mật khẩu xác nhận không khớp!",
    );
  });

  test("Báo lỗi từ Server nếu mật khẩu cũ không đúng", async ({ page }) => {
    await page.fill('input[name="old_password"]', "SaiMatKhauRoi");
    await page.fill('input[name="new_password"]', "newpass123");
    await page.fill('input[name="confirm_password"]', "newpass123");

    await page.click('button:has-text("Đổi mật khẩu")');

    await expect(page.locator(".message.error")).toBeVisible();
  });

  test("Giả lập Đổi mật khẩu thành công (Dùng API)", async ({ page }) => {
    await page.route("**/users/*", async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ message: "Đổi mật khẩu thành công" }),
        });
      } else {
        await route.continue();
      }
    });

    await page.fill('input[name="old_password"]', currentPassword);
    await page.fill('input[name="new_password"]', "newpass123");
    await page.fill('input[name="confirm_password"]', "newpass123");

    await page.click('button:has-text("Đổi mật khẩu")');

    await expect(page.locator(".message.success")).toContainText(
      "Đổi mật khẩu thành công!",
    );
  });
});
