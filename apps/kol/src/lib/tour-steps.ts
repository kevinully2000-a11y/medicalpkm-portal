export interface TourStep {
  targetSelector: string;
  title: string;
  description: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export const TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '[data-tour="search"]',
    title: 'Search & Filter',
    description: 'Find briefs by name, specialty, conference, or priority. Filters update in real-time.',
    placement: 'bottom',
  },
  {
    targetSelector: '[data-tour="generate"]',
    title: 'Generate a Brief',
    description: 'Create an AI-powered KOL brief with PubMed-verified research and web search validation.',
    placement: 'bottom',
  },
  {
    targetSelector: '[data-tour="tier"]',
    title: 'Choose Your Depth',
    description: 'Switch between Executive (2-page quick prep), Strategic (key insights), or Comprehensive (full research) views.',
    placement: 'bottom',
  },
  {
    targetSelector: '[data-tour="starters"]',
    title: 'Conversation Starters',
    description: 'Data-grounded talking points with specific publications, trials, and strategic questions for your meeting.',
    placement: 'top',
  },
  {
    targetSelector: '[data-tour="export"]',
    title: 'Export PDF',
    description: 'Download the brief as a formatted PDF to bring to your meeting.',
    placement: 'left',
  },
];

const TOUR_KEY = 'kol-tour-completed';

export function isTourCompleted(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(TOUR_KEY) === 'true';
}

export function completeTour(): void {
  localStorage.setItem(TOUR_KEY, 'true');
}

export function resetTour(): void {
  localStorage.removeItem(TOUR_KEY);
}
