export interface AIRecommendation {
  recovery_load_level: 'Low' | 'Medium' | 'High';
  confidence_score: number;
  feature_importance: Array<{
    feature: string;
    importance: number;
    color?: string;
  }>;
  recommendations: Array<{
    reco_id?: string;
    i18n_key?: string;
    category?: string;
    title?: string;
    description?: string;
  }>;
}

export interface ActionCardItem {
  id: string;
  title: string;
  description: string;
  categoryKey: string;
}

export interface FormData {
  age: string;
  gender: string;
  days_since_injury: string;

  headache: number;
  dizziness: number;
  blurred_vision: number;
  nausea: number;

  worsening_headache: boolean;
  repeated_vomiting: boolean;
  neurological_danger_sign: boolean;

  sleep_quality: number;

  exercised_today: 'yes' | 'no';

  symptoms_worsened_after_activity: 'yes' | 'no';

  screen_time: number;
  study_work_hours: number;
  concentration_difficulty: number;

  mood: number;
  social_support: number;
  overwhelm_level: number;
}
