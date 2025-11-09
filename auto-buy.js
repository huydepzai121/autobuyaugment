const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Hàm chuyển đổi giá tiền từ string sang number
function parsePrice(priceStr) {
  // Loại bỏ ký tự ₫ và khoảng trắng, sau đó thay dấu . bằng rỗng
  return parseInt(priceStr.replace(/[₫\s.]/g, ''));
}

// Hàm delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  // Đọc config
  const configPath = path.join(__dirname, 'config.json');
  if (!fs.existsSync(configPath)) {
    console.error('❌ Không tìm thấy file config.json!');
    console.log('📝 Vui lòng copy config.example.json thành config.json và điền thông tin của bạn');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  console.log('🚀 Khởi động tool tự động mua tài khoản...');

  // Khởi tạo browser
  const browser = await puppeteer.launch({
    headless: config.headless || false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    // Bước 1: Truy cập trang đăng nhập
    console.log('📍 Đang truy cập trang đăng nhập...');
    await page.goto('https://augmentgateway.1app.space/#/login', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await delay(2000);

    // Bước 2: Đăng nhập
    console.log('🔐 Đang đăng nhập...');

    // Nhập username
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.type('input[name="username"]', config.username);
    await delay(500);

    // Nhập password
    await page.type('input[name="password"]', config.password);
    await delay(500);

    // Click nút đăng nhập
    // Tìm button submit có text-center
    const loginButton = await page.$('button .q-btn__content.text-center');
    if (loginButton) {
      await loginButton.click();
      console.log('✅ Đã click nút đăng nhập');
    } else {
      // Fallback: tìm button chứa q-btn__content
      await page.click('button');
      console.log('✅ Đã click nút đăng nhập (fallback)');
    }

    // Đợi chuyển trang sau khi đăng nhập
    await delay(3000);

    // Bước 3: Chuyển đến trang augment-gateway
    console.log('📍 Đang chuyển đến trang mua tài khoản...');
    await page.goto('https://augmentgateway.1app.space/#/augment-gateway', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await delay(2000);

    // Bước 4: Click vào tab "Mua"
    console.log('🔍 Đang tìm tab "Mua"...');

    // Tìm tab có text "Mua"
    const tabs = await page.$$('.q-tab');
    for (let tab of tabs) {
      const text = await tab.evaluate(el => el.textContent);
      if (text.includes('Mua')) {
        await tab.click();
        console.log('✅ Đã click vào tab "Mua"');
        break;
      }
    }

    await delay(2000);

    // Bước 5: Lấy số dư hiện tại
    console.log('💰 Đang kiểm tra số dư...');
    await page.waitForSelector('.balance-amount', { timeout: 10000 });

    const balanceText = await page.$eval('.balance-amount', el => el.textContent);
    const currentBalance = parsePrice(balanceText);
    console.log(`💵 Số dư hiện tại: ${balanceText} (${currentBalance} VNĐ)`);

    // Bước 6: Lấy danh sách tài khoản
    console.log('📋 Đang quét danh sách tài khoản...');

    const accounts = await page.$$eval('tbody tr', rows => {
      return rows.map((row, index) => {
        const emailCell = row.querySelector('td:nth-child(1) span');
        const creatorCell = row.querySelector('td:nth-child(2) .text-weight-medium');
        const priceCell = row.querySelector('td:nth-child(3) .text-weight-bold');
        const timeCell = row.querySelector('td:nth-child(4)');

        return {
          index,
          email: emailCell ? emailCell.textContent.trim() : '',
          creator: creatorCell ? creatorCell.textContent.trim() : '',
          price: priceCell ? priceCell.textContent.trim() : '',
          timeRemaining: timeCell ? timeCell.textContent.trim() : ''
        };
      });
    });

    if (accounts.length === 0) {
      console.log('⚠️ Không tìm thấy tài khoản nào để mua!');
      await browser.close();
      return;
    }

    console.log(`✅ Tìm thấy ${accounts.length} tài khoản có sẵn:\n`);

    // Hiển thị danh sách tài khoản
    accounts.forEach((acc, idx) => {
      console.log(`${idx + 1}. Email: ${acc.email}`);
      console.log(`   Người tạo: ${acc.creator}`);
      console.log(`   Giá: ${acc.price}`);
      console.log(`   Thời gian: ${acc.timeRemaining}\n`);
    });

    // Bước 7: Tìm tài khoản đầu tiên có thể mua (đủ tiền)
    let accountToBuy = null;
    let accountIndex = -1;

    for (let i = 0; i < accounts.length; i++) {
      const acc = accounts[i];
      const price = parsePrice(acc.price);

      if (price <= currentBalance && price <= config.maxPrice) {
        accountToBuy = acc;
        accountIndex = i;
        console.log(`✅ Tìm thấy tài khoản có thể mua:`);
        console.log(`   Email: ${acc.email}`);
        console.log(`   Giá: ${acc.price} (${price} VNĐ)`);
        console.log(`   Số dư: ${balanceText} (${currentBalance} VNĐ)`);
        console.log(`   Còn lại sau khi mua: ${currentBalance - price} VNĐ\n`);
        break;
      }
    }

    if (!accountToBuy) {
      console.log('⚠️ Không tìm thấy tài khoản nào phù hợp để mua!');
      console.log(`   - Số dư hiện tại: ${currentBalance} VNĐ`);
      console.log(`   - Giá tối đa cho phép: ${config.maxPrice} VNĐ`);
      await browser.close();
      return;
    }

    // Bước 8: Xác nhận và mua
    if (!config.autoConfirm) {
      console.log('⏸️  autoConfirm = false, không tự động mua');
      console.log('💡 Để tự động mua, set "autoConfirm": true trong config.json');
      await delay(5000);
      await browser.close();
      return;
    }

    console.log('🛒 Đang thực hiện mua tài khoản...');

    // Click nút mua của tài khoản đã chọn
    const buyButtons = await page.$$('button[name="buy-account-btn"]');
    if (buyButtons[accountIndex]) {
      await buyButtons[accountIndex].click();
      console.log('✅ Đã click nút "Mua tài khoản này"');

      await delay(2000);

      // Kiểm tra xem có dialog xác nhận không
      const confirmButton = await page.$('button.bg-positive');
      if (confirmButton) {
        const buttonText = await confirmButton.evaluate(el => el.textContent);
        if (buttonText.includes('Xác nhận') || buttonText.includes('Đồng ý')) {
          await confirmButton.click();
          console.log('✅ Đã xác nhận mua');
        }
      }

      await delay(3000);

      console.log('🎉 HOÀN THÀNH! Vui lòng kiểm tra tài khoản của bạn.');

    } else {
      console.log('❌ Không tìm thấy nút mua!');
    }

    // Giữ browser mở 5 giây để xem kết quả
    await delay(5000);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('👋 Đã đóng trình duyệt');
  }
}

// Chạy script
main().catch(console.error);
