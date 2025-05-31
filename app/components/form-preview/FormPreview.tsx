import { useState } from 'react';
import { useFormStore, type FormData } from '~/utils/store';
import { FormField } from '../form-builder/FormFields';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface FormPreviewProps {
  formId?: string;
  isEmbedded?: boolean;
}

export default function FormPreview({ formId, isEmbedded = false }: FormPreviewProps) {
  const { forms, currentForm } = useFormStore();
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  
  // Determine which form to display
  const form = formId ? forms[formId] : currentForm;
  
  if (!form) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No form to preview</p>
      </div>
    );
  }
  
  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formValues);
    setSubmitted(true);
    
    // Reset after showing success message
    setTimeout(() => {
      setFormValues({});
      setSubmitted(false);
    }, 3000);
  };
  
  const getDeviceClass = () => {
    switch (device) {
      case 'desktop':
        return 'w-full';
      case 'tablet':
        return 'w-[768px]';
      case 'mobile':
        return 'w-[375px]';
      default:
        return 'w-full';
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      {!isEmbedded && (
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Form Preview</h2>
          <div className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 sm:p-2 rounded-md ${device === 'desktop' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}
              title="Desktop View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 sm:p-2 rounded-md ${device === 'tablet' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}
              title="Tablet View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 sm:p-2 rounded-md ${device === 'mobile' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}
              title="Mobile View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-auto p-3 sm:p-6 bg-gray-50 dark:bg-gray-900 flex justify-center">
        <div className={`bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md transition-all duration-300 ${getDeviceClass()} h-fit`}>
          {submitted ? (
            <div className="text-center py-6 sm:py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="mt-4 text-lg sm:text-xl font-medium text-gray-900 dark:text-white">Form Submitted Successfully!</h3>
              <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">Thank you for your submission.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="text-center mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{form.title}</h1>
                {form.description && (
                  <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">{form.description}</p>
                )}
              </div>
              
              {form.fields.map((field) => (
                <div key={field.id} className="mb-3 sm:mb-4">
                  <FormField
                    field={field}
                    isPreview={true}
                  />
                </div>
              ))}
              
              {form.fields.length > 0 && (
                <div className="pt-2 sm:pt-4">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Submit
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 