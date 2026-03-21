export interface TourStep {
  targetSelector: string;
  title: string;
  description: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

// Library page tour (shown on first visit)
export const LIBRARY_TOUR_STEPS: TourStep[] = [
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
];

// Brief viewer tour (shown on first brief view)
export const BRIEF_TOUR_STEPS: TourStep[] = [
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

const LIBRARY_TOUR_KEY = 'kol-library-tour-completed';
const BRIEF_TOUR_KEY = 'kol-brief-tour-completed';

export function isLibraryTourCompleted(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(LIBRARY_TOUR_KEY) === 'true';
}

export function isBriefTourCompleted(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(BRIEF_TOUR_KEY) === 'true';
}

export function completeLibraryTour(): void {
  localStorage.setItem(LIBRARY_TOUR_KEY, 'true');
}

export function completeBriefTour(): void {
  localStorage.setItem(BRIEF_TOUR_KEY, 'true');
}

export function resetTours(): void {
  localStorage.removeItem(LIBRARY_TOUR_KEY);
  localStorage.removeItem(BRIEF_TOUR_KEY);
}

// Legacy — keep for backward compat
export function isTourCompleted(): boolean {
  return isLibraryTourCompleted();
}

export function completeTour(): void {
  completeLibraryTour();
}

export function resetTour(): void {
  resetTours();
}
