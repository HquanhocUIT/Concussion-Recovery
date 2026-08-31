# RE:ENTRY — AI Recovery Scenario Engine

> **Existing tools help people track recovery. RE:ENTRY helps them plan their return to real life.**

Dự án tham gia **Hack for Humanity** — track **Concussion Recovery** (presented by Concussion
Alliance & Synapse), track phụ **Best Use of AI/ML & Responsible AI**.

Yêu cầu nộp bài: [`challenge_information.txt`](challenge_information.txt).
Tiêu chí chấm điểm chi tiết: [`criteria/Concusion_recovery/`](criteria/Concusion_recovery/).

---

## 1. Problem

Người sau **concussion / mild traumatic brain injury (mTBI)** thường không biết khi nào và ở mức
độ nào họ có thể quay lại học tập, làm việc, thể thao và cuộc sống bình thường.

Các công cụ hiện có chủ yếu tập trung vào **theo dõi triệu chứng đã xảy ra**, nhưng chưa hỗ trợ
người dùng **mô phỏng trước** một kế hoạch hoạt động cụ thể để biết nó có phù hợp với tình trạng
hồi phục gần đây hay không.

## 2. Solution

RE:ENTRY là một hệ thống **hỗ trợ ra quyết định** (decision support), không phải công cụ chẩn
đoán. Hệ thống đọc lịch sử check-in của người dùng để xây dựng Recovery Profile, sau đó cho phép
họ mô phỏng **"what-if"**: nếu tôi thực hiện kế hoạch này, mức tải lên não sẽ ra sao — trước khi
họ thực sự làm.

> Đây là điểm khác biệt cốt lõi so với app theo dõi triệu chứng thông thường: RE:ENTRY không chỉ
> **track** (ghi lại) mà **plan** (mô phỏng trước khi hành động).

### Product flow

```
Check-in → Recovery State → Plan → Simulate → Adjust → Compare → Explain Why
```

### Core pipeline — thứ tự ưu tiên an toàn

```
Daily Check-in Data
        │
        ▼
1. Recovery Intelligence     → đọc lịch sử check-in → Recovery Profile (trend, uncertainty, data sufficiency)
        │
        ▼
2. Scenario Simulation Engine → ước lượng tải kế hoạch (rule-based, deterministic, không dùng LLM)
        │
        ▼
3. Recovery Planner          → khi phát hiện overload, sinh nhiều phương án thay thế kèm trade-off
        │
        ▼
4. Safety Gate               → kiểm tra red-flag TRƯỚC; nếu phát hiện, chặn cứng toàn bộ pipeline
        │            (Planner/RAG/LLM không được gọi khi Safety chặn)
        ▼
5. RAG evidence layer        → CHỈ tìm & trích dẫn bằng chứng guideline, KHÔNG tự quyết định
        │
        ▼
   LLM Composer               → "người phát ngôn": diễn giải kết quả thành câu dễ hiểu
                                 (đổi/tắt LLM, hệ thống vẫn trả về kết quả có căn cứ y hệt,
                                  chỉ khác ở cách diễn đạt)
```

**Nguyên tắc:** Recovery Engine quyết định → Safety có quyền phủ quyết toàn bộ pipeline → RAG
chứng minh bằng guideline thật → LLM chỉ diễn giải. Giá trị cốt lõi nằm ở logic/mô hình dữ liệu,
không nằm ở model ngôn ngữ — tắt LLM, hệ thống vẫn hoạt động đầy đủ với câu trả lời dạng
template có căn cứ.

### Killer feature — What-if Recovery Simulation

Người dùng thử nhiều kịch bản hoạt động khác nhau (đi học, tập gym, coding, đi làm...), hệ thống
mô phỏng mức tải lên não dựa trên Recovery Profile cá nhân, chỉ ra yếu tố nào gây nguy cơ quá tải
(`modeled_overload`), và đề xuất điều chỉnh **trước khi** người dùng thực hiện.

### Guideline Assistant (chat)

Ngoài luồng check-in/simulate, người dùng có thể hỏi nhanh một trợ lý chat nổi ở góc màn hình
(`POST /chat`). Trợ lý này **chỉ trả lời từ bằng chứng RAG tìm thấy** — nếu không tìm được đoạn
guideline đủ liên quan (ngưỡng relevance tối thiểu), nó nói rõ "không có bằng chứng" thay vì bịa
câu trả lời. Cùng đi qua Safety gate như luồng chính.

### ⚠️ Lưu ý y khoa

RE:ENTRY **không chẩn đoán, không xác nhận đã hồi phục, không đưa medical clearance, và không
thay thế bác sĩ**. `modeled_overload` là kết quả so sánh kỹ thuật (engineering heuristic), không
phải kết luận "an toàn/không an toàn" về mặt y khoa. Xem thêm giới hạn cụ thể trong
[`docs/research-foundation.md`](docs/research-foundation.md).

---

## 3. Đáp ứng tiêu chí chấm điểm

| Tiêu chí (giám khảo) | Cách RE:ENTRY đáp ứng | Bằng chứng trong repo |
|---|---|---|
| **Clinical & Domain Effectiveness** (Concussion Alliance) | Toàn bộ luồng bám theo nguyên tắc *graded, symptom-limited return to activity* trong 3 nguồn guideline chuẩn của track | [`docs/research-foundation.md`](docs/research-foundation.md), [`rag/data/raw_guidelines/sources.json`](rag/data/raw_guidelines/sources.json) |
| **Safety & Responsible Design** (Concussion Alliance) | Safety chạy trước Planner/RAG/LLM, có quyền phủ quyết tuyệt đối; không bao giờ tự chẩn đoán hay xác nhận hồi phục | [`backend/app/orchestrator/pipeline.py`](backend/app/orchestrator/pipeline.py), [`backend/tests/test_orchestrator_safety_gate.py`](backend/tests/test_orchestrator_safety_gate.py) |
| **Neuroscience Understanding** (Synapse) | Workload model tách 4 trục nhu cầu (cognitive/physical/screen/recovery) theo đúng cách guideline phân biệt các nguồn kích hoạt triệu chứng | [`docs/research-foundation.md`](docs/research-foundation.md) §3 |
| **Research Foundation** (Synapse) | Mọi evidence trả về đều giữ nguyên nguồn/trang/section/URL; không tự tạo citation; giới hạn được ghi rõ khi không có nguồn | [`docs/research-foundation.md`](docs/research-foundation.md) §5, [`rag/src/retrieval/`](rag/src/retrieval/) |
| **Technical Complexity** (kỹ thuật) | RAG 2 giai đoạn (vector search + cross-encoder re-rank), audience hard-filter, Safety gate deterministic, orchestrator nhiều bước | [`rag/src/retrieval/retriever.py`](rag/src/retrieval/retriever.py), [`backend/app/orchestrator/`](backend/app/orchestrator/) |
| **UX & Accessibility** (kỹ thuật) | Skip link, `:focus-visible`, `aria-pressed`/`role=progressbar`, target ≥44px, `prefers-reduced-motion`, smoke-tested ở 390px | [`docs/PHASE_5_UIUX.md`](docs/PHASE_5_UIUX.md) |

---

## 4. System Architecture (thực tế đã build)

```
Concussion_Recovery/
├── README.md
├── challenge_information.txt        # yêu cầu nộp bài gốc từ BTC
├── criteria/                        # tiêu chí chấm điểm chi tiết (PDF từ BTC)
├── docker-compose.yml                # Postgres + rag + backend cho môi trường production-like
├── .github/workflows/ci.yml          # CI: test + build backend/rag, typecheck + build frontend
├── docs/
│   ├── codex.md                      # nhật ký bàn giao ngữ cảnh giữa các phiên làm việc
│   ├── PHASE_2.md, PHASE_3_4.md, PHASE_5_UIUX.md  # ghi chú triển khai từng phase
│   ├── research-foundation.md        # căn cứ khoa học cho workload model (Research Foundation)
│   ├── video-pitch-script.md         # kịch bản video pitch 4 phút
│   └── screenshots/                  # ảnh chụp before/after UI Phase 5
│
├── frontend/                         # Vite + React + TypeScript
│   ├── src/
│   │   ├── App.tsx                   # toàn bộ luồng UI: check-in, dashboard, action cards
│   │   ├── components/               # ChatWidget (Guideline Assistant), PDFReportWrapper
│   │   ├── services/api.ts           # client gọi backend thật (không mock)
│   │   └── translations.ts           # song ngữ vi/en
│   └── package.json
│
├── backend/                          # FastAPI — API + 5 module lõi + orchestrator
│   ├── app/
│   │   ├── api/routes/               # /check-ins, /recovery, /simulations, /recommendations, /chat, /safety
│   │   ├── recovery_intelligence/    # đọc lịch sử check-in → Recovery Profile
│   │   ├── scenario_engine/          # workload_model.py — ước lượng tải kế hoạch (rule-based)
│   │   ├── planner/                  # sinh & xếp hạng phương án thay thế
│   │   ├── safety/                   # red-flag rules, deterministic, không dùng LLM
│   │   ├── orchestrator/             # pipeline.py — Safety → Planner → RAG → Composer
│   │   │                             # chat_composer.py — lớp diễn giải cho Guideline Assistant
│   │   └── db/                       # SQLite cho local dev (concussion.db)
│   └── tests/                        # 112 test
│
└── rag/                              # RAG evidence service — FastAPI riêng, cổng 8100
    ├── src/
    │   ├── ingestion/                 # PDF → text → chunk
    │   ├── embeddings/                # sentence-transformers/all-MiniLM-L6-v2
    │   ├── vectordb/                  # Chroma, audience hard-filter
    │   └── retrieval/                 # retriever + cross-encoder re-ranker + benchmark
    ├── data/raw_guidelines/           # 3 PDF guideline gốc + sources.json (metadata/citation)
    └── tests/                         # 10 test
```

---

## 5. Chạy dự án (local, đã verify)

Ba service chạy độc lập, không bắt buộc Docker/Postgres cho dev — backend dùng SQLite mặc định
(`backend/app/db/database.py`).

```bash
# Terminal 1 — RAG evidence service
cd rag
python -m venv .venv && .venv/Scripts/activate   # Windows; source .venv/bin/activate trên Linux/Mac
pip install -r requirements.txt
python main.py ingest                             # build Chroma index từ 3 PDF guideline (chạy 1 lần)
python -m uvicorn main:app --host 127.0.0.1 --port 8100

# Terminal 2 — Backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
# health check: http://127.0.0.1:8000/health

# Terminal 3 — Frontend
cd frontend
npm install
echo "VITE_API_BASE_URL=http://127.0.0.1:8000" > .env
npm run dev
```

`ANTHROPIC_API_KEY` là **tuỳ chọn** (`backend/.env`, `rag/.env` — copy từ `.env.example`). Không
có key, `/recommendations` và `/chat` vẫn trả kết quả đầy đủ bằng composer dạng template có căn
cứ (`model_used: "deterministic-grounded-template"`); có key, Claude chỉ diễn đạt lại cho mượt,
không thay đổi quyết định hay citation.

Muốn chạy bằng Docker (Postgres thay vì SQLite): `docker compose up --build`.

CI (`.github/workflows/ci.yml`) tự động chạy test + build Docker image cho `backend`/`rag`, và
typecheck + build cho `frontend` mỗi khi push/PR vào `main`.

---

## 6. Tech Stack (thực tế đã dùng)

| Layer | Công nghệ |
|---|---|
| Frontend | React 19 + TypeScript, Vite, TailwindCSS, Recharts |
| Backend | Python, FastAPI, SQLAlchemy + SQLite (dev) / Postgres (docker-compose) |
| Recovery Intelligence / Scenario Engine / Planner | Python thuần, rule-based/deterministic — không dùng LLM ở bước tính toán |
| RAG | `pypdf`, `sentence-transformers/all-MiniLM-L6-v2`, ChromaDB, `cross-encoder/ms-marco-MiniLM-L-6-v2` re-ranking |
| LLM (diễn giải, tuỳ chọn) | Claude (Anthropic API) — có fallback deterministic khi không có key |
| Deploy | Docker Compose (Postgres + rag + backend); CI qua GitHub Actions |

---

## 7. Nguồn guideline (evidence layer)

| Audience | Nguồn |
|---|---|
| Adult | Living Concussion Guidelines for Adults, 3rd Edition |
| Pediatric | PedsConcussion Living Guideline |
| Sport | Consensus statement on concussion in sport — 6th International Conference (Amsterdam 2022) |

Metadata đầy đủ (tên, publisher, năm, DOI, canonical URL, SHA-256) tại
[`rag/data/raw_guidelines/sources.json`](rag/data/raw_guidelines/sources.json).

---

## 8. Disclaimer

Sản phẩm được xây dựng cho mục đích hackathon/demo. RE:ENTRY không phải là thiết bị y tế, không
chẩn đoán bệnh, và không thay thế tư vấn/chăm sóc y tế chuyên nghiệp.
