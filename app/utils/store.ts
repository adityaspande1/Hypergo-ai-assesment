import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export type FieldType = 
  | 'text'
  | 'textarea'
  | 'dropdown'
  | 'checkbox'
  | 'date'
  | 'number'
  | 'radio'
  | 'email';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  helpText?: string;
  options?: string[]; // For dropdown, checkbox, radio
  defaultValue?: string;
}

export interface FormData {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  createdAt: number;
  updatedAt: number;
}

interface FormStore {
  forms: Record<string, FormData>;
  currentForm: FormData | null;
  isHydrated: boolean;
  // Actions
  createForm: (title: string, description: string) => string;
  updateForm: (formId: string, updates: Partial<FormData>) => void;
  deleteForm: (formId: string) => void;
  setCurrentForm: (formId: string | null) => void;
  addField: (field: Omit<FormField, 'id'>) => void;
  updateField: (fieldId: string, updates: Partial<Omit<FormField, 'id'>>) => void;
  deleteField: (fieldId: string) => void;
  reorderFields: (newOrder: string[]) => void;
  setHydrated: () => void;
  // Data synchronization
  syncWithLocalStorage: () => void;
}

// Check if window is defined (browser) or not (server)
const isServer = typeof window === 'undefined';

// Create a no-op storage for SSR
const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

// Helper function to get initial state from localStorage
const getInitialState = (): { 
  forms: Record<string, FormData>; 
  currentForm: FormData | null; 
  isHydrated: boolean 
} => {
  if (isServer) {
    return { forms: {}, currentForm: null, isHydrated: false };
  }
  
  try {
    const storeData = localStorage.getItem('form-builder-store');
    if (storeData) {
      const parsed = JSON.parse(storeData);
      if (parsed.state) {
        console.log("Loaded initial state from localStorage:", Object.keys(parsed.state.forms || {}));
        return {
          forms: parsed.state.forms || {},
          currentForm: parsed.state.currentForm || null,
          isHydrated: true
        };
      }
    }
  } catch (e) {
    console.error("Error loading initial state from localStorage:", e);
  }
  
  return { forms: {}, currentForm: null, isHydrated: !isServer };
};

// Create the store with initial state from localStorage if available
export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      setHydrated: () => {
        set({ isHydrated: true });
        console.log("Store hydrated");
      },

      createForm: (title, description) => {
        const id = nanoid(10);
        const newForm: FormData = {
          id,
          title,
          description,
          fields: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set((state) => ({
          forms: { ...state.forms, [id]: newForm },
          currentForm: newForm,
        }));
        
        // Explicitly sync with localStorage to ensure immediate persistence
        if (!isServer) {
          try {
            const storeData = localStorage.getItem('form-builder-store');
            let parsed = { state: { forms: {}, currentForm: null, isHydrated: true }, version: 0 };
            
            if (storeData) {
              parsed = JSON.parse(storeData);
            }
            
            const newState = {
              ...(parsed.state || {}),
              forms: { ...((parsed.state as any)?.forms || {}), [id]: newForm },
              currentForm: newForm,
              isHydrated: true
            };
            
            parsed.state = newState as any;
            
            localStorage.setItem('form-builder-store', JSON.stringify(parsed));
            console.log("Form saved to localStorage:", id);
          } catch (e) {
            console.error("Error saving form to localStorage:", e);
          }
        }
        
        return id;
      },

      updateForm: (formId, updates) => {
        set((state) => {
          if (!state.forms[formId]) return state;

          const updatedForm = {
            ...state.forms[formId],
            ...updates,
            updatedAt: Date.now(),
          };

          const newState = {
            forms: { ...state.forms, [formId]: updatedForm },
            currentForm: state.currentForm?.id === formId ? updatedForm : state.currentForm,
          };
          
          return newState;
        });
      },

      deleteForm: (formId) => {
        set((state) => {
          const { [formId]: _, ...restForms } = state.forms;
          return {
            forms: restForms,
            currentForm: state.currentForm?.id === formId ? null : state.currentForm,
          };
        });
      },

      setCurrentForm: (formId) => {
        const form = formId ? get().forms[formId] : null;
        set({ currentForm: form });
        console.log("Current form set to:", formId, "Form exists:", !!form);
      },

      addField: (field) => {
        set((state) => {
          if (!state.currentForm) return state;
          
          const fieldId = nanoid(8);
          const newField: FormField = {
            id: fieldId,
            ...field,
          };
          
          const updatedForm = {
            ...state.currentForm,
            fields: [...state.currentForm.fields, newField],
            updatedAt: Date.now(),
          };
          
          return {
            currentForm: updatedForm,
            forms: { ...state.forms, [updatedForm.id]: updatedForm },
          };
        });
      },

      updateField: (fieldId, updates) => {
        set((state) => {
          if (!state.currentForm) return state;
          
          const updatedFields = state.currentForm.fields.map((field) =>
            field.id === fieldId ? { ...field, ...updates } : field
          );
          
          const updatedForm = {
            ...state.currentForm,
            fields: updatedFields,
            updatedAt: Date.now(),
          };
          
          const newState = {
            currentForm: updatedForm,
            forms: { ...state.forms, [updatedForm.id]: updatedForm },
          };
          
          // Directly update localStorage
          if (!isServer) {
            try {
              console.log('Directly updating localStorage for field update:', fieldId);
              const storeData = localStorage.getItem('form-builder-store');
              if (storeData) {
                const parsed = JSON.parse(storeData);
                parsed.state = {
                  ...parsed.state,
                  ...newState
                };
                localStorage.setItem('form-builder-store', JSON.stringify(parsed));
              }
            } catch (e) {
              console.error('Error updating localStorage:', e);
            }
          }
          
          return newState;
        });
      },

      deleteField: (fieldId) => {
        set((state) => {
          if (!state.currentForm) return state;
          
          console.log('Deleting field from state:', fieldId);
          
          const updatedFields = state.currentForm.fields.filter(
            (field) => field.id !== fieldId
          );
          
          const updatedForm = {
            ...state.currentForm,
            fields: updatedFields,
            updatedAt: Date.now(),
          };
          
          const newState = {
            currentForm: updatedForm,
            forms: { ...state.forms, [updatedForm.id]: updatedForm },
          };
          
          // Directly update localStorage
          if (!isServer) {
            try {
              console.log('Directly updating localStorage for field deletion:', fieldId);
              const storeData = localStorage.getItem('form-builder-store');
              if (storeData) {
                const parsed = JSON.parse(storeData);
                parsed.state = {
                  ...parsed.state,
                  ...newState
                };
                localStorage.setItem('form-builder-store', JSON.stringify(parsed));
              }
            } catch (e) {
              console.error('Error updating localStorage:', e);
            }
          }
          
          return newState;
        });
      },

      reorderFields: (newOrder) => {
        set((state) => {
          if (!state.currentForm) return state;
          
          // Create a map of fields by ID for faster lookup
          const fieldsMap = Object.fromEntries(
            state.currentForm.fields.map((field) => [field.id, field])
          );
          
          // Create a new array of fields in the new order
          const reorderedFields = newOrder
            .map((id) => fieldsMap[id])
            .filter(Boolean) as FormField[];
          
          const updatedForm = {
            ...state.currentForm,
            fields: reorderedFields,
            updatedAt: Date.now(),
          };
          
          return {
            currentForm: updatedForm,
            forms: { ...state.forms, [updatedForm.id]: updatedForm },
          };
        });
      },
      
      syncWithLocalStorage: () => {
        if (isServer) return;
        
        try {
          const { forms, currentForm } = get();
          const storeData = localStorage.getItem('form-builder-store');
          let parsed = { state: {}, version: 0 };
          
          if (storeData) {
            parsed = JSON.parse(storeData);
          }
          
          parsed.state = {
            ...parsed.state,
            forms,
            currentForm,
            isHydrated: true
          };
          
          localStorage.setItem('form-builder-store', JSON.stringify(parsed));
          console.log("Store synchronized with localStorage");
        } catch (e) {
          console.error("Error synchronizing with localStorage:", e);
        }
      }
    }),
    {
      name: 'form-builder-store',
      storage: isServer 
        ? createJSONStorage(() => noopStorage)
        : createJSONStorage(() => localStorage),
      skipHydration: true, // We'll handle hydration manually
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated();
        }
      },
    }
  )
); 