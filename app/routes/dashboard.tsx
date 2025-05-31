import FormList from "~/components/dashboard/FormList";
import ThemeToggle from "~/components/common/ThemeToggle";

export default function DashboardIndex() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Form Builder Dashboard</h1>
          <ThemeToggle />
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <FormList />
        </div>
      </main>
    </div>
  );
} 