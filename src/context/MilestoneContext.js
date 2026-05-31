import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Milestone definitions
const MILESTONES = {
  CALCULATION_10: {
    id: 'calculation_10',
    type: 'modal',
    trigger: { calculation_count: 10 },
    icon: '🎉',
    title: "You're on a Roll!",
    message: "You've completed 10 tax calculations with FiquantTaxPro. You're managing your taxes like a pro!",
    benefits: [
      'Save your calculations for later',
      'Access calculation history',
      'Export professional PDF reports',
      'Remove ads completely'
    ],
    primaryCTAText: 'Start 7-Day Free Trial',
    secondaryCTAText: 'Keep Using Free',
    targetTier: 'starter'
  },
  BULK_PAYE_5: {
    id: 'bulk_paye_5',
    type: 'modal',
    trigger: { bulk_paye_count: 5 },
    icon: '💼',
    title: 'Your Business is Growing!',
    message: "You've processed payroll 5 times with Fiquant. Looks like you're running regular payrolls!",
    benefits: [
      'Process up to 25 employees per calculation',
      'Unlimited monthly calculations',
      'Export payment schedules as PDF',
      '90-day calculation history'
    ],
    primaryCTAText: 'Upgrade to Pro (₦7,999/mo)',
    secondaryCTAText: 'Start Free Trial',
    targetTier: 'pro'
  },
  SAVED_CALCS_3: {
    id: 'saved_calcs_3',
    type: 'banner',
    trigger: { saved_calculations: 3 },
    icon: '📊',
    message: "Nice! You've saved 3 of 5 calculations. Upgrade to Starter for 20 saves (₦4,999/mo)",
    ctaText: 'Learn More',
    ctaUrl: '/pricing',
    targetTier: 'starter'
  },
  PDF_EXPORT_ATTEMPT: {
    id: 'pdf_export_attempt',
    type: 'modal',
    trigger: { pdf_export_attempt: true, tier: 'free' },
    icon: '📄',
    title: 'Professional PDF Reports',
    message: 'Export your calculations as polished PDF reports ready to share with accountants, clients, or save for records.',
    benefits: [
      'Unlimited PDF exports',
      'Tax-compliant formatting',
      'Email PDFs directly to stakeholders'
    ],
    primaryCTAText: 'Try Starter Free for 7 Days',
    secondaryCTAText: 'Maybe Later',
    targetTier: 'starter'
  },
  MULTI_CALCULATOR_3: {
    id: 'multi_calculator_3',
    type: 'modal',
    trigger: { different_calculators_used: 3 },
    icon: '🧮',
    title: "You're a Multi-Tax Power User!",
    message: "You've used 3 different tax calculators. You're getting the full Fiquant experience!",
    benefits: [
      'Access all calculators unlimited',
      'Compare calculations side-by-side',
      'Centralized calculation history',
      'Priority email support'
    ],
    primaryCTAText: 'Start Free Trial',
    secondaryCTAText: 'Continue Free',
    targetTier: 'pro'
  },
  ANALYTICS_ATTEMPT: {
    id: 'analytics_attempt',
    type: 'modal',
    trigger: { analytics_click: true, tier: ['free', 'starter'] },
    icon: '📈',
    title: 'Unlock Tax Analytics & Insights',
    message: 'See patterns in your tax calculations and make smarter financial decisions.',
    benefits: [
      'Monthly tax trends and forecasts',
      'Average PAYE across your team',
      'Year-over-year tax comparisons',
      'Budget planning recommendations'
    ],
    primaryCTAText: 'Try Premium Free for 7 Days',
    secondaryCTAText: 'Maybe Later',
    targetTier: 'premium'
  },
  EMPLOYEE_LIMIT_HIT: {
    id: 'employee_limit_hit',
    type: 'modal',
    trigger: { bulk_paye_employee_limit_hit: true, tier: 'pro' },
    icon: '🚀',
    title: 'Your Team Has Grown - Congrats!',
    message: "You're processing payroll for 25+ employees. Your business is scaling!",
    benefits: [
      'Process unlimited employees in bulk',
      'Import via Excel (no manual entry)',
      'Advanced analytics on payroll costs',
      'Email payslips to all employees at once'
    ],
    primaryCTAText: 'Upgrade to Premium (₦14,999/mo)',
    secondaryCTAText: 'Maybe Later',
    targetTier: 'premium'
  },
  CALC_REVISIONS_3: {
    id: 'calc_revisions_3',
    type: 'modal',
    trigger: { same_calc_revised: 3 },
    icon: '💡',
    title: 'Tired of Manual Re-Entry?',
    message: "We noticed you've revised this calculation a few times. Manual data entry can be tedious!",
    benefits: [
      'Import employee data via Excel (no typing!)',
      'Save calculation templates for reuse',
      'Auto-fill from previous calculations',
      'Duplicate and edit saved calculations'
    ],
    primaryCTAText: 'Try Premium Free for 7 Days',
    secondaryCTAText: 'Keep Doing It Manually',
    targetTier: 'premium'
  },
  FIRST_DOWNLOAD: {
    id: 'first_download',
    type: 'banner',
    trigger: { first_download: true },
    icon: '✅',
    message: 'Downloaded! Tip: Upgrade to save calculations permanently and access them anytime.',
    ctaText: 'Explore Pro Features',
    ctaUrl: '/pricing',
    variant: 'success'
  },
  SIGNUP_30_DAYS: {
    id: 'signup_30_days',
    type: 'email', // Not a modal, tracked for email sending
    trigger: { days_since_signup: 30, calculations_count: 5 },
    targetTier: 'pro'
  }
};

// Frequency capping rules
const FREQUENCY_RULES = {
  max_modals_per_day: 1,
  max_modals_per_session: 1,
  pause_after_dismissals: 3,
  pause_days_after_dismissals: 14,
  pause_during_trial: true,
  pause_after_upgrade: true
};

const MilestoneContext = createContext(null);

export const useMilestones = () => {
  const context = useContext(MilestoneContext);
  if (!context) {
    throw new Error('useMilestones must be used within a MilestoneProvider');
  }
  return context;
};

export const MilestoneProvider = ({ children, userTier = 'free', isTrialActive = false }) => {
  // State for tracking milestones
  const [stats, setStats] = useState({
    calculation_count: 0,
    bulk_paye_count: 0,
    saved_calculations: 0,
    different_calculators_used: new Set(),
    same_calc_revised: 0,
    first_download_shown: false,
    pdf_export_attempted: false
  });

  // State for modal/banner display
  const [activeMilestone, setActiveMilestone] = useState(null);
  const [activeBanner, setActiveBanner] = useState(null);
  
  // Frequency tracking
  const [frequencyState, setFrequencyState] = useState({
    modals_shown_today: 0,
    modals_shown_session: 0,
    dismissal_count: 0,
    last_dismissal_date: null,
    shown_milestones: new Set()
  });

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('fiquant_milestone_stats');
    const savedFrequency = localStorage.getItem('fiquant_frequency_state');
    
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        setStats({
          ...parsed,
          different_calculators_used: new Set(parsed.different_calculators_used || [])
        });
      } catch (e) {
        console.error('Error parsing milestone stats:', e);
      }
    }
    
    if (savedFrequency) {
      try {
        const parsed = JSON.parse(savedFrequency);
        setFrequencyState({
          ...parsed,
          shown_milestones: new Set(parsed.shown_milestones || [])
        });
      } catch (e) {
        console.error('Error parsing frequency state:', e);
      }
    }
    
    // Reset daily counter if new day
    const today = new Date().toDateString();
    const lastModalDate = localStorage.getItem('fiquant_last_modal_date');
    if (lastModalDate !== today) {
      setFrequencyState(prev => ({ ...prev, modals_shown_today: 0 }));
      localStorage.setItem('fiquant_last_modal_date', today);
    }
  }, []);

  // Save stats to localStorage when they change
  useEffect(() => {
    const toSave = {
      ...stats,
      different_calculators_used: Array.from(stats.different_calculators_used)
    };
    localStorage.setItem('fiquant_milestone_stats', JSON.stringify(toSave));
  }, [stats]);

  // Save frequency state
  useEffect(() => {
    const toSave = {
      ...frequencyState,
      shown_milestones: Array.from(frequencyState.shown_milestones)
    };
    localStorage.setItem('fiquant_frequency_state', JSON.stringify(toSave));
  }, [frequencyState]);

  // Check if we can show a modal based on frequency rules
  const canShowModal = useCallback(() => {
    // Don't show during trial if rule is set
    if (FREQUENCY_RULES.pause_during_trial && isTrialActive) {
      return false;
    }
    
    // Don't show if upgraded to paid tier
    if (FREQUENCY_RULES.pause_after_upgrade && ['starter', 'pro', 'premium', 'enterprise'].includes(userTier)) {
      return false;
    }
    
    // Check if paused due to dismissals
    if (frequencyState.dismissal_count >= FREQUENCY_RULES.pause_after_dismissals) {
      const lastDismissal = new Date(frequencyState.last_dismissal_date);
      const daysSince = (Date.now() - lastDismissal.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < FREQUENCY_RULES.pause_days_after_dismissals) {
        return false;
      } else {
        // Reset dismissal count after pause period
        setFrequencyState(prev => ({ ...prev, dismissal_count: 0 }));
      }
    }
    
    // Check daily and session limits
    if (frequencyState.modals_shown_today >= FREQUENCY_RULES.max_modals_per_day) {
      return false;
    }
    if (frequencyState.modals_shown_session >= FREQUENCY_RULES.max_modals_per_session) {
      return false;
    }
    
    return true;
  }, [frequencyState, userTier, isTrialActive]);

  // Check and trigger milestone
  const checkMilestone = useCallback((milestoneId) => {
    const milestone = MILESTONES[milestoneId];
    if (!milestone) return;
    
    // Don't show if already shown
    if (frequencyState.shown_milestones.has(milestone.id)) {
      return;
    }
    
    // Check tier restriction
    if (milestone.trigger.tier) {
      const tierMatch = Array.isArray(milestone.trigger.tier)
        ? milestone.trigger.tier.includes(userTier)
        : milestone.trigger.tier === userTier;
      if (!tierMatch) return;
    }
    
    if (milestone.type === 'modal' && canShowModal()) {
      setActiveMilestone(milestone);
      setFrequencyState(prev => ({
        ...prev,
        modals_shown_today: prev.modals_shown_today + 1,
        modals_shown_session: prev.modals_shown_session + 1,
        shown_milestones: new Set([...prev.shown_milestones, milestone.id])
      }));
    } else if (milestone.type === 'banner') {
      setActiveBanner(milestone);
      setFrequencyState(prev => ({
        ...prev,
        shown_milestones: new Set([...prev.shown_milestones, milestone.id])
      }));
    }
  }, [frequencyState, userTier, canShowModal]);

  // Track calculation
  const trackCalculation = useCallback((calculatorType) => {
    setStats(prev => {
      const newCount = prev.calculation_count + 1;
      const newCalculators = new Set(prev.different_calculators_used);
      newCalculators.add(calculatorType);
      
      // Check milestones
      setTimeout(() => {
        if (newCount === 10) {
          checkMilestone('CALCULATION_10');
        }
        if (newCalculators.size === 3) {
          checkMilestone('MULTI_CALCULATOR_3');
        }
      }, 500);
      
      return {
        ...prev,
        calculation_count: newCount,
        different_calculators_used: newCalculators
      };
    });
  }, [checkMilestone]);

  // Track bulk PAYE
  const trackBulkPaye = useCallback((employeeCount) => {
    setStats(prev => {
      const newCount = prev.bulk_paye_count + 1;
      
      setTimeout(() => {
        if (newCount === 5) {
          checkMilestone('BULK_PAYE_5');
        }
      }, 500);
      
      return {
        ...prev,
        bulk_paye_count: newCount
      };
    });
  }, [checkMilestone]);

  // Track saved calculation
  const trackSavedCalculation = useCallback(() => {
    setStats(prev => {
      const newCount = prev.saved_calculations + 1;
      
      setTimeout(() => {
        if (newCount === 3) {
          checkMilestone('SAVED_CALCS_3');
        }
      }, 500);
      
      return {
        ...prev,
        saved_calculations: newCount
      };
    });
  }, [checkMilestone]);

  // Track PDF export attempt
  const trackPdfExportAttempt = useCallback(() => {
    if (userTier === 'free' && !stats.pdf_export_attempted) {
      setStats(prev => ({ ...prev, pdf_export_attempted: true }));
      checkMilestone('PDF_EXPORT_ATTEMPT');
    }
  }, [userTier, stats.pdf_export_attempted, checkMilestone]);

  // Track analytics click
  const trackAnalyticsClick = useCallback(() => {
    if (['free', 'starter'].includes(userTier)) {
      checkMilestone('ANALYTICS_ATTEMPT');
    }
  }, [userTier, checkMilestone]);

  // Track employee limit hit
  const trackEmployeeLimitHit = useCallback(() => {
    if (userTier === 'pro') {
      checkMilestone('EMPLOYEE_LIMIT_HIT');
    }
  }, [userTier, checkMilestone]);

  // Track calculation revision
  const trackCalcRevision = useCallback(() => {
    setStats(prev => {
      const newCount = prev.same_calc_revised + 1;
      
      setTimeout(() => {
        if (newCount === 3) {
          checkMilestone('CALC_REVISIONS_3');
        }
      }, 500);
      
      return {
        ...prev,
        same_calc_revised: newCount
      };
    });
  }, [checkMilestone]);

  // Track first download
  const trackFirstDownload = useCallback(() => {
    if (!stats.first_download_shown) {
      setStats(prev => ({ ...prev, first_download_shown: true }));
      checkMilestone('FIRST_DOWNLOAD');
    }
  }, [stats.first_download_shown, checkMilestone]);

  // Close modal
  const closeMilestoneModal = useCallback((wasDismissed = false) => {
    setActiveMilestone(null);
    
    if (wasDismissed) {
      setFrequencyState(prev => ({
        ...prev,
        dismissal_count: prev.dismissal_count + 1,
        last_dismissal_date: new Date().toISOString()
      }));
    }
  }, []);

  // Close banner
  const closeMilestoneBanner = useCallback(() => {
    setActiveBanner(null);
  }, []);

  // Reset revision counter (when user starts new calculation)
  const resetRevisionCounter = useCallback(() => {
    setStats(prev => ({ ...prev, same_calc_revised: 0 }));
  }, []);

  const value = {
    // Current milestones
    activeMilestone,
    activeBanner,
    
    // Actions to close
    closeMilestoneModal,
    closeMilestoneBanner,
    
    // Tracking functions
    trackCalculation,
    trackBulkPaye,
    trackSavedCalculation,
    trackPdfExportAttempt,
    trackAnalyticsClick,
    trackEmployeeLimitHit,
    trackCalcRevision,
    trackFirstDownload,
    resetRevisionCounter,
    
    // Stats (for debugging/display)
    stats,
    
    // Milestone definitions
    MILESTONES
  };

  return (
    <MilestoneContext.Provider value={value}>
      {children}
    </MilestoneContext.Provider>
  );
};

export default MilestoneContext;
