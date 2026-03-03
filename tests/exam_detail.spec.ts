import { test, expect } from "@playwright/test";

test.describe("Xem điểm và xuất file PDF", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/exams");
  });

  test("Xem điểm của đề thi", async ({ page }) => {
    // Click vô đề thi đầu tiên thấy được trên list
    const firstExamCard = page.locator("text=/Đề thi tự động.*/i").first();
    await expect(firstExamCard).toBeVisible();
    await firstExamCard.click();

    await page.waitForURL(/\/dashboard\/exams\/\d+/);

    const viewResultsBtn = page.locator("button", {
      hasText: /Xem \d+ kết quả/,
    });
    await expect(viewResultsBtn).toBeVisible();
    await viewResultsBtn.click();

    const closeBtn = page.locator(".modal-close-button");
    const isModalOpen = await closeBtn.isVisible({ timeout: 2000 });

    if (isModalOpen) {
      await expect(closeBtn).toBeVisible();
    } else {
      expect(page.url()).not.toMatch(/\/dashboard\/exams\/\d+$/);
    }
  });

  test("Xuất PDF của đề thi", async ({ page }) => {
    test.setTimeout(60000);

    const firstExamCard = page.locator("text=/Đề thi tự động.*/i").first();
    await expect(firstExamCard).toBeVisible();
    await firstExamCard.click();

    await page.waitForURL(/\/dashboard\/exams\/\d+/);

    await page.waitForSelector('button:has-text("Xuất ra PDF")');

    const downloadPromise = page.waitForEvent("download", { timeout: 45000 });
    await page.click('button:has-text("Xuất ra PDF")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain(".pdf");
  });
});
