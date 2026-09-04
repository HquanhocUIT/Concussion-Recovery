/**
 * Backend response adapter for the existing UI.
 *
 * Backend-derived fields are preserved directly.
 * `confidence_score` is a UI compatibility value derived from the
 * backend's uncertainty and data_sufficiency enums because the existing
 * AIRecommendation UI requires a numeric score.
 *
 * It must not be interpreted as a clinical probability or recovery
 * capacity measurement.
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

  if (viewModel.safetyBlocked) {
    return 'High';
  }

  if (viewModel.simulation) {
    const alignment =
      viewModel.simulation.planRecoveryAlignment;

    if (
      viewModel.simulation.modeledOverload ||
      alignment === 'low_alignment'
    ) {
      return 'High';
    }

    if (
      alignment === 'moderate_concern' ||
      alignment === 'insufficient_data_to_assess'
    ) {
      return 'Medium';
    }

    return 'Low';
  }

  if (
    viewModel.trend === 'worsening'
  ) {
    return 'Medium';
  }

  /**
   * With no simulation, insufficient data should not be
   * represented as a confirmed low load.
   */
  if (
    viewModel.trend === 'insufficient_data' ||
    viewModel.dataSufficiency === 'insufficient'
  ) {
    return 'Medium';
  }

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

/** Turn a backend identifier such as `insufficient_personalization_data`
 * into a readable heading. These ids were previously rendered straight
 * into card titles, so users saw raw snake_case. */
function humaniseFactor(factor: string): string {
  const words = factor.replace(/_/g, ' ').trim();
  if (!words) return 'Model note';
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Rank the drivers the engine actually reported, so the Impact Factors bar
 * and Critical Touchpoints have something to show. The backend returns no
 * numeric weights, so these are evenly spread and are ordering only — not a
 * measured contribution. */
function toFeatureImportance(
  viewModel: RecoveryResultViewModel
): AIRecommendation['feature_importance'] {
  const drivers = (viewModel.simulation?.explanationFactors ?? [])
    .filter((factor) => factor.direction === 'increases_concern')
    .map((factor) => factor.factor);

  const unique = [...new Set(drivers)].slice(0, 4);
  if (unique.length === 0) return [];

  const share = 100 / unique.length;
  return unique.map((feature) => ({
    feature,
    importance: Math.round(share),
  }));
}

export function viewModelToAIRecommendation(
  viewModel: RecoveryResultViewModel
): AIRecommendation {
  // Only model factors are offered as actions. Limitations and observed
  // patterns are context about the analysis, not steps a person can take,
  // and rendering them as action cards produced four identical
  // "Limitation" tiles under a "Recommended Actions" heading.
  const recommendations: AIRecommendation['recommendations'] = (
    viewModel.simulation?.explanationFactors ?? []
  )
    .filter((f) => f.category !== 'clinical_evidence')
    .map((f, i) => ({
      reco_id: `factor-${i}`,
      category: f.category,
      title: humaniseFactor(f.factor),
      description: f.description,
    }));

  return {
    recovery_load_level: toRecoveryLoadLevel(viewModel),
    confidence_score: toConfidenceScore(viewModel),
    feature_importance: toFeatureImportance(viewModel),
    recommendations,
  };
}
