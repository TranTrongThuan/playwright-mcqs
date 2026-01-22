# Automation Testing For MCQs

Using **Playwright (TypeScript)** to automation test for Ultimate MCQs website

## Techonoly

- **Framework:** Playwright
- **Language:** TypeScript

## Test Scenarios

### 1. Đăng ký (Register Page)

- ✅ **Validation Client-side:** Kiểm tra các trường hợp bỏ trống, email sai định dạng, mật khẩu xác nhận không khớp (hiển thị lỗi ngay trên UI).
- ✅ **Happy Path:** Đăng ký thành công với dữ liệu người dùng ngẫu nhiên (Random Data Generation) để tránh trùng lặp.
- ✅ **Validation Server-side:** Kiểm tra trường hợp đăng ký trùng Username/Email đã có trong hệ thống.

### 2. Đăng nhập (Login Page)

- ✅ **Validation:** Kiểm tra hiển thị lỗi khi bỏ trống form.
- ✅ **Security Check:** Kiểm tra đăng nhập với sai mật khẩu hoặc tài khoản không tồn tại.
- ✅ **Happy Path:** Đăng nhập thành công với tài khoản có sẵn.
- ✅ **State Verification:** Kiểm tra Token được lưu vào LocalStorage và sự chuyển hướng trang (Redirection).
