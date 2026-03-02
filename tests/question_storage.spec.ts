import { test, expect } from "@playwright/test";

test.describe("Kiểm tra chức năng Thư viện câu hỏi (Question Storage)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/questions");
  });

  test("Hiển thị giao diện Thư viện và Bộ lọc thành công", async ({ page }) => {
    await expect(page.locator("h2")).toContainText("Thư viện câu hỏi của tôi");

    // Kiểm tra bộ lọc (FilterBar) có xuất hiện không
    const searchInput = page.locator(
      'input[placeholder="Tìm kiếm theo từ khóa..."]',
    );
    await expect(searchInput).toBeVisible();

    const statusSelect = page.locator("select").first(); // Ô chọn Trạng thái
    await expect(statusSelect).toBeVisible();
  });

  test("Thực hiện Lọc câu hỏi", async ({ page }) => {
    // 1. Nhập từ khóa
    await page.fill(
      'input[placeholder="Tìm kiếm theo từ khóa..."]',
      "Giảng viên hướng dẫn của đề tài này tên là gì?",
    );

    // 2. Chọn trạng thái "Đạt chuẩn" (giá trị trong select là 'accepted')
    // Lưu ý: Cần chắc chắn value này khớp với code FilterBar.jsx của bạn
    await page.selectOption('select:has-text("Tất cả trạng thái")', "accepted");

    // 3. Bấm nút Tìm kiếm
    await page.click('button:has-text("Áp dụng bộ lọc")');

    // Chờ 1 chút để API (hoặc UI) cập nhật
    await page.waitForTimeout(1000);

    // Kiểm tra xem dòng thông báo tổng số câu hỏi có xuất hiện không
    await expect(page.locator(".page-header p")).toContainText("Hiển thị:");
  });

  test("Giả lập Xóa câu hỏi (Mock API)", async ({ page }) => {
    // 1. Chặn request DELETE tới API để không xóa mất dữ liệu thật
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

    // 2. Tự động bấm "OK" khi hộp thoại Confirm của trình duyệt hiện lên
    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Bạn có chắc muốn xóa câu hỏi này?");
      await dialog.accept();
    });

    // 3. Bấm vào nút "Xóa" ở câu hỏi ĐẦU TIÊN trong danh sách
    const firstDeleteBtn = page.locator('button:has-text("Xóa")').first();

    // Kiểm tra xem có câu hỏi nào để xóa không (nếu danh sách trống thì bỏ qua)
    if (await firstDeleteBtn.isVisible()) {
      await firstDeleteBtn.click();

      // Vì là Mock API và React sẽ gọi lại hàm fetchQuestions(),
      // chúng ta chỉ cần đảm bảo không có lỗi văng ra là test case pass.
      await page.waitForTimeout(1000);
    }
  });

  test("Mở Modal Sửa câu hỏi và đóng lại", async ({ page }) => {
    // Lấy nút "Sửa" đầu tiên
    const firstEditBtn = page.locator('button:has-text("Sửa")').first();

    if (await firstEditBtn.isVisible()) {
      await firstEditBtn.click();

      // Kiểm tra Modal có hiện lên không (dựa vào class modal-content hoặc h3)
      const modalHeader = page.locator(".modal-header h3");
      await expect(modalHeader).toContainText("Chỉnh sửa Câu hỏi");

      // Bấm nút Hủy để đóng Modal
      await page.click('button:has-text("Hủy")');

      // Đảm bảo Modal đã biến mất
      await expect(modalHeader).toBeHidden();
    }
  });
});
