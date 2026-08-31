# Video Pitch Script — RE:ENTRY (≤ 4 phút)

Track A + B (chung) — Phase 5, Pitch & Video submission.

Yêu cầu nộp bài (theo [`challenge_information.txt`](../challenge_information.txt), Hack for
Humanity): video tối đa 4 phút giải thích (1) vấn đề đang giải quyết, (2) phần mềm và chức năng
chi tiết, (3) cách nó được xây dựng — kèm link GitHub repo public.

Script dưới đây chia theo đúng 3 phần bắt buộc đó, có mốc thời gian, lời thoại gợi ý và cảnh quay
tương ứng. Mọi tính năng nhắc tới trong script đều là tính năng **đã chạy thật** trong repo hiện
tại (đã verify qua test suite và chạy local) — không mô tả tính năng dự định làm nhưng chưa có.

## Tổng thời lượng: ~3'50" (chừa 10s an toàn dưới mốc 4 phút)

---

### Phần 1 — Vấn đề (0:00 – 0:45, ~45s)

**Cảnh quay:** Người nói lên hình hoặc voice-over trên slide/animation đơn giản, không cần demo
app ở phần này.

**Lời thoại gợi ý:**

> Sau một chấn động não — concussion — câu hỏi khó nhất không phải là "tôi có bị chấn thương
> không", mà là: **"Ngày mai tôi có nên đi học, đi làm, hay tập thể thao không?"**
>
> Các app hiện có chủ yếu giúp bạn *theo dõi* triệu chứng — ghi lại hôm nay đau đầu mức mấy,
> ngủ được bao lâu. Nhưng chúng không giúp bạn *quyết định* điều gì sẽ xảy ra nếu bạn thực hiện
> một kế hoạch cụ thể, trước khi bạn thực sự làm nó.
>
> Đó là khoảng trống mà RE:ENTRY giải quyết.

**Điểm bắt buộc phải nói:** vấn đề là *thiếu công cụ lập kế hoạch/dự đoán*, không phải thiếu
công cụ theo dõi — đây là tiền đề cho phần "Innovation & Novelty" ở Phần 2.

---

### Phần 2 — Phần mềm & chức năng chi tiết (0:45 – 3:00, ~2'15")

**Cảnh quay:** Screen recording thật trên `localhost:3001`, đi đúng luồng demo 4 bước đã verify
(xem [`docs/PHASE_3_4.md`](PHASE_3_4.md) §Demo script 4 bước). Quay trước, cắt dựng sau — không
quay live một lần vì cần chờ RAG service phản hồi (~1-2s mỗi lần).

**Đoạn mở — nêu rõ Innovation & Novelty (0:45 – 1:10, ~25s):**

> Điểm khác biệt cốt lõi của RE:ENTRY: đây không phải một app *track* — theo dõi triệu chứng đã
> xảy ra. Đây là một công cụ *plan* — mô phỏng "what-if": bạn nhập một kế hoạch **cho ngày mai**,
> hệ thống mô phỏng mức tải kế hoạch đó gây ra cho não bạn, **trước khi** bạn thực hiện nó.

**Bước 1 — Check-in (1:10 – 1:35, ~25s):**

- Quay: mở Daily Check-in, điền nhanh qua 5 bước (tuổi/giới tính → triệu chứng hôm nay → thể
  chất/giấc ngủ → screen time/học tập → tâm trạng).
- Lời thoại: "Mỗi ngày, người dùng check-in nhanh về triệu chứng và hoạt động. Dữ liệu này xây
  dựng một **Recovery Profile** cá nhân hoá theo thời gian, không phải một ngưỡng chung cho tất
  cả mọi người."

**Bước 2 — Overload / Scenario Simulation (1:35 – 2:05, ~30s):**

- Quay: nhập một kế hoạch hoạt động có cường độ cao (ví dụ coding nhiều giờ + screen time cao),
  hệ thống trả về kết quả `modeled_overload` và cảnh báo trực quan.
- Lời thoại: "Đây là tính năng lõi — **What-if Simulation**. Hệ thống ước lượng tải nhận thức,
  tải thể chất, và mức phơi nhiễm màn hình của kế hoạch, so với khả năng chịu tải hiện tại của
  người dùng — chứ không phải một ngưỡng y khoa cố định cho mọi người."

**Bước 3 — Planner + "Why?" (2:05 – 2:40, ~35s):**

- Quay: xem 3 phương án Planner đề xuất (bớt hoạt động / giảm thời lượng / dời lịch), bấm nút
  **"Why?"** trên một phương án để mở trade-off + guideline excerpt + tên nguồn/trang/link.
- Lời thoại: "Thay vì chỉ nói 'quá tải', hệ thống đưa ra nhiều **phương án thay thế cụ thể**,
  kèm giải thích *tại sao* — trích dẫn trực tiếp từ 3 bộ guideline y khoa thật: Amsterdam 2022
  Consensus Statement, Living Concussion Guidelines, và PedsConcussion — không tự bịa nội dung y
  khoa."

**Bước 4 — Safety gate + Guideline Assistant (2:40 – 3:00, ~20s):**

- Quay: bật một red-flag checkbox ở bước Symptoms, submit, Emergency Modal hiện ngay, không có
  action card nào được tạo. Sau đó mở nhanh nút chat "Guideline Assistant" ở góc màn hình, hỏi
  một câu ví dụ ("How soon can I return to sport?").
- Lời thoại: "Nếu phát hiện dấu hiệu nguy hiểm, hệ thống **chặn cứng** mọi khuyến nghị và yêu
  cầu tìm hỗ trợ y tế ngay — bất kể các module khác nói gì. Người dùng cũng có thể hỏi nhanh
  trợ lý guideline này — trợ lý chỉ trả lời từ bằng chứng đã tìm thấy, không đoán mò khi không
  có bằng chứng."

---

### Phần 3 — Cách nó được xây dựng (3:00 – 3:50, ~50s)

**Cảnh quay:** Có thể quay sơ đồ kiến trúc (đơn giản hoá từ README §3) hoặc voice-over trên vài
đoạn code tiêu biểu (không cần đọc code chi tiết).

**Lời thoại gợi ý:**

> RE:ENTRY được chia thành các module độc lập, chạy theo một chuỗi cố định — quan trọng nhất là
> **thứ tự ưu tiên an toàn**:
>
> Recovery Engine đọc lịch sử check-in và mô phỏng kế hoạch bằng logic rule-based — không dùng
> AI ở bước tính toán này, để kết quả luôn nhất quán và có thể giải thích được.
>
> RAG evidence layer — dùng embedding model MiniLM và vector database Chroma — chỉ tìm và trích
> dẫn bằng chứng, không tự quyết định.
>
> Safety module chạy **trước** mọi bước khác và có quyền phủ quyết toàn bộ pipeline.
>
> Cuối cùng, một lớp LLM — Claude — chỉ đóng vai trò diễn giải kết quả thành ngôn ngữ dễ hiểu.
> Nếu tắt LLM đi, hệ thống vẫn hoạt động đầy đủ với câu trả lời dạng template có căn cứ — AI chỉ
> làm cho dễ đọc hơn, không phải nơi ra quyết định.

**Điểm bắt buộc phải nói:** thứ tự **Recovery Engine → RAG → Safety → LLM**, và nhấn mạnh Safety
có quyền phủ quyết — đây là câu trả lời trực tiếp cho tiêu chí "Responsible AI".

---

### Kết (3:50 – 4:00, ~10s buffer)

> RE:ENTRY: không chỉ theo dõi bạn đang ở đâu, mà giúp bạn quyết định bước tiếp theo. Cảm ơn đã
> xem.

*(Hiện link GitHub repo trên màn hình ở giây cuối.)*

---

## Checklist trước khi nộp

- [ ] Video ≤ 4:00, đã export và xem lại toàn bộ.
- [ ] Cả 3 phần bắt buộc đều có mặt: vấn đề / phần mềm+chức năng / cách xây dựng.
- [ ] Đã nói rõ điểm khác biệt "track vs. plan" (Innovation & Novelty).
- [ ] Demo quay từ app chạy thật (không phải mockup tĩnh).
- [ ] Repo GitHub đã **public**, có README rõ ràng, không chứa secret/API key thật trong commit.
- [ ] Link GitHub repo có trong mô tả video khi nộp.
