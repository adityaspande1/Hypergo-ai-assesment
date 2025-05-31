import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "@remix-run/react";
import FormBuilder from "~/components/form-builder/FormBuilder";
import FormPreview from "~/components/form-preview/FormPreview";
import { useFormStore, FormData } from "~/utils/store";
import { nanoid } from "nanoid";
import ThemeToggle from "~/components/common/ThemeToggle";

// This helps Remix understand that this route has higher priority for parameter paths
export const handle = { id: true };

export default function FormBuilderPage() {
  const { formId } = useParams();
  const { forms, setCurrentForm } = useFormStore();
  const [activeTab, setActiveTab] = useState<'builder' | 'preview'>('builder');
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formNotFound, setFormNotFound] = useState(false);
  const navigate = useNavigate();

  // Force load form data
  useEffect(() => {
    if (typeof window === 'undefined' || !formId) return;

    console.log("FormBuilderPage: Loading form", formId);
    console.log("Available forms:", Object.keys(forms));

    // Function to create a dummy form if needed
    const createDummyForm = () => {
      console.log("Creating dummy form with ID:", formId);
      const newForm: FormData = {
        id: formId,
        title: "Untitled Form",
        description: "",
        fields: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return newForm;
    };

    // Try different ways to get the form
    const loadForm = () => {
      // If form exists in store, use it
      if (forms[formId]) {
        console.log("Form found in store, setting as current");
        setCurrentForm(formId);
        setLoading(false);
        return true;
      }

      // Check localStorage directly
      try {
        const storeData = localStorage.getItem('form-builder-store');
        if (storeData) {
          const data = JSON.parse(storeData);
          
          // If form exists in localStorage
          if (data.state?.forms && data.state.forms[formId]) {
            console.log("Form found in localStorage");
            
            // Force update the current form in localStorage
            const updatedData = {
              ...data,
              state: {
                ...data.state,
                currentForm: data.state.forms[formId],
                isHydrated: true
              }
            };
            
            localStorage.setItem('form-builder-store', JSON.stringify(updatedData));
            console.log("Updated localStorage with current form");
            
            // Force a page reload to apply the localStorage changes
            window.location.reload();
            return true;
          }
          
          // If form doesn't exist anywhere, create it in localStorage
          console.log("Form not found, creating dummy form");
          const dummyForm = createDummyForm();
          
          // Create or update the forms object in localStorage
          const formsData = data.state?.forms || {};
          const updatedData = {
            ...data,
            state: {
              ...data.state,
              forms: {
                ...formsData,
                [formId]: dummyForm
              },
              currentForm: dummyForm,
              isHydrated: true
            }
          };
          
          localStorage.setItem('form-builder-store', JSON.stringify(updatedData));
          console.log("Created dummy form in localStorage");
          
          // Force reload to apply changes
          window.location.reload();
          return true;
        } else {
          // No store data exists, create new store data
          console.log("No store data exists, creating new store with dummy form");
          const dummyForm = createDummyForm();
          
          const newStoreData = {
            state: {
              forms: {
                [formId]: dummyForm
              },
              currentForm: dummyForm,
              isHydrated: true
            },
            version: 0
          };
          
          localStorage.setItem('form-builder-store', JSON.stringify(newStoreData));
          console.log("Created new store data with dummy form");
          
          // Force reload to apply changes
          window.location.reload();
          return true;
        }
      } catch (e) {
        console.error("Error handling localStorage:", e);
        setFormNotFound(true);
        setLoading(false);
        return false;
      }
    };

    // Try to load the form
    if (!loadForm()) {
      // If all attempts fail, set form not found
      setFormNotFound(true);
      setLoading(false);
    }
  }, [formId, forms, setCurrentForm]);

  const handleShowShareModal = () => {
    const baseUrl = window.location.origin;
    setShareUrl(`${baseUrl}/form-viewer/${formId}`);
    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 mb-2">Loading form...</p>
        </div>
      </div>
    );
  }

  if (formNotFound) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Form not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The form you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={handleGoToDashboard}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <h1 className="ml-4 text-xl font-semibold text-gray-900 dark:text-white">Form Builder</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('builder')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'builder'
                      ? 'border-blue-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Builder
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'preview'
                      ? 'border-blue-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={handleShowShareModal}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        {activeTab === 'builder' ? (
          <FormBuilder />
        ) : (
          <FormPreview />
        )}
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Share Form</h2>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
              Anyone with this link can view and submit the form:
            </p>
            <div className="flex items-center mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Copy
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 