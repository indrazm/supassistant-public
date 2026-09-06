import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: () => (
    <main>
      <h1>About</h1>
      <p>Platform boilerplate: React + Vite + TanStack Router + TanStack Query.</p>
    </main>
  ),
});
