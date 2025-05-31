import { useState, useEffect } from 'react';
import { useParams } from '@remix-run/react';
import { useFormStore, type FormField } from '~/utils/store';
import { DraggableFormField } from './FormFields';
import FieldEditor from './FieldEditor';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  field: FormField;
  onEdit: (field: FormField) => void;
  onDelete: (fieldId: string) => void;
}

function SortableItem({ id, field, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="sortable-item relative">
      {/* Drag handle - only apply drag attributes to this element */}
      <div {...attributes} {...listeners} className="cursor-move absolute left-0 top-0 bottom-0 flex items-center px-2 text-gray-400 dark:text-gray-500 z-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
      
      {/* Form field content - without drag attributes */}
      <div className="pl-8">
        <DraggableFormField 
          field={field} 
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

export default function FormBuilder() {
  const { formId } = useParams();
  const { 
    forms,
    currentForm, 
    addField, 
    updateField, 
    deleteField, 
    reorderFields, 
    updateForm,
    setCurrentForm
  } = useFormStore();
  
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Try to get the form data directly from the store or localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && formId) {
      console.log("FormBuilder: Checking for form", formId);
      
      // First, check if we already have the form in the store
      if (currentForm?.id === formId) {
        console.log("Form is already set as current form");
        setFormTitle(currentForm.title);
        setFormDescription(currentForm.description);
        setIsLoading(false);
        return;
      }
      
      // If form exists in the forms object but is not current, set it
      if (forms[formId]) {
        console.log("Form found in forms object, setting as current");
        setCurrentForm(formId);
        setFormTitle(forms[formId].title);
        setFormDescription(forms[formId].description);
        setIsLoading(false);
        return;
      }
      
      // Try to get from localStorage as a last resort
      try {
        const storeData = localStorage.getItem('form-builder-store');
        if (storeData) {
          const data = JSON.parse(storeData);
          if (data.state?.forms && data.state.forms[formId]) {
            console.log("Form found in localStorage, setting data");
            const formData = data.state.forms[formId];
            setFormTitle(formData.title);
            setFormDescription(formData.description);
            setCurrentForm(formId);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error("Error loading from localStorage:", e);
      }
      
      console.log("Form not found anywhere");
      setIsLoading(false);
    }
  }, [formId, currentForm, forms, setCurrentForm]);

  // Load form data when currentForm changes
  useEffect(() => {
    if (currentForm) {
      setFormTitle(currentForm.title);
      setFormDescription(currentForm.description);
      setIsLoading(false);
    }
  }, [currentForm]);

  // Auto-save form title and description
  useEffect(() => {
    if (!formId || !formTitle) return;
    
    const timer = setTimeout(() => {
      if (currentForm && (formTitle !== currentForm.title || formDescription !== currentForm.description)) {
        updateForm(currentForm.id, { title: formTitle, description: formDescription });
      } else if (formId && !currentForm) {
        // If we don't have a current form but we have a formId, try to update directly
        updateForm(formId, { title: formTitle, description: formDescription });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formTitle, formDescription, currentForm, updateForm, formId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading form builder...</p>
        </div>
      </div>
    );
  }

  // If we don't have a form after loading, show a message
  if (!currentForm && !formId) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">No form selected</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Please create or select a form to start building</p>
        </div>
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!currentForm || !over) return;
    
    if (active.id !== over.id) {
      const oldIndex = currentForm.fields.findIndex(field => field.id === active.id);
      const newIndex = currentForm.fields.findIndex(field => field.id === over.id);
      
      const newOrder = arrayMove(
        currentForm.fields.map(field => field.id),
        oldIndex,
        newIndex
      );
      
      reorderFields(newOrder);
    }
  };

  const handleEditField = (field: FormField) => {
    console.log('Edit field triggered for:', field.id, field.label);
    setEditingField(field);
    setShowFieldEditor(true);
  };

  const handleDeleteField = (fieldId: string) => {
    console.log('Delete field triggered for:', fieldId);
    deleteField(fieldId);
  };

  const handleAddField = () => {
    setEditingField(null);
    setShowFieldEditor(true);
  };

  const handleSaveField = (fieldData: Omit<FormField, 'id'>) => {
    if (editingField) {
      updateField(editingField.id, fieldData);
    } else {
      addField(fieldData);
    }
    setShowFieldEditor(false);
  };

  // Use the fields from currentForm if available, otherwise show empty state
  const fields = currentForm?.fields || [];

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 border-b dark:border-gray-700">
        <input
          type="text"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          placeholder="Form Title"
          className="text-xl sm:text-2xl font-bold w-full border-none focus:outline-none focus:ring-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <textarea
          value={formDescription}
          onChange={(e) => setFormDescription(e.target.value)}
          placeholder="Form Description"
          rows={2}
          className="mt-2 w-full resize-none border-none focus:outline-none focus:ring-0 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
        />
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Form Builder Panel */}
        <div className="w-full md:w-2/3 p-4 sm:p-6 overflow-y-auto bg-white dark:bg-gray-800 border-b md:border-b-0 md:border-r dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Form Fields</h2>
            <button
              onClick={handleAddField}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Field
            </button>
          </div>

          {fields.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 mb-4">No fields added yet</p>
              <button
                onClick={handleAddField}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add Your First Field
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map(field => field.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {fields.map((field) => (
                    <SortableItem
                      key={field.id}
                      id={field.id}
                      field={field}
                      onEdit={handleEditField}
                      onDelete={handleDeleteField}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Field Editor Sidebar */}
        <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 overflow-y-auto">
          {showFieldEditor ? (
            <FieldEditor
              field={editingField}
              onSave={handleSaveField}
              onCancel={() => setShowFieldEditor(false)}
            />
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Field Properties</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Select a field to edit its properties or add a new field.</p>
              <button
                onClick={handleAddField}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add Field
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 