# Hướng dẫn xử lý lỗi (Troubleshooting)

## Lỗi: Không đăng nhập được

### Triệu chứng:
```
🔐 Đang đăng nhập...
🔍 Đang tìm nút đăng nhập...
✅ Đã click nút đăng nhập
⏳ Đang chờ đăng nhập...
⚠️ Vẫn còn ở trang đăng nhập - có thể sai username/password!
📸 Đã lưu screenshot: debug-login-failed.png
```

### Nguyên nhân có thể:
1. **Username hoặc password sai**
   - Kiểm tra lại `config.json`
   - Đảm bảo không có khoảng trắng thừa
   - Thử đăng nhập thủ công trên web để chắc chắn credentials đúng

2. **Website có CAPTCHA**
   - Một số trang có CAPTCHA khi đăng nhập
   - Giải pháp: Chạy với `"headless": false` và giải CAPTCHA thủ công

3. **Nút đăng nhập không được click**
   - Xem file `debug-login-failed.png` để kiểm tra
   - Có thể cần thêm delay

### Giải pháp:

#### 1. Kiểm tra credentials:
```json
{
  "username": "username_dung",  // Không có khoảng trắng
  "password": "password_dung",   // Không có khoảng trắng
  "headless": false,              // Để xem trình duyệt
  "autoConfirm": false,
  "maxPrice": 50000
}
```

#### 2. Chạy với chế độ hiển thị trình duyệt:
```bash
# Sửa config.json: "headless": false
npm start
```

#### 3. Thử đăng nhập thủ công trước:
- Mở https://augmentgateway.1app.space/#/login
- Thử đăng nhập với username/password của bạn
- Nếu không đăng nhập được thủ công → credentials sai

## Lỗi: Không tìm thấy số dư

### Triệu chứng:
```
💰 Đang kiểm tra số dư...
⚠️ Không tìm thấy số dư, chụp screenshot...
📸 Đã lưu screenshot: debug-no-balance.png
❌ Không tìm thấy thông tin số dư
```

### Nguyên nhân có thể:
1. **Chưa đăng nhập thành công**
   - Xem lại phần "Không đăng nhập được"

2. **Trang chưa load xong**
   - Kết nối internet chậm
   - Website phản hồi chậm

3. **Website thay đổi giao diện**
   - Class `.balance-amount` không còn tồn tại

### Giải pháp:

#### 1. Xem screenshot để debug:
Mở file `debug-no-balance.png` để xem trang đang hiển thị gì.

#### 2. Kiểm tra URL hiện tại:
Tool sẽ in ra URL hiện tại. Nếu URL không phải là:
- `https://augmentgateway.1app.space/#/augment-gateway`

Thì có vấn đề về đăng nhập hoặc navigation.

#### 3. Tăng thời gian chờ:
Mở file `auto-buy-playwright.js` và tìm dòng:
```javascript
await page.waitForSelector('.balance-amount', { timeout: 10000 })
```

Thay `10000` (10 giây) thành `20000` (20 giây):
```javascript
await page.waitForSelector('.balance-amount', { timeout: 20000 })
```

## Lỗi: Không tìm thấy tab "Mua"

### Triệu chứng:
```
🔍 Đang tìm tab "Mua"...
⚠️ Không tìm thấy tabs, chụp screenshot...
📸 Đã lưu screenshot: debug-no-tabs.png
```

### Nguyên nhân:
- Chưa đăng nhập thành công
- Trang chưa load xong
- Website thay đổi cấu trúc

### Giải pháp:
1. Xem file `debug-no-tabs.png`
2. Kiểm tra đã đăng nhập thành công chưa
3. Thử chạy lại với kết nối internet tốt hơn

## Lỗi: npm error code 3221225786

### Triệu chứng:
```
npm error code 3221225786
npm error command failed
```

### Nguyên nhân:
Lỗi khi cài đặt Puppeteer trên Windows.

### Giải pháp:
**SỬ DỤNG PLAYWRIGHT thay vì Puppeteer:**

```bash
# 1. Xóa node_modules
rm -rf node_modules

# 2. Cài đặt lại
npm install

# 3. Cài browser cho Playwright
npx playwright install chromium

# 4. Chạy tool
npm start
```

Tool mặc định đã sử dụng Playwright, bạn chỉ cần chạy `npm start`.

## Tips Debug

### 1. Chạy với chế độ hiển thị trình duyệt:
```json
{
  "headless": false
}
```

Bạn sẽ thấy trình duyệt mở và có thể quan sát từng bước.

### 2. Xem screenshots:
Khi có lỗi, tool tự động chụp screenshot:
- `debug-login-failed.png` - Lỗi đăng nhập
- `debug-no-tabs.png` - Không tìm thấy tabs
- `debug-no-balance.png` - Không tìm thấy số dư

### 3. Chạy từng bước thủ công:
Mở browser thủ công và thử:
1. Đăng nhập
2. Vào trang augment-gateway
3. Click tab "Mua"
4. Xem có thấy số dư không

Nếu thủ công được → vấn đề ở code
Nếu thủ công không được → vấn đề ở tài khoản/website

### 4. Kiểm tra internet:
```bash
ping augmentgateway.1app.space
```

Đảm bảo có kết nối đến website.

### 5. Thử đăng nhập trên browser thường:
Mở Chrome/Firefox và đăng nhập thủ công để chắc chắn:
- Website đang hoạt động
- Credentials đúng
- Không có CAPTCHA hoặc 2FA

## Liên hệ hỗ trợ

Nếu vẫn gặp lỗi, vui lòng cung cấp:
1. File screenshots debug-*.png
2. Log đầy đủ từ console
3. Phiên bản Node.js: `node --version`
4. Hệ điều hành: Windows/Mac/Linux
5. Đã thử đăng nhập thủ công chưa và kết quả ra sao
