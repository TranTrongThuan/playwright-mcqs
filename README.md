# Ultimate MCQs - Playwright Automation Test

Dùng Playwright (Typescript) để chạy test cho website MCQs

## Phạm vi kiểm thử

- **Đăng ký & Đăng nhập:** Đăng ký, Đăng nhập và tự động lưu phiên làm việc để không phải đăng nhập lại nhiều lần.
- **Tài khoản:** Cập nhật thông tin cá nhân, đổi mật khẩu.
- **Thư viện câu hỏi:** Tìm kiếm, lọc câu hỏi, và các thao tác CRUD (thêm, sửa, xóa) kết hợp với kỹ thuật Mock API.
- **Tạo và làm bài thi:** Mô phỏng quá trình tạo một đề thi và làm online.
- **Xem chi tiết và tải file:** Kiểm tra hiển thị bảng điểm thống kê và tải file PDF.

## Công nghệ sử dụng

- **Framework:** Playwright Test
- **Ngôn ngữ:** TypeScript
- **Kỹ thuật:**
  - Mock API / Network Intercepting (Chặn gọi API thật để test UI độc lập).
  - Multi-Context (Mở nhiều trình duyệt ẩn danh cùng lúc để test luồng Đa người dùng).
  - Download Intercepting (Bắt và kiểm tra file tải về).
