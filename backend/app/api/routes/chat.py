"""Evidence-grounded guideline chat endpoint."""

from fastapi import APIRouter, Depends

from app.orchestrator.chat_composer import ChatComposer
from app.orchestrator.evidence import RagEvidenceClient
from app.orchestrator.pipeline import run_chat_pipeline
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.safety import SafetyResult


router = APIRouter(tags=["chat"])


def get_evidence_client() -> RagEvidenceClient:
    return RagEvidenceClient()


def get_chat_composer() -> ChatComposer:
    return ChatComposer()


@router.post("/chat", response_model=None)
def chat(
    payload: ChatRequest,
    evidence_client: RagEvidenceClient = Depends(get_evidence_client),
    composer: ChatComposer = Depends(get_chat_composer),
) -> ChatResponse | SafetyResult:
    return run_chat_pipeline(payload, evidence_client, composer)
