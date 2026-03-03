import { test, expect } from "@playwright/test";

test.describe("Kiểm tra chức năng thư viên câu hỏi", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/questions");
  });

  test("Thực hiện Lọc câu hỏi", async ({ page }) => {
    await page.fill(
      'input[placeholder="Tìm kiếm theo từ khóa..."]',
      "Giảng viên hướng dẫn của đề tài này tên là gì?",
    );

    await page.selectOption(
      'select:has-text("Tất cả các file")',
      "Báo cáo tiến độ tuần 1 TranTrongThuan.pdf",
    );
    await page.selectOption('select:has-text("Tất cả trạng thái")', "accepted");

    await page.click('button:has-text("Áp dụng bộ lọc")');

    await page.waitForTimeout(1000);

    await expect(page.locator(".page-header p")).toContainText("Hiển thị:");
  });

  test("Giả lập Xóa câu hỏi (Mock API)", async ({ page }) => {
    // Mock API trả về Xóa thành công
    await page.route("**/questions/*", async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ message: "Xóa thành công" }),
        });
      } else {
        await route.continue();
      }
    });

    // Bắt hộp thoại xác nhận xóa
    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Bạn có chắc muốn xóa câu hỏi này?");
      await dialog.accept();
    });

    const firstDeleteBtn = page.locator('button:has-text("Xóa")').first();

    if (await firstDeleteBtn.isVisible()) {
      await firstDeleteBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test("Giả lập Sửa câu hỏi (Mock API)", async ({ page }) => {
    // Mock API trả về Cập nhật thành công
    await page.route("**/questions/*", async (route) => {
      if (
        route.request().method() === "PUT" ||
        route.request().method() === "PATCH"
      ) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ message: "Cập nhật thành công" }),
        });
      } else {
        await route.continue();
      }
    });

    const firstEditBtn = page.locator('button:has-text("Sửa")').first();

    if (await firstEditBtn.isVisible()) {
      await firstEditBtn.click();

      const modalHeader = page.locator(".edit-modal-header");
      await expect(modalHeader).toBeVisible();

      const questionInput = page.locator('textarea[name="question_text"]');
      await questionInput.fill(
        "Nội dung câu hỏi đã được Playwright tự động sửa!",
      );

      const firstOptionInput = page.locator(".edit-option-input").first();
      await firstOptionInput.fill("A. Đáp án này đã được tự động cập nhật");

      await page.click('button:has-text("Lưu thay đổi")');

      await expect(modalHeader).toBeHidden({ timeout: 5000 });
    }
  });
});
