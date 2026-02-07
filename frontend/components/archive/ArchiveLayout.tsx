import React from 'react';

interface ArchiveLayoutProps {
  leftSidebar?: React.ReactNode;
  mainContent: React.ReactNode;
  rightSidebar?: React.ReactNode;
  className?: string;
}

export const ArchiveLayout = ({
  leftSidebar,
  mainContent,
  rightSidebar,
  className = '',
}: ArchiveLayoutProps) => {
  return (
    <div className={`min-h-screen w-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] ${className}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {leftSidebar && (
            <aside className="hidden lg:col-span-2 lg:block xl:col-span-2">
              <div className="sticky top-24 space-y-8">
                {leftSidebar}
              </div>
            </aside>
          )}

          <main className={`col-span-1 ${leftSidebar && rightSidebar ? 'lg:col-span-7 xl:col-span-7' : 'lg:col-span-10'}`}>
            {mainContent}
          </main>

          {rightSidebar && (
            <aside className="hidden lg:col-span-3 lg:block xl:col-span-3">
              <div className="sticky top-24 space-y-6">
                {rightSidebar}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};
