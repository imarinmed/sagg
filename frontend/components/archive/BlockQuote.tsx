import React from 'react';

interface BlockQuoteProps {
  children: React.ReactNode;
  attribution?: string;
  source?: string;
  className?: string;
}

export const BlockQuote = ({
  children,
  attribution,
  source,
  className = '',
}: BlockQuoteProps) => {
  return (
    <figure className={`my-8 pl-6 border-l-2 border-[var(--color-section-accent)] ${className}`}>
      <blockquote className="font-heading text-xl italic leading-relaxed text-[var(--color-text-primary)] opacity-90">
        {children}
      </blockquote>
      {(attribution || source) && (
        <figcaption className="mt-4 flex items-center gap-2 text-sm font-mono text-[var(--color-text-muted)]">
          {attribution && <span className="font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{attribution}</span>}
          {attribution && source && <span className="opacity-50 mx-1">{'//'}</span>}
          {source && <cite className="not-italic opacity-80">{source}</cite>}
        </figcaption>
      )}
    </figure>
  );
};
