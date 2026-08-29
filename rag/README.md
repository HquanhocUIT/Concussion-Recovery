# RE:ENTRY RAG evidence service

This service indexes three evidence-based concussion resources and returns passages with source, page, section, canonical URL, and DOI metadata. Retrieval explains decisions made elsewhere; it does not make clinical decisions.

## Corpus

- Amsterdam 2022 Consensus Statement, published by the British Journal of Sports Medicine (DOI `10.1136/bjsports-2023-106898`).
- Living Concussion Guidelines for adults, third edition.
- PedsConcussion Living Guideline for children and adolescents.

The PDF files and their provenance are recorded in `data/raw_guidelines/sources.json`. The Amsterdam download uses an archived copy because the canonical BJSM PDF endpoint blocks automated downloads; citations retain the publisher page and DOI.

## Run

From the `rag` directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py ingest
python main.py query "why reduce screen time after concussion" --top-k 5 --audience pediatric
python main.py benchmark
uvicorn main:app --reload --port 8100
```

HTTP retrieval:

```text
GET /retrieve?q=why%20reduce%20screen%20time%20after%20concussion&top_k=5&audience=pediatric
```

Each result contains the passage, cosine similarity score, citation string, page/section, audience, canonical URL, and other source metadata. If ingestion has not run, `/retrieve` returns `409` instead of generating unsupported evidence.

Valid audience values are `adult`, `pediatric`, `sport`, and `general`. A scoped audience is applied as a hard Chroma metadata filter, so evidence from another population cannot fill the result list.

Retrieval gets 20 in-scope candidates and re-ranks them using semantic similarity, keyword overlap, section checks, and `cross-encoder/ms-marco-MiniLM-L-6-v2`. If the cross-encoder cannot load or run, the deterministic hybrid re-ranker remains available.

The MVP benchmark contains source- and content-labelled questions across adult, pediatric, and sport scopes. `python main.py benchmark` reports Recall@5, mean reciprocal rank (MRR), and each failed case. These engineering metrics do not represent clinical validation.

The Chroma directory is generated locally and ignored by Git. Rebuild it with `python main.py ingest`.
