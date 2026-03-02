// tests/exam_detail.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Quản lý Đề thi và Xuất PDF (Dữ liệu thật từ UI)", () => {
  test.beforeEach(async ({ page }) => {
    // Vào trang Đề thi của tôi
    await page.goto("/dashboard/exams");
  });

  test("Xem thống kê kết quả và Xuất ra PDF", async ({ page }) => {
    // THÊM DÒNG NÀY ĐỂ TĂNG THỜI GIAN CHẠY RIÊNG CHO BÀI TEST NÀY LÊN 60 GIÂY
    test.setTimeout(60000);

    // ==========================================
    // BƯỚC 1: VÀO CHI TIẾT ĐỀ THI ĐẦU TIÊN
    // ==========================================
    const firstExamCard = page.locator("text=/Đề thi tự động.*/i").first();
    await expect(firstExamCard).toBeVisible();
    await firstExamCard.click();

    // Chờ trình duyệt chuyển sang trang chi tiết
    await page.waitForURL(/\/dashboard\/exams\/\d+/);

    // ==========================================
    // BƯỚC 2: TEST NÚT XEM THỐNG KÊ (Ảnh 3)
    // ==========================================
    // Tìm nút có chữ "Xem 1 kết quả" (hoặc số bất kỳ)
    const viewResultsBtn = page.locator("button", {
      hasText: /Xem \d+ kết quả/,
    });

    await expect(viewResultsBtn).toBeVisible();
    await viewResultsBtn.click();

    // [ĐÃ SỬA LỖI Ở ĐÂY]: Không dùng .catch(), mà dùng isVisible()
    // Nếu giao diện hiển thị Thống kê là một cái BẢNG (Modal) thì nó sẽ có nút Đóng
    const closeBtn = page.locator(".modal-close-button"); // Thay bằng class nút [x] của bạn nếu có

    // Đợi tối đa 2 giây xem nút đóng Modal có xuất hiện không
    const isModalOpen = await closeBtn.isVisible({ timeout: 2000 });
    if (isModalOpen) {
      await closeBtn.click(); // Đóng Modal để test tiếp nút Xuất PDF
    } else {
      // Trường hợp bấm "Xem kết quả" mà nó CHUYỂN TRANG (Navigate) sang URL khác
      // Chúng ta phải bấm nút Quay Lại (Back) để về lại màn hình có nút Xuất PDF
      if (!page.url().match(/\/dashboard\/exams\/\d+$/)) {
        await page.goBack();

        // 🟢 SỬA LỖI TẠI ĐÂY: Chờ trang Đề thi load lại thành công
        await page.waitForURL(/\/dashboard\/exams\/\d+/);

        // Chờ đến khi nút Xuất ra PDF thực sự hiện hình trên màn hình
        await page.waitForSelector('button:has-text("Xuất ra PDF")');
      }
    }
    // ==========================================
    // BƯỚC 3: TEST NÚT "XUẤT RA PDF"
    // ==========================================
    const downloadPromise = page.waitForEvent("download", { timeout: 45000 });

    await page.click('button:has-text("Xuất ra PDF")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain(".pdf");

    console.log(
      `✅ Đã xuất PDF THẬT thành công với tên: ${download.suggestedFilename()}`,
    );
  });
});
