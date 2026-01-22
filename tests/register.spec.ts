import { test, expect } from '@playwright/test';

test.describe('Kiểm tra chức năng Đăng ký', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('Báo lỗi khi nhập dữ liệu không hợp lệ', async ({ page }) => {
    // 1. Mật khẩu xác nhận không khớp
    await page.fill('#username', 'UserTestVal');
    await page.fill('#email', 'valid@test.com');
    await page.fill('#password', '123456');
    await page.fill('#confirmPassword', '654321'); 
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.field-error')).toContainText('Mật khẩu xác nhận không khớp');

    // 2. Email sai định dạng
    await page.fill('#confirmPassword', '123456'); 
    await page.fill('#email', 'email_sai_ne');     
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.field-error')).toContainText('Email không đúng định dạng');

    // 3. Tên chứa ký tự đặc biệt
    await page.fill('#email', 'dung@test.com');    
    await page.fill('#username', 'User@!!!');      
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.field-error')).toContainText('Username không được chứa ký tự đặc biệt');
  });

  test('Đăng ký thành công với dữ liệu hợp lệ', async ({ page }) => {
    const shortId = Math.floor(Math.random() * 90000) + 1000;
    const randomUser = `UserSuccess${shortId}`;
    const randomEmail = `success${shortId}@test.com`;

    await page.fill('#username', randomUser);
    await page.fill('#email', randomEmail);
    await page.fill('#password', '123456');
    await page.fill('#confirmPassword', '123456');

    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Đăng ký thành công');
      await dialog.accept();
    });

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/login/);
  });

  test('Báo lỗi khi tài khoản đã tồn tại', async ({ page }) => {
    const shortId = Math.floor(Math.random() * 90000) + 1000;
    const fixedUser = `DupUser${shortId}`;
    const fixedEmail = `dup${shortId}@test.com`;

    await page.fill('#username', fixedUser);
    await page.fill('#email', fixedEmail);
    await page.fill('#password', '123456');
    await page.fill('#confirmPassword', '123456');
    page.once('dialog', dialog => dialog.accept());
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/register');
    await page.fill('#username', fixedUser);
    await page.fill('#email', fixedEmail);
    await page.fill('#password', '123456');
    await page.fill('#confirmPassword', '123456');

    await page.click('button[type="submit"]');

    await expect(page.locator('.error-message')).toContainText('Username hoặc email đã tồn tại');
  });

});