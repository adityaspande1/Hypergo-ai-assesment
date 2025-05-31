import { useState } from 'react';
import type { FormField as FormFieldType } from '~/utils/store';

interface FormFieldProps {
  field: FormFieldType;
  isPreview?: boolean;
  onEdit?: (field: FormFieldType) => void;
  onDelete?: (fieldId: string) => void;
}

export function FormField({ field, isPreview = false, onEdit, onDelete }: FormFieldProps) {
  const [value, setValue] = useState(field.defaultValue || '');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValue(e.target.value);
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.type}
            id={field.id}
            name={field.id}
            placeholder={field.placeholder}
            value={value}
            onChange={handleChange}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        );
      
      case 'textarea':
        return (
          <textarea
            id={field.id}
            name={field.id}
            placeholder={field.placeholder}
            value={value}
            onChange={handleChange}
            required={field.required}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        );
      
      case 'dropdown':
        return (
          <select
            id={field.id}
            name={field.id}
            value={value}
            onChange={handleChange}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`${field.id}-${option}`}
                  name={field.id}
                  value={option}
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor={`${field.id}-${option}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.id}-${option}`}
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                />
                <label htmlFor={`${field.id}-${option}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'date':
        return (
          <input
            type="date"
            id={field.id}
            name={field.id}
            value={value}
            onChange={handleChange}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        );
      
      default:
        return <div>Unsupported field type</div>;
    }
  };

  return (
    <div className={`mb-4 p-4 ${isPreview ? '' : 'border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {field.label} {field.required && <span className="text-red-500 dark:text-red-400">*</span>}
          </label>
          {field.helpText && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{field.helpText}</p>
          )}
        </div>
        
        {!isPreview && (
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Edit button direct click');
                if (onEdit) onEdit(field);
              }}
              className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Delete button direct click');
                if (onDelete) onDelete(field.id);
              }}
              className="px-3 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      
      {renderField()}
    </div>
  );
}

export function DraggableFormField({ field, isPreview = false, onEdit, onDelete }: FormFieldProps) {
  return (
    <div className="relative">
      <div className="cursor-move absolute left-0 top-0 bottom-0 flex items-center px-2 text-gray-400 dark:text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
      <div className="pl-8">
        <FormField 
          field={field} 
          isPreview={isPreview} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      </div>
    </div>
  );
} 