/**
 * Adapts real backend responses (RecoveryProfileResponse, ScenarioResult,
 * SafetyResult) into a small, self-contained view model.
 *
 * This does NOT assume the shape of the existing `AIRecommendation`
 * type (its exact fields were never confirmed in this session) — it
 * defines a fresh, minimal `RecoveryResultViewModel` instead. Wiring
 * this into the existing JSX/AIRecommendation-typed state is the one
 * remaining step that needs either the real `AIRecommendation`
 * interface or the ~30 lines around App.tsx:444-471 to do safely — see
 * the accompanying integration note.
 *
 * No score is invented here. Every field is copied straight from the
 * backend response or left explicitly absent — never randomized, never
 * recomputed on the frontend.
 */
import type { AIRecommendation } from "../types";
import type {
  ExplanationFactor,
  ObservedPattern,
  RecoveryProfileResponse,
  SafetyResult,
  ScenarioResult,
} from "./api";
import { isSafetyResult } from "./api";

export interface RecoveryResultViewModel {
  /** Backend enum values verbatim — DO NOT translate these into a
   * clinical percentage or "capacity" score anywhere in the UI. */
  trend: RecoveryProfileResponse["trend"];
  dataSufficiency: RecoveryProfileResponse["data_sufficiency"];
  uncertainty: RecoveryProfileResponse["uncertainty"];
  checkinCountInWindow: number;
  observedPatterns: ObservedPattern[];
  limitations: string[];

  /** Present only after a simulation has been run. */
  simulation: {
    planRecoveryAlignment: ScenarioResult["plan_recovery_alignment"];
    modeledOverload: boolean;
    mainConcerns: string[];
    explanationFactors: ExplanationFactor[];
    modeledDemand: ScenarioResult["modeled_demand"];
  } | null;

  /** Present only when the (placeholder) safety gate blocked the request. */
  safetyBlocked: {
    reason: string;
    escalationAction: string | null;
  } | null;
}

export function adaptRecoveryProfile(profile: RecoveryProfileResponse): RecoveryResultViewModel {
  return {
    trend: profile.trend,
    dataSufficiency: profile.data_sufficiency,
    uncertainty: profile.uncertainty,
    checkinCountInWindow: profile.checkin_count_in_window,
    observedPatterns: profile.observed_patterns,
    limitations: profile.limitations,
    simulation: null,
    safetyBlocked: null,
  };
}

/** Merge a simulation result into an existing view model built from the
 * recovery profile (call adaptRecoveryProfile first, then this). */
export function mergeSimulationResult(
  base: RecoveryResultViewModel,
  result: ScenarioResult | SafetyResult,
): RecoveryResultViewModel {
  if (isSafetyResult(result)) {
    return {
      ...base,
      simulation: null,
      safetyBlocked: {
        reason: result.auditable_reason,
        escalationAction: result.escalation_action,
      },
    };
  }

  return {
    ...base,
    simulation: {
      planRecoveryAlignment: result.plan_recovery_alignment,
      modeledOverload: result.modeled_overload,
      mainConcerns: result.main_concerns,
      explanationFactors: result.explanation_factors,
      modeledDemand: result.modeled_demand,
    },
    safetyBlocked: null,
  };
}

/**
 * User-facing copy helpers — enforce the frozen "never say X, say Y"
 * rule (docs/contracts/track_a_contract.md §7) in exactly one place.
 */
export function trendDisplayText(trend: RecoveryProfileResponse["trend"]): string {
  switch (trend) {
    case "improving":
      return "Your recent symptom pattern: improving";
    case "worsening":
      return "Your recent symptom pattern: showing higher reported symptoms recently";
    case "stable":
      return "Your recent symptom pattern: stable";
    case "insufficient_data":
      return "Not enough recent check-ins yet to identify a pattern";
  }
}

export function toRecoveryLoadLevel(
  viewModel: RecoveryResultViewModel
): 'Low' | 'Medium' | 'High' {
  if (viewModel.safetyBlocked) return 'High';

  if (viewModel.simulation) {
    if (viewModel.simulation.modeledOverload) return 'High';
    if (viewModel.simulation.planRecoveryAlignment === 'moderate_concern') {
      return 'Medium';
    }
    return 'Low';
  }

  if (viewModel.trend === 'worsening') return 'Medium';
  return 'Low';
}

function toConfidenceScore(viewModel: RecoveryResultViewModel): number {
  const uncertaintyScore = {
    low: 0.9,
    moderate: 0.6,
    high: 0.3,
  }[viewModel.uncertainty];

  const sufficiencyScore = {
    strong: 1,
    moderate: 0.8,
    limited: 0.5,
    insufficient: 0.2,
  }[viewModel.dataSufficiency];

  return Math.round(((uncertaintyScore + sufficiencyScore) / 2) * 100) / 100;
}

export function viewModelToAIRecommendation(
  viewModel: RecoveryResultViewModel
): AIRecommendation {
  const recommendations: AIRecommendation['recommendations'] = [
    ...viewModel.limitations.map((text, i) => ({
      reco_id: `limitation-${i}`,
      category: 'limitation',
      title: 'Limitation',
      description: text,
    })),

    ...(viewModel.simulation?.explanationFactors ?? [])
      .filter((f) => f.category !== 'clinical_evidence')
      .map((f, i) => ({
        reco_id: `factor-${i}`,
        category: f.category,
        title: f.factor,
        description: f.description,
      })),

    ...viewModel.observedPatterns.map((p, i) => ({
      reco_id: `pattern-${i}`,
      category: p.type,
      title: 'Observed pattern',
      description: p.description,
    })),
  ];

  return {
    recovery_load_level: toRecoveryLoadLevel(viewModel),
    confidence_score: toConfidenceScore(viewModel),
    feature_importance: [],
    recommendations,
  };
}
