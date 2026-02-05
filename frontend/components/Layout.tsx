import { Navigation } from "./Navigation";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-transparent">
      <Navigation />
      <main className="relative z-10 w-full pt-24 sm:pt-28 pointer-events-auto">
        {children}
      </main>
    </div>
  );
}
