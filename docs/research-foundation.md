# Research Foundation — Workload Model

Track A + B (chung) — Phase 5, Research documentation & citation.

## 1. Mục đích tài liệu

Tài liệu này giải thích **tại sao** công thức tính workload trong
[`backend/app/scenario_engine/workload_model.py`](../backend/app/scenario_engine/workload_model.py)
và bảng trọng số trong
[`backend/app/scenario_engine/activity_catalog.py`](../backend/app/scenario_engine/activity_catalog.py)
phản ánh đúng nguyên tắc **graded, symptom-limited return to activity** (hồi phục theo từng
bước, giới hạn bởi triệu chứng) — nguyên tắc lâm sàng cốt lõi trong cả 3 nguồn guideline đã
dùng cho RAG (Track B):

- Living Concussion Guidelines for Adults, 3rd Edition (`living-concussion-guidelines-adults-3e`)
- PedsConcussion Living Guideline (`pedsconcussion-living-guideline`)
- Amsterdam 2022 Consensus Statement (`amsterdam-2022-consensus`)

**Điều tài liệu này KHÔNG làm:** không tuyên bố các con số trọng số cụ thể (ví dụ
`cognitive_demand_weight=80` cho coding) là số liệu lâm sàng đã được đo lường hoặc kiểm định.
Bản thân code đã ghi rõ trong docstring: *"ENGINEERING HEURISTICS FOR MVP... NOT clinically
validated scores"*. Tài liệu này chỉ giải trình **hướng và cấu trúc** của mô hình — việc hoạt
động nào được coi là nặng hơn hoạt động nào, và tại sao — bám theo nguyên tắc định tính trong
guideline, chứ không claim độ chính xác định lượng.

## 2. Nguyên tắc lâm sàng nền tảng: Graded, symptom-limited return to activity

Cả 3 nguồn đều thống nhất một nguyên tắc chung, thay thế cho khuyến cáo "nghỉ ngơi hoàn toàn
kéo dài" trước đây: sau một giai đoạn nghỉ ngắn ban đầu, người bệnh nên **tăng dần hoạt động ở
mức dưới ngưỡng gây triệu chứng** (sub-symptom threshold), chứ không phải hoặc nghỉ hoàn toàn
hoặc hoạt động bình thường.

> "...in pre-injury activities while minimizing symptom exacerbations. Patients should be
> advised that subsymptom threshold levels of activity are recommended. When symptom
> exacerbations occur, patients should be advised to temporarily reduce their physical and
> cognitive demands and resume graduated return-to-activity at a slower pace."
> — Living Concussion Guidelines (Adults), p. 65, *GENERAL CONSIDERATIONS REGARDING REST AND
> RETURN TO ACTIVITY*

> "...those who are not tolerating a graduated return to physical activity, or those who are
> slow to recover..."
> — PedsConcussion Living Guideline, p. 29

> "Beyond an initial period of cognitive and physical rest (24-48 hours after injury), use of
> devices with screens may be gradually resumed at a level..."
> — PedsConcussion Living Guideline, p. 6

Đây là lý do `workload_model.py` được thiết kế để so sánh **mức độ nặng tương đối** giữa các
hoạt động và giữa các phương án kế hoạch — vì nguyên tắc lâm sàng đòi hỏi đúng việc đó: biết
hoạt động/kế hoạch nào "nặng hơn" để có thể giảm tải một cách có chủ đích, không phải để tính
ra một con số rủi ro tuyệt đối.

## 3. Vì sao mô hình dùng 4 trục nhu cầu (cognitive, physical, screen, recovery)

Guideline không mô tả "workload" như một con số đơn lẻ; triệu chứng bị kích hoạt bởi các *loại*
gắng sức khác nhau, và các nguồn phân biệt rõ các loại này:

- **Cognitive demand** — gắng sức tinh thần/tập trung kéo dài. Nguyên tắc pacing dưới ngưỡng
  triệu chứng áp dụng trực tiếp cho hoạt động nhận thức:
  > "...encouraged to participate in low-risk physical and cognitive activities below their
  > symptom exacerbation threshold (at a level that does not bring on..."
  > — PedsConcussion Living Guideline, p. 58

- **Physical demand** — gắng sức thể chất. Cùng nguyên tắc pacing áp dụng, nhưng guideline còn
  đi xa hơn: vận động nhẹ có kiểm soát (light aerobic exercise) được ghi nhận là **có lợi** cho
  hồi phục, không chỉ là thứ cần tránh:
  > "...used in PCS to establish a safe aerobic exercise treatment program to help speed
  > recovery and return to activity. The use of a provocative exercise test is consistent with
  > world expert consensus opinion..."
  > — Living Concussion Guidelines (Adults), p. 250

  Đây là căn cứ cho lý do `walking` và `light_exercise` trong Activity Catalog được gán
  `recovery_opportunity` cao (55 và 35) thay vì bị coi là gánh nặng thuần túy như hoạt động nhận
  thức có cùng mức "physical_demand_weight" thấp.

- **Screen exposure** — guideline tách riêng thời gian dùng màn hình khỏi cognitive demand nói
  chung, với khuyến cáo hạn chế sớm sau chấn thương rồi tăng dần:
  > "Beyond an initial period of cognitive and physical rest (24-48 hours after injury), use of
  > devices with screens may be gradually resumed at a level..."
  > — PedsConcussion Living Guideline, p. 6

  Đây là lý do model tách `screen_exposure_weight` thành một trục riêng thay vì gộp vào
  cognitive demand — ví dụ `coding` (screen=90) được coi là nặng hơn `reading` in ấn
  (screen=15) dù cả hai đều là hoạt động nhận thức chủ động, phản ánh đúng việc guideline coi
  screen time là một nguồn kích hoạt triệu chứng độc lập.

- **Recovery opportunity** — vì nguyên tắc là *cân bằng* gắng sức với phục hồi (không phải chỉ
  tối thiểu hóa gắng sức), model cần một trục đại diện cho mức độ một hoạt động "trả lại" khả
  năng chịu đựng, để Planner (Phase 3) có thể phát hiện kế hoạch thiếu hoạt động phục hồi
  (`no_declared_recovery_activity_in_plan`) — không chỉ phát hiện kế hoạch "quá nặng".

## 4. Vì sao xếp hạng tương đối giữa các hoạt động là hợp lý

Bảng dưới đối chiếu thứ tự nhu cầu tương đối trong Activity Catalog với căn cứ định tính từ
guideline. Đây là logic **thứ bậc** (activity A nặng hơn activity B), không phải khẳng định
từng con số là đo lường lâm sàng.

| Giả định trong catalog | Căn cứ định tính | Nguồn |
|---|---|---|
| `coding` (cognitive=80, screen=90) nặng hơn `reading` in ấn (cognitive=45, screen=15) | Gắng sức nhận thức chủ động, kéo dài, kết hợp screen liên tục — hai yếu tố kích hoạt triệu chứng cộng dồn, so với đọc sách in là gắng sức nhận thức đơn lẻ | Nguyên tắc tách screen exposure khỏi cognitive demand, PedsConcussion p. 6; pacing dưới ngưỡng triệu chứng, Adults p. 65 |
| `class_lecture` (cognitive=50) thấp hơn `studying` (cognitive=70) | Lecture là tiếp nhận thụ động; studying là gắng sức tự định hướng chủ động — guideline coi các dạng gắng sức nhận thức chủ động là yếu tố cần theo dõi pacing chặt hơn | Pacing dưới ngưỡng triệu chứng áp dụng cho hoạt động nhận thức, PedsConcussion p. 58 |
| `walking` (recovery=55) và `light_exercise` (recovery=35) có recovery_opportunity dương, không phải 0 | Light aerobic exercise được khuyến cáo như một phần điều trị hỗ trợ hồi phục, không chỉ là "hoạt động trung tính" | Living Concussion Guidelines (Adults), p. 250 |
| `rest` là điểm tham chiếu recovery_opportunity=100, mọi nhu cầu khác = 0 | Nghỉ hoàn toàn là mốc lâm sàng chuẩn để so sánh — mọi hoạt động khác đều được đánh giá *tương đối* so với việc không gắng sức | Ngầm định trong toàn bộ khung "graded return to activity" của cả 3 nguồn — trạng thái khởi điểm trước khi tăng dần |
| `phone_social_media` có recovery_opportunity thấp (20) dù là "giải trí"/"downtime" | Guideline coi screen time là nguồn kích hoạt triệu chứng bất kể mục đích sử dụng (giải trí hay học tập) — không tự động coi "không phải việc học" là phục hồi | Khuyến cáo hạn chế thiết bị màn hình sau chấn thương, PedsConcussion p. 6 |

## 5. Giới hạn — những gì KHÔNG có căn cứ trích dẫn trực tiếp

Theo đúng nguyên tắc minh bạch về uncertainty trong `docs/codex.md` ("Không được tự tạo
citation"), các điểm sau được ghi nhận rõ là **không** có nguồn guideline trực tiếp:

- **Giá trị số cụ thể của từng trọng số** (ví dụ tại sao `coding` là 80 chứ không phải 75 hay
  85) là lựa chọn thiết kế kỹ thuật (engineering heuristic) để tạo thang so sánh tương đối,
  không phải số đo lâm sàng. Không nguồn nào trong 3 guideline cung cấp thang điểm định lượng
  cho "mức độ nặng" của từng loại hoạt động cụ thể.
- **Ngưỡng phân bucket low/medium/high** (`_LOW_HIGH_BOUNDARY = 34`, `_MEDIUM_HIGH_BOUNDARY =
  66`) là lựa chọn sản phẩm đã ghi chú rõ trong code ("Not clinically derived — a fixed,
  documented product design choice"), không bám theo ngưỡng lâm sàng nào.
- **Thang điểm 0-5 cho `screen_time`/`sleep_quality` trong Daily Check-in** (xem
  `frontend/src/config/recoveryConstants.ts`) là thang exposure tự định nghĩa của sản phẩm để
  thu thập dữ liệu, không phải thang đo đã được validate trong guideline.
- Truy vấn RAG cho "importance of adequate sleep for brain recovery" chỉ trả về các đoạn mô tả
  tần suất rối loạn giấc ngủ sau chấn thương (Living Concussion Guidelines, p. 238, p. 47), chứ
  không phải một khuyến cáo định lượng về số giờ ngủ tối thiểu — nên `sleep_quality` trong
  workload/check-in hiện không có citation trực tiếp cho một ngưỡng cụ thể, chỉ dựa trên tiền đề
  chung "giấc ngủ kém liên quan đến triệu chứng nặng hơn".

## 6. Kết luận

Cấu trúc của `workload_model.py` (4 trục nhu cầu, tính trung bình có trọng số theo thời lượng,
dùng để so sánh *tương đối* giữa các phương án) bám sát nguyên tắc graded, symptom-limited
return to activity mà cả 3 nguồn guideline-evidence đều thống nhất. Các trọng số số học cụ thể
là lựa chọn kỹ thuật cho MVP, không phải số liệu lâm sàng — đúng như giới hạn đã ghi trong code
và trong `docs/codex.md`. Đây là lý do hệ thống luôn hiển thị `modeled_overload` như một kết quả
so sánh kỹ thuật, không phải kết luận "an toàn/không an toàn" về mặt y khoa (xem
`docs/PHASE_3_4.md` §Mục tiêu).
