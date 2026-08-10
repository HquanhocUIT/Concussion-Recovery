from fastapi import FastAPI

app = FastAPI(
    title="RE:ENTRY — RAG Evidence Service",
    description="Retrieves and cites medical guideline evidence for Recovery Engine decisions. "
                 "This service explains recommendations; it does not generate them.",
    version="0.1.0",
)


@app.get("/health")
def health():
    return {"status": "ok"}
