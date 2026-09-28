# Hướng Dẫn Sử Dụng Hệ Thống Quản Lý Lớp Học MindX

## 1. Đăng Nhập
- Hệ thống yêu cầu tài khoản để đảm bảo dữ liệu của các giáo viên được quản lý độc lập và bảo mật.
- Giao diện đầu tiên là trang đăng nhập (`login.html`). Bạn cần nhập email và mật khẩu (đã được tạo trên Firebase Authentication).

## 2. Trang Chủ (Danh sách lớp)
- Trang chủ (`home.html`) hiển thị danh sách toàn bộ các lớp mà giáo viên đang quản lý.
- Từ đây, giáo viên có thể:
  - Chọn **"Quản lý"** để vào giao diện điểm danh và chấm điểm cho một lớp học cụ thể.
  - Chọn **"Xóa"** để gỡ bỏ hoàn toàn một lớp (hành động này sẽ xóa dữ liệu trên database).
  - Chọn **"Tạo lớp mới"** để thêm một lớp vào hệ thống.

## 3. Khai Báo Lớp Học Mới
- Ở giao diện tạo lớp (`setup.html`), bạn nhập đầy đủ thông tin: Tên lớp, Mã lớp, Bộ môn, Trình độ, Lịch học.
- **Danh sách học viên:** Nhập tên mỗi học viên trên một dòng riêng biệt. Bạn có thể sao chép (copy) danh sách trực tiếp từ Excel dán vào đây để tiết kiệm thời gian.
- Nhấn **"Bắt đầu quản lý"** để khởi tạo dữ liệu lớp học, dữ liệu sẽ tự động được đồng bộ lên Firebase.

## 4. Quản Lý Điểm Số & Điểm Danh
- Đây là màn hình làm việc chính khi bấm vào một lớp học (`index.html`).
- Chọn **Buổi học hiện tại** (hỗ trợ từ Buổi 1 đến Buổi 9) thông qua thanh thả xuống (dropdown).
- **Điểm danh:** Nhấn nút trạng thái (Có mặt / Vắng) để điểm danh. Khi học sinh bị đánh dấu là "Vắng", các nút thao tác điểm sẽ bị làm mờ và không thể nhấn được.
- **Thêm/Trừ sao:** Dùng nút `+` (màu xanh) để cộng sao hoặc `-` (màu đỏ) để trừ điểm sao.
- **Tặng Huy hiệu:** Dùng nút "Huy hiệu" (màu vàng) để tặng huy hiệu tuyên dương học viên.
- Mọi thay đổi về điểm hay điểm danh đều được lưu ngay lập tức (realtime) lên Firebase.

## 5. Tổng Kết Đánh Giá
- Trang tổng kết (`summary.html`) tự động thu thập và cộng dồn toàn bộ điểm Sao và Huy hiệu của học sinh qua cả 9 buổi học.
- Dựa trên tổng số sao đạt được, hệ thống sẽ tự động xếp loại học viên vào cuối kỳ:
  - Dưới 7 sao: Cần cố gắng
  - Từ 7 sao đến dưới 15 sao: Khá
  - Từ 15 sao trở lên: Xuất sắc 🌟

---

## 📌 Quản Lý Cơ Sở Dữ Liệu (Database)

**1. Dữ liệu của dự án được lưu ở đâu?**
Dự án không lưu dữ liệu trên máy tính cá nhân mà sử dụng **Firebase Realtime Database** - một dịch vụ cơ sở dữ liệu đám mây của Google Cloud. Mỗi khi bạn thêm học sinh, cộng sao hay điểm danh, đoạn mã Javascript trong web sẽ gửi dữ liệu qua Internet để lưu thẳng vào máy chủ của Google Firebase.

**2. Dữ liệu có bị mất khi deploy web không?**
**KHÔNG THỂ BỊ MẤT.** 
Bởi vì kiến trúc của web bạn đang làm tách biệt hoàn toàn giữa Frontend (Giao diện) và Database:
- Khi bạn deploy web (đẩy HTML, CSS, JS lên các nền tảng như Github Pages, Vercel, Netlify...), bạn chỉ đang tạo ra một "mặt tiền" trực tuyến cho người dùng truy cập.
- Các file mã nguồn này vẫn chứa cùng một đoạn cấu hình Firebase (`firebaseConfig`) đang trỏ đến chính xác một database. Do đó web online của bạn vẫn tiếp tục kết nối đến Database hiện tại trên Firebase một cách bình thường. Không có dữ liệu nào bị xoá hay làm mới do quá trình deploy.
