// tests/exam_flow.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Luồng Tạo đề thi và Làm bài online (E2E)", () => {
  test("Thầy giáo tạo đề -> Học sinh khách vào làm bài -> Xem điểm", async ({
    page,
    browser,
  }) => {
    // ==========================================
    // 👨‍🏫 VAI TRÒ 1: THẦY GIÁO (Đã đăng nhập qua storageState)
    // ==========================================
    console.log("👉 BƯỚC 1: Thầy giáo bắt đầu tạo đề thi...");

    // 1. Vào thẳng trang Tạo đề thi mới
    await page.goto("/dashboard/exams/new");

    // 2. Điền Tiêu đề và Mô tả
    const timestamp = Date.now();
    await page.fill(
      'input[placeholder="Ví dụ: Đề kiểm tra giữa kỳ..."]',
      `Đề thi tự động - ${timestamp}`,
    );
    await page.fill(
      'textarea[placeholder="Ví dụ: Đề thi này bao gồm 3 chương đầu..."]',
      "Đây là đề thi được tạo ra tự động bởi Playwright để test luồng E2E.",
    );

    // 3. Đợi load danh sách câu hỏi THẬT từ database
    const questionCards = page.locator(".question-select-item");
    await questionCards.first().waitFor({ state: "visible", timeout: 10000 });

    const questionCount = await questionCards.count();
    expect(
      questionCount,
      "Lỗi: Tài khoản của bạn chưa có câu hỏi nào trong Thư viện!",
    ).toBeGreaterThan(0);

    // 4. Chọn câu hỏi (Click thẳng vào khung div)
    await questionCards.nth(0).click(); // Chọn câu 1
    if (questionCount >= 2) {
      await questionCards.nth(1).click(); // Chọn thêm câu 2 (nếu có)
    }

    // 5. TRICK MẠNG: Lắng nghe API trả về để "bắt" lấy share_token
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/exams") &&
        response.request().method() === "POST" &&
        response.status() === 200, // <-- THÊM DÒNG NÀY: Chỉ bắt response thành công
    );

    // 6. Bấm Lưu đề thi
    await page.click('button:has-text("Lưu đề thi")');

    // 7. Bóc tách share_token từ response của backend
    const response = await responsePromise;
    const responseData = await response.json();
    const shareToken = responseData.share_token;

    expect(shareToken).toBeTruthy(); // Đảm bảo token đã được sinh ra
    console.log(`✅ Thầy giáo đã tạo xong! Link đề thi: /take/${shareToken}`);

    // Đợi UI chuyển về trang danh sách đề thi cho chuẩn
    await expect(page).toHaveURL(/\/dashboard\/exams/);

    // ==========================================
    // 🧑‍🎓 VAI TRÒ 2: HỌC SINH KHÁCH (Dùng Trình duyệt ẩn danh)
    // ==========================================
    console.log("👉 BƯỚC 2: Học sinh khách bắt đầu vào làm bài...");

    // 1. Lấy baseURL hiện tại (tránh lỗi trình duyệt ẩn danh bị lạc đường nếu dùng đường dẫn tương đối)
    const currentBaseURL = new URL(page.url()).origin;

    // TẠO CONTEXT MỚI & ÉP XÓA SẠCH TOKEN (Đây chính là chìa khóa!)
    const studentContext = await browser.newContext({
      baseURL: currentBaseURL,
      storageState: { cookies: [], origins: [] }, // <-- Xóa sạch trạng thái đăng nhập của Thầy giáo
    });
    const studentPage = await studentContext.newPage();

    // 2. Truy cập vào link đề thi bằng share_token
    await studentPage.goto(`/take/${shareToken}`);

    // 3. Trang Bắt đầu: Nhập tên khách và bấm làm bài
    await studentPage.waitForSelector("#guest-name");
    await studentPage.fill("#guest-name", "Học sinh Automation");
    await studentPage.click('button:has-text("Bắt đầu làm bài")');

    // 4. Đợi URL chuyển sang phòng thi (/session/...)
    await studentPage.waitForURL(/\/session\/\d+/);
    console.log("✅ Học sinh đã vào phòng thi!");

    // 5. Lấy danh sách các câu hỏi đang hiển thị trên màn hình
    const takerQuestionCards = studentPage.locator(".taker-question-card");
    await takerQuestionCards.first().waitFor({ state: "visible" });

    const cardCount = await takerQuestionCards.count();

    // 6. Tự động đánh lụi ĐÁP ÁN ĐẦU TIÊN (Option A) cho tất cả các câu hỏi
    for (let i = 0; i < cardCount; i++) {
      // Tìm đáp án đầu tiên (.option-label) của câu hỏi thứ i và click
      await takerQuestionCards.nth(i).locator(".option-label").first().click();
    }

    // 7. Bấm Nộp bài
    studentPage.once("dialog", async (dialog) => {
      console.log(
        `💬 Trình duyệt hỏi: "${dialog.message()}" -> Đã tự động bấm OK!`,
      );
      await dialog.accept();
    });

    // SAU KHI giăng bẫy xong mới bắt đầu click nút
    await studentPage.click('button:has-text("Nộp bài")');
    console.log("✅ Học sinh đã bấm nút Nộp bài!");

    // 8. Đợi trang Kết quả load xong (/results/...)
    await studentPage.waitForURL(/\/results\/\d+/);

    // 9. Kiểm tra xem điểm số có hiển thị không
    await expect(studentPage.locator("h2")).toContainText("Kết quả bài thi");
    const scoreElement = studentPage.locator(".final-score");
    await expect(scoreElement).toBeVisible();

    const scoreText = await scoreElement.innerText();
    console.log(`🎉 HOÀN TẤT! Điểm số của học sinh là: ${scoreText}`);

    // Đóng tab của học sinh sau khi thi xong
    await studentContext.close();
  });
});
