/// <reference types="@remix-run/dev" />
/// <reference types="vite/client" />

// This tells TypeScript that our route files may export these
// necessary Remix objects.
declare module "*.tsx" {
  export let loader: unknown;
  export let action: unknown;
  export let meta: unknown;
  export let links: unknown;
  export let handle: unknown;
  export default function Component(): JSX.Element;
} 