import { test, expect } from '@playwright/test';

test.describe('Kiểm tra chức năng Đăng ký', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  // --- CASE 1: KIỂM TRA BẮT LỖI NHẬP LIỆU (VALIDATION CLIENT) ---
  test('Báo lỗi khi nhập dữ liệu không hợp lệ', async ({ page }) => {
    // 1. Mật khẩu xác nhận không khớp
    await page.fill('#username', 'UserTestVal');
    await page.fill('#email', 'valid@test.com');
    await page.fill('#password', '123456');
    await page.fill('#confirmPassword', '654321'); // Nhập sai
    
    await page.click('button[type="submit"]');
    
    // [SỬA LỖI TẠI ĐÂY]: Đổi .error-message thành .field-error
    // Vì lỗi này hiển thị ngay dưới ô input
    await expect(page.locator('.field-error')).toContainText('Mật khẩu xác nhận không khớp');

    // 2. Email sai định dạng
    await page.fill('#confirmPassword', '123456'); // Sửa lại pass đúng
    await page.fill('#email', 'email_sai_ne');     // Nhập email sai
    await page.click('button[type="submit"]');
    
    // [SỬA LỖI TẠI ĐÂY]: Đổi thành .field-error
    await expect(page.locator('.field-error')).toContainText('Email không đúng định dạng');

    // 3. Tên chứa ký tự đặc biệt
    await page.fill('#email', 'dung@test.com');    // Sửa lại email đúng
    await page.fill('#username', 'User@!!!');      // Tên sai
    await page.click('button[type="submit"]');
    
    // [SỬA LỖI TẠI ĐÂY]: Đổi thành .field-error
    await expect(page.locator('.field-error')).toContainText('Username không được chứa ký tự đặc biệt');
  });

  // --- CASE 2: ĐĂNG KÝ THÀNH CÔNG (HAPPY PATH) ---
  test('Đăng ký thành công với dữ liệu hợp lệ', async ({ page }) => {
    const shortId = Math.floor(Math.random() * 90000) + 1000;
    const randomUser = `UserSuccess${shortId}`;
    const randomEmail = `success${shortId}@test.com`;

    await page.fill('#username', randomUser);
    await page.fill('#email', randomEmail);
    await page.fill('#password', '123456');
    await page.fill('#confirmPassword', '123456');

    // Xử lý Alert "Đăng ký thành công"
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Đăng ký thành công');
      await dialog.accept();
    });

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/login/);
  });

  // --- CASE 3: LỖI TRÙNG TÀI KHOẢN (BACKEND) ---
  test('Báo lỗi khi tài khoản đã tồn tại', async ({ page }) => {
    const shortId = Math.floor(Math.random() * 90000) + 1000;
    const fixedUser = `DupUser${shortId}`;
    const fixedEmail = `dup${shortId}@test.com`;

    // Lần 1: Tạo trước
    await page.fill('#username', fixedUser);
    await page.fill('#email', fixedEmail);
    await page.fill('#password', '123456');
    await page.fill('#confirmPassword', '123456');
    page.once('dialog', dialog => dialog.accept());
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/login/);

    // Lần 2: Thử lại y chang
    await page.goto('/register');
    await page.fill('#username', fixedUser);
    await page.fill('#email', fixedEmail);
    await page.fill('#password', '123456');
    await page.fill('#confirmPassword', '123456');

    await page.click('button[type="submit"]');

    // [GIỮ NGUYÊN]: Lỗi từ Server vẫn dùng class .error-message
    await expect(page.locator('.error-message')).toContainText('Username hoặc email đã tồn tại');
  });

});