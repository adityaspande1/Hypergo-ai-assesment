import { redirect } from "@remix-run/node";

// This ensures the route only matches the exact path /form-builder
export const handle = { index: true };

// Redirect to dashboard when someone tries to access /form-builder directly
export function loader() {
  return redirect("/dashboard");
}

export default function FormBuilderIndex() {
  return <div>Redirecting to dashboard...</div>;
} 