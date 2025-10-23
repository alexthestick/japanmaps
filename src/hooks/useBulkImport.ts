import { useReducer, useCallback } from 'react';
import type { BulkImportState, BulkImportAction, BulkImportQueueItem } from '../types/bulkImport';

/**
 * Initial state
 */
const initialState: BulkImportState = {
  items: [],
  currentIndex: 0,
  isProcessing: false,
  isPaused: false,
  stats: {
    total: 0,
    pending: 0,
    completed: 0,
    skipped: 0,
    failed: 0,
    duplicates: 0,
  },
};

/**
 * Calculate statistics from items
 */
function calculateStats(items: BulkImportQueueItem[]) {
  return {
    total: items.length,
    pending: items.filter(i => i.status === 'pending' || i.status === 'searching' || i.status === 'enhancing' || i.status === 'ready').length,
    completed: items.filter(i => i.status === 'completed').length,
    skipped: items.filter(i => i.status === 'skipped').length,
    failed: items.filter(i => i.status === 'failed').length,
    duplicates: items.filter(i => i.status === 'duplicate').length,
  };
}

/**
 * Reducer for bulk import state management
 */
function bulkImportReducer(state: BulkImportState, action: BulkImportAction): BulkImportState {
  switch (action.type) {
    case 'LOAD_CSV': {
      const newState = {
        ...state,
        items: action.payload.items,
        currentIndex: 0,
        uploadedFileName: action.payload.fileName,
        uploadedAt: new Date(),
        stats: calculateStats(action.payload.items),
      };

      // Save to localStorage
      saveToLocalStorage(newState);
      return newState;
    }

    case 'START_PROCESSING': {
      const newState = {
        ...state,
        isProcessing: true,
        isPaused: false,
        startedAt: state.startedAt || new Date(),
      };
      saveToLocalStorage(newState);
      return newState;
    }

    case 'PAUSE_PROCESSING': {
      const newState = {
        ...state,
        isProcessing: false,
        isPaused: true,
      };
      saveToLocalStorage(newState);
      return newState;
    }

    case 'RESUME_PROCESSING': {
      const newState = {
        ...state,
        isProcessing: true,
        isPaused: false,
      };
      saveToLocalStorage(newState);
      return newState;
    }

    case 'UPDATE_ITEM': {
      const { index, updates } = action.payload;
      const newItems = [...state.items];
      newItems[index] = { ...newItems[index], ...updates };

      const newState = {
        ...state,
        items: newItems,
        stats: calculateStats(newItems),
      };
      saveToLocalStorage(newState);
      return newState;
    }

    case 'APPROVE_ITEM': {
      const { index, mainCategory, subCategories, customDescription } = action.payload;
      const newItems = [...state.items];
      newItems[index] = {
        ...newItems[index],
        status: 'approved',
        mainCategory,
        subCategories,
        customDescription,
      };

      const newState = {
        ...state,
        items: newItems,
        stats: calculateStats(newItems),
      };
      saveToLocalStorage(newState);
      return newState;
    }

    case 'SKIP_ITEM': {
      const { index } = action.payload;
      const newItems = [...state.items];
      newItems[index] = {
        ...newItems[index],
        status: 'skipped',
      };

      // Find next pending item
      let nextIndex = index + 1;
      while (nextIndex < newItems.length) {
        const item = newItems[nextIndex];
        if (item.status === 'pending' || item.status === 'ready') {
          break;
        }
        nextIndex++;
      }

      const newState = {
        ...state,
        items: newItems,
        currentIndex: nextIndex,
        stats: calculateStats(newItems),
        isProcessing: nextIndex < newItems.length, // Stop if at end
      };
      saveToLocalStorage(newState);
      return newState;
    }

    case 'MARK_FAILED': {
      const { index, error } = action.payload;
      const newItems = [...state.items];
      newItems[index] = {
        ...newItems[index],
        status: 'failed',
        error,
      };

      const newState = {
        ...state,
        items: newItems,
        stats: calculateStats(newItems),
      };
      saveToLocalStorage(newState);
      return newState;
    }

    case 'MOVE_TO_NEXT': {
      // Find next pending item
      let nextIndex = state.currentIndex + 1;
      while (nextIndex < state.items.length) {
        const item = state.items[nextIndex];
        if (item.status === 'pending' || item.status === 'ready') {
          break;
        }
        nextIndex++;
      }

      // If we've reached the end, mark as complete
      const isComplete = nextIndex >= state.items.length;

      const newState = {
        ...state,
        currentIndex: nextIndex,
        isProcessing: !isComplete,
        completedAt: isComplete ? new Date() : state.completedAt,
      };
      saveToLocalStorage(newState);
      return newState;
    }

    case 'RESET': {
      clearLocalStorage();
      return initialState;
    }

    default:
      return state;
  }
}

/**
 * LocalStorage keys
 */
const STORAGE_KEY = 'bulk-import-state';

/**
 * Save state to localStorage
 */
function saveToLocalStorage(state: BulkImportState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

/**
 * Load state from localStorage
 */
function loadFromLocalStorage(): BulkImportState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    // Convert date strings back to Date objects
    if (parsed.uploadedAt) parsed.uploadedAt = new Date(parsed.uploadedAt);
    if (parsed.startedAt) parsed.startedAt = new Date(parsed.startedAt);
    if (parsed.completedAt) parsed.completedAt = new Date(parsed.completedAt);

    return parsed;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * Clear localStorage
 */
function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

/**
 * Hook for managing bulk import state
 */
export function useBulkImport() {
  // Try to load saved state on mount
  const savedState = loadFromLocalStorage();
  const [state, dispatch] = useReducer(bulkImportReducer, savedState || initialState);

  // Helper functions
  const loadCsv = useCallback((items: BulkImportQueueItem[], fileName: string) => {
    dispatch({ type: 'LOAD_CSV', payload: { items, fileName } });
  }, []);

  const startProcessing = useCallback(() => {
    dispatch({ type: 'START_PROCESSING' });
  }, []);

  const pauseProcessing = useCallback(() => {
    dispatch({ type: 'PAUSE_PROCESSING' });
  }, []);

  const resumeProcessing = useCallback(() => {
    dispatch({ type: 'RESUME_PROCESSING' });
  }, []);

  const updateItem = useCallback((index: number, updates: Partial<BulkImportQueueItem>) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { index, updates } });
  }, []);

  const approveItem = useCallback((
    index: number,
    mainCategory: any,
    subCategories: any[],
    customDescription?: string
  ) => {
    dispatch({ type: 'APPROVE_ITEM', payload: { index, mainCategory, subCategories, customDescription } });
  }, []);

  const skipItem = useCallback((index: number) => {
    dispatch({ type: 'SKIP_ITEM', payload: { index } });
  }, []);

  const markFailed = useCallback((index: number, error: string) => {
    dispatch({ type: 'MARK_FAILED', payload: { index, error } });
  }, []);

  const moveToNext = useCallback(() => {
    dispatch({ type: 'MOVE_TO_NEXT' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Get current item
  const currentItem = state.items[state.currentIndex] || null;

  // Progress percentage
  const progress = state.stats.total > 0
    ? Math.round(((state.stats.completed + state.stats.skipped + state.stats.failed + state.stats.duplicates) / state.stats.total) * 100)
    : 0;

  return {
    state,
    currentItem,
    progress,
    actions: {
      loadCsv,
      startProcessing,
      pauseProcessing,
      resumeProcessing,
      updateItem,
      approveItem,
      skipItem,
      markFailed,
      moveToNext,
      reset,
    },
  };
}
