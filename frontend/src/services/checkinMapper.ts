/**
 * Maps the existing survey FormData shape to the backend's
 * CheckinCreate contract.
 *
 * Fields without a backend equivalent are intentionally omitted:
 * age, gender, days_since_injury, exercised_today,
 * social_support, overwhelm_level.
 */

import type {
  CheckinCreate,
  SymptomsWorsenedAfterActivity,
} from "./api";

import {
  SCREEN_SCORE_TO_MINUTES,
} from "../config/recoveryConstants";

/**
 * The survey UI uses a 0–5 scale.
 * The backend uses a fixed 0–3 scale.
 */
const SURVEY_SCALE_MAX = 5;
const BACKEND_SCALE_MAX = 3;

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(
    max,
    Math.max(min, value)
  );
}

/**
 * Converts a UI value from 0–5
 * to the backend-required 0–3 integer scale.
 */
function toBackendScale(value: number): number {
  const normalized = Number.isFinite(value)
    ? value
    : 0;

  return clamp(
    Math.round(
      (normalized / SURVEY_SCALE_MAX) *
      BACKEND_SCALE_MAX
    ),
    0,
    BACKEND_SCALE_MAX
  );
}

export interface SurveyFormDataForCheckin {
  headache: number;
  dizziness: number;
  blurred_vision: number;
  nausea: number;
  concentration_difficulty: number;

  sleep_quality?: number | null;

  /**
   * UI exposure level on a 0–5 scale.
   * Converted to minutes before sending to the backend.
   */
  screen_time?: number | null;

  /**
   * Existing product convention interprets this value as hours.
   * Converted to minutes before sending to the backend.
   */
  study_work_hours?: number | null;

  /**
   * The current survey UI only provides yes/no.
   */
  symptoms_worsened_after_activity: 'yes' | 'no';

  mood?: number | null;
}

/**
 * Maps the frontend yes/no answer to the backend enum.
 *
 * yes -> moderate
 * no  -> no
 */
function toBackendWorsenedEnum(
  value: 'yes' | 'no'
): SymptomsWorsenedAfterActivity {
  if (value === 'yes') {
    return 'moderate';
  }

  return 'no';
}

/**
 * Builds a backend-valid CheckinCreate
 * from the survey form data.
 */
export function mapFormDataToCheckinCreate(
  formData: SurveyFormDataForCheckin,
  userId: string,
  checkinDate: string
): CheckinCreate {

  const screenTimeMinutes = Math.max(
    0,
    Math.round(
      (formData.screen_time ?? 0) *
      SCREEN_SCORE_TO_MINUTES
    )
  );

  const studyWorkMinutes = Math.max(
    0,
    Math.round(
      (formData.study_work_hours ?? 0) * 60
    )
  );

  return {
    user_id: userId,

    checkin_date: checkinDate,

    headache:
      toBackendScale(formData.headache),

    dizziness:
      toBackendScale(formData.dizziness),

    blurred_vision:
      toBackendScale(formData.blurred_vision),

    nausea:
      toBackendScale(formData.nausea),

    concentration_difficulty:
      toBackendScale(
        formData.concentration_difficulty
      ),

    sleep_hours: null,

    sleep_quality:
      formData.sleep_quality != null
        ? toBackendScale(
            formData.sleep_quality
          )
        : null,

    screen_time_minutes:
      screenTimeMinutes,

    study_work_minutes:
      studyWorkMinutes,

    symptoms_worsened_after_activity:
      toBackendWorsenedEnum(
        formData.symptoms_worsened_after_activity
      ),

    mood:
      formData.mood != null
        ? toBackendScale(formData.mood)
        : null,
  };
}
