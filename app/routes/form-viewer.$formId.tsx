import { useParams } from "@remix-run/react";
import FormPreview from "~/components/form-preview/FormPreview";
import ThemeToggle from "~/components/common/ThemeToggle";

export default function FormViewerPage() {
  const { formId } = useParams();

  if (!formId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Form Not Found</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">The form you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <FormPreview formId={formId} isEmbedded={true} />
      </div>
    </div>
  );
} 