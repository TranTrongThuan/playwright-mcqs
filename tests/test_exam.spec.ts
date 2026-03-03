import { test, expect } from "@playwright/test";

test.describe("Tạo đề thi và làm bài", () => {
  test("Admin tạo đề -> Học sinh vào làm bài -> Xem điểm", async ({
    page,
    browser,
  }) => {
    await page.goto("/dashboard/exams/new");

    const timestamp = Date.now();
    await page.fill(
      'input[placeholder="Ví dụ: Đề kiểm tra giữa kỳ..."]',
      `Đề thi tự động - ${timestamp}`,
    );
    await page.fill(
      'textarea[placeholder="Ví dụ: Đề thi này bao gồm 3 chương đầu..."]',
      "Đề test tự động nha.",
    );

    const questionCards = page.locator(".question-select-item");
    await questionCards.first().waitFor({ state: "visible", timeout: 10000 });

    const questionCount = await questionCards.count();
    expect(
      questionCount,
      "Lỗi: Tài khoản của bạn chưa có câu hỏi nào trong Thư viện!",
    ).toBeGreaterThan(0);

    await questionCards.nth(0).click();
    if (questionCount >= 2) {
      await questionCards.nth(1).click();
    }

    // Lấy share_token
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/exams") &&
        response.request().method() === "POST" &&
        response.status() === 200,
    );

    await page.click('button:has-text("Lưu đề thi")');

    // Lấy token từ response
    const response = await responsePromise;
    const responseData = await response.json();
    const shareToken = responseData.share_token;

    expect(shareToken).toBeTruthy();
    console.log(`Tạo xong! Link: /take/${shareToken}`);

    await expect(page).toHaveURL(/\/dashboard\/exams/);

    // --- HỌC SINH ---

    const currentBaseURL = new URL(page.url()).origin;

    const studentContext = await browser.newContext({
      baseURL: currentBaseURL,
      storageState: { cookies: [], origins: [] },
    });
    const studentPage = await studentContext.newPage();

    // Dùng cái token nãy lấy được vô thi
    await studentPage.goto(`/take/${shareToken}`);

    await studentPage.waitForSelector("#guest-name");
    await studentPage.fill("#guest-name", "Học sinh Automation");
    await studentPage.click('button:has-text("Bắt đầu làm bài")');

    await studentPage.waitForURL(/\/session\/\d+/);
    console.log("Đã nhảy vô phòng thi!");

    const takerQuestionCards = studentPage.locator(".taker-question-card");
    await takerQuestionCards.first().waitFor({ state: "visible" });

    const cardCount = await takerQuestionCards.count();

    for (let i = 0; i < cardCount; i++) {
      await takerQuestionCards.nth(i).locator(".option-label").first().click();
    }

    studentPage.once("dialog", async (dialog) => {
      await dialog.accept();
    });

    await studentPage.click('button:has-text("Nộp bài")');
    console.log("Nộp bài xong!");

    await studentPage.waitForURL(/\/results\/\d+/);

    await expect(studentPage.locator("h2")).toContainText("Kết quả bài thi");
    const scoreElement = studentPage.locator(".final-score");
    await expect(scoreElement).toBeVisible();

    const scoreText = await scoreElement.innerText();
    console.log(`Điểm đây: ${scoreText}`);

    await studentContext.close();
  });
});
