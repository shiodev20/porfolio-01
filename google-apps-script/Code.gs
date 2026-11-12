/**
 * Nhận form Liên hệ từ website và ghi mỗi lượt gửi thành 1 dòng trong Google Sheet.
 *
 * Cài đặt: mở Google Sheet → Tiện ích mở rộng (Extensions) → Apps Script,
 * dán toàn bộ file này vào Code.gs, rồi Deploy → New deployment → Web app.
 * Hướng dẫn đầy đủ: google-apps-script/README.md
 */

// Link Google Sheet nhận liên hệ. Chỉ cần điền nếu script được tạo từ script.google.com;
// nếu mở script từ trong Sheet (Extensions → Apps Script) thì để trống cũng được.
const SHEET_URL = "";

const SHEET_NAME = "Liên hệ"; // tab sẽ được tạo tự động nếu chưa có

// [tiêu đề cột, key trong dữ liệu website gửi lên]
const COLUMNS = [
  ["Thời gian gửi", "_time"],
  ["Họ tên", "name"],
  ["Email", "email"],
  ["Bạn là", "as"],
  ["Muốn hợp tác với vai trò", "role"],
  ["Hình thức", "format"],
  ["Ngày", "timing_date"],
  ["Giờ", "timing_time"],
  ["Thời gian (chọn nhanh)", "timing_preset"],
  ["Lời nhắn", "message"],
  ["Ngôn ngữ", "lang"],
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    // Bẫy bot: ô "website" bị ẩn với người thật, bot thì hay điền vào
    if (data.website) return json({ ok: true });

    if (!data.name || !data.email || !data.message) {
      return json({ ok: false, error: "missing_fields" });
    }

    lock.waitLock(10000);
    const sheet = getSheet();
    const row = COLUMNS.map(([, key]) => (key === "_time" ? new Date() : clean(data[key])));
    sheet.appendRow(row);
    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Mở URL Web App trên trình duyệt để kiểm tra script đang chạy
function doGet() {
  try {
    return json({ ok: true, sheet: getSpreadsheet().getName() });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function getSpreadsheet() {
  if (SHEET_URL) return SpreadsheetApp.openByUrl(SHEET_URL);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("Chưa có Sheet: điền SHEET_URL ở đầu file, hoặc mở script từ Google Sheet (Extensions → Apps Script).");
  return ss;
}

function getSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(([title]) => title));
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Gộp mảng thành chuỗi, cắt độ dài, và chặn chèn công thức (=, +, -, @)
function clean(value) {
  if (value == null) return "";
  let s = Array.isArray(value) ? value.join(", ") : String(value);
  s = s.slice(0, 5000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
