'use client';

import { useState, useEffect, useCallback } from 'react';
import { TOUR_STEPS, completeTour, type TourStep } from '@/lib/tour-steps';

interface TooltipPosition {
  top: number;
  left: number;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);

  const step = TOUR_STEPS[currentStep];

  const positionElements = useCallback((tourStep: TourStep) => {
    const target = document.querySelector(tourStep.targetSelector);
    if (!target) {
      // Skip to next step if target not found
      if (currentStep < TOUR_STEPS.length - 1) {
        setCurrentStep((s) => s + 1);
      } else {
        handleComplete();
      }
      return;
    }

    const rect = target.getBoundingClientRect();
    const padding = 8;

    setSpotlight({
      top: rect.top - padding + window.scrollY,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    // Position tooltip relative to target
    const tooltipWidth = 320;
    const tooltipHeight = 140;
    let top = 0;
    let left = 0;

    switch (tourStep.placement) {
      case 'bottom':
        top = rect.bottom + padding + 12 + window.scrollY;
        left = Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16));
        break;
      case 'top':
        top = rect.top - padding - tooltipHeight - 12 + window.scrollY;
        left = Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16));
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2 + window.scrollY;
        left = rect.left - padding - tooltipWidth - 12;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2 + window.scrollY;
        left = rect.right + padding + 12;
        break;
    }

    setTooltipPos({ top, left });
  }, [currentStep]);

  useEffect(() => {
    // Small delay to let the page render
    const timer = setTimeout(() => {
      setVisible(true);
      positionElements(TOUR_STEPS[0]);
    }, 500);
    return () => clearTimeout(timer);
  }, [positionElements]);

  useEffect(() => {
    if (!visible) return;
    positionElements(step);

    const handleResize = () => positionElements(step);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentStep, step, visible, positionElements]);

  const handleComplete = useCallback(() => {
    completeTour();
    setVisible(false);
    onComplete();
  }, [onComplete]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  if (!visible || !spotlight) return null;

  return (
    <div className="fixed inset-0 z-50" style={{ pointerEvents: 'auto' }}>
      {/* Overlay with spotlight cutout using box-shadow */}
      <div
        className="absolute rounded-lg transition-all duration-300"
        style={{
          top: spotlight.top,
          left: spotlight.left,
          width: spotlight.width,
          height: spotlight.height,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          pointerEvents: 'none',
          zIndex: 51,
        }}
      />

      {/* Tooltip */}
      <div
        className="absolute bg-white rounded-xl shadow-2xl border border-gray-200 p-5 transition-all duration-300"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: 320,
          zIndex: 52,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-gray-900">{step.title}</h3>
          <span className="text-xs text-gray-400">{currentStep + 1}/{TOUR_STEPS.length}</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">{step.description}</p>
        <div className="flex items-center justify-between">
          <button
            onClick={handleComplete}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip tour
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition-colors"
          >
            {currentStep < TOUR_STEPS.length - 1 ? 'Next' : 'Done'}
          </button>
        </div>
      </div>

      {/* Click-blocker overlay (transparent, behind spotlight) */}
      <div
        className="absolute inset-0"
        onClick={handleComplete}
        style={{ zIndex: 50 }}
      />
    </div>
  );
}
