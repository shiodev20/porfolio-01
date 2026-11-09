# thảo educator — website

Astro (website) + Sanity (dashboard nội dung) + Cloudflare Pages (hosting).

```
web/      Website Astro: trang, component, CSS, JS
studio/   Sanity Studio: dashboard cho team sửa nội dung
shared/   Dùng chung: danh sách ngôn ngữ + nội dung khởi tạo (seed)
```

## Chạy local

```bash
npm run setup     # cài web/ và studio/ (lần đầu)
npm run dev       # website: http://localhost:4321  (bản VI: /vi)
npm run studio    # dashboard: http://localhost:3333 (cần cấu hình Sanity)
npm run build     # build tĩnh ra web/dist
```

Chưa cấu hình Sanity thì website đọc nội dung từ `shared/seed/content.json`, chạy được ngay không cần tài khoản.

## Nối Sanity

1. Tạo project tại sanity.io/manage, ghi lại Project ID.
2. `studio/.env` (copy từ `.env.example`): `SANITY_STUDIO_PROJECT_ID=...`
3. `web/.env` (copy từ `.env.example`): `SANITY_PROJECT_ID=...`
4. Chạy trong `studio/`:
   ```bash
   npx sanity login
   npx sanity cors add http://localhost:3333 --credentials
   npm run seed        # đẩy nội dung seed + ảnh lên Sanity (chạy lại an toàn; --force để ghi đè)
   ```
5. `npm run dev` + `npm run studio`. Sửa trên dashboard, bấm Publish, rồi refresh website để thấy thay đổi.

## Đa ngôn ngữ

- URL: ngôn ngữ mặc định không có tiền tố (`/portfolio`), các ngôn ngữ khác có (`/vi/portfolio`).
- **Nội dung** (sửa trên dashboard): mỗi field chữ có một ô cho mỗi ngôn ngữ. Để trống thì hiển thị bản mặc định.
- **Chữ giao diện** (menu, nút, nhãn): `web/src/i18n/ui/<ngôn ngữ>.ts`.

**Thêm một ngôn ngữ (ví dụ tiếng Pháp):**
1. Thêm `{ id: "fr", title: "Français", short: "FR", locale: "fr_FR" }` vào [shared/languages.ts](shared/languages.ts).
2. Tạo `web/src/i18n/ui/fr.ts` theo mẫu `vi.ts` (thiếu key nào sẽ dùng tiếng Anh).
3. Khởi động lại `npm run dev` / `npm run studio`.

Dashboard sẽ tự hiện ô "Français", website tự build các trang `/fr/...`, và nút đổi ngôn ngữ tự có thêm lựa chọn.

Đổi ngôn ngữ mặc định: sửa `defaultLanguage` trong cùng file.
