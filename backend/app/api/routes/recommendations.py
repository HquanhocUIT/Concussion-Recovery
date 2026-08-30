"""Track B explainable recommendation endpoint."""

from fastapi import APIRouter, Depends

from app.orchestrator.evidence import RagEvidenceClient
from app.orchestrator.llm_composer import RecommendationComposer
from app.orchestrator.pipeline import run_recommendation_pipeline
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.schemas.safety import SafetyResult


router = APIRouter(tags=["recommendations"])


def get_evidence_client() -> RagEvidenceClient:
    return RagEvidenceClient()


def get_recommendation_composer() -> RecommendationComposer:
    return RecommendationComposer()


@router.post("/recommendations", response_model=None)
def create_recommendations(
    payload: RecommendationRequest,
    evidence_client: RagEvidenceClient = Depends(get_evidence_client),
    composer: RecommendationComposer = Depends(get_recommendation_composer),
) -> RecommendationResponse | SafetyResult:
    return run_recommendation_pipeline(payload, evidence_client, composer)
