import { Navigation } from "./Navigation";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <Navigation />
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
