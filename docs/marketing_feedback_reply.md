# Website: Trả lời góp ý của bên Marketing

Tài liệu này trả lời phần "Công cụ đề xuất" và "Câu hỏi gửi IT" trong `marketing_feedback.md`.

**Công nghệ:** Astro (website) + Sanity (quản lý nội dung) + Cloudflare Pages (hosting) + Web3Forms (form liên hệ).

---

## 0. Tóm tắt nguyên tắc

**Tất cả dịch vụ marketing đề xuất (Google Analytics 4, Google Tag Manager, Microsoft Clarity, Meta Pixel, TikTok Pixel) đều gắn được vào website này.** IT không cần tự tạo tài khoản hay tự viết tag.

Cách làm là: **người phụ trách marketing tạo tài khoản ở từng dịch vụ, rồi gửi mã (ID hoặc đoạn tag) cho IT.** IT dán vào website, kiểm tra hoạt động và báo lại.

Lý do để marketing tạo tài khoản:
- Tài khoản và dữ liệu thuộc về chị Thảo/marketing, không thuộc về IT hay freelancer. Đổi người phụ trách sau này không bị mất dữ liệu.
- Chỉ người chạy quảng cáo mới biết cần theo dõi sự kiện nào và đặt tên ra sao.

---

## 1. Việc marketing cần gửi cho IT

| # | Dịch vụ | Marketing làm gì | Gửi cho IT cái gì |
|---|---|---|---|
| 1 | **Google Tag Manager (GTM)** | Tạo tài khoản và container loại "Web" tại tagmanager.google.com | **Container ID** dạng `GTM-XXXXXXX` |
| 2 | **Google Analytics 4** | Tạo property tại analytics.google.com, tạo luồng dữ liệu "Web" | **Measurement ID** dạng `G-XXXXXXXXXX` |
| 3 | **Microsoft Clarity** | Tạo project tại clarity.microsoft.com | **Project ID** (chuỗi ký tự ngắn trong đoạn tag Clarity cấp) |
| 4 | **Meta Pixel** | Tạo Pixel trong Meta Events Manager (cần Meta Business, nối với Fanpage) | **Pixel ID** (dãy số 15-16 chữ số) |
| 5 | **TikTok Pixel** | Tạo Pixel trong TikTok Ads Manager, mục Events | **Pixel ID** (dạng `C...`) |
| 6 | **Quyền truy cập** | Thêm email IT vào từng tài khoản trên với quyền Admin/Editor | Email IT đã được thêm |

**Cách gửi gọn nhất (khuyến nghị): chỉ gửi mục 1 (GTM ID).**
- IT gắn đúng một đoạn GTM vào website.
- Sau đó marketing tự thêm GA4, Clarity, Meta Pixel, TikTok Pixel bên trong giao diện GTM, **không cần nhờ IT gắn từng cái** và không cần sửa code.
- IT chỉ hỗ trợ khi cần theo dõi sự kiện đặc biệt (xem mục 3).

**Cách thay thế:** nếu chưa dùng GTM, marketing gửi lần lượt từng ID (mục 2-5). IT gắn trực tiếp vào website. Cách này chạy được nhưng mỗi lần thêm hoặc đổi tag đều phải nhờ IT.

### Hạn chót đề xuất
- Fanpage chạy từ **16/11**. Nên gửi ID **trước ngày này** để Pixel gắn xong và tệp retargeting bắt đầu tích lũy từ ngày đầu.
- Domain cũng nên chốt trước ngày này. Nếu đổi domain sau khi đã phát link UTM và gom dữ liệu Pixel, link cũ hỏng và dữ liệu bị tách đôi.

---

## 2. Đánh giá bộ công cụ đề xuất

| Công cụ | Gắn được vào web? | Đánh giá |
|---|---|---|
| **Microsoft Clarity** | Được | Nên dùng. Heatmap chỉ đáng tin khi có vài trăm phiên truy cập trở lên, chưa kết luận sớm khi traffic còn ít. |
| **Google Analytics 4** | Được | Nên dùng. Cần khai báo các sự kiện cần đo, nếu không báo cáo mặc định rất nghèo. |
| **Meta Pixel + TikTok Pixel** | Được | Retargeting người đã xem trang khóa học làm được. **Giới hạn:** việc đăng ký thật diễn ra trên Studify (domain khác), nên pixel không thấy lượt đăng ký thành công, chỉ đo được lượt bấm sang Studify. |
| **Đo thời gian dừng từng phần** | Được | Làm được miễn phí (xem mục 3). |

Lưu ý: trình chặn quảng cáo có thể làm mất một phần dữ liệu, nên số liệu nên đọc như xu hướng, không phải số tuyệt đối.

---

## 3. Trả lời câu hỏi gửi IT

### Hiện trạng kỹ thuật

**Website làm bằng gì? Chị Thảo tự sửa nội dung được không?**
- Website làm bằng **Astro** (trang tĩnh, tải nhanh), nội dung quản lý bằng **Sanity**.
- Chị Thảo tự sửa chữ, ảnh, bài viết, nội dung ưu đãi trong **Sanity Studio** (giao diện soạn thảo, không cần biết code). Bấm **Publish** thì website tự cập nhật sau khoảng 1-2 phút.
- Thay đổi về bố cục hoặc thêm tính năng mới vẫn cần IT.

**Khi nào chuyển từ github.io sang domain riêng? Ngày launch?**
- Website **chưa có hosting trước đó**, nên sẽ lên **Cloudflare Pages** ngay từ đầu. Không dùng github.io, do đó **không cần chuyển hay redirect** sau này.
- Khi deploy xong, website có địa chỉ tạm dạng `ten-du-an.pages.dev`. Gắn domain riêng vào Cloudflare Pages chỉ mất vài giờ (SSL tự động).
- **Ngày launch chính thức: cần chị Thảo/marketing xác nhận.** IT chưa có thông tin này.

**Trang đã gắn tracking nào chưa?**
- Chưa. Sẽ gắn sau khi marketing gửi ID theo mục 1.

### Theo dõi hành vi người dùng

**Có nên dùng Google Tag Manager?**
- **Có.** Marketing tạo container GTM và gửi `GTM-XXXXXXX` cho IT. Từ đó marketing tự thêm các tag khác mà không cần sửa code (xem mục 1).

**Đo thời gian dừng ở từng phần (giới thiệu, lộ trình, học phí, FAQ) và báo về GA4?**
- **Làm được.** IT đánh dấu từng phần của trang bằng mã định danh cố định. GTM ghi nhận khi phần đó hiển thị đủ lâu và gửi thành sự kiện về GA4.
- Quy ước "dừng": phần hiển thị từ 50% trở lên, tab đang mở, người dùng không cuộn. Cách này tránh tính nhầm người mở tab rồi bỏ đó.
- **Marketing cần:** thống nhất tên sự kiện và ngưỡng thời gian (ví dụ 10s, 20s) với IT.

**Đo lượt bấm "Đăng ký", "Liên hệ ngay", và bấm sang Studify?**
- **Làm được.** IT gắn nhãn riêng cho từng nút để GA4 và GTM phân biệt. Marketing chỉ cần chọn các nút cần đo.

**Biết ai đăng ký thành công trên Studify từ website?**
- **Website không tự thấy được**, vì việc đăng ký diễn ra trên hệ thống Studify. Có ba hướng kết hợp:
  1. Mọi link sang Studify đều gắn UTM để biết khách đến từ kênh nào.
  2. **Hỏi Studify** (marketing hoặc chị Thảo liên hệ): có ghi nhận UTM/nguồn khi đăng ký không, có báo cáo theo nguồn không, có cho gắn pixel hoặc trang cảm ơn sau đăng ký không. Nếu Studify cho gắn pixel thì marketing gửi lại cho IT hoặc tự gắn.
  3. Đối chiếu số đăng ký thật trong báo cáo Studify với số lượt bấm sang Studify trên GA4 theo từng nguồn.

**IT tạo giúp bộ link có UTM cho bio TikTok, Fanpage, Instagram?**
- Marketing tự tạo bằng công cụ miễn phí **Campaign URL Builder của Google**. IT chỉ cần thống nhất quy ước đặt tên, ví dụ:
  - TikTok bio: `?utm_source=tiktok&utm_medium=bio&utm_campaign=khoa-hoc`
  - Fanpage: `?utm_source=facebook&utm_medium=fanpage&utm_campaign=khoa-hoc`
  - Instagram bio: `?utm_source=instagram&utm_medium=bio&utm_campaign=khoa-hoc`
- IT thêm script **ghi nhớ UTM khi khách vào trang và tự nối vào link sang Studify**, để UTM không mất khi khách chuyển trang.

### Ưu đãi tại chỗ người dùng dừng lâu

**Hộp ưu đãi khi dừng ở phần học phí quá X giây mà chưa bấm đăng ký (mỗi phiên hiện 1 lần, có nút tắt)? Bản "sắp rời trang" trên máy tính?**
- **Làm được cả hai.** Mỗi phiên chỉ hiện một lần, có nút tắt.
- Bản "sắp rời trang" chỉ hoạt động trên **máy tính** (nhận biết chuột di ra mép trên trình duyệt). **Điện thoại không có tín hiệu tương đương đáng tin cậy**, nên trên điện thoại chỉ dùng bản theo thời gian dừng.
- Trên điện thoại nên dùng thẻ nhỏ hoặc banner phía dưới, **không dùng popup toàn màn hình** (làm hỏng trải nghiệm và Google có thể giảm xếp hạng).

**Thời gian X và nội dung hộp ưu đãi có để marketing tự đổi được không?**
- **Được.** IT tạo mục "Ưu đãi" trong Sanity gồm: bật/tắt, số giây X, tiêu đề, nội dung, chữ trên nút, link đích. Marketing sửa rồi Publish, hiệu lực sau khoảng 1-2 phút.

**Mã giảm giá nhập ở đâu? Studify có hỗ trợ coupon không?**
- **Cần hỏi Studify.**
  - Nếu có coupon: hộp ưu đãi hiện mã và hướng dẫn nhập ở Studify.
  - Nếu không: ưu đãi chuyển thành **form nhận tư vấn hoặc tài liệu** (gửi qua Web3Forms về email của chị Thảo).

**Form thu email (danh sách chờ) nối với Google Sheet hoặc công cụ gửi email?**
- **Làm được.** Web3Forms mặc định gửi thông báo về email, nên cần thêm một bước nối:
  - Ghi vào **Google Sheet** (qua Google Apps Script, miễn phí), hoặc
  - Đẩy sang công cụ email (Brevo, MailerLite, Mailchimp...) qua Zapier/Make hoặc API.
- Cần có **ô đồng ý nhận email** trên form.
- **Marketing cần:** cho biết dùng Google Sheet hay công cụ email nào. Nếu dùng công cụ email, gửi IT API key hoặc form ID của công cụ đó.

**Chạy thử 2 phiên bản ưu đãi song song để so sánh?**
- **Làm được.** Mỗi khách được gán ngẫu nhiên một phiên bản, và phiên bản này được gửi kèm sự kiện về GA4 để so sánh tỷ lệ bấm.
- **Lưu ý:** khi traffic còn thấp, A/B test song song không đủ dữ liệu để kết luận. Giai đoạn đầu nên chạy **từng phiên bản nối tiếp nhau** (mỗi bản 1-2 tuần), khi traffic đủ lớn mới chạy song song.

### Quyền riêng tư, tốc độ, quyền truy cập

**Thông báo đồng ý cookie và trang chính sách quyền riêng tư?**
- **Làm được.** Website có banner cookie, và các tag (GA4, Pixel...) chỉ chạy sau khi khách đồng ý (cấu hình trong GTM). Trang Chính sách quyền riêng tư là một trang nội dung, sửa được qua Sanity.
- **Marketing cần:** cung cấp hoặc nhờ pháp lý duyệt nội dung chính sách (theo Nghị định 13/2023 và luật bảo vệ dữ liệu cá nhân mới của Việt Nam). IT chỉ phụ trách phần kỹ thuật.

**Gắn mã tracking có làm trang chậm trên điện thoại không?**
- Có thể chậm một chút, nhưng Astro và Cloudflare Pages cho nền tảng tải nhanh. IT giảm tác động bằng cách tải tag bất đồng bộ, không chặn nội dung.
- IT đo **PageSpeed Insights (bản mobile) trước và sau khi gắn tag**, và báo lại các chỉ số LCP, INP, CLS.
- **Marketing lưu ý:** mỗi tag thêm trong GTM đều làm trang nặng hơn. Chỉ thêm tag thật sự cần dùng.

**Tài khoản Clarity/GA4 đứng tên ai?**
- **Chị Thảo là chủ sở hữu** tất cả tài khoản (GA4, GTM, Clarity, Meta, TikTok). IT và người liên quan được thêm vào với quyền Admin hoặc Editor (mục 1, dòng 6).
- Không để tài khoản đứng tên IT hay freelancer, tránh mất dữ liệu khi đổi người phụ trách.

---

## 4. Thứ tự triển khai

1. **IT:** deploy lên Cloudflare Pages, gắn domain riêng.
2. **Marketing:** tạo GTM, GA4, Clarity, Meta Pixel, TikTok Pixel; thêm email IT vào quyền truy cập; gửi ID cho IT (mục 1).
3. **IT:** gắn GTM, banner cookie, trang chính sách; đo PageSpeed trước và sau.
4. **Marketing:** thêm GA4, Clarity, Pixel vào GTM. **Hoàn tất trước 16/11.**
5. **IT + Marketing:** thống nhất tên sự kiện; IT đánh dấu nút và các phần của trang; marketing tạo trigger trong GTM. Phát hành bộ link UTM.
6. **Marketing:** hỏi Studify về coupon, UTM, pixel. Sau khi có kết quả, IT tạo mục "Ưu đãi" trong Sanity và hộp ưu đãi.
7. **IT + Marketing:** form thu email nối Google Sheet hoặc công cụ email.
8. Chạy thử các phiên bản ưu đãi.

## 5. Việc cần xác nhận từ các bên

| Hỏi ai | Nội dung cần xác nhận |
|---|---|
| **Chị Thảo / Marketing** | Ngày launch. Tên domain. Người phụ trách tạo và giữ các tài khoản marketing. Giá trị X giây và nội dung ưu đãi. Công cụ gửi email (nếu có). |
| **Studify** | Có hỗ trợ coupon không? Có ghi nhận UTM/nguồn khi đăng ký, có báo cáo theo nguồn không? Có cho gắn pixel hoặc trang cảm ơn sau đăng ký không? |
| **Pháp lý** | Duyệt nội dung Chính sách quyền riêng tư và banner cookie. |
