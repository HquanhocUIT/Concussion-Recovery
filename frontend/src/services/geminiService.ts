import type { AIRecommendation, FormData } from '../types';

export const analyzeSurveyData = async (formData: FormData, language: string): Promise<AIRecommendation> => {
  // Mock AI response for demo (replace with a real backend / LLM call).
  // "recovery_load_level" is the AI's estimate of how much daily-activity
  // load the user's brain can currently tolerate ('Low' | 'Medium' | 'High'
  // risk of symptom flare-up), NOT a mental-health stress score.
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

  const features = [
    { feature: 'headache', importance: Math.random() * 25 + 10 },
    { feature: 'dizziness', importance: Math.random() * 20 + 10 },
    { feature: 'sleep_quality', importance: Math.random() * 25 + 10 },
    { feature: 'screen_time', importance: Math.random() * 20 + 10 },
    { feature: 'cognitive_load', importance: Math.random() * 15 + 5 },
  ].sort((a, b) => b.importance - a.importance);

  const symptomScore = Number(formData.headache) + Number(formData.dizziness) + Number(formData.blurred_vision) + Number(formData.nausea);
  const cognitiveScore = Number(formData.screen_time) + Number(formData.study_work_hours) + Number(formData.concentration_difficulty);
  const worsenedPenalty = formData.symptoms_worsened_after_activity === 'yes' ? 6 : 0;
  const totalScore = symptomScore * 2 + cognitiveScore + worsenedPenalty + Number(formData.overwhelm_level);
  const recovery_load_level = totalScore > 40 ? 'High' : totalScore > 20 ? 'Medium' : 'Low';
  const confidence_score = 0.85 + Math.random() * 0.15;

  return {
    recovery_load_level,
    confidence_score,
    feature_importance: features.slice(0, 5),
    recommendations: [
      {
        i18n_key: recovery_load_level === 'High' ? 'highStress' : 'sleep',
        category: 'mental'
      }
    ]
  };
};

