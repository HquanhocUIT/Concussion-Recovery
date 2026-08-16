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
python main.py query "why reduce screen time after concussion" --top-k 5
uvicorn main:app --reload --port 8100
```

HTTP retrieval:

```text
GET /retrieve?q=why%20reduce%20screen%20time%20after%20concussion&top_k=5
```

Each result contains the passage, cosine similarity score, citation string, page/section, audience, canonical URL, and other source metadata. If ingestion has not run, `/retrieve` returns `409` instead of generating unsupported evidence.

The Chroma directory is generated locally and ignored by Git. Rebuild it with `python main.py ingest`.
