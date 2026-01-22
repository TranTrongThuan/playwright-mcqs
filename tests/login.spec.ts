import { test, expect } from '@playwright/test';

test.describe('Test Đăng nhập (Dùng tài khoản có sẵn)', () => {

  // --- CẤU HÌNH TÀI KHOẢN CÓ SẴN ---
  // Bạn hãy sửa lại thông tin này cho khớp với DB của bạn
  const FIXED_USER = {
    username: 'Test100', 
    password: 'testtest'
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  // --- CASE 1: KIỂM TRA VALIDATION RỖNG (CLIENT-SIDE) ---
  test('Báo lỗi chữ đỏ khi bỏ trống thông tin', async ({ page }) => {
    // Không nhập gì cả, bấm Đăng nhập luôn
    await page.click('button[type="submit"]');

    // Kiểm tra dòng chữ đỏ bên dưới ô Username
    await expect(page.locator('.field-error').first()).toContainText('Vui lòng nhập tên đăng nhập');
    
    // Kiểm tra dòng chữ đỏ bên dưới ô Password
    // (Dùng .nth(1) vì nó là lỗi thứ 2 xuất hiện trên màn hình)
    await expect(page.locator('.field-error').nth(1)).toContainText('Vui lòng nhập mật khẩu');
  });

  // --- CASE 2: KIỂM TRA SAI MẬT KHẨU (SERVER-SIDE) ---
  test('Báo lỗi từ Server nếu nhập sai mật khẩu', async ({ page }) => {
    await page.fill('#username', FIXED_USER.username);
    await page.fill('#password', 'mat_khau_bay_ba'); // Sai pass
    
    await page.click('button[type="submit"]');

    // Kiểm tra dòng lỗi chung ở dưới cùng (class .error-message)
    // Khớp với LoginPage.jsx: "Sai tên đăng nhập hoặc mật khẩu."
    await expect(page.locator('.error-message')).toContainText('Sai tên đăng nhập hoặc mật khẩu');
  });

  // --- CASE 3: KIỂM TRA TÀI KHOẢN KHÔNG TỒN TẠI ---
  test('Báo lỗi nếu tài khoản không tồn tại', async ({ page }) => {
    await page.fill('#username', 'User_Ao_Ma_Canada');
    await page.fill('#password', '123456');
    
    await page.click('button[type="submit"]');

    await expect(page.locator('.error-message')).toContainText('Sai tên đăng nhập hoặc mật khẩu');
  });

  // --- CASE 4: ĐĂNG NHẬP THÀNH CÔNG (HAPPY PATH) ---
  test('Đăng nhập thành công với tài khoản đúng', async ({ page }) => {
    await page.fill('#username', FIXED_USER.username);
    await page.fill('#password', FIXED_USER.password);

    await page.click('button[type="submit"]');

    // 1. Kiểm tra chuyển hướng về Dashboard
    // (Đảm bảo đường dẫn này đúng với code React của bạn)
    await expect(page).toHaveURL(/\/dashboard\/agent/); 
  });

});