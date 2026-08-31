/**
 * Track A backend API client.
 *
 * Calls the real RE:ENTRY backend (docs/contracts/track_a_contract.md).
 * No mock, no fabricated fallback data — every function either returns a
 * real backend response or throws, so callers can drive existing
 * isAnalyzing/stepError-style UI state.
 */

const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Types — mirror the frozen backend schemas exactly (app/schemas/checkin.py,
// app/schemas/recovery.py, app/schemas/simulation.py). Do not add fields
// here that the backend does not accept.
// ---------------------------------------------------------------------------

export type SymptomsWorsenedAfterActivity = "not_applicable" | "no" | "mild" | "moderate" | "severe";

export interface CheckinCreate {
  user_id: string;
  checkin_date: string; // YYYY-MM-DD
  headache: number; // 0-3
  dizziness: number; // 0-3
  blurred_vision: number; // 0-3
  nausea: number; // 0-3
  concentration_difficulty: number; // 0-3
  sleep_hours?: number | null; // 0-24
  sleep_quality?: number | null; // 0-3
  screen_time_minutes: number; // >=0
  study_work_minutes: number; // >=0
  symptoms_worsened_after_activity: SymptomsWorsenedAfterActivity;
  mood?: number | null; // 0-3, display-only on the backend
}

export interface CheckinListItem {
  checkin_id: string;
  user_id: string;
  checkin_date: string;

  headache: number;
  dizziness: number;
  blurred_vision: number;
  nausea: number;

  concentration_difficulty: number;

  sleep_hours?: number | null;
  sleep_quality?: number | null;

  screen_time_minutes: number;
  study_work_minutes: number;

  symptoms_worsened_after_activity: SymptomsWorsenedAfterActivity;

  mood?: number | null;
}

export interface CheckinResponse {
  checkin_id: string;
  status: "created" | "updated";
}

export type Trend = "improving" | "stable" | "worsening" | "insufficient_data";
export type DataSufficiency = "insufficient" | "limited" | "moderate" | "strong";
export type Uncertainty = "low" | "moderate" | "high";

export interface ObservedPattern {
  pattern_id: string;
  type: string;
  category: "user_specific_observed_pattern";
  description: string;
  strength: "weak" | "moderate" | "strong";
  basis: string;
  supporting_days: number;
  activity_attributed: boolean;
}

export interface RecoveryProfileResponse {
  user_id: string;
  as_of_date: string;
  window_days: number;
  checkin_count_in_window: number;
  trend: Trend;
  data_sufficiency: DataSufficiency;
  uncertainty: Uncertainty;
  observed_patterns: ObservedPattern[];
  limitations: string[];
}

export interface ActivityInput {
  activity_id: string;
  duration_minutes: number; // > 0
}

export interface SimulationRequest {
  user_id: string;
  activities: ActivityInput[];
  label: string;
}

export type DemandLevel = "low" | "medium" | "high";

export interface ModeledDemand {
  cognitive_demand_level: DemandLevel;
  physical_demand_level: DemandLevel;
  screen_exposure_level: DemandLevel;
  recovery_opportunity_level: DemandLevel;
}

export type PlanRecoveryAlignment = "good_alignment" | "moderate_concern" | "low_alignment" | "insufficient_data_to_assess";

export interface ExplanationFactor {
  factor: string;
  category: "clinical_evidence" | "user_specific_observed_pattern" | "engineering_model_inference";
  direction: "increases_concern" | "decreases_concern" | "neutral_context";
  description: string;
  activity_attributed?: boolean | null;
}

export interface ScenarioResult {
  simulation_id: string;
  user_id: string;
  created_at: string;
  recovery_state_snapshot: Record<string, unknown>;
  modeled_demand: ModeledDemand;
  plan_recovery_alignment: PlanRecoveryAlignment;
  modeled_overload: boolean;
  main_concerns: string[];
  explanation_factors: ExplanationFactor[];
  uncertainty: Uncertainty;
  data_sufficiency: DataSufficiency;
  limitations: string[];
}

export interface SimulationHistoryItem {
  simulation_id: string;
  user_id: string;
  label: string;
  created_at: string;
  result: ScenarioResult;
}

export async function getSimulationHistory(
  userId: string
): Promise<SimulationHistoryItem[]> {
  return request<SimulationHistoryItem[]>(
    `/simulations/history/${userId}`
  );
}

// SafetyResult — returned by POST /simulations instead of ScenarioResult
// when the (currently placeholder) safety gate blocks execution.
export interface SafetyResult {
  safety_state: "SAFE" | "REVIEW_REQUIRED" | "BLOCKED_RED_FLAG";
  triggered_rule_ids: string[];
  escalation_action: string | null;
  auditable_reason: string;
  downstream_allowed: boolean;
}

export interface SafetyInput {
  worsening_headache: boolean;
  repeated_vomiting: boolean;
  neurological_danger_sign: boolean;
}

export type RecommendationAudience = "general" | "adult" | "pediatric" | "sport";

export interface EvidenceCitation {
  excerpt: string;
  citation: string;
  source_id: string;
  source_title: string;
  canonical_url: string;
  page: number;
  section: string;
  relevance_score: number;
}

export interface PlanAlternative {
  alternative_id: string;
  strategy: "remove_activity" | "reduce_duration" | "postpone_activity";
  title: string;
  rationale: string;
  tradeoff: string;
  activities: ActivityInput[];
  postponed_activity?: ActivityInput | null;
  modeled_demand: ModeledDemand;
  improvement_score: number;
}

export interface RecommendationOption {
  alternative: PlanAlternative;
  explanation: string;
  evidence: EvidenceCitation[];
}

export interface RecommendationResponse {
  status: "recommendations_ready" | "no_change_needed";
  summary: string;
  options: RecommendationOption[];
  confidence_score: number;
  confidence_label: "limited" | "moderate" | "high";
  model_used: string;
  limitations: string[];
  disclaimer: string;
}

export interface RecommendationRequest {
  scenario_result: ScenarioResult;
  activities: ActivityInput[];
  safety_input: SafetyInput;
  audience: RecommendationAudience;
  option_count?: 2 | 3;
}

export interface ValidationErrorDetail {
  field: string;
  issue: string;
}

export interface ValidationErrorResponse {
  status: "error";
  error_type: "validation_error";
  details: ValidationErrorDetail[];
}

// ---------------------------------------------------------------------------
// Error type — thrown by every function below on any non-2xx response.
// Callers should catch this and drive their existing error UI state
// (e.g. stepError) rather than silently falling back to mock data.
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  readonly status: number;
  readonly details?: ValidationErrorDetail[];

  constructor(message: string, status: number, details?: ValidationErrorDetail[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch (networkError) {
    throw new ApiError(
      `Could not reach the backend at ${API_BASE_URL}. Is it running?`,
      0,
    );
  }

  if (!response.ok) {
    let details: ValidationErrorDetail[] | undefined;
    let message = `Request to ${path} failed with status ${response.status}`;
    try {
      const body = (await response.json()) as Partial<ValidationErrorResponse> & { detail?: string };
      if (body.details) {
        details = body.details;
        message = body.details.map((d) => `${d.field}: ${d.issue}`).join("; ");
      } else if (body.detail) {
        message = body.detail;
      }
    } catch {
      // Response wasn't JSON — keep the generic message above.
    }
    throw new ApiError(message, response.status, details);
  }

  // 404 with no body / 204 etc. guard — all Track A endpoints used here
  // always return JSON on success, so this is safe.
  return (await response.json()) as T;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** POST /check-ins — create or upsert one day's check-in. */
export function createCheckin(payload: CheckinCreate): Promise<CheckinResponse> {
  return request<CheckinResponse>("/check-ins", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** GET /check-ins?user_id=... — list a user's check-ins, most recent first. */
export function getCheckins(
  userId: string
): Promise<CheckinListItem[]> {
  return request<CheckinListItem[]>(`/checkins/${userId}`);
}

/** GET /recovery/profile/{user_id} */
export function getRecoveryProfile(userId: string): Promise<RecoveryProfileResponse> {
  return request<RecoveryProfileResponse>(`/recovery/profile/${encodeURIComponent(userId)}`);
}

/**
 * POST /simulations
 *
 * Can return EITHER a ScenarioResult (safety allowed) OR a SafetyResult
 * (safety blocked) — both are HTTP 200. Callers must check for the
 * presence of `safety_state` to tell them apart (see isSafetyResult below).
 */
export function createSimulation(payload: SimulationRequest): Promise<ScenarioResult | SafetyResult> {
  return request<ScenarioResult | SafetyResult>("/simulations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** POST /safety/check — deterministic red-flag gate. */
export function checkSafety(payload: SafetyInput): Promise<SafetyResult> {
  return request<SafetyResult>("/safety/check", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** POST /recommendations — Track B Planner + evidence + Safety + wording layer. */
export function createRecommendations(
  payload: RecommendationRequest,
): Promise<RecommendationResponse | SafetyResult> {
  return request<RecommendationResponse | SafetyResult>("/recommendations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function isSafetyResult(result: unknown): result is SafetyResult {
  return typeof result === "object" && result !== null && "safety_state" in result;
}

export interface SimulationHistoryItem {
  simulation_id: string;
  user_id: string;
  label: string;
  created_at: string;
  result: ScenarioResult;
}

export interface SimulationHistoryItem {
  simulation_id: string;
  user_id: string;
  label: string;
  created_at: string;
  result: ScenarioResult;
}