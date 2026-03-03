import { test, expect } from "@playwright/test";

test.describe("Kiểm tra chức năng thư viên câu hỏi", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/questions");
  });

  test("Hiển thị giao diện Thư viện và Bộ lọc thành công", async ({ page }) => {
    await expect(page.locator("h2")).toContainText("Thư viện câu hỏi của tôi");

    const searchInput = page.locator(
      'input[placeholder="Tìm kiếm theo từ khóa..."]',
    );
    await expect(searchInput).toBeVisible();

    const statusSelect = page.locator("select").first();
    await expect(statusSelect).toBeVisible();
  });

  test("Thực hiện Lọc câu hỏi", async ({ page }) => {
    await page.fill(
      'input[placeholder="Tìm kiếm theo từ khóa..."]',
      "Giảng viên hướng dẫn của đề tài này tên là gì?",
    );

    await page.selectOption('select:has-text("Tất cả trạng thái")', "accepted");

    await page.click('button:has-text("Áp dụng bộ lọc")');

    await page.waitForTimeout(1000);

    await expect(page.locator(".page-header p")).toContainText("Hiển thị:");
  });

  test("Giả lập Xóa câu hỏi (Mock API)", async ({ page }) => {
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

  test("Mở Modal Sửa câu hỏi và đóng lại", async ({ page }) => {
    const firstEditBtn = page.locator('button:has-text("Sửa")').first();

    if (await firstEditBtn.isVisible()) {
      await firstEditBtn.click();

      const modalHeader = page.locator(".modal-header h3");
      await expect(modalHeader).toContainText("Chỉnh sửa Câu hỏi");

      await page.click('button:has-text("Hủy")');

      await expect(modalHeader).toBeHidden();
    }
  });
});
