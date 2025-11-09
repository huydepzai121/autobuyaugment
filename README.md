# Tool Tự Động Mua Tài Khoản - Augment Gateway

Tool tự động mua tài khoản trên website augmentgateway.1app.space

## Tính năng

- ✅ Tự động đăng nhập vào hệ thống
- ✅ Kiểm tra số dư tài khoản hiện tại
- ✅ Quét danh sách tài khoản có sẵn
- ✅ So sánh giá với số dư để tìm tài khoản có thể mua
- ✅ Tự động mua tài khoản (nếu bật autoConfirm)
- ✅ Giới hạn giá tối đa cho phép mua
- ✅ Hiển thị chi tiết quá trình thực hiện
- ✅ Hỗ trợ 2 engine: **Playwright** (khuyến nghị) và Puppeteer

## Yêu cầu hệ thống

- Node.js (phiên bản 14 trở lên)
- npm hoặc yarn
- Windows/Linux/macOS

## Cài đặt

### Phương án 1: Playwright (KHUYẾN NGHỊ - Ổn định trên Windows)

1. Clone hoặc tải repository này về máy

2. Cài đặt dependencies:

```bash
npm install
```

3. Cài đặt browser cho Playwright:

```bash
npx playwright install chromium
```

### Phương án 2: Puppeteer

Nếu bạn gặp lỗi khi cài Puppeteer trên Windows, hãy dùng **Playwright** (phương án 1).

```bash
npm install puppeteer
```

## Cấu hình

1. Copy file `config.example.json` thành `config.json`:

```bash
cp config.example.json config.json
```

2. Mở file `config.json` và điền thông tin của bạn:

```json
{
  "username": "ten_dang_nhap_cua_ban",
  "password": "mat_khau_cua_ban",
  "headless": false,
  "autoConfirm": false,
  "maxPrice": 50000
}
```

### Giải thích các tham số:

- `username`: Tên đăng nhập của bạn trên website
- `password`: Mật khẩu của bạn
- `headless`:
  - `false` - Hiển thị trình duyệt (để bạn xem quá trình)
  - `true` - Chạy ngầm không hiển thị trình duyệt
- `autoConfirm`:
  - `false` - Chỉ kiểm tra, KHÔNG tự động mua
  - `true` - Tự động mua tài khoản nếu đủ điều kiện
- `maxPrice`: Giá tối đa (VNĐ) bạn sẵn sàng trả cho một tài khoản

## Sử dụng

### Chạy với Playwright (mặc định - khuyến nghị):

```bash
npm start
```

hoặc

```bash
node auto-buy-playwright.js
```

### Chạy với Puppeteer:

```bash
npm run start:puppeteer
```

hoặc

```bash
node auto-buy-puppeteer.js
```

## Quy trình hoạt động

1. **Đăng nhập**: Tool sẽ tự động đăng nhập bằng username/password trong config
2. **Chuyển trang**: Chuyển đến trang mua tài khoản
3. **Click tab "Mua"**: Mở tab danh sách tài khoản
4. **Kiểm tra số dư**: Lấy số dư hiện tại trong tài khoản
5. **Quét tài khoản**: Lấy danh sách tất cả tài khoản có sẵn
6. **Tìm tài khoản phù hợp**: Tìm tài khoản đầu tiên thỏa mãn:
   - Giá <= Số dư hiện tại
   - Giá <= maxPrice (cấu hình)
7. **Mua tài khoản**: Nếu `autoConfirm = true`, tự động click mua

## Chế độ an toàn

Để tránh mua nhầm, mặc định tool sẽ:
- Chỉ hiển thị thông tin tài khoản có thể mua
- KHÔNG tự động mua (vì `autoConfirm = false`)

Khi bạn đã kiểm tra kỹ và muốn tự động mua, hãy:
1. Đặt `autoConfirm: true` trong `config.json`
2. Chạy lại tool

## Ví dụ kết quả

```
🚀 Khởi động tool tự động mua tài khoản (Playwright)...
📍 Đang truy cập trang đăng nhập...
🔐 Đang đăng nhập...
✅ Đã click nút đăng nhập
📍 Đang chuyển đến trang mua tài khoản...
🔍 Đang tìm tab "Mua"...
✅ Đã click vào tab "Mua"
💰 Đang kiểm tra số dư...
💵 Số dư hiện tại: 12.901 ₫ (12901 VNĐ)
📋 Đang quét danh sách tài khoản...
✅ Tìm thấy 5 tài khoản có sẵn:

1. Email: tk22@onkey.com
   Người tạo: ctvonkey1
   Giá: 34.000 ₫
   Thời gian: 25 ngày tới

⚠️ Không tìm thấy tài khoản nào phù hợp để mua!
   - Số dư hiện tại: 12901 VNĐ
   - Giá tối đa cho phép: 50000 VNĐ
👋 Đã đóng trình duyệt
```

## Lưu ý

- ⚠️ File `config.json` chứa thông tin đăng nhập, KHÔNG chia sẻ file này!
- ⚠️ File `config.json` đã được thêm vào `.gitignore` để tránh commit nhầm
- 💡 Nên thử với `autoConfirm: false` trước để kiểm tra tool hoạt động đúng
- 💡 Có thể điều chỉnh `maxPrice` để kiểm soát giá mua tối đa
- 💡 Tool sẽ tự động chọn tài khoản ĐẦU TIÊN đủ điều kiện trong danh sách

## Xử lý lỗi

Nếu gặp lỗi:

1. **Lỗi khi cài đặt Puppeteer (npm error code 3221225786 hoặc tương tự)**
   - Đây là lỗi phổ biến trên Windows khi Puppeteer tải Chrome binary
   - **GIẢI PHÁP**: Sử dụng Playwright thay vì Puppeteer:
   ```bash
   npm install
   npx playwright install chromium
   npm start  # Chạy với Playwright
   ```

2. **Không đăng nhập được / Không tìm thấy số dư**
   - Tool sẽ tự động chụp screenshot (debug-*.png) để giúp bạn debug
   - Đặt `"headless": false` trong config.json để xem trình duyệt
   - Kiểm tra username/password có đúng không
   - Xem file [TROUBLESHOOTING.md](TROUBLESHOOTING.md) để biết chi tiết

3. **Không tìm thấy config.json**
   - Đảm bảo đã copy `config.example.json` thành `config.json`

4. **Đăng nhập thất bại**
   - Kiểm tra lại username/password trong `config.json`
   - Thử đăng nhập thủ công trên web trước

5. **Không tìm thấy element**
   - Website có thể đã thay đổi giao diện
   - Liên hệ để cập nhật tool

📖 **Xem hướng dẫn chi tiết**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## So sánh Playwright vs Puppeteer

| Tính năng | Playwright ⭐ | Puppeteer |
|-----------|---------------|-----------|
| Ổn định trên Windows | ✅ Rất tốt | ⚠️ Hay lỗi khi cài đặt |
| Tốc độ | ⚡ Nhanh hơn | Nhanh |
| Cài đặt | Dễ dàng | Khó trên Windows |
| Khuyến nghị | ✅ Nên dùng | Chỉ khi Playwright không hoạt động |

## License

ISC
