import { test, expect } from '@playwright/test';

test.describe('Test Đăng nhập (Dùng tài khoản có sẵn)', () => {

  const FIXED_USER = {
    username: 'Test100', 
    password: 'testtest'
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('Báo lỗi chữ đỏ khi bỏ trống thông tin', async ({ page }) => {
    // Không nhập gì cả, bấm Đăng nhập luôn
    await page.click('button[type="submit"]');

    await expect(page.locator('.field-error').first()).toContainText('Vui lòng nhập tên đăng nhập');
    
    await expect(page.locator('.field-error').nth(1)).toContainText('Vui lòng nhập mật khẩu');
  });

  test('Báo lỗi từ Server nếu nhập sai mật khẩu', async ({ page }) => {
    await page.fill('#username', FIXED_USER.username);
    await page.fill('#password', 'mat_khau_bay_ba'); 
    
    await page.click('button[type="submit"]');

    await expect(page.locator('.error-message')).toContainText('Sai tên đăng nhập hoặc mật khẩu');
  });

  test('Báo lỗi nếu tài khoản không tồn tại', async ({ page }) => {
    await page.fill('#username', 'User_Ao_Ma_Canada');
    await page.fill('#password', '123456');
    
    await page.click('button[type="submit"]');

    await expect(page.locator('.error-message')).toContainText('Sai tên đăng nhập hoặc mật khẩu');
  });

  test('Đăng nhập thành công với tài khoản đúng', async ({ page }) => {
    await page.fill('#username', FIXED_USER.username);
    await page.fill('#password', FIXED_USER.password);

    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/dashboard\/agent/); 
  });

});