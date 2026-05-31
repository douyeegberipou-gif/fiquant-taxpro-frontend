import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import api from '../config/api';

const DraftContext = createContext();

const DRAFT_TYPES = {
  CALCULATOR_FORM: 'calculator_form',
  BULK_PAYE: 'bulk_paye',
  REPORT_CONFIG: 'report_config',
  CGT_FORM: 'cgt_form',
  CIT_FORM: 'cit_form',
  VAT_FORM: 'vat_form'
};

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const DEBOUNCE_DELAY = 3000; // 3 seconds

export const DraftProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [drafts, setDrafts] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [pendingDrafts, setPendingDrafts] = useState([]);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  
  const saveTimeoutRef = useRef(null);
  const autoSaveIntervalRef = useRef(null);

  // Register a draft (call when form data changes)
  const registerDraft = useCallback((draftType, pagePath, formData) => {
    setDrafts(prev => ({
      ...prev,
      [draftType]: {
        draft_type: draftType,
        page_path: pagePath,
        form_data: formData,
        timestamp: new Date().toISOString(),
        is_dirty: true
      }
    }));
    setIsDirty(true);
  }, []);

  // Clear a specific draft
  const clearDraft = useCallback((draftType) => {
    setDrafts(prev => {
      const newDrafts = { ...prev };
      delete newDrafts[draftType];
      return newDrafts;
    });
    
    // Check if any remaining drafts are dirty
    setIsDirty(prev => {
      const remainingDrafts = Object.values(drafts).filter(d => d.draft_type !== draftType);
      return remainingDrafts.some(d => d.is_dirty);
    });
  }, [drafts]);

  // Save all drafts to backend
  const saveDrafts = useCallback(async () => {
    if (!isDirty || Object.keys(drafts).length === 0) return;
    
    const draftsToSave = Object.values(drafts).filter(d => d.is_dirty);
    
    if (draftsToSave.length === 0) return;
    
    try {
      if (isAuthenticated && isAuthenticated()) {
        // Save to backend
        const response = await api.post('/api/drafts/save', {
          drafts: draftsToSave.map(d => ({
            ...d,
            user_id: user?.id
          }))
        });
        
        if (response.status === 200) {
          setLastSaved(new Date().toISOString());
          // Mark all as not dirty
          setDrafts(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(key => {
              updated[key] = { ...updated[key], is_dirty: false };
            });
            return updated;
          });
          setIsDirty(false);
          return true;
        }
      }
      
      // Fallback to localStorage
      localStorage.setItem('fiquant_drafts', JSON.stringify(draftsToSave));
      setLastSaved(new Date().toISOString());
      return true;
      
    } catch (error) {
      console.error('Failed to save drafts:', error);
      // Fallback to localStorage
      localStorage.setItem('fiquant_drafts', JSON.stringify(Object.values(drafts)));
      return false;
    }
  }, [drafts, isDirty, user, isAuthenticated]);

  // Debounced save (call after form changes)
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveDrafts();
    }, DEBOUNCE_DELAY);
  }, [saveDrafts]);

  // Load drafts on login
  const loadDrafts = useCallback(async () => {
    try {
      if (isAuthenticated && isAuthenticated()) {
        const response = await api.get('/api/drafts/user');
        
        if (response.status === 200 && response.data.drafts?.length > 0) {
          setPendingDrafts(response.data.drafts);
          setShowRecoveryModal(true);
          return response.data.drafts;
        }
      }
      
      // Check localStorage fallback
      const localDrafts = localStorage.getItem('fiquant_drafts');
      if (localDrafts) {
        const parsed = JSON.parse(localDrafts);
        if (parsed.length > 0) {
          setPendingDrafts(parsed);
          setShowRecoveryModal(true);
          return parsed;
        }
      }
      
      return [];
    } catch (error) {
      console.error('Failed to load drafts:', error);
      return [];
    }
  }, [isAuthenticated]);

  // Restore selected drafts
  const restoreDrafts = useCallback((selectedDrafts) => {
    const restored = {};
    selectedDrafts.forEach(draft => {
      restored[draft.draft_type] = draft;
    });
    setDrafts(restored);
    setShowRecoveryModal(false);
    setPendingDrafts([]);
    
    // Clear from localStorage
    localStorage.removeItem('fiquant_drafts');
    
    return restored;
  }, []);

  // Discard all pending drafts
  const discardDrafts = useCallback(async () => {
    try {
      if (isAuthenticated && isAuthenticated()) {
        await api.delete('/api/drafts/discard');
      }
    } catch (error) {
      console.error('Failed to discard drafts:', error);
    }
    
    localStorage.removeItem('fiquant_drafts');
    setPendingDrafts([]);
    setShowRecoveryModal(false);
  }, [isAuthenticated]);

  // Auto-save interval
  useEffect(() => {
    if (isAuthenticated && isAuthenticated()) {
      autoSaveIntervalRef.current = setInterval(() => {
        if (isDirty) {
          saveDrafts();
        }
      }, AUTO_SAVE_INTERVAL);
    }
    
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [isAuthenticated, isDirty, saveDrafts]);

  // Load drafts on auth change - use a flag to prevent cascading renders
  const hasLoadedDrafts = useRef(false);
  
  useEffect(() => {
    if (isAuthenticated && isAuthenticated() && user && !hasLoadedDrafts.current) {
      hasLoadedDrafts.current = true;
      // Use setTimeout to break out of the render cycle
      const timer = setTimeout(() => {
        loadDrafts();
      }, 100);
      return () => clearTimeout(timer);
    }
    
    // Reset when user logs out
    if (!isAuthenticated || !isAuthenticated()) {
      hasLoadedDrafts.current = false;
    }
  }, [isAuthenticated, user, loadDrafts]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        saveDrafts();
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saveDrafts]);

  const value = {
    // State
    drafts,
    isDirty,
    lastSaved,
    pendingDrafts,
    showRecoveryModal,
    
    // Actions
    registerDraft,
    clearDraft,
    saveDrafts,
    debouncedSave,
    loadDrafts,
    restoreDrafts,
    discardDrafts,
    setShowRecoveryModal,
    
    // Constants
    DRAFT_TYPES
  };

  return (
    <DraftContext.Provider value={value}>
      {children}
    </DraftContext.Provider>
  );
};

export const useDrafts = () => {
  const context = useContext(DraftContext);
  if (!context) {
    // Return null functions if not in provider (for components that check optionally)
    return null;
  }
  return context;
};

export default DraftContext;
