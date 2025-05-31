import { useState, useEffect } from 'react';
import type { FieldType, FormField } from '~/utils/store';

interface FieldEditorProps {
  field: FormField | null;
  onSave: (field: Omit<FormField, 'id'>) => void;
  onCancel: () => void;
}

export default function FieldEditor({ field, onSave, onCancel }: FieldEditorProps) {
  const [type, setType] = useState<FieldType>(field?.type || 'text');
  const [label, setLabel] = useState(field?.label || '');
  const [placeholder, setPlaceholder] = useState(field?.placeholder || '');
  const [required, setRequired] = useState(field?.required || false);
  const [helpText, setHelpText] = useState(field?.helpText || '');
  const [optionsText, setOptionsText] = useState(field?.options?.join('\n') || '');
  const [defaultValue, setDefaultValue] = useState(field?.defaultValue || '');

  // Reset form when field changes
  useEffect(() => {
    if (field) {
      console.log('FieldEditor: Field provided for editing:', field.id, field.label);
      setType(field.type);
      setLabel(field.label);
      setPlaceholder(field.placeholder || '');
      setRequired(field.required);
      setHelpText(field.helpText || '');
      setOptionsText(field.options?.join('\n') || '');
      setDefaultValue(field.defaultValue || '');
    } else {
      console.log('FieldEditor: Creating new field');
      // Default values for a new field
      setType('text');
      setLabel('');
      setPlaceholder('');
      setRequired(false);
      setHelpText('');
      setOptionsText('');
      setDefaultValue('');
    }
  }, [field]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const options = type === 'dropdown' || type === 'checkbox' || type === 'radio' 
      ? optionsText.split('\n').filter(option => option.trim().length > 0)
      : undefined;
    
    const fieldData = {
      type,
      label,
      placeholder: placeholder || undefined,
      required,
      helpText: helpText || undefined,
      options,
      defaultValue: defaultValue || undefined,
    };
    
    console.log('FieldEditor: Saving field data:', fieldData);
    onSave(fieldData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{field ? 'Edit' : 'Add'} Field</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="field-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Field Type
          </label>
          <select
            id="field-type"
            value={type}
            onChange={(e) => setType(e.target.value as FieldType)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="text">Text</option>
            <option value="textarea">Textarea</option>
            <option value="dropdown">Dropdown</option>
            <option value="checkbox">Checkbox</option>
            <option value="radio">Radio</option>
            <option value="date">Date</option>
            <option value="number">Number</option>
            <option value="email">Email</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="field-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Label
          </label>
          <input
            id="field-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>
        
        <div>
          <label htmlFor="field-placeholder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Placeholder
          </label>
          <input
            id="field-placeholder"
            type="text"
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div>
          <label htmlFor="field-help-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Help Text
          </label>
          <input
            id="field-help-text"
            type="text"
            value={helpText}
            onChange={(e) => setHelpText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div>
          <label htmlFor="field-default-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Default Value
          </label>
          <input
            id="field-default-value"
            type="text"
            value={defaultValue}
            onChange={(e) => setDefaultValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        {(type === 'dropdown' || type === 'checkbox' || type === 'radio') && (
          <div>
            <label htmlFor="field-options" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Options (one per line)
            </label>
            <textarea
              id="field-options"
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
        )}
        
        <div className="flex items-center">
          <input
            id="field-required"
            type="checkbox"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="field-required" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Required
          </label>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
