# Form Liên hệ → Google Sheet

Mỗi lượt gửi form trên trang Liên hệ được ghi thành 1 dòng trong tab **"Liên hệ"** của Google Sheet.

## Cài đặt (một lần)

1. Tạo (hoặc mở) Google Sheet sẽ nhận liên hệ.
2. **Tiện ích mở rộng (Extensions) → Apps Script**. Script phải được mở từ Sheet thì mới ghi được vào đúng Sheet đó.
3. Xoá code mẫu trong `Code.gs`, dán toàn bộ [Code.gs](Code.gs), bấm **Save**.
   Nếu script được tạo từ script.google.com (không mở từ Sheet), điền link Sheet vào `SHEET_URL` ở đầu file.
4. **Deploy → New deployment** → bánh răng cạnh "Select type" → **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Bấm **Deploy** → **Authorize access** → chọn tài khoản → **Advanced → Go to … (unsafe)** → **Allow**.
   (Cảnh báo này là bình thường với script tự viết.)
6. Copy **Web app URL** (dạng `https://script.google.com/macros/s/.../exec`).
   Mở thử URL trên trình duyệt: thấy `{"ok":true,...}` là script chạy được.
7. Sanity Studio → **Cài đặt chung → Liên hệ → Link Web App Google Sheet** → dán URL → **Publish**.
8. Build/deploy lại website (website là trang tĩnh, link được gắn vào lúc build).

## Lưu ý

- **Sửa script sau này:** vào **Deploy → Manage deployments → ✏️ → Version: New version → Deploy** để giữ nguyên URL.
  Nếu tạo "New deployment" thì sẽ ra URL mới và phải dán lại vào Sanity.
- **Đổi sang Sheet khác:** làm lại các bước trên với Sheet mới rồi dán URL mới vào Sanity.
- Nếu gửi vào Sheet thất bại, form tự mở ứng dụng email (gửi tới email trong Cài đặt chung) để không mất liên hệ.
- Ô Sanity để trống thì form mở ứng dụng email như trước đây.
