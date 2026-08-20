export type DemoPersonaId =
  | 'demo_stable'
  | 'demo_improving'
  | 'demo_overload'
  | 'demo_insufficient_data';

export interface DemoPersona {
  id: DemoPersonaId;
  label: string;
  description: string;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'demo_stable',
    label: 'Stable',
    description: 'Recent symptom pattern is stable.',
  },
  {
    id: 'demo_improving',
    label: 'Improving',
    description: 'Recent symptom pattern is improving.',
  },
  {
    id: 'demo_overload',
    label: 'Overload',
    description: 'Higher exposure with higher reported symptoms.',
  },
  {
    id: 'demo_insufficient_data',
    label: 'Insufficient Data',
    description: 'Not enough recent check-ins to identify a pattern.',
  },
];

export const DEFAULT_DEMO_PERSONA_ID: DemoPersonaId = 'demo_stable';