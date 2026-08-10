# RE:ENTRY — AI Recovery Scenario Engine

> **Existing tools help people track recovery. RE:ENTRY helps them plan their return to real life.**

Dự án tham gia **Hack for Humanity** — hackathon tập trung vào giải pháp công nghệ cho sức khỏe tinh thần & thể chất.

Track dự thi:
- Mental & Physical Health
- Best Tech for Concussion Recovery
- Best Use of AI/ML & Responsible AI
- Best Innovation and Creativity
- Best Design

---

## 1. Problem

Người sau **concussion / mild traumatic brain injury (mTBI)** thường không biết khi nào và ở mức độ nào họ có thể quay lại học tập, làm việc, thể thao và cuộc sống bình thường.

Các công cụ hiện có chủ yếu tập trung vào **theo dõi triệu chứng**, nhưng chưa thực sự hỗ trợ người dùng **lập kế hoạch và đánh giá khả năng chịu tải cá nhân** trước khi họ thực hiện một hoạt động.

## 2. Solution

RE:ENTRY là một nền tảng AI hỗ trợ quá trình **return-to-life**. Hệ thống xây dựng **Personal Recovery Model** từ dữ liệu hồi phục theo thời gian của người dùng, sau đó cho phép họ nhập kế hoạch hoạt động và sử dụng **What-if Recovery Simulation** để mô phỏng mức độ tải, phát hiện nguy cơ quá tải (overload) và đề xuất cách điều chỉnh phù hợp — có trích dẫn bằng chứng y khoa.

RE:ENTRY **không phải chatbot AI** mà là một **AI Decision Support System**. Hệ thống không cố nói cho người dùng biết họ đang bị gì, mà giúp họ trả lời: *"Ngày mai tôi nên sống như thế nào để vừa quay lại cuộc sống bình thường, vừa không làm chậm quá trình hồi phục?"*

### Core Flow — 5 module lõi + 1 người phát ngôn

```
Daily Check-in Data
        │
        ▼
1. Recovery Intelligence   → đọc lịch sử check-in, học ngưỡng tải cá nhân → Recovery Profile
        │
        ▼
2. Scenario Simulation Engine → ước lượng tải của kế hoạch ngày mai, so với Recovery Capacity
        │
        ▼
3. Recovery Planner        → thử nhiều phương án điều chỉnh, chọn ra các trade-off hợp lý nhất
        │
        ▼
4. RAG (evidence layer)    → CHỈ chứng minh/giải thích quyết định đã có bằng guideline, KHÔNG tự quyết định
        │
        ▼
5. Safety AI (gatekeeper)  → chặn cứng nếu phát hiện red-flag symptoms, bất kể các module trên nói gì
        │
        ▼
   LLM Orchestrator        → "người phát ngôn": ghép kết quả 5 module thành câu trả lời dễ hiểu
                              (không tính toán, không mô phỏng, không tự quyết định — đổi LLM khác
                               hệ thống vẫn hoạt động y hệt)
```

**Nguyên tắc quan trọng:** Recovery Engine (module 1-3) quyết định → RAG chứng minh → Safety xác nhận an toàn → LLM diễn giải. Giá trị cốt lõi của RE:ENTRY nằm ở logic/mô hình dữ liệu cá nhân, không nằm ở model ngôn ngữ.

### Killer Feature — What-if Recovery Simulation

> *"Nếu ngày mai tôi làm những việc này thì sao?"*

Người dùng thử nhiều kịch bản hoạt động khác nhau (đi học, tập gym, chơi game, đi làm...), hệ thống mô phỏng mức tải lên hệ thần kinh dựa trên Personal Recovery Model, chỉ ra yếu tố nào gây nguy cơ quá tải, và đề xuất điều chỉnh **trước khi** người dùng thực hiện.

### AI/ML Components

- **Recovery Intelligence**: phân tích lịch sử check-in, học ngưỡng chịu tải nhận thức (cognitive load) & vận động (physical load) riêng của từng người → tạo Recovery Profile (Recovery Stage, Cognitive/Physical Capacity, Recovery Trend, Recovery Buffer)
- **Scenario Simulation Engine**: ước lượng tải của từng hoạt động trong kế hoạch, cộng dồn và so sánh với Recovery Capacity hiện tại
- **Recovery Planner**: sinh & so sánh nhiều phương án điều chỉnh (bỏ hoạt động nào, giảm thời lượng, dời lịch...) thay vì chỉ đưa một lời khuyên duy nhất
- **RAG evidence layer**: truy xuất bằng chứng từ guideline y khoa (Amsterdam Consensus Statement, CDC Guideline, Concussion Alliance...) để giải thích "tại sao", không dùng để ra quyết định
- **Safety AI**: guardrail cuối cùng, phát hiện red-flag symptoms (đau đầu dữ dội, nôn, mờ mắt...) và chặn mọi khuyến nghị, yêu cầu gặp bác sĩ ngay
- **LLM Orchestrator**: ghép kết quả các module trên thành khuyến nghị dễ hiểu kèm độ tin cậy — thuần vai trò diễn giải, có thể thay model (Claude/GPT/Gemini) mà không ảnh hưởng logic hệ thống

### ⚠️ Lưu ý y khoa

RE:ENTRY **không chẩn đoán và không thay thế bác sĩ**. Đây là công cụ hỗ trợ ra quyết định và lập kế hoạch hồi phục dựa trên dữ liệu cá nhân kết hợp bằng chứng y khoa đã được kiểm chứng (evidence-based).

---

## 3. System Architecture

```
concussion-recovery/
├── README.md
├── docker-compose.yml              # dựng db + backend + rag cùng lúc cho local dev
├── .dockerignore
├── .github/workflows/ci.yml        # CI: build/test backend, rag, frontend; build Docker image làm artifact
├── docs/                          # Pitch deck, kiến trúc, luồng dữ liệu, video demo script
│
├── frontend/                       # Web app (Vite + React + TypeScript, kế thừa từ UI mindscan-ai)
│   ├── public/                     # static assets, favicon, public/data/articles.json
│   ├── src/
│   │   ├── App.tsx                 # toàn bộ UI hiện tại (dashboard, gauge chart, action card...),
│   │   │                           #   đã có sẵn dark/light mode (isDarkMode, Tailwind `dark:`)
│   │   ├── main.tsx                # entry point
│   │   ├── index.css               # theme tokens, background, glassmorphism styles
│   │   ├── components/             # ArticleCard, ArticleSection, PDFReportWrapper, SkeletonArticle...
│   │   ├── services/                # geminiService.ts — sẽ thay/nối vào API client gọi Backend RE:ENTRY
│   │   ├── data/                    # articles.json (dữ liệu mẫu, sẽ thay bằng data thật)
│   │   ├── translations.ts          # đa ngôn ngữ
│   │   ├── types.ts
│   │   └── Modern-Login-master/     # trang login tĩnh (HTML/CSS/JS) — nguồn tham khảo UI đăng nhập,
│   │                                #   cần chuyển thành React component khi tích hợp vào flow chính
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
│   > TODO tích hợp: đổi tên component/route cho khớp domain RE:ENTRY (Check-in, Recovery Dashboard,
│   > What-if Simulator, Plan Tomorrow); nối `services/` vào Backend thay vì gọi thẳng Gemini;
│   > chuyển `Modern-Login-master` thành component đăng nhập React dùng chung theme dark/light của App.tsx.
│
├── backend/                       # Core API + 5 module lõi + orchestrator (FastAPI)
│   ├── app/
│   │   ├── api/routes/             # /checkins, /recovery-profile, /simulate, /plan, /recommendations
│   │   ├── core/                   # config, security, logging
│   │   ├── models/                 # ORM models (User, CheckIn, Activity, Scenario, RecoveryProfile)
│   │   ├── schemas/                 # Pydantic request/response schemas
│   │   ├── services/                # application services, gọi vào các module lõi bên dưới
│   │   │
│   │   ├── recovery_intelligence/  # (1) đọc lịch sử check-in → Recovery Profile
│   │   │   ├── trend_analysis.py   #     phát hiện pattern (ngủ ít → đau đầu tăng, code >4h → nặng hơn...)
│   │   │   └── recovery_profile.py #     build Recovery Stage / Capacity / Trend / Buffer
│   │   │
│   │   ├── scenario_engine/        # (2) Scenario Simulation Engine — "trái tim" của RE:ENTRY
│   │   │   ├── workload_model.py   #     ước lượng tải từng hoạt động (cognitive/physical load)
│   │   │   └── scenario_engine.py  #     cộng dồn tải kế hoạch, so với Recovery Capacity
│   │   │
│   │   ├── planner/                # (3) Recovery Planner — sinh & so sánh phương án thay thế
│   │   │   ├── alternatives.py     #     thử các biến thể (bỏ hoạt động X, giảm giờ Y, dời lịch...)
│   │   │   └── recovery_planner.py #     chọn ra các phương án hợp lý nhất kèm trade-off
│   │   │
│   │   ├── safety/                 # (5) Safety AI — gatekeeper cuối cùng, chạy sau mọi module khác
│   │   │   ├── red_flags.py        #     nhận diện red-flag symptoms
│   │   │   └── guardrails.py       #     chặn cứng khuyến nghị khi có red-flag
│   │   │
│   │   ├── orchestrator/           # (6) LLM Orchestrator — "người phát ngôn", không ra quyết định
│   │   │   ├── pipeline.py         #     chạy tuần tự: Recovery Intelligence → Scenario → Planner → RAG → Safety
│   │   │   └── llm_composer.py     #     ghép kết quả thành câu trả lời + confidence, gọi LLM client trong rag/
│   │   │
│   │   └── db/                     # DB session, migrations helper
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
│
├── rag/                            # (4) RAG evidence layer — CHỈ giải thích/chứng minh, không quyết định
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   ├── config.yaml
│   ├── main.py
│   ├── src/
│   │   ├── ingestion/              # load PDF/guideline nguồn (CDC, RTL/RTP protocols...)
│   │   ├── chunking/                # chia nhỏ tài liệu y khoa
│   │   ├── embeddings/              # tạo vector embedding
│   │   ├── vectordb/                # lưu trữ & truy vấn vector store
│   │   ├── retrieval/               # retriever kết hợp filter theo mức độ hồi phục
│   │   ├── prompts/                 # prompt template cho explainable recommendation
│   │   ├── llm/                     # LLM client (grounded generation + citation)
│   │   ├── api/                     # expose RAG như 1 service nội bộ cho backend gọi
│   │   └── utils/
│   ├── data/
│   │   ├── raw_guidelines/          # tài liệu y khoa gốc (RTL, RTP, mTBI guidelines)
│   │   └── processed/               # đã chunk + embed
│   ├── tests/
│   └── logs/
│
├── data/                           # Data contracts & seed data dùng chung FE/BE
│   ├── schemas/                    # JSON schema / OpenAPI contracts
│   ├── seed/                       # dữ liệu mẫu demo (sample recovery journeys)
│   └── migrations/                 # DB migration scripts
│
└── criteria/                       # Tài liệu tiêu chí chấm giải (đã có sẵn)
```

---

## 4. Chạy dự án (local)

```bash
# Backend + RAG + PostgreSQL cùng lúc
cp backend/.env.example backend/.env
cp rag/.env.example rag/.env
docker compose up --build
# backend: http://localhost:8000/health
# rag:     http://localhost:8100/health

# Frontend (chạy riêng, không Dockerize)
cd frontend
npm install
npm run dev
```

CI (`.github/workflows/ci.yml`) tự động chạy test + build Docker image cho `backend`/`rag` và typecheck + build cho `frontend` mỗi khi push/PR vào `main`.

---

## 5. Tech Stack (đề xuất)

| Layer | Công nghệ |
|---|---|
| Frontend | React + TypeScript, Next.js, TailwindCSS, Recharts (visualize load/trend) |
| Backend | Python, FastAPI, PostgreSQL |
| Recovery Intelligence / Scenario Engine / Planner | Python (rule-based + statistical model trên dữ liệu cá nhân, không dùng LLM) |
| RAG | LangChain/LlamaIndex-style pipeline tự viết, vector DB (Chroma/FAISS), embedding model, LLM API (Claude) |
| Auth & Data privacy | JWT, mã hoá dữ liệu sức khoẻ cá nhân, tuân thủ tinh thần HIPAA-like |
| Deploy | Render (theo yêu cầu "Best Use of Render") |

---

## 6. Roadmap MVP (trong khuôn khổ 1 tháng hackathon)

1. **Onboarding & Data model**: thông tin ban đầu (ngày bị concussion, tuổi, giới tính, công việc, mức hoạt động) + Daily Check-in flow (đau đầu, chóng mặt, giấc ngủ, thời gian dùng máy tính/học/tập thể dục, tâm trạng...).
2. **Recovery Intelligence**: phân tích lịch sử check-in → build Recovery Profile (Stage, Capacity, Trend, Buffer).
3. **Scenario Simulation Engine**: nhập kế hoạch ngày mai → tính tải từng hoạt động, so với Recovery Capacity.
4. **Recovery Planner**: khi phát hiện quá tải, sinh nhiều phương án điều chỉnh và hiển thị trade-off.
5. **RAG evidence layer**: trả lời "Why?" bằng trích dẫn guideline y khoa (Amsterdam Consensus, CDC...).
6. **Safety AI**: phát hiện red-flag symptoms → chặn khuyến nghị, yêu cầu gặp bác sĩ ngay.
7. **LLM Orchestrator**: ghép kết quả tất cả module thành khuyến nghị dễ hiểu kèm độ tin cậy.

---

## 6. Disclaimer

Sản phẩm được xây dựng cho mục đích hackathon/demo. RE:ENTRY không phải là thiết bị y tế, không chẩn đoán bệnh, và không thay thế tư vấn/chăm sóc y tế chuyên nghiệp.
