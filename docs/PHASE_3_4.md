# Track B — Phase 3 & 4

## Mục tiêu

Phase 3 biến kết quả mô phỏng của Track A thành các phương án kế hoạch có thể so sánh, kèm trade-off, bằng chứng guideline và confidence. Phase 4 đưa phần giải thích và Safety vào UI để demo end-to-end.

Đây là công cụ hỗ trợ quyết định. `modeled_overload` là kết quả so sánh kỹ thuật, không phải kết luận kế hoạch “an toàn/không an toàn” về mặt y khoa.

## Kiến trúc đã triển khai

```text
Track A ScenarioResult + submitted activities + explicit SafetyInput
                              │
                              ▼
                    Safety gate (authoritative)
                    ├─ BLOCKED → SafetyResult → Emergency Modal
                    └─ SAFE
                         │
                         ▼
            alternatives.py: tạo 3 biến thể
            ├─ bỏ hoạt động có modeled impact lớn nhất
            ├─ giảm một nửa thời lượng hoạt động đó
            └─ dời hoạt động đó sang ngày khác
                         │
                         ▼
          workload_model.calculate_activity_load()
              tính lại demand cho từng phương án
                         │
                         ▼
        recovery_planner.py: xếp hạng + giữ 2–3 phương án
                         │
                         ▼
       RAG /retrieve: excerpt + source + page + section + URL
                         │
                         ▼
        llm_composer.py: Claude nếu có key, grounded fallback nếu không
                         │
                         ▼
          POST /recommendations → options + citations + confidence
                         │
                         ▼
        React: Action Card → “Why?” → citation → simulate again
```

Safety chạy trước Planner/RAG/LLM. Vì vậy red flag luôn chặn downstream, bất kể `modeled_overload` là `true` hay `false`.

## File chính

### Backend

- `backend/app/schemas/recommendation.py`: request/response contract của `/recommendations`.
- `backend/app/planner/alternatives.py`: sinh ba biến thể và gọi trực tiếp workload model của Track A.
- `backend/app/planner/recovery_planner.py`: xếp hạng theo cải thiện modeled demand và tính khả thi.
- `backend/app/orchestrator/evidence.py`: gọi RAG service, chỉ nhận citation đủ source/page/section/URL.
- `backend/app/orchestrator/llm_composer.py`: lớp diễn đạt; không được tự thay đổi quyết định/citation.
- `backend/app/orchestrator/pipeline.py`: Safety → Planner → RAG → Composer, confidence và limitations.
- `backend/app/api/routes/recommendations.py`: endpoint `POST /recommendations`.
- `backend/tests/test_recommendations.py`: test Planner, hard safety block, citations, confidence và API.

### Frontend

- `frontend/src/services/api.ts`: type và client cho `/recommendations`.
- `frontend/src/types.ts`: ba câu trả lời red-flag rõ ràng trong check-in.
- `frontend/src/App.tsx`:
  - gọi Track B sau khi nhận `ScenarioResult`;
  - hiển thị Planner options trước các suggestion cũ;
  - nút “Why?” mở excerpt + citation;
  - nút “Simulate this alternative” gửi kế hoạch thay thế lại Track A;
  - không render action cards khi Safety blocked;
  - Emergency Modal dùng `role="alertdialog"`, focus khi mở và không phụ thuộc modeled load.
- `frontend/src/translations.ts`: sửa Emergency copy để nói đúng red flag, không gọi modeled load là nguy hiểm.

## Contract `POST /recommendations`

Request tối thiểu:

```json
{
  "scenario_result": { "...": "Track A ScenarioResult đầy đủ" },
  "activities": [
    { "activity_id": "coding", "duration_minutes": 180 }
  ],
  "safety_input": {
    "worsening_headache": false,
    "repeated_vomiting": false,
    "neurological_danger_sign": false
  },
  "audience": "adult",
  "option_count": 3
}
```

Nếu có red flag, response là `SafetyResult` và không chạy Planner/RAG/LLM. Nếu Safety cho phép, response gồm:

- `options[]`: phương án, demand tính lại, trade-off, explanation và evidence;
- `confidence_score`: độ tin cậy của pipeline quyết định, không phải xác suất y khoa;
- `limitations[]` và disclaimer;
- `model_used`: tên Claude hoặc `deterministic-grounded-template`.

Khi RAG không sẵn sàng, endpoint vẫn trả phương án rule-based nhưng evidence rỗng, confidence bị giới hạn và limitation nói rõ. Hệ thống không tạo citation giả.

## Cấu hình

```env
# backend/.env
RAG_SERVICE_URL=http://localhost:8100
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-5
```

Không bắt buộc có Anthropic key để demo. Có key thì Claude chỉ viết lại nội dung đã grounded; không có key thì deterministic composer hoạt động.

## Chạy local

Terminal 1 — RAG:

```powershell
cd D:\CODING\Concussion_Recovery\rag
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8100
```

Terminal 2 — Backend:

```powershell
cd D:\CODING\Concussion_Recovery\backend
python -m uvicorn app.main:app --reload --port 8000
```

Terminal 3 — Frontend:

```powershell
cd D:\CODING\Concussion_Recovery\frontend
npm run dev
```

## Demo script 4 bước

1. Hoàn thành Daily Check-in với kế hoạch có thời lượng screen/study cao, không chọn red flag.
2. Xem kết quả Track A báo `modeled_overload` và ba phương án Planner xuất hiện.
3. Bấm **Why?** ở một phương án để xem trade-off, guideline excerpt, tên nguồn, trang/section và link.
4. Bấm **Simulate this alternative**; kế hoạch thay thế được gửi lại Track A và UI cập nhật kết quả mới.

Demo Safety riêng: chọn một red-flag checkbox ở bước Symptoms. Khi submit, `/recommendations` trả `BLOCKED_RED_FLAG`, không có action card và Emergency Modal mở ngay.

## Kết quả xác minh ngày 2026-08-29

- Backend: `106 passed`.
- RAG: `10 passed` bằng `rag/.venv`.
- Frontend: `npm run lint` pass.
- Frontend: `npm run build` pass.
- End-to-end backend → RAG thật:
  - HTTP `200`;
  - `3` phương án;
  - `2` citation/phương án;
  - confidence `0.77` trong case kiểm thử;
  - composer fallback hoạt động khi không có Anthropic key.

Vite còn cảnh báo bundle lớn hơn 500 kB. Đây là tối ưu hiệu năng nên làm sau; không chặn chức năng Phase 3–4.
