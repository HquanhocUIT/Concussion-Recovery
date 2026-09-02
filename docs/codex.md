# Context Handover Report — RE:ENTRY / Concussion Recovery

> Cập nhật: 2026-08-22. Tài liệu này dành cho một phiên chat AI mới. Hãy đọc toàn bộ trước khi chỉnh sửa repository hoặc chạy Git.

## 1. Mục tiêu chung — Core Objective

### 1.1 Dự án

Repository local:

```text
D:\CODING\Concussion_Recovery
```

GitHub:

```text
https://github.com/HquanhocUIT/Concussion-Recovery
```

RE:ENTRY là hệ thống hỗ trợ ra quyết định cho người đang hồi phục sau concussion/mild traumatic brain injury.

Mục tiêu chính:

> Giúp người dùng hiểu một kế hoạch hoạt động sắp tới có phù hợp với tình trạng hồi phục gần đây hay không, thử các phương án thay thế và hiểu bằng chứng, độ không chắc chắn cùng giới hạn của kết quả.

Luồng sản phẩm:

```text
Check-in
→ Recovery State
→ Plan
→ Simulate
→ Adjust
→ Compare
→ Explain Why
```

RE:ENTRY không phải công cụ chẩn đoán hoặc thay thế bác sĩ.

### 1.2 Track người dùng phụ trách

Người dùng phụ trách:

```text
Track B — Decision
```

Phạm vi Track B:

```text
Evidence/RAG
→ Safety
→ Planner
→ Orchestrator
→ Explanation
```

Phân chia theo phase:

```text
Phase 1 — Guideline corpus và RAG ingestion
Phase 2 — Retrieval, re-ranking và Safety integration
Phase 3 — Recovery Planner và Orchestrator
Phase 4 — Explanation UI và demo hardening
```

## 2. Quy định và ràng buộc — Rules & Constraints

### 2.1 Clinical safety

Hệ thống phải tuân thủ:

- Không chẩn đoán concussion.
- Không xác nhận người dùng đã hồi phục.
- Không đưa medical clearance.
- Không kê thuốc hoặc điều trị.
- Không đảm bảo một kế hoạch là an toàn.
- Khi thiếu dữ liệu hoặc bằng chứng, phải thể hiện uncertainty.
- Không được tự tạo citation.
- Nếu RAG không tìm thấy evidence, phải báo evidence unavailable.
- Nếu LLM lỗi, logic cốt lõi vẫn phải chạy.
- Safety có quyền veto toàn bộ pipeline.
- Khi có red flag, không được tạo recommendation.

Nguyên tắc:

```text
Recovery/Scenario Engine quyết định
→ RAG cung cấp bằng chứng
→ Safety kiểm tra và có quyền chặn
→ LLM chỉ diễn giải
```

### 2.2 RAG

RAG chỉ là evidence layer:

```text
Không quyết định
Không chẩn đoán
Không tự tạo clinical rule
Không bịa evidence
```

Mỗi kết quả retrieval phải giữ:

- Nội dung gốc.
- Tên guideline.
- Số trang.
- Section.
- Audience.
- Canonical URL.
- DOI nếu có.
- Ranking score.

### 2.3 Population/audience

Audience chuẩn:

```text
adult
pediatric
sport
general
```

Không được âm thầm dùng guideline sai population để lấp đầy kết quả.

Mapping:

```text
adult
→ Living Concussion Guidelines Adults

pediatric
→ PedsConcussion Living Guideline

sport
→ Amsterdam 2022 Consensus Statement
```

### 2.4 Kiến trúc RAG đã chọn

Indexing:

```text
PDF
→ PDF text extraction
→ Chunking
→ MiniLM embeddings
→ Chroma
```

Retrieval:

```text
Query
→ Audience hard filter
→ Query embedding
→ Chroma top 20
→ Hybrid/Cross-encoder re-ranking
→ Top 5 evidence
```

Công nghệ:

- Python/FastAPI.
- `pypdf`.
- `sentence-transformers/all-MiniLM-L6-v2`.
- Chroma `1.5.9`.
- Cross-encoder: `cross-encoder/ms-marco-MiniLM-L-6-v2`.
- CPU-compatible, không yêu cầu GPU.

Chroma đã được nâng từ `0.5.23` lên `1.5.9` vì máy dùng Python 3.13 và bản cũ không có Windows wheel, dẫn đến yêu cầu Visual C++ compiler.

Hai dependency LangChain cũ đã bị loại khỏi Phase 1 vì pipeline hiện không sử dụng chúng.

### 2.5 Git safety

Repository local hiện đang có nhiều thay đổi chưa commit và branch `main` local rất cũ.

Không được chạy ngay:

```powershell
git pull
git reset --hard
git checkout -- .
git clean -fd
```

Nếu chưa kiểm tra và bảo vệ các file local.

Hai worktree tạm trước đây đã được xóa:

```text
D:\CODING\Concussion_Recovery_phase1_pr
D:\CODING\Concussion_Recovery_phase2_pr
```

Chỉ còn workspace chính:

```text
D:\CODING\Concussion_Recovery
```

Các branch và commit PR vẫn tồn tại trên GitHub.

### 2.6 Phong cách làm việc mong muốn

Người dùng muốn:

- Giải thích bằng tiếng Việt.
- Giải thích đơn giản, dễ hiểu như cho người mới.
- Khi báo cáo meeting, chỉ rõ file nào làm gì.
- Luôn phân biệt rõ phần đã merge, phần còn trong PR và phần chỉ tồn tại local.
- Không dùng thuật ngữ mà không giải thích.
- Khi vẽ kiến trúc, ưu tiên workflow dễ đọc.

## 3. Công việc đã hoàn thành và quyết định đã chốt

## Phase 1 — Guideline corpus và RAG ingestion

### 3.1 Mục tiêu

Phase 1 tương ứng với phần Indexing trong RAG:

```text
Guideline PDFs
→ Extract text
→ Chunks
→ Embeddings
→ Chroma searchable index
```

### 3.2 Ba nguồn guideline

Ba nguồn đã được thu thập:

1. Amsterdam 2022 Consensus Statement — sport-related concussion.
2. Living Concussion Guidelines — người lớn.
3. PedsConcussion Living Guideline — trẻ em và thanh thiếu niên.

Trong PR Phase 1, các PDF nằm tại:

```text
rag/data/raw_guidelines/
```

Metadata nằm tại:

```text
rag/data/raw_guidelines/sources.json
```

Manifest chứa:

- `source_id`
- `title`
- `short_title`
- `publisher`
- `year`
- `audience`
- `canonical_url`
- `download_url`
- `doi`
- SHA-256

Amsterdam canonical source là BJSM, nhưng PDF được tải từ mirror lưu trữ vì endpoint BJSM bị Cloudflare chặn tự động. Citation vẫn trỏ về BJSM/DOI chính thức.

### 3.3 PDF loader

File:

```text
rag/src/ingestion/loader.py
```

Vai trò:

> Bộ đọc và trích xuất nội dung PDF.

Nó:

- Đọc từng trang bằng `pypdf`.
- Trích xuất text.
- Bỏ qua trang không có text.
- Gắn source metadata.
- Giữ số trang.
- Báo lỗi nếu thiếu PDF trong manifest.

### 3.4 Chunker

File:

```text
rag/src/chunking/chunker.py
```

Cấu hình:

```yaml
chunk_size: 500
chunk_overlap: 50
```

Mỗi chunk giữ:

- Text.
- Source.
- Page.
- Section.
- Audience.
- Chunk index.
- Character position.

Overlap 50 ký tự giúp hạn chế cắt mất ý giữa hai chunk.

### 3.5 Embedding

File:

```text
rag/src/embeddings/embedder.py
```

Model:

```text
sentence-transformers/all-MiniLM-L6-v2
```

Đặc điểm:

- Chạy CPU.
- Lazy-load model.
- Normalize embeddings.
- Biến mỗi chunk thành vector thể hiện ý nghĩa.

### 3.6 Chroma vector store

File:

```text
rag/src/vectordb/vector_store.py
```

Chroma lưu:

```text
Chunk ID
+ vector
+ text
+ source
+ page
+ section
+ audience
+ URL
+ DOI
```

Generated index:

```text
rag/data/processed/chroma/
```

Thư mục này bị Git ignore và không commit.

### 3.7 Ingestion pipeline

File:

```text
rag/src/ingestion/pipeline.py
```

Workflow:

```text
load_corpus()
→ chunk_pages()
→ MiniLMEmbedder
→ ChromaVectorStore.replace()
```

Lệnh:

```powershell
cd D:\CODING\Concussion_Recovery\rag
.\.venv\Scripts\python.exe main.py ingest
```

Kết quả đã chạy:

```json
{
  "pages": 410,
  "chunks": 2980,
  "sources": 3
}
```

### 3.8 CLI và API Phase 1

File:

```text
rag/main.py
```

CLI:

```powershell
python main.py ingest
python main.py query "why reduce screen time after concussion" --top-k 5
```

API:

```http
GET /retrieve?q=...&top_k=5
```

### 3.9 Kiểm thử Phase 1

Các test chính:

```text
rag/tests/test_chunker.py
rag/tests/test_loader.py
rag/tests/test_vector_store.py
rag/tests/test_health.py
```

Kết quả trên branch PR Phase 1:

```text
5 passed
```

### 3.10 PR Phase 1

PR:

```text
https://github.com/HquanhocUIT/Concussion-Recovery/pull/2
```

Trạng thái hiện tại:

```text
Closed
Merged: true
```

Branch:

```text
track-b-phase1-rag-ingestion
```

Commit:

```text
b2f35c4 feat(rag): add guideline ingestion and vector index
```

Merge commit trong `origin/main`:

```text
e0822e4 Merge pull request #2
```

Phase 1 đã merge vào remote `main`.

## Phase 2 — Retrieval, re-ranking và Safety integration

### 3.11 Kiến trúc Phase 2

Workflow tổng quát:

```text
Safety Input
→ Deterministic Safety Check
→ Block hoặc cho tiếp tục

Nếu được tiếp tục:
Query/Decision
→ Audience hard filter
→ MiniLM query embedding
→ Chroma lấy 20 candidates
→ Hybrid + Cross-encoder re-ranking
→ Top 5 evidence
→ Source/Page/URL/DOI
```

### 3.12 Audience resolver

File trong PR Phase 2:

```text
rag/src/retrieval/audience.py
```

Enum:

```text
general
adult
pediatric
sport
```

Quyết định quan trọng:

> Audience là hard filter trong Chroma, không chỉ là bonus/penalty khi re-rank.

Lý do:

- Khi chỉ trừ điểm sai audience, đoạn pediatric vẫn có thể vượt đoạn sport nếu cross-encoder thấy rất liên quan.
- Hard filtering bảo đảm retrieval không dùng sai population.

### 3.13 Retriever

File:

```text
rag/src/retrieval/retriever.py
```

Workflow:

```text
Validate query
→ Convert audience thành enum
→ Chroma metadata filter
→ Retrieve candidate_k=20
→ Cross-encoder scoring
→ Re-rank
→ Top 5
```

Nếu không có evidence đúng audience:

```text
return []
```

Không lấy evidence sai audience để lấp kết quả.

### 3.14 Re-ranker

File:

```text
rag/src/retrieval/reranker.py
```

Kết hợp:

- Semantic score.
- Keyword overlap.
- Audience information.
- Reference/bibliography penalty.
- Cross-encoder score.

Cross-encoder:

```text
cross-encoder/ms-marco-MiniLM-L-6-v2
```

Vai trò:

```text
MiniLM retrieval
→ nhanh, tìm candidates

Cross-encoder
→ chậm hơn, đọc query và chunk cùng lúc để xếp hạng lại
```

Nếu cross-encoder lỗi:

```text
Fallback về deterministic hybrid ranking
```

### 3.15 Chroma metadata filtering

File được mở rộng:

```text
rag/src/vectordb/vector_store.py
```

`query()` nhận thêm:

```python
metadata_filter
```

Audience được đẩy xuống trực tiếp Chroma `where` filter trước vector search.

Đây là thay đổi làm benchmark sport-related retrieval tăng từ:

```text
Recall@5 0.8333
```

lên:

```text
Recall@5 1.0000
```

### 3.16 Retrieval API/CLI Phase 2

File:

```text
rag/main.py
```

CLI:

```powershell
python main.py query `
  "graduated return to sport strategy" `
  --top-k 5 `
  --audience sport
```

Audience hợp lệ:

```text
adult
pediatric
sport
general
```

API:

```http
GET /retrieve?q=...&top_k=5&audience=sport
```

Output bổ sung:

```json
{
  "rerank_score": 0.765,
  "ranking_factors": {
    "semantic_score": 0.458,
    "keyword_overlap": 0.75,
    "audience_match": true,
    "reference_penalty": 0.0,
    "cross_encoder_score": 0.942
  }
}
```

### 3.17 Benchmark retrieval

Dataset:

```text
rag/data/retrieval_benchmark.json
```

Runner:

```text
rag/src/retrieval/benchmark.py
```

Baseline:

```text
rag/data/benchmark_baseline.json
```

Lệnh:

```powershell
cd rag
.\.venv\Scripts\python.exe main.py benchmark
```

Kết quả đã xác nhận trên branch Phase 2 dựa trên code teammate mới nhất:

```text
Cases:     12
Recall@5:  1.0000
MRR:       0.8194
```

Benchmark gồm câu hỏi:

- Pediatric screen time.
- Return to school.
- Pediatric rest/exercise.
- Adult return to work.
- Adult sleep/headache/activity.
- Sport return-to-sport.
- Relative rest.
- Persisting symptoms.
- Sport retirement.

Giới hạn:

- Chỉ 12 câu curated.
- Không phải clinical validation.
- Chưa đủ adversarial/multilingual coverage.

### 3.18 Safety implementation của teammate

Quan trọng: `origin/main` hiện đã có Safety implementation do teammate merge trước Phase 2 PR.

Các file authoritative trên remote main:

```text
backend/app/schemas/safety.py
backend/app/safety/red_flags.py
backend/app/safety/guardrails.py
backend/app/api/routes/safety.py
backend/tests/test_safety.py
```

Safety contract:

```python
class SafetyInput(BaseModel):
    worsening_headache: bool = False
    repeated_vomiting: bool = False
    neurological_danger_sign: bool = False
```

Safety states:

```text
SAFE
REVIEW_REQUIRED
BLOCKED_RED_FLAG
```

API:

```http
POST /safety/check
```

Guardrail:

```text
BLOCKED_RED_FLAG → downstream_allowed=False
REVIEW_REQUIRED  → downstream_allowed=False
SAFE             → downstream_allowed=True
```

#### Quyết định tích hợp quan trọng

Phase 2 PR không ghi đè Safety của teammate.

Thay vào đó, nó tái sử dụng:

```text
SafetyInput
SafetyResult
evaluate_safety()
enforce_safety()
```

### 3.19 Safety-first orchestrator boundary

File được thêm trong Phase 2 PR:

```text
backend/app/orchestrator/pipeline.py
```

Workflow:

```text
SafetyInput
→ evaluate_safety()
→ enforce_safety()

Nếu downstream_allowed=False:
    recommendation=None
    evidence=[]
    Planner không được gọi
    RAG không được gọi

Nếu downstream_allowed=True:
    gọi Planner
    gọi Evidence Retriever
```

Test:

```text
backend/tests/test_orchestrator_safety_gate.py
```

Test dùng call counter để chứng minh:

```text
Red flag:
Planner calls = 0
RAG calls     = 0
```

### 3.20 Kiểm thử Phase 2 trên latest teammate code

Branch Phase 2 được tạo từ:

```text
origin/main @ 366bfaa
```

Đây là code mới nhất sau PR Track A/Safety của teammate tại thời điểm tạo.

Kết quả:

```text
RAG tests:            10 passed
Full backend suite:   54 passed
Benchmark Recall@5:   1.0000
Benchmark MRR:        0.8194
Compile checks:       passed
git diff --check:     passed
```

### 3.21 PR Phase 2

PR:

```text
https://github.com/HquanhocUIT/Concussion-Recovery/pull/4
```

Trạng thái kiểm tra ngày 2026-08-22:

```text
State: open
Merged: false
Mergeable: true
Draft: false
Base: main
Head: track-b-phase2-retrieval-safety
```

Commit:

```text
143e270 feat(rag): add scoped retrieval reranking and safety gate
```

Remote branch:

```text
origin/track-b-phase2-retrieval-safety
```

PR Phase 2 chưa merge.

## 4. Trạng thái hiện tại — Current State

### 4.1 Remote repository

Remote `main` hiện tại:

```text
366bfaa Merge pull request #3 from LingSeanCoder/feat/BLAN-signal
```

Remote main đã có:

- Phase 1 merged.
- Track A check-in/recovery/scenario.
- Safety foundation/API của teammate.
- Chưa có commit Phase 2 `143e270`.

### 4.2 Local repository

Local branch:

```text
main
```

Local HEAD:

```text
1016791
```

Divergence:

```text
local main:  0 commit riêng
origin/main: đi trước 21 commit
```

Local main rất cũ nhưng workspace đang dirty.

`git status --short` hiện có nhiều file modified/untracked, gồm:

```text
.gitignore
backend/app/main.py
backend/app/orchestrator/pipeline.py
backend/app/safety/guardrails.py
backend/app/safety/red_flags.py
rag/config.yaml
rag/main.py
rag/requirements.txt
RE_ENTRY.md
backend/app/api/routes/safety.py
backend/app/safety/red_flag_rules.json
backend/tests/test_safety.py
docs/PHASE_2.md
rag/README.md
rag/data/benchmark_baseline.json
rag/data/raw_guidelines/*.pdf
rag/data/raw_guidelines/sources.json
rag/data/retrieval_benchmark.json
rag/src/chunking/chunker.py
rag/src/embeddings/embedder.py
rag/src/ingestion/*
rag/src/retrieval/*
rag/src/vectordb/vector_store.py
rag/tests/*
```

### 4.3 Ý nghĩa của dirty workspace

Phần lớn Phase 1 và Phase 2 đã nằm trên GitHub, nhưng local main chưa cập nhật nên Git vẫn thấy chúng là untracked/modified.

Ngoài ra, local workspace có một implementation Safety thử nghiệm cũ khác với Safety contract đã merge của teammate, gồm:

```text
backend/app/safety/red_flag_rules.json
backend/app/safety/red_flags.py
backend/app/safety/guardrails.py
backend/app/api/routes/safety.py
```

Implementation local này từng hỗ trợ:

- Free-text tiếng Anh/Việt.
- Negation.
- Resolved history.
- Local emergency contacts.
- Nhiều red flags hơn.

Nhưng nó không được đưa vào PR Phase 2 vì sẽ ghi đè contract typed của teammate.

Không được xem local Safety này là authoritative.

Authoritative hiện tại là Safety trên `origin/main`.

### 4.4 `RE_ENTRY.md`

File:

```text
D:\CODING\Concussion_Recovery\RE_ENTRY.md
```

Được coi là master/source-of-truth specification trong quá trình làm việc, nhưng hiện vẫn là file untracked local.

Không được xóa hoặc reset file này mà chưa hỏi người dùng.

### 4.5 Worktrees

Hai worktree tạm đã được xóa theo yêu cầu người dùng.

Kết quả:

```text
git worktree list
→ chỉ còn D:/CODING/Concussion_Recovery
```

### 4.6 Vướng mắc hiện tại

1. PR Phase 2 vẫn đang mở và chưa merge.
2. Local main cũ hơn remote 21 commit.
3. Workspace local dirty, có code trùng và code Safety thử nghiệm.
4. Chưa thể pull trực tiếp an toàn nếu không backup/reconcile.
5. Clinical review cho red-flag rules chưa được thực hiện.
6. Benchmark retrieval còn nhỏ.
7. Phase 3 chưa bắt đầu.

## 5. Bước tiếp theo — Next Action Items

### Ưu tiên 1 — Review và merge PR Phase 2

Kiểm tra:

```text
https://github.com/HquanhocUIT/Concussion-Recovery/pull/4
```

Hiện PR mergeable.

Cần teammate:

- Review audience contract.
- Review Chroma metadata filtering.
- Review cross-encoder dependency/runtime.
- Review orchestrator safety boundary.
- Chạy CI.
- Merge khi checks pass.

Không cần sửa Safety typed trong PR trừ khi teammate yêu cầu.

### Ưu tiên 2 — Reconcile local workspace sau khi PR #4 merge

Không chạy reset ngay.

Quy trình đề xuất:

1. Kiểm tra lại `git status`.
2. Sao lưu riêng `RE_ENTRY.md`.
3. So sánh các thay đổi local không có trên remote.
4. Nếu mọi code Phase 1/2 đã nằm trên GitHub:
   - lưu patch hoặc stash có tên;
   - fast-forward local main đến `origin/main`;
   - khôi phục chỉ file thật sự cần giữ.
5. Xóa stash chỉ sau khi xác nhận dữ liệu đã an toàn.

Ví dụ, nhưng chỉ chạy sau khi người dùng phê duyệt:

```powershell
git stash push -u -m "backup-before-sync-after-phase2"
git pull --ff-only origin main
```

Sau đó kiểm tra stash, không tự động drop.

Không dùng:

```powershell
git reset --hard
git clean -fd
```

nếu chưa có xác nhận rõ.

### Ưu tiên 3 — Xác minh local sau sync

Sau khi local main cập nhật:

```powershell
cd D:\CODING\Concussion_Recovery\rag
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe main.py benchmark
```

Kỳ vọng:

```text
RAG: 10 passed
Recall@5: 1.0000
MRR: 0.8194
```

Backend:

```powershell
cd D:\CODING\Concussion_Recovery\backend
python -m pytest -q
```

Kỳ vọng theo branch Phase 2 tích hợp:

```text
54 passed
```

Con số có thể tăng nếu teammate thêm test mới.

### Ưu tiên 4 — Chốt contract với Track A trước Phase 3

Cần xác nhận:

- JSON output của `/simulations`.
- `workload_model()` interface.
- Recovery state schema.
- Plan/activity schema.
- SafetyInput được tạo từ check-in ở đâu.
- Planner sẽ gọi Scenario Engine qua function hay HTTP.
- Evidence Retriever nhận query/decision dạng gì.
- Audience được suy ra từ user profile hay truyền trực tiếp.

Shared simulation contract mẫu trong master spec:

```json
{
  "simulation_id": "sim_001",
  "user_id": "demo_01",
  "recovery_state": {
    "trend": "stable",
    "data_sufficiency": "moderate",
    "uncertainty": "moderate"
  },
  "planned_activity": {
    "cognitive_demand": 72,
    "physical_demand": 61
  },
  "plan_recovery_alignment": "low",
  "overload": true,
  "main_concerns": [
    "high_cognitive_demand",
    "limited_recovery_opportunity"
  ],
  "observed_patterns": [],
  "safety": {
    "status": "clear_for_planning",
    "red_flags_detected": false
  }
}
```

### Ưu tiên 5 — Bắt đầu Phase 3

Phase 3 gồm:

```text
planner/alternatives.py
planner/recovery_planner.py
orchestrator/pipeline.py
```

Mục tiêu:

1. Nhận output Scenario Engine.
2. Nếu overload, sinh nhiều alternative plans.
3. Các phép biến đổi có thể gồm:
   - giảm thời lượng;
   - thêm recovery opportunity;
   - đổi thứ tự;
   - dời hoạt động;
   - bỏ hoạt động không thiết yếu.
4. Chạy từng alternative qua Scenario Engine của Track A.
5. Xếp hạng phương án.
6. Giải thích trade-off.
7. Tìm evidence cho nguyên tắc liên quan.
8. Safety kiểm tra trước và sau pipeline.
9. Nếu LLM lỗi, vẫn trả structured explanation.

Không tự viết clinical threshold mới nếu chưa có Evidence Matrix.

### Ưu tiên 6 — Clinical Evidence Matrix

Cần tạo:

```text
Clinical claim
→ Source
→ Page/section
→ Population
→ Evidence strength
→ Allowed system behavior
→ Limitation
→ Clinical review status
```

Ví dụ:

```text
Claim:
Relative rest may be appropriate in the initial 24–48 hours.

Source:
Amsterdam Consensus

Population:
Sport-related concussion

Allowed behavior:
Explain the general principle.

Not allowed:
Prescribe an exact personalized rest duration or medical clearance.
```

Clinical review phải được đánh dấu rõ:

```text
pending
reviewed
rejected
```

AI không được tự nhận là clinician reviewer.

### Ưu tiên 7 — Mở rộng evaluation

Nâng benchmark từ 12 lên ít nhất 30–50 cases:

- English queries.
- Vietnamese queries.
- Negation.
- Ambiguous questions.
- Wrong population.
- No evidence.
- Reference-only distractors.
- Diagnosis requests.
- Medical clearance requests.
- Adversarial inputs.
- RAG failure.
- Cross-encoder failure.
- Empty Chroma index.

Không được báo Recall@5 `1.0` như clinical accuracy.

## 6. Các file quan trọng cần đọc trong phiên mới

### Master/product specification

```text
D:\CODING\Concussion_Recovery\RE_ENTRY.md
D:\CODING\Concussion_Recovery\README.md
D:\CODING\Concussion_Recovery\docs\task-split-notion.csv
```

Lưu ý: `RE_ENTRY.md` local hiện untracked.

### Phase 1

```text
rag/data/raw_guidelines/sources.json
rag/src/ingestion/loader.py
rag/src/chunking/chunker.py
rag/src/embeddings/embedder.py
rag/src/vectordb/vector_store.py
rag/src/ingestion/pipeline.py
rag/main.py
rag/README.md
```

### Phase 2 PR

```text
rag/src/retrieval/audience.py
rag/src/retrieval/retriever.py
rag/src/retrieval/reranker.py
rag/src/retrieval/benchmark.py
rag/data/retrieval_benchmark.json
rag/data/benchmark_baseline.json
backend/app/orchestrator/pipeline.py
backend/tests/test_orchestrator_safety_gate.py
docs/PHASE_2.md
```

### Safety authoritative trên remote main

```text
backend/app/schemas/safety.py
backend/app/safety/red_flags.py
backend/app/safety/guardrails.py
backend/app/api/routes/safety.py
backend/tests/test_safety.py
```

### Track A integration

```text
backend/app/api/routes/checkins.py
backend/app/api/routes/recovery.py
backend/app/api/routes/scenario.py
backend/app/recovery_intelligence/
backend/app/scenario_engine/
```

## 7. Lệnh kiểm tra nhanh cho phiên chat mới

### Kiểm tra Git trước khi làm gì

```powershell
cd D:\CODING\Concussion_Recovery

git fetch origin --prune
git branch --show-current
git status --short
git log --oneline -10 origin/main
git rev-list --left-right --count main...origin/main
```

### Kiểm tra PR Phase 2

```text
https://github.com/HquanhocUIT/Concussion-Recovery/pull/4
```

### Test RAG

```powershell
cd D:\CODING\Concussion_Recovery\rag

.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe main.py benchmark
```

### Query retrieval

Sau khi Phase 2 có trong branch hiện tại:

```powershell
.\.venv\Scripts\python.exe main.py query `
  "graduated return to sport strategy" `
  --top-k 5 `
  --audience sport
```

### Test backend

```powershell
cd D:\CODING\Concussion_Recovery\backend

python -m pytest -q
```

## 8. Câu mở đầu đề xuất cho phiên chat mới

> Hãy tiếp tục dự án RE:ENTRY từ `docs/codex.md`. Trước tiên, chỉ kiểm tra trạng thái Git và PR #4; không reset, clean, stash hoặc pull vào dirty workspace nếu chưa giải thích cách bảo toàn `RE_ENTRY.md` và các thay đổi local. Nếu PR #4 đã merge, hãy đề xuất quy trình reconcile local main an toàn. Sau khi local sạch và đồng bộ, hãy audit contract giữa Track A Scenario Engine và Track B Planner để chuẩn bị Phase 3.
