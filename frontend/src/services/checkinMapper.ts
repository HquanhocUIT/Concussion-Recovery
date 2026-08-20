/**
 * Maps the existing survey FormData shape to the backend's frozen
 * CheckinCreate contract (docs/contracts/track_a_contract.md §1.2).
 *
 * IMPORTANT — fields with NO backend equivalent are intentionally
 * dropped, not invented as new backend fields:
 *   age, gender, days_since_injury, exercised_today, social_support,
 *   overwhelm_level
 * `social_support` and `overwhelm_level` were explicitly excluded from
 * the Track A check-in model (Clinical Evidence Matrix §C) — no
 * documented decision uses them. `age`, `gender`, `days_since_injury`,
 * `exercised_today` simply have no corresponding backend field today.
 * This mapper does not invent one; it silently omits them from the
 * request body only (still available in local FormData/UI state for
 * whatever the existing UI already does with them).
 *
 * ASSUMPTION FLAGGED: I have not seen the exact TypeScript type/range
 * for each FormData field (types.ts content was summarized, not pasted
 * in full). The normalizers below accept either a 0-3 scale (matching
 * the backend directly) or a 1-5 Likert scale (a common alternative)
 * and clamp/rescale accordingly. If the real FormData uses a different
 * range, adjust SYMPTOM_SCALE_MAX below to match — everything else
 * derives from that one constant.
 */
import type { CheckinCreate, SymptomsWorsenedAfterActivity } from "./api";

/** Set this to the actual max value your FormData symptom fields use
 * (e.g. 3 if already 0-3, 5 if it's a 1-5 Likert scale). Defaults to 3
 * (assumes FormData already matches the backend's 0-3 scale) — verify
 * against the real types.ts and adjust if wrong. */
const SYMPTOM_SCALE_MAX = 3;

function toBackendSymptomScale(value: number): number {
  if (SYMPTOM_SCALE_MAX === 3) {
    return clamp(Math.round(value), 0, 3);
  }
  // Rescale an arbitrary 0..SYMPTOM_SCALE_MAX (or 1..SYMPTOM_SCALE_MAX)
  // input onto the backend's fixed 0-3 range.
  const normalized = value / SYMPTOM_SCALE_MAX;
  return clamp(Math.round(normalized * 3), 0, 3);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Minimal shape this mapper actually reads from FormData. Field names
 * match what was confirmed present in App.tsx's FormData; adjust types
 * here if the real types.ts differs (see ASSUMPTION note above).
 */
export interface SurveyFormDataForCheckin {
  headache: number;
  dizziness: number;
  blurred_vision: number;
  nausea: number;
  concentration_difficulty: number;
  sleep_quality?: number | null;
  screen_time?: number | null; // minutes — rename target: screen_time_minutes
  study_work_hours?: number | null; // HOURS in FormData per the confirmed field name — converted to minutes below
  symptoms_worsened_after_activity: string; // validated/coerced to the backend enum below
  mood?: number | null;
}

const WORSENED_ENUM_VALUES: SymptomsWorsenedAfterActivity[] = [
  "not_applicable",
  "no",
  "mild",
  "moderate",
  "severe",
];

function toBackendWorsenedEnum(
  value: string
): SymptomsWorsenedAfterActivity {
  const normalized = value.trim().toLowerCase();

  if (normalized === "yes") {
    return "moderate";
  }

  if (normalized === "no") {
    return "no";
  }

  const normalizedEnum = normalized.replace(/\s+/g, "_");

  if (
    (WORSENED_ENUM_VALUES as string[]).includes(
      normalizedEnum
    )
  ) {
    return normalizedEnum as SymptomsWorsenedAfterActivity;
  }

  throw new Error(
    `symptoms_worsened_after_activity value "${value}" ` +
      `does not map to a known backend enum value ` +
      `(${WORSENED_ENUM_VALUES.join(", ")}).`
  );
}

/**
 * Builds a backend-valid CheckinCreate from the existing survey FormData.
 *
 * `userId` and `checkinDate` are NOT part of FormData today (no user
 * concept exists in the current mock flow) — caller must supply them
 * explicitly (e.g. the active demo persona id, and today's date).
 */
export function mapFormDataToCheckinCreate(
  formData: SurveyFormDataForCheckin,
  userId: string,
  checkinDate: string, // YYYY-MM-DD
): CheckinCreate {
  const screenTimeMinutes = Math.max(0, Math.round(formData.screen_time ?? 0));
  // NOTE: field name confirmed as `study_work_hours` — assumed to be in
  // HOURS given the name; converted to minutes for the backend's
  // `study_work_minutes`. If it's actually already minutes despite the
  // name, remove the *60 below.
  const studyWorkMinutes = Math.max(0, Math.round((formData.study_work_hours ?? 0) * 60));

  return {
    user_id: userId,
    checkin_date: checkinDate,
    headache: toBackendSymptomScale(formData.headache),
    dizziness: toBackendSymptomScale(formData.dizziness),
    blurred_vision: toBackendSymptomScale(formData.blurred_vision),
    nausea: toBackendSymptomScale(formData.nausea),
    concentration_difficulty: toBackendSymptomScale(formData.concentration_difficulty),
    sleep_hours: null, // FormData has sleep_quality only, no sleep_hours field confirmed — left null (optional on the backend)
    sleep_quality: formData.sleep_quality != null ? clamp(Math.round(formData.sleep_quality), 0, 3) : null,
    screen_time_minutes: screenTimeMinutes,
    study_work_minutes: studyWorkMinutes,
    symptoms_worsened_after_activity: toBackendWorsenedEnum(formData.symptoms_worsened_after_activity),
    mood: formData.mood != null ? clamp(Math.round(formData.mood), 0, 3) : null,
  };
}
